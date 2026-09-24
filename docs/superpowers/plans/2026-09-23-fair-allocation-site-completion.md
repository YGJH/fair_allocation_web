# Fair Allocation Site Completion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Finish all four bilingual fair-allocation flows and make the curated learning example fully usable without PostgreSQL while preserving honest server-backed behavior for user content.

**Architecture:** Define one immutable curated example and narrowly fall back to it only for its reserved IDs. Keep the rating gate intact, but let a visitor explicitly choose a non-persistent local reveal if the curated example’s rating endpoint is unavailable. Complete page states and application styling around the existing APIs and scoring domain without adding dependencies or changing scoring contracts.

**Tech Stack:** Next.js App Router, React, TypeScript, PostgreSQL, Vitest, Testing Library, Playwright, CSS.

**Spec:** `docs/superpowers/specs/2026-09-23-fair-allocation-site-completion-design.md`

## Global Constraints

- Preserve existing score formulas and public API response structures.
- Restrict database-free behavior to `EXAMPLE_CASE_ID` and `EXAMPLE_ALLOCATION_ID`; never fabricate community data.
- Keep EF1, EFX, NSW, aggregate ratings, rank, and fractional results hidden until the rating gate opens.
- Add every new user-facing string to both English and Traditional Chinese in `src/i18n/copy.ts`.
- Do not add UI, animation, font, or state-management dependencies.
- Respect `prefers-reduced-motion`, keyboard access, visible focus, 44px targets, and 390px layouts.
- Preserve unrelated dirty files: `README.md`, `docs/superpowers/specs/2026-09-23-fair-division-learning-site-design.zh-TW.md`, and `next-env.d.ts`.

## File structure

- Modify `src/shared/example.ts`: single source of truth for curated case, owners, and scored allocation.
- Modify `src/server/repository.ts`: narrow curated read fallback and exported unavailable-error classifier.
- Modify `src/app/[locale]/cases/[id]/page.tsx`: distinguish curated, unavailable, and not-found states.
- Modify `src/app/[locale]/allocations/[id]/page.tsx`: pass trusted curated fallback result into the gate.
- Modify `src/components/RatingGate.tsx`: accessible five-choice rating UI and explicit local-only reveal.
- Modify `src/components/ScrollScene.tsx`: meaningful named destinations and assigned goods.
- Modify `src/components/CaseEditor.tsx`: guided authoring, localized labels, and concrete review summary.
- Modify `src/components/AllocationEditor.tsx`: accessible ownership controls and failure preservation.
- Modify `src/components/Leaderboard.tsx`: exact score labeling and honest empty state.
- Modify `src/i18n/copy.ts`: all new copy and state labels.
- Modify `src/app/[locale]/global.css`, `screens.css`, and `story.css`: consolidated responsive visual system and purposeful motion.
- Add/modify focused Vitest tests and Playwright route tests listed in each task.

---

### Task 1: Immutable curated example and repository fallback

**Files:**
- Modify: `src/shared/example.ts`
- Modify: `src/server/repository.ts`
- Create: `tests/example-fallback.test.ts`

**Interfaces:**
- Produces: `EXAMPLE_CASE: CaseInput`, `EXAMPLE_OWNERS: Allocation`, `EXAMPLE_SCORE: JsonScore`.
- Produces: `isRepositoryUnavailable(error: unknown): boolean` for page-level state selection.
- Changes: `getCase`, `getAllocation`, and `listAllocations` return immutable curated records for reserved IDs when a query fails or returns no seeded row.
- Consumes: `scoreAllocation()` and `toJsonScore()` from `src/domain/score.ts`.

- [ ] **Step 1: Write failing fallback tests**

Create `tests/example-fallback.test.ts` with module-mocked database calls and assertions equivalent to:

