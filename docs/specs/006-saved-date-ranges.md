# 006 — Plages de dates enregistrées

- **Issue** : #87
- **Mise à jour** : 2026-10-23

> Une spec décrit la fonctionnalité **telle qu'elle est construite** : elle évolue avec le code,
> dans les mêmes PR.

## Résumé

Une plage de dates libre ([005](005-custom-comparison-ranges.md)) se saisissait à chaque visite.
Le foyer garde désormais une **bibliothèque de plages nommées** (« Vacances 2025 », « Été
2024 »…), enregistrées en base et donc visibles depuis tous ses appareils. Une plage enregistrée
s'applique en un clic dans la comparaison et dans le mode « Personnalisé » du tableau de bord.

## Parcours utilisateur

1. **Comparaison**, mode « Plages » : l'utilisateur choisit des dates et un nom, puis clique sur
   **Enregistrer**. La plage rejoint la bibliothèque et s'ajoute à la comparaison.
2. **Tableau de bord**, mode « Personnalisé » : une fois la plage choisie, le menu **Plages
   enregistrées** propose de l'enregistrer sous un nom.
3. Dans les deux écrans, le menu **Plages enregistrées** liste la bibliothèque, de la plus récente
   à la plus ancienne. Un clic sur une plage l'ajoute à la comparaison, avec son nom, ou
   l'applique au tableau de bord.
4. Depuis ce menu, l'utilisateur renomme une plage (crayon) ou la supprime (corbeille).

## Critères d'acceptation

- [x] Étant donné une plage saisie avec un nom, quand je l'enregistre, alors elle rejoint la
      bibliothèque (nom, début, fin, bornes incluses).
- [x] Étant donné la bibliothèque, quand j'ouvre le menu des plages de la comparaison ou du mode
      « Personnalisé », alors les plages enregistrées s'y proposent, et un clic l'applique.
- [x] Je peux renommer ou supprimer une plage enregistrée.
- [x] Le nom est obligatoire, sans espaces de bord, et unique : un doublon répond `409` et l'écran
      l'explique. Le début précède ou égale la fin, sinon `400`.
- [x] Les plages sont communes au foyer : aucun lien à un utilisateur.
- [x] Supprimer une plage ne casse pas une comparaison déjà ouverte : l'URL garde les dates.

## Hors périmètre

- **Modifier les dates depuis l'écran** : l'API l'accepte (`PATCH`), l'interface ne propose que
  le renommage. Pour changer les dates, on enregistre une nouvelle plage.
- **Plages par utilisateur** : un seul foyer par conception (voir `AGENTS.md`).
- **Enregistrer une comparaison entière** (plusieurs périodes, grandeur, regroupement) : l'URL
  s'en charge déjà, en favori du navigateur.

## Notes techniques

### Endpoints

| Endpoint                      | Rôle                                                                           |
| ----------------------------- | ------------------------------------------------------------------------------ |
| `GET /api/date-ranges`        | Toutes les plages, par début décroissant puis par nom                          |
| `POST /api/date-ranges`       | Enregistre une plage (`{ name, startDate, endDate }`) ; `409` si le nom existe |
| `PATCH /api/date-ranges/:id`  | Renomme une plage ou change ses bornes (champs facultatifs) ; `409`, `404`     |
| `DELETE /api/date-ranges/:id` | Supprime une plage ; `204`, ou `404` si elle n'existe pas                      |

Les jours voyagent en `yyyy-MM-dd`. Un `PATCH` qui n'envoie qu'une borne est vérifié contre
l'autre borne stockée. Toutes les routes exigent un jeton.

### Données

| Modèle      | Contenu                                                                            |
| ----------- | ---------------------------------------------------------------------------------- |
| `DateRange` | Nom unique, début et fin (`DATE`, minuit UTC), dates de création et de mise à jour |

### Web

- Module `src/modules/date-ranges/` : menu `SavedRangesMenu` (Popover de `@repo/ui`) et
  mutations TanStack Query, qui invalident la liste.
- Dans la comparaison, une plage ajoutée depuis la bibliothèque devient une période « plage »
  ordinaire, avec son nom : l'URL porte ses dates, pas son identifiant.
- Les tests e2e de l'API donnent à chaque plage un nom unique et la suppriment à la fin : les
  captures des autres suites n'en voient aucune.
