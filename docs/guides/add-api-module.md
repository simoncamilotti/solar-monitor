# Ajouter un module à l'API

Un module Nest par domaine métier (`invoices`, `payment-methods`…), dans `apps/api/src/modules/`.

## Étapes

1. Générer le module (nom en kebab-case, au pluriel en général) :

   ```sh
   pnpm nx g @repo/workspace-plugin:api-module invoices
   ```

   Le générateur crée :

   | Fichier                                                     | Contenu                                |
   | ----------------------------------------------------------- | -------------------------------------- |
   | `libs/shared/contracts/src/lib/invoices.ts`                 | Schémas Zod de la réponse, exportés    |
   | `apps/api/src/modules/invoices/invoices.module.ts`          | Module, enregistré dans `AppModule`    |
   | `apps/api/src/modules/invoices/invoices.controller.ts`      | `GET /api/invoices`, réponse validée   |
   | `apps/api/src/modules/invoices/invoices.service.ts`         | Logique métier, renvoie une liste vide |
   | `apps/api/src/modules/invoices/invoices.controller.spec.ts` | Test du contrôleur                     |

2. Décrire les données dans le contrat (`libs/shared/contracts`) : c'est la source des types
   de l'API **et** du web.
3. Écrire la logique dans le service. Pour la base : ajouter le modèle à
   `apps/api/prisma/schema.prisma`, créer la migration
   ([runbook](../runbooks/database-migrations.md)), injecter `PrismaService`.
4. Ajouter les routes au contrôleur :
   - entrées validées par `@Query({ schema })`, `@Param('id', { schema })`, `@Body({ schema })` ;
   - réponse déclarée par `@ResponseSchema(schema)` : les champs non déclarés sont retirés ;
   - une liste se déclare par `@ResponseListSchema(itemSchema)`, jamais par
     `@ResponseSchema(z.array(…))` : Nest sérialise un tableau élément par élément (500 sinon) ;
   - `@CurrentUser()` pour l'appelant, `@Public()` pour ouvrir. `@Roles()` existe, mais
     solar-monitor n'a pas de modèle de rôles (un seul foyer) : ne pas en introduire sans décision.
5. Lancer `pnpm nx run @repo/api-client:codegen` : les hooks du web (`useInvoicesFindAll`…)
   sont disponibles dans `@repo/api-client`.
6. Ajouter un test e2e dans `apps/api-e2e` si la route touche la base ou l'authentification.

## Pièges

- Sans `@Public()`, toute route renvoie `401` sans jeton : c'est voulu.
- Une erreur métier se lève avec les exceptions Nest (`NotFoundException`…) : le filtre global
  la rend en Problem Details.
- Le nom d'opération OpenAPI vient du contrôleur et de la méthode (`invoicesFindAll`) : il
  donne le nom des hooks générés. Renommer une méthode renomme le hook.

## Voir aussi

- [Architecture : contrat entre l'API et le web](../architecture.md#contrat-entre-lapi-et-le-web)
- Module d'exemple : `apps/api/src/modules/users/`
