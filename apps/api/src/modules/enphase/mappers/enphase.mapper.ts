import { Injectable } from '@nestjs/common';
import type { EnphaseLifetimeData } from '@prisma/client';
import { Decimal } from 'decimal.js';

import type { EnphaseSystemDto, LifetimeDataResponseDto } from '../dtos/enphase.dto';
import type { EnphaseSystemRaw, LifetimeData, LifetimeDataRecord, LifetimeSeries } from '../types/enphase.types';

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

  /**
   * Aligns the four series on DATES rather than on indexes.
   *
   * Each series starts at its own date, which Enphase returns in `start_date`: it is truncated to
   * the meter_start_date of the meter involved, and that meter differs between production,
   * consumption, import and export. Indexing all four from a single date therefore writes values
   * on the wrong days.
   *
   * Only the dates covered by all four series produce a record: the four columns are mandatory in
   * the database, and padding with zeroes would write wrong readings rather than omit them.
   */
  toLifetimeDataRecords(lifetimeData: LifetimeData): LifetimeDataRecord[] {
    const produced = this._indexByDate(lifetimeData.whProduced);
    const consumed = this._indexByDate(lifetimeData.whConsumed);
    const imported = this._indexByDate(lifetimeData.whImported);
    const exported = this._indexByDate(lifetimeData.whExported);

    const records: LifetimeDataRecord[] = [];

    for (const [day, whProduced] of [...produced].sort(([a], [b]) => a.localeCompare(b))) {
      const whConsumed = consumed.get(day);
      const whImported = imported.get(day);
      const whExported = exported.get(day);

      if (whConsumed === undefined || whImported === undefined || whExported === undefined) {
        continue;
      }

      records.push({ date: new Date(`${day}T00:00:00.000Z`), whProduced, whConsumed, whImported, whExported });
    }

    return records;
  }

  private _indexByDate(series: LifetimeSeries): Map<string, number> {
    const start = new Date(`${series.startDate}T00:00:00.000Z`);

    if (Number.isNaN(start.getTime())) {
      throw new Error(`Invalid Enphase start_date: ${series.startDate}`);
    }

    const byDate = new Map<string, number>();

    series.values.forEach((value, index) => {
      const date = new Date(start);
      date.setUTCDate(date.getUTCDate() + index);
      byDate.set(date.toISOString().slice(0, 10), value);
    });

    return byDate;
  }

  toLifetimeDataResponseDto(lifetimeData: EnphaseLifetimeData[]): LifetimeDataResponseDto {
    return lifetimeData.map(x => ({
      date: x.date.toISOString().slice(0, 10),
      kwhProduced: new Decimal(x.whProduced).div(1000).toNumber(),
      kwhConsumed: new Decimal(x.whConsumed).div(1000).toNumber(),
      kwhImported: new Decimal(x.whImported).div(1000).toNumber(),
      kwhExported: new Decimal(x.whExported).div(1000).toNumber(),
      gridDependency: x.whConsumed === 0 ? 0 : new Decimal(x.whImported).div(x.whConsumed).mul(100).toNumber(),
    }));
  }
}
