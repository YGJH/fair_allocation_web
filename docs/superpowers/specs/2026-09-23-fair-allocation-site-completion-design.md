# Fair allocation site completion — design

## Purpose and scope

Finish the existing bilingual fair-allocation learning site as one coherent, production-ready journey across all four routes:

- `/{locale}` — introduction and guided example entry
- `/{locale}/cases/new` — case creation
- `/{locale}/cases/{id}` — case overview, allocation editor, and leaderboard
- `/{locale}/allocations/{id}` — allocation judgment and post-rating explanation

The implementation must complete the visual and interaction design, remove placeholder or raw failure experiences, and make the core guided example useful without PostgreSQL. User-created cases, persistent ratings, aggregate ratings, and live leaderboards remain backed by the existing server APIs and database. Preserve the scoring rules and API contracts.

This design supersedes the database-only assumption in `docs/ui-design-spec.md` and the ambiguous item-travel behavior in `2026-09-23-scroll-driven-home-story-design.md` where they conflict. The warm editorial visual direction and rating-before-reveal rule remain in force.

## Confirmed decisions

The user selected a resilient hybrid approach:

- The built-in curated example and its judgment flow work without PostgreSQL.
- Publishing cases, sharing user-created cases, persistent votes, aggregate ratings, and leaderboards continue to use PostgreSQL.
- All four existing page flows are in scope.
- The home animation must communicate which good belongs to which person rather than moving goods ambiguously.
- Application pages receive the same degree of visual finish as the home page.

## Architecture and data boundaries

Create a single immutable curated-example definition containing its reserved case and allocation IDs, people, goods, valuation matrix, ownership, and trusted results derived through the existing domain scorer. Use this definition as the fallback only when a request targets those reserved IDs and database access fails or no seeded row exists. It must not become a general in-memory repository and must never shadow a successfully loaded database record.

The curated allocation page renders the inspect-and-rate experience without a database. If a live rating request succeeds, use the server response. If the backend is unavailable, permit a local example-only judgment so the learner can reveal the immutable worked explanation. Label that result state clearly: the learner’s choice was not persisted and no live aggregate is available. Do not synthesize votes, rankings, or a live leaderboard.

All user-created content remains server-backed. Repository and API failures must produce intentional, localized unavailable or retry states rather than uncaught server-render errors. Forms retain user input after recoverable failures. Client-side calculations are explanatory only; server/domain scoring remains authoritative.

Keep concerns separate:

- shared example module: immutable example data and identification helpers;
- repository/pages: database lookup with narrow curated fallback;
- rating UI: pre-reveal gate, live submission, and explicit local-example fallback;
- presentational components: person bundles, values, criteria explanations, and state messages;
- home scene: decorative/explanatory progress only, with no data fetching or voting.

## Page designs

### Home

Use a concise editorial introduction followed by a three-stage `inspect → judge → learn` story and one primary example CTA. Replace free-floating goods with a clear allocation diagram: two named destination bundles and three identifiable goods. Each good follows a short, unambiguous path and settles inside its assigned destination. The final state must itself explain the allocation.

Motion is bounded and purposeful: no looping, random travel, or goods stopping between people. Reverse scrolling may reverse progress, but the scene must remain legible at all intermediate points. Reduced-motion and no-JavaScript experiences show the meaningful final static allocation. The actual CTA is a normal localized link.

### Create a case

Present case creation as a guided editor rather than a bare form. Separate people, goods, and valuations into readable sections. Bind every label, show numeric constraints, explain the matrix axes, identify duplicate or missing names near the source, and preserve all entries on validation or network failure. Provide a clear review summary before the immutable publish action. Disable duplicate submission while pending and navigate to the created case only after a successful response.

### Case overview

Lead with case identity, people/goods counts, immutability guidance, and a robust share action. Render the valuation matrix in a labeled, keyboard-focusable scrolling region on narrow screens. The allocation editor must show every good with an explicit owner control, current progress, and incomplete-state guidance. Preserve assignments after errors.

The leaderboard must distinguish baseline and submitted allocations, use exact NSW display and tied ranks, and link each row to its allocation judgment page. Show localized empty and backend-unavailable states instead of an empty shell. The curated example may show its immutable baseline without a database, but no fabricated community submissions or live ranking.

### Allocation judgment and results

Before rating, show the central fairness question and person bundle cards. Each card names the person and contains the goods assigned to that person with relevant values; unassigned or malformed ownership is handled explicitly. Provide five fully labeled rating options and a disabled-until-selected submit action.

