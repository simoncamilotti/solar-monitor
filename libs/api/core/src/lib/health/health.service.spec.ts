import { DiskHealthIndicator, MemoryHealthIndicator, PrismaHealthIndicator } from '@nestjs/terminus';
import { Test, TestingModule } from '@nestjs/testing';

import { PrismaService } from '../prisma/services/prisma.service';
import { HealthService } from './health.service';

const mockPrismaHealthIndicator = {
  pingCheck: jest.fn(),
};

const mockMemoryHealthIndicator = {
  checkHeap: jest.fn(),
};

const mockDiskHealthIndicator = {
  checkStorage: jest.fn(),
};

const mockPrismaService = {};

describe('HealthService', () => {
  let service: HealthService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HealthService,
        { provide: PrismaHealthIndicator, useValue: mockPrismaHealthIndicator },
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: MemoryHealthIndicator, useValue: mockMemoryHealthIndicator },
        { provide: DiskHealthIndicator, useValue: mockDiskHealthIndicator },
      ],
    }).compile();

    service = module.get<HealthService>(HealthService);
  });

  describe('database', () => {
    it('should call pingCheck with database and prismaService', async () => {
      const healthResult = { database: { status: 'up' } };
      mockPrismaHealthIndicator.pingCheck.mockResolvedValue(healthResult);

      await service.database();

      expect(mockPrismaHealthIndicator.pingCheck).toHaveBeenCalledWith('database', mockPrismaService);
    });

    it('should return the health indicator result', async () => {
      const healthResult = { database: { status: 'up' } };
      mockPrismaHealthIndicator.pingCheck.mockResolvedValue(healthResult);

      const result = await service.database();

      expect(result).toEqual(healthResult);
    });
  });
});
