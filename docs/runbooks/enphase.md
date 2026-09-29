# Compte et historique Enphase

**Quand** : premier déploiement, jetons Enphase illisibles ou révoqués, doute sur les données
stockées. **Durée** : quelques minutes. **Risque** : faible (le quota mensuel d'Enphase est la
seule ressource consommée).

## Prérequis

- Une application sur le [portail développeur Enphase](https://developer-v4.enphase.com/signup) :
  identifiant, secret et clé d'API.
- Les variables `ENPHASE_*` de l'environnement visé : `.env` en local, Infisical
  (`homelab`, `/solar-monitor`) et manifestes GitOps en dev et en prod.
  `ENPHASE_REDIRECT_URI` doit être déclarée telle quelle dans l'application Enphase.

## Lier le compte

1. Ouvrir `<API>/api/enphase/authorize` dans un navigateur (`http://localhost:3000` en local) et
   accepter sur la page Enphase.
2. Le retour sur `/api/enphase/callback` affiche le résultat en JSON : le système lié apparaît
   dans `systems`.
3. Dans Paramètres, le système apparaît avec « Jamais » comme dernière synchronisation :
   **Synchroniser**, puis dans le menu du bouton, importer l'historique complet.

Même procédure après une perte ou un changement de `ENPHASE_TOKEN_ENCRYPTION_KEY`, ou si
Enphase a révoqué l'accès : l'API ne sait plus lire ou rafraîchir les jetons (erreurs dans ses
logs à chaque synchronisation), relier le compte les remplace. L'historique stocké est conservé.

## Vérifier l'historique

```sh
pnpm nx run api:enphase-verify
```

Compare chaque jour stocké avec ce que l'API Enphase renvoie aujourd'hui pour la même période,
et signale les écarts. La commande lit l'historique sans l'écrire ; la seule écriture possible
est la rotation d'un jeton expiré, nécessaire pour appeler Enphase. Elle utilise la base et les
variables de `.env` : pour la prod, la lancer avec un `DATABASE_URL` et des `ENPHASE_*` de prod.

Elle cherche aussi un décalage **constant** : les jours stockés `D` qui correspondent aux jours
`D+k` d'Enphase trahissent un défaut d'alignement des dates plutôt qu'un changement de valeurs.
Le rapport donne alors la période de rattrapage qui réécrit les jours concernés. Code de sortie
`1` dès qu'un écart existe.

## Combler ou réécrire une période

- Un trou visible dans Paramètres : bouton **Combler** sur la ligne du trou.
- Une autre période (réécriture après `enphase-verify`) :

  ```sh
  curl -X POST <API>/api/enphase/backfill \
    -H "Authorization: Bearer <jeton>" -H 'Content-Type: application/json' \
    -d '{ "systemId": <id>, "startDate": "2024-05-01", "endDate": "2024-05-10" }'
  ```

Un rattrapage remplace les jours déjà présents. Limite : 3 par heure (`429` au-delà), chacun
consomme 4 appels du quota mensuel d'Enphase.

## Vérifier

- Paramètres : nombre de jours stockés égal au nombre attendu, aucun trou.
- `pnpm nx run api:enphase-verify` sort avec le code `0`.

## Revenir en arrière

Rien à annuler : les données viennent d'Enphase, un nouveau rattrapage les réécrit.
