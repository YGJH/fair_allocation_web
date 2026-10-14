<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Start here

1. Read `GLOSSARY.md` and the relevant files in `docs/adr/` before changing domain or campaign behavior. Follow `docs/agents/domain.md` for the document precedence and vocabulary rules.
2. For campaign content, also read `docs/story/master-script.zh-TW.md` and the relevant art docs. Newer ADRs supersede older ADRs and prototype code.
3. For the second-edition campaign rebuild, follow `docs/plans/narrative-web-game-implementation.zh-TW.md` phase by phase.
4. When work references an issue, fetch it with `gh`; issues and specs use the workflow in `docs/agents/issue-tracker.md`.
5. Preserve unrelated work and source media. Large videos, images, and narrative drafts at the repository root may be untracked production assets.

## Current architecture

The repository contains two related product surfaces:

- **Learning site** — case creation, allocation, Rate-Before-Reveal, score explanations, surveys, leaderboards, and the optional Fractional NSW comparison.
- **Narrative campaign** — the three-act *The Art of Settled Shares / 定分止爭錄* experience under `/{locale}/adventure`.

Main dependency flow:

```text
src/app/[locale] -> src/components -> src/domain
                              \----> src/narrative -> src/domain
src/app/api -> src/server -> src/domain -> PostgreSQL
fractional API -> solver/ (FastAPI/SciPy)
```

- `src/app/` — Next.js App Router pages and route handlers. Keep pages and handlers thin; compose UI or call server modules.
- `src/components/` — React UI. Interactive components define explicit client boundaries with `'use client'`.
- `src/domain/` — pure validation, allocation, Round-Robin, and scoring logic. Keep it deterministic and free of React, HTTP, database, locale, and environment access.
- `src/narrative/` — campaign data, reducer/state transitions, and verdict evaluation. Keep rules testable outside React.
- `src/server/` — PostgreSQL access, repositories, HTTP errors, and write rate limits. Keep secrets and database access server-only.
- `src/shared/` — built-in curated cases and survey types. Curated cases deliberately render without PostgreSQL; writes and aggregate results remain database-backed.
- `src/i18n/` — locales and shared copy. Every user-facing product string needs both `en` and `zh-TW`; narrative text uses `LocalizedText`.
- `solver/` — separately running Python service for the optional Fractional NSW estimate. An unavailable solver must degrade to the existing `unavailable` response rather than break the main allocation flow.
- `db/` — ordered, append-only SQL migrations. Add the next numbered migration; never rewrite an applied migration.
- `public/game/` and `docs/art/` — campaign assets and their visual source of truth.

## Campaign migration state

The implementation still contains superseded prototype material. `src/three/`, `SceneCanvas`, `SceneViewport`, old scenario names/content, and Three.js wording remain in code, while ADR-0004 through ADR-0006 and the master script define the current direction.

For campaign work:

- Treat `GLOSSARY.md`, the latest non-superseded ADR decision, and the master script as product truth—not the legacy implementation.
- Follow ADR-0006: gameplay uses photoreal Scene Plates, Portrait Cards, and a restrained 2D interface. Avoid extending the legacy Three.js diorama path.
- Preserve Rate-Before-Reveal, a single optional Revision, Final Verdict grading, non-blocking Master Challenges, and Performance Ledger rules from ADR-0005.
- Use canonical domain and historical names from `GLOSSARY.md`; do not revive terms listed under “Avoid”.

## Change rules

- Validate untrusted request and persisted JSON at boundaries with the existing Zod parsers and HTTP helpers.
- Keep API scoring and narrative scoring grounded in `src/domain/`; add domain tests for every changed fairness invariant.
- Keep route-specific server imports out of client runtime bundles. Use `import type` when a UI needs a server-owned type, or move genuinely shared contracts to a shared module.
- Add repository/API tests with schema changes, reducer/evaluator tests with campaign-rule changes, component tests with interaction changes, and Playwright coverage for changed end-to-end journeys.
- Keep generated skill copies synchronized through `npx skills add|update|remove`; `.agents/skills/` and `.claude/skills/` are not edited independently.

## Commands and completion

- `npm test` — Vitest unit, API, repository, and component tests (`tests/*.test.ts(x)`).
- `npm run test:e2e` — Playwright journeys (`tests/e2e/`).
- `npm run build` — production build; always run before calling application changes complete.
- `cd solver && uv run --isolated --with-requirements requirements.txt pytest -q` — solver tests; required for changes under `solver/` or to its HTTP contract.
- `node scripts/migrate.mjs` — apply `db/*.sql` to `DATABASE_URL`.

Run the smallest relevant test while iterating, then the full applicable suites. At minimum, application changes finish with `npm test` and `npm run build`; user-flow changes also run Playwright, and solver changes also run the Python suite.
