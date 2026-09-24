# Fair allocation — UI/UX redesign specification

## 1. Product and user context

A bilingual (English / Traditional Chinese) learning website for colleagues who have not studied fair division. The central activity is to judge a proposed allocation *before* seeing EF1, EFX, NSW or other people's ratings, then investigate why their intuition agrees or disagrees with formal criteria. Secondary tasks are creating a valuation case, assigning items, and comparing submissions within that same case. The web app must work on mobile and desktop without accounts.

**Confirmed direction:** implement the redesign in the existing Next.js site; warm editorial visual style; include a guided first example; retain the mathematical/API contracts and bilingual support. Standard-depth redesign of the four existing screens and the first-visit path. No separate HTML prototype is approved or planned. **Home motion addendum:** `docs/superpowers/specs/2026-09-23-scroll-driven-home-story-design.md` supersedes the home CTA and motion guidance below where they conflict.

## 2. Goals and constraints

- First-time visitor can begin judging a real example from the home page without filling out a matrix.
- Make the sequence unmistakable: inspect item ownership → choose one of five fairness ratings → submit → reveal formal results and anonymous aggregate → explore another allocation / make a case.
- Distinguish user valuations from item ownership, a raw NSW score from a rank, and an approximate fractional comparison from an indivisible optimum.
- Keep the rating gate: no formal scores, classification, leaderboard, aggregate, or fractional estimate on the allocation page before a successful vote (unless that browser already voted). No optimistic local vote on failure.
- Shareable case/allocation URLs, anonymous voting limitations, immutable published cases, and server-computed scores remain as designed. Responsive web, semantic HTML, keyboard support, WCAG AA contrast target and reduced-motion preferences.
- Preserve user work in the current dirty files (`README.md`, translated product spec, `next-env.d.ts`); do not overwrite unrelated changes.

## 3. Reference and skill sources

Project references inspected: `docs/superpowers/specs/2026-09-23-fair-division-learning-site-design.md`, current `src/app/[locale]` routes, components, domain scoring and persistence, bilingual copy, and `db/001_init.sql`. No third-party visual references or user-provided brand assets; this is an original proposed art direction, not an imitation. Consulted `ui-workflow` protocol, templates and Web quality checklist; `brainstorming` for requirements; `design-dna` availability checked, but its full extraction/generation protocol is not applicable without a source reference or DNA JSON. Other third-party frontend-design / web-quality skills are not installed; use built-in quality gates and do not install anything without approval.

## 4. Approaches and decision

- **Recommended: small CSS token system plus focused component classes.** One global stylesheet with semantic tokens, shared layout/controls and targeted component selectors, optionally split if it grows. No new dependency; works with existing Next.js and SSR.
- CSS modules for every component: more isolation, but repetitive at this size and more initial churn.
- A component/UI framework: quickest generic controls, but dependency and aesthetic overhead, and would not resolve the learning-flow gap.

For the guided example, use an idempotently seeded, fixed-ID curated case with its precomputed trusted baseline allocation. The sample has people Maya and Leo, items Sketchbook, Lantern and Notebook, and values `[[8,5,2],[2,6,7]]` (in that order); baseline seed `1` yields owners `[0,1,1]`, utilities `8` and `13`, NSW `104`, EF1 true, EFX true. A single fixed case UUID and allocation UUID are reserved for this content and inserted with conflict-safe SQL; existing rows must never be overwritten. The seed must produce the same URL across deploys and cannot depend on a user clicking a write API; migration and its test must ensure the stored allocation metrics equal the domain scorer. Do not fetch aggregate or leaderboard on the gated page before voting. The home page can link to the seeded allocation, and the case page remains its home for further submissions. If a deployment has not applied migrations, follow the existing database-unavailable behavior; do not silently create a case during render.

## 5. Page and information architecture

```
/[locale]                         Welcome, short concept preview, guided example CTA, create-case CTA
/[locale]/cases/new               Step-oriented case editor with valuation matrix and preview
/[locale]/cases/[id]              Case overview, valuation matrix, allocation editor, same-case leaderboard
/[locale]/allocations/[id]        Allocation judgment (pre-vote); results and analysis (post-vote)
```

Persistent header: brand linking home, create-case link and explicit language switch. Breadcrumb/back link on deeper screens; preserve current route when switching language. Avoid adding account/search/global cross-case ranking navigation. The home example is a real allocation link; no detached toy demo with different voting rules. Link leaderboard rows to their allocation page. Unknown IDs show a localized not-found explanation and a home link, rather than raw `Not found`.

### First-visit journey

Home: brief headline and one-sentence premise, then a bounded scroll-driven inspect / judge / learn story with a single prominent “Try the example” button at its conclusion. Keep “New case” only in the header as an optional action, and provide a text “Skip story” link to the final CTA. Introductory text explains rating-before-reveal but not the example's scores. Allocation page: large question, owned-item groups per person, visible five-point labeled rating options, submit button. After server acceptance or already-rated local marker: results panel with NSW, person utilities, EF1/EFX definitions and witness, aggregate count/mean/distribution, a link to the case/leaderboard and optional fractional comparison. Explicitly label convenience-sample feedback as nonrepresentative.

### Case authoring

Agent and item names in separate groups; valuations in a real table with row/column headers. Start from one agent / one item, support adding rows/columns and show input hints and validation near the matrix before publishing. Preview the immutable case before the publish action (inline preview, not another route); submissions show busy state and prevent double clicks. Keep numbers bounded by domain validation and show actionable server errors without losing input. On success navigate to the new case.

### Case page

