import { Test, TestingModule } from '@nestjs/testing';

import { PrismaService } from '@/core';

import { EnphaseMapper } from '../mappers/enphase.mapper';
import { EnphaseService } from './enphase.service';

const mockPrismaService = {
  enphaseLifetimeData: {
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
});
