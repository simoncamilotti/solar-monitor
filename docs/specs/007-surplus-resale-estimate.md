# 007 — Revente du surplus par période de facturation

- **Issue** : #91
- **Mise à jour** : 2026-11-12

> Une spec décrit la fonctionnalité **telle qu'elle est construite** : elle évolue avec le code,
> dans les mêmes PR.

## Résumé

Le surplus exporté est racheté par le fournisseur et payé à la fin d'une **période de facturation
annuelle**, à la date anniversaire du contrat. La [valorisation en euros](002-energy-savings.md)
chiffre déjà la revente de la période choisie à l'écran ; cette fonctionnalité la chiffre sur la
période que le foyer va réellement se voir payer.

Le foyer saisit une **date de début** (par exemple le 3 mars 2023) ; les périodes annuelles s'en
déduisent (du 3 mars au 2 mars suivant). Le **prix de revente** est le tarif de rachat (`feedIn`)
de la section Tarifs : il n'y a pas de second prix. Seul le surplus est valorisé : l'énergie
exportée mesurée par Enphase.

Une carte **Revente estimée** du tableau de bord donne, pour la période en cours, le montant
acquis, l'estimation à l'échéance et l'avancement ; elle navigue vers les périodes passées, dont
le montant est final. Elle ne dépend pas de la période choisie dans les filtres du tableau de bord.

## Parcours utilisateur

1. Dans Paramétrage, section **Facturation**, l'utilisateur saisit la date de début. La période en
   cours s'affiche dessous. Il peut effacer la date.
2. Sur le tableau de bord, sous la carte de retour sur investissement :
   - sans date de début, ou sans tarif de rachat, la carte invite à les renseigner, avec un lien
     vers le paramétrage ;
   - sinon, la carte montre la période en cours : estimation à l'échéance, montant acquis à ce
     jour, jours écoulés et restants, méthode d'estimation.
3. Les flèches de la carte passent à la période précédente ou suivante ; « Période en cours »
   revient au présent. La période affichée est dans l'URL : `/?facturation=2025` ouvre la période
   qui a commencé en 2025.
4. Une période terminée affiche son montant final, sans estimation.

## Critères d'acceptation

- [x] Étant donné une date de début, quand je l'enregistre, alors la période en cours s'affiche
      avec ses bornes incluses (2023-03-03 → du 2026-03-03 au 2027-03-02 en 2026).
- [x] Étant donné la période en cours et un tarif de rachat, quand j'ouvre le tableau de bord,
      alors la carte affiche l'estimation, le montant acquis, les jours écoulés et restants et la
      méthode d'estimation.
- [x] Étant donné la période en cours, quand je clique sur « précédente », alors la carte affiche
      la période terminée, son montant final et aucune estimation ; l'URL porte cette période.
- [x] Étant donné une valeur d'URL invalide ou hors bornes, alors la période en cours s'affiche.
- [x] Étant donné la période en cours, alors « suivante » est désactivé ; étant donné la première
      période contenant des données, alors « précédente » est désactivé.
- [x] Étant donné un tarif qui change (0,13 € puis 0,10 € au 2025-07-01), alors une période
      terminée garde le tarif en vigueur chaque jour, et la période en cours projette ses jours
      à venir au tarif en vigueur ce jour-là, y compris un tarif daté dans le futur.
- [x] Étant donné un historique qui commence en cours de période, ou des jours manquants, alors
      ces jours ne sont pas valorisés et la carte indique combien il y en a.
- [x] Étant donné un début au 29 février 2024, alors la période de 2025 commence le 28 février et
      celle de 2028 le 29 février.
- [x] Étant donné moins de 30 jours d'historique, alors la carte donne le montant acquis sans
      estimation.
- [x] Étant donné un début dans le futur, alors la carte l'indique, sans navigation.
- [x] Étant donné une date invalide, alors l'API répond `400` en Problem Details.
- [x] Effacer la date de début laisse le coût de l'installation inchangé.

## Hors périmètre

- **Fréquences autres qu'annuelle.**
- **Variation entre deux périodes, graphique sur plusieurs années** : la comparaison de plages
  ([005](005-custom-comparison-ranges.md)) le couvre.
- **Rapprochement avec la facture ou le virement réel.**
- **Taxes, TVA, abonnement, prime à l'autoconsommation**, plafonds ou seuils de versement du
  contrat, vente en totalité : seul l'export mesuré par Enphase est valorisé, au tarif saisi.

## Notes techniques

### Endpoints

| Endpoint                   | Rôle                                                                |
| -------------------------- | ------------------------------------------------------------------- |
| `GET /api/pricing/billing` | Début de la facturation (`{ startDate }`, `null` tant qu'il manque) |
| `PUT /api/pricing/billing` | Enregistre la date, ou l'efface avec `{ "startDate": null }`        |

Distincts de `/api/pricing/installation` : enregistrer l'un ne touche pas l'autre. Toutes les
routes exigent un jeton.

### Données

`Installation` (ligne unique) gagne `billingStart` (`DATE`, nullable). Toutes les périodes se
calculent depuis cette date, côté web, à partir de l'historique déjà chargé : les périodes passées
n'ont pas d'endpoint.

### Calcul

`apps/web/src/modules/savings/billing-computation.ts`. La date du jour est un paramètre (jamais
lue dans le calcul) ; elle est en UTC comme les jours stockés.

- **Périodes** : annuelles, bornes incluses, toujours calculées depuis la date d'origine. Un
  début au 29 février se cale sur le 28 février des années non bissextiles.
- **Période en cours** : celle qui contient aujourd'hui. Aujourd'hui n'est pas encore stocké : le
  dernier jour compté est la veille.
- **Navigation** : de la période en cours à la première période qui contient un jour stocké, sans
  jamais remonter avant le début de la facturation.
- **Acquis** : `exporté × tarif de rachat du jour`, sur les jours stockés. Un jour absent n'est pas
  compté comme zéro ; un jour sans tarif n'est pas valorisé.
- **Estimation** (période en cours) : acquis + projection des jours à venir, valorisés au tarif
  en vigueur ce jour-là.
  - Rythme : les jours équivalents de la période précédente, si elle est stockée ; sinon la
    moyenne des 365 derniers jours stockés ; sinon, sous 30 jours d'historique, aucune estimation.
  - La carte nomme la méthode : c'est une estimation, jamais un montant garanti.
