# Migrations de la base de données

**Quand** : le schéma Prisma change (`apps/api/prisma/schema.prisma`).
**Risque** : moyen en production (données existantes).

Les migrations sont des fichiers SQL versionnés dans `apps/api/prisma/migrations/`, générés
en local et appliqués tels quels dans chaque environnement.

## Créer une migration

1. Modifier `apps/api/prisma/schema.prisma`.
2. Générer la migration contre la base locale (services de `pnpm dev` démarrés) :

   ```sh
   pnpm nx run api:migrate-dev --name=add-user-avatar
   ```

   Prisma écrit `prisma/migrations/<horodatage>_add-user-avatar/migration.sql`, l'applique
   et régénère le client.

3. Relire le SQL : renommage de colonne vu comme une suppression suivie d'un ajout, colonne
   `NOT NULL` sans valeur par défaut sur une table remplie, index sur une grosse table.
   Corriger le fichier à la main si besoin, avant de le commiter.
4. Commiter le schéma et le dossier de migration dans la même PR que le code qui s'en sert.

Une migration fusionnée dans `main` ne se modifie plus : corriger par une nouvelle migration.

## Changements incompatibles

L'ancienne version de l'API tourne encore pendant le déploiement. Pour supprimer ou renommer
une colonne, procéder en deux versions :

1. ajouter la nouvelle structure, écrire dans les deux, migrer les données ;
2. dans une version suivante, retirer l'ancienne structure.

## Appliquer

| Environnement | Comment                                                                                                 |
| ------------- | ------------------------------------------------------------------------------------------------------- |
| Local         | `pnpm dev` applique les migrations en attente (`api:migrate-deploy`)                                    |
| e2e           | La préparation des tests applique les migrations sur `E2E_DATABASE_URL`                                 |
| dev, prod     | Au démarrage du conteneur de l'API : `apps/api/entrypoint.sh` lance `prisma migrate deploy`, puis l'API |

Écart temporaire au starter, qui passe par un Job Kubernetes
([ADR 0001](../adr/0001-starter-deviations.md)).

## Remettre à zéro la base locale

```sh
pnpm nx run api:migrate-reset
```

Supprime toutes les données locales, réapplique les migrations.

## Si une migration échoue en dev ou en prod

Le conteneur de l'API s'arrête avant de démarrer l'API et Kubernetes le relance en boucle
(`CrashLoopBackOff`) : pendant ce temps, l'API est indisponible.

1. Lire les logs du pod de l'API (`kubectl logs`, ou ArgoCD).
2. Corriger la base à la main si la migration s'est arrêtée à mi-chemin (PostgreSQL exécute
   chaque migration dans une transaction, ce cas reste rare).
3. Marquer l'état de la migration si besoin :
   `prisma migrate resolve --rolled-back <migration>` depuis un pod de l'image de l'API.
4. Livrer une correction par une nouvelle migration, ou revenir à l'image précédente
   ([déploiement](deployment.md#revenir-en-arrière)) si la migration n'a rien appliqué.
