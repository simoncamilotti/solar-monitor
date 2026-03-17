import { BadRequestException, Controller, Get, Logger, Query, Res } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';

import { Public } from '@/core';
import { EnphaseBackfillResponseDto, EnphaseCallbackResponseDto, EnphaseSyncResponseDto } from '@/shared-models/server';

import { EnphaseMapper } from '../mappers/enphase.mapper';
import { EnphaseApiService } from '../services/enphase-api.service';
import { EnphaseAuthService } from '../services/enphase-auth.service';
import { EnphaseSyncService } from '../services/enphase-sync.service';
import type {} from '../types/enphase.types';

@ApiTags('Enphase')
@Controller('enphase')
export class EnphaseController {
  private readonly _logger = new Logger(EnphaseController.name);

  constructor(
    private readonly _enphaseAuthService: EnphaseAuthService,
    private readonly _enphaseApiService: EnphaseApiService,
    private readonly _enphaseSyncService: EnphaseSyncService,
    private readonly _enphaseMapper: EnphaseMapper,
  ) {}

  @Public()
  @Get('authorize')
  @ApiOperation({ summary: 'Redirect to Enphase OAuth2 authorization page' })
  authorize(@Res() res: Response): void {
    const url = this._enphaseAuthService.getAuthorizationUrl();
    this._logger.log('Redirecting to Enphase authorization page');
    res.redirect(url);
  }

  @Public()
  @Get('callback')
  @ApiOperation({ summary: 'Handle Enphase OAuth2 callback' })
  async callback(@Query('code') code: string, @Res() res: Response): Promise<void> {
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

  @Get('sync')
  @ApiOperation({ summary: 'Trigger manual sync for a system' })
  @ApiQuery({ name: 'system_id', required: true })
  async triggerSync(@Query('system_id') systemId: string): Promise<EnphaseSyncResponseDto> {
    await this._enphaseSyncService.syncLifetimeData(Number(systemId));
    return { message: `Sync completed for system ${systemId}` };
  }

  @Get('backfill')
  @ApiOperation({ summary: 'Backfill historical production data' })
  @ApiQuery({ name: 'system_id', required: true })
  @ApiQuery({ name: 'start_date', required: true, description: 'YYYY-MM-DD' })
  @ApiQuery({ name: 'end_date', required: true, description: 'YYYY-MM-DD' })
  async backfill(
    @Query('system_id') systemId: string,
    @Query('start_date') startDate: string,
    @Query('end_date') endDate: string,
  ): Promise<EnphaseBackfillResponseDto> {
    const count = await this._enphaseSyncService.backfillLifetimeData(Number(systemId), startDate, endDate);
    return { message: 'Backfill completed', daysBackfilled: count };
  }
}
