# syntax=docker/dockerfile:1
# Web image (ADR 0008, ADR 0010). Build context: the repository root.
# The same image serves every environment: /config.js is generated at startup from
# WEB_API_URL, WEB_OIDC_AUTHORITY and WEB_OIDC_CLIENT_ID.
ARG NODE_IMAGE=node:24-alpine@sha256:ebfe2f90462722a7a4de65e91990e97fe0d401c70e0e762c5b53302f905ec1c1
ARG NGINX_IMAGE=nginxinc/nginx-unprivileged:1.30-alpine@sha256:4714e0b1b2577eaa1a6131d07c958b67f0eb68e6d0521e90c6e5287db8cf0bc5

FROM ${NODE_IMAGE} AS build
ENV NX_DAEMON=false NX_NO_CLOUD=true LEFTHOOK=0
WORKDIR /repo
RUN corepack enable
COPY pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm fetch
COPY . .
RUN pnpm install --offline --frozen-lockfile
RUN pnpm exec nx build web

FROM ${NGINX_IMAGE} AS runtime
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf
COPY apps/web/config.js.template /etc/app/config.js.template
COPY --chmod=755 apps/web/docker-entrypoint.sh /docker-entrypoint.d/40-app-config.sh
# The entrypoint writes config.js next to the application: nginx (uid 101) owns the folder.
USER root
RUN rm -rf /usr/share/nginx/html/* && chown 101:101 /usr/share/nginx/html
USER 101
COPY --from=build --chown=101:101 /repo/apps/web/dist /usr/share/nginx/html
EXPOSE 8080
