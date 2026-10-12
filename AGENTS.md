# Repository Guidelines

## Project Structure & Module Organization

This bilingual (`en`, `zh-TW`) fair-allocation learning site uses Next.js and a private FastAPI solver.

- `src/app/`: localized pages, layouts, styles, and API routes.
- `src/components/`: React UI components; `src/i18n/`: translated copy and locale helpers.
- `src/domain/`: allocation models, scoring, and round-robin logic.
- `src/server/`: PostgreSQL access, repositories, HTTP helpers, and limits; `src/shared/`: shared example and survey data.
- `db/`: numbered SQL migrations; `scripts/migrate.mjs`: migration runner.
- `solver/`: Python optimization service and tests.
- `tests/`: application tests, `e2e/` browser tests, and `smoke/` container checks.
- `docs/`: design specifications and implementation plans.

## Build, Test, and Development Commands

Use Node.js 22+ and install dependencies with `npm ci`.

- `npm run dev`: start the development server.
- `npm run build`: build the production application.
- `npm start`: serve the production build.
- `npm test`: run Vitest tests.
- `npm run test:e2e`: run Playwright; its configuration starts a development server on port 3101.
- `node scripts/migrate.mjs`: apply database migrations using `DATABASE_URL`.
- From `solver/`, run `uv run --isolated --with-requirements requirements.txt pytest -q` for solver tests.

## Coding Style & Naming Conventions

Keep TypeScript strict and follow adjacent code: two-space indentation, single-quoted imports, and semicolons. Use four-space indentation in Python. Name React components in PascalCase, helpers in camelCase, and migrations with ordered numeric prefixes. Keep allocation logic in `src/domain/` and update both locales when changing user-facing text. No formatter or lint script is configured.

## Testing Guidelines

Use Vitest and Testing Library for domain, API, repository, and UI behavior. Name tests `tests/*.test.ts` or `*.test.tsx`; use `tests/e2e/*.spec.ts` for Playwright and `solver/test_*.py` for pytest. Cover changed behavior and edge cases. No coverage threshold is configured. Run relevant suites and the production build before submitting.

## Commit & Pull Request Guidelines

History mixes generic `update` messages with scoped messages such as `ci: publish validated branch images`. Prefer descriptive, imperative messages with a relevant scope. PRs should explain behavior changes, link related issues, report validation, and include screenshots for UI changes. Call out migrations and configuration changes.

## Security & Configuration

Copy `.env.example` to `.env.local` and configure PostgreSQL and solver settings. Run migrations before database-backed development. Never commit credentials, `SOLVER_TOKEN`, or `RATE_LIMIT_SALT`; keep the solver private.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
