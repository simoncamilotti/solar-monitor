import { HttpService } from '@nestjs/axios';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { of } from 'rxjs';

import { PrismaService } from '@/core';

import type { EnphaseTokenResponse } from '../types/enphase.types';
import { EnphaseAuthService } from './enphase-auth.service';

const mockPrismaService = {
  enphaseToken: {
    findUnique: jest.fn(),
    update: jest.fn(),
    upsert: jest.fn(),
  },
};

const mockHttpService = {
  post: jest.fn(),
};

const TOKEN_RESPONSE: EnphaseTokenResponse = {
  access_token: 'new-access-token',
  refresh_token: 'new-refresh-token',
  expires_in: 86400,
  token_type: 'Bearer',
};

describe('EnphaseAuthService', () => {
  let service: EnphaseAuthService;

  beforeEach(async () => {
    jest.clearAllMocks();

    process.env['ENPHASE_CLIENT_ID'] = 'test-client-id';
    process.env['ENPHASE_CLIENT_SECRET'] = 'test-client-secret';
    process.env['ENPHASE_REDIRECT_URI'] = 'http://localhost:3000/enphase/callback';

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EnphaseAuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: HttpService, useValue: mockHttpService },
      ],
    }).compile();

    service = module.get<EnphaseAuthService>(EnphaseAuthService);
  });

  describe('getAuthorizationUrl', () => {
    it('should return a valid authorization URL with required params including state', () => {
      const url = service.getAuthorizationUrl();

      expect(url).toContain('https://api.enphaseenergy.com/oauth/authorize');
      expect(url).toContain('response_type=code');
      expect(url).toContain('client_id=test-client-id');
      expect(url).toContain(`redirect_uri=${encodeURIComponent('http://localhost:3000/enphase/callback')}`);
      expect(url).toContain('state=');
    });
  });

  describe('validateState', () => {
    it('should accept a valid state that was generated', () => {
      const url = service.getAuthorizationUrl();
      const state = new URL(url).searchParams.get('state')!;

      expect(() => service.validateState(state)).not.toThrow();
    });

    it('should reject an unknown state', () => {
      expect(() => service.validateState('unknown-state')).toThrow('Invalid or missing OAuth state parameter');
    });

    it('should reject undefined state', () => {
      expect(() => service.validateState(undefined as unknown as string)).toThrow(
        'Invalid or missing OAuth state parameter',
      );
    });

    it('should reject a state used twice', () => {
      const url = service.getAuthorizationUrl();
      const state = new URL(url).searchParams.get('state')!;

      service.validateState(state);
      expect(() => service.validateState(state)).toThrow('Invalid or missing OAuth state parameter');
    });
  });

  describe('exchangeCodeForTokens', () => {
    it('should exchange code and return mapped tokens', async () => {
      mockHttpService.post.mockReturnValue(of({ data: TOKEN_RESPONSE }));

      const result = await service.exchangeCodeForTokens('auth-code-123');

      expect(result.accessToken).toBe('new-access-token');
      expect(result.refreshToken).toBe('new-refresh-token');
      expect(result.expiresAt).toBeInstanceOf(Date);
      expect(mockHttpService.post).toHaveBeenCalledWith(
        expect.stringContaining('grant_type=authorization_code'),
        null,
        expect.objectContaining({
          headers: { Authorization: expect.stringContaining('Basic ') },
        }),
      );
    });

    it('should include authorization code in request params', async () => {
      mockHttpService.post.mockReturnValue(of({ data: TOKEN_RESPONSE }));

      await service.exchangeCodeForTokens('my-code');

      const calledUrl = mockHttpService.post.mock.calls[0][0] as string;
      expect(calledUrl).toContain('code=my-code');
    });
  });

  describe('refreshAccessToken', () => {
    it('should refresh and update token in database', async () => {
      const existingToken = {
        systemId: 42,
        accessToken: 'old-access',
        refreshToken: 'old-refresh',
        expiresAt: new Date(),
      };
      mockPrismaService.enphaseToken.findUnique.mockResolvedValue(existingToken);
      mockHttpService.post.mockReturnValue(of({ data: TOKEN_RESPONSE }));
      mockPrismaService.enphaseToken.update.mockResolvedValue({});

      const result = await service.refreshAccessToken(42);

      expect(result).toBe('new-access-token');
      expect(mockPrismaService.enphaseToken.update).toHaveBeenCalledWith({
        where: { systemId: 42 },
        data: expect.objectContaining({
          accessToken: 'new-access-token',
          refreshToken: 'new-refresh-token',
          expiresAt: expect.any(Date),
        }),
      });
    });

    it('should use refresh_token grant type', async () => {
      mockPrismaService.enphaseToken.findUnique.mockResolvedValue({
        systemId: 42,
        refreshToken: 'my-refresh-token',
        expiresAt: new Date(),
      });
      mockHttpService.post.mockReturnValue(of({ data: TOKEN_RESPONSE }));
      mockPrismaService.enphaseToken.update.mockResolvedValue({});

      await service.refreshAccessToken(42);

      const calledUrl = mockHttpService.post.mock.calls[0][0] as string;
      expect(calledUrl).toContain('grant_type=refresh_token');
      expect(calledUrl).toContain('refresh_token=my-refresh-token');
    });

    it('should throw if no token exists for system', async () => {
      mockPrismaService.enphaseToken.findUnique.mockResolvedValue(null);

      await expect(service.refreshAccessToken(999)).rejects.toThrow('No Enphase token found for system 999');
    });
  });

  describe('getValidAccessToken', () => {
    it('should return existing token if not expiring soon', async () => {
      const futureDate = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now
      mockPrismaService.enphaseToken.findUnique.mockResolvedValue({
        systemId: 42,
        accessToken: 'valid-token',
        refreshToken: 'refresh',
        expiresAt: futureDate,
      });

      const result = await service.getValidAccessToken(42);

      expect(result).toBe('valid-token');
      expect(mockHttpService.post).not.toHaveBeenCalled();
    });

    it('should refresh token if expiring within 5 minutes', async () => {
      const soonDate = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes from now
      mockPrismaService.enphaseToken.findUnique.mockResolvedValue({
        systemId: 42,
        accessToken: 'expiring-token',
        refreshToken: 'refresh',
        expiresAt: soonDate,
      });
      mockHttpService.post.mockReturnValue(of({ data: TOKEN_RESPONSE }));
      mockPrismaService.enphaseToken.update.mockResolvedValue({});

      const result = await service.getValidAccessToken(42);

      expect(result).toBe('new-access-token');
      expect(mockHttpService.post).toHaveBeenCalled();
    });

    it('should throw if no token exists for system', async () => {
      mockPrismaService.enphaseToken.findUnique.mockResolvedValue(null);

      await expect(service.getValidAccessToken(999)).rejects.toThrow('No Enphase token found for system 999');
    });
  });

  describe('storeTokens', () => {
    it('should upsert tokens for system', async () => {
      const tokens = {
        accessToken: 'access',
        refreshToken: 'refresh',
        expiresAt: new Date('2026-04-01'),
      };
      mockPrismaService.enphaseToken.upsert.mockResolvedValue({});

      await service.storeTokens(42, tokens);

      expect(mockPrismaService.enphaseToken.upsert).toHaveBeenCalledWith({
        where: { systemId: 42 },
        create: { systemId: 42, ...tokens },
        update: tokens,
      });
    });
  });
});
