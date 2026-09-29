# Déploiement

**Quand** : chaque fusion dans `main` (dev) et chaque release (prod).
**Risque** : faible en dev, moyen en prod.

Le déploiement passe par le dépôt GitOps `simoncamilotti/infra` : la CI y met à jour le tag des
images, ArgoCD applique le changement dans le cluster.

## Prérequis (en place)

- Le dossier `apps/solar-monitor/` du dépôt GitOps, avec ses overlays `dev` et `prod`.
- La variable de dépôt `GITOPS_DEPLOY` vaut `true` : sans elle, la CI construit et publie les
  images mais ne déploie pas.
- Les secrets de l'application dans Infisical (projet `homelab`, dossier `/solar-monitor`) :
  `DB_PASSWORD`, `ENPHASE_CLIENT_ID`, `ENPHASE_CLIENT_SECRET`, `ENPHASE_API_KEY` et
  `ENPHASE_TOKEN_ENCRYPTION_KEY`. L'API refuse de démarrer sans eux. Pas de secret SMTP : le
  projet n'envoie pas d'e-mail.
- Les secrets `GITOPS_PAT` et `SLACK_WEBHOOK_URL` sur le dépôt
  (`gh starter sync-secrets` les remet à jour depuis Infisical).
- Les autres variables de l'API et du web (voir `.env.example`) sont dans les manifestes GitOps :
  `OIDC_ISSUER_URL` et `OIDC_AUDIENCE` (client `solar-monitor` du realm `homelab`), `CORS_ORIGINS`,
  `ENPHASE_REDIRECT_URI` par overlay, `TZ=Etc/UTC`.

## Dev

Automatique à chaque fusion dans `main` :

1. la CI construit les images `ghcr.io/<dépôt>/api` et `ghcr.io/<dépôt>/web`, taguées
   `main-<run>` ;
2. elle modifie `apps/solar-monitor/overlays/dev` dans le dépôt GitOps et pousse ;
3. ArgoCD remplace le pod de l'API (stratégie `Recreate` : une seule instance, courte coupure) ;
   le conteneur applique les migrations avant de démarrer ([migrations](database-migrations.md)).
   Un message part sur Slack.

## Prod

1. Vérifier que la CI de `main` est verte et que dev fonctionne.
2. Créer la release :

   ```sh
   gh release create v1.2.0 --generate-notes
   ```

3. La CI construit les images taguées `1.2.0` et met à jour l'overlay `prod`.
4. Suivre la synchronisation dans ArgoCD ; un message part sur Slack.

Numérotation : majeure pour un changement incompatible (API publique, données), mineure pour
une fonctionnalité, correctif sinon.

## Changer la configuration

Les manifestes de `apps/solar-monitor/base` servent aux deux environnements, et la prod tourne sur
la dernière release pendant que dev suit `main`. Une modification de la base atteint donc la
prod tout de suite, avec son ancienne image. Pour renommer ou supprimer une variable dont l'API
a besoin, procéder en deux temps, comme pour une [migration](database-migrations.md#changements-incompatibles) :

1. ajouter la nouvelle variable à côté de l'ancienne, dans une PR GitOps fusionnée **avant** la
   PR du projet qui la lit ;
2. une fois la release qui la lit déployée en prod, retirer l'ancienne variable.

En cours : `KEYCLOAK_*` → `OIDC_*` pour l'API, `/config.js` monté → variables `WEB_*` pour le
web. La seconde étape attend la prochaine release (simoncamilotti/infra#98).

Une nouvelle variable obligatoire suit le même ordre : la PR GitOps d'abord. Seule une valeur
qui diffère vraiment entre les environnements va dans un patch de l'overlay (`overlays/dev`
ou `overlays/prod`), jamais une valeur qui attend une release.

## Vérifier

- `GET /api/health/ready` répond `200`.
- Les pods de l'API et du web sont `Ready` dans ArgoCD.

## Revenir en arrière

- **Prod** : dans le dépôt GitOps, annuler le commit `deploy(prod): …` (`git revert`), ou
  remettre le tag de la version précédente dans `overlays/prod`. ArgoCD redéploie l'ancienne image.
- La base GitOps doit toujours convenir à la version précédente : c'est ce que garantit le
  changement de configuration en deux temps.
- Une migration déjà appliquée n'est **pas** annulée : l'ancienne version doit rester
  compatible avec le nouveau schéma ([migrations](database-migrations.md#changements-incompatibles)).
