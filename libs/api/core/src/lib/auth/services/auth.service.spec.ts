import { Test, TestingModule } from '@nestjs/testing';

import { PrismaService } from '../../prisma/services/prisma.service';
import { JWTPayload } from '../types/jwt-payload.type';
import { AuthService } from './auth.service';

const mockPrismaService = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
};

const jwtPayload: JWTPayload = {
  sub: 'keycloak-id-123',
  email: 'test@example.com',
  name: 'Test User',
  preferred_username: 'testuser',
  given_name: 'Test',
  family_name: 'User',
  exp: 0,
  iat: 0,
  jti: '',
  iss: '',
  aud: '',
  typ: '',
  azp: '',
  'allowed-origins': [],
  realm_access: { roles: ['USER'] },
  scope: '',
  sid: '',
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService, { provide: PrismaService, useValue: mockPrismaService }],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('getOrCreateUser', () => {
    it('should return existing user when found by keycloakId', async () => {
      const existingUser = {
        id: 'user-1',
        keycloakId: 'keycloak-id-123',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockPrismaService.user.findUnique.mockResolvedValue(existingUser);

      const result = await service.getOrCreateUser(jwtPayload);

      expect(result).toBe(existingUser);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { keycloakId: 'keycloak-id-123' },
      });
    });

    it('should create a new user when not found', async () => {
      const newUser = {
        id: 'user-2',
        keycloakId: 'keycloak-id-123',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue(newUser);

      const result = await service.getOrCreateUser(jwtPayload);

      expect(result).toBe(newUser);
      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: {
          keycloakId: 'keycloak-id-123',
        },
      });
    });

    it('should not call create when user exists', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'user-1',
        keycloakId: 'keycloak-id-123',
      });

      await service.getOrCreateUser(jwtPayload);

      expect(mockPrismaService.user.create).not.toHaveBeenCalled();
    });
  });
});
