# Instructions pour les agents

Monorepo Nx (pnpm) : API NestJS (`apps/api`), web React (`apps/web`), libs `@repo/*`. L'API collecte
chaque jour les données de production et de consommation solaire depuis l'API Enphase v4.
Vue d'ensemble : [docs/architecture.md](docs/architecture.md). Règles de contribution :
[CONTRIBUTING.md](CONTRIBUTING.md). Écarts au starter : [ADR 0001](docs/adr/0001-starter-deviations.md).

**Un seul foyer par conception** : un compte Enphase, un historique. `User` ne garde que l'identité
OIDC ; pas de données par utilisateur ni de rôles. N'en introduire que sur demande.

## Environnement

- Node 24 (`.nvmrc`) et pnpm via corepack. Toujours passer par Nx : `pnpm nx <cible> <projet>`.
- `pnpm dev` : services docker-compose, migrations, API et web. Ports dans `.env`.
- Avant de rendre la main : `pnpm nx affected -t lint typecheck test` ; `pnpm knip` si des
  exports ou dépendances ont changé.
- Filtrer un test : `pnpm nx test api -- --run <motif>` (Vitest, argument positionnel),
  `pnpm nx e2e web-e2e -- --grep "<nom>"` (Playwright).

## Langues

- Français : documentation (`README.md`, `docs/`), ADR, specs, issues.
- Anglais : code, commentaires, noms de fichiers, commits, PR.
- Textes affichés : i18n uniquement, en `fr` et `en`, jamais en dur.

## Règles de travail

- Commits Conventional Commits sur une ligne ; jamais de poussée sur `main` : branche et PR.
- Une PR qui change une structure, un endpoint, une variable d'environnement ou un
  comportement met à jour la doc dans la même PR : README, `.env.example`, `docs/`.
- Une décision d'architecture s'écrit en ADR (`docs/adr/`, modèle `_template.md`) ; un nouvel
  écart au starter s'ajoute à l'ADR 0001.
- Aucune mention d'outils d'IA dans les commits, issues et PR.
- Code métier dans les apps, par domaine (`src/modules/<domaine>/`). Une lib seulement si un
  deuxième projet en a besoin ou pour imposer une frontière.
- Nouveau module d'API ou nouvelle lib : générateurs du plugin local,
  `pnpm nx g @repo/workspace-plugin:api-module <nom>` et `…:lib <nom> --scope=<shared|web|api>`
  ([guides](docs/guides/)).
- Fichiers et dossiers en kebab-case, y compris les composants React.
- ESM partout : imports relatifs avec l'extension `.js` (même pour un fichier `.ts`). Une lib
  s'importe par son nom de paquet, sans alias de chemin.

## Pièges

### Dépendances

- Versions dans le catalogue de `pnpm-workspace.yaml` (`catalogMode: strict`) : ajouter la
  version au catalogue, puis `"catalog:"` dans le `package.json`.
- `minimumReleaseAge` : une version publiée depuis moins de 3 jours est refusée. Choisir la
  précédente, ne pas désactiver le réglage.
- Un paquet avec script d'installation doit figurer dans `allowBuilds`.
- L'image de l'API est un `pnpm deploy --prod` de `@repo/api`, buildé par SWC sans vérification
  de types : une dépendance d'exécution absente de `apps/api/package.json` n'échoue qu'au
  démarrage du conteneur. Après un changement de dépendance, construire l'image et la démarrer.

### API

- Toute route exige un jeton : `@Public()` pour l'ouvrir. `@CurrentUser()` donne l'appelant.
- Validation et sérialisation par les schémas Zod de `@repo/contracts` :
  `@Query({ schema })`, `@Body({ schema })`, `@ResponseSchema(schema)`. Une liste passe par
  `@ResponseListSchema(itemSchema)`, jamais `@ResponseSchema(z.array(…))` (500). Pas de
  class-validator.
- Erreurs : exceptions Nest, rendues en Problem Details par le filtre global.
- Nouvelle variable d'environnement : `src/config/env.ts` **et** `.env.example`. Les services la
  lisent par `ConfigService<Env, true>`, jamais `process.env`.
- L'API refuse de démarrer hors `TZ=Etc/UTC`. Les jours sont stockés à minuit UTC et exposés en
  `yyyy-MM-dd` ; le web les lit avec `parseISO` de `date-fns`, jamais `new Date(str)`, qui les
  décale d'un jour à l'ouest de Greenwich.
