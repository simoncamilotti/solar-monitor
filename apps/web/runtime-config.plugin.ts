import { readFileSync } from 'node:fs';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { loadEnv, type Plugin } from 'vite';

/**
 * Development and preview servers only: serves `/config.js` from `config.js.template` and
 * the `WEB_*` variables (environment first, then the root `.env`), like the container
 * entrypoint does in production.
 */
export function runtimeConfig(): Plugin {
  const serveConfig = (mode: string) => {
    const env = { ...loadEnv(mode, '../..', 'WEB_'), ...process.env };
    const template = readFileSync(new URL('config.js.template', import.meta.url), 'utf8');
    const script = template.replace(/\$\{(\w+)\}/g, (_, name: string) => env[name] ?? '');
    return (_request: IncomingMessage, response: ServerResponse) => {
      response.setHeader('Content-Type', 'text/javascript');
      response.setHeader('Cache-Control', 'no-store');
      response.end(script);
    };
  };

  return {
    name: 'runtime-config',
    configureServer(server) {
      server.middlewares.use('/config.js', serveConfig(server.config.mode));
    },
    configurePreviewServer(server) {
      server.middlewares.use('/config.js', serveConfig(server.config.mode));
    },
  };
}
