const mockKeycloakInstance = {
  init: vi.fn().mockResolvedValue(true),
  login: vi.fn().mockResolvedValue(undefined),
  logout: vi.fn().mockResolvedValue(undefined),
  updateToken: vi.fn().mockResolvedValue(true),
  authenticated: false,
  token: 'mock-token',
  onTokenExpired: null as (() => void) | null,
  onAuthSuccess: null as (() => void) | null,
  onAuthRefreshSuccess: null as (() => void) | null,
};

vi.mock('keycloak-js', () => ({
  default: vi.fn(function () {
    return mockKeycloakInstance;
  }),
}));

const authOptions = { realm: 'test-realm', clientId: 'test-client', url: 'http://localhost:8080' };

describe('auth module', () => {
  beforeEach(() => {
    vi.resetModules();
    mockKeycloakInstance.init.mockReset().mockResolvedValue(true);
    mockKeycloakInstance.login.mockReset().mockResolvedValue(undefined);
    mockKeycloakInstance.logout.mockReset().mockResolvedValue(undefined);
    mockKeycloakInstance.updateToken.mockReset().mockResolvedValue(true);
    mockKeycloakInstance.authenticated = false;
    mockKeycloakInstance.token = 'mock-token';
    mockKeycloakInstance.onTokenExpired = null;
    mockKeycloakInstance.onAuthSuccess = null;
    mockKeycloakInstance.onAuthRefreshSuccess = null;
    sessionStorage.clear();
  });

  describe('initAuth', () => {
    it('should initialize keycloak with correct options', async () => {
      const Keycloak = (await import('keycloak-js')).default;
      const { initAuth } = await import('./auth');

      await initAuth(authOptions);

      expect(Keycloak).toHaveBeenCalledWith({
        realm: 'test-realm',
        clientId: 'test-client',
        url: 'http://localhost:8080',
      });
    });

    it('should call keycloak.init with check-sso', async () => {
      const { initAuth } = await import('./auth');

      await initAuth(authOptions);

      expect(mockKeycloakInstance.init).toHaveBeenCalledWith({
        checkLoginIframe: false,
        onLoad: 'login-required',
        pkceMethod: 'S256',
      });
    });

    it('should return the authenticated status', async () => {
      const { initAuth } = await import('./auth');

      const result = await initAuth(authOptions);

      expect(result).toBe(true);
    });

    it('should return false when not authenticated', async () => {
      mockKeycloakInstance.init.mockResolvedValue(false);
      const { initAuth } = await import('./auth');

      const result = await initAuth(authOptions);

      expect(result).toBe(false);
    });

    it('should throw if called twice', async () => {
      const { initAuth } = await import('./auth');

      await initAuth(authOptions);

      expect(() => initAuth(authOptions)).toThrow('Keycloak client is already initialized');
    });

    it('should register onTokenExpired callback that refreshes token', async () => {
      const { initAuth } = await import('./auth');

      await initAuth(authOptions);
      mockKeycloakInstance.onTokenExpired!();

      expect(mockKeycloakInstance.updateToken).toHaveBeenCalledWith(30);
    });

    it('should store token in sessionStorage on auth success', async () => {
      const { initAuth } = await import('./auth');

      await initAuth(authOptions);
      mockKeycloakInstance.onAuthSuccess!();

      const storedToken = sessionStorage.getItem(`${window.location.host}-auth_token`);
      expect(storedToken).toBe('mock-token');
    });

    it('should update token in sessionStorage on auth refresh', async () => {
      const { initAuth } = await import('./auth');

      await initAuth(authOptions);
      mockKeycloakInstance.token = 'refreshed-token';
      mockKeycloakInstance.onAuthRefreshSuccess!();

      const storedToken = sessionStorage.getItem(`${window.location.host}-auth_token`);
      expect(storedToken).toBe('refreshed-token');
    });

    it('should not store token if token is undefined', async () => {
      const { initAuth } = await import('./auth');

      await initAuth(authOptions);
      mockKeycloakInstance.token = undefined;
      mockKeycloakInstance.onAuthSuccess!();

      const storedToken = sessionStorage.getItem(`${window.location.host}-auth_token`);
      expect(storedToken).toBeNull();
    });
  });

  describe('login', () => {
    it('should call keycloak.login with redirectUri', async () => {
      const { initAuth, login } = await import('./auth');

      await initAuth(authOptions);
      login('http://localhost/callback');

      expect(mockKeycloakInstance.login).toHaveBeenCalledWith({
        redirectUri: 'http://localhost/callback',
      });
    });

    it('should call keycloak.login without redirectUri', async () => {
      const { initAuth, login } = await import('./auth');

      await initAuth(authOptions);
      login();

      expect(mockKeycloakInstance.login).toHaveBeenCalledWith({
        redirectUri: undefined,
      });
    });
  });

  describe('logout', () => {
    it('should call keycloak.logout and remove stored token', async () => {
      const { initAuth, logout } = await import('./auth');

      await initAuth(authOptions);
      sessionStorage.setItem(`${window.location.host}-auth_token`, 'some-token');
      logout('http://localhost');

      expect(mockKeycloakInstance.logout).toHaveBeenCalledWith({
        redirectUri: 'http://localhost',
      });
      expect(sessionStorage.getItem(`${window.location.host}-auth_token`)).toBeNull();
    });
  });

  describe('isAuthenticated', () => {
    it('should return keycloak.authenticated value', async () => {
      const { initAuth, isAuthenticated } = await import('./auth');

      await initAuth(authOptions);
      mockKeycloakInstance.authenticated = true;

      expect(isAuthenticated()).toBe(true);
    });

    it('should return false when not authenticated', async () => {
      const { initAuth, isAuthenticated } = await import('./auth');

      await initAuth(authOptions);

      expect(isAuthenticated()).toBe(false);
    });
  });

  describe('removeStoredToken', () => {
    it('should remove token from sessionStorage', async () => {
      const { removeStoredToken } = await import('./auth');
      const key = `${window.location.host}-auth_token`;

      sessionStorage.setItem(key, 'test-token');
      removeStoredToken();

      expect(sessionStorage.getItem(key)).toBeNull();
    });
  });

  describe('redirect URL management', () => {
    it('should store and retrieve redirect URL', async () => {
      const { setRedirectUrl, getRedirectUrl } = await import('./auth');

      setRedirectUrl('http://localhost/dashboard');

      expect(getRedirectUrl()).toBe('http://localhost/dashboard');
    });

    it('should return null when no redirect URL is stored', async () => {
      const { getRedirectUrl } = await import('./auth');

      expect(getRedirectUrl()).toBeNull();
    });

    it('should remove redirect URL', async () => {
      const { setRedirectUrl, removeRedirectUrl, getRedirectUrl } = await import('./auth');

      setRedirectUrl('http://localhost/dashboard');
      removeRedirectUrl();

      expect(getRedirectUrl()).toBeNull();
    });
  });
});
