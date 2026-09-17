# Solar Monitoring

Nx monorepo pairing a NestJS API with a React client, collecting daily solar production and
consumption data from the Enphase Developer API v4. Keycloak OIDC authentication, PostgreSQL via
Prisma, deployed through GitOps.

## Technical Stack

| Layer        | Technology                                             |
| :----------- | :----------------------------------------------------- |
| **Monorepo** | Nx 22, TypeScript 5.9                                  |
| **Backend**  | NestJS 11, Prisma 7, PostgreSQL 17                     |
| **Frontend** | React 19, Vite 7, TailwindCSS 3, ECharts 6, ag-grid 35 |
| **Shared**   | Zod 4 schemas shared between API and client            |
| **Auth**     | Keycloak (OIDC) — `keycloak-js` 26 on the client       |
| **i18n**     | i18next — French and English, French as fallback       |
| **Testing**  | Jest (API, libs), Vitest (web), Playwright (web E2E)   |
| **CI/CD**    | GitHub Actions, GHCR, GitOps (Kustomize)               |

## Architecture

```
apps/
  api/           NestJS API      (port 3000, prefix /api)
  web/           React client    (port 4200, proxies /api to :3000)
  api-e2e/       API E2E tests   (Jest)
  web-e2e/       Web E2E tests   (Playwright, incl. visual regression)

libs/
  api/core/      Global NestJS module: auth (JWT/Keycloak), Prisma, health, logging, throttling
  shared-models/ Zod schemas and DTOs shared between API and client
```

Frontend concerns that are sometimes expected in a library live under `apps/web/src`:

| Concern            | Location                                        |
| :----------------- | :---------------------------------------------- |
| Axios instance     | `apps/web/src/app/modules/api/axiosInstance.ts` |
| React Query client | `apps/web/src/app/modules/providers/`           |
| i18n setup         | `apps/web/src/i18n/`                            |
| Locale files       | `apps/web/src/i18n/locales/{en,fr}/web.json`    |

### Path Aliases (`tsconfig.base.json`)

| Alias             | Target                            |
| :---------------- | :-------------------------------- |
| `@/core`          | `libs/api/core/src/index.ts`      |
| `@/shared-models` | `libs/shared-models/src/index.ts` |

## Prerequisites

- Node.js 24 (see `.nvmrc`)
- Docker & Docker Compose
- npm

## Environment & Configuration

Copy `.env.example` to `.env`, then adjust:

| File                        | Value to update            | Description              |
| :-------------------------- | :------------------------- | :----------------------- |
| `.env`                      | `DB_NAME`                  | Database name            |
| `.env`                      | `DATABASE_URL`             | Full connection string   |
| `.env`                      | `CORS_ORIGINS`             | Comma-separated origins  |
| `.env`                      | `KEYCLOAK_CLIENT_ID`       | Keycloak client ID       |
| `.env`                      | `KEYCLOAK_ISSUER_URL`      | Keycloak realm URL       |
| `apps/web/public/config.js` | `realm`, `clientId`, `url` | Frontend Keycloak config |

The frontend config is runtime, not build-time: copy `config/web/config.example.js` to
`apps/web/public/config.js`. In production it is mounted as a volume, which is why nginx serves it
with `no-store`.

The API validates its environment at startup against a Zod schema (`apps/api/src/env.ts`) and
refuses to boot if anything is missing.

### CI/CD (GitHub Repository Settings)

| Type     | Name                 | Description                                                    |
| :------- | :------------------- | :------------------------------------------------------------- |
| Variable | `GITOPS_REPO`        | GitOps repository (e.g. `org/gitops`)                          |
| Variable | `DOCKER_MANUAL_ONLY` | Set to `true` to restrict Docker builds to manual trigger only |
| Secret   | `GITOPS_PAT`         | Personal access token for the GitOps repo                      |
| Secret   | `SLACK_WEBHOOK_URL`  | Slack incoming webhook for deploy notifications                |

## Main Commands

### Development

```bash
docker compose up -d           # Start infrastructure (Postgres, Keycloak)
npm run serve:api              # Start API
npm run serve:web              # Start Web
```

### Build, Lint & Format

```bash
npm run build:api / build:web / build:all
npm run lint:api  / lint:web  / lint:all
npm run format                 # Prettier via nx format
npm run format:check
```

### Tests

```bash
npm run test:api               # Jest
npm run test:web               # Vitest
npm run test:all

npm run e2e:api                # Jest — requires the API and its database running
npm run e2e:web                # Playwright
npm run e2e:web-ui             # Playwright UI mode
npm run e2e:web-update-snapshots
```

Run a single test file:

```bash
npx nx test api -- --testPathPattern=<pattern>
npx nx test web -- --run <pattern>
npx nx e2e web-e2e -- --grep "<test name>"
```

