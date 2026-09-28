export type WindowConfig = {
  auth: {
    /** The Keycloak realm that manages the set of users, credentials, roles, and groups.*/
    realm: string;
    /** The identifier of the client id inside the realm. */
    clientId: string;
    /** The base URL of the Keycloak server. */
    url: string;
  };
};

declare global {
  interface Window {
    config: WindowConfig;
    toggleDevTools: () => void;
  }
}
