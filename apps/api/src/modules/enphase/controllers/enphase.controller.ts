import { BadRequestException, Body, Controller, Get, Logger, Post, Put, Query, Res } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { Response } from 'express';

import { Public } from '@/core';

import type {
  EnphaseBackfillResponseDto,
  EnphaseCallbackResponseDto,
  EnphaseSyncResponseDto,
  LifetimeDataResponseDto,
  SyncScheduleDto,
  SyncStatusResponseDto,
} from '../dtos/enphase.dto';
import { EnphaseBackfillRequestDto, EnphaseSyncRequestDto, UpdateSyncScheduleRequestDto } from '../dtos/enphase.dto';
import { EnphaseMapper } from '../mappers/enphase.mapper';
import { EnphaseService } from '../services/enphase.service';
import { EnphaseApiService } from '../services/enphase-api.service';
import { EnphaseAuthService } from '../services/enphase-auth.service';
import { EnphaseSyncService } from '../services/enphase-sync.service';

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

  @Public()
  @Get('authorize')
  @ApiOperation({ summary: 'Redirect to Enphase OAuth2 authorization page' })
  @ApiResponse({ status: 302, description: 'Redirects to Enphase authorization page' })
  authorize(@Res() res: Response): void {
    const url = this._enphaseAuthService.getAuthorizationUrl();
    this._logger.log('Redirecting to Enphase authorization page');
    res.redirect(url);
  }

  @Public()
  @Get('callback')
  @ApiOperation({ summary: 'Handle Enphase OAuth2 callback' })
  @ApiResponse({ status: 200, description: 'Enphase account linked successfully' })
  @ApiResponse({ status: 400, description: 'Missing code or invalid state' })
  async callback(@Query('code') code: string, @Query('state') state: string, @Res() res: Response): Promise<void> {
    this._enphaseAuthService.validateState(state);

    if (!code) {
      throw new BadRequestException('Missing authorization code');
    }

    this._logger.log('Received Enphase authorization callback');

    const tokens = await this._enphaseAuthService.exchangeCodeForTokens(code);
    const systemsResponse = await this._enphaseApiService.getSystems(tokens.accessToken);
    const systems = systemsResponse.systems ?? [];

    if (systems.length === 0) {
      res.json({ message: 'No systems found on this Enphase account' });
      return;
    }

    await this._enphaseAuthService.storeTokens(systems[0].system_id, tokens);
    this._logger.log(`Linked Enphase system: ${systems[0].name} (ID: ${systems[0].system_id})`);

    const response: EnphaseCallbackResponseDto = {
      message: 'Enphase account linked successfully',
      systems: this._enphaseMapper.toSystemDtoList(systems),
    };

    res.json(response);
  }

  @Get('all')
  @ApiOperation({ summary: 'Expose all lifetime data' })
  @ApiResponse({ status: 200, description: 'Returns all lifetime data' })
  async getAll(): Promise<LifetimeDataResponseDto> {
    return this._enphaseService.getAllLifetimeData();
  }

  @Get('sync-status')
  @ApiOperation({ summary: 'Get sync status for all systems' })
  @ApiResponse({ status: 200, description: 'Returns sync status per system' })
  async getSyncStatus(): Promise<SyncStatusResponseDto> {
    return this._enphaseService.getSyncStatus();
  }

  @Post('sync')
  @ApiOperation({ summary: 'Trigger manual sync for a system' })
  @ApiBody({ type: EnphaseSyncRequestDto })
  @ApiResponse({ status: 200, description: 'Sync completed' })
  @ApiResponse({ status: 400, description: 'Invalid systemId' })
  async triggerSync(@Body() dto: EnphaseSyncRequestDto): Promise<EnphaseSyncResponseDto> {
    await this._enphaseSyncService.syncLifetimeData(dto.systemId);
    return { message: `Sync completed for system ${dto.systemId}` };
  }

  @Post('backfill')
  @Throttle({ default: { limit: 3, ttl: 60 * 60 * 1000 } })
  @ApiOperation({ summary: 'Backfill historical production data' })
  @ApiBody({ type: EnphaseBackfillRequestDto })
  @ApiResponse({ status: 200, description: 'Backfill completed' })
  @ApiResponse({ status: 400, description: 'Invalid parameters' })
  @ApiResponse({ status: 429, description: 'Too many backfill requests — Enphase quota is monthly' })
  async backfill(@Body() dto: EnphaseBackfillRequestDto): Promise<EnphaseBackfillResponseDto> {
    const count = await this._enphaseSyncService.backfillLifetimeData(dto.systemId, dto.startDate, dto.endDate);
    return { message: 'Backfill completed', daysBackfilled: count };
  }

  @Get('sync-schedule')
  @ApiOperation({ summary: 'Get current sync schedule' })
  @ApiResponse({ status: 200, description: 'Returns the current sync schedule' })
  async getSyncSchedule(): Promise<SyncScheduleDto> {
    return this._enphaseSyncService.getSyncSchedule();
  }

  @Put('sync-schedule')
  @ApiOperation({ summary: 'Update sync schedule' })
  @ApiBody({ type: UpdateSyncScheduleRequestDto })
  @ApiResponse({ status: 200, description: 'Schedule updated' })
  async updateSyncSchedule(@Body() dto: UpdateSyncScheduleRequestDto): Promise<SyncScheduleDto> {
    await this._enphaseSyncService.updateSyncTime(dto.syncTime);
    return { syncTime: dto.syncTime };
  }
}
