# Bilingual Fair-Division Learning Site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish a bilingual interactive fair-division site with shareable cases, an NSW leaderboard, anonymous fairness ratings, explanations, an optional numerical fractional-NSW comparison, and a two-image Docker Compose deployment.

**Architecture:** A Next.js app owns the lesson, APIs, domain scoring, and persistence; shared case/allocation IDs are language-independent. Two Docker images run via Compose on one machine: the web image exposes the frontend and API on one port, while a private Python solver image handles optional time-bounded comparisons. PostgreSQL remains externally managed and is reached only by the web image.

**Tech Stack:** Node.js 20+, Next.js App Router, TypeScript, Zod, `pg`, externally managed PostgreSQL (such as Supabase), Vitest, Playwright, Python 3.11+, FastAPI, SciPy, pytest, Docker and Docker Compose. Package versions are locked at installation time; do not substitute browser-side trusted scoring or database service credentials.

**Spec:** `docs/superpowers/specs/2026-09-23-fair-division-learning-site-design.md` and `docs/superpowers/specs/2026-09-23-fair-division-learning-site-design.zh-TW.md`

## Global Constraints

- First release fully supports Traditional Chinese (`zh-TW`) and English (`en`); browser `zh-TW` initially selects Traditional Chinese, otherwise English, with a persistent manual choice.
- Cases, votes, allocations, scores, and leaderboards are shared across languages; user-entered names stay verbatim.
- Valuations are nonnegative integers; every item has exactly one owner; NSW is the exact product of bundle utilities and ties remain ties.
- EFX checks only goods positively valued by the envious agent; EF1 existence claims require nonnegative additive valuations.
- Rating is an anonymous integer 1–5, accepted before revealing formal results or aggregate ratings in the intended interface; this is not secure one-person-one-vote research.
- Fractional-optimum output is a numerical estimate, never a certified bound without a certificate. Failures must not block core features.
- Public inputs have practical byte, numeric, time, and rate bounds, but no artificial small cap on agent or item counts.
- Web and solver must build as separate production Docker images; Compose exposes only the web port, keeps PostgreSQL external, and starts the solver on a private network.
- Image builds must not include secrets; Compose injects external DB URL, solver token, and rate-limit salt from a local ignored env file. Migrations run through a repeatable one-off command before serving traffic.
- Use test-first changes and commit each task; run `npm test`, `npm run build`, Python tests, Playwright, and the Compose smoke test before handoff.

## File map and contracts

- `src/domain/{model,score,round-robin}.ts`: domain-only schemas, score witnesses, and deterministic baseline; no DB/UI dependencies.
- `src/server/{db,repository,limits}.ts`: private connection pool, SQL operations, write limits. `src/app/api/**/route.ts`: small HTTP adapters only.
- `src/i18n/{copy,locale}.ts`, `src/app/[locale]/**`, `src/components/**`: dictionaries, locale selection, educational pages, interactive case/allocation/rating views.
- `solver/{app,optimizer,test_optimizer}.py`: isolated on-demand fractional solver, no database credentials.
- `db/001_init.sql`, `scripts/migrate.mjs`: immutable cases/allocations/votes and idempotent versioned database migration runner.
- `Dockerfile`, `solver/Dockerfile`, `compose.yaml`, `.dockerignore`, `.env.compose.example`, `tests/smoke/compose.sh`: production images, private solver deployment, ignored local secrets, and production smoke test; `tests/**`: domain, HTTP, DB integration, browser flows.

**Domain contract:** `CaseInput = {agents: string[]; items: string[]; values: number[][]}`; `Allocation = number[]` indexed by item, containing agent indices; `Score = {utilities: bigint[]; nsw: string; ef1: boolean; efx: boolean; ef1Failure?: {i:number;j:number}; efxFailure?: {i:number;j:number;item:number}}`. JSON never contains `bigint`: serialize utilities as decimal strings. `scoreAllocation(c, a): Score`, `roundRobin(c, seed): Allocation`, `parseCase(input): CaseInput`, `parseAllocation(c,input): Allocation`. Persist `nsw` as PostgreSQL `numeric` and return it as a decimal string.

**HTTP contract:** `POST /api/cases` `{case:CaseInput}` → `201 {id,baselineId}`; `GET /api/cases/:id` → `{case,allocations:[{id,owners,kind}]}` (no scores or ratings); `POST /api/cases/:id/allocations` `{owners:number[]}` → `201 {id}`; `POST /api/allocations/:id/ratings` `{value:number}` → `201 {rating,score,aggregate}`; `GET /api/allocations/:id/results` → `{score,aggregate,caseId}`; `POST /api/cases/:id/fractional` → `{status:'pending'}|{status:'estimated',value:string}|{status:'unavailable'}`. `GET /api/cases/:id/allocations` is a score-ordered leaderboard endpoint. Stable per-allocation IDs are UUIDs; URLs are `/{locale}/cases/{id}` and `/{locale}/allocations/{id}`. The browser delays requesting result/leaderboard endpoints until after the rating interaction.

### Task 1: Domain math, setup, and executable tests

**Files:** Create `package.json`, `tsconfig.json`, `vitest.config.ts`, `src/domain/model.ts`, `src/domain/score.ts`, `src/domain/round-robin.ts`, `tests/domain.test.ts`, `.gitignore`.

**Interfaces:** Produces `CaseInput`, `Allocation`, `Score`, `parseCase`, `parseAllocation`, `scoreAllocation`, `roundRobin` as defined above. No dependencies on later tasks.

