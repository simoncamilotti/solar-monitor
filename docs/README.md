# Documentation

| Document                        | Contenu                                                           |
| ------------------------------- | ----------------------------------------------------------------- |
| [Architecture](architecture.md) | Apps, libs, flux, authentification ; version du starter d'origine |
| [ADR](adr/)                     | Décisions d'architecture propres au projet                        |
| [Specs](specs/)                 | Fonctionnalités telles qu'elles sont construites                  |
| [Runbooks](runbooks/)           | Exploitation : migrations, déploiement, compte Enphase            |
| [Guides](guides/)               | Développement : ajouter un module, une lib, reporter le starter   |

Chaque dossier contient un modèle `_template.md` : copier le modèle, puis ajouter le document
à la liste ci-dessous.

Contenus en français, noms de fichiers en kebab-case anglais. Une PR qui change un
comportement, une structure, un endpoint ou une variable d'environnement met à jour la
documentation concernée dans la même PR ([CONTRIBUTING](../CONTRIBUTING.md)).

## ADR

Numérotés à partir de `0001` : `adr/NNNN-slug.md`. Seules les décisions du projet y figurent ;
les choix du starter sont dans ses propres ADR ([architecture](architecture.md#starter)).
S'écarter d'un choix du starter se consigne dans un ADR.

- [0001 — Écarts au starter](adr/0001-starter-deviations.md)

## Specs

Numérotées à partir de `001` : `specs/NNN-slug.md`.

- [001 — Synchronisation Enphase](specs/001-enphase-sync.md)

## Runbooks

- [Migrations de la base de données](runbooks/database-migrations.md)
- [Déploiement](runbooks/deployment.md)
- [Compte et historique Enphase](runbooks/enphase.md)

## Guides

- [Ajouter un module à l'API](guides/add-api-module.md)
- [Ajouter une lib](guides/add-lib.md)
- [Reporter une version du starter](guides/update-from-starter.md)
