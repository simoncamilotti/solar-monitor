# syntax=docker/dockerfile:1
# API image. Build context: the repository root.
# The entrypoint applies the migrations (`prisma migrate deploy`), then starts the API.
ARG NODE_IMAGE=node:24.22.3-alpine@sha256:116b800c3754b440ee0aa3ed2f20f5bf3d99a554bfd9adeea09ea8017f6e85f5

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