- [ ] **Step 1: Scaffold the test runner and write failing tests.** Initialize Next.js with TypeScript and App Router in the current repository without overwriting `docs/`; install `zod pg`, dev dependencies `vitest @types/pg @playwright/test typescript @types/node`, and scripts `"test":"vitest run"`, `"build":"next build"`, `"test:e2e":"playwright test"`. `vitest.config.ts`: `defineConfig({test:{environment:'node'}})`. In `tests/domain.test.ts`:

```ts
import { expect, test } from 'vitest';
import { parseCase, parseAllocation } from '../src/domain/model';
import { scoreAllocation } from '../src/domain/score';
import { roundRobin } from '../src/domain/round-robin';
const c = parseCase({agents:['A','B'],items:['x','y'],values:[[3,0],[0,2]]});
test('exact NSW and EF1/EFX', () => {
  expect(scoreAllocation(c,[0,1])).toMatchObject({nsw:'6',ef1:true,efx:true});
  expect(scoreAllocation(c,[0,0]).nsw).toBe('0');
});
test('EFX uses positive goods only, with a witness', () => {
  const d = parseCase({agents:['A','B'],items:['x','y','z'],values:[[3,2,0],[0,0,0]]});
  expect(scoreAllocation(d,[1,1,1])).toMatchObject({ef1:false,efx:false,efxFailure:{i:0,j:1,item:0}});
});
test('reject missing owner, negative valuation, and empty case', () => {
  expect(() => parseAllocation(c,[0])).toThrow();
  expect(() => parseCase({agents:[],items:['x'],values:[]})).toThrow();
  expect(() => parseCase({agents:['A'],items:['x'],values:[[-1]]})).toThrow();
});
test('repeatable round robin and exact huge product', () => {
  expect(roundRobin(c,42)).toEqual(roundRobin(c,42));
  const huge = parseCase({agents:['A','B'],items:['x','y'],values:[[1000000,0],[0,1000000]]});
  expect(scoreAllocation(huge,[0,1]).nsw).toBe('1000000000000');
});
```

- [ ] **Step 2: Verify red.** Run `npm test -- tests/domain.test.ts`; expect missing module/import failures.
- [ ] **Step 3: Implement.** In `model.ts`, use Zod with `int().min(0).max(1000000)` and nonempty arrays, unique nonblank names, a rectangular values matrix with `values.length === agents.length` and each row length `items.length`; cap JSON requests at 64 KiB at API boundaries, not a fixed number of agents. `parseAllocation` checks `owners.length === items.length` and every owner an integer in `[0,agents.length)`. In `score.ts` implement the following loop (use `BigInt` for *all* sums/products):

```ts
const utilities = c.agents.map((_, i) => c.items.reduce((s, _, g) => s + (a[g] === i ? BigInt(c.values[i][g]) : 0n), 0n));
const nsw = utilities.reduce((p,u) => p*u, 1n).toString();
let ef1Failure: Score['ef1Failure'];
let efxFailure: Score['efxFailure'];
for (let i=0;i<c.agents.length;i++) for (let j=0;j<c.agents.length;j++) {
  if (i===j) continue;
  const goods = a.flatMap((owner,g) => owner===j ? [g] : []);
  const other = goods.reduce((s,g) => s+BigInt(c.values[i][g]),0n);
  if (utilities[i]>=other) continue;
  if (!goods.some(g => utilities[i]>=other-BigInt(c.values[i][g]))) ef1Failure ??= {i,j};
  const offending = goods.find(g => c.values[i][g]>0 && utilities[i]<other-BigInt(c.values[i][g]));
  if (offending!==undefined) efxFailure ??= {i,j,item:offending};
}
return {utilities,nsw,ef1:!ef1Failure,efx:!efxFailure,...(ef1Failure && {ef1Failure}),...(efxFailure && {efxFailure})};
```

In `round-robin.ts`, seed a small deterministic PRNG (e.g. integer xorshift32; map seed `0` to `1`), Fisher–Yates shuffle agent indices once, then cycle the order, assigning the highest-valued unallocated item to the current agent; item-index order breaks ties. Remove Next scaffold demo content only when its replacement page is introduced in Task 5. Ignore `.env.local`, `.env.compose`, `node_modules`, `.next`, `playwright-report`.
- [ ] **Step 4: Verify green.** Run `npm test -- tests/domain.test.ts` and `npm run build`; expect exit 0. Add table cases for EF1 true/EFX false, empty bundle, and zero-valued goods before closing task.
- [ ] **Step 5: Commit.** `git add package.json package-lock.json tsconfig.json vitest.config.ts src/domain tests/domain.test.ts .gitignore && git commit -m "feat: implement fair allocation math"`.

### Task 2: Persistence with immutable cases, trusted scores, and rate-limit storage

**Files:** Create `db/001_init.sql`, `scripts/migrate.mjs`, `src/server/db.ts`, `src/server/repository.ts`, `tests/repository.test.ts`, `.env.example`.

**Interfaces:** Consumes Task 1 types and functions. Produces `createCase(c:CaseInput):Promise<{id:string;baselineId:string}>`, `getCase(id:string):Promise<CaseInput|null>`, `createAllocation(caseId:string,owners:Allocation,kind:'visitor'|'baseline'):Promise<string>`, `getAllocation(id:string)`, `listAllocations(caseId:string)`, `addRating(id:string,value:number):Promise<Aggregate>`, `getAggregate(id:string):Promise<Aggregate>`, `getFractional(id:string)`, `claimFractional(id:string):Promise<boolean>`, `setFractional(id:string,status:'estimated'|'unavailable',value?:string)`; the claim uses a 30-second expiring database lease. `Aggregate={count:number;mean:number|null;histogram:number[]}` (five slots). Return score utilities as strings when crossing the DB boundary.

