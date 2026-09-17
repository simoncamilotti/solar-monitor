import { Injectable } from '@nestjs/common';

import { PrismaService } from '@/core';
import type { SyncGapDto, SyncStatusDto } from '@/shared-models';

import type { LifetimeDataResponseDto } from '../dtos/enphase.dto';

const DAY_MS = 86_400_000;

const toDay = (date: Date): string => date.toISOString().slice(0, 10);

const addDays = (date: Date, days: number): Date => new Date(date.getTime() + days * DAY_MS);
import { EnphaseMapper } from '../mappers/enphase.mapper';

@Injectable()
export class EnphaseService {
  constructor(
    private readonly _prismaService: PrismaService,
    private readonly _enphaseMapper: EnphaseMapper,
  ) {}

  async getAllLifetimeData(): Promise<LifetimeDataResponseDto> {
    const data = await this._prismaService.enphaseLifetimeData.findMany({
      orderBy: { date: 'asc' },
    });

    return this._enphaseMapper.toLifetimeDataResponseDto(data);
  }

  async getSyncStatus(): Promise<SyncStatusDto[]> {
    const tokens = await this._prismaService.enphaseToken.findMany({
      include: {
        lifetimeData: {
          orderBy: { date: 'asc' },
          select: { date: true },
        },
      },
    });

    return tokens.map(token => {
      const dates = token.lifetimeData.map(entry => entry.date);

      return {
        systemId: token.systemId,
        lastSyncDate: dates.length > 0 ? toDay(dates[dates.length - 1]) : null,
        totalRecords: dates.length,
        ...this._computeCoverage(dates),
      };
    });
  }

  /**
   * Mesure la complétude de l'historique et localise ses trous.
   *
   * La tâche quotidienne ne va chercher que la veille : un jour raté par une coupure,
   * un jeton expiré ou une indisponibilité de l'API ne se rattrape jamais tout seul.
   * Un simple compteur d'enregistrements ne le montre pas — seule la comparaison avec
   * l'étendue de la plage le révèle.
   *
   * Les dates sont stockées à minuit UTC, donc comparables jour à jour sans risque
   * de fuseau.
   */
  private _computeCoverage(dates: Date[]): { expectedRecords: number; gaps: SyncGapDto[] } {
    if (dates.length === 0) {
      return { expectedRecords: 0, gaps: [] };
    }

    const first = dates[0];
    const last = dates[dates.length - 1];
    const expectedRecords = Math.round((last.getTime() - first.getTime()) / DAY_MS) + 1;

    const gaps: SyncGapDto[] = [];

    for (let index = 1; index < dates.length; index++) {
      const missing = Math.round((dates[index].getTime() - dates[index - 1].getTime()) / DAY_MS) - 1;

      if (missing > 0) {
        gaps.push({
          from: toDay(addDays(dates[index - 1], 1)),
          to: toDay(addDays(dates[index], -1)),
          days: missing,
        });
      }
    }

    return { expectedRecords, gaps };
  }
}
