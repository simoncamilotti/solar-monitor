#!/bin/sh
# Generates /config.js from the environment when the container starts.
set -eu

# Until the GitOps manifests pass the WEB_* variables, they mount a ready-made /config.js
# (read-only): keep it.
if [ -z "${WEB_API_URL:-}${WEB_OIDC_AUTHORITY:-}${WEB_OIDC_CLIENT_ID:-}" ] \
  && [ -s /usr/share/nginx/html/config.js ]; then
  echo "WEB_* unset: serving the mounted /config.js"
  exit 0
fi

for name in WEB_API_URL WEB_OIDC_AUTHORITY WEB_OIDC_CLIENT_ID; do
  eval "value=\${$name:-}"
  if [ -z "$value" ]; then
    echo "$name is required" >&2
    exit 1
  fi
done

envsubst '${WEB_API_URL} ${WEB_OIDC_AUTHORITY} ${WEB_OIDC_CLIENT_ID}' \
  < /etc/app/config.js.template > /usr/share/nginx/html/config.js