```ts
import { beforeEach, describe, expect, it, vi } from 'vitest';

const query = vi.fn();
vi.mock('../src/server/db', () => ({
  query,
  withClient: vi.fn(),
}));

describe('curated example fallback', () => {
  beforeEach(() => query.mockReset());

  it('returns the curated case when PostgreSQL is unavailable', async () => {
    query.mockRejectedValueOnce(Object.assign(new Error('connect ECONNREFUSED'), { code: 'ECONNREFUSED' }));
    const { getCase } = await import('../src/server/repository');
    const { EXAMPLE_CASE_ID } = await import('../src/shared/example');
    await expect(getCase(EXAMPLE_CASE_ID)).resolves.toMatchObject({
      agents: ['Maya', 'Leo'],
      items: ['Sketchbook', 'Lantern', 'Notebook'],
    });
  });

  it('does not turn an unavailable unknown id into example data', async () => {
    query.mockRejectedValueOnce(Object.assign(new Error('connect ECONNREFUSED'), { code: 'ECONNREFUSED' }));
    const { getCase } = await import('../src/server/repository');
    await expect(getCase('11111111-1111-4111-8111-111111111111')).rejects.toThrow('ECONNREFUSED');
  });
});
```

Also assert the built-in score equals `toJsonScore(scoreAllocation(EXAMPLE_CASE, EXAMPLE_OWNERS))` and that `listAllocations(EXAMPLE_CASE_ID)` returns exactly one baseline row rather than fake visitors.

- [ ] **Step 2: Run the focused tests and confirm RED**

Run: `npx vitest run tests/example-fallback.test.ts`

Expected: FAIL because curated data and repository fallback are not implemented.

- [ ] **Step 3: Define immutable example data and narrow fallbacks**

In `src/shared/example.ts`, export typed frozen values:

```ts
export const EXAMPLE_CASE: CaseInput = Object.freeze({
  agents: ['Maya', 'Leo'],
  items: ['Sketchbook', 'Lantern', 'Notebook'],
  values: [[8, 5, 2], [2, 6, 7]],
});
export const EXAMPLE_OWNERS: Allocation = Object.freeze([0, 1, 1]) as Allocation;
export const EXAMPLE_SCORE = toJsonScore(scoreAllocation(EXAMPLE_CASE, EXAMPLE_OWNERS));
```

In `src/server/repository.ts`, build a deterministic `StoredAllocation` using the reserved IDs, `kind: 'baseline'`, `nsw: EXAMPLE_SCORE.nsw`, and `score: EXAMPLE_SCORE`. Wrap only curated-ID reads with `try/catch`; rethrow failures for all other IDs. If the database successfully returns no curated row, return the curated record. Add a conservative `isRepositoryUnavailable()` classifier based on PostgreSQL/network error codes rather than error-message rendering.

Because the existing pages already call these repository functions, they consume the fallback without page-specific branching. Leave non-curated failures observable for the explicit page-state handling in Task 5.

- [ ] **Step 4: Run fallback and domain tests and confirm GREEN**

Run: `npx vitest run tests/example-fallback.test.ts tests/domain.test.ts tests/curated-example.test.ts`

Expected: all tests PASS; the score remains NSW `104`, EF1 true, and EFX true.

- [ ] **Step 5: Commit the curated data boundary**

```bash
git add src/shared/example.ts src/server/repository.ts tests/example-fallback.test.ts
git commit -m "feat: serve curated example without database"
```

---

### Task 2: Explicit offline judgment and accessible rating gate

**Files:**
- Modify: `src/components/RatingGate.tsx`
- Modify: `src/app/[locale]/allocations/[id]/page.tsx`
- Modify: `src/components/ScoreExplanation.tsx`
- Modify: `src/i18n/copy.ts`
- Modify: `src/app/[locale]/screens.css`
- Modify: `tests/rating-gate.test.tsx`

**Interfaces:**
- Consumes: `EXAMPLE_SCORE` and curated-ID identity from Task 1.
- Adds prop: `fallbackResult?: { score: JsonScore; caseId: string }` on `RatingGate`.
- Internal result type: `{ score: JsonScore; aggregate: Aggregate | null; caseId?: string; persistence: 'live' | 'local' }`.
- Produces: explicit `useOfflineExample()` action; it never calls an API or creates aggregate data.

- [ ] **Step 1: Add failing rating-gate tests**