- [ ] **Step 1: Write failing integration test** (`TEST_DATABASE_URL` points to a disposable local PostgreSQL DB; run migration before suite). Example:

```ts
import {expect,test} from 'vitest';
import {createCase,getCase,listAllocations,addRating,getAggregate} from '../src/server/repository';
import {parseCase} from '../src/domain/model';
test('published case stays fixed, baseline is stored, votes aggregate by allocation', async () => {
 const c=parseCase({agents:['A','B'],items:['x','y'],values:[[3,0],[0,2]]});
 const {id,baselineId}=await createCase(c);
 expect(await getCase(id)).toEqual(c);
 expect((await listAllocations(id)).some(a=>a.id===baselineId)).toBe(true);
 await addRating(baselineId,1); await addRating(baselineId,5);
 expect(await getAggregate(baselineId)).toEqual({count:2,mean:3,histogram:[1,0,0,0,1]});
});
```

- [ ] **Step 2: Verify red.** Start disposable PostgreSQL (`docker run --rm --name fair-test -e POSTGRES_PASSWORD=test -e POSTGRES_DB=fair -p 5433:5432 -d postgres:16`); `TEST_DATABASE_URL=postgres://postgres:test@localhost:5433/fair npm test -- tests/repository.test.ts`; expect missing repository. On Windows set `TEST_DATABASE_URL` in PowerShell instead of POSIX inline syntax.
- [ ] **Step 3: Implement.** SQL schema (add indexes and FK restrict deletes):

```sql
CREATE TABLE cases (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), payload jsonb NOT NULL, baseline_seed integer NOT NULL, created_at timestamptz NOT NULL DEFAULT now(), fractional_status text, fractional_value text, fractional_started_at timestamptz);
CREATE TABLE allocations (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), case_id uuid NOT NULL REFERENCES cases(id), owners jsonb NOT NULL, kind text NOT NULL CHECK (kind IN ('visitor','baseline')), nsw numeric NOT NULL, score jsonb NOT NULL, created_at timestamptz NOT NULL DEFAULT now());
CREATE INDEX allocations_rank ON allocations(case_id, nsw DESC, created_at ASC);
CREATE TABLE ratings (id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY, allocation_id uuid NOT NULL REFERENCES allocations(id), value smallint NOT NULL CHECK (value BETWEEN 1 AND 5), created_at timestamptz NOT NULL DEFAULT now());
CREATE INDEX ratings_by_allocation ON ratings(allocation_id);
CREATE TABLE write_limits (key text PRIMARY KEY, window_start timestamptz NOT NULL, count integer NOT NULL);
```

`scripts/migrate.mjs` uses `pg` and a `schema_migrations(version text primary key)` table, takes a PostgreSQL advisory lock to serialize runs, applies ordered `db/[0-9]*.sql` files and records each version in the same transaction; repeated execution skips recorded versions. It reads `DATABASE_URL` only at runtime, exits nonzero on failure, and never prints credentials. `db.ts` creates `new Pool({connectionString:process.env.TEST_DATABASE_URL ?? process.env.DATABASE_URL})`, server-only. `createCase` opens transaction, stores payload + random seed, computes/stores baseline and score in the same transaction, rolls back on error; do not update or delete published cases/allocations from public routes. `createAllocation` loads the case and calls Task 1 score inside a transaction; store `nsw` numeric via decimal string, `score` via JSON strings for utilities. `listAllocations` orders `nsw DESC, created_at ASC` and explicitly marks equal `nsw` as ties in the UI; aggregate votes with `GROUP BY allocation_id,value`, never sum votes across allocations. Write `.env.example` listing `DATABASE_URL`, `TEST_DATABASE_URL`, `SOLVER_URL`, `SOLVER_TOKEN`; never commit values.
- [ ] **Step 4: Verify green.** `DATABASE_URL="$TEST_DATABASE_URL" node scripts/migrate.mjs` twice, then `npm test -- tests/repository.test.ts`; expect pass and only one row for `001_init.sql` in `schema_migrations`. Add a failing test for an unknown ID and confirm no dangling allocation after transaction rollback, then fix and rerun.
- [ ] **Step 5: Commit.** `git add db scripts/migrate.mjs src/server/db.ts src/server/repository.ts tests/repository.test.ts .env.example && git commit -m "feat: persist cases allocations and ratings"`.

### Task 3: Validated, abuse-bounded public HTTP endpoints

**Files:** Create `src/server/limits.ts`, `src/server/http.ts`, `src/app/api/health/live/route.ts`, `src/app/api/health/ready/route.ts`, `src/app/api/cases/route.ts`, `src/app/api/cases/[id]/route.ts`, `src/app/api/cases/[id]/allocations/route.ts`, `src/app/api/allocations/[id]/ratings/route.ts`, `src/app/api/allocations/[id]/results/route.ts`, `tests/api.test.ts`.

**Interfaces:** Consumes Task 2 repository. Produces the HTTP contract in the file map. For `GET /api/cases/:id`, return case and allocation IDs/owners/kinds only; separate results route returns scores/aggregates, preventing accidental prerating UI exposure.

- [ ] **Step 1: Write failing endpoint tests** using imported Next route handlers and a test DB with migration. Test malformed input, unknown UUID, 64-KiB body limit, allocation owners missing, rating outside 1–5, successful liveness/readiness, readiness 503 when PostgreSQL is down, and happy path:

