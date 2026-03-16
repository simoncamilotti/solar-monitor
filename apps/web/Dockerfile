# ---------- Stage 1: Install dependencies ----------
FROM node:24-alpine@sha256:7fddd9ddeae8196abf4a3ef2de34e11f7b1a722119f91f28ddf1e99dcafdf114 AS deps
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# ---------- Stage 2: Build ----------
FROM node:24-alpine@sha256:7fddd9ddeae8196abf4a3ef2de34e11f7b1a722119f91f28ddf1e99dcafdf114 AS build
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npx nx build web --configuration=production

# ---------- Stage 3: Production ----------
FROM nginxinc/nginx-unprivileged:alpine@sha256:ccbac1a4c20a8b41c5dd1691bd91d63eda3b7989d643a33fd47841838519bfb9 AS prod

COPY config/web/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/apps/web/ /usr/share/nginx/html/

# Empty config.js placeholder — will be mounted via k3s volume at runtime
USER root
RUN touch /usr/share/nginx/html/config.js && chown nginx:nginx /usr/share/nginx/html/config.js
USER nginx

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
