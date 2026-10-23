-- CreateEnum
CREATE TYPE "TariffKind" AS ENUM ('purchase', 'feedIn');

-- CreateTable
CREATE TABLE "Tariff" (
    "id" TEXT NOT NULL,
    "kind" "TariffKind" NOT NULL,
    "pricePerKwh" DECIMAL(8,5) NOT NULL,
    "effectiveFrom" DATE NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tariff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Installation" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "cost" DECIMAL(12,2),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Installation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Tariff_kind_effectiveFrom_key" ON "Tariff"("kind", "effectiveFrom");
