import { Injectable } from '@nestjs/common';
import { EnphaseLifetimeData } from '@prisma/client';

import { EnphaseSystemDto, LifetimeDataResponseDto } from '@/shared-models/server';

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
    return lifetimeData.whConsumed.map((_, index) => {
      const date = new Date(startDate);
      date.setUTCDate(date.getUTCDate() + index);

      return {
        date,
        whProduced: lifetimeData.whProduced[index],
        whConsumed: lifetimeData.whConsumed[index],
        whImported: lifetimeData.whImported[index],
        whExported: lifetimeData.whExported[index],
      };
    });
  }

  toLifetimeDataResponseDto(lifetimeData: EnphaseLifetimeData[]): LifetimeDataResponseDto {
    return lifetimeData.map(x => ({
      date: x.date,
      whProduced: x.whProduced,
      whConsumed: x.whConsumed,
      whImported: x.whImported,
      whExported: x.whExported,
    }));
  }
}
