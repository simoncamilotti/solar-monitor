import { Injectable } from '@nestjs/common';

import { PrismaService } from '@/core';
import { LifetimeDataResponseDto } from '@/shared-models/server';

import { EnphaseMapper } from '../mappers/enphase.mapper';

@Injectable()
export class EnphaseService {
  constructor(
    private readonly _prismaService: PrismaService,
    private readonly _enphaseMapper: EnphaseMapper,
  ) {}

  async getAllLifetimeData(): Promise<LifetimeDataResponseDto> {
    const data = await this._prismaService.enphaseLifetimeData.findMany();

    return this._enphaseMapper.toLifetimeDataResponseDto(data);
  }
}
