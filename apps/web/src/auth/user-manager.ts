import { UserManager, WebStorageStateStore } from 'oidc-client-ts';
import type { AppConfig } from '../config/config.js';

/**
 * Standard OIDC client (ADR 0009): nothing here depends on Keycloak.
 * Shared by the React context and the API client, which reads the access token from it.
 */
export function createUserManager(config: AppConfig): UserManager {
  return new UserManager({
    authority: config.oidc.authority,
    client_id: config.oidc.clientId,
    redirect_uri: window.location.origin,
    post_logout_redirect_uri: window.location.origin,
    scope: 'openid profile email',
    userStore: new WebStorageStateStore({ store: window.sessionStorage }),
    automaticSilentRenew: true,
  });
}

/** Stored with the sign-in request, to come back to the page the user asked for. */
export interface SigninState {
  returnTo: string;
}
