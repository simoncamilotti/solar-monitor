# syntax=docker/dockerfile:1
# API image. Build context: the repository root.
# The entrypoint applies the migrations (`prisma migrate deploy`), then starts the API.
ARG NODE_IMAGE=node:24.22.2-alpine@sha256:a34ab6d7f6f4813f4d0c5469d74685604b962fbdbf5793a7bc7b4998ecb867c8

FROM ${NODE_IMAGE} AS build
ENV NX_DAEMON=false NX_NO_CLOUD=true LEFTHOOK=0
WORKDIR /repo
RUN corepack enable
# Dependencies first: this layer is reused as long as the lockfile does not change.
COPY pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm fetch
COPY . .
RUN pnpm install --offline --frozen-lockfile
RUN pnpm exec nx build api
# Only the production dependencies of the API and of its libs.
RUN pnpm --filter @repo/api deploy --legacy --prod /out

FROM ${NODE_IMAGE} AS runtime
# The Prisma schema engine, used by `prisma migrate deploy`, needs OpenSSL.
RUN apk add --no-cache openssl
ENV NODE_ENV=production TZ=Etc/UTC
WORKDIR /app
COPY --from=build --chown=node:node /out ./
USER node
EXPOSE 3000
ENTRYPOINT ["./entrypoint.sh"]
