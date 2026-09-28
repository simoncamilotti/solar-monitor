import './styles.css';
import './i18n/init-i18n.js';
import './modules/charts/init-echarts.js';

import ReactDOM from 'react-dom/client';
import { createBrowserRouter } from 'react-router';

import { App } from './app.js';
import { initAuth } from './modules/auth/auth.js';
import { routes } from './routes/routes.js';

if (!window.config?.auth) {
  throw new Error(
    'Missing config: public/config.js is not loaded. Copy config/web/config.example.js to apps/web/public/config.js and fill in the values.',
  );
}

initAuth({
  realm: window.config.auth.realm,
  clientId: window.config.auth.clientId,
  url: window.config.auth.url,
})
  .then(() => {
    const router = createBrowserRouter(routes);

    ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
      <App router={router} />,
    );
  })
  .catch((error) => {
    console.error(error);
  });