Do not reveal EF1, EFX, NSW, aggregate feedback, rank, or fractional estimates before a successful live vote, a previously confirmed local vote, or an explicit example-only local judgment when the backend is unavailable. On live submission failure for the curated example, explain the offline option before revealing; do not silently convert a failed persistent vote into a local one. For non-curated allocations, retain the selection and offer retry.

After reveal, explain exact NSW, each person’s utility, EF1 and EFX in human language, and witnesses when a criterion fails. Clearly distinguish raw score from rank and approximate fractional comparison from indivisible results. Show aggregate data only when supplied by the backend; otherwise show an honest unavailable/non-persistent note. Provide routes back to the case and onward actions.

## Visual system and responsive behavior

Continue the existing warm editorial system: paper background, dark green ink, restrained teal and coral accents, serif display headings, humanist system body type, thin rules, and limited shadows. Consolidate duplicated or conflicting home styles and give application screens consistent page headings, panels, field groups, state banners, buttons, and spacing.

Do not turn every region into an identical card. Use panels for active tasks and results, rules and whitespace for reading structure, and badges for short statuses. Status meaning must never rely on color alone.

At widths below approximately 720px:

- header and actions wrap without clipping;
- page grids become one column;
- forms and primary actions fill available width;
- matrices scroll within their own labeled region rather than widening the page;
- person bundles stack in source order;
- the home allocation scene uses reduced travel and remains fully visible at 390px.

All interactive targets are at least 44px, keyboard order follows reading order, native controls are preferred, and `:focus-visible` is conspicuous. Respect `prefers-reduced-motion`. Transitions are limited to selection, submission, result reveal, and the explanatory home scene.

## Localization, content, and accessibility

Every new heading, label, hint, status, error, loading message, and recovery action must exist in English and Traditional Chinese through `src/i18n/copy.ts`. User-entered names are never translated. Avoid raw booleans, JSON, database errors, and untranslated English on the Chinese route.

Use semantic headings, tables with captions and scoped headers, fieldsets/legends where choices form a group, associated error text, live status only where updates require announcement, decorative `aria-hidden` scene graphics, and descriptive links. The rating gate and all fallback choices must be usable by keyboard and screen reader.

## Error and state model

Each async surface must account for idle, pending, success, empty, invalid, unavailable, and retry states where applicable.

- Database unavailable on curated example: serve immutable example; permit an explicitly chosen local-only judgment; omit live aggregates.
- Database unavailable on user content lookup: localized unavailable page with retry/home/create navigation, not a misleading not-found result.
- Unknown ID after a successful lookup: localized not-found state.
- Create/allocation submission failure: preserve inputs and show a retryable, actionable error.
- Share API unavailable: present/select the URL and explain manual copy.
- Fractional solver unavailable: keep exact indivisible results and label the optional comparison unavailable.
- Corrupt or incomplete ownership: render a safe explanatory state; do not calculate or imply trusted results in the client.

## Verification and acceptance

Add tests before or alongside each behavior change. Required coverage:

- curated case and allocation resolve and render without a database;
- example judgment remains gated before selection and supports an explicit non-persistent fallback;
- no fabricated aggregate, leaderboard, or solver output appears offline;
- all four flows link to one another without placeholder destinations;
- create and allocation editors validate, preserve input on failure, and prevent duplicate submission;
- live rating still gates server results and existing scoring/API tests continue to pass;
- English and Traditional Chinese include all new states;
- home goods finish inside their assigned person bundles;
- reduced motion produces a stable meaningful scene;
- 390px layouts have no body-level horizontal overflow;
- unknown and unavailable are distinguishable.

Run `npm test`, `npm run build`, and Playwright tests. Use an actual browser for route, responsive, keyboard, motion, and console inspection. If database-dependent browser cases cannot run, record the missing prerequisite and still verify the complete database-free example path. Do not claim visual verification without browser evidence.

## Alternatives rejected

- Full browser-local demo mode for every workflow: creates behavior that diverges from real sharing and persistence and expands scope unnecessarily.
- Database-only repair: leaves the key educational example unusable for visitors without infrastructure.
- General repository fallback: risks presenting local data as persistent and complicates data authority. The fallback is deliberately limited to the reserved curated example.
- Elaborate animation framework: unnecessary for a small explanatory scene; CSS transforms and a bounded progress controller are sufficient.

## Non-goals

No authentication, accounts, global cross-case discovery, social features, fake community data, replacement scoring algorithm, new solver, Canvas/WebGL scene, external font, or UI framework. Do not redesign deployment infrastructure beyond documenting and presenting existing backend requirements accurately.
