import Keycloak from 'keycloak-js';

const TOKEN_STORAGE_KEY = 'auth_token';
const REDIRECT_LOGIN_PATH = 'redirect_login_path';

let keycloak: Keycloak;

export type InitAuthOptions = {
  realm: string;
  clientId: string;
  url: string;
};

const getTokenStorageKey = (): string => {
  return `${window.location.host}-${TOKEN_STORAGE_KEY}`;
};

export const getStoredToken = (): string | null => {
  return window.sessionStorage.getItem(getTokenStorageKey());
};

const setStoredToken = (token: string): void => {
  window.sessionStorage.setItem(getTokenStorageKey(), token);
};

export const removeStoredToken = () => {
  window.sessionStorage.removeItem(getTokenStorageKey());
};

const getRedirectUrlStorageKey = (): string => {
  return `${window.location.host}-${REDIRECT_LOGIN_PATH}`;
};

export const getRedirectUrl = (): string | null => {
  return window.sessionStorage.getItem(getRedirectUrlStorageKey());
};

export const setRedirectUrl = (redirectUri: string) => {
  window.sessionStorage.setItem(getRedirectUrlStorageKey(), redirectUri);
};

export const removeRedirectUrl = () => {
  window.sessionStorage.removeItem(getRedirectUrlStorageKey());
};

export const initAuth: (options: InitAuthOptions) => Promise<boolean> = ({ realm, clientId, url }) => {
  if (keycloak != null) {
    throw new Error('Keycloak client is already initialized');
  }

  keycloak = new Keycloak({ realm, clientId, url });

  keycloak.onTokenExpired = () => {
    keycloak.updateToken(30).catch(() => {
      removeStoredToken();
      keycloak.login();
    });
  };

  keycloak.onAuthSuccess = () => {
    updateTokenInStorage(keycloak.token);
  };

  keycloak.onAuthRefreshSuccess = () => {
    updateTokenInStorage(keycloak.token);
  };

  return keycloak
    .init({
      onLoad: 'login-required',
      pkceMethod: 'S256',
      checkLoginIframe: false,
    })
    .then((authenticated: boolean) => authenticated);
};

export const login = (redirectUri?: string) => {
  return keycloak.login({ redirectUri });
};

export const logout = (redirectUri?: string) => {
  removeStoredToken();
  return keycloak.logout({ redirectUri });
};

export const isAuthenticated = () => {
  return keycloak.authenticated;
};

const updateTokenInStorage = (token?: string) => {
  if (token != null) {
    setStoredToken(token);
  }
};

export const getAuthenticatedUsername = () => {
  return `${keycloak.idTokenParsed?.given_name ?? ''} ${keycloak.idTokenParsed?.family_name ?? ''}`;
};
