import { Injectable } from '@nestjs/common';
import type { EnphaseLifetimeData } from '@prisma/client';
import { Decimal } from 'decimal.js';

import type { EnphaseSystemDto, LifetimeDataResponseDto } from '../dtos/enphase.dto';
import type { EnphaseSystemRaw, LifetimeData, LifetimeDataRecord } from '../types/enphase.types';

@Injectable()
export class EnphaseMapper {
  toSystemDto(system: EnphaseSystemRaw): EnphaseSystemDto {
    return {
      id: system.system_id,
      name: system.name,
      timezone: system.timezone,
    };
  }

  toSystemDtoList(systems: EnphaseSystemRaw[]): EnphaseSystemDto[] {
    return systems.map(system => this.toSystemDto(system));
  }

  toLifetimeDataRecords(lifetimeData: LifetimeData, startDate: string): LifetimeDataRecord[] {
    const length = Math.min(
      lifetimeData.whProduced.length,
      lifetimeData.whConsumed.length,
      lifetimeData.whImported.length,
      lifetimeData.whExported.length,
    );

    return Array.from({ length }, (_, index) => {
      const date = new Date(startDate);
      date.setUTCDate(date.getUTCDate() + index);

      return {
        date,
        whProduced: lifetimeData.whProduced[index] ?? 0,
        whConsumed: lifetimeData.whConsumed[index] ?? 0,
        whImported: lifetimeData.whImported[index] ?? 0,
        whExported: lifetimeData.whExported[index] ?? 0,
      };
    });
  }

  toLifetimeDataResponseDto(lifetimeData: EnphaseLifetimeData[]): LifetimeDataResponseDto {
    return lifetimeData.map(x => ({
      date: x.date,
      kwhProduced: new Decimal(x.whProduced).div(1000).toNumber(),
      kwhConsumed: new Decimal(x.whConsumed).div(1000).toNumber(),
      kwhImported: new Decimal(x.whImported).div(1000).toNumber(),
      kwhExported: new Decimal(x.whExported).div(1000).toNumber(),
      gridDependency: x.whConsumed === 0 ? 0 : new Decimal(x.whImported).div(x.whConsumed).mul(100).toNumber(),
    }));
  }
}
