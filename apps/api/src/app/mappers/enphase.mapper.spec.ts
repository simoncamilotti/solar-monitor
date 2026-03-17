import type { EnphaseSystemRaw, LifetimeData } from '../types/enphase.types';
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
    it('should map lifetime data to records with correct dates', () => {
      const lifetimeData: LifetimeData = {
        whProduced: [1000, 2000, 3000],
        whConsumed: [500, 600, 700],
        whImported: [100, 200, 300],
        whExported: [400, 500, 600],
      };

      const records = mapper.toLifetimeDataRecords(lifetimeData, '2026-03-10');

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
      const lifetimeData: LifetimeData = {
        whProduced: [5000],
        whConsumed: [3000],
        whImported: [1000],
        whExported: [2000],
      };

      const records = mapper.toLifetimeDataRecords(lifetimeData, '2026-01-15');

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
      const lifetimeData: LifetimeData = {
        whProduced: [],
        whConsumed: [],
        whImported: [],
        whExported: [],
      };

      const records = mapper.toLifetimeDataRecords(lifetimeData, '2026-03-10');

      expect(records).toEqual([]);
    });

    it('should handle month boundary correctly', () => {
      const lifetimeData: LifetimeData = {
        whProduced: [100, 200],
        whConsumed: [50, 60],
        whImported: [10, 20],
        whExported: [40, 50],
      };

      const records = mapper.toLifetimeDataRecords(lifetimeData, '2026-01-31');

      expect(records[0].date).toEqual(new Date('2026-01-31'));
      expect(records[1].date).toEqual(new Date('2026-02-01'));
    });
  });
});