Extend `tests/rating-gate.test.tsx` to cover:

```tsx
it('offers, but does not silently trigger, a local reveal after example submission fails', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }));
  render(<RatingGate locale="en" allocationId={EXAMPLE_ALLOCATION_ID}
    caseId={EXAMPLE_CASE_ID} caseData={EXAMPLE_CASE} owners={EXAMPLE_OWNERS}
    fallbackResult={{ score: EXAMPLE_SCORE, caseId: EXAMPLE_CASE_ID }} />);
  await user.click(screen.getByRole('radio', { name: /3/ }));
  await user.click(screen.getByRole('button', { name: /submit rating/i }));
  expect(screen.queryByText(/NSW score/i)).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: /continue without saving/i })).toBeInTheDocument();
});

it('reveals trusted example results without aggregate data only after explicit consent', async () => {
  // Repeat failed submit, click “Continue without saving”, then assert score is visible,
  // local-only copy is visible, and “Responses”/histogram are absent.
});
```

Add assertions that the five ratings are radios inside a named group, selection survives an error, and a non-curated failure never offers the offline action.

- [ ] **Step 2: Run the focused test and confirm RED**

Run: `npx vitest run tests/rating-gate.test.tsx`

Expected: FAIL because ratings are a `<select>` and no explicit offline reveal exists.

- [ ] **Step 3: Implement the gate state machine and localized copy**

Replace the rating `<select>` with a semantic `<fieldset>` containing five radio inputs and visible labels. Keep `result === null` as the sole pre-reveal condition. On failed submission, set a failure state; render the local continuation button only when `fallbackResult` exists. Its handler must set:

```ts
setResult({
  score: fallbackResult.score,
  aggregate: null,
  caseId: fallbackResult.caseId,
  persistence: 'local',
});
localStorage.setItem(`fair-rated-local:${allocationId}`, '1');
```

Do not set the live `fair-rated:` marker. Render the aggregate panel only when `result.aggregate !== null`. Render localized local-only text when `persistence === 'local'`, and do not request fractional comparison in local-only mode because that is backend-dependent. Keep live and previously-rated behavior unchanged.

Pass `fallbackResult` only for the reserved curated allocation from `src/app/[locale]/allocations/[id]/page.tsx`. Add English and Traditional Chinese keys for the offline explanation, continue-without-saving action, live aggregate unavailable note, rating option labels, and assigned bundle values.

- [ ] **Step 4: Style and verify the five-choice control**

Add `.rating-options`, `.rating-option`, checked, hover, disabled, and focus-within rules to `screens.css`. Use text plus border/background changes; no color-only selection. At mobile widths, keep a one-column or readable compact grid with 44px labels.

Run: `npx vitest run tests/rating-gate.test.tsx tests/i18n.test.ts`

Expected: PASS with no pre-reveal score leakage.

- [ ] **Step 5: Commit the resilient rating flow**

```bash
git add src/components/RatingGate.tsx src/components/ScoreExplanation.tsx src/app/[locale]/allocations/[id]/page.tsx src/i18n/copy.ts src/app/[locale]/screens.css tests/rating-gate.test.tsx
git commit -m "feat: add explicit offline example judgment"
```

---

### Task 3: Purposeful home allocation scene

**Files:**
- Modify: `src/components/ScrollScene.tsx`
- Modify: `src/app/[locale]/page.tsx`
- Modify: `src/app/[locale]/story.css`
- Modify: `src/app/[locale]/global.css`
- Modify: `tests/home-ui.test.tsx`
- Modify: `tests/e2e/home.spec.ts`

**Interfaces:**
- Changes: `ScrollScene({ locale }: { locale: Locale })` consumes localized example names and goods through `copy` or curated data.
- Produces DOM hooks: `[data-destination="0"]`, `[data-destination="1"]`, and each good’s `data-owner` for deterministic tests.
- Keeps CSS custom property: `--story-progress` in range `0..1`.

- [ ] **Step 1: Write failing semantic and motion tests**

