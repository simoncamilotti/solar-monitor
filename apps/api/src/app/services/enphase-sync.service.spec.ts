import { Test, TestingModule } from '@nestjs/testing';

import { PrismaService } from '@/core';

import { EnphaseMapper } from '../mappers/enphase.mapper';
import type { LifetimeData } from '../types/enphase.types';
import { EnphaseApiService } from './enphase-api.service';
import { EnphaseAuthService } from './enphase-auth.service';
import { EnphaseSyncService } from './enphase-sync.service';

const mockPrismaService = {
  enphaseToken: {
    findMany: jest.fn(),
    findUniqueOrThrow: jest.fn(),
  },
  enphaseLifetimeData: {
    upsert: jest.fn(),
  },
};

const mockApiService = {
  getLifetimeData: jest.fn(),
};

const mockAuthService = {
  refreshAccessToken: jest.fn(),
};

const mockMapper = {
  toLifetimeDataRecords: jest.fn(),
};

const LIFETIME_DATA: LifetimeData = {
  whProduced: [1000, 2000],
  whConsumed: [500, 600],
  whImported: [100, 200],
  whExported: [400, 500],
};

const TOKEN_RECORD = { id: 'token-uuid', systemId: 42 };

describe('EnphaseSyncService', () => {
  let service: EnphaseSyncService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EnphaseSyncService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: EnphaseApiService, useValue: mockApiService },
        { provide: EnphaseAuthService, useValue: mockAuthService },
        { provide: EnphaseMapper, useValue: mockMapper },
      ],
    }).compile();

    service = module.get<EnphaseSyncService>(EnphaseSyncService);
  });

  describe('syncLifetimeData', () => {
    it('should fetch yesterday data and upsert records', async () => {
      mockApiService.getLifetimeData.mockResolvedValue(LIFETIME_DATA);
      mockPrismaService.enphaseToken.findUniqueOrThrow.mockResolvedValue(TOKEN_RECORD);
      const mappedRecords = [
        { date: new Date('2026-03-15'), whProduced: 1000, whConsumed: 500, whImported: 100, whExported: 400 },
      ];
      mockMapper.toLifetimeDataRecords.mockReturnValue(mappedRecords);
      mockPrismaService.enphaseLifetimeData.upsert.mockResolvedValue({});

      await service.syncLifetimeData(42);

      expect(mockApiService.getLifetimeData).toHaveBeenCalledWith(42, expect.any(String));
      expect(mockPrismaService.enphaseToken.findUniqueOrThrow).toHaveBeenCalledWith({ where: { systemId: 42 } });
      expect(mockPrismaService.enphaseLifetimeData.upsert).toHaveBeenCalledWith({
        where: { date: mappedRecords[0].date },
        create: { ...mappedRecords[0], enphaseTokenId: 'token-uuid' },
        update: { ...mappedRecords[0], enphaseTokenId: 'token-uuid' },
      });
    });
  });

  describe('backfillLifetimeData', () => {
    it('should fetch range data and upsert all records', async () => {
      mockApiService.getLifetimeData.mockResolvedValue(LIFETIME_DATA);
      mockPrismaService.enphaseToken.findUniqueOrThrow.mockResolvedValue(TOKEN_RECORD);
      const mappedRecords = [
        { date: new Date('2026-03-10'), whProduced: 1000, whConsumed: 500, whImported: 100, whExported: 400 },
        { date: new Date('2026-03-11'), whProduced: 2000, whConsumed: 600, whImported: 200, whExported: 500 },
      ];
      mockMapper.toLifetimeDataRecords.mockReturnValue(mappedRecords);
      mockPrismaService.enphaseLifetimeData.upsert.mockResolvedValue({});

      const count = await service.backfillLifetimeData(42, '2026-03-10', '2026-03-11');

      expect(count).toBe(2);
      expect(mockApiService.getLifetimeData).toHaveBeenCalledWith(42, '2026-03-10', '2026-03-11');
      expect(mockPrismaService.enphaseLifetimeData.upsert).toHaveBeenCalledTimes(2);
    });

    it('should return 0 for empty data range', async () => {
      mockApiService.getLifetimeData.mockResolvedValue({
        whProduced: [],
        whConsumed: [],
        whImported: [],
        whExported: [],
      });
      mockPrismaService.enphaseToken.findUniqueOrThrow.mockResolvedValue(TOKEN_RECORD);
      mockMapper.toLifetimeDataRecords.mockReturnValue([]);

      const count = await service.backfillLifetimeData(42, '2026-03-10', '2026-03-10');

      expect(count).toBe(0);
      expect(mockPrismaService.enphaseLifetimeData.upsert).not.toHaveBeenCalled();
    });
  });

  describe('syncAllSystems', () => {
    it('should sync all registered systems', async () => {
      mockPrismaService.enphaseToken.findMany.mockResolvedValue([{ systemId: 1 }, { systemId: 2 }]);
      mockApiService.getLifetimeData.mockResolvedValue(LIFETIME_DATA);
      mockPrismaService.enphaseToken.findUniqueOrThrow.mockResolvedValue(TOKEN_RECORD);
      mockMapper.toLifetimeDataRecords.mockReturnValue([]);

      await service.syncAllSystems();

      expect(mockPrismaService.enphaseToken.findMany).toHaveBeenCalled();
      expect(mockApiService.getLifetimeData).toHaveBeenCalledTimes(2);
    });

    it('should continue syncing other systems if one fails', async () => {
      mockPrismaService.enphaseToken.findMany.mockResolvedValue([{ systemId: 1 }, { systemId: 2 }]);
      mockApiService.getLifetimeData.mockRejectedValueOnce(new Error('API error')).mockResolvedValueOnce(LIFETIME_DATA);
      mockPrismaService.enphaseToken.findUniqueOrThrow.mockResolvedValue(TOKEN_RECORD);
      mockMapper.toLifetimeDataRecords.mockReturnValue([]);

      await expect(service.syncAllSystems()).resolves.not.toThrow();

      expect(mockApiService.getLifetimeData).toHaveBeenCalledTimes(2);
    });

    it('should do nothing when no systems are registered', async () => {
      mockPrismaService.enphaseToken.findMany.mockResolvedValue([]);

      await service.syncAllSystems();

      expect(mockApiService.getLifetimeData).not.toHaveBeenCalled();
    });
  });

  describe('refreshExpiringTokens', () => {
    it('should refresh tokens expiring within 12 hours', async () => {
      mockPrismaService.enphaseToken.findMany.mockResolvedValue([{ systemId: 1 }, { systemId: 2 }]);
      mockAuthService.refreshAccessToken.mockResolvedValue('new-token');

      await service.refreshExpiringTokens();

      expect(mockPrismaService.enphaseToken.findMany).toHaveBeenCalledWith({
        where: { expiresAt: { lt: expect.any(Date) } },
      });
      expect(mockAuthService.refreshAccessToken).toHaveBeenCalledTimes(2);
      expect(mockAuthService.refreshAccessToken).toHaveBeenCalledWith(1);
      expect(mockAuthService.refreshAccessToken).toHaveBeenCalledWith(2);
    });

    it('should continue refreshing other tokens if one fails', async () => {
      mockPrismaService.enphaseToken.findMany.mockResolvedValue([{ systemId: 1 }, { systemId: 2 }]);
      mockAuthService.refreshAccessToken
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce('new-token');

      await expect(service.refreshExpiringTokens()).resolves.not.toThrow();

      expect(mockAuthService.refreshAccessToken).toHaveBeenCalledTimes(2);
    });

    it('should do nothing when no tokens are expiring', async () => {
      mockPrismaService.enphaseToken.findMany.mockResolvedValue([]);

      await service.refreshExpiringTokens();

      expect(mockAuthService.refreshAccessToken).not.toHaveBeenCalled();
    });
  });
});
