import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Logger,
  Post,
  Put,
  Query,
  Res,
} from '@nestjs/common';
import { ApiExcludeEndpoint, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { Response } from 'express';

import {
  type EnphaseBackfillRequest,
  enphaseBackfillRequestSchema,
  type EnphaseBackfillResult,
  enphaseBackfillResultSchema,
  type EnphaseLinkResult,
  enphaseLinkResultSchema,
  type EnphaseSyncRequest,
  enphaseSyncRequestSchema,
  type EnphaseSyncResult,
  enphaseSyncResultSchema,
  type LifetimeDay,
  lifetimeDaySchema,
  type SyncSchedule,
  syncScheduleSchema,
  type SyncStatus,
  syncStatusSchema,
} from '@repo/contracts';
import { Public } from '../../common/auth/public.decorator.js';
import {
  ResponseListSchema,
  ResponseSchema,
} from '../../common/serialization/response-schema.decorator.js';

import { EnphaseMapper } from './enphase.mapper.js';
import { EnphaseService } from './enphase.service.js';
import { EnphaseApiService } from './enphase-api.service.js';
import { EnphaseAuthService } from './enphase-auth.service.js';
import { EnphaseSyncService } from './enphase-sync.service.js';

@ApiTags('Enphase')
@Controller('enphase')
export class EnphaseController {
  private readonly _logger = new Logger(EnphaseController.name);

  constructor(
    private readonly _enphaseAuthService: EnphaseAuthService,
    private readonly _enphaseApiService: EnphaseApiService,
    private readonly _enphaseSyncService: EnphaseSyncService,
    private readonly _enphaseService: EnphaseService,
    private readonly _enphaseMapper: EnphaseMapper,
  ) {}

  // Browser navigations of the OAuth2 flow, not API calls: kept out of the generated client.
  @Public()
  @Get('authorize')
  @ApiExcludeEndpoint()
  authorize(@Res() res: Response): void {
    const url = this._enphaseAuthService.getAuthorizationUrl();
    this._logger.log('Redirecting to Enphase authorization page');
    res.redirect(url);
  }

  @Public()
  @Get('callback')
  @ApiExcludeEndpoint()
  @ResponseSchema(enphaseLinkResultSchema)
  async callback(
    @Query('code') code: string,
    @Query('state') state: string,
  ): Promise<EnphaseLinkResult> {
    this._enphaseAuthService.validateState(state);

    if (!code) {
      throw new BadRequestException('Missing authorization code');
    }

    this._logger.log('Received Enphase authorization callback');

    const tokens = await this._enphaseAuthService.exchangeCodeForTokens(code);
    const systemsResponse = await this._enphaseApiService.getSystems(tokens.accessToken);
    const systems = systemsResponse.systems ?? [];
    const [system] = systems;

    if (!system) {
      return { message: 'No systems found on this Enphase account', systems: [] };
    }

    await this._enphaseAuthService.storeTokens(system.system_id, tokens);
    this._logger.log(`Linked Enphase system: ${system.name} (ID: ${system.system_id})`);

    return {
      message: 'Enphase account linked successfully',
      systems: this._enphaseMapper.toSystemList(systems),
    };
  }

  @Get('all')
  @ApiOperation({ summary: 'Expose all lifetime data' })
  @ResponseListSchema(lifetimeDaySchema)
  async getAll(): Promise<LifetimeDay[]> {
    return this._enphaseService.getAllLifetimeData();
  }

  @Get('sync-status')
  @ApiOperation({ summary: 'Get sync status for all systems' })
  @ResponseListSchema(syncStatusSchema)
  async getSyncStatus(): Promise<SyncStatus[]> {
    return this._enphaseService.getSyncStatus();
  }

  @Post('sync')
  @ApiOperation({ summary: 'Trigger manual sync for a system' })
  @ResponseSchema(enphaseSyncResultSchema)
  async triggerSync(
    @Body({ schema: enphaseSyncRequestSchema }) dto: EnphaseSyncRequest,
  ): Promise<EnphaseSyncResult> {
    await this._enphaseSyncService.syncLifetimeData(dto.systemId);
    return { message: `Sync completed for system ${dto.systemId}` };
  }

  @Post('backfill')
  @Throttle({ default: { limit: 3, ttl: 60 * 60 * 1000 } })
  @ApiOperation({ summary: 'Backfill historical production data' })
  @ResponseSchema(enphaseBackfillResultSchema)
  @ApiResponse({
    status: 429,
    description: 'Too many backfill requests — Enphase quota is monthly',
  })
  async backfill(
    @Body({ schema: enphaseBackfillRequestSchema }) dto: EnphaseBackfillRequest,
  ): Promise<EnphaseBackfillResult> {
    const count = await this._enphaseSyncService.backfillLifetimeData(
      dto.systemId,
      dto.startDate,
      dto.endDate,
    );
    return { message: 'Backfill completed', daysBackfilled: count };
  }

  @Get('sync-schedule')
  @ApiOperation({ summary: 'Get current sync schedule' })
  @ResponseSchema(syncScheduleSchema)
  async getSyncSchedule(): Promise<SyncSchedule> {
    return this._enphaseSyncService.getSyncSchedule();
  }

  @Put('sync-schedule')
  @ApiOperation({ summary: 'Update sync schedule' })
  @ResponseSchema(syncScheduleSchema)
  async updateSyncSchedule(
    @Body({ schema: syncScheduleSchema }) dto: SyncSchedule,
  ): Promise<SyncSchedule> {
    await this._enphaseSyncService.updateSyncTime(dto.syncTime);
    return { syncTime: dto.syncTime };
  }
}
