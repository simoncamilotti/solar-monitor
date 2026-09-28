# syntax=docker/dockerfile:1
# Web image. Build context: the repository root.
ARG NODE_IMAGE=node:24-alpine@sha256:7fddd9ddeae8196abf4a3ef2de34e11f7b1a722119f91f28ddf1e99dcafdf114
ARG NGINX_IMAGE=nginxinc/nginx-unprivileged:alpine@sha256:ccbac1a4c20a8b41c5dd1691bd91d63eda3b7989d643a33fd47841838519bfb9

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
# config.js is mounted by the k3s deployment: an empty placeholder owned by nginx (uid 101).
USER root
RUN rm -rf /usr/share/nginx/html/* && chown 101:101 /usr/share/nginx/html \
 && touch /usr/share/nginx/html/config.js && chown 101:101 /usr/share/nginx/html/config.js
USER 101
COPY --from=build --chown=101:101 /repo/apps/web/dist /usr/share/nginx/html
EXPOSE 8080
