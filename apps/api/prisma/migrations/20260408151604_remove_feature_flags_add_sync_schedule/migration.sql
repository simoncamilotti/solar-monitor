/*
  Warnings:

  - You are about to drop the `FeatureFlag` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "FeatureFlag";

-- CreateTable
CREATE TABLE "SyncSchedule" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "syncTime" TEXT NOT NULL DEFAULT '02:00',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SyncSchedule_pkey" PRIMARY KEY ("id")
);