In `tests/home-ui.test.tsx`, assert that the scene contains two named destination labels, all three curated goods, and owner metadata matching `[0, 1, 1]`. Assert reduced-motion markup still has a meaningful final-state class.

In `tests/e2e/home.spec.ts`, add a browser assertion:

```ts
await page.goto('/en');
await page.locator('[data-scroll-story]').scrollIntoViewIfNeeded();
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
await expect(page.locator('[data-good][data-owner="0"]')).toHaveCSS('opacity', '1');
await expect(page.locator('[data-destination="0"]')).toContainText('Maya');
await expect(page.locator('[data-destination="1"]')).toContainText('Leo');
expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
```

- [ ] **Step 2: Run home tests and confirm RED**

Run: `npx vitest run tests/home-ui.test.tsx && npx playwright test tests/e2e/home.spec.ts --project=chromium`

Expected: component test FAIL because current objects have no destinations or owner mapping. Browser test may also fail until the dev server/browser prerequisite is available.

- [ ] **Step 3: Replace floating symbols with assigned goods and destinations**

Render two labeled destination bundles and three item tiles from `EXAMPLE_CASE.items`/`EXAMPLE_OWNERS`. Keep the visual wrapper decorative as a whole only if equivalent names are already present in adjacent narrative; otherwise expose the labels and hide only paths/background shapes. Use deterministic modifier classes such as `story-good--sketchbook` and `story-good--lantern` rather than `nth-child` ownership.

Map progress so goods begin in a central tray and end fully inside the correct destination:

```css
.story-good{transform:translate(var(--start-x),var(--start-y))}
.story-good[data-owner="0"]{--end-x:-7rem}
.story-good[data-owner="1"]{--end-x:7rem}
.story-good{transform:translate(
  calc(var(--start-x) + (var(--end-x) - var(--start-x)) * var(--story-progress)),
  calc(var(--start-y) + (var(--end-y) - var(--start-y)) * var(--story-progress))
)}
```

If browser support makes mixed custom-property arithmetic unreliable, set each tile’s `translateX/translateY` with explicit `calc(var(--story-progress) * distance)` values. Ensure the progress-1 bounding boxes visually sit inside their destination panels. In reduced motion, force `--story-progress: 1` and disable sticky positioning/transitions so the final allocation is immediately meaningful.

Remove duplicate base story rules from `global.css`; retain generic tokens/layout there and home-motion rules in `story.css`.

- [ ] **Step 4: Run component, browser, and reduced-motion checks**

Run:

```bash
npx vitest run tests/home-ui.test.tsx
npx playwright test tests/e2e/home.spec.ts --project=chromium
```

Expected: all available tests PASS; at 390px there is no body-level horizontal overflow and reduced motion shows settled goods.

- [ ] **Step 5: Commit the meaningful scene**

```bash
git add src/components/ScrollScene.tsx src/app/[locale]/page.tsx src/app/[locale]/story.css src/app/[locale]/global.css tests/home-ui.test.tsx tests/e2e/home.spec.ts
git commit -m "feat: clarify home allocation motion"
```

---

### Task 4: Complete guided case authoring and allocation editing

**Files:**
- Modify: `src/components/CaseEditor.tsx`
- Modify: `src/components/AllocationEditor.tsx`
- Modify: `src/i18n/copy.ts`
- Modify: `src/app/[locale]/screens.css`
- Modify: `tests/case-editor.test.tsx`
- Create: `tests/allocation-editor.test.tsx`

**Interfaces:**
- `CaseEditor` continues posting `{ case: { agents, items, values } }` to `/api/cases`.
- `AllocationEditor` continues posting `{ owners: number[] }` to `/api/cases/:id/allocations`.
- Both preserve their complete local state after non-2xx/network failure and expose `aria-busy` while pending.

- [ ] **Step 1: Add failing editor behavior tests**

Extend `tests/case-editor.test.tsx` to assert localized field labels, duplicate-name feedback associated with the affected section, a review list containing entered people/goods, and retained values after a failed fetch.

Create `tests/allocation-editor.test.tsx` with:

