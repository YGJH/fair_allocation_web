#!/usr/bin/env bash
set -euo pipefail
: "${APP_IMAGE:?Set APP_IMAGE to the image being tested}"
: "${SOLVER_TOKEN:?Set SOLVER_TOKEN}"
: "${RATE_LIMIT_SALT:?Set RATE_LIMIT_SALT}"
export APP_IMAGE SOLVER_TOKEN RATE_LIMIT_SALT WEB_PORT=${WEB_PORT:-3188} WEB_BIND=${WEB_BIND:-127.0.0.1}
export POSTGRES_PASSWORD=${POSTGRES_PASSWORD:-ci-postgres-password}
export DATABASE_URL=${DATABASE_URL:-postgres://fair:${POSTGRES_PASSWORD}@db:5432/fair}
trap 'docker compose -f compose.yml down -v' EXIT
docker compose -f compose.yml up -d --wait web solver
curl --fail http://127.0.0.1:${WEB_PORT}/api/health/live
curl --fail http://127.0.0.1:${WEB_PORT}/api/health/ready
curl --fail http://127.0.0.1:${WEB_PORT}/en
curl --fail http://127.0.0.1:${WEB_PORT}/zh-TW
curl --fail http://127.0.0.1:${WEB_PORT}/api/cases/not-a-uuid || test "$?" -eq 22
case_id=$(node -e "fetch('http://127.0.0.1:' + process.env.WEB_PORT + '/api/cases',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({case:{agents:['A','B'],items:['x','y'],values:[[3,0],[0,2]]}})}).then(async r=>{if(r.status!==201) process.exit(2); console.log((await r.json()).id)})")
node -e "fetch('http://127.0.0.1:' + process.env.WEB_PORT + '/api/cases/' + process.argv[1]).then(async r=>{if(!r.ok) process.exit(2); const j=await r.json(); if(j.case.agents[0]!=='A') process.exit(3)})" "$case_id"
! docker compose -f compose.yml port solver 8000
