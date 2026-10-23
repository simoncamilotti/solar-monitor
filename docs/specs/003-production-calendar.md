# 003 — Calendrier de production

- **Issue** : #68
- **Mise à jour** : 2026-10-23

> Une spec décrit la fonctionnalité **telle qu'elle est construite** : elle évolue avec le code,
> dans les mêmes PR.

## Résumé

La page Historique propose une vue « Calendrier » : une case par jour de l'année, colorée selon
l'intensité de la grandeur choisie, à la manière du graphe de contributions de GitHub. Elle montre
d'un coup d'œil les saisons, les séries de beaux jours et les jours manquants, que les graphiques
mensuels lissent.

## Parcours utilisateur

1. L'utilisateur ouvre l'Historique et choisit la vue « Calendrier » (ou ouvre directement
   `/history?view=calendar`).
2. Le système affiche l'année la plus récente de l'historique, en production.
3. L'utilisateur change d'année ou de grandeur (production, consommation, autonomie) ; l'échelle et
   les couleurs suivent.
4. Au survol d'une case, il lit la date et la valeur ; au clic, le tableau de bord s'ouvre en mode
   personnalisé sur ce jour.

## Critères d'acceptation

- [x] Étant donné une année choisie, quand j'ouvre le calendrier, alors chaque jour de l'année est
      une case, colorée selon la valeur du jour sur une échelle propre à l'année
- [x] Étant donné une grandeur choisie (production, consommation, autonomie), quand je la change,
      alors l'échelle et les couleurs suivent
- [x] Étant donné un jour absent de l'historique, alors sa case est distincte d'un jour à zéro
- [x] Au survol d'une case : date et valeur. Au clic : le tableau de bord en mode personnalisé sur
      ce jour
- [x] Lisible en thème clair et sombre ; défilement horizontal sur mobile

## Définitions

- **Échelle** : de zéro à la plus forte valeur de l'année affichée pour une énergie, de 0 à 100 %
  pour l'autonomie. Une année faible n'est donc pas écrasée par une année plus productive.
- **Niveaux** : cinq teintes de la couleur de la grandeur. Le niveau 0 est réservé aux valeurs
  nulles et garde une teinte légère ; les niveaux 1 à 4 couvrent les quarts de l'échelle.
- **Jour manquant** : un jour compris entre le premier et le dernier jour stockés, absent de
  l'historique. Sa case n'a pas de fond et porte une bordure en pointillés, pour ne jamais se
  confondre avec un jour à zéro.
- Les jours avant le premier relevé ou après le dernier ne sont pas manquants : l'installation
  n'était pas encore suivie, ou le jour n'est pas encore venu. Leur case reste vide.
- **Autonomie du jour** : `(1 - importé / consommé) × 100`, indéfinie sans consommation ; un tel
  jour n'a pas de case colorée.

## Hors périmètre

- **Pas de calendrier sur le tableau de bord** : celui-ci porte déjà les KPI, la valorisation en
  euros, le graphique mensuel et les records. Le calendrier est une vue d'exploration de
  l'historique, à côté du tableau des relevés, dont il partage les données.
- Pas d'import ni d'export dans le calendrier : production, consommation et autonomie suffisent
  à lire une journée ; le détail reste dans le tableau et le tableau de bord.

## Notes techniques

- Calcul en fonctions pures dans `apps/web/src/modules/history/calendar/calendar-data.ts`, sur les
  jours déjà chargés par la page ; pas d'endpoint dédié. Les jours restent des chaînes
  `yyyy-MM-dd` (comparées en chaînes, parcourues avec `parseISO` et `addDays`).
- Rendu par les séries `calendar` et `heatmap` d'ECharts. La couleur de chaque case est calculée
  côté web à partir de la couleur de la grandeur, sans `visualMap`, et les couleurs du thème sont
  lues dans les jetons CSS, que le rendu SVG ne sait pas résoudre lui-même.
- La vue est un paramètre de recherche de la route (`view=calendar`), ce qui rend le calendrier
  partageable par lien.
- Le clic écrit la période dans l'état mémorisé du tableau de bord (`presetDashboardDay`), puis
  navigue vers `/` : le tableau de bord n'a pas de paramètres d'URL.