```ts
import {POST as publish} from '../src/app/api/cases/route';
import {expect,test} from 'vitest';
test('reject invalid valuations without saving', async () => {
 const request=new Request('http://localhost/api/cases',{method:'POST',body:JSON.stringify({case:{agents:['A'],items:['x'],values:[[-1]]}})});
 expect((await publish(request)).status).toBe(400);
});
```

- [ ] **Step 2: Verify red.** `npm test -- tests/api.test.ts`; expect missing route imports.
- [ ] **Step 3: Implement.** `readBody(request)` reads text with a 64-KiB bound and parses JSON; `apiError` maps malformed input→400, unknown ID→404, over limit→413, write throttling→429, database connection failure→503 (retriable), unexpected errors→500 without leaking credentials. `GET /api/health/live` returns 200 if the web process is running; `GET /api/health/ready` runs `SELECT 1` against the external database with a short timeout and returns 200 or 503, independent of solver availability. `limits.ts` hashes requester IP with a server-only daily salt for short-lived throttle keys; fail closed for writes when limit storage unavailable, delete expired `write_limits` windows, store neither raw IP nor persistent IP hashes as survey data. Set explicit windows for publish (10/hour), allocations (60/hour), votes (120/hour), and fractional trigger (12/hour); no browser session can enforce unique voters. Access cases by UUID after strict UUID validation. `POST ratings` atomically inserts a vote then fetches aggregate and trusted score; returns 201 only after DB commit. Use an allowlisted, stable, server-only `RATE_LIMIT_SALT` secret for temporary hashed IP throttling; add it to `.env.example` and expire window rows after their TTL. For routes accepting requests, perform validation and throttling before expensive database/solver work. Pass and serialize values, never build SQL through interpolation. Add read-only results and ranked case allocations endpoints; each response uses `Cache-Control: no-store` for newly submitted votes. Do not return success for a write whose database transaction failed.
- [ ] **Step 4: Verify green.** `npm test -- tests/api.test.ts`; then `npm test && npm run build`; expect zero failures. Include test proving a rejected oversized body creates no case and tests for 429/404 responses.
- [ ] **Step 5: Commit.** `git add src/server/limits.ts src/server/http.ts src/app/api tests/api.test.ts && git commit -m "feat: expose protected case allocation and rating APIs"`.

### Task 4: Bilingual lesson and locale routing

**Files:** Create `src/i18n/copy.ts`, `src/i18n/locale.ts`, `src/app/[locale]/layout.tsx`, `src/app/[locale]/page.tsx`, `src/components/LanguageSwitch.tsx`, `src/middleware.ts`, `tests/i18n.test.ts`; modify Next scaffold root page/layout if necessary.

**Interfaces:** `Locale='zh-TW'|'en'`; `copy[locale]` contains all visible text keys used in lesson and shared UI; `localePath(locale,path)` maps case/allocation IDs without changing them.

- [ ] **Step 1: Write failing tests.**

```ts
import {expect,test} from 'vitest';
import {copy,selectLocale,localePath} from '../src/i18n/locale';
test('browser default, persistence and shared links', () => {
 expect(selectLocale('zh-TW,zh;q=.9',undefined)).toBe('zh-TW');
 expect(selectLocale('zh-CN,en;q=.8',undefined)).toBe('en');
 expect(selectLocale('en','zh-TW')).toBe('zh-TW');
 expect(localePath('en','/cases/123')).toBe('/en/cases/123');
 expect(Object.keys(copy.en).sort()).toEqual(Object.keys(copy['zh-TW']).sort());
});
```

- [ ] **Step 2: Verify red.** `npm test -- tests/i18n.test.ts`; expect missing module.
- [ ] **Step 3: Implement.** `copy.ts` exports typed dictionaries for navigation, guided explanation, rating labels, reasons/witnesses, unavailable/pending states, validation, limits, and research disclaimer. Include curated sample valuation cases (named A/B and x/y in both languages, numeric matrix shared) and examples that illustrate EF1, EFX, and NSW. `locale.ts` exports `copy`, `selectLocale(acceptLanguage,savedPreference)`, `localePath`. Middleware redirects `/` to selected locale (manual choice saved in cookie `fair-locale`; fallback `Accept-Language` specifically for `zh-TW`, otherwise `en`), but bypasses `/api`, static resources, and explicit locale URLs. Language switch changes only locale prefix and persists cookie via client `document.cookie` (`SameSite=Lax; Path=/`); existing case IDs and any locally recorded votes remain unchanged. Root layout uses `lang` and translated title; lesson text explicitly distinguishes checking versus optimizing NSW, EF1 existence conditions, EFX definition, numerical estimate, and informal survey limitations. Do not hardcode English prose inside components.
- [ ] **Step 4: Verify green.** `npm test -- tests/i18n.test.ts && npm run build`; expect pass. Add test of all translation keys and direct `/zh-TW`/`/en` render.
- [ ] **Step 5: Commit.** `git add src/i18n src/components/LanguageSwitch.tsx src/middleware.ts src/app && git commit -m "feat: add bilingual guided fair division lesson"`.

### Task 5: Publish a case and build proposed allocations

**Files:** Create `src/components/CaseEditor.tsx`, `src/components/AllocationEditor.tsx`, `src/app/[locale]/cases/new/page.tsx`, `src/app/[locale]/cases/[id]/page.tsx`, `tests/case-editor.test.tsx`; add `@testing-library/react @testing-library/user-event jsdom` dev dependencies and Vitest jsdom configuration for `.tsx` tests.

