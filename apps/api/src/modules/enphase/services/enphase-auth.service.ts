import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';

import { HttpService } from '@nestjs/axios';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

import { PrismaService } from '@/core';

import type { Env } from '../../../env';
import type { EnphaseTokenResponse, EnphaseTokens } from '../types/enphase.types';

const ENPHASE_AUTH_URL = 'https://api.enphaseenergy.com/oauth/authorize';
const ENPHASE_TOKEN_URL = 'https://api.enphaseenergy.com/oauth/token';
const STATE_TTL_MS = 10 * 60 * 1000; // 10 minutes

const ENCRYPTION_ALGORITHM = 'aes-256-gcm';
const ENCRYPTION_IV_LENGTH = 12;

@Injectable()
export class EnphaseAuthService {
  private readonly _logger = new Logger(EnphaseAuthService.name);

  private readonly _clientId: string;
  private readonly _clientSecret: string;
  private readonly _redirectUri: string;
  private readonly _encryptionKey: Buffer;

  /**
   * OAuth `state` values issued by {@link getAuthorizationUrl}, pending their callback.
   *
   * Lives in memory: a restart mid-flow forces the user to restart the link from
   * `/enphase/authorize`, and a second replica would not see states issued by the first. Both are
   * acceptable for a link flow triggered by hand, on demand, on the single-replica deployment this
   * project targets — the same trade-off already made for {@link _refreshesInFlight} below.
   */
  private readonly _pendingStates = new Map<string, number>();

  /**
   * In-flight refreshes, keyed by systemId.
   *
   * Enphase rotates refresh tokens: the one just used is invalidated. A sync fires four calls in
   * parallel and each of them needs a valid token, so near expiry all four triggered concurrent
   * refreshes — three of them spending an already-consumed refresh token and writing the invalid
   * result back to the database. Recovering meant re-linking the account by hand.
   *
   * Concurrent callers now share the same promise: one network round trip, one write. The map
   * lives in memory, so the guarantee holds within a single process — which matches the current
   * single-replica deployment.
   */
  private readonly _refreshesInFlight = new Map<number, Promise<string>>();

  constructor(
    private readonly _prismaService: PrismaService,
    private readonly _httpService: HttpService,
    configService: ConfigService<Env, true>,
  ) {
    this._clientId = configService.getOrThrow('ENPHASE_CLIENT_ID', { infer: true });
    this._clientSecret = configService.getOrThrow('ENPHASE_CLIENT_SECRET', { infer: true });
    this._redirectUri = configService.getOrThrow('ENPHASE_REDIRECT_URI', { infer: true });

    const encryptionKey = Buffer.from(configService.getOrThrow('ENPHASE_TOKEN_ENCRYPTION_KEY', { infer: true }), 'hex');
    if (encryptionKey.length !== 32) {
      throw new Error('ENPHASE_TOKEN_ENCRYPTION_KEY must decode to 32 bytes (a 64-character hex string)');
    }
    this._encryptionKey = encryptionKey;
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
    const inFlight = this._refreshesInFlight.get(systemId);
    if (inFlight) {
      return inFlight;
    }

    const refresh = this._refreshAccessToken(systemId).finally(() => this._refreshesInFlight.delete(systemId));
    this._refreshesInFlight.set(systemId, refresh);

    return refresh;
  }

  private async _refreshAccessToken(systemId: number): Promise<string> {
    const token = await this._prismaService.enphaseToken.findUnique({ where: { systemId } });
    if (!token) {
      throw new Error(`No Enphase token found for system ${systemId}`);
    }

    const params = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: this._decrypt(token.refreshToken),
    });

    const tokenResponse = await this._requestToken(params);

    await this._prismaService.enphaseToken.update({
      where: { systemId },
      data: this._encryptTokens(this._mapTokenResponse(tokenResponse)),
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

    return this._decrypt(token.accessToken);
  }

  async storeTokens(systemId: number, tokens: EnphaseTokens): Promise<void> {
    const encrypted = this._encryptTokens(tokens);

    await this._prismaService.enphaseToken.upsert({
      where: { systemId },
      create: { systemId, ...encrypted },
      update: encrypted,
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

  private _cleanExpiredStates(): void {
    const now = Date.now();
    for (const [state, createdAt] of this._pendingStates) {
      if (now - createdAt > STATE_TTL_MS) {
        this._pendingStates.delete(state);
      }
    }
  }

  /**
   * `accessToken` and `refreshToken` are the only fields at rest that grant lasting access to the
   * Enphase account — the refresh token in particular does not expire on any short horizon. This
   * service is the sole reader and writer of those two columns, so encryption is centralized here
   * rather than at the Prisma layer.
   */
  private _encryptTokens(tokens: EnphaseTokens): EnphaseTokens {
    return {
      ...tokens,
      accessToken: this._encrypt(tokens.accessToken),
      refreshToken: this._encrypt(tokens.refreshToken),
    };
  }

  private _encrypt(plaintext: string): string {
    const iv = randomBytes(ENCRYPTION_IV_LENGTH);
    const cipher = createCipheriv(ENCRYPTION_ALGORITHM, this._encryptionKey, iv);
    const ciphertext = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);

    return [iv, cipher.getAuthTag(), ciphertext].map(buffer => buffer.toString('hex')).join(':');
  }

  private _decrypt(stored: string): string {
    const [ivHex, authTagHex, ciphertextHex] = stored.split(':');
    const decipher = createDecipheriv(ENCRYPTION_ALGORITHM, this._encryptionKey, Buffer.from(ivHex, 'hex'));
    decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));

    return Buffer.concat([decipher.update(Buffer.from(ciphertextHex, 'hex')), decipher.final()]).toString('utf8');
  }
}
