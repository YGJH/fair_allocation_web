<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Agent skills

### Issue tracker

Issues and specs live in GitHub Issues (`gh`). See `docs/agents/issue-tracker.md`.

### Domain docs

Single-context (`GLOSSARY.md` + `docs/adr/`). See `docs/agents/domain.md`.

### Skill directories

Skills are installed with the `skills` CLI and tracked in `skills-lock.json`. `.agents/skills/` serves Antigravity, Gemini CLI and Copilot; `.claude/skills/` is a copy for Claude Code. Do not edit one copy by hand — change both through `npx skills add|update|remove`.

## Commands

- `npm test` — Vitest unit and component tests (`tests/*.test.ts(x)`).
- `npm run test:e2e` — Playwright (`tests/e2e/`).
- `npm run build` — production build; run it before calling a change done.
- `cd solver && uv run --isolated --with-requirements requirements.txt pytest -q` — solver tests.
- `node scripts/migrate.mjs` — apply `db/*.sql` to `DATABASE_URL`.

## Layout

- `src/app/` — Next.js routes: `[locale]/` pages (`en`, `zh-TW`) and `api/`.
- `src/domain/` — pure fair-division logic (model, round-robin, scoring). No I/O.
- `src/server/` — PostgreSQL access, HTTP helpers, rate limits.
- `src/i18n/` — all user-facing copy; every string needs both locales.
- `solver/` — Python service for the fractional NSW estimate, run as its own container.
- `db/` — numbered SQL migrations; add a new file, never edit an applied one.
- `docs/specs/`, `docs/story/` — specs and the narrative script.
