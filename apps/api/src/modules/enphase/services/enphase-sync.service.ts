import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression, SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';

import { PrismaService } from '@/core';

import { EnphaseMapper } from '../mappers/enphase.mapper';
import type { LifetimeData } from '../types/enphase.types';
import { EnphaseApiService } from './enphase-api.service';
import { EnphaseAuthService } from './enphase-auth.service';

const SYNC_CRON_NAME = 'enphase-daily-sync';

@Injectable()
export class EnphaseSyncService implements OnModuleInit {
  private readonly _logger = new Logger(EnphaseSyncService.name);

  constructor(
    private readonly _prismaService: PrismaService,
    private readonly _apiService: EnphaseApiService,
    private readonly _authService: EnphaseAuthService,
    private readonly _mapper: EnphaseMapper,
    private readonly _schedulerRegistry: SchedulerRegistry,
  ) {}

  async onModuleInit(): Promise<void> {
    const schedule = await this._prismaService.syncSchedule.findUnique({ where: { id: 'default' } });
    const syncTime = schedule?.syncTime ?? '02:00';
    this._registerSyncCron(syncTime);
  }

  async updateSyncTime(syncTime: string): Promise<void> {
    await this._prismaService.syncSchedule.upsert({
      where: { id: 'default' },
      update: { syncTime },
      create: { id: 'default', syncTime },
    });

    this._registerSyncCron(syncTime);
    this._logger.log(`Sync schedule updated to ${syncTime} UTC`);
  }

  async getSyncSchedule(): Promise<{ syncTime: string }> {
    const schedule = await this._prismaService.syncSchedule.findUnique({ where: { id: 'default' } });
    return { syncTime: schedule?.syncTime ?? '02:00' };
  }

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

  private _registerSyncCron(syncTime: string): void {
    const [hours, minutes] = syncTime.split(':');
    const cronExpression = `${minutes} ${hours} * * *`;

    if (this._schedulerRegistry.doesExist('cron', SYNC_CRON_NAME)) {
      this._schedulerRegistry.deleteCronJob(SYNC_CRON_NAME);
    }

    const job = new CronJob(cronExpression, () => this.syncAllSystems(), null, true, 'Etc/UTC');
    this._schedulerRegistry.addCronJob(SYNC_CRON_NAME, job);

    this._logger.log(`Registered daily sync cron: ${cronExpression} (UTC)`);
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