**Interfaces:** `CaseEditor({locale}:{locale:Locale})` sends Task 3 `POST /api/cases`; `AllocationEditor({locale,caseId,caseData})` sends `POST /api/cases/:id/allocations`; both navigate to language-prefixed shared URLs. `CaseData` is Task 1 `CaseInput`.

- [ ] **Step 1: Write failing component tests** with jsdom and mocked `fetch`/navigation:

```tsx
import {render,screen} from '@testing-library/react';
import {expect,test} from 'vitest';
import {CaseEditor} from '../src/components/CaseEditor';
test('editor displays valuation grid and forbids empty publish', () => {
 render(<CaseEditor locale="zh-TW"/>);
 expect(screen.getByRole('button',{name:/發布/})).toBeDisabled();
});
```

Add test assigning every item exactly once and a failed POST with localized retry message.
- [ ] **Step 2: Verify red.** `npm test -- tests/case-editor.test.tsx`; expect missing component.
- [ ] **Step 3: Implement.** `CaseEditor` lets users add/remove agent and item rows, edit unique nonblank names and a rectangular matrix, preview before publish, submit only valid inputs, and display server validation errors from dictionaries. Respect 64-KiB JSON limit without fixed small row limit. `AllocationEditor` renders each item with an owner select (initially unassigned), disables submission until all have valid owners, and sends `owners` in item order. Page routes load public case metadata and expose share link for case and allocation; after submit navigate to allocation rating page, not directly to ranked results. User-entered names render as React text, never `dangerouslySetInnerHTML`.
- [ ] **Step 4: Verify green.** `npm test -- tests/case-editor.test.tsx && npm run build`; expect pass. Add manual keyboard navigation check for value grid and owner select.
- [ ] **Step 5: Commit.** `git add src/components/CaseEditor.tsx src/components/AllocationEditor.tsx src/app/'[locale]'/cases tests/case-editor.test.tsx package.json package-lock.json vitest.config.ts && git commit -m "feat: let visitors publish and allocate shared cases"`.

### Task 6: Blind rating, explanatory reveal, and within-case leaderboard

**Files:** Create `src/components/RatingGate.tsx`, `src/components/ScoreExplanation.tsx`, `src/components/Leaderboard.tsx`, `src/app/[locale]/allocations/[id]/page.tsx`, `tests/rating-gate.test.tsx`.

**Interfaces:** `RatingGate({locale,allocationId,caseData,owners})`; consumes rating POST then result GET only after successful vote; browser `localStorage` key `fair-rated:<allocationId>` saved only on HTTP 201. `ScoreExplanation` consumes trusted `Score` with decimal utility strings. `Leaderboard` consumes ordered Task 3 case allocation results and groups equal `nsw` ranks.

- [ ] **Step 1: Write failing tests.**

```tsx
import {render,screen} from '@testing-library/react';
import {expect,test,vi} from 'vitest';
import {RatingGate} from '../src/components/RatingGate';
test('no metrics or aggregate network request before rating succeeds', async () => {
 const fetchSpy=vi.spyOn(globalThis,'fetch');
 render(<RatingGate locale="en" allocationId="a" caseData={{agents:['A'],items:['x'],values:[[1]]}} owners={[0]}/>);
 expect(screen.queryByText(/NSW score/i)).toBeNull();
 expect(fetchSpy).not.toHaveBeenCalledWith(expect.stringContaining('/results'),expect.anything());
});
```

Add tests for POST failure (no localStorage mark), accepted vote (reveals), already-rated browser (no repeat POST), equal-score ties and zero product.
- [ ] **Step 2: Verify red.** `npm test -- tests/rating-gate.test.tsx`; expect missing components.
- [ ] **Step 3: Implement.** Direct allocation URL first shows valuation matrix, owners, and 1–5 translated question only; `RatingGate` does not request result/ranking/aggregate before POST succeeds or browser-local prior vote is found. It must not call the public case leaderboard endpoint early, even though the API itself is public. On 201 store voted ID, render trusted score (EF1/EFX witness with names/items), rating histogram/count/mean, and reveal the leaderboard link and optional fractional comparison. On local previously rated, request read-only result; document that localStorage is not a unique-voter guarantee. Render baseline label and visitor allocations distinctly. Leaderboard reads `nsw` as exact decimal strings from server ordering and uses equality for tied ranks; never parse large NSW into JS `number`. If visitor navigates to case page before voting, keep leaderboard behind a rating interaction for the selected allocation in the intended UI. Use the shared i18n dictionary for every label and error.
- [ ] **Step 4: Verify green.** `npm test -- tests/rating-gate.test.tsx && npm run build`; expect pass. Manually verify no result/leaderboard API call in browser network tab before first rating.
- [ ] **Step 5: Commit.** `git add src/components/RatingGate.tsx src/components/ScoreExplanation.tsx src/components/Leaderboard.tsx src/app/'[locale]'/allocations tests/rating-gate.test.tsx && git commit -m "feat: reveal formal results after anonymous fairness rating"`.

### Task 7: Independent numerical solver for fractional NSW

**Files:** Create `solver/requirements.txt`, `solver/optimizer.py`, `solver/app.py`, `solver/test_optimizer.py`, `solver/Dockerfile`.

**Interfaces:** Authenticated `POST /solve` with `{values:number[][]}` and `Authorization: Bearer <SOLVER_TOKEN>` returns `{status:'estimated',value:string}` or `{status:'unavailable'}`. No DB access. Independent of Next UI.

- [ ] **Step 1: Write failing solver tests.**

