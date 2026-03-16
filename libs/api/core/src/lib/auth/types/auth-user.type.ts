export type AuthUser = {
  id: string;
  keycloakId: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  roles: string[];
};
