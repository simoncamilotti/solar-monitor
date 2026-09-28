export type JWTPayload = {
  exp: number;
  iat: number;
  jti: string;
  iss: string;
  aud: string;
  sub: string;
  typ: string;
  azp: string;
  'allowed-origins': string[];
  realm_access: { roles: string[] };
  scope: string;
  sid: string;
  name: string;
  preferred_username: string;
  given_name: string;
  family_name: string;
  email: string;
};
