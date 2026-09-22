import type { EnphaseLifetimeData } from '@prisma/client';

import type { EnphaseSystemRaw, LifetimeData, LifetimeSeries } from '../types/enphase.types';
import { EnphaseMapper } from './enphase.mapper';

describe('EnphaseMapper', () => {
  let mapper: EnphaseMapper;

  beforeEach(() => {
    mapper = new EnphaseMapper();
  });

  describe('toSystemDto', () => {
    it('should map raw system to dto', () => {
      const raw: EnphaseSystemRaw = {
        system_id: 123,
        name: 'My Solar',
        timezone: 'Europe/Paris',
        status: 'normal',
      };

      const result = mapper.toSystemDto(raw);

      expect(result).toEqual({
        id: 123,
        name: 'My Solar',
        timezone: 'Europe/Paris',
      });
    });

    it('should not include status in dto', () => {
      const raw: EnphaseSystemRaw = {
        system_id: 1,
        name: 'Test',
        timezone: 'UTC',
        status: 'error',
      };

      const result = mapper.toSystemDto(raw);

      expect(result).not.toHaveProperty('status');
    });
  });

  describe('toSystemDtoList', () => {
    it('should map multiple systems', () => {
      const systems: EnphaseSystemRaw[] = [
        { system_id: 1, name: 'System A', timezone: 'Europe/Paris', status: 'normal' },
        { system_id: 2, name: 'System B', timezone: 'US/Eastern', status: 'normal' },
      ];

      const result = mapper.toSystemDtoList(systems);

      expect(result).toEqual([
        { id: 1, name: 'System A', timezone: 'Europe/Paris' },
        { id: 2, name: 'System B', timezone: 'US/Eastern' },
      ]);
    });

    it('should return empty array for empty input', () => {
      const result = mapper.toSystemDtoList([]);

      expect(result).toEqual([]);
    });
  });

  describe('toLifetimeDataRecords', () => {
    const series = (startDate: string, values: number[]): LifetimeSeries => ({ startDate, values });

    const aligned = (startDate: string, p: number[], c: number[], i: number[], e: number[]): LifetimeData => ({
      whProduced: series(startDate, p),
      whConsumed: series(startDate, c),
      whImported: series(startDate, i),
      whExported: series(startDate, e),
    });

    it('should map lifetime data to records with correct dates', () => {
      const records = mapper.toLifetimeDataRecords(
        aligned('2026-03-10', [1000, 2000, 3000], [500, 600, 700], [100, 200, 300], [400, 500, 600]),
      );

      expect(records).toHaveLength(3);
      expect(records[0]).toEqual({
        date: new Date('2026-03-10'),
        whProduced: 1000,
        whConsumed: 500,
        whImported: 100,
        whExported: 400,
      });
      expect(records[1]).toEqual({
        date: new Date('2026-03-11'),
        whProduced: 2000,
        whConsumed: 600,
        whImported: 200,
        whExported: 500,
      });
      expect(records[2]).toEqual({
        date: new Date('2026-03-12'),
        whProduced: 3000,
        whConsumed: 700,
        whImported: 300,
        whExported: 600,
      });
    });

    it('should return single record for single-day data', () => {
      const records = mapper.toLifetimeDataRecords(aligned('2026-01-15', [5000], [3000], [1000], [2000]));

      expect(records).toHaveLength(1);
      expect(records[0]).toEqual({
        date: new Date('2026-01-15'),
        whProduced: 5000,
        whConsumed: 3000,
        whImported: 1000,
        whExported: 2000,
      });
    });

    it('should return empty array for empty data', () => {
      const records = mapper.toLifetimeDataRecords(aligned('2026-03-10', [], [], [], []));

      expect(records).toEqual([]);
    });

    it('should handle month boundary correctly', () => {
      const records = mapper.toLifetimeDataRecords(aligned('2026-01-31', [100, 200], [50, 60], [10, 20], [40, 50]));

      expect(records[0].date).toEqual(new Date('2026-01-31'));
      expect(records[1].date).toEqual(new Date('2026-02-01'));
    });

    it('should handle a leap day correctly', () => {
      const records = mapper.toLifetimeDataRecords(aligned('2028-02-28', [100, 200], [50, 60], [10, 20], [40, 50]));

      expect(records[0].date).toEqual(new Date('2028-02-28'));
      expect(records[1].date).toEqual(new Date('2028-02-29'));
    });

    // Enphase truncates the range to the meter_start_date and returns the date actually served
    // in `start_date`. Indexing on the REQUESTED date used to shift every reading.
    it('should index on the start date returned by Enphase, not the requested one', () => {
      const records = mapper.toLifetimeDataRecords(
        aligned('2026-06-01', [1000, 2000], [500, 600], [100, 200], [400, 500]),
      );

      expect(records.map(r => r.date)).toEqual([new Date('2026-06-01'), new Date('2026-06-02')]);
      expect(records[0].whProduced).toBe(1000);
    });

    // The four series come from different meters and can therefore start on different dates:
    // alignment happens by date, not by index.
    it('should align series that start on different dates', () => {
      const records = mapper.toLifetimeDataRecords({
        whProduced: series('2026-03-10', [1000, 2000, 3000]),
        whConsumed: series('2026-03-11', [600, 700]),
        whImported: series('2026-03-11', [200, 300]),
        whExported: series('2026-03-11', [500, 600]),
      });

      expect(records).toHaveLength(2);
      expect(records[0]).toEqual({
        date: new Date('2026-03-11'),
        whProduced: 2000,
        whConsumed: 600,
        whImported: 200,
        whExported: 500,
      });
      expect(records[1].date).toEqual(new Date('2026-03-12'));
      expect(records[1].whProduced).toBe(3000);
    });

    it('should skip days not covered by all four series', () => {
      const records = mapper.toLifetimeDataRecords({
        whProduced: series('2026-03-10', [1000, 2000, 3000]),
        whConsumed: series('2026-03-10', [500, 600]),
        whImported: series('2026-03-10', [100, 200]),
        whExported: series('2026-03-10', [400, 500]),
      });

      expect(records.map(r => r.date)).toEqual([new Date('2026-03-10'), new Date('2026-03-11')]);
    });

    it('should return no record when a meter has no overlapping day', () => {
      const records = mapper.toLifetimeDataRecords({
        whProduced: series('2026-03-10', [1000]),
        whConsumed: series('2026-05-01', [600]),
        whImported: series('2026-05-01', [200]),
        whExported: series('2026-05-01', [500]),
      });

      expect(records).toEqual([]);
    });

    it('should reject an unparsable start date rather than produce invalid dates', () => {
      expect(() => mapper.toLifetimeDataRecords(aligned('not-a-date', [1], [1], [1], [1]))).toThrow(
        'Invalid Enphase start_date: not-a-date',
      );
    });
  });

  describe('toLifetimeDataResponseDto', () => {
    it('should map Prisma entities to response DTOs', () => {
      const data: EnphaseLifetimeData[] = [
        {
          id: '1',
          date: new Date('2026-03-10'),
          whProduced: 1000,
          whConsumed: 500,
          whImported: 100,
          whExported: 400,
          createdAt: new Date(),
          enphaseTokenId: '1',
        },
        {
          id: '2',
          date: new Date('2026-03-11'),
          whProduced: 2000,
          whConsumed: 600,
          whImported: 200,
          whExported: 500,
          createdAt: new Date(),
          enphaseTokenId: '1',
        },
      ];

      const result = mapper.toLifetimeDataResponseDto(data);

      expect(result).toEqual([
        {
          date: '2026-03-10',
          kwhProduced: 1,
          kwhConsumed: 0.5,
          kwhImported: 0.1,
          kwhExported: 0.4,
          gridDependency: 20,
        },
        {
          date: '2026-03-11',
          kwhProduced: 2,
          kwhConsumed: 0.6,
          kwhImported: 0.2,
          kwhExported: 0.5,
          gridDependency: expect.closeTo(33.33, 1),
        },
      ]);
    });

    it('should not include Prisma-specific fields', () => {
      const data: EnphaseLifetimeData[] = [
        {
          id: '99',
          date: new Date('2026-01-01'),
          whProduced: 100,
          whConsumed: 50,
          whImported: 10,
          whExported: 40,
          createdAt: new Date(),
          enphaseTokenId: '5',
        },
      ];

      const result = mapper.toLifetimeDataResponseDto(data);

      expect(result[0]).not.toHaveProperty('id');
      expect(result[0]).not.toHaveProperty('createdAt');
      expect(result[0]).not.toHaveProperty('enphaseTokenId');
      expect(result[0]).toHaveProperty('kwhProduced');
      expect(result[0]).toHaveProperty('gridDependency');
    });

    it('should return empty array for empty input', () => {
      const result = mapper.toLifetimeDataResponseDto([]);

      expect(result).toEqual([]);
    });
  });
});
