-- CreateTable
CREATE TABLE "EnphaseToken" (
    "id" TEXT NOT NULL,
    "systemId" INTEGER NOT NULL,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EnphaseToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EnphaseLifetimeData" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "whProduced" INTEGER NOT NULL,
    "whConsumed" INTEGER NOT NULL,
    "whExported" INTEGER NOT NULL,
    "whImported" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "enphaseTokenId" TEXT,

    CONSTRAINT "EnphaseLifetimeData_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EnphaseToken_systemId_key" ON "EnphaseToken"("systemId");

-- CreateIndex
CREATE INDEX "EnphaseLifetimeData_date_idx" ON "EnphaseLifetimeData"("date");

-- CreateIndex
CREATE UNIQUE INDEX "EnphaseLifetimeData_date_key" ON "EnphaseLifetimeData"("date");

-- AddForeignKey
ALTER TABLE "EnphaseLifetimeData" ADD CONSTRAINT "EnphaseLifetimeData_enphaseTokenId_fkey" FOREIGN KEY ("enphaseTokenId") REFERENCES "EnphaseToken"("id") ON DELETE SET NULL ON UPDATE CASCADE;
