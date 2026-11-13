import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { PrismaService } from '../../common/database/prisma.service.js';
import { Prisma } from '../../generated/prisma/client.js';

import { PricingService } from './pricing.service.js';

const mockPrisma = {
  tariff: {
    findMany: vi.fn(),
    create: vi.fn(),
    deleteMany: vi.fn(),
  },
  installation: {
    findUnique: vi.fn(),
    upsert: vi.fn(),
  },
};

const row = (overrides: Partial<Record<string, unknown>> = {}) => ({
  id: '0b5c8c3e-5d2a-4a59-9a59-3f1f5c1e2a11',
  kind: 'purchase',
  pricePerKwh: new Prisma.Decimal('0.2516'),
  effectiveFrom: new Date('2025-02-01T00:00:00.000Z'),
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

describe('PricingService', () => {
  let service: PricingService;

  beforeEach(async () => {
    vi.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [PricingService, { provide: PrismaService, useValue: mockPrisma }],
    }).compile();
    service = moduleRef.get(PricingService);
  });

  describe('findTariffs', () => {
    it('should expose prices as numbers and days as yyyy-MM-dd', async () => {
      mockPrisma.tariff.findMany.mockResolvedValue([row()]);

      await expect(service.findTariffs()).resolves.toEqual([
        {
          id: '0b5c8c3e-5d2a-4a59-9a59-3f1f5c1e2a11',
          kind: 'purchase',
          pricePerKwh: 0.2516,
          effectiveFrom: '2025-02-01',
        },
      ]);
      expect(mockPrisma.tariff.findMany).toHaveBeenCalledWith({
        orderBy: [{ kind: 'asc' }, { effectiveFrom: 'asc' }],
      });
    });
  });

  describe('createTariff', () => {
    it('should store the exact decimal price at midnight UTC', async () => {
      mockPrisma.tariff.create.mockResolvedValue(row());

      await service.createTariff({
        kind: 'purchase',
        pricePerKwh: 0.2516,
        effectiveFrom: '2025-02-01',
      });

      const data = mockPrisma.tariff.create.mock.lastCall?.[0].data;
      expect(data.pricePerKwh.toString()).toBe('0.2516');
      expect(data.effectiveFrom.toISOString()).toBe('2025-02-01T00:00:00.000Z');
    });

    it('should reject a second tariff of the same kind on the same day', async () => {
      mockPrisma.tariff.create.mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
          code: 'P2002',
          clientVersion: 'test',
        }),
      );

      await expect(
        service.createTariff({ kind: 'feedIn', pricePerKwh: 0.04, effectiveFrom: '2025-02-01' }),
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it('should let other database errors through', async () => {
      const failure = new Error('connection lost');
      mockPrisma.tariff.create.mockRejectedValue(failure);

      await expect(
        service.createTariff({ kind: 'feedIn', pricePerKwh: 0.04, effectiveFrom: '2025-02-01' }),
      ).rejects.toBe(failure);
    });
  });

  describe('deleteTariff', () => {
    it('should delete the tariff', async () => {
      mockPrisma.tariff.deleteMany.mockResolvedValue({ count: 1 });

      await expect(service.deleteTariff('id')).resolves.toBeUndefined();
    });

    it('should answer 404 for an unknown tariff', async () => {
      mockPrisma.tariff.deleteMany.mockResolvedValue({ count: 0 });

      await expect(service.deleteTariff('id')).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('installation', () => {
    it('should report an unknown cost before anything is entered', async () => {
      mockPrisma.installation.findUnique.mockResolvedValue(null);

      await expect(service.getInstallation()).resolves.toEqual({ cost: null });
    });

    it('should store and return the cost', async () => {
      mockPrisma.installation.upsert.mockResolvedValue({
        id: 'default',
        cost: new Prisma.Decimal('9500.5'),
        updatedAt: new Date(),
      });

      await expect(service.updateInstallation({ cost: 9500.5 })).resolves.toEqual({
        cost: 9500.5,
      });
      const create = mockPrisma.installation.upsert.mock.lastCall?.[0].create;
      expect(create.cost.toString()).toBe('9500.5');
    });

    it('should clear the cost', async () => {
      mockPrisma.installation.upsert.mockResolvedValue({
        id: 'default',
        cost: null,
        updatedAt: new Date(),
      });

      await expect(service.updateInstallation({ cost: null })).resolves.toEqual({ cost: null });
      expect(mockPrisma.installation.upsert.mock.lastCall?.[0].update).toEqual({ cost: null });
    });
  });

  describe('billing', () => {
    it('should report an unknown start before anything is entered', async () => {
      mockPrisma.installation.findUnique.mockResolvedValue(null);

      await expect(service.getBilling()).resolves.toEqual({ startDate: null });
    });

    it('should expose the start as yyyy-MM-dd', async () => {
      mockPrisma.installation.findUnique.mockResolvedValue({
        id: 'default',
        cost: null,
        billingStart: new Date('2023-03-03T00:00:00.000Z'),
      });

      await expect(service.getBilling()).resolves.toEqual({ startDate: '2023-03-03' });
    });

    it('should store the start at midnight UTC and leave the cost alone', async () => {
      mockPrisma.installation.upsert.mockResolvedValue({
        id: 'default',
        cost: new Prisma.Decimal('9500.5'),
        billingStart: new Date('2023-03-03T00:00:00.000Z'),
      });

      await expect(service.updateBilling({ startDate: '2023-03-03' })).resolves.toEqual({
        startDate: '2023-03-03',
      });
      const args = mockPrisma.installation.upsert.mock.lastCall?.[0];
      expect(args.create.billingStart.toISOString()).toBe('2023-03-03T00:00:00.000Z');
      expect(args.update).toEqual({ billingStart: args.update.billingStart });
      expect(args.update).not.toHaveProperty('cost');
    });

    it('should clear the start', async () => {
      mockPrisma.installation.upsert.mockResolvedValue({ id: 'default', billingStart: null });

      await expect(service.updateBilling({ startDate: null })).resolves.toEqual({
        startDate: null,
      });
      expect(mockPrisma.installation.upsert.mock.lastCall?.[0].update).toEqual({
        billingStart: null,
      });
    });
  });
});
