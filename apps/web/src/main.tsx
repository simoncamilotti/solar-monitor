import './i18n/init-i18n';
import './app/modules/charts/init-echarts';

import ReactDOM from 'react-dom/client';
import { createBrowserRouter } from 'react-router';

import { App } from './app/App';
import { initAuth } from './app/modules/auth/auth';
import { routes } from './app/routes/routes';

if (!window.config?.auth) {
  throw new Error(
    'Missing config: public/config.js is not loaded. Copy public/config.example.js to public/config.js and fill in the values.',
  );
}

initAuth({
  realm: window.config.auth.realm,
  clientId: window.config.auth.clientId,
  url: window.config.auth.url,
})
  .then(() => {
    const router = createBrowserRouter(routes);

    ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(<App router={router} />);
  })
  .catch(error => {
    console.error(error);
  });
