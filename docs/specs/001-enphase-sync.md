# 001 — Synchronisation Enphase

- **Issue** : #52 (reprise de l'existant)
- **Mise à jour** : 2026-09-29

> Une spec décrit la fonctionnalité **telle qu'elle est construite** : elle évolue avec le code,
> dans les mêmes PR.

## Résumé

L'application collecte chaque jour la production, la consommation, l'import et l'export
d'électricité du foyer depuis l'[API Enphase v4](https://developer-v4.enphase.com). Le compte
Enphase est lié une fois par OAuth2. Ensuite, une tâche quotidienne récupère la veille, et la page
Paramètres montre la couverture de l'historique et permet de combler les trous.

## Parcours utilisateur

1. L'utilisateur ouvre `/api/enphase/authorize` : l'API le redirige vers la page d'autorisation
   Enphase.
2. Enphase le renvoie sur `/api/enphase/callback` : l'API échange le code contre des jetons,
   récupère les systèmes du compte et enregistre les jetons du premier système, chiffrés.
3. Chaque jour, à l'heure choisie (UTC), l'API récupère les données de la veille pour chaque
   système lié.
4. Dans Paramètres, l'utilisateur voit pour chaque système la date du dernier jour stocké, le
   nombre de jours stockés face au nombre attendu, et chaque trou de l'historique.
5. Il peut lancer une synchronisation manuelle (la veille), importer tout l'historique (système
   encore vide), combler un trou précis, ou changer l'heure de la tâche quotidienne.

## Critères d'acceptation

- [x] Étant donné un compte lié, quand l'heure de synchronisation arrive, alors les données de la
      veille de chaque système sont enregistrées (un jour déjà présent est remplacé).
- [x] Étant donné un historique avec des jours manquants, quand la page Paramètres s'affiche,
      alors chaque trou apparaît avec ses bornes et son nombre de jours, avec un bouton Combler.
- [x] Étant donné un système sans données, quand l'utilisateur choisit l'import complet, alors
      l'historique est importé du 2015-01-01 à la veille.
- [x] Étant donné une heure hors de `00:00`–`23:59`, quand elle est envoyée à l'API, alors la
      réponse est `400` et rien n'est enregistré.
- [x] Étant donné trois rattrapages dans l'heure, quand un quatrième est demandé, alors l'API
      répond `429`.

## Hors périmètre

- Plusieurs comptes Enphase ou plusieurs foyers : un seul foyer par conception.
- Des données plus fines que le jour.
- Un rattrapage automatique des trous : il consomme le quota mensuel d'Enphase, il reste une
  action de l'utilisateur.

## Notes techniques

### Endpoints

| Endpoint                         | Accès  | Rôle                                                                              |
| -------------------------------- | ------ | --------------------------------------------------------------------------------- |
| `GET /api/enphase/authorize`     | Public | Redirection vers l'autorisation Enphase (hors client généré)                      |
| `GET /api/enphase/callback`      | Public | Retour OAuth2, enregistrement des jetons (hors client généré)                     |
| `GET /api/enphase/all`           | Jeton  | Tout l'historique, en kWh, du plus ancien au plus récent                          |
| `GET /api/enphase/sync-status`   | Jeton  | Par système : dernier jour, jours stockés, jours attendus, trous                  |
| `POST /api/enphase/sync`         | Jeton  | Synchronisation de la veille (`{ systemId }`)                                     |
| `POST /api/enphase/backfill`     | Jeton  | Rattrapage d'une période (`{ systemId, startDate, endDate }`), 3 appels par heure |
| `GET /api/enphase/sync-schedule` | Jeton  | Heure de la tâche quotidienne                                                     |
| `PUT /api/enphase/sync-schedule` | Jeton  | Change l'heure (`{ syncTime: "HH:mm" }`) et replanifie la tâche sans redémarrage  |

Chaque rattrapage consomme 4 appels du quota mensuel d'Enphase : d'où la limite de 3 par heure,
en plus de la limite globale de 100 requêtes par minute.

### Données

| Modèle                | Contenu                                                           |
| --------------------- | ----------------------------------------------------------------- |
| `EnphaseToken`        | Jetons OAuth2 d'un système, chiffrés (AES-256-GCM)                |
| `EnphaseLifetimeData` | Un jour d'un système : Wh produits, consommés, importés, exportés |
| `SyncSchedule`        | Heure de la tâche quotidienne, `02:00` par défaut                 |

Les jours sont stockés à minuit UTC (`@db.Date`) et exposés en `yyyy-MM-dd`. Le web les lit avec
`parseISO`, jamais `new Date(str)`, qui décalerait d'un jour à l'ouest de Greenwich.

La couverture se calcule entre le premier et le dernier jour stockés : un jour manqué par la
tâche quotidienne (panne, jeton expiré, API indisponible) ne se rattrape pas seul, mais apparaît
comme un trou.

### Tâches planifiées

| Quand                                         | Tâche                                            |
| --------------------------------------------- | ------------------------------------------------ |
| Chaque jour à l'heure de `SyncSchedule` (UTC) | Données de la veille pour chaque système lié     |
| Toutes les 6 heures                           | Rafraîchit les jetons qui expirent dans les 12 h |

Les tâches tournent dans le processus de l'API : une seule réplique
([ADR 0001](../adr/0001-starter-deviations.md)).

### Configuration

`ENPHASE_CLIENT_ID`, `ENPHASE_CLIENT_SECRET`, `ENPHASE_API_KEY`, `ENPHASE_REDIRECT_URI` et
`ENPHASE_TOKEN_ENCRYPTION_KEY` (32 octets en hexadécimal : `openssl rand -hex 32`). Perdre ou
changer la clé rend les jetons stockés illisibles : il faut alors relier le compte
([runbook](../runbooks/enphase.md)).
