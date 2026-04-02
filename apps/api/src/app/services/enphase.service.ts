import { Injectable } from '@nestjs/common';

import { PrismaService } from '@/core';

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
}
