#!/bin/sh
# First start only: the database of the e2e tests and the one of Keycloak.
set -eu
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<SQL
CREATE DATABASE "${POSTGRES_DB}_e2e";
CREATE DATABASE keycloak;
SQL