Top summary with case title, count of people/items, share URL action (with copy fallback if clipboard unavailable), value matrix and “assign every item” editor. Ownership selects or choice controls have visible item and person labels; show assignment progress and disable submit until complete. Baseline clearly tagged; leaderboard displays exact NSW, tied ranks, and links to the vote-first detail page. Avoid displaying scores for a target allocation *on that allocation's gated page*; the case leaderboard is a separate navigable page and must not be embedded as preview there. Empty-state text when only the baseline exists.

## 6. Visual system

**Design style:** warm editorial, thoughtful and approachable rather than corporate/gamified. Wide margins, deliberate display typography, restrained rule lines, subtle diagram-like circles and paths suggesting goods moving between people. No stock gradients, glassmorphism, video backgrounds, autoplay or heavy 3D effects. Visual effects dimension: lightweight CSS/SVG and bounded home-page scroll-progress transforms only; no Canvas/WebGL required.

| Token | Value | Role |
|---|---|---|
| `--paper` | `#F8F5EE` | page background |
| `--surface` | `#FFFFFF` | content cards / forms |
| `--ink` | `#20342F` | headings and primary text |
| `--muted` | `#52665D` | supporting text |
| `--teal` | `#205E52` | primary CTA, selected controls |
| `--teal-soft` | `#E4F0E9` | selected/panel background |
| `--coral` | `#AC4C34` | highlights, not sole error indicator |
| `--border` | `#D5DDD3` | dividers and inputs |
| `--focus` | `#9B4C29` | high-visibility focus ring |

Typography: system-backed humanist sans for UI/body (e.g. `ui-sans-serif`, Segoe UI, Noto Sans CJK TC, sans-serif); system serif for large English editorial headlines with CJK fallback; avoid network font dependencies. Fluid heading `clamp(2.2rem, 5vw, 4.6rem)` with compact line-height; body 1rem–1.125rem and ~1.55 line-height; labels at least .875rem. Use tabular numerals for scores and matrices. Spacing scale 4/8/12/16/24/32/48/72 px; content max-width 1120 px; text measure <= 70 characters; card radius 16–24 px, control radius 10–12 px; subtle borders and restrained shadows only when needed. Primary button min-height 44 px; no visual meaning conveyed only by hue.

## 7. Components, behavior and states

- Shared site shell, content container, headings, card, badge, buttons, form controls and links; avoid making all regions look like identical cards.
- Rating choices should expose full 1–5 range, clear endpoint labels, and an accessible selected state; user sees their choice before submit. Keep submit disabled until selected; show `Submitting…` and disabled controls while waiting; on failure preserve choice and show retryable alert. Existing browser rating shows results without submitting another vote.
- Results are rendered only after accepted response / confirmed local marker; network failure for previous results shows retry action and no leaked metrics. Show per-person bundle values, explicit EF1/EFX status with text, witness when false, and an exact NSW string. Histogram with counts as text (bars decorative, not sole information).
- Fractional comparison is an optional, clearly labeled numeric estimate on demand with idle, pending, estimated, unavailable and retry states; never present it as certified or indivisible optimal.
- Case editor: input labels bound to controls, table headings, numeric min/max hints; invalid/missing/duplicate entries and network failures have specific recoverable messaging. Keep client-side guards aligned with existing server validation, never trust client scores.
- Allocation editor: labeled ownership per item, assignment progress `x/y`, no publish until every item assigned; preserve choices on failure.
- Responsive behavior: below ~720 px header wraps without horizontal clipping, home/case sections stack, cards and choices use one column, matrix scrolls in its own labeled region, action buttons fill available width. At 720–1100 px use two-column instructional and work panels where useful; at larger widths keep content readable rather than stretching tables/cards across the viewport.
- Keyboard: tab order follows the visual reading flow; all actions native buttons/links/inputs; visible `:focus-visible`; submit by keyboard; no hover-only information. `prefers-reduced-motion` removes decorative transitions. No forced scrolling or modal gating.

## 8. Copy and localization

Voice: direct, curious, mathematically honest; translate all new labels, descriptions, hints, errors, loading and result summaries in `src/i18n/copy.ts`. Avoid raw English strings on the Traditional Chinese path. Use “Judge first. Learn why afterward.” / “先判斷，再理解原因。” as short teaching promise (copy can be refined without changing the flow). State anonymous rating limitations, EFX positive-item convention, EF1 existence assumptions and solver approximation in both languages. Entered person/item names are not translated. Do not show raw database JSON or `true`/`false` strings as the final UI.

## 9. Implementation and verification

Touch existing pages/components, localized copy and a new CSS entry imported by the app layout; add idempotent curated-data migration with deterministic IDs and a verification test comparing its scores with domain results. Preserve API response structures; adapt components to presentation and interaction behavior rather than modifying math. Add focused tests for rating-before-reveal, case/leaderboard links and the seeded example. Run TypeScript/build, unit tests and available browser tests; record if browser/database prerequisites prevent live verification. Inspect responsive, keyboard and WCAG AA contrast on light backgrounds. Do not claim visual browser verification without actually running a browser.

## 10. Risks, assumptions and follow-ups

- Seeded example needs an applied migration and tested baseline score; do not alter already published case data or duplicate on repeat migrations.
- Existing pages may have accessibility and localization defects beyond CSS; fix those on touched flows, without unrelated backend redesign.
- A case leaderboard necessarily reveals rankings outside an allocation's gated page. The teaching constraint applies to the judge-then-reveal page, not to preventing a user from deliberately navigating elsewhere.
- Aggregate ratings are convenience feedback, not research or unique respondents; browser-local deduplication is only friction.
- No external design assets or fonts required. Later iteration could add more curated examples, richer authoring controls, or user research; not in this pass.

## 11. Prototype recommendation

No standalone high-fidelity HTML prototype. The actual Next.js implementation is the approved deliverable, after this specification is reviewed.
