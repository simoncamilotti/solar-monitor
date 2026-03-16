# ---------- Stage 1: Install dependencies ----------
FROM node:24-alpine@sha256:7fddd9ddeae8196abf4a3ef2de34e11f7b1a722119f91f28ddf1e99dcafdf114 AS deps
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY libs/api/core/src/prisma/schema.prisma libs/api/core/src/prisma/schema.prisma
COPY prisma.config.ts prisma.config.ts
RUN DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy" npx prisma generate --schema=libs/api/core/src/prisma/schema.prisma

# ---------- Stage 2: Build ----------
FROM node:24-alpine@sha256:7fddd9ddeae8196abf4a3ef2de34e11f7b1a722119f91f28ddf1e99dcafdf114 AS build
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npx nx build api --configuration=production

# ---------- Stage 3: Production ----------
FROM node:24-alpine@sha256:7fddd9ddeae8196abf4a3ef2de34e11f7b1a722119f91f28ddf1e99dcafdf114 AS prod
WORKDIR /app

ENV NODE_ENV=production
ENV TZ=Etc/UTC

COPY --from=build /app/dist/apps/api ./
COPY --from=build /app/package-lock.json ./
RUN npm ci --omit=dev

# Prisma client (runtime)
COPY --from=deps /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=deps /app/node_modules/@prisma/client ./node_modules/@prisma/client

# Prisma CLI (needed for migrate deploy at startup)
RUN npm install prisma dotenv --no-save

# Prisma schema, config & migrations
COPY prisma.config.ts prisma.config.ts
COPY libs/api/core/src/prisma/schema.prisma libs/api/core/src/prisma/schema.prisma
COPY libs/api/core/src/prisma/migrations libs/api/core/src/prisma/migrations

COPY apps/api/entrypoint.sh entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["./entrypoint.sh"]
