import { Injectable } from '@nestjs/common';

import { EnphaseSystemDto } from '@/shared-models/server';

import type { EnphaseSystemRaw, LifetimeData } from '../types/enphase.types';

type LifetimeDataRecord = {
  date: Date;
  whProduced: number;
  whConsumed: number;
  whImported: number;
  whExported: number;
};

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
}
