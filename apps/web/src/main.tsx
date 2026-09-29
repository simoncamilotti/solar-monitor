import './styles.css';
import './i18n/i18n.js';
import './modules/charts/init-echarts.js';

import { configureApiClient } from '@repo/api-client';
import { ThemeProvider } from '@repo/ui/components/theme-provider';
import { QueryClientProvider } from '@tanstack/react-query';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AuthProvider } from 'react-oidc-context';

import { App } from './app.js';
import { createUserManager, type SigninState } from './auth/user-manager.js';
import { loadConfig } from './config/config.js';
import { createQueryClient } from './modules/providers/query-client.js';

const config = loadConfig();
const userManager = createUserManager(config);

configureApiClient({
  baseUrl: config.apiUrl,
  getAccessToken: async () => (await userManager.getUser())?.access_token,
});

const queryClient = createQueryClient();

const root = document.getElementById('root');
if (!root) {
  throw new Error('Missing #root element');
}

createRoot(root).render(
  <StrictMode>
    <ThemeProvider defaultTheme="dark">
      <AuthProvider
        userManager={userManager}
        onSigninCallback={(user) => {
          // Removes the OIDC parameters from the URL and goes back to the requested page.
          const state = user?.state as SigninState | undefined;
          window.history.replaceState(null, '', state?.returnTo ?? '/');
        }}
      >
        <QueryClientProvider client={queryClient}>
          <App queryClient={queryClient} />
        </QueryClientProvider>
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>,
);