```py
from optimizer import solve

def test_disjoint_interests():
    result = solve([[3, 0], [0, 2]])
    assert result['status'] == 'estimated'
    assert abs(float(result['value']) - 6.0) < 1e-5

def test_zero_attainable_nsw():
    assert solve([[0, 0], [1, 1]]) == {'status':'estimated','value':'0'}
```

Add a single-item two-agent test with positive values (fractional allocation better than indivisible allocation) and invalid matrix test. Test `solve([[1],[1]])` against the analytical fractional product `0.25`.
- [ ] **Step 2: Verify red.** In `solver/`, create Python 3.11 virtual environment, `pip install -r requirements.txt` with `fastapi uvicorn scipy numpy pytest httpx`; run `pytest -q`; expect import failure.
- [ ] **Step 3: Implement.** Optimize fractional assignments `x[i,g] ∈ [0,1]`, `sum_i x[i,g]=1`; for agents with at least one positive value, maximize `sum_i log(sum_g v[i,g]*x[i,g])` using SciPy SLSQP with equal fractions as feasible starting point, analytic gradient, guarded positive utility and bounded iterations. If any agent values all goods zero, return exact zero. Recheck constraint residual and finite positive utilities before returning decimal formatted estimated product (`exp(sum(log utilities))`); return `unavailable` on convergence/precision failure or overflow, never a falsely certified upper bound. `app.py` provides unauthenticated `GET /health` returning 200 without running the optimizer, validates solve request shape and bearer token with `secrets.compare_digest`, enforces a 64-KiB request byte bound, calls solver with finite execution budget (deploy service request timeout + a killable worker process for solver timeout), and returns unavailable if resource budget exceeded. Dockerfile runs one bounded worker with nonroot user. Document env `SOLVER_TOKEN` and CPU/memory/time limits in `solver/README.md` (create it in this task).
- [ ] **Step 4: Verify green.** `cd solver && pytest -q`; expect pass. Add FastAPI tests asserting 200 on `/health`, 401 on `/solve` without token, and 200/`unavailable` on solver timeout; build image using `docker build -t fair-solver solver` and smoke test locally.
- [ ] **Step 5: Commit.** `git add solver && git commit -m "feat: estimate fractional NSW in isolated bounded solver"`.

### Task 8: On-demand, cached solver integration

**Files:** Create `src/app/api/cases/[id]/fractional/route.ts`, `src/components/FractionalComparison.tsx`, `tests/fractional-api.test.ts`; modify `src/server/repository.ts`, `src/i18n/copy.ts`, case result view.

**Interfaces:** Consumes Task 7 `/solve`, Task 2 `getFractional/setFractional`, Task 3 rate limiter. Exposes HTTP fractional contract above. A browser calls it only after rating/reveal; repeated calls use case-ID cache.

- [ ] **Step 1: Write failing tests** mocking solver HTTP:

