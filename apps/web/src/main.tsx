import './styles.css';
import './i18n/init-i18n.js';
import './modules/charts/init-echarts.js';

import { configureApiClient } from '@repo/api-client';
import { createRoot } from 'react-dom/client';
import { AuthProvider } from 'react-oidc-context';

import { App } from './app.js';
import { createUserManager, type SigninState } from './auth/user-manager.js';
import { loadConfig } from './config/config.js';

const config = loadConfig();
const userManager = createUserManager(config);

configureApiClient({
  baseUrl: config.apiUrl,
  getAccessToken: async () => (await userManager.getUser())?.access_token,
});

const root = document.getElementById('root');
if (!root) {
  throw new Error('Missing #root element');
}

createRoot(root).render(
  <AuthProvider
    userManager={userManager}
    onSigninCallback={(user) => {
      // Removes the OIDC parameters from the URL and goes back to the requested page.
      const state = user?.state as SigninState | undefined;
      window.history.replaceState(null, '', state?.returnTo ?? '/');
    }}
  >
    <App />
  </AuthProvider>,
);