- Schéma Prisma modifié : `pnpm nx run api:migrate-dev --name=<slug>`, relire le SQL
  ([runbook](docs/runbooks/database-migrations.md)). Le client Prisma est généré dans
  `apps/api/src/generated/prisma` (non versionné) : l'importer de là, jamais de `@prisma/client`.
- Nest 12 est ESM uniquement : les tests tournent sous Vitest avec `unplugin-swc`, sans lequel
  `emitDecoratorMetadata` disparaît et l'injection casse. Ne pas le retirer.
- Les tâches planifiées (synchronisation Enphase, rafraîchissement des jetons) tournent dans le
  processus : l'API reste à une seule réplique.

### Web

- Client de l'API généré par orval dans `@repo/api-client` (non versionné) : après un
  changement d'endpoint, `pnpm nx run @repo/api-client:codegen`. Ne jamais l'écrire à la main.
- Routes fichiers dans `src/routes/` ; `route-tree.gen.ts` est généré et versionné. Les pages qui
  demandent une connexion sont sous `routes/_authenticated/`.
- Composants shadcn dans `libs/web/ui` : imports relatifs à l'intérieur de la lib. La palette,
  la police et les arrondis du projet sont dans `apps/web/src/styles.css`, jamais dans la lib.
- Clés i18n typées : `src/i18n/locales/fr.ts` les définit, `en.ts` est typé contre lui. Une clé
  construite à l'exécution passe par un utilitaire typé (`monthKey()` de `src/i18n/keys.ts`).
- Configuration d'exécution dans `/config.js` (`src/config/config.ts`), pas de `import.meta.env`.
- Tests de composants avec les mocks MSW générés, jamais contre la vraie API.
- Un paquet CommonJS importé par défaut peut arriver en objet dans le build Vite (erreur React
  #130) : `echarts-for-react` est importé depuis son build ESM (`echarts-for-react/esm/core.js`).
- `apps/web/nginx.conf` n'a pas de règle `/api` : en production, le routage dépend d'une règle
  d'Ingress du dépôt GitOps.

### Tests e2e

- Vraie base (`E2E_DATABASE_URL`), faux émetteur OIDC, un utilisateur unique par test
  (`uniqueUser`) : ne jamais vider la base.
- L'historique Enphase est le jeu fixe `ENPHASE_FIXTURE` de `@repo/e2e-support`, partagé par tous
  les tests : aucun test ne doit écrire de données Enphase ni l'heure de synchronisation, sinon
  les captures de la suite suivante changent. Seule une panne que la vraie pile ne sait pas
  produire reste simulée par `page.route`.
- Les captures de régression visuelle se génèrent dans l'image Playwright
  (`mcr.microsoft.com/playwright:<version>-noble`), jamais sur l'hôte : polices et champ horaire
  natif diffèrent (l'image affiche `02:00 AM` quelle que soit la langue de la page).
- Les deux suites partagent des ports fixes : ne pas les lancer en parallèle.

### Services locaux

- Keycloak est stocké dans PostgreSQL (base `keycloak`) et importe `docker/keycloak/realm.json`
  quand le realm manque. L'export ne contient aucun utilisateur : les créer avec `kcadm.sh`
  (README). Sur un volume PostgreSQL antérieur à `docker/postgres/init/`, créer une fois à la main
  les bases `keycloak` et `<POSTGRES_DB>_e2e`.

# General Guidelines for working with Nx

- For navigating/exploring the workspace, invoke the `nx-workspace` skill first - it has patterns for querying projects, targets, and dependencies
- When running tasks (for example build, lint, test, e2e, etc.), always prefer running the task through `nx` (i.e. `nx run`, `nx run-many`, `nx affected`) instead of using the underlying tooling directly
- Prefix nx commands with the workspace's package manager (e.g., `pnpm nx build`, `npm exec nx test`) - avoids using globally installed CLI
- You have access to the Nx MCP server and its tools, use them to help the user
- For Nx plugin best practices, check `node_modules/@nx/<plugin>/PLUGIN.md`. Not all plugins have this file - proceed without it if unavailable.
- NEVER guess CLI flags - always check nx_docs or `--help` first when unsure

## Scaffolding & Generators

- For scaffolding tasks (creating apps, libs, project structure, setup), ALWAYS invoke the `nx-generate` skill FIRST before exploring or calling MCP tools

## When to use nx_docs

- USE for: advanced config options, unfamiliar flags, migration guides, plugin configuration, edge cases
- DON'T USE for: basic generator syntax (`nx g @nx/react:app`), standard commands, things you already know
- The `nx-generate` skill handles generator discovery internally - don't call nx_docs just to look up generator syntax

<!-- nx configuration end-->
