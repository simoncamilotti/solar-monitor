#!/bin/sh
set -e

echo "Running Prisma migrations..."
node_modules/.bin/prisma migrate deploy

echo "Starting API..."
exec node --import ./dist/instrumentation.js dist/main.js
