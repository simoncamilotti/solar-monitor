import { randomBytes } from 'node:crypto';

import { HttpService } from '@nestjs/axios';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';

import { PrismaService } from '@/core';

import type { EnphaseTokenResponse, EnphaseTokens } from '../types/enphase.types';

const ENPHASE_AUTH_URL = 'https://api.enphaseenergy.com/oauth/authorize';
const ENPHASE_TOKEN_URL = 'https://api.enphaseenergy.com/oauth/token';
const STATE_TTL_MS = 10 * 60 * 1000; // 10 minutes

@Injectable()
export class EnphaseAuthService {
  private readonly _logger = new Logger(EnphaseAuthService.name);

  private readonly _clientId: string;
  private readonly _clientSecret: string;
  private readonly _redirectUri: string;

  private readonly _pendingStates = new Map<string, number>();

  constructor(
    private readonly _prismaService: PrismaService,
    private readonly _httpService: HttpService,
  ) {
    this._clientId = this._requireEnv('ENPHASE_CLIENT_ID');
    this._clientSecret = this._requireEnv('ENPHASE_CLIENT_SECRET');
    this._redirectUri = this._requireEnv('ENPHASE_REDIRECT_URI');
  }

  getAuthorizationUrl(): string {
    const state = randomBytes(32).toString('hex');
    this._pendingStates.set(state, Date.now());
    this._cleanExpiredStates();

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this._clientId,
      redirect_uri: this._redirectUri,
      state,
    });
    return `${ENPHASE_AUTH_URL}?${params.toString()}`;
  }

  validateState(state: string | undefined): void {
    if (!state || !this._pendingStates.has(state)) {
      throw new BadRequestException('Invalid or missing OAuth state parameter');
    }

    const createdAt = this._pendingStates.get(state)!;
    this._pendingStates.delete(state);

    if (Date.now() - createdAt > STATE_TTL_MS) {
      throw new BadRequestException('OAuth state has expired');
    }
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

  private _requireEnv(key: string): string {
    const value = process.env[key];
    if (!value) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
    return value;
  }

  private _cleanExpiredStates(): void {
    const now = Date.now();
    for (const [state, createdAt] of this._pendingStates) {
      if (now - createdAt > STATE_TTL_MS) {
        this._pendingStates.delete(state);
      }
    }
  }
}
