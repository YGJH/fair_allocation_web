# Fair allocation learning site

Bilingual (`en`, `zh-TW`) Next.js site for creating fair-division cases, submitting allocations, rating before reveal, and comparing an optional fractional NSW estimate.

## CI and images

GitHub Actions runs the Node and solver test suites, builds the production application image, and starts it with `compose.yml` for a PostgreSQL-backed smoke test. Successful pushes to `main` publish the validated image to GitHub Container Registry (GHCR):

```text
ghcr.io/<owner>/<repository>:latest
ghcr.io/<owner>/<repository>:sha-<commit>
```

The deployment uses two images:

- `postgres:16-alpine` for PostgreSQL.
- One GHCR application image, shared by the `web`, `solver`, and one-off `migrate` containers.

The solver has no published host port. It runs as a separate container so that it can be health-checked and resource-limited independently from the web app while still using the same application image.

## Server deployment

Prerequisites: Docker Engine and Docker Compose plugin. No Node.js or Python installation is needed on the server.

```bash
cp .env.compose.example .env.compose
# Edit APP_IMAGE, POSTGRES_PASSWORD, DATABASE_URL, SOLVER_TOKEN, and RATE_LIMIT_SALT.
# DATABASE_URL must use the same credentials as the PostgreSQL container in compose.yml.
docker login ghcr.io
docker compose --env-file .env.compose pull
docker compose --env-file .env.compose run --rm migrate
docker compose --env-file .env.compose up -d --wait
docker compose --env-file .env.compose ps
```

For a private GHCR package, authenticate with a GitHub token that has `read:packages`. Pin `APP_IMAGE` to a `sha-<commit>` tag in production instead of `latest`.

Only the web port is published, defaulting to `127.0.0.1:3000`. Point an HTTPS reverse proxy to that address. Check the deployment with:

```bash
curl --fail http://127.0.0.1:3000/api/health/live
curl --fail http://127.0.0.1:3000/api/health/ready
```

`SOLVER_TOKEN` and `RATE_LIMIT_SALT` must be long, random secrets and must not be committed. The PostgreSQL data is stored in the `fair-db` Docker volume.

## Local development

Node 22+ is required for the Next.js app. PostgreSQL is required for creating cases, allocations, ratings, and readiness checks. The built-in example can render without a database, but it is not a complete application run.

```bash
npm ci
npm test
npm run build
cd solver && uv run --isolated --with-requirements requirements.txt pytest -q
```

Copy `.env.example` to `.env.local`, set `DATABASE_URL`, `SOLVER_URL`, `SOLVER_TOKEN`, and `RATE_LIMIT_SALT`, then run migrations before serving against PostgreSQL:

```bash
DATABASE_URL=postgres://user:password@host:5432/database node scripts/migrate.mjs
npm run dev
```
