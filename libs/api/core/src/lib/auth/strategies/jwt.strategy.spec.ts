import { AuthService } from '../services/auth.service';
import { JWTPayload } from '../types/jwt-payload.type';
import { JwtStrategy } from './jwt.strategy';

// Must be set before strategy construction
process.env['KEYCLOAK_ISSUER_URL'] = 'http://localhost:8080/realms/portfolio';

// Mock the external dependencies that the constructor uses
jest.mock('passport-jwt', () => ({
  ExtractJwt: {
    fromAuthHeaderAsBearerToken: jest.fn().mockReturnValue(() => null),
  },
  Strategy: class MockStrategy {
    name = 'jwt';
    constructor() {
      // noop
    }
  },
}));

jest.mock('jwks-rsa', () => ({
  passportJwtSecret: jest.fn().mockReturnValue(() => null),
}));

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let authService: AuthService;

  beforeEach(() => {
    authService = {
      getOrCreateUser: jest.fn(),
    } as unknown as AuthService;

    strategy = new JwtStrategy(authService);
  });

  const createPayload = (overrides: Partial<JWTPayload> = {}): JWTPayload => ({
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
    realm_access: { roles: ['USER', 'ADMIN'] },
    scope: '',
    sid: '',
    ...overrides,
  });

  describe('validate', () => {
    it('should call authService.getOrCreateUser with the payload', async () => {
      const payload = createPayload();
      (authService.getOrCreateUser as jest.Mock).mockResolvedValue({
        id: 'db-user-1',
      });

      await strategy.validate(payload);

      expect(authService.getOrCreateUser).toHaveBeenCalledWith(payload);
    });

    it('should return an AuthUser with mapped fields', async () => {
      const payload = createPayload();
      (authService.getOrCreateUser as jest.Mock).mockResolvedValue({
        id: 'db-user-1',
      });

      const result = await strategy.validate(payload);

      expect(result).toEqual({
        id: 'db-user-1',
        keycloakId: 'keycloak-id-123',
        email: 'test@example.com',
        username: 'testuser',
        firstName: 'Test',
        lastName: 'User',
        roles: ['USER', 'ADMIN'],
      });
    });

    it('should use dbUser.id, not the JWT sub, for the id field', async () => {
      const payload = createPayload({ sub: 'keycloak-uuid' });
      (authService.getOrCreateUser as jest.Mock).mockResolvedValue({
        id: 'prisma-uuid',
      });

      const result = await strategy.validate(payload);

      expect(result.id).toBe('prisma-uuid');
      expect(result.keycloakId).toBe('keycloak-uuid');
    });

    it('should handle missing realm_access with empty roles array', async () => {
      const payload = createPayload();
      // Simulate missing realm_access
      (payload as any).realm_access = undefined;
      (authService.getOrCreateUser as jest.Mock).mockResolvedValue({
        id: 'db-user-1',
      });

      const result = await strategy.validate(payload);

      expect(result.roles).toEqual([]);
    });

    it('should handle empty roles array', async () => {
      const payload = createPayload({
        realm_access: { roles: [] },
      });
      (authService.getOrCreateUser as jest.Mock).mockResolvedValue({
        id: 'db-user-1',
      });

      const result = await strategy.validate(payload);

      expect(result.roles).toEqual([]);
    });
  });
});