```tsx
it('keeps assignments and exposes progress after a failed submission', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }));
  render(<AllocationEditor locale="en" caseId="case-id" caseData={EXAMPLE_CASE} />);
  await user.selectOptions(screen.getByLabelText(/Sketchbook owner/i), '0');
  await user.selectOptions(screen.getByLabelText(/Lantern owner/i), '1');
  await user.selectOptions(screen.getByLabelText(/Notebook owner/i), '1');
  await user.click(screen.getByRole('button', { name: /submit allocation/i }));
  expect(screen.getByText(/3 of 3/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/Sketchbook owner/i)).toHaveValue('0');
  expect(screen.getByRole('alert')).toHaveTextContent(/retry/i);
});
```

Also assert the submit button is disabled until every item has an owner and controls become disabled during pending submission.

- [ ] **Step 2: Run editor tests and confirm RED**

Run: `npx vitest run tests/case-editor.test.tsx tests/allocation-editor.test.tsx`

Expected: new review, association, progress-copy, and pending-control assertions FAIL.

- [ ] **Step 3: Implement guided editor structure and state details**

Refactor `CaseEditor` into three semantic sections with localized step labels and stable IDs. Use fieldsets/legends for people and goods. Associate validation messages with `aria-describedby`. The review panel must list trimmed names and matrix dimensions, not only counts. Disable add/name/value controls while submitting. Parse non-2xx JSON error messages only into known localized categories; never render raw server text.

In `AllocationEditor`, generate an explicit ID per item and connect each `<label htmlFor>`. Render localized progress as `3 of 3 items assigned` / equivalent Chinese. Disable every select while pending, preserve `owners` after failure, and keep the submit action disabled until complete.

Add exact bilingual keys for section steps, field labels, review sentences, progress, incomplete guidance, and retry-safe submission failure.

- [ ] **Step 4: Complete responsive styling and run tests**

Add focused `.editor-section`, `.field-list`, `.review-list`, `.assignment-progress`, invalid, and pending rules. Ensure primary actions span the container below 600px and tables alone scroll horizontally.

Run: `npx vitest run tests/case-editor.test.tsx tests/allocation-editor.test.tsx tests/i18n.test.ts`

Expected: PASS in both locales.

- [ ] **Step 5: Commit completed editors**

```bash
git add src/components/CaseEditor.tsx src/components/AllocationEditor.tsx src/i18n/copy.ts src/app/[locale]/screens.css tests/case-editor.test.tsx tests/allocation-editor.test.tsx
git commit -m "feat: finish case and allocation editors"
```

---

### Task 5: Honest page states, leaderboard clarity, and connected navigation

**Files:**
- Modify: `src/app/[locale]/cases/[id]/page.tsx`
- Modify: `src/app/[locale]/allocations/[id]/page.tsx`
- Modify: `src/components/Leaderboard.tsx`
- Modify: `src/components/ShareCase.tsx`
- Modify: `src/i18n/copy.ts`
- Modify: `src/app/[locale]/screens.css`
- Create: `src/components/PageState.tsx`
- Create: `tests/page-state.test.tsx`
- Modify: `tests/share-case.test.tsx`
- Modify: `tests/e2e/learning.spec.ts`

**Interfaces:**
- Produces: `PageState({ kind, locale, retryHref? }: { kind: 'not-found' | 'unavailable'; locale: Locale; retryHref?: string })`.
- `Leaderboard` accepts optional `unavailable?: boolean`; unavailable and baseline-only states are distinct.
- `ShareCase` retains clipboard fallback and exposes a selectable URL when copy fails.

- [ ] **Step 1: Write failing state and navigation tests**

Create `tests/page-state.test.tsx` asserting not-found and unavailable have different localized headings, that unavailable offers retry/home/create actions, and neither renders raw exceptions.

Extend leaderboard/page tests so a baseline-only list says no community entries, an unavailable list says live rankings cannot load, each available row labels its exact NSW score, and links target `/{locale}/allocations/{id}`.

Extend `tests/share-case.test.tsx` so clipboard rejection reveals an input or code element containing the full URL and localized manual-copy instructions.

- [ ] **Step 2: Run focused tests and confirm RED**

