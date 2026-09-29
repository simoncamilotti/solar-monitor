# Ajouter une lib

Une lib se crée quand **un deuxième projet** a besoin du code, ou pour **imposer une frontière**.
Pas avant : le code métier reste dans les apps.

## Étapes

1. Choisir où le code s'exécute :

   | Scope    | Dossier        | Tag                  | Peut importer                |
   | -------- | -------------- | -------------------- | ---------------------------- |
   | `shared` | `libs/shared/` | `platform:universal` | les libs `shared` uniquement |
   | `web`    | `libs/web/`    | `platform:browser`   | `shared`, `web`              |
   | `api`    | `libs/api/`    | `platform:node`      | `shared`, `api`              |

2. Générer la lib :

   ```sh
   pnpm nx g @repo/workspace-plugin:lib billing --scope=shared
   ```

   Le paquet s'appelle `@repo/billing`. Le générateur ajoute la référence dans `tsconfig.json`
   et lance `pnpm install`.

3. La déclarer dans le `package.json` du projet qui l'utilise, puis `pnpm install` :

   ```json
   "dependencies": {
     "@repo/billing": "workspace:*"
   }
   ```

4. L'importer par son nom : `import { … } from '@repo/billing';`. Seul `src/index.ts` est
   exposé.
5. `pnpm nx sync` si Nx signale des références TypeScript manquantes.

## Pièges

- Une dépendance externe de la lib va dans **son** `package.json` (`"catalog:"`), pas à la racine.
- Les tests tournent dans Node : pour une lib `web` qui teste des composants, ajouter
  `jsdom` et passer `environment: 'jsdom'` dans son `vitest.config.ts`.
- ESLint refuse les imports qui franchissent une frontière (`@nx/enforce-module-boundaries`) :
  changer le scope de la lib plutôt que la règle.

## Voir aussi

- [Architecture : projets et frontières](../architecture.md#projets)
