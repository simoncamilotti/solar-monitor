import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../common/database/prisma.service.js';
import type { SyncGap, SyncStatus } from '@repo/contracts';

import type { LifetimeDay } from '@repo/contracts';

const DAY_MS = 86_400_000;

const toDay = (date: Date): string => date.toISOString().slice(0, 10);

const addDays = (date: Date, days: number): Date => new Date(date.getTime() + days * DAY_MS);
import { EnphaseMapper } from './enphase.mapper.js';

@Injectable()
export class EnphaseService {
  constructor(
    private readonly _prismaService: PrismaService,
    private readonly _enphaseMapper: EnphaseMapper,
  ) {}

  async getAllLifetimeData(): Promise<LifetimeDay[]> {
    const data = await this._prismaService.enphaseLifetimeData.findMany({
      orderBy: { date: 'asc' },
    });

    return this._enphaseMapper.toLifetimeDataResponseDto(data);
  }

  async getSyncStatus(): Promise<SyncStatus[]> {
    const tokens = await this._prismaService.enphaseToken.findMany({
      include: {
        lifetimeData: {
          orderBy: { date: 'asc' },
          select: { date: true },
        },
      },
    });

    return tokens.map((token) => {
      const dates = token.lifetimeData.map((entry) => entry.date);
      const lastDate = dates.at(-1);

      return {
        systemId: token.systemId,
        lastSyncDate: lastDate ? toDay(lastDate) : null,
        totalRecords: dates.length,
        ...this._computeCoverage(dates),
      };
    });
  }

  /**
   * Measures how complete the history is and locates its gaps.
   *
   * The daily job only fetches the previous day: a day missed through an outage, an expired token
   * or an API unavailability never catches up on its own. A plain record count does not show it —
   * only comparing against the span of the range reveals it.
   *
   * Dates are stored at UTC midnight, so they compare day to day with no timezone risk.
   */
  private _computeCoverage(dates: Date[]): { expectedRecords: number; gaps: SyncGap[] } {
    const [first, ...rest] = dates;
    const last = dates.at(-1);

    if (!first || !last) {
      return { expectedRecords: 0, gaps: [] };
    }

    const expectedRecords = Math.round((last.getTime() - first.getTime()) / DAY_MS) + 1;

    const gaps: SyncGap[] = [];
    let previous = first;

    for (const current of rest) {
      const missing = Math.round((current.getTime() - previous.getTime()) / DAY_MS) - 1;

      if (missing > 0) {
        gaps.push({
          from: toDay(addDays(previous, 1)),
          to: toDay(addDays(current, -1)),
          days: missing,
        });
      }

      previous = current;
    }

    return { expectedRecords, gaps };
  }
}
