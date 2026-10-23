# 005 — Comparaison de plages de dates libres

- **Issue** : #75
- **Mise à jour** : 2026-10-23

> Une spec décrit la fonctionnalité **telle qu'elle est construite** : elle évolue avec le code,
> dans les mêmes PR.

## Résumé

La comparaison accepte, en plus des années, des mois et des jours, des **plages de dates libres** :
deux séjours de vacances, un été contre le précédent, deux semaines quelconques. Les plages de
longueurs différentes s'alignent sur leur premier jour, et un tableau de synthèse résume chaque
période.

## Parcours utilisateur

1. L'utilisateur choisit le mode « Plages » de la comparaison.
2. Il choisit un début et une fin dans le sélecteur, donne un nom s'il le souhaite, puis
   « Ajouter ». Les bornes sont incluses.
3. Une fois une première plage posée, deux raccourcis ajoutent une plage dérivée de celle-ci :
   « Mêmes dates, année précédente » et « Période juste avant » (même longueur, finissant la veille
   du premier jour).
4. Le graphique aligne les plages sur J1 et va jusqu'au dernier jour de la plus longue ; le tableau
   de synthèse donne, pour chaque période, son total, sa moyenne par jour, son meilleur jour et son
   écart avec la première.

## Critères d'acceptation

- [x] Étant donné le mode « Plages », quand je choisis un début et une fin, alors la période
      s'ajoute à la comparaison, bornes incluses, avec un nom facultatif
- [x] Étant donné une première plage, quand j'utilise le raccourci « Mêmes dates, année
      précédente » ou « Période juste avant », alors la plage correspondante s'ajoute
- [x] Étant donné des plages de longueurs différentes, alors l'axe va de J1 au dernier jour de la
      plus longue, et le regroupement propose par jour, par semaine, et par mois si toutes les
      plages couvrent au moins deux mois
- [x] Un tableau de synthèse donne pour chaque période : total, moyenne par jour, meilleur jour,
      écart avec la première ; il s'affiche dans tous les modes de comparaison
- [x] Au plus quatre périodes, tous types confondus
- [x] Les sélecteurs de dates suivent la langue de l'interface
- [x] Les plages se retrouvent à la visite suivante, comme les autres filtres de la comparaison

## Hors périmètre

- Mélanger plages, années et mois dans une même comparaison : changer de mode vide la liste,
  comme pour les autres modes.
- Les périodes dans l'URL : les filtres de la comparaison sont gardés dans le navigateur
  (`localStorage`), pas dans l'adresse ; un lien partagé ne porte donc pas la comparaison.
- L'apparence des sélecteurs de dates, reprise par #78.

## Notes techniques

- `RangePeriod` (`{ start, end, name? }`, jours en `yyyy-MM-dd`) rejoint les autres périodes dans
  `comparison.type.ts` ; la logique d'alignement est dans `comparison-ranges.ts`.
- Regroupements : J1…Jn par jour ; S1…Sk par blocs de sept jours depuis le premier jour ; M1…Mk par
  mois glissants depuis le premier jour (du 15 au 14 du mois suivant). Le dernier bloc d'une plage
  peut être incomplet. Après la fin d'une plage plus courte, la série vaut `null` : la barre est
  absente et l'infobulle l'omet.
- Une plage couvre deux mois quand sa fin atteint la veille du même quantième deux mois plus tard
  (1er mars → 30 avril). Si l'ajout d'une plage plus courte exclut le regroupement par mois choisi,
  la comparaison repasse par jour.
- Synthèse (`comparison-summary.ts`) : pour une énergie, le total est la somme et l'écart est en
  pourcentage ; pour un ratio (autonomie, autoconsommation, dépendance), le total est le ratio sur
  toute la période, l'écart est en points et la moyenne par jour n'est pas calculée. La moyenne
  divise par les jours présents dans l'historique. Le meilleur jour est le plus haut, sauf pour la
  consommation, l'import et la dépendance, où c'est le plus bas.
- La locale `date-fns` des dates affichées et des sélecteurs vient de `useDateLocale()`
  (`src/i18n/date-locale.ts`).
