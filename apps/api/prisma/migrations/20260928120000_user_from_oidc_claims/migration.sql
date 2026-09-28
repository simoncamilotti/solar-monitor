-- The account follows the claims of the OIDC token: `keycloakId` becomes `subject`, the rows are kept.
ALTER TABLE "User" RENAME COLUMN "keycloakId" TO "subject";
ALTER INDEX "User_keycloakId_key" RENAME TO "User_subject_key";

-- Redundant with the unique index.
DROP INDEX "user_kc_index";

-- Filled from the token at the next request of the user.
ALTER TABLE "User"
  ADD COLUMN "email" TEXT NOT NULL DEFAULT '',
  ADD COLUMN "name" TEXT NOT NULL DEFAULT '',
  ADD COLUMN "locale" TEXT NOT NULL DEFAULT 'fr';

ALTER TABLE "User"
  ALTER COLUMN "email" DROP DEFAULT,
  ALTER COLUMN "name" DROP DEFAULT;
