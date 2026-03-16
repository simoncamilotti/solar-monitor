import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckResult, HealthCheckService, HealthIndicatorResult } from '@nestjs/terminus';

import { Public } from '../auth/decorators/public.decorator';
import { HealthService } from './health.service';

@Public()
@Controller()
export class HealthController {
  constructor(
    private readonly _healthCheckService: HealthCheckService,
    private readonly _healthService: HealthService,
  ) {}

  @Get('health')
  @HealthCheck()
  ready(): Promise<HealthCheckResult> {
    return this._healthCheckService.check([
      (): Promise<HealthIndicatorResult> => this._healthService.database(),
      (): Promise<HealthIndicatorResult> => this._healthService.memory(),
      (): Promise<HealthIndicatorResult> => this._healthService.disk(),
    ]);
  }
}
