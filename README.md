# Fair allocation learning site

Bilingual (`en`, `zh-TW`) Next.js site for creating immutable fair-division cases, submitting allocations, rating before reveal, viewing trusted EF1/EFX/NSW scores, and optionally comparing with a private fractional NSW estimator.

## Development

Prerequisites: Node 20+, Python 3.11+, PostgreSQL for integration tests, Docker for production smoke tests.

```bash
npm install
npm test
npm run build
cd solver && python -m pip install -r requirements.txt && python -m pytest -q
npx playwright test
```

Set `.env.example` variables locally. Run `DATABASE_URL=... node scripts/migrate.mjs` before serving against a database. Public writes use a server-side `RATE_LIMIT_SALT`; never expose database credentials to the browser.

## Compose deployment

PostgreSQL is external and must be reachable from the web container. The host reverse proxy terminates HTTPS and forwards to the web port; Compose does not include the database or TLS proxy.

```bash
cp .env.compose.example .env.compose
# Set external DATABASE_URL, random SOLVER_TOKEN, and RATE_LIMIT_SALT in .env.compose; never commit it.
sudo docker compose --env-file .env.compose build
sudo docker compose --env-file .env.compose run --rm migrate
sudo docker compose --env-file .env.compose up -d --wait
# Point a host reverse proxy with HTTPS at 127.0.0.1:3000.
sudo docker compose --env-file .env.compose ps
sudo docker compose --env-file .env.compose logs -f web solver
```

Only the web port is published (`WEB_BIND`, `WEB_PORT`); the solver has no host port and receives only `SOLVER_TOKEN`. Solver timeouts return an unavailable comparison while cases, ratings, and leaderboards continue. Ratings are anonymous convenience feedback, not representative research or a durable one-person-one-vote system.



 Yes. You need PostgreSQL for the app to fully work.

 Run locally for development

 ### 1. Install dependencies

 ```bash
   npm install
 ```

 ### 2. Start PostgreSQL

 Example with Docker:

 ```bash
   docker run --rm --name fair-local \
     -e POSTGRES_PASSWORD=test \
     -e POSTGRES_DB=fair \
     -p 5433:5432 \
     -d postgres:16
 ```

 Your local DB URL will be:

 ```bash
   postgres://postgres:test@localhost:5433/fair
 ```

 ### 3. Create .env.local

 ```bash
   cp .env.example .env.local
 ```

 Edit .env.local:

 ```env
   DATABASE_URL=postgres://postgres:test@localhost:5433/fair
   TEST_DATABASE_URL=postgres://postgres:test@localhost:5433/fair
   SOLVER_URL=http://localhost:8000
   SOLVER_TOKEN=dev-token
   RATE_LIMIT_SALT=dev-random-salt
 ```

 ### 4. Run migrations

 PowerShell:

 ```powershell
   $env:DATABASE_URL="postgres://postgres:test@localhost:5433/fair"
   node scripts/migrate.mjs
 ```

 Bash:

 ```bash
   DATABASE_URL=postgres://postgres:test@localhost:5433/fair node scripts/migrate.mjs
 ```

 ### 5. Optional: run solver locally

 ```bash
   cd solver
   python -m pip install -r requirements.txt
   $env:SOLVER_TOKEN="dev-token"   # PowerShell
   python -m uvicorn app:app --host 127.0.0.1 --port 8000
 ```

 Or bash:

 ```bash
   cd solver
   python -m pip install -r requirements.txt
   SOLVER_TOKEN=dev-token python -m uvicorn app:app --host 127.0.0.1 --port 8000
 ```

 ### 6. Start Next.js

 In another terminal:

 ```bash
   npm run dev
 ```

 Open:

 ```text
   http://localhost:3000/en
   http://localhost:3000/zh-TW
 ```

 ────────────────────────────────────────────────────────────────────────────────

 Run tests

 ```bash
   npm test
   npm run build
   cd solver && python -m pytest -q
 ```

 For browser tests:

 ```bash
   npx playwright install
   npx playwright test
 ```

 ────────────────────────────────────────────────────────────────────────────────

 Deploy with Docker Compose

 This project expects external PostgreSQL. Compose runs only:

 - web
 - solver
 - one-off migrate

 ### 1. Prepare env file

 ```bash
   cp .env.compose.example .env.compose
 ```

 Edit .env.compose:

 ```env
   DATABASE_URL=postgres://user:password@host:5432/database
   SOLVER_TOKEN=your-long-random-token
   RATE_LIMIT_SALT=your-long-random-salt
   WEB_BIND=127.0.0.1
   WEB_PORT=3000
 ```

 Use WEB_BIND=0.0.0.0 only if you intentionally expose it directly.

 ### 2. Build images

 ```bash
   docker compose --env-file .env.compose build
 ```

 ### 3. Run migrations

 ```bash
   docker compose --env-file .env.compose run --rm migrate
 ```

 ### 4. Start services

 ```bash
   docker compose --env-file .env.compose up -d --wait
 ```

 ### 5. Check status/logs

 ```bash
   docker compose --env-file .env.compose ps
   docker compose --env-file .env.compose logs -f web solver
 ```

 Then point your HTTPS reverse proxy to:

 ```text
   127.0.0.1:3000
 ```

 The solver is private inside Compose and should not expose a public port.