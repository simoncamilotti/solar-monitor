import { HealthCheckService } from '@nestjs/terminus';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';

import { HealthController } from './health.controller';
import { HealthService } from './health.service';

const mockHealthCheckService = {
  check: vi.fn(),
};

const mockHealthService = {
  database: vi.fn(),
  memory: vi.fn(),
  disk: vi.fn(),
};

describe('HealthController', () => {
  let controller: HealthController;

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        { provide: HealthCheckService, useValue: mockHealthCheckService },
        { provide: HealthService, useValue: mockHealthService },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
  });

  describe('ready', () => {
    it('should call healthCheckService.check with the database indicator', async () => {
      const healthResult = { status: 'ok', details: { database: { status: 'up' } } };
      mockHealthCheckService.check.mockResolvedValue(healthResult);

      await controller.ready();

      expect(mockHealthCheckService.check).toHaveBeenCalledWith([
        expect.any(Function),
        expect.any(Function),
        expect.any(Function),
      ]);
    });

    it('should return the health check result', async () => {
      const healthResult = { status: 'ok', details: { database: { status: 'up' } } };
      mockHealthCheckService.check.mockResolvedValue(healthResult);

      const result = await controller.ready();

      expect(result).toEqual(healthResult);
    });
  });
});