> `npm run typecheck:all` currently only covers `web`: the `api`, `core` and `shared-models`
> projects have no `typecheck` target yet.

### Database

```bash
npm run prisma:generate        # After any schema change
npm run prisma:migrate:dev     # Create or apply migrations (dev)
npm run prisma:migrate:deploy  # Apply migrations (prod)
npm run prisma:seed            # Idempotent default rows
npm run prisma:studio          # Database GUI
```

Schema: `libs/api/core/src/prisma/schema.prisma` · config: `prisma.config.ts` (repository root) ·
migrations: `libs/api/core/src/prisma/migrations/`.

Models: `User` (Keycloak identity), `SyncSchedule` (daily sync time), `EnphaseToken` (OAuth2
credentials per system), `EnphaseLifetimeData` (daily Wh readings).

## Enphase Solar Monitoring

Integration with the [Enphase Developer API v4](https://developer-v4.enphase.com) collecting daily
production, consumption, import and export data.

### Setup

1. Create an application on the [Enphase Developer Portal](https://developer-v4.enphase.com/signup)
2. Add the following to your `.env`:

```env
ENPHASE_CLIENT_ID=your_client_id
ENPHASE_CLIENT_SECRET=your_client_secret
ENPHASE_API_KEY=your_api_key
ENPHASE_REDIRECT_URI=http://localhost:3000/api/enphase/callback
```

3. Apply the migrations: `npm run prisma:migrate:deploy`
4. Start the API and open `http://localhost:3000/api/enphase/authorize` to link your Enphase
   account over OAuth2.

### API Endpoints

| Endpoint                         | Auth     | Description                                                       |
| :------------------------------- | :------- | :---------------------------------------------------------------- |
| `GET /health`                    | Public   | Health check (database, memory, disk) — outside the `/api` prefix |
| `GET /api/enphase/authorize`     | Public   | Redirects to the Enphase OAuth2 authorization page                |
| `GET /api/enphase/callback`      | Public   | Handles the OAuth2 callback and stores the tokens                 |
| `GET /api/enphase/all`           | Required | Returns the full daily history                                    |
| `GET /api/enphase/sync-status`   | Required | Last sync date and record count per system                        |
| `GET /api/enphase/sync`          | Required | Triggers a manual sync (`?system_id=`)                            |
| `GET /api/enphase/backfill`      | Required | Backfills history (`?system_id=&start_date=&end_date=`)           |
| `GET /api/enphase/sync-schedule` | Required | Returns the configured daily sync time                            |
| `PUT /api/enphase/sync-schedule` | Required | Updates the daily sync time (`{ "syncTime": "HH:mm" }`)           |

Every route is protected by a global JWT guard; public routes opt out with the `@Public()`
decorator. Rate limiting is global at 100 requests per 60 s. Swagger UI is served at `/docs`
outside production.

### Scheduled Tasks

| Schedule                                                        | Task                                                  |
| :-------------------------------------------------------------- | :---------------------------------------------------- |
| Daily, at the time held in `SyncSchedule` (default `02:00` UTC) | Fetch the previous day's data for every linked system |
| Every 6 hours                                                   | Refresh tokens expiring within the next 12 hours      |

The daily time is configurable from the Settings page and re-registers the cron job at runtime; it
is **not** hard-coded.

## Docker Infrastructure

| Service    | Port | Description        |
| :--------- | :--- | :----------------- |
| PostgreSQL | 5432 | Database           |
| Keycloak   | 8080 | OIDC/OAuth2 server |

## CI/CD

Two GitHub Actions workflows:

- **`main.yml`** — delegates to reusable workflows: `nx-ci` (lint, test, typecheck, build) on every
  push and pull request, then `docker` (build, push to GHCR, GitOps deploy via Kustomize) on `main`,
  on release, or on manual dispatch. Both jobs run on self-hosted runners with a remote BuildKit
  builder.
- **`dependency-update.yml`** — weekly patch and minor dependency updates, validated by E2E and
  visual regression runs before and after, opening a pull request with a report.

## Conventions

- **Documentation travels with the change.** Any modification to the project structure, to a path
  alias, or to an API endpoint updates this README **in the same pull request**. Every path, alias
  and endpoint quoted above is expected to exist in the repository.
- **Single user by design.** The application is built for one household and one Enphase account.
  The `User` model only records the Keycloak identity; there is no per-user data partitioning and
  no role model.
- **Issue references in pull requests.** Use `Closes #N` only on the pull request that completes an
  issue; use `Concerne #N` on the intermediate ones, since an issue usually spans several pull
  requests. Either keyword marks the issue `status: en cours` for as long as the pull request is
  open, and the label is removed when it closes.

## License

MIT — see [LICENSE](LICENSE).
