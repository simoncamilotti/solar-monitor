import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';

import type {
  ConsumptionLifetimeResponse,
  EnphaseSystemsResponse,
  ExportLifetimeResponse,
  ImportLifetimeResponse,
  LifetimeData,
  ProductionLifetimeResponse,
} from '../types/enphase.types';
import { EnphaseAuthService } from './enphase-auth.service';

const ENPHASE_API_BASE = 'https://api.enphaseenergy.com/api/v4';

@Injectable()
export class EnphaseApiService {
  private readonly _logger = new Logger(EnphaseApiService.name);
  private readonly _apiKey: string;

  constructor(
    private readonly _httpService: HttpService,
    private readonly _authService: EnphaseAuthService,
  ) {
    const apiKey = process.env['ENPHASE_API_KEY'];
    if (!apiKey) {
      throw new Error('Missing required environment variable: ENPHASE_API_KEY');
    }
    this._apiKey = apiKey;
  }

  async getSystems(accessToken: string): Promise<EnphaseSystemsResponse> {
    const params = new URLSearchParams({ key: this._apiKey });
    const url = `${ENPHASE_API_BASE}/systems?${params.toString()}`;

    const { data } = await firstValueFrom(
      this._httpService.get<EnphaseSystemsResponse>(url, {
        headers: { Authorization: `Bearer ${accessToken}` },
      }),
    );

    return data;
  }

  async getLifetimeData(systemId: number, startDate?: string, endDate?: string): Promise<LifetimeData> {
    const [production, consumption, imported, exported] = await Promise.all([
      this.getEnergyLifetime(systemId, startDate, endDate),
      this.getConsumptionLifetime(systemId, startDate, endDate),
      this.getImportLifetime(systemId, startDate, endDate),
      this.getExportLifetime(systemId, startDate, endDate),
    ]);

    return {
      whProduced: production.production,
      whConsumed: consumption.consumption,
      whImported: imported.import,
      whExported: exported.export,
    };
  }

  async getEnergyLifetime(systemId: number, startDate?: string, endDate?: string): Promise<ProductionLifetimeResponse> {
    const params = this._buildDateParams(startDate, endDate);
    return this._request<ProductionLifetimeResponse>(systemId, `/systems/${systemId}/energy_lifetime`, params);
  }

  async getConsumptionLifetime(
    systemId: number,
    startDate?: string,
    endDate?: string,
  ): Promise<ConsumptionLifetimeResponse> {
    const params = this._buildDateParams(startDate, endDate);
    return this._request<ConsumptionLifetimeResponse>(systemId, `/systems/${systemId}/consumption_lifetime`, params);
  }

  async getExportLifetime(systemId: number, startDate?: string, endDate?: string): Promise<ExportLifetimeResponse> {
    const params = this._buildDateParams(startDate, endDate);
    return this._request<ExportLifetimeResponse>(systemId, `/systems/${systemId}/energy_export_lifetime`, params);
  }

  async getImportLifetime(systemId: number, startDate?: string, endDate?: string): Promise<ImportLifetimeResponse> {
    const params = this._buildDateParams(startDate, endDate);
    return this._request<ImportLifetimeResponse>(systemId, `/systems/${systemId}/energy_import_lifetime`, params);
  }

  private async _request<T>(systemId: number, path: string, params: Record<string, string> = {}): Promise<T> {
    const accessToken = await this._authService.getValidAccessToken(systemId);

    const queryParams = new URLSearchParams({ key: this._apiKey, ...params });
    const url = `${ENPHASE_API_BASE}${path}?${queryParams.toString()}`;

    const { data } = await firstValueFrom(
      this._httpService.get<T>(url, {
        headers: { Authorization: `Bearer ${accessToken}` },
      }),
    );

    return data;
  }

  private _buildDateParams(startDate?: string, endDate?: string): Record<string, string> {
    const params: Record<string, string> = {};
    if (startDate) params['start_date'] = startDate;
    if (endDate) params['end_date'] = endDate;
    return params;
  }
}
