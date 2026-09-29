# Contribuer

## Langues

- **Français** : documentation (`README.md`, `docs/`), ADR, specs, issues.
- **Anglais** : code, commentaires, noms de fichiers, messages de commit, pull requests.
- Les textes affichés aux utilisateurs passent par l'i18n (`fr` et `en`).

## Branches

Trunk-based : une branche courte par sujet, créée depuis `main`, fusionnée par une PR.
Nom libre et court, préfixé par le type : `feat/profile-avatar`, `fix/login-redirect`.

`main` n'a pas de protection côté GitHub (plan Free). Le hook `pre-push` refuse toute poussée
vers `main` : tout passe par une PR, fusionnée seulement quand la CI est verte.

## Commits

[Conventional Commits](https://www.conventionalcommits.org/), en anglais, sur une ligne,
vérifiés par commitlint :

```
feat(web): add the avatar to the profile page
fix(api): return 404 when the user is unknown
```

Types courants : `feat`, `fix`, `refactor`, `test`, `docs`, `chore`, `ci`, `build`, `perf`.
Le scope est le projet concerné (`api`, `web`, `contracts`…), facultatif s'il y en a plusieurs.

## Hooks git

Installés par `pnpm install` ([lefthook](lefthook.yml)).

| Moment     | Vérification                                                              |
| ---------- | ------------------------------------------------------------------------- |
| pre-commit | Prettier et ESLint sur les fichiers indexés ; gitleaks s'il est installé  |
| commit-msg | commitlint                                                                |
| pre-push   | Refus de pousser vers `main` ; `typecheck` et `test` des projets modifiés |

La CI fait foi : elle rejoue tout, plus le build, les e2e, knip et gitleaks.

## Pull requests

- Titre = titre du premier commit de la PR (Conventional Commits).
- Description en anglais, selon le [modèle](.github/pull_request_template.md). `Closes #n`
  sur la PR qui termine l'issue ; `Refs #n` sur les PR intermédiaires, une issue en demandant
  souvent plusieurs.
- Une PR = un sujet. Petite de préférence.

### Documentation dans la même PR

Une PR qui modifie la structure, une variable d'environnement, un endpoint ou un comportement
met à jour la documentation concernée **dans la même PR** : README, `.env.example`,
[specs](docs/specs/), [runbooks](docs/runbooks/), [guides](docs/guides/).
Une décision d'architecture s'ajoute en [ADR](docs/adr/).

### Fusion

Squash uniquement, branche supprimée après la fusion. Le dépôt propose le titre de la PR comme
message du commit de fusion, avec un corps vide : vérifier au moment de fusionner qu'il reprend
bien le titre du premier commit.

## Issues

En français, à partir des modèles : **Bug**, **Fonctionnalité** (liée à une spec) ou **Tâche**.
Chaque modèle pose son label `type: …`.

## Dépendances

- Versions centralisées dans le catalogue de [`pnpm-workspace.yaml`](pnpm-workspace.yaml) :
  un `package.json` référence `catalog:`.
- Une version n'est installable que 3 jours après sa publication (`minimumReleaseAge`).
- La version de pnpm (`packageManager` dans `package.json`) ne change que par Renovate, qui
  applique le même délai. Fixée à la main sur une version trop récente, elle bloque toute
  commande pnpm, hooks compris (`ERR_PNPM_NO_MATURE_MATCHING_VERSION`). Contournement
  ponctuel qui garde les hooks actifs : `npm_config_manage_package_manager_versions=false`.
- Renovate propose les mises à jour le lundi matin ; correctifs et mineures sont fusionnés
  automatiquement après une CI verte, les majeures sont relues.

## Releases

Une version unique pour tout le projet :

1. `main` est déployée en dev à chaque fusion.
2. Pour la prod, créer une GitHub Release (`vX.Y.Z`, notes générées par GitHub) : elle
   construit les images et déclenche le déploiement.

Pas de `CHANGELOG.md` : les notes de release en tiennent lieu.

## Mises à jour du starter

Le projet est issu de `monorepo-starter` (version dans `package.json`, champ `starter.version`).
Reporter une nouvelle version : [guide](docs/guides/update-from-starter.md).
