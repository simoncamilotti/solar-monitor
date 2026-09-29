# 0001 — Écarts au starter

- **Statut** : Accepté
- **Date** : 2026-09-29

## Contexte

solar-monitor existait avant monorepo-starter. Il a été aligné à la main sur la v1.0.2
(issue #52), au plus près du starter. Certains choix du starter ne conviennent pas au projet,
ou pas encore : cet ADR les recense, pour qu'un report d'une version suivante du starter
([guide](../guides/update-from-starter.md)) ne les écrase pas.

Les ADR cités sont ceux du starter :
[`starter/adr/`](https://github.com/simoncamilotti/monorepo-starter/tree/v1.0.2/starter/adr).

## Décision

### Écarts permanents

| Sujet                    | Starter                                                    | solar-monitor                                                                                                          | Raison                                                                                                                                        |
| ------------------------ | ---------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| E-mails                  | Module `mail`, React Email, `SMTP_URL`, Mailpit            | Aucun module e-mail ; pas de variable SMTP. Mailpit reste dans `docker-compose.yml`, inutilisé                         | L'application n'envoie aucun e-mail. `@repo/e2e-support` n'a pas non plus sa partie Mailpit                                                   |
| Tables Prisma            | Tables et colonnes en snake_case (`@@map`, `@map`)         | Noms des modèles (`"User"`, `"EnphaseLifetimeData"`…)                                                                  | Renommer les tables d'une base en production pour une question de style ne vaut pas le risque                                                 |
| Rôles                    | `@Roles()` et claim `roles`                                | Décorateur présent, aucun rôle utilisé                                                                                 | Un seul foyer, un seul compte Enphase : pas de partitionnement par utilisateur ni de rôles                                                    |
| Fuseau horaire           | —                                                          | `TZ=Etc/UTC` obligatoire (l'API refuse de démarrer sinon)                                                              | Les jours sont stockés à minuit UTC et la synchronisation quotidienne raisonne en jours UTC                                                   |
| Réplicas de l'API        | Sans état                                                  | **Une seule** réplique                                                                                                 | La synchronisation Enphase et le rafraîchissement des jetons sont des tâches cron dans le processus : deux réplicas les lanceraient deux fois |
| Listes dans les réponses | `@ResponseSchema(schema)`                                  | En plus : `@ResponseListSchema(itemSchema)`                                                                            | Nest sérialise un tableau élément par élément : `@ResponseSchema(z.array(…))` donne une erreur 500. À proposer au starter                     |
| Formulaires              | react-hook-form avec les schémas de `@repo/contracts`      | État contrôlé simple                                                                                                   | Les formulaires se résument à une heure et à des sélecteurs de dates                                                                          |
| Thème                    | Palette neutre, police Geist, échelle d'arrondis de shadcn | Palette violette, police Inter, arrondis de Tailwind, redéfinis dans `apps/web/src/styles.css` au-dessus de `@repo/ui` | Identité visuelle existante de l'application ; la lib n'est pas modifiée                                                                      |
| Composants               | Écrans construits avec `@repo/ui`                          | Écrans existants stylés à la main ; les nouveaux partent de `@repo/ui`                                                 | Réécrire les écrans existants changerait le rendu sans rien apporter à l'utilisateur                                                          |
| nginx                    | Sans compression                                           | `gzip` activé                                                                                                          | Les morceaux ECharts et ag-grid pèsent plusieurs centaines de ko                                                                              |
| Données e2e              | Uniques par test                                           | Utilisateurs uniques par test ; historique Enphase **fixe et partagé** (`ENPHASE_FIXTURE`), qu'aucun test ne modifie   | L'application lit tous les jours stockés du foyer : ils ne peuvent pas être propres à un test. Fixe, l'historique garde les captures stables  |
| Régression visuelle      | —                                                          | Captures Playwright des quatre pages, en clair et en sombre, générées dans l'image Playwright                          | Ajout du projet : le rendu des graphiques ne se vérifie pas autrement                                                                         |
| PostgreSQL               | 18                                                         | 17, en local et en production                                                                                          | Version de la production. La montée de version est une opération à part (sauvegarde, `pg_upgrade` ou restauration)                            |
| Licence                  | `UNLICENSED`                                               | MIT                                                                                                                    | Projet public de démonstration                                                                                                                |

### Écarts temporaires

À retirer une fois la release suivante déployée en production (simoncamilotti/infra#98) :

| Sujet                | Starter                                | solar-monitor aujourd'hui                                                                                         | Fin prévue                                                                                                     |
| -------------------- | -------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Configuration du web | `/config.js` généré depuis les `WEB_*` | L'image garde un `/config.js` monté quand aucune variable `WEB_*` n'est fournie (`apps/web/docker-entrypoint.sh`) | Quand les manifestes GitOps passent les `WEB_*` : retirer le cas du fichier monté                              |
| Migrations           | Job Kubernetes séparé (ADR 0010)       | `prisma migrate deploy` au démarrage de l'API (`apps/api/entrypoint.sh`)                                          | Quand le Job de migration existe dans le dépôt GitOps : retirer `entrypoint.sh`, reprendre le `CMD` du starter |

## Conséquences

- Un report du starter doit vérifier chaque fichier touché contre ce tableau : garder la
  valeur du projet, ou retirer la ligne ici si l'écart disparaît.
- Tant que les migrations tournent au démarrage de l'API, une migration ratée fait redémarrer
  l'API en boucle ; l'ancienne version ne continue pas de tourner comme avec le Job.
- L'API ne peut pas passer à plusieurs réplicas sans sortir les tâches planifiées du processus
  (CronJob Kubernetes ou verrou en base). Son déploiement GitOps est en `Recreate` pour la même
  raison : jamais deux instances, au prix d'une courte coupure à chaque mise à jour.
