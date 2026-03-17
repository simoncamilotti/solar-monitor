import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';

import { PrismaService } from '@/core';

import type { EnphaseTokenResponse, EnphaseTokens } from '../types/enphase.types';

const ENPHASE_AUTH_URL = 'https://api.enphaseenergy.com/oauth/authorize';
const ENPHASE_TOKEN_URL = 'https://api.enphaseenergy.com/oauth/token';

@Injectable()
export class EnphaseAuthService {
  private readonly _logger = new Logger(EnphaseAuthService.name);

  private readonly _clientId = process.env['ENPHASE_CLIENT_ID']!;
  private readonly _clientSecret = process.env['ENPHASE_CLIENT_SECRET']!;
  private readonly _redirectUri = process.env['ENPHASE_REDIRECT_URI']!;

  constructor(
    private readonly _prismaService: PrismaService,
    private readonly _httpService: HttpService,
  ) {}

  getAuthorizationUrl(): string {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this._clientId,
      redirect_uri: this._redirectUri,
    });
    return `${ENPHASE_AUTH_URL}?${params.toString()}`;
  }

  async exchangeCodeForTokens(code: string): Promise<EnphaseTokens> {
    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      redirect_uri: this._redirectUri,
      code,
    });

    const tokenResponse = await this._requestToken(params);

    this._logger.log('Successfully exchanged authorization code for tokens');

    return this._mapTokenResponse(tokenResponse);
  }

  async refreshAccessToken(systemId: number): Promise<string> {
    const token = await this._prismaService.enphaseToken.findUnique({ where: { systemId } });
    if (!token) {
      throw new Error(`No Enphase token found for system ${systemId}`);
    }

    const params = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: token.refreshToken,
    });

    const tokenResponse = await this._requestToken(params);

    await this._prismaService.enphaseToken.update({
      where: { systemId },
      data: this._mapTokenResponse(tokenResponse),
    });

    this._logger.log(`Refreshed access token for system ${systemId}`);

    return tokenResponse.access_token;
  }

  async getValidAccessToken(systemId: number): Promise<string> {
    const token = await this._prismaService.enphaseToken.findUnique({ where: { systemId } });
    if (!token) {
      throw new Error(`No Enphase token found for system ${systemId}`);
    }

    const fiveMinutesMs = 5 * 60 * 1000;
    if (token.expiresAt.getTime() - Date.now() < fiveMinutesMs) {
      return this.refreshAccessToken(systemId);
    }

    return token.accessToken;
  }

  async storeTokens(systemId: number, tokens: EnphaseTokens): Promise<void> {
    await this._prismaService.enphaseToken.upsert({
      where: { systemId },
      create: { systemId, ...tokens },
      update: tokens,
    });

    this._logger.log(`Stored tokens for system ${systemId}`);
  }

  private async _requestToken(params: URLSearchParams): Promise<EnphaseTokenResponse> {
    const basicAuth = Buffer.from(`${this._clientId}:${this._clientSecret}`).toString('base64');

    const { data } = await firstValueFrom(
      this._httpService.post<EnphaseTokenResponse>(`${ENPHASE_TOKEN_URL}?${params.toString()}`, null, {
        headers: { Authorization: `Basic ${basicAuth}` },
      }),
    );

    return data;
  }

  private _mapTokenResponse(response: EnphaseTokenResponse): EnphaseTokens {
    return {
      accessToken: response.access_token,
      refreshToken: response.refresh_token,
      expiresAt: new Date(Date.now() + response.expires_in * 1000),
    };
  }
}
