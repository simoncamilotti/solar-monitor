# Solar Monitoring

Nx monorepo with a NestJS API, a React client, and shared libraries. Ready for Keycloak OIDC auth, PostgreSQL, and GitOps deployment.

## Technical Stack

| Layer        | Technology                         |
| :----------- | :--------------------------------- |
| **Monorepo** | Nx 22                              |
| **Backend**  | NestJS 11, Prisma 7, PostgreSQL 17 |
| **Frontend** | React 19, TailwindCSS, Radix UI    |
| **Auth**     | Keycloak 23 (OIDC)                 |
| **CI/CD**    | GitHub Actions, GitOps (Kustomize) |

## Architecture

```
apps/
  api/           -> NestJS API (port 3000, prefix /api)
  web/           -> React client (port 4200)
  api-e2e/       -> E2E Tests API (Jest)
  web-e2e/       -> E2E Tests Web (Playwright)

libs/
  api/core/      -> Global NestJS module (Prisma, Health, Logger, Auth, Throttler)
  shared-models/ -> Shared DTOs and Zod schemas
  shared-web/    -> Shared React utilities (React Query, Axios)
  i18n/          -> Internationalization (i18next)
```

## Prerequisites

- Node.js 24+
- Docker & Docker Compose
- npm

## Environment & Configuration

| File                        | Value to update            | Description              |
| :-------------------------- | :------------------------- | :----------------------- |
| `.env`                      | `DB_NAME`                  | Database name            |
| `.env`                      | `DATABASE_URL`             | Full connection string   |
| `.env`                      | `KEYCLOAK_CLIENT_ID`       | Keycloak client ID       |
| `.env`                      | `KEYCLOAK_ISSUER_URL`      | Keycloak realm URL       |
| `apps/web/public/config.js` | `realm`, `clientId`, `url` | Frontend Keycloak config |

### CI/CD (GitHub Repository Settings)

| Type     | Name                    | Description                                                    |
| :------- | :---------------------- | :------------------------------------------------------------- |
| Variable | `GITOPS_REPO`           | GitOps repository (e.g. `org/gitops`)                          |
| Variable | `DOCKER_MANUAL_ONLY`    | Set to `true` to restrict Docker builds to manual trigger only |
| Secret   | `GITOPS_PAT`            | Personal access token for GitOps repo                          |
| Secret   | `SLACK_WEBHOOK_URL`     | Slack incoming webhook for deploy notifications                |
| Secret   | `NX_CLOUD_ACCESS_TOKEN` | Nx Cloud access token (optional)                               |

### Nx Cloud

| File      | Value to update | Description                |
| :-------- | :-------------- | :------------------------- |
| `nx.json` | `nxCloudId`     | Your Nx Cloud workspace ID |

## Main Commands

### Development

```bash
docker compose up -d           # Start infrastructure (Postgres, Keycloak)
npm run serve:api              # Start API
npm run serve:web              # Start Web
```

### Build

```bash
npm run build:api              # Build API
npm run build:web              # Build Web
npm run build:all              # Build all
```

### Tests

```bash
npm run test:api               # API unit tests
npm run test:web               # Web unit tests
npm run test:all               # All unit tests

npm run e2e:api                # E2E tests API (Jest)
npm run e2e:web                # E2E tests Web (Playwright)
npm run e2e:web-ui             # E2E tests Web (Playwright UI mode)
```

### Lint & Format

```bash
npm run lint:api               # Lint API
npm run lint:web               # Lint Web
npm run lint:all               # Lint all
npm run format                 # Format code
```

### Database

```bash
npm run prisma:generate        # Generate Prisma client
npm run prisma:migrate:dev     # Create or apply migrations (dev)
npm run prisma:migrate:deploy  # Apply migrations (prod)
npm run prisma:studio          # Prisma Studio (DB GUI)
```

## Enphase Solar Monitoring

Integration with the [Enphase Developer API v4](https://developer-v4.enphase.com) to collect daily solar production, consumption, import, and export data.

### Setup

1. Create an application on the [Enphase Developer Portal](https://developer-v4.enphase.com/signup)
2. Add the following variables to your `.env`:

```env
ENPHASE_CLIENT_ID=your_client_id
ENPHASE_CLIENT_SECRET=your_client_secret
ENPHASE_API_KEY=your_api_key
ENPHASE_REDIRECT_URI=http://localhost:3000/api/enphase/callback
```

3. Apply the database migration:

```bash
npm run prisma:migrate:deploy
```

4. Start the API and navigate to `http://localhost:3000/api/enphase/authorize` to link your Enphase account via OAuth2.

### API Endpoints

| Endpoint                     | Auth     | Description                                                     |
| :--------------------------- | :------- | :-------------------------------------------------------------- |
| `GET /api/enphase/authorize` | Public   | Redirects to Enphase OAuth2 authorization page                  |
| `GET /api/enphase/callback`  | Public   | Handles OAuth2 callback and stores tokens                       |
| `GET /api/enphase/sync`      | Required | Triggers manual sync (`?system_id=`)                            |
| `GET /api/enphase/backfill`  | Required | Backfills historical data (`?system_id=&start_date=&end_date=`) |

### Automated Tasks

| Schedule       | Task                                                      |
| :------------- | :-------------------------------------------------------- |
| Every day 2 AM | Fetch previous day's lifetime data for all linked systems |
| Every 6 hours  | Proactively refresh tokens expiring within 12 hours       |

## Docker Infrastructure

| Service    | Port | Description        |
| :--------- | :--- | :----------------- |
| PostgreSQL | 5432 | Database           |
| Keycloak   | 8080 | OIDC/OAuth2 server |

## CI/CD

Two GitHub Actions workflows are included:

- **CI** (`ci.yml`): Runs lint, tests, typecheck and build on push to `main` and on pull requests.
- **Docker** (`docker.yml`): Builds and pushes Docker images to GHCR, then deploys via GitOps (Kustomize). Triggers on push to `main` (path-filtered), release, or manual dispatch. Set `DOCKER_MANUAL_ONLY=true` to restrict to manual trigger only.
