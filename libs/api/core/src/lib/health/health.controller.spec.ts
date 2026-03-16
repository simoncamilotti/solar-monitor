import { HealthCheckService } from '@nestjs/terminus';
import { Test, TestingModule } from '@nestjs/testing';

import { HealthController } from './health.controller';
import { HealthService } from './health.service';

const mockHealthCheckService = {
  check: jest.fn(),
};

const mockHealthService = {
  database: jest.fn(),
  memory: jest.fn(),
  disk: jest.fn(),
};

describe('HealthController', () => {
  let controller: HealthController;

  beforeEach(async () => {
    jest.clearAllMocks();

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