```ts
import {expect,test,vi} from 'vitest';
import {POST} from '../src/app/api/cases/[id]/fractional/route';
import {createCase} from '../src/server/repository';
import {parseCase} from '../src/domain/model';
test('solver error returns unavailable for a real case', async () => {
 const {id}=await createCase(parseCase({agents:['A','B'],items:['x'],values:[[1],[1]]}));
 vi.spyOn(globalThis,'fetch').mockRejectedValueOnce(new Error('timeout'));
 const response=await POST(new Request(`http://localhost/api/cases/${id}/fractional`,{method:'POST'}),{params:Promise.resolve({id})});
 expect(response.status).toBe(200);
 expect(await response.json()).toEqual({status:'unavailable'});
});
```

Use a disposable database with migrations and env `SOLVER_URL`, `SOLVER_TOKEN`, `RATE_LIMIT_SALT`. Also test cached result avoids second solver call and copy distinguishes estimated/pending/unavailable.
- [ ] **Step 2: Verify red.** `npm test -- tests/fractional-api.test.ts`; expect missing route.
- [ ] **Step 3: Implement.** Authenticate outbound solver request using server-only token and AbortController deadline (e.g. 8 seconds). POST includes case values loaded by ID, never trusts client-provided values. Use `claimFractional(id)` as a conditional `UPDATE cases SET fractional_status='running', fractional_started_at=now() WHERE id=$1 AND (fractional_status IS NULL OR fractional_status='unavailable' OR (fractional_status='running' AND fractional_started_at < now()-interval '30 seconds')) RETURNING id`; if it returns false, read the cached state and return `pending` for an active claim or `estimated` for a completed result. Cache `estimated` and `unavailable`; explicit retries of `unavailable` are rate limited. `FractionalComparison` shows `pending` while only its own request is running, `estimated` numeric text without claiming certification, or translated `unavailable` and optional explicit retry (rate limited). Keep this request separate from normal case/results loading. Do not block voting, ranking, or SSR on solver latency.
- [ ] **Step 4: Verify green.** `npm test -- tests/fractional-api.test.ts && npm run build`; expect pass. Simulate solver timeout and verify rating and leaderboard endpoints still respond.
- [ ] **Step 5: Commit.** `git add src/app/api/cases/'[id]'/fractional src/components/FractionalComparison.tsx src/server/repository.ts src/i18n/copy.ts tests/fractional-api.test.ts && git commit -m "feat: expose cached optional fractional comparison"`.

### Task 9: Full bilingual browser flow

**Files:** Create `playwright.config.ts`, `tests/e2e/learning.spec.ts`; modify i18n text/components/API adapters only where tests expose gaps.

**Interfaces:** Test the published HTTP/UI contracts end to end against a disposable PostgreSQL database and running Next server; mock only external solver failure/timeout, not core case and vote APIs.

- [ ] **Step 1: Write failing browser tests.**

```ts
import {test,expect} from '@playwright/test';
test('Traditional Chinese flow shares case and gates reveal', async ({page}) => {
 await page.goto('/zh-TW/cases/new');
 await page.getByRole('button',{name:'新增參與者'}).click();
 await page.getByRole('button',{name:'新增物品'}).click();
 await page.getByLabel('參與者 1 名稱').fill('A');
 await page.getByLabel('參與者 2 名稱').fill('B');
 await page.getByLabel('物品 1 名稱').fill('x');
 await page.getByLabel('物品 2 名稱').fill('y');
 await page.getByLabel('A 對 x 的估值').fill('3');
 await page.getByLabel('A 對 y 的估值').fill('0');
 await page.getByLabel('B 對 x 的估值').fill('0');
 await page.getByLabel('B 對 y 的估值').fill('2');
 await page.getByRole('button',{name:'發布案例'}).click();
 await expect(page).toHaveURL(/\/zh-TW\/cases\/[0-9a-f-]+$/);
 await page.getByLabel('x 的歸屬').selectOption({label:'A'});
 await page.getByLabel('y 的歸屬').selectOption({label:'B'});
 await page.getByRole('button',{name:'提交分配'}).click();
 await expect(page).toHaveURL(/\/zh-TW\/allocations\/[0-9a-f-]+$/);
 await expect(page.getByText('NSW 分數')).toHaveCount(0);
 await page.getByLabel('公平程度').selectOption('5');
 await page.getByRole('button',{name:'提交評分'}).click();
 await expect(page.getByText('NSW 分數')).toBeVisible();
 await expect(page.getByText('6',{exact:true})).toBeVisible();
 const allocationId=page.url().split('/').pop();
 await page.getByRole('button',{name:'English'}).click();
 await expect(page).toHaveURL(new RegExp(`/en/allocations/${allocationId}$`));
 await expect(page.getByText('NSW score')).toBeVisible();
});
```

Use these exact accessible names when implementing Task 5/6 and add a second test that sets browser language `en`, visits a direct shared allocation link, rates it, and mocks a solver failure to confirm comparison unavailable without breaking the leaderboard. Add tests for round-robin baseline, tied zero NSW, invalid data, keyboard control, and a 429 response.
- [ ] **Step 2: Verify red.** `npx playwright test tests/e2e/learning.spec.ts`; expect missing or failing flow.
- [ ] **Step 3: Implement browser runner and fixes.** `playwright.config.ts` starts `npm run dev` with `DATABASE_URL` test DB; reset DB/migrations between e2e suites so shared votes do not leak. Ensure the test runner uses serial workers for DB reset, and set a fixed solver-unavailable mock response at the outgoing Next→solver HTTP boundary for its failure-path test. Fix only observed discrepancies; do not add accounts or cross-case rankings.
- [ ] **Step 4: Verify green.** Run `npm test`, `npm run build`, `cd solver && pytest -q`, and `npx playwright test` fresh; inspect exit codes. Check `git diff --check`, and manually review both locales, direct share links, mobile-width controls, and solver-unavailable behavior. Record any environment blockers instead of claiming unrun tests passed.
- [ ] **Step 5: Commit.** `git add playwright.config.ts tests/e2e src && git commit -m "test: verify bilingual learning and voting journey"`.

### Task 10: Deploy the web frontend/API and private solver with Docker Compose

**Files:** Create `Dockerfile`, `.dockerignore`, `compose.yaml`, `.env.compose.example`, `tests/smoke/compose.sh`, `README.md`; modify `next.config.ts` to use `output:'standalone'`, `solver/Dockerfile` and `src/app/api/health/**` only if the production smoke test demonstrates a failure.

**Interfaces:** Consumes the Task 2 migration runner, Task 3 `GET /api/health/live` and `GET /api/health/ready`, and Task 7 `GET /health`. Produces `docker compose build`, `docker compose run --rm migrate`, and `docker compose up -d`; publishes only `${WEB_BIND:-127.0.0.1}:${WEB_PORT:-3000}:3000`. Set `WEB_BIND=0.0.0.0` explicitly only when deliberately exposing directly without a reverse proxy.

- [ ] **Step 1: Write failing production smoke test.** `tests/smoke/compose.sh` uses `set -euo pipefail`, requires `DATABASE_URL`, `SOLVER_TOKEN`, and `RATE_LIMIT_SALT`, then executes:

```bash
export DATABASE_URL SOLVER_TOKEN RATE_LIMIT_SALT
export WEB_PORT=3188 WEB_BIND=127.0.0.1
docker compose -f compose.yaml build
docker compose -f compose.yaml run --rm migrate
docker compose -f compose.yaml up -d --wait web solver
curl --fail http://127.0.0.1:3188/api/health/live
curl --fail http://127.0.0.1:3188/api/health/ready
curl --fail http://127.0.0.1:3188/en
curl --fail http://127.0.0.1:3188/zh-TW
curl --fail http://127.0.0.1:3188/api/cases/not-a-uuid || test "$?" -eq 22
! docker compose -f compose.yaml port solver 8000
```

Wrap the script in `trap 'docker compose -f compose.yaml down' EXIT` so test services stop without touching external PostgreSQL. Against a disposable **externally running** PostgreSQL instance, run `bash tests/smoke/compose.sh`; expect failure until Dockerfiles/Compose exist. Add a script assertion that a simple `POST /api/cases` returns 201 and subsequent `GET /api/cases/:id` returns the case; parse JSON via Node, not `grep` on untrusted data.
- [ ] **Step 2: Verify red.** Run `bash tests/smoke/compose.sh` with `DATABASE_URL` pointed at the disposable external DB; expect `compose.yaml` or `Dockerfile` missing, not a credential error. If Docker is unavailable, record this as an unverified deployment check rather than a pass.
- [ ] **Step 3: Implement production images and Compose.** `next.config.ts` sets `output:'standalone'`. Web `Dockerfile` has `node:20-alpine` dependency and build stages using `npm ci`, `npm run build`, then production stage copying `.next/standalone`, `.next/static`, `public` if present, `db`, `scripts/migrate.mjs`, and production `node_modules` (run `npm ci --omit=dev` in a dedicated stage) so `pg` resolves from the migration script; use a nonroot user and `node server.js` for web startup. `solver/Dockerfile` stays a distinct Python image with pinned runtime dependencies, nonroot user, bounded CPU/memory. `.dockerignore` excludes `.git`, `.env*`, `node_modules`, `.next`, test databases, `.venv`, and local build artifacts; the checked-in `.env.compose.example` stays outside the build context, while local `.env.compose` is also gitignored. `compose.yaml` specifies `web`, `solver`, and one-off `migrate` **using the web image**, with `web` port bound to `${WEB_BIND:-127.0.0.1}:${WEB_PORT:-3000}:3000`; `solver` and `migrate` have no `ports`. Use a shared image tag for web and migrate:

```yaml
services:
  web:
    image: fair-web:local
    build: .
    ports: ["${WEB_BIND:-127.0.0.1}:${WEB_PORT:-3000}:3000"]
    environment:
      DATABASE_URL: ${DATABASE_URL:?Set external PostgreSQL URL}
      SOLVER_URL: http://solver:8000
      SOLVER_TOKEN: ${SOLVER_TOKEN:?Set solver token}
      RATE_LIMIT_SALT: ${RATE_LIMIT_SALT:?Set rate limit salt}
    restart: unless-stopped
  solver:
    build: ./solver
    environment:
      SOLVER_TOKEN: ${SOLVER_TOKEN:?Set solver token}
    mem_limit: 512m
    cpus: 1.0
    restart: unless-stopped
  migrate:
    image: fair-web:local
    command: ["node", "scripts/migrate.mjs"]
    environment:
      DATABASE_URL: ${DATABASE_URL:?Set external PostgreSQL URL}
    profiles: ["tools"]
    restart: "no"
```

Override health checks, working directory, and build context as necessary for the image layout; `docker compose run --rm migrate` starts the profile-gated one-off service without starting a third long-running container. Set `SOLVER_URL=http://solver:8000`, `DATABASE_URL`, `SOLVER_TOKEN`, `RATE_LIMIT_SALT` only at runtime. `web` health check uses `GET /api/health/ready`, `solver` uses `GET /health`, each probed by the runtime already present in its image (Node `fetch` / Python `urllib`, no curl dependency); `web` deliberately does **not** depend on solver health, so even an initial solver outage cannot prevent pages, voting, and ranking from starting; both use `restart: unless-stopped`; locally check the solver health before showing comparisons; the one-off migrate service uses `restart: 'no'` and must run before `up` in the documented commands. Configure solver resource limits with Compose-compatible `mem_limit` and `cpus` and a request timeout; `migrate` is manually run before `up` rather than gating a continuously running dependency; do not include external DB or TLS proxy services.
- [ ] **Step 4: Verify green and document deployment.** Run the smoke script against a disposable external PostgreSQL service, then run it a second time to prove migrations are repeatable; assert `/api/health/ready` becomes 503 when the external DB is unavailable and a write request returns 503, while stopping solver after startup leaves core API functioning and fractional comparison unavailable. Restore services and verify health recovery; confirm `docker compose ps`, `docker compose port solver 8000` has no published port, and `docker compose logs web solver` are useful. `README.md` provides exact steps:

```bash
cp .env.compose.example .env.compose
# Set external DATABASE_URL, random SOLVER_TOKEN, and RATE_LIMIT_SALT in .env.compose; never commit it.
docker compose --env-file .env.compose build
docker compose --env-file .env.compose run --rm migrate
docker compose --env-file .env.compose up -d --wait
# Point a host reverse proxy with HTTPS at 127.0.0.1:3000.
docker compose --env-file .env.compose ps
docker compose --env-file .env.compose logs -f web solver
```

Document Node/Python/Postgres dev prerequisites, external PostgreSQL network/TLS requirements, `.env.example` for local development, DNS/reverse-proxy responsibility, `npm test`, `npm run build`, `cd solver && pytest -q`, `npx playwright test`, solver resource limits, 503/timeout behavior, two-language copy review, and nonrepresentative-rating caveat. No secrets in Git or images.
- [ ] **Step 5: Commit.** `git add Dockerfile .dockerignore compose.yaml .env.compose.example tests/smoke/compose.sh README.md next.config.ts solver/Dockerfile && git commit -m "feat: deploy web and solver with external Postgres via Compose"`.

## Self-review checkpoints

- Guided examples, user-created immutable cases, deterministic randomized round robin, server-trusted EF1/EFX/NSW, blind 1–5 rating, per-allocation histogram, same-case NSW leaderboard, two-language end-to-end path, optional fractional estimate, public-input safety, and research caveat each map to a task above.
- First implementation review should check database isolation of tests, Next.js route-handler version compatibility, fractional optimizer numerical claims, and that translation dictionaries cover all errors and loading states. If implementation reveals an API or mathematics ambiguity, stop and amend the spec/plan before silently changing product behavior.
