# Monitoring solaire

Suivi de la production et de la consommation solaires d'un foyer : chaque jour, l'API récupère
les données de l'installation depuis l'[API Enphase v4](https://developer-v4.enphase.com) ;
l'application web les présente en tableau de bord, comparaison de périodes et historique
exportable.

Monorepo Nx : une API NestJS, une application web React et leurs bibliothèques partagées, sur
le socle de [monorepo-starter](https://github.com/simoncamilotti/monorepo-starter) v1.0.2.
L'architecture est décrite dans [docs/architecture.md](docs/architecture.md).

| Couche    | Technologies                                                                                        |
| --------- | --------------------------------------------------------------------------------------------------- |
| Monorepo  | Nx 23, pnpm, TypeScript 6                                                                           |
| API       | NestJS 12, Prisma 7, PostgreSQL 17, Zod 4                                                           |
| Web       | React 19, Vite 8, TanStack Router et Query, Tailwind CSS 4, shadcn (Base UI), ECharts 6, ag-grid 35 |
| Auth      | OIDC (Keycloak) — `oidc-client-ts` côté web, `jose` côté API                                        |
| Tests     | Vitest, Playwright (e2e et régression visuelle)                                                     |
| Livraison | GitHub Actions, GHCR, GitOps (Kustomize, ArgoCD)                                                    |

## Démarrer

Prérequis : Node 24 ([`.nvmrc`](.nvmrc)), pnpm via corepack, Docker.

```sh
corepack enable
pnpm install
cp -n .env.example .env   # puis compléter les valeurs <replace_me>
pnpm dev
```

`pnpm dev` démarre PostgreSQL, Keycloak et Mailpit, applique les migrations, puis lance
l'API et le web en mode watch.

| Service            | Adresse                        | Accès                                     |
| ------------------ | ------------------------------ | ----------------------------------------- |
| Web                | http://localhost:4200          | utilisateur Keycloak à créer (ci-dessous) |
| API                | http://localhost:3000/api      |                                           |
| Référence de l'API | http://localhost:3000/api/docs | hors production                           |
| Keycloak (console) | http://localhost:8080          | `admin` / `admin`                         |

Les ports viennent de `.env` : changez-les pour faire tourner plusieurs projets côte à côte.
Arrêt des services : `docker compose down` (ajouter `-v` efface les données).

### Utilisateur local

Keycloak importe le realm `solar-monitor` depuis `docker/keycloak/realm.json`, sans utilisateur :
un export public n'a pas à contenir d'identifiants. En créer un au premier démarrage :

```sh
docker compose exec keycloak /opt/keycloak/bin/kcadm.sh config credentials \
  --server http://localhost:8080 --realm master --user admin --password admin
docker compose exec keycloak /opt/keycloak/bin/kcadm.sh create users \
  -r solar-monitor -s username=<utilisateur> -s enabled=true
docker compose exec keycloak /opt/keycloak/bin/kcadm.sh set-password \
  -r solar-monitor --username <utilisateur> --new-password <mot-de-passe>
```

Après une modification du realm dans la console, le réexporter pour qu'elle survive à une remise
à zéro :

```sh
docker compose exec keycloak /opt/keycloak/bin/kcadm.sh create \
  'realms/solar-monitor/partial-export?exportClients=true&exportGroupsAndRoles=true' -o \
  > docker/keycloak/realm.json
```

Sur un volume PostgreSQL antérieur à `docker/postgres/init/`, créer une fois les bases de
Keycloak et des e2e :

```sh
docker compose exec postgres sh -c 'createdb -U "$POSTGRES_USER" keycloak'
docker compose exec postgres sh -c 'createdb -U "$POSTGRES_USER" "${POSTGRES_DB}_e2e"'
```

### Compte Enphase

Renseigner les variables `ENPHASE_*` de `.env` (application du
[portail développeur Enphase](https://developer-v4.enphase.com/signup), clé de chiffrement par
`openssl rand -hex 32`), puis lier le compte en ouvrant
http://localhost:3000/api/enphase/authorize. Détails : [runbook Enphase](docs/runbooks/enphase.md).

## Commandes

| Commande                                                    | Rôle                                                                            |
| ----------------------------------------------------------- | ------------------------------------------------------------------------------- |
| `pnpm dev`                                                  | Environnement local complet                                                     |
| `pnpm nx run-many -t lint typecheck test`                   | Vérifications rapides                                                           |
| `pnpm nx run-many -t build`                                 | Builds de production                                                            |
| `pnpm nx e2e api-e2e`, puis `pnpm nx e2e web-e2e`           | Tests e2e contre la base `<db>_e2e`, jamais en parallèle                        |
| `pnpm nx e2e web-e2e -- --update-snapshots`                 | Régénérer les captures, dans l'image Playwright ([AGENTS](AGENTS.md))           |
| `pnpm nx affected -t lint typecheck test`                   | Vérifications limitées aux projets modifiés                                     |
| `pnpm nx run api:migrate-dev --name=<slug>`                 | Créer une migration après une modification du schéma                            |
| `pnpm nx run api:enphase-verify`                            | Comparer l'historique stocké avec Enphase ([runbook](docs/runbooks/enphase.md)) |
| `pnpm nx run @repo/api-client:codegen`                      | Régénérer le client de l'API (fait par les builds)                              |
| `pnpm nx g @repo/workspace-plugin:api-module <nom>`         | Nouveau module de l'API ([guide](docs/guides/add-api-module.md))                |
| `pnpm nx g @repo/workspace-plugin:lib <nom> --scope=shared` | Nouvelle lib ([guide](docs/guides/add-lib.md))                                  |
| `pnpm format`                                               | Formater tout le dépôt                                                          |
| `pnpm knip`                                                 | Fichiers, exports et dépendances inutilisés                                     |
| `pnpm nx graph`                                             | Graphe des projets                                                              |

Les tests e2e du web demandent Chromium : `pnpm --filter @repo/web-e2e exec playwright install chromium`.

## Structure

```
apps/
  api/        API NestJS            api-e2e/   tests e2e de l'API (Vitest)
  web/        application React     web-e2e/   tests e2e du web (Playwright, captures)
libs/
  shared/     contracts (schémas Zod), api-client (client généré)
  web/        ui (composants shadcn)
  api/        e2e-support (émetteur OIDC factice, démarrage de l'API, données Enphase fixes)
tools/        plugin Nx local (générateurs)
docker/       configuration des services locaux
docs/         documentation du projet
```

## Documentation

- [Index de la documentation](docs/README.md) : architecture, ADR, spec, runbooks, guides
- [Contribuer](CONTRIBUTING.md) : branches, commits, PR, fusion, releases

## Licence

MIT — voir [LICENSE](LICENSE).
