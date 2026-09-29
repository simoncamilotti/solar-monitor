# Architecture

## Vue d'ensemble

```
            navigateur                                    serveur
┌──────────────────────────────┐   Bearer    ┌─────────────────────────────┐
│ apps/web                     │ ──────────▶ │ apps/api          /api/*    │──▶ PostgreSQL
│ React · TanStack Router/Query│   JSON      │ NestJS · Prisma             │
│ ECharts · ag-grid            │ ◀────────── │ tâches planifiées (cron)    │──▶ API Enphase v4
└──────────────┬───────────────┘             └──────────────┬──────────────┘    (OAuth2)
               │ OIDC (PKCE)                                │ JWKS (découverte)
               └──────────────▶  fournisseur OIDC  ◀────────┘
                                 (Keycloak : realm homelab en production)
```

Application **mono-foyer** : un compte Enphase, un historique. `User` ne garde que l'identité du
fournisseur OIDC ; il n'y a ni données par utilisateur ni rôles.

Monorepo Nx avec les workspaces pnpm : chaque app et chaque lib est un paquet `@repo/*`.
Le code métier vit dans les apps, organisé par domaine (`src/modules/<domaine>/`).
Un code passe dans `libs/` quand un deuxième projet en a besoin ou pour imposer une frontière.

## Projets

| Projet              | Chemin                   | Tags                            | Rôle                                                                           |
| ------------------- | ------------------------ | ------------------------------- | ------------------------------------------------------------------------------ |
| `api`               | `apps/api`               | `type:app` `platform:node`      | API REST NestJS, synchronisation Enphase                                       |
| `web`               | `apps/web`               | `type:app` `platform:browser`   | Application React (SPA) : tableau de bord, comparaison, historique, paramètres |
| `api-e2e`           | `apps/api-e2e`           | `type:e2e` `platform:node`      | Tests e2e de l'API (Vitest)                                                    |
| `web-e2e`           | `apps/web-e2e`           | `type:e2e` `platform:node`      | Tests e2e du web et régression visuelle (Playwright)                           |
| `@repo/contracts`   | `libs/shared/contracts`  | `type:lib` `platform:universal` | Schémas Zod partagés par l'API et le web                                       |
| `@repo/api-client`  | `libs/shared/api-client` | `type:lib` `platform:universal` | Client et mocks MSW générés depuis l'OpenAPI de l'API                          |
| `@repo/ui`          | `libs/web/ui`            | `type:lib` `platform:browser`   | Composants shadcn (Base UI), thème Tailwind de base                            |
| `@repo/e2e-support` | `libs/api/e2e-support`   | `type:lib` `platform:node`      | Émetteur OIDC factice, démarrage de l'API, données Enphase fixes               |

Frontières imposées par ESLint (`@nx/enforce-module-boundaries`) :

- une lib n'importe jamais une app ;
- `platform:universal` n'importe que `platform:universal` ;
- `platform:browser` n'importe jamais `platform:node` ;
- rien n'importe un projet `type:e2e`.

## Contrat entre l'API et le web

1. Les schémas Zod de `@repo/contracts` décrivent les entrées et les sorties.
2. L'API les applique : `@Query({ schema })` / `@Body({ schema })` valident les entrées,
   `@ResponseSchema(schema)` — ou `@ResponseListSchema(itemSchema)` pour une liste — filtre la
   réponse et la documente.
3. `nx run api:openapi` produit `apps/api/openapi.json` à partir de la build.
4. `nx run @repo/api-client:codegen` (orval) génère les hooks TanStack Query et les mocks MSW.
   Les fichiers générés ne sont pas versionnés : les builds les produisent.

Modifier un endpoint suffit : le client suit au prochain build, et TypeScript signale les
usages à adapter.

## API

