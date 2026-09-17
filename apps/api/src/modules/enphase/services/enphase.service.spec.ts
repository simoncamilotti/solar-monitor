import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';

import { PrismaService } from '@/core';

import { EnphaseMapper } from '../mappers/enphase.mapper';
import { EnphaseService } from './enphase.service';

const mockPrismaService = {
  enphaseLifetimeData: {
    findMany: jest.fn(),
  },
  enphaseToken: {
    findMany: jest.fn(),
  },
};

const mockEnphaseMapper = {
  toLifetimeDataResponseDto: jest.fn(),
};

describe('EnphaseService', () => {
  let service: EnphaseService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EnphaseService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: EnphaseMapper, useValue: mockEnphaseMapper },
      ],
    }).compile();

    service = module.get<EnphaseService>(EnphaseService);
  });

  describe('getAllLifetimeData', () => {
    it('should return lifetime data via mapper', async () => {
      const dbData = [
        {
          id: 1,
          date: new Date('2026-03-10'),
          whProduced: 1000,
          whConsumed: 500,
          whImported: 100,
          whExported: 400,
          createdAt: new Date(),
          enphaseTokenId: 1,
        },
      ];
      const mappedData = [
        { date: new Date('2026-03-10'), whProduced: 1000, whConsumed: 500, whImported: 100, whExported: 400 },
      ];
      mockPrismaService.enphaseLifetimeData.findMany.mockResolvedValue(dbData);
      mockEnphaseMapper.toLifetimeDataResponseDto.mockReturnValue(mappedData);

      const result = await service.getAllLifetimeData();

      expect(result).toEqual(mappedData);
      expect(mockPrismaService.enphaseLifetimeData.findMany).toHaveBeenCalled();
      expect(mockEnphaseMapper.toLifetimeDataResponseDto).toHaveBeenCalledWith(dbData);
    });

    it('should return empty array when no data exists', async () => {
      mockPrismaService.enphaseLifetimeData.findMany.mockResolvedValue([]);
      mockEnphaseMapper.toLifetimeDataResponseDto.mockReturnValue([]);

      const result = await service.getAllLifetimeData();

      expect(result).toEqual([]);
    });
  });

  describe('getSyncStatus', () => {
    const days = (...isoDays: string[]) => isoDays.map(isoDay => ({ date: new Date(`${isoDay}T00:00:00.000Z`) }));

    it('should return sync status for each system', async () => {
      mockPrismaService.enphaseToken.findMany.mockResolvedValue([
        { systemId: 123, lifetimeData: days('2026-04-01', '2026-04-02') },
      ]);

      const result = await service.getSyncStatus();

      expect(result).toEqual([
        { systemId: 123, lastSyncDate: '2026-04-02', totalRecords: 2, expectedRecords: 2, gaps: [] },
      ]);
    });

    it('should return null lastSyncDate when no data exists', async () => {
      mockPrismaService.enphaseToken.findMany.mockResolvedValue([{ systemId: 456, lifetimeData: [] }]);

      const result = await service.getSyncStatus();

      expect(result).toEqual([{ systemId: 456, lastSyncDate: null, totalRecords: 0, expectedRecords: 0, gaps: [] }]);
    });

    it('should return empty array when no systems configured', async () => {
      mockPrismaService.enphaseToken.findMany.mockResolvedValue([]);

      const result = await service.getSyncStatus();

      expect(result).toEqual([]);
    });

    // Le cas réel qui a motivé la fonctionnalité : 106 relevés stockés se lisaient
    // comme une bonne nouvelle, alors qu'il en manquait 17 en un seul trou.
    it('should report a single gap with its exact bounds', async () => {
      mockPrismaService.enphaseToken.findMany.mockResolvedValue([
        { systemId: 1, lifetimeData: days('2026-03-14', '2026-03-15', '2026-04-02') },
      ]);

      const [status] = await service.getSyncStatus();

      expect(status.totalRecords).toBe(3);
      expect(status.expectedRecords).toBe(20);
      expect(status.gaps).toEqual([{ from: '2026-03-16', to: '2026-04-01', days: 17 }]);
    });

    it('should report several gaps in order', async () => {
      mockPrismaService.enphaseToken.findMany.mockResolvedValue([
        { systemId: 1, lifetimeData: days('2026-01-01', '2026-01-03', '2026-01-04', '2026-01-08') },
      ]);

      const [status] = await service.getSyncStatus();

      expect(status.gaps).toEqual([
        { from: '2026-01-02', to: '2026-01-02', days: 1 },
        { from: '2026-01-05', to: '2026-01-07', days: 3 },
      ]);
      expect(status.expectedRecords).toBe(8);
      expect(status.totalRecords).toBe(4);
    });

    it('should report no gap for a contiguous history', async () => {
      mockPrismaService.enphaseToken.findMany.mockResolvedValue([
        { systemId: 1, lifetimeData: days('2026-02-27', '2026-02-28', '2026-03-01') },
      ]);

      const [status] = await service.getSyncStatus();

      expect(status.gaps).toEqual([]);
      expect(status.expectedRecords).toBe(status.totalRecords);
    });

    it('should count a leap day as present rather than missing', async () => {
      mockPrismaService.enphaseToken.findMany.mockResolvedValue([
        { systemId: 1, lifetimeData: days('2028-02-28', '2028-02-29', '2028-03-01') },
      ]);

      const [status] = await service.getSyncStatus();

      expect(status.gaps).toEqual([]);
      expect(status.expectedRecords).toBe(3);
    });

    it('should handle a single stored day', async () => {
      mockPrismaService.enphaseToken.findMany.mockResolvedValue([{ systemId: 1, lifetimeData: days('2026-05-05') }]);

      const [status] = await service.getSyncStatus();

      expect(status).toEqual({
        systemId: 1,
        lastSyncDate: '2026-05-05',
        totalRecords: 1,
        expectedRecords: 1,
        gaps: [],
      });
    });
  });
});
