# Warm Editorial UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task in the current session. Steps use checkbox (`- [ ]`) syntax for tracking. Do not delegate unless the operator explicitly requests delegation.

**Goal:** Turn the unstyled bilingual fair-allocation web app into a responsive guided learning experience, including a real seeded example, while keeping voting gated before results.

**Architecture:** Add one global CSS token system to the existing Next.js locale layout and improve existing routes/components, not APIs or score math. Insert one deterministic curated case and baseline via an idempotent database migration, validated against domain scoring in tests. All new interface copy lives in the existing locale dictionary.

**Tech Stack:** Next.js App Router, React, TypeScript, CSS, PostgreSQL migration, Vitest/Testing Library, Playwright.

**Spec:** `docs/ui-design-spec.md` (read it first; it defines final copy, states and responsive design).

## Global Constraints

- Existing user edits to `README.md`, `docs/superpowers/specs/2026-09-23-fair-division-learning-site-design.zh-TW.md`, `next-env.d.ts` must remain intact. Do not stage them or blindly reset the worktree.
- No dependency on external fonts, component libraries, Canvas/WebGL or a separate HTML prototype. Preserve current API shapes, server scoring and bilingual `en` / `zh-TW` routes.
- On an allocation detail page, do not show EF1, EFX, NSW, aggregate, leaderboard or fractional results until vote accepted or local marker confirms previous vote. On failed POST do not set local marker.
- New user-facing copy must exist in both locales in `src/i18n/copy.ts`; use exact score strings and identify the fractional result as an estimate, not an indivisible optimum.
- Mobile controls at least 44 px tall, visible focus, semantic labels, reduced-motion handling, and no matrix-induced page overflow.
- Finish every task with failing-then-passing tests, scoped commit, and a short verification report. Run full `npm test` and `npm run build` at the end; browser tests require a migrated database.

## File responsibilities / interface map

- `db/002_curated_example.sql`: immutable fixed-ID curated case + baseline; no runtime seed writes.
- `src/shared/example.ts`: exported `EXAMPLE_CASE_ID` / `EXAMPLE_ALLOCATION_ID`, the same UUIDs used in migration (no DB imports).
- `src/i18n/copy.ts`: all new user-facing strings in both languages.
- `src/app/[locale]/layout.tsx` / `src/app/[locale]/global.css`: global shell and site visual tokens; do not alter unrelated root layout.
- `src/app/[locale]/page.tsx`: accessible hero and link to the example.
- `src/components/CaseEditor.tsx`, `AllocationEditor.tsx`, `RatingGate.tsx`, `ScoreExplanation.tsx`, `FractionalComparison.tsx`, `Leaderboard.tsx`: focused UI for their current responsibilities.
- `src/app/[locale]/cases/[id]/page.tsx`, `src/app/[locale]/allocations/[id]/page.tsx`: page composition and localized not-found states.
- `tests/*`: UI/seed/flow regressions.

---

### Task 1: Curated example as a real, stable learning link

**Files:** Create `db/002_curated_example.sql`, `src/shared/example.ts`, `tests/curated-example.test.ts`; modify `src/app/[locale]/page.tsx`, `tests/e2e/learning.spec.ts`.

**Interfaces:** `EXAMPLE_CASE_ID` and `EXAMPLE_ALLOCATION_ID` are string UUID constants. Migration must be safe on rerun and on existing installations. Sample people Maya/Leo, items Sketchbook/Lantern/Notebook, values `[[8,5,2],[2,6,7]]`, seed 1; owners `[0,1,1]`, utilities `['8','13']`, NSW `'104'`, EF1/EFX true.

- [ ] **Step 1: Write failing seed test** in `tests/curated-example.test.ts` using `readFileSync` and the domain scorer. Assert migration text contains both constant UUIDs and `ON CONFLICT (id) DO NOTHING`, and that `roundRobin(sample,1)` and `toJsonScore(scoreAllocation(sample,[0,1,1]))` match the values above. Under `TEST_DATABASE_URL`, also assert `getCase(EXAMPLE_CASE_ID)` and `getAllocation(EXAMPLE_ALLOCATION_ID)` reflect that data after migration.

```ts
import { expect, test } from 'vitest';
import { roundRobin } from '../src/domain/round-robin';
import { scoreAllocation, toJsonScore } from '../src/domain/score';
const sample={agents:['Maya','Leo'],items:['Sketchbook','Lantern','Notebook'],values:[[8,5,2],[2,6,7]]};
test('guided example has a reproducible trusted baseline',()=>{
 expect(roundRobin(sample,1)).toEqual([0,1,1]);
 expect(toJsonScore(scoreAllocation(sample,[0,1,1]))).toMatchObject({utilities:['8','13'],nsw:'104',ef1:true,efx:true});
});
```

