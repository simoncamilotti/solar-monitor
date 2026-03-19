import { BadRequestException, Controller, Get, Logger, ParseIntPipe, Query, Res } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';

import { Public } from '@/core';
import {
  EnphaseBackfillResponseDto,
  EnphaseCallbackResponseDto,
  EnphaseSyncResponseDto,
  LifetimeDataResponseDto,
} from '@/shared-models/server';

import { EnphaseMapper } from '../mappers/enphase.mapper';
import { EnphaseService } from '../services/enphase.service';
import { EnphaseApiService } from '../services/enphase-api.service';
import { EnphaseAuthService } from '../services/enphase-auth.service';
import { EnphaseSyncService } from '../services/enphase-sync.service';

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

const validateDateParam = (value: string, name: string): void => {
  if (!DATE_REGEX.test(value)) {
    throw new BadRequestException(`${name} must be in YYYY-MM-DD format`);
  }
  const parsed = new Date(value);
  if (isNaN(parsed.getTime())) {
    throw new BadRequestException(`${name} is not a valid date`);
  }
};

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

  @Get('sync')
  @ApiOperation({ summary: 'Trigger manual sync for a system' })
  @ApiQuery({ name: 'system_id', required: true, type: Number })
  @ApiResponse({ status: 200, description: 'Sync completed' })
  @ApiResponse({ status: 400, description: 'Invalid system_id' })
  async triggerSync(@Query('system_id', ParseIntPipe) systemId: number): Promise<EnphaseSyncResponseDto> {
    await this._enphaseSyncService.syncLifetimeData(systemId);
    return { message: `Sync completed for system ${systemId}` };
  }

  @Get('backfill')
  @ApiOperation({ summary: 'Backfill historical production data' })
  @ApiQuery({ name: 'system_id', required: true, type: Number })
  @ApiQuery({ name: 'start_date', required: true, description: 'YYYY-MM-DD' })
  @ApiQuery({ name: 'end_date', required: true, description: 'YYYY-MM-DD' })
  @ApiResponse({ status: 200, description: 'Backfill completed' })
  @ApiResponse({ status: 400, description: 'Invalid parameters' })
  async backfill(
    @Query('system_id', ParseIntPipe) systemId: number,
    @Query('start_date') startDate: string,
    @Query('end_date') endDate: string,
  ): Promise<EnphaseBackfillResponseDto> {
    validateDateParam(startDate, 'start_date');
    validateDateParam(endDate, 'end_date');

    if (new Date(startDate) > new Date(endDate)) {
      throw new BadRequestException('start_date must be before end_date');
    }

    const count = await this._enphaseSyncService.backfillLifetimeData(systemId, startDate, endDate);
    return { message: 'Backfill completed', daysBackfilled: count };
  }
}
