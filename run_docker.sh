#!/usr/bin/env bash
set -Eeuo pipefail
cd "$(dirname "$0")"

if docker info >/dev/null 2>&1; then
  DOCKER=(docker)
else
  sudo -v
  DOCKER=(sudo docker)
fi
COMPOSE=("${DOCKER[@]}" compose --env-file .env.compose)
PORT=$(awk -F= '$1 == "WEB_PORT" { print $2 }' .env.compose | tail -1)
PORT=${PORT:-3000}
BASE_URL="http://127.0.0.1:${PORT}"

show_diagnostics() {
  printf '\nStartup failed. Current status:\n' >&2
  "${COMPOSE[@]}" ps >&2 || true
  printf '\nRecent database, migration, and web logs:\n' >&2
  "${COMPOSE[@]}" logs --tail=120 db migrate web >&2 || true
}
trap show_diagnostics ERR

printf 'Building and starting the complete local stack...\n'
"${COMPOSE[@]}" up -d --build

printf 'Waiting for PostgreSQL, migrations, and the web readiness check...\n'
ready=false
for _ in $(seq 1 60); do
  if curl --fail --silent --show-error "${BASE_URL}/api/health/ready" >/dev/null 2>&1; then
    ready=true
    break
  fi
  sleep 2
done

if [[ "$ready" != true ]]; then
  printf 'Readiness check did not pass at %s/api/health/ready\n' "$BASE_URL" >&2
  exit 1
fi

# This read exercises the same database path used immediately after rating.
curl --fail --silent --show-error \
  "${BASE_URL}/api/allocations/00000000-0000-4000-8000-000000000102/results" \
  >/dev/null

trap - ERR
"${COMPOSE[@]}" ps
printf '\nReady: %s/zh-TW\n' "$BASE_URL"
printf 'Database-backed rating/result checks passed.\n'