- [ ] **Step 2: Run** `npx vitest run tests/curated-example.test.ts`; expect missing module/seed assertion failure.
- [ ] **Step 3: Implement migration** with fixed UUIDs `00000000-0000-4000-8000-000000000101` (case), `00000000-0000-4000-8000-000000000102` (allocation); insert case with `baseline_seed=1`, then baseline with score JSON `{"utilities":["8","13"],"nsw":"104","ef1":true,"efx":true}` and numeric NSW `104`, each `ON CONFLICT (id) DO NOTHING`. Use `INSERT ... SELECT ... WHERE` for allocation so it cannot be inserted against an absent case. Define matching TS constants in `src/shared/example.ts`. Add home CTA as actual `<a href={`/${l}/allocations/${EXAMPLE_ALLOCATION_ID}`}>` and secondary case creation link; do not render scores on home. Add a Playwright home-link check in the existing DB-gated suite.
- [ ] **Step 4: Run** `npx vitest run tests/curated-example.test.ts` and `npm run build`; expect PASS. If `TEST_DATABASE_URL` exists, apply migration with `DATABASE_URL=... node scripts/migrate.mjs` then run the DB assertion twice to verify idempotence.
- [ ] **Step 5: Commit** `git add db/002_curated_example.sql src/shared/example.ts src/app/'[locale]'/page.tsx tests/curated-example.test.ts tests/e2e/learning.spec.ts && git commit -m "feat: seed guided fair-division example"`.

### Task 2: Shared bilingual shell, content and CSS foundation

**Files:** Create `src/app/[locale]/global.css`, `tests/home-ui.test.tsx`; modify `src/app/[locale]/layout.tsx`, `src/app/[locale]/page.tsx`, `src/i18n/copy.ts`, `src/components/LanguageSwitch.tsx` only if needed for accessible name.

**Interfaces:** Keep existing translation keys unchanged; add keys for hero, 3-step explanation, example CTA, helper and shell labels in *both* locales. Import CSS once in locale layout; retain `<html lang={l}>` and the existing language-switch behavior.

- [ ] **Step 1: Write failing test** in `tests/home-ui.test.tsx` (jsdom) that renders `LocalePage({params:Promise.resolve({locale:'zh-TW'})})` via `await` and checks headings, a first-example link containing the shared UUID, a create-case link, and no `'NSW 分數'` text. Test both locale dictionary entries for every added key.
- [ ] **Step 2: Run** `npx vitest run tests/home-ui.test.tsx`; expect example/intro assertions to fail.
- [ ] **Step 3: Implement** shared header/skip link/main container and home composition. Example shell: `<a className="skip-link" href="#main-content">{copy[l].skipToContent}</a><header className="site-header">…</header>{children}` and page: `<main id="main-content" className="container">…</main>`. In CSS define the exact palette and spacing from the spec (`--paper:#F8F5EE`, `--ink:#20342F`, `--teal:#205E52`, etc.), type scales, `.site-header`, `.container`, `.hero`, `.button`, `.card`, `.field`, `.sr-only`, `.skip-link`, `:focus-visible`, reduced-motion and responsive stacking. Ensure each page has one `<main id="main-content">`; layout provides header/skip link but not a second `<main>`. Avoid raw `style` attribute and external fonts.
- [ ] **Step 4: Run** `npx vitest run tests/home-ui.test.tsx tests/i18n.test.ts` and `npm run build`; expect PASS.
- [ ] **Step 5: Commit** only Task 2 files: `git add src/app/'[locale]'/global.css src/app/'[locale]'/layout.tsx src/app/'[locale]'/page.tsx src/i18n/copy.ts src/components/LanguageSwitch.tsx tests/home-ui.test.tsx && git commit -m "feat: add bilingual editorial shell and styles"`.

### Task 3: Case authoring and allocation workspace

**Files:** Modify `src/components/CaseEditor.tsx`, `AllocationEditor.tsx`, `Leaderboard.tsx`, `src/app/[locale]/cases/[id]/page.tsx`, `src/app/[locale]/cases/new/page.tsx`, `src/i18n/copy.ts`, `src/app/[locale]/global.css`, `tests/case-editor.test.tsx`; create `src/components/ValueMatrix.tsx` if a shared accessible table removes duplication.

**Interfaces:** Editors continue calling `POST /api/cases` and `POST /api/cases/[id]/allocations` with unchanged bodies; leaderboard rows retain `{id,kind,nsw,owners}`. `ValueMatrix` takes `{caseData:CaseInput, locale:Locale}` for read-only and editor uses an editable version only if that improves clarity; avoid sharing mutable state through the read-only component.

- [ ] **Step 1: Write failing UI tests**: a case page with two agents has matrix column headers and labeled inputs; publishing with blank/duplicate names or invalid integer disables publishing and shows localized inline guidance; allocation shows `0/2` progress and only enables submission at `2/2`; leaderboard links to `/${locale}/allocations/${id}` and ties show equal ranks.

