import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { DateRange, DateRangeCreate, DateRangeUpdate } from '@repo/contracts';
import { PrismaService } from '../../common/database/prisma.service.js';
import { Prisma, type DateRange as DateRangeRow } from '../../generated/prisma/client.js';

const toDay = (date: Date): string => date.toISOString().slice(0, 10);
const fromDay = (day: string): Date => new Date(`${day}T00:00:00.000Z`);

const toDateRange = (row: DateRangeRow): DateRange => ({
  id: row.id,
  name: row.name,
  startDate: toDay(row.startDate),
  endDate: toDay(row.endDate),
});

const isUniqueViolation = (error: unknown): boolean =>
  error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002';

const isNotFound = (error: unknown): boolean =>
  error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025';

@Injectable()
export class DateRangesService {
  constructor(private readonly prisma: PrismaService) {}

  /** Every saved range, from the most recent to the oldest. */
  async findAll(): Promise<DateRange[]> {
    const rows = await this.prisma.dateRange.findMany({
      orderBy: [{ startDate: 'desc' }, { name: 'asc' }],
    });
    return rows.map(toDateRange);
  }

  async create(input: DateRangeCreate): Promise<DateRange> {
    try {
      const row = await this.prisma.dateRange.create({
        data: {
          name: input.name,
          startDate: fromDay(input.startDate),
          endDate: fromDay(input.endDate),
        },
      });
      return toDateRange(row);
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new ConflictException(`A range named "${input.name}" already exists`);
      }
      throw error;
    }
  }

  async update(id: string, input: DateRangeUpdate): Promise<DateRange> {
    const current = await this.prisma.dateRange.findUnique({ where: { id } });
    if (!current) {
      throw new NotFoundException(`Date range ${id} not found`);
    }
    // Only one bound may be sent: check it against the stored other one.
    const startDate = input.startDate ?? toDay(current.startDate);
    const endDate = input.endDate ?? toDay(current.endDate);
    if (startDate > endDate) {
      throw new BadRequestException('startDate must not be after endDate');
    }

    try {
      const row = await this.prisma.dateRange.update({
        where: { id },
        data: {
          ...(input.name === undefined ? {} : { name: input.name }),
          startDate: fromDay(startDate),
          endDate: fromDay(endDate),
        },
      });
      return toDateRange(row);
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new ConflictException(`A range named "${input.name}" already exists`);
      }
      if (isNotFound(error)) {
        throw new NotFoundException(`Date range ${id} not found`);
      }
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    const { count } = await this.prisma.dateRange.deleteMany({ where: { id } });
    if (count === 0) {
      throw new NotFoundException(`Date range ${id} not found`);
    }
  }
}