Run: `npx vitest run tests/page-state.test.tsx tests/share-case.test.tsx tests/i18n.test.ts`

Expected: FAIL because unavailable and not-found currently share no reusable state and share fallback is incomplete.

- [ ] **Step 3: Implement state surfaces and leaderboard semantics**

Build `PageState` with semantic heading, explanatory paragraph, home link, optional retry link, and create-case link. In each dynamic page, treat successful null lookup as not-found and caught database/network errors as unavailable. Keep curated fallback behavior from Task 1.

Update `Leaderboard` so score text reads `NSW 104` (localized label included), baseline rows carry a visible baseline badge, tied ranks remain correct, and `rows.length === 0`, baseline-only, and unavailable each have distinct copy. Do not render invented rows.

Update `ShareCase` so failed clipboard access reveals a read-only, auto-selectable URL field while preserving the ordinary copy button for retry.

- [ ] **Step 4: Verify connected flows and responsive states**

Add Playwright checks that home → curated allocation → curated case navigation has no placeholder page, `/en/cases/new` has a visible complete editor, unknown UUID gets not-found, and an unavailable state can be component-tested without a live database.

Run:

```bash
npx vitest run tests/page-state.test.tsx tests/share-case.test.tsx tests/i18n.test.ts
npx playwright test tests/e2e/learning.spec.ts --project=chromium
```

Expected: all available checks PASS.

- [ ] **Step 5: Commit page completion states**

```bash
git add src/app/[locale]/cases/[id]/page.tsx src/app/[locale]/allocations/[id]/page.tsx src/components/PageState.tsx src/components/Leaderboard.tsx src/components/ShareCase.tsx src/i18n/copy.ts src/app/[locale]/screens.css tests/page-state.test.tsx tests/share-case.test.tsx tests/e2e/learning.spec.ts
git commit -m "feat: complete page states and navigation"
```

---

### Task 6: Full regression, browser audit, and delivery fixes

**Files:**
- Modify only files required by failures found in this task.
- Record no generated `.next`, `test-results`, screenshots, or environment secrets in git.

**Interfaces:**
- Consumes all prior tasks.
- Produces a clean build/test result and a concise verification record in the final delivery message.

- [ ] **Step 1: Run the complete unit and component suite**

Run: `npm test`

Expected: all Vitest tests PASS. Fix product code for regressions; do not weaken assertions that encode the approved specification.

- [ ] **Step 2: Run type and production compilation checks**

Run: `npx tsc --noEmit && npm run build`

Expected: both commands exit 0 with no TypeScript or Next.js route errors.

- [ ] **Step 3: Run browser tests**

Run: `npx playwright test`

Expected: database-free home and curated-example tests PASS. Database-dependent tests may skip only when they explicitly detect a missing disposable database; they must not silently pass after an infrastructure error.

- [ ] **Step 4: Perform an actual browser accessibility and responsive audit**

Using Playwright at desktop and 390×844 viewports, inspect `/en`, `/zh-TW`, both `/cases/new` routes, and the curated allocation/case routes. Confirm:

```ts
expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
expect(await page.locator('main h1').count()).toBe(1);
expect(await page.locator('[role="alert"]').allTextContents()).not.toContain('ECONNREFUSED');
```

Tab through header, rating choices, submit, back-to-case, editor controls, and language switch. Emulate `reducedMotion: 'reduce'` and verify home goods are settled with no transform transition. Check browser console output for uncaught errors and hydration warnings.

- [ ] **Step 5: Review the final diff against the specification**

Run:

```bash
git diff --check HEAD~5..HEAD
git status --short
git diff --stat HEAD~5..HEAD
```

Confirm no generated artifacts, secrets, unrelated dirty-file changes, fabricated aggregates, or pre-rating score text were introduced.

- [ ] **Step 6: Commit any audit-only fixes**

If Step 1–5 required changes:

```bash
git add -u -- src tests
git commit -m "fix: resolve final site completion audit"
```

If the audit creates a new focused test file, add that exact path separately before committing.

If no files changed, do not create an empty commit.