```tsx
const c={agents:['A','B'],items:['x','y'],values:[[3,0],[0,2]]};
render(<AllocationEditor locale="en" caseId="case" caseData={c}/>);
expect(screen.getByText(/0\s*\/\s*2/)).toBeTruthy();
expect((screen.getByRole('button',{name:'Submit allocation'}) as HTMLButtonElement).disabled).toBe(true);
```

- [ ] **Step 2: Run** `npx vitest run tests/case-editor.test.tsx tests/rating-gate.test.tsx`; expect new assertions FAIL.
- [ ] **Step 3: Implement** grouped case input sections and a scrollable `<table>` (`<caption>`, `<thead><th scope="col">`, `<th scope="row">`); provide stable `id`/label for inputs and avoid duplicate accessible names. Add preview and bound integer validation (0–1,000,000, names 1–80 chars and uniqueness), show server errors without clearing entered data; loading boolean with disabled submit and `aria-busy`. Case page renders matrix, assignment form, share link with URL text fallback, sorted leaderboard via existing repo ordering, and localized not-found page. Avoid raw JSON and leaked result panel on pre-vote detail. Preserve existing `getCase`, `listAllocations` queries.
- [ ] **Step 4: Run** `npx vitest run tests/case-editor.test.tsx tests/rating-gate.test.tsx` and `npm run build`; expect PASS. Manually check `tests/e2e/learning.spec.ts` selectors remain valid.
- [ ] **Step 5: Commit** only Task 3 source/tests with `git add` explicit paths and `git commit -m "feat: improve case authoring and allocation workspace"`.

### Task 4: Vote-first detail and honest results

**Files:** Modify `src/components/RatingGate.tsx`, `ScoreExplanation.tsx`, `FractionalComparison.tsx`, `src/app/[locale]/allocations/[id]/page.tsx`, `src/i18n/copy.ts`, `src/app/[locale]/global.css`, `tests/rating-gate.test.tsx`, `tests/e2e/learning.spec.ts`.

**Interfaces:** Keep `RatingGate` props and results API response types; new UI state may be `rating: string`, `pending: boolean`, `result: Result | null`, `error: string`. If POST response lacks `caseId`, render the case link only when present; do not call `/results` before local marker. When GET on existing marker fails, expose a retry button that repeats GET, not POST.

- [ ] **Step 1: Write failing tests** for pre-vote absence of metrics/aggregate/fractional and zero GET requests; 1–5 keyboard-operable selection and disabled pending submit; failed POST preserves selection and leaves storage untouched; successful POST reveals exact score/histogram and writes marker; already-voted marker calls GET and GET failure shows retry; Traditional Chinese results have no hard-coded English `Votes`, `witness`, or `true`/`false`.
- [ ] **Step 2: Run** `npx vitest run tests/rating-gate.test.tsx`; expect new assertions FAIL.
- [ ] **Step 3: Implement** item-owner groups and the accessible 1–5 choice control (keeping a native `<select aria-label={t.fairnessLabel}>` is acceptable and protects existing e2e), labels for very unfair / very fair, pending and retry states. Replace raw result string with score summary, localized EF1/EFX verdict and witness, per-person utilities and histogram with accessible counts. Show fraction comparison only after results, with on-demand status and retry. Keep current vote-before-results data flow and EFX convention copy.
- [ ] **Step 4: Run** `npx vitest run tests/rating-gate.test.tsx tests/i18n.test.ts` and `npm run build`; expect PASS. If migrated DB and browsers exist, run `npx playwright test tests/e2e/learning.spec.ts` and check both language routes.
- [ ] **Step 5: Commit** only Task 4 source/tests via explicit `git add` paths and `git commit -m "feat: redesign vote-first results experience"`.

### Task 5: Final web quality and integration gate

**Files:** Modify `src/app/[locale]/global.css`, affected localization/components/tests if verification reveals defects; create `tests/ui-contract.test.ts` for coverage of copy keys/example links if needed. Do not change `README.md` or existing dirty files to claim completion.

- [ ] **Step 1: Add failing regression assertions** for any uncovered issue found in review, e.g. home CTA targets a seeded allocation, every new translation key exists in both locales, leaderboard link honors locale, and no fetched result before rating. State exact observed failure in the commit message.
- [ ] **Step 2: Run** `npm test && npm run build && npx tsc --noEmit` and, if a disposable migrated PostgreSQL and browser are configured, `npx playwright test`; otherwise record what was skipped and why. Expected: all available commands exit 0.
- [ ] **Step 3: Review responsive and accessible behavior** at 390, 768 and 1440 px if browser available: no page overflow (matrix may scroll within region), keyboard focus, 44 px actions, visible errors/loading, no score leak, reduced-motion behavior, English and Traditional Chinese. Fix a witnessed defect only after adding a targeted failing test.
- [ ] **Step 4: Run the full verification commands again** after any fix; inspect `git diff --check`, `git status --short`, and ensure the three originally dirty files are unchanged by our work.
- [ ] **Step 5: Commit** only additional Task 5 changes if any; report tests and remaining browser/database limitations. No merge, PR or deploy without owner request.