| Sujet           | Mise en œuvre                                                                                                   |
| --------------- | --------------------------------------------------------------------------------------------------------------- |
| Configuration   | `.env` validé par Zod au démarrage (`src/config/env.ts`) ; l'API refuse de démarrer sinon, et hors `TZ=Etc/UTC` |
| Erreurs         | Problem Details (`application/problem+json`), y compris les erreurs de validation                               |
| Base de données | Prisma (`prisma/schema.prisma`), migrations versionnées dans `prisma/migrations/`                               |
| Enphase         | OAuth2, jetons chiffrés (AES-256-GCM), synchronisation quotidienne ([spec](specs/001-enphase-sync.md))          |
| Tâches          | `@nestjs/schedule` dans le processus : **une seule réplique**                                                   |
| Logs            | pino, JSON en production, lisibles en développement                                                             |
| Traces          | OpenTelemetry, actif si `OTEL_EXPORTER_OTLP_ENDPOINT` est défini                                                |
| Santé           | `/api/health/live` et `/api/health/ready` (base de données)                                                     |
| Sécurité        | helmet, CORS limité à `CORS_ORIGINS`, 100 requêtes par minute, 3 rattrapages Enphase par heure                  |
| Documentation   | `/api/docs` (Scalar) hors production                                                                            |

Les jours sont stockés à minuit UTC (`@db.Date`) et exposés en `yyyy-MM-dd` ; le web les lit
avec `parseISO`.

## Web

| Sujet         | Mise en œuvre                                                                                        |
| ------------- | ---------------------------------------------------------------------------------------------------- |
| Routage       | TanStack Router, routes fichiers dans `src/routes/` ; `route-tree.gen.ts` est versionné              |
| Données       | TanStack Query via le client généré                                                                  |
| Graphiques    | ECharts (`echarts-for-react`, build ESM) ; tableaux : ag-grid                                        |
| UI            | `@repo/ui` (shadcn, Base UI), Tailwind 4 ; palette, police et arrondis propres dans `src/styles.css` |
| i18n          | i18next, clés typées (`src/i18n/locales/`), français et anglais                                      |
| Configuration | `/config.js` généré au démarrage du conteneur : une même image pour tous les environnements          |

## Authentification

- Le web suit le flux OIDC Authorization Code avec PKCE (`oidc-client-ts`). La session est
  gardée dans `sessionStorage`. Les pages sous `routes/_authenticated/` redirigent vers le
  fournisseur, puis ramènent sur la page demandée.
- L'API vérifie les jetons d'accès (`jose`) avec les clés trouvées par découverte OIDC :
  émetteur `OIDC_ISSUER_URL`, audience `OIDC_AUDIENCE`.
- Toute route exige un jeton, sauf `@Public()` (santé, et les deux étapes du lien OAuth2 avec
  Enphase). `@CurrentUser()` donne l'appelant.
- Au premier appel de `/api/users/me`, l'API crée le compte local à partir des claims du jeton.
- Rien ne dépend de Keycloak : n'importe quel fournisseur OIDC convient. En local, le realm est
  importé depuis `docker/keycloak/realm.json`.

## Tests

| Niveau    | Outil      | Où                                                                           |
| --------- | ---------- | ---------------------------------------------------------------------------- |
| Unitaires | Vitest     | `*.spec.ts(x)` à côté du code ; le web simule l'API avec MSW                 |
| e2e API   | Vitest     | `apps/api-e2e` : API buildée, vraie base, faux émetteur OIDC                 |
| e2e web   | Playwright | `apps/web-e2e` : build de production du web contre l'API, captures visuelles |

Les e2e utilisent la base `E2E_DATABASE_URL` ; la base n'est jamais vidée. Chaque test se
connecte avec un utilisateur unique ; l'historique Enphase est un jeu fixe partagé, qu'aucun test
ne modifie ([ADR 0001](adr/0001-starter-deviations.md)). La session du navigateur est injectée à
partir d'un jeton du faux émetteur.

## Livraison

- CI ([`.github/workflows/main.yml`](../.github/workflows/main.yml)), par les workflows
  partagés `simoncamilotti/shared-workflows@v1` : lint, typecheck, test, build, knip, gitleaks,
  puis e2e. Projets modifiés seulement sur les PR, tout le dépôt sur `main`.
- Images `ghcr.io/simoncamilotti/solar-monitor/api` et `…/web`, déployées par GitOps
  ([runbook](runbooks/deployment.md)).

## Starter

Projet aligné sur [monorepo-starter](https://github.com/simoncamilotti/monorepo-starter) **v1.0.2**
(issue #52). Les choix de socle sont justifiés dans les
[ADR du starter](https://github.com/simoncamilotti/monorepo-starter/tree/v1.0.2/starter/adr).
Les décisions propres au projet, dont les écarts au starter, sont dans [adr/](adr/).
