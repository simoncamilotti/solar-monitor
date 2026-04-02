import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { PrismaService } from '@/core';

import { EnphaseMapper } from '../mappers/enphase.mapper';
import type { LifetimeData } from '../types/enphase.types';
import { EnphaseApiService } from './enphase-api.service';
import { EnphaseAuthService } from './enphase-auth.service';

@Injectable()
export class EnphaseSyncService {
  private readonly _logger = new Logger(EnphaseSyncService.name);

  constructor(
    private readonly _prismaService: PrismaService,
    private readonly _apiService: EnphaseApiService,
    private readonly _authService: EnphaseAuthService,
    private readonly _mapper: EnphaseMapper,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async syncAllSystems(): Promise<void> {
    const tokens = await this._prismaService.enphaseToken.findMany();

    for (const token of tokens) {
      try {
        await this.syncLifetimeData(token.systemId);
      } catch (error) {
        this._logger.error(`Failed to sync system ${token.systemId}: ${error}`);
      }
    }
  }

  async syncLifetimeData(systemId: number): Promise<void> {
    const yesterday = new Date();
    yesterday.setUTCDate(yesterday.getUTCDate() - 1);
    const dateStr = yesterday.toISOString().split('T')[0];

    this._logger.log(`Syncing lifetime data for system ${systemId} on ${dateStr}`);

    const lifetimeData = await this._apiService.getLifetimeData(systemId, dateStr);

    await this._upsertLifetimeData(systemId, lifetimeData, dateStr);

    this._logger.log(`Saved lifetime data for system ${systemId}`);
  }

  async backfillLifetimeData(systemId: number, startDate: string, endDate: string): Promise<number> {
    this._logger.log(`Backfilling system ${systemId} from ${startDate} to ${endDate}`);

    const lifetimeData = await this._apiService.getLifetimeData(systemId, startDate, endDate);

    const count = await this._upsertLifetimeData(systemId, lifetimeData, startDate);

    this._logger.log(`Backfilled ${count} days for system ${systemId}`);
    return count;
  }

  @Cron(CronExpression.EVERY_6_HOURS)
  async refreshExpiringTokens(): Promise<void> {
    const twelveHoursFromNow = new Date(Date.now() + 12 * 60 * 60 * 1000);

    const expiringTokens = await this._prismaService.enphaseToken.findMany({
      where: { expiresAt: { lt: twelveHoursFromNow } },
    });

    for (const token of expiringTokens) {
      try {
        await this._authService.refreshAccessToken(token.systemId);
        this._logger.log(`Proactively refreshed token for system ${token.systemId}`);
      } catch (error) {
        this._logger.error(`Failed to refresh token for system ${token.systemId}: ${error}`);
      }
    }
  }

  private async _upsertLifetimeData(systemId: number, lifetimeData: LifetimeData, startDate: string): Promise<number> {
    const token = await this._prismaService.enphaseToken.findUniqueOrThrow({
      where: { systemId },
    });

    const records = this._mapper.toLifetimeDataRecords(lifetimeData, startDate);

    await this._prismaService.$transaction(
      records.map(record =>
        this._prismaService.enphaseLifetimeData.upsert({
          where: {
            date_enphaseTokenId: {
              date: record.date,
              enphaseTokenId: token.id,
            },
          },
          create: { ...record, enphaseTokenId: token.id },
          update: { ...record, enphaseTokenId: token.id },
        }),
      ),
    );

    return records.length;
  }
}
