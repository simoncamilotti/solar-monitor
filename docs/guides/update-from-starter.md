# Reporter une version du starter

Le projet est issu de `monorepo-starter` ; sa version est dans le `package.json` racine
(`starter.version`). Ce guide applique au projet les évolutions d'une version plus récente.

Le plugin Nx local (`tools/workspace-plugin`) se met à jour de la même façon.

## Étapes

1. **Lire le changelog** du starter entre la version du projet (`vA`) et la version cible
   (`vB`) : [`starter/CHANGELOG.md`](https://github.com/simoncamilotti/monorepo-starter/blob/main/starter/CHANGELOG.md).
   La section **Report** de chaque version liste les fichiers concernés et les étapes manuelles.
   Une version majeure demande une migration manuelle : la lire en entier avant de commencer.

2. **Ajouter le starter en remote** (une fois) et récupérer ses tags :

   ```sh
   git remote add starter https://github.com/simoncamilotti/monorepo-starter.git
   git fetch starter --tags
   ```

3. **Créer une branche** et appliquer le diff entre les deux versions, sans le dossier `starter/` :

   ```sh
   git switch -c chore/starter-vB
   git diff vA vB -- . ':!starter' | git apply -3
   ```

   Pour un report partiel, limiter le diff aux chemins de la section _Report_ :

   ```sh
   git diff vA vB -- .github/workflows apps/api/Dockerfile | git apply -3
   ```

4. **Résoudre les conflits** (`git status` les liste), puis suivre les étapes manuelles du changelog.
   Les fichiers que l'initialisation a personnalisés (`README.md`, `package.json`,
   `docker-compose.yml`, realm Keycloak) entrent souvent en conflit : garder les valeurs du projet.

5. **Vérifier** :

   ```sh
   pnpm install
   pnpm nx run-many -t lint typecheck test build e2e
   ```

6. **Mettre à jour la version** dans `package.json` (`"starter": { "version": "B" }`) et le
   lien de [architecture.md](../architecture.md#starter), puis commiter et ouvrir une PR :

   ```sh
   git commit -am "chore(starter): sync with vB"
   ```

## Pièges

- solar-monitor n'est **pas** issu d'un `gh starter new` : il a été aligné sur la v1.0.2 à la
  main (issue #52), sans l'historique du starter. `git apply -3` échoue donc presque toujours :
  appliquer le diff fichier par fichier, en gardant les écarts listés dans
  l'[ADR 0001](../adr/0001-starter-deviations.md).
- `git apply -3` a besoin que les fichiers d'origine existent dans l'historique du projet ;
  sinon il échoue sans rien appliquer. Appliquer alors le diff fichier par fichier, ou copier
  les nouveaux fichiers depuis `git show vB:<chemin>`.
- Le lockfile se régénère avec `pnpm install` : ne pas résoudre ses conflits à la main,
  prendre la version du projet puis relancer l'installation.
- Sauter plusieurs versions fonctionne, mais les étapes manuelles de **chaque** version
  intermédiaire restent à faire.

## Voir aussi

- [ADR 0012 du starter](https://github.com/simoncamilotti/monorepo-starter/blob/main/starter/adr/0012-project-initialization.md) :
  versions et procédure de report.
