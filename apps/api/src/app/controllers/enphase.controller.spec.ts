import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { EnphaseMapper } from '../mappers/enphase.mapper';
import { EnphaseApiService } from '../services/enphase-api.service';
import { EnphaseAuthService } from '../services/enphase-auth.service';
import { EnphaseSyncService } from '../services/enphase-sync.service';
import { EnphaseController } from './enphase.controller';

const mockAuthService = {
  getAuthorizationUrl: jest.fn(),
  exchangeCodeForTokens: jest.fn(),
  storeTokens: jest.fn(),
};

const mockApiService = {
  getSystems: jest.fn(),
};

const mockSyncService = {
  syncLifetimeData: jest.fn(),
  backfillLifetimeData: jest.fn(),
};

const mockMapper = {
  toSystemDtoList: jest.fn(),
};

const createMockResponse = () => ({
  redirect: jest.fn(),
  json: jest.fn(),
});

describe('EnphaseController', () => {
  let controller: EnphaseController;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [EnphaseController],
      providers: [
        { provide: EnphaseAuthService, useValue: mockAuthService },
        { provide: EnphaseApiService, useValue: mockApiService },
        { provide: EnphaseSyncService, useValue: mockSyncService },
        { provide: EnphaseMapper, useValue: mockMapper },
      ],
    }).compile();

    controller = module.get<EnphaseController>(EnphaseController);
  });

  describe('authorize', () => {
    it('should redirect to authorization URL', () => {
      mockAuthService.getAuthorizationUrl.mockReturnValue('https://enphase.com/oauth?client_id=test');
      const res = createMockResponse();

      controller.authorize(res as any);

      expect(res.redirect).toHaveBeenCalledWith('https://enphase.com/oauth?client_id=test');
    });
  });

  describe('callback', () => {
    it('should throw BadRequestException when code is missing', async () => {
      const res = createMockResponse();

      await expect(controller.callback(undefined as unknown as string, res as any)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should return empty message when no systems found', async () => {
      const tokens = { accessToken: 'token', refreshToken: 'refresh', expiresAt: new Date() };
      mockAuthService.exchangeCodeForTokens.mockResolvedValue(tokens);
      mockApiService.getSystems.mockResolvedValue({ systems: [] });
      const res = createMockResponse();

      await controller.callback('code-123', res as any);

      expect(res.json).toHaveBeenCalledWith({ message: 'No systems found on this Enphase account' });
      expect(mockAuthService.storeTokens).not.toHaveBeenCalled();
    });

    it('should store tokens and return mapped systems', async () => {
      const tokens = { accessToken: 'token', refreshToken: 'refresh', expiresAt: new Date() };
      const rawSystems = [{ system_id: 1, name: 'Solar A', timezone: 'Europe/Paris', status: 'normal' }];
      const mappedSystems = [{ id: 1, name: 'Solar A', timezone: 'Europe/Paris' }];

      mockAuthService.exchangeCodeForTokens.mockResolvedValue(tokens);
      mockApiService.getSystems.mockResolvedValue({ systems: rawSystems });
      mockMapper.toSystemDtoList.mockReturnValue(mappedSystems);
      mockAuthService.storeTokens.mockResolvedValue(undefined);
      const res = createMockResponse();

      await controller.callback('code-123', res as any);

      expect(mockAuthService.exchangeCodeForTokens).toHaveBeenCalledWith('code-123');
      expect(mockApiService.getSystems).toHaveBeenCalledWith('token');
      expect(mockAuthService.storeTokens).toHaveBeenCalledWith(1, tokens);
      expect(mockMapper.toSystemDtoList).toHaveBeenCalledWith(rawSystems);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Enphase account linked successfully',
        systems: mappedSystems,
      });
    });
  });

  describe('triggerSync', () => {
    it('should delegate to sync service and return message', async () => {
      mockSyncService.syncLifetimeData.mockResolvedValue(undefined);

      const result = await controller.triggerSync('42');

      expect(result).toEqual({ message: 'Sync completed for system 42' });
      expect(mockSyncService.syncLifetimeData).toHaveBeenCalledWith(42);
    });

    it('should propagate errors from sync service', async () => {
      mockSyncService.syncLifetimeData.mockRejectedValue(new Error('Sync failed'));

      await expect(controller.triggerSync('42')).rejects.toThrow('Sync failed');
    });
  });

  describe('backfill', () => {
    it('should delegate to sync service and return count', async () => {
      mockSyncService.backfillLifetimeData.mockResolvedValue(30);

      const result = await controller.backfill('42', '2026-01-01', '2026-01-31');

      expect(result).toEqual({ message: 'Backfill completed', daysBackfilled: 30 });
      expect(mockSyncService.backfillLifetimeData).toHaveBeenCalledWith(42, '2026-01-01', '2026-01-31');
    });

    it('should propagate errors from sync service', async () => {
      mockSyncService.backfillLifetimeData.mockRejectedValue(new Error('API error'));

      await expect(controller.backfill('42', '2026-01-01', '2026-01-31')).rejects.toThrow('API error');
    });
  });
});
