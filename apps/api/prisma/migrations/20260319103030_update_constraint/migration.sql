/*
  Warnings:

  - A unique constraint covering the columns `[date,enphaseTokenId]` on the table `EnphaseLifetimeData` will be added. If there are existing duplicate values, this will fail.
  - Made the column `enphaseTokenId` on table `EnphaseLifetimeData` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "EnphaseLifetimeData" DROP CONSTRAINT "EnphaseLifetimeData_enphaseTokenId_fkey";

-- DropIndex
DROP INDEX "EnphaseLifetimeData_date_key";

-- AlterTable
ALTER TABLE "EnphaseLifetimeData" ALTER COLUMN "enphaseTokenId" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "EnphaseLifetimeData_date_enphaseTokenId_key" ON "EnphaseLifetimeData"("date", "enphaseTokenId");

-- AddForeignKey
ALTER TABLE "EnphaseLifetimeData" ADD CONSTRAINT "EnphaseLifetimeData_enphaseTokenId_fkey" FOREIGN KEY ("enphaseTokenId") REFERENCES "EnphaseToken"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
