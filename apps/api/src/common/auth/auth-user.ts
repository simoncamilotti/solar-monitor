import type { JWTPayload } from 'jose';

/** The authenticated caller, read from the claims of the access token. */
export interface AuthUser {
  /** `sub` claim: stable identifier at the identity provider. */
  subject: string;
  email: string;
  name: string;
  locale: string | undefined;
  roles: string[];
}

/**
 * Maps standard OIDC claims. Roles come from a top-level `roles` claim, filled by a mapper
 * at the identity provider: the code does not depend on Keycloak's token layout.
 */
export function toAuthUser(payload: JWTPayload): AuthUser {
  const claim = (name: string) =>
    typeof payload[name] === 'string' ? (payload[name] as string) : undefined;
  const roles = Array.isArray(payload['roles'])
    ? payload['roles'].filter((role): role is string => typeof role === 'string')
    : [];
  return {
    subject: payload.sub ?? '',
    email: claim('email') ?? '',
    name: claim('name') ?? claim('preferred_username') ?? '',
    locale: claim('locale'),
    roles,
  };
}
