import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { PrismaService } from '../../common/database/prisma.service.js';
import { Prisma } from '../../generated/prisma/client.js';

import { DateRangesService } from './date-ranges.service.js';

const mockPrisma = {
  dateRange: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    deleteMany: vi.fn(),
  },
};

const ID = '0b5c8c3e-5d2a-4a59-9a59-3f1f5c1e2a11';

const row = (overrides: Partial<Record<string, unknown>> = {}) => ({
  id: ID,
  name: 'Été 2024',
  startDate: new Date('2024-06-21T00:00:00.000Z'),
  endDate: new Date('2024-09-22T00:00:00.000Z'),
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

const uniqueViolation = () =>
  new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
    code: 'P2002',
    clientVersion: 'test',
  });

describe('DateRangesService', () => {
  let service: DateRangesService;

  beforeEach(async () => {
    vi.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [DateRangesService, { provide: PrismaService, useValue: mockPrisma }],
    }).compile();
    service = moduleRef.get(DateRangesService);
  });

  it('should expose the bounds as yyyy-MM-dd, the most recent range first', async () => {
    mockPrisma.dateRange.findMany.mockResolvedValue([row()]);

    await expect(service.findAll()).resolves.toEqual([
      { id: ID, name: 'Été 2024', startDate: '2024-06-21', endDate: '2024-09-22' },
    ]);
    expect(mockPrisma.dateRange.findMany).toHaveBeenCalledWith({
      orderBy: [{ startDate: 'desc' }, { name: 'asc' }],
    });
  });

  it('should store the bounds at midnight UTC', async () => {
    mockPrisma.dateRange.create.mockResolvedValue(row());

    await service.create({ name: 'Été 2024', startDate: '2024-06-21', endDate: '2024-09-22' });

    expect(mockPrisma.dateRange.create).toHaveBeenCalledWith({
      data: {
        name: 'Été 2024',
        startDate: new Date('2024-06-21T00:00:00.000Z'),
        endDate: new Date('2024-09-22T00:00:00.000Z'),
      },
    });
  });

  it('should refuse a name already taken', async () => {
    mockPrisma.dateRange.create.mockRejectedValue(uniqueViolation());

    await expect(
      service.create({ name: 'Été 2024', startDate: '2024-06-21', endDate: '2024-09-22' }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('should rename a range and keep its bounds', async () => {
    mockPrisma.dateRange.findUnique.mockResolvedValue(row());
    mockPrisma.dateRange.update.mockResolvedValue(row({ name: 'Vacances' }));

    await expect(service.update(ID, { name: 'Vacances' })).resolves.toMatchObject({
      name: 'Vacances',
      startDate: '2024-06-21',
    });
    expect(mockPrisma.dateRange.update).toHaveBeenCalledWith({
      where: { id: ID },
      data: {
        name: 'Vacances',
        startDate: new Date('2024-06-21T00:00:00.000Z'),
        endDate: new Date('2024-09-22T00:00:00.000Z'),
      },
    });
  });

  it('should refuse a single bound that crosses the stored other one', async () => {
    mockPrisma.dateRange.findUnique.mockResolvedValue(row());

    await expect(service.update(ID, { startDate: '2024-10-01' })).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(mockPrisma.dateRange.update).not.toHaveBeenCalled();
  });

  it('should refuse to rename to a name already taken', async () => {
    mockPrisma.dateRange.findUnique.mockResolvedValue(row());
    mockPrisma.dateRange.update.mockRejectedValue(uniqueViolation());

    await expect(service.update(ID, { name: 'Printemps' })).rejects.toBeInstanceOf(
      ConflictException,
    );
  });

  it('should report an unknown range', async () => {
    mockPrisma.dateRange.findUnique.mockResolvedValue(null);
    mockPrisma.dateRange.deleteMany.mockResolvedValue({ count: 0 });

    await expect(service.update(ID, { name: 'x' })).rejects.toBeInstanceOf(NotFoundException);
    await expect(service.delete(ID)).rejects.toBeInstanceOf(NotFoundException);
  });
});
