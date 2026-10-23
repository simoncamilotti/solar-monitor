import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import type { Installation, Tariff, TariffCreate } from '@repo/contracts';
import { PrismaService } from '../../common/database/prisma.service.js';
import { Prisma, type Tariff as TariffRow } from '../../generated/prisma/client.js';

const INSTALLATION_ID = 'default';

const toDay = (date: Date): string => date.toISOString().slice(0, 10);

const toTariff = (row: TariffRow): Tariff => ({
  id: row.id,
  kind: row.kind,
  pricePerKwh: row.pricePerKwh.toNumber(),
  effectiveFrom: toDay(row.effectiveFrom),
});

@Injectable()
export class PricingService {
  constructor(private readonly prisma: PrismaService) {}

  /** Every tariff, by kind then from the oldest to the newest. */
  async findTariffs(): Promise<Tariff[]> {
    const rows = await this.prisma.tariff.findMany({
      orderBy: [{ kind: 'asc' }, { effectiveFrom: 'asc' }],
    });
    return rows.map(toTariff);
  }

  async createTariff(input: TariffCreate): Promise<Tariff> {
    try {
      const row = await this.prisma.tariff.create({
        data: {
          kind: input.kind,
          // From the decimal text, so 0.2516 is stored as 0.2516 and not as its float approximation.
          pricePerKwh: new Prisma.Decimal(input.pricePerKwh.toString()),
          effectiveFrom: new Date(`${input.effectiveFrom}T00:00:00.000Z`),
        },
      });
      return toTariff(row);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException(
          `A ${input.kind} tariff already starts on ${input.effectiveFrom}`,
        );
      }
      throw error;
    }
  }

  async deleteTariff(id: string): Promise<void> {
    const { count } = await this.prisma.tariff.deleteMany({ where: { id } });
    if (count === 0) {
      throw new NotFoundException(`Tariff ${id} not found`);
    }
  }

  async getInstallation(): Promise<Installation> {
    const row = await this.prisma.installation.findUnique({ where: { id: INSTALLATION_ID } });
    return { cost: row?.cost?.toNumber() ?? null };
  }

  async updateInstallation(input: Installation): Promise<Installation> {
    const cost = input.cost === null ? null : new Prisma.Decimal(input.cost.toString());
    const row = await this.prisma.installation.upsert({
      where: { id: INSTALLATION_ID },
      create: { id: INSTALLATION_ID, cost },
      update: { cost },
    });
    return { cost: row.cost?.toNumber() ?? null };
  }
}
