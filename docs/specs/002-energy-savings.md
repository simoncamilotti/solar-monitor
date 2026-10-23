# 002 — Valorisation en euros

- **Issue** : #67
- **Mise à jour** : 2026-10-23

> Une spec décrit la fonctionnalité **telle qu'elle est construite** : elle évolue avec le code,
> dans les mêmes PR.

## Résumé

Le tableau de bord traduit les kWh en euros. À partir du prix du kWh acheté et du kWh revendu, il
répond pour toute période à la question du foyer : combien l'installation rapporte-t-elle ?

- **Économie** : l'énergie produite et consommée sur place, au prix d'achat :
  `(produit − exporté) × prix d'achat`. C'est la facture évitée.
- **Revente** : l'énergie exportée, au tarif de rachat : `exporté × tarif de rachat`.
- **Gain total** : économie + revente.
- **Retour sur investissement** : le gain cumulé depuis le premier jour stocké, rapporté au coût
  de l'installation, avec une date de rentabilité estimée.

Les prix changent dans le temps : le tarif réglementé évolue chaque année, le contrat de rachat
est fixé à la signature. Chaque tarif a donc une **date d'effet**, et un jour est valorisé au tarif
en vigueur ce jour-là.

## Parcours utilisateur

1. Sans tarif, le tableau de bord affiche une invitation à les renseigner, avec un lien vers le
   paramétrage.
2. Dans Paramétrage, section **Tarifs**, l'utilisateur ajoute un tarif : type (achat ou rachat),
   prix en €/kWh, date d'effet. Il peut supprimer un tarif saisi par erreur.
3. Section **Installation**, il saisit le coût total de l'installation, ou vide le champ pour
   l'effacer.
4. Le tableau de bord affiche l'économie, la revente et le gain total de la période choisie, avec
   leur variation par rapport à la période précédente.
5. Si le coût est connu, une carte montre la part amortie et la date de rentabilité.

## Critères d'acceptation

- [x] Étant donné aucun tarif saisi, quand j'ouvre le tableau de bord, alors aucune carte en euros
      ne s'affiche et un lien invite à les renseigner dans le paramétrage.
- [x] Étant donné un tarif d'achat et un tarif de rachat, quand je choisis une période, alors le
      tableau de bord affiche l'économie, la revente et le gain total de cette période, avec la
      variation par rapport à la période précédente.
- [x] Étant donné deux tarifs d'achat (0,20 € puis 0,25 € au 2025-02-01), quand la période couvre
      janvier et février 2025, alors janvier est valorisé à 0,20 € et février à 0,25 €.
- [x] Étant donné des jours antérieurs au premier tarif d'un type, quand ils sont dans la période,
      alors ils ne sont pas valorisés pour ce type, et le tableau de bord indique combien de jours
      sont dans ce cas.
- [x] Étant donné un coût d'installation, quand j'ouvre le tableau de bord, alors je vois la part
      amortie et la date de rentabilité estimée (ou atteinte).
- [x] Étant donné un tarif du même type déjà en vigueur au même jour, quand j'en ajoute un second,
      alors l'API répond `409` et le paramétrage l'explique.
- [x] Les montants suivent la langue : `1 234,56 €` en `fr`, `€1,234.56` en `en`.

## Hors périmètre

- **Heures pleines et heures creuses** : les données sont journalières, on ne sait pas à quelle
  heure l'énergie a été achetée.
- **Abonnement, taxes, TVA séparée** : seul le prix du kWh varie avec la production. Le prix saisi
  est celui que paie (ou reçoit) réellement le foyer, toutes taxes comprises.
- **L'énergie importée** n'est pas valorisée : elle est payée avec ou sans panneaux, elle ne dit
  rien de ce que rapporte l'installation.
- **Plusieurs devises** : l'euro seulement.

## Notes techniques

### Endpoints

| Endpoint                          | Rôle                                                                        |
| --------------------------------- | --------------------------------------------------------------------------- |
| `GET /api/pricing/tariffs`        | Tous les tarifs, par type puis par date d'effet croissante                  |
| `POST /api/pricing/tariffs`       | Ajoute un tarif (`{ kind, pricePerKwh, effectiveFrom }`) ; `409` si doublon |
| `DELETE /api/pricing/tariffs/:id` | Supprime un tarif ; `204`, ou `404` s'il n'existe pas                       |
| `GET /api/pricing/installation`   | Coût de l'installation (`{ cost }`, `null` tant qu'il n'est pas saisi)      |
| `PUT /api/pricing/installation`   | Enregistre ou efface le coût                                                |

`kind` vaut `purchase` (achat) ou `feedIn` (rachat). Toutes les routes exigent un jeton.

### Données

| Modèle         | Contenu                                                                                  |
| -------------- | ---------------------------------------------------------------------------------------- |
| `Tariff`       | Type, prix en €/kWh (`DECIMAL(8,5)`), date d'effet (`DATE`), unique par type et par jour |
| `Installation` | Une seule ligne (`id = 'default'`, comme `SyncSchedule`) : coût en € (`DECIMAL(12,2)`)   |

Les montants sont stockés en **`DECIMAL`**, pas en flottant ni en entiers de millièmes :

- un tarif se lit et se saisit en euros avec quatre ou cinq décimales (`0,2516 €`) ; `DECIMAL`
  le conserve tel quel, sans l'arrondi binaire d'un flottant ni la conversion d'une unité
  artificielle ;
- l'API écrit le prix à partir de son texte décimal (`Prisma.Decimal`), donc `0.2516` est stocké
  `0.2516` ;
- le contrat limite le prix à cinq décimales et le coût au centime, comme les colonnes.

Le JSON transporte des nombres : le calcul se fait côté web en virgule flottante, sur des kWh qui
sont eux-mêmes des flottants, et l'affichage arrondit au centime. L'écart est très inférieur au
centime sur des années d'historique.

### Calcul

Le web calcule tout, à partir de l'historique déjà chargé pour le tableau de bord
(`apps/web/src/modules/savings/savings-computation.ts`) :

- le tarif d'un jour est le dernier tarif du même type dont la date d'effet est antérieure ou
  égale à ce jour ;
- la période et la période précédente sont celles des cartes KPI ; la durée d'exploitation n'a
  pas de période précédente ;
- la date de rentabilité est le jour où le gain cumulé atteint le coût, s'il est atteint ; sinon,
  elle est estimée au rythme moyen des 365 derniers jours stockés, pour que les saisons se
  compensent. Sans gain, aucune date n'est estimée.
