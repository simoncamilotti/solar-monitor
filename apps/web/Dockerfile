# syntax=docker/dockerfile:1@sha256:572cebbc2b15e6f84c077742952674889cb63cd5e9b80abdffcbe587b6f19183
# Web image (ADR 0008, ADR 0010). Build context: the repository root.
# The same image serves every environment: /config.js is generated at startup from
# WEB_API_URL, WEB_OIDC_AUTHORITY and WEB_OIDC_CLIENT_ID.
ARG NODE_IMAGE=node:24.22.3-alpine@sha256:116b800c3754b440ee0aa3ed2f20f5bf3d99a554bfd9adeea09ea8017f6e85f5
ARG NGINX_IMAGE=nginxinc/nginx-unprivileged:1.31-alpine@sha256:b5047b9b76845eac124358373c6852377c52e4b05834a47647e955dd91cb8f1e

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
