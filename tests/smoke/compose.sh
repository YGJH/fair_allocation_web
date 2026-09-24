#!/usr/bin/env bash
set -euo pipefail
: "${DATABASE_URL:?Set DATABASE_URL for external PostgreSQL}"
: "${SOLVER_TOKEN:?Set SOLVER_TOKEN}"
: "${RATE_LIMIT_SALT:?Set RATE_LIMIT_SALT}"
export DATABASE_URL SOLVER_TOKEN RATE_LIMIT_SALT WEB_PORT=${WEB_PORT:-3188} WEB_BIND=${WEB_BIND:-127.0.0.1}
trap 'docker compose -f compose.yaml down' EXIT
docker compose -f compose.yaml build
docker compose -f compose.yaml run --rm migrate
docker compose -f compose.yaml up -d --wait web solver
curl --fail http://127.0.0.1:${WEB_PORT}/api/health/live
curl --fail http://127.0.0.1:${WEB_PORT}/api/health/ready
curl --fail http://127.0.0.1:${WEB_PORT}/en
curl --fail http://127.0.0.1:${WEB_PORT}/zh-TW
curl --fail http://127.0.0.1:${WEB_PORT}/api/cases/not-a-uuid || test "$?" -eq 22
case_id=$(node -e "fetch('http://127.0.0.1:' + process.env.WEB_PORT + '/api/cases',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({case:{agents:['A','B'],items:['x','y'],values:[[3,0],[0,2]]}})}).then(async r=>{if(r.status!==201) process.exit(2); console.log((await r.json()).id)})")
node -e "fetch('http://127.0.0.1:' + process.env.WEB_PORT + '/api/cases/' + process.argv[1]).then(async r=>{if(!r.ok) process.exit(2); const j=await r.json(); if(j.case.agents[0]!=='A') process.exit(3)})" "$case_id"
! docker compose -f compose.yaml port solver 8000
