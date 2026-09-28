import axios from 'axios';

export async function getKeycloakToken(): Promise<string> {
  const tokenUrl = `${process.env['OIDC_ISSUER_URL']}/protocol/openid-connect/token`;

  const params = new URLSearchParams({
    grant_type: 'password',
    // The web client: its tokens carry the audience the API expects.
    client_id: process.env['OIDC_AUDIENCE']!,
    username: process.env['KEYCLOAK_TEST_USER']!,
    password: process.env['KEYCLOAK_TEST_PASSWORD']!,
  });

  const res = await axios.post(tokenUrl, params.toString(), {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });

  return res.data.access_token;
}
