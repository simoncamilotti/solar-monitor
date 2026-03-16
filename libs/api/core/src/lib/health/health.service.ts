import { Injectable } from '@nestjs/common';
import {
  DiskHealthIndicator,
  HealthIndicatorResult,
  MemoryHealthIndicator,
  PrismaHealthIndicator,
} from '@nestjs/terminus';

import { PrismaService } from '../prisma/services/prisma.service';

@Injectable()
export class HealthService {
  constructor(
    private readonly _prismaHealth: PrismaHealthIndicator,
    private readonly _prismaService: PrismaService,
    private readonly _memory: MemoryHealthIndicator,
    private readonly _disk: DiskHealthIndicator,
  ) {}

  async database(): Promise<HealthIndicatorResult> {
    return this._prismaHealth.pingCheck('database', this._prismaService);
  }

  async memory(): Promise<HealthIndicatorResult> {
    return this._memory.checkHeap('memory', 256 * 1024 * 1024);
  }

  async disk(): Promise<HealthIndicatorResult> {
    return this._disk.checkStorage('disk', { thresholdPercent: 0.9, path: '/' });
  }
}
