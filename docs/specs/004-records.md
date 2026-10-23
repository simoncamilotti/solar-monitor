# 004 — Records et faits marquants

- **Issue** : #69
- **Mise à jour** : 2026-10-23

> Une spec décrit la fonctionnalité **telle qu'elle est construite** : elle évolue avec le code,
> dans les mêmes PR.

## Résumé

Le tableau de bord montre une carte « Records » : les faits marquants de tout l'historique, pour
donner du relief aux chiffres de la période choisie. Chaque fait mène à la période qui l'a produit.

| Fait                       | Valeur                                          | Période ouverte au clic        |
| -------------------------- | ----------------------------------------------- | ------------------------------ |
| Meilleur jour              | production du jour, kWh                         | ce jour, en mode personnalisé  |
| Meilleur mois              | production du mois, kWh                         | ce mois, en mode mensuel       |
| Plus longue série autonome | nombre de jours                                 | la série, en mode personnalisé |
| Série autonome en cours    | nombre de jours                                 | la série, en mode personnalisé |
| Mois le plus autonome      | autonomie du mois, %                            | ce mois, en mode mensuel       |
| Production totale          | production cumulée, kWh, depuis le premier jour | durée d'exploitation           |

## Définitions

- **Jour autonome** : un jour sans aucune énergie importée du réseau (`kwhImported` égal à 0),
  soit une autonomie de 100 %. Un jour sans consommation et sans import est donc autonome.
- **Série** : des jours autonomes **consécutifs dans le calendrier**. Un jour absent de
  l'historique interrompt la série, comme un jour avec import : on ne présume pas de ce qu'on
  ne sait pas.
- **Série en cours** : la série qui se termine le dernier jour stocké. Si ce jour a importé de
  l'énergie, il n'y a pas de série en cours et le fait n'est pas affiché.
- **Autonomie d'un mois** : `(1 − importé / consommé) × 100` sur les jours stockés du mois,
  comme les cartes KPI. Un mois sans consommation est ignoré.
- **Égalité** : à valeur égale, le fait retient le jour, le mois ou la série **le plus ancien**.

## Parcours utilisateur

1. L'utilisateur ouvre le tableau de bord ; la carte « Records » apparaît sous le graphique.
2. Il clique sur « Meilleur jour » : le tableau de bord passe en mode personnalisé sur ce jour.
3. Il clique sur « Meilleur mois » : le tableau de bord passe en mode mensuel sur ce mois.

## Critères d'acceptation

- [x] Étant donné l'historique complet, quand j'ouvre le tableau de bord, alors une carte
      « Records » affiche ces faits, chacun avec sa valeur et sa date ou sa période
- [x] Étant donné un fait, quand je clique dessus, alors le tableau de bord s'ouvre sur le jour ou
      le mois concerné
- [x] Étant donné un jour manquant dans l'historique, alors il interrompt une série au lieu d'être
      compté comme autonome
- [x] Étant donné un historique vide, alors la carte ne s'affiche pas
- [x] Étant donné aucune série autonome ou aucun mois avec consommation, alors le fait
      correspondant n'est pas affiché

## Hors périmètre

- Pas d'endpoint dédié : le web charge déjà tout l'historique (`GET /api/enphase/all`), le calcul
  y reste.
- Les records ne suivent pas la période choisie : ils portent toujours sur tout l'historique.

## Notes techniques

- Calcul : `computeRecords` dans `apps/web/src/modules/shared/metrics/records.ts`, fonctions
  pures. Les jours `yyyy-MM-dd` sont triés en chaînes ; le jour suivant se calcule avec
  `parseISO` et `addDays` de `date-fns`, jamais `new Date(str)`.
- Affichage : `RecordsCard` dans `apps/web/src/modules/home/components/records-card.tsx`. Le
  clic passe par les setters de `useDashboardFilters` (`setCustomRange`, `setMonth`,
  `setViewMode`).
