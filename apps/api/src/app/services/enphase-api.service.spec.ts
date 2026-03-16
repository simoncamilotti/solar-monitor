import { HttpService } from '@nestjs/axios';
import { Test, TestingModule } from '@nestjs/testing';
import { of } from 'rxjs';

import type { ProductionLifetimeResponse } from '../types/enphase.types';
import { EnphaseApiService } from './enphase-api.service';
import { EnphaseAuthService } from './enphase-auth.service';

const mockHttpService = {
  get: jest.fn(),
};

const mockAuthService = {
  getValidAccessToken: jest.fn(),
};

const LIFETIME_META = {
  status: 'normal',
  last_report_at: 1710000000,
  last_energy_at: 1710000000,
  operational_at: 1700000000,
};

describe('EnphaseApiService', () => {
  let service: EnphaseApiService;

  beforeEach(async () => {
    jest.clearAllMocks();

    process.env['ENPHASE_API_KEY'] = 'test-api-key';

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EnphaseApiService,
        { provide: HttpService, useValue: mockHttpService },
        { provide: EnphaseAuthService, useValue: mockAuthService },
      ],
    }).compile();

    service = module.get<EnphaseApiService>(EnphaseApiService);
  });

  describe('getSystems', () => {
    it('should fetch systems with access token and api key', async () => {
      const systemsResponse = {
        systems: [{ system_id: 1, name: 'Solar', timezone: 'Europe/Paris', status: 'normal' }],
      };
      mockHttpService.get.mockReturnValue(of({ data: systemsResponse }));

      const result = await service.getSystems('my-token');

      expect(result).toEqual(systemsResponse);
      expect(mockHttpService.get).toHaveBeenCalledWith(
        expect.stringContaining('key=test-api-key'),
        expect.objectContaining({
          headers: { Authorization: 'Bearer my-token' },
        }),
      );
    });
  });

  describe('getLifetimeData', () => {
    it('should call all four lifetime endpoints in parallel and aggregate results', async () => {
      mockAuthService.getValidAccessToken.mockResolvedValue('token');

      const productionResp: ProductionLifetimeResponse = {
        system_id: 1,
        start_date: '2026-03-10',
        meta: LIFETIME_META,
        production: [1000, 2000],
        meter_start_date: '2025-01-01',
      };
      const consumptionResp = { system_id: 1, start_date: '2026-03-10', meta: LIFETIME_META, consumption: [500, 600] };
      const importResp = { system_id: 1, start_date: '2026-03-10', meta: LIFETIME_META, import: [100, 200] };
      const exportResp = { system_id: 1, start_date: '2026-03-10', meta: LIFETIME_META, export: [400, 500] };

      mockHttpService.get
        .mockReturnValueOnce(of({ data: productionResp }))
        .mockReturnValueOnce(of({ data: consumptionResp }))
        .mockReturnValueOnce(of({ data: importResp }))
        .mockReturnValueOnce(of({ data: exportResp }));

      const result = await service.getLifetimeData(1, '2026-03-10', '2026-03-11');

      expect(result).toEqual({
        whProduced: [1000, 2000],
        whConsumed: [500, 600],
        whImported: [100, 200],
        whExported: [400, 500],
      });
      expect(mockHttpService.get).toHaveBeenCalledTimes(4);
    });
  });

  describe('getEnergyLifetime', () => {
    it('should call the energy_lifetime endpoint with date params', async () => {
      mockAuthService.getValidAccessToken.mockResolvedValue('token');
      const response = {
        system_id: 1,
        start_date: '2026-03-10',
        meta: LIFETIME_META,
        production: [1000],
        meter_start_date: '2025-01-01',
      };
      mockHttpService.get.mockReturnValue(of({ data: response }));

      const result = await service.getEnergyLifetime(1, '2026-03-10', '2026-03-10');

      expect(result).toEqual(response);
      const calledUrl = mockHttpService.get.mock.calls[0][0] as string;
      expect(calledUrl).toContain('/systems/1/energy_lifetime');
      expect(calledUrl).toContain('start_date=2026-03-10');
      expect(calledUrl).toContain('end_date=2026-03-10');
    });

    it('should omit date params when not provided', async () => {
      mockAuthService.getValidAccessToken.mockResolvedValue('token');
      mockHttpService.get.mockReturnValue(
        of({ data: { system_id: 1, start_date: '2025-01-01', meta: LIFETIME_META, production: [], meter_start_date: '2025-01-01' } }),
      );

      await service.getEnergyLifetime(1);

      const calledUrl = mockHttpService.get.mock.calls[0][0] as string;
      expect(calledUrl).not.toContain('start_date');
      expect(calledUrl).not.toContain('end_date');
    });
  });

  describe('getConsumptionLifetime', () => {
    it('should call the consumption_lifetime endpoint', async () => {
      mockAuthService.getValidAccessToken.mockResolvedValue('token');
      mockHttpService.get.mockReturnValue(
        of({ data: { system_id: 1, start_date: '2026-03-10', meta: LIFETIME_META, consumption: [500] } }),
      );

      await service.getConsumptionLifetime(1, '2026-03-10');

      const calledUrl = mockHttpService.get.mock.calls[0][0] as string;
      expect(calledUrl).toContain('/systems/1/consumption_lifetime');
    });
  });

  describe('getExportLifetime', () => {
    it('should call the energy_export_lifetime endpoint', async () => {
      mockAuthService.getValidAccessToken.mockResolvedValue('token');
      mockHttpService.get.mockReturnValue(
        of({ data: { system_id: 1, start_date: '2026-03-10', meta: LIFETIME_META, export: [400] } }),
      );

      await service.getExportLifetime(1, '2026-03-10');

      const calledUrl = mockHttpService.get.mock.calls[0][0] as string;
      expect(calledUrl).toContain('/systems/1/energy_export_lifetime');
    });
  });

  describe('getImportLifetime', () => {
    it('should call the energy_import_lifetime endpoint', async () => {
      mockAuthService.getValidAccessToken.mockResolvedValue('token');
      mockHttpService.get.mockReturnValue(
        of({ data: { system_id: 1, start_date: '2026-03-10', meta: LIFETIME_META, import: [100] } }),
      );

      await service.getImportLifetime(1, '2026-03-10');

      const calledUrl = mockHttpService.get.mock.calls[0][0] as string;
      expect(calledUrl).toContain('/systems/1/energy_import_lifetime');
    });
  });
});
