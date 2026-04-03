import { Injectable } from '@nestjs/common';

import { PrismaService } from '@/core';
import type { SyncStatusDto } from '@/shared-models';

import type { LifetimeDataResponseDto } from '../dtos/enphase.dto';
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
          orderBy: { date: 'desc' },
          take: 1,
          select: { date: true },
        },
        _count: { select: { lifetimeData: true } },
      },
    });

    return tokens.map(token => ({
      systemId: token.systemId,
      lastSyncDate: token.lifetimeData[0]?.date.toISOString().split('T')[0] ?? null,
      totalRecords: token._count.lifetimeData,
    }));
  }
}
