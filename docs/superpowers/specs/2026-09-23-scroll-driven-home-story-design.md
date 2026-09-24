# Scroll-driven home story — design

## Purpose and scope

Replace the current static home-page three-step explainer with a responsive scroll-driven story that helps a first-time visitor understand the sequence **inspect → judge → learn**, then offers one prominent button to open the existing guided allocation at `/${locale}/allocations/${EXAMPLE_ALLOCATION_ID}`. Do not animate the case editor, voting page or results page. Preserve the warm editorial palette and bilingual copy. The user confirmed the home page alone, the guided example as the destination, and that creating a case should not compete for attention; keep “New case” as an optional header link, not a hero CTA.

This is a motion enhancement of the existing learning flow, not a new page or rating mechanism. The story must not display example EF1, EFX, NSW, leaderboard position, aggregate votes or fractional comparison before the visitor rates on the destination page. “Learn” promises a reveal after the click, not a premature reveal in the story.

## User journey and content

1. **Introduction** (normal page flow): short headline and premise; a subtle scroll cue. Include a text “Skip story” link to the final CTA for someone who wants to move directly onward. No competing create-case CTA on home.
2. **Inspect**: the sticky visual shows two people and three item tiles. Text explains that the visitor will look at ownership before drawing conclusions; no valuation numbers or formal outcomes.
3. **Judge**: the item tiles travel between the two people as the visitor scrolls; text asks them to make their own 1–5 fairness judgment. This is a preview, not an interactive vote; the actual rating remains on the allocation page.
4. **Learn**: illustration settles; text promises a comparison between intuition and EF1, EFX and NSW *after* rating. Avoid implying that these criteria are interchangeable.
5. **Conclusion** (normal page flow): one large, clearly labeled “Try the example” button to the existing allocation route and a short sentence explaining “Rate first; results appear afterward.” The URL changes only on click. The link is a real anchor and works without JavaScript.

Use `src/i18n/copy.ts` for all new English and Traditional Chinese text; user-entered data is unaffected. Keep the longer mathematical lesson lower on the page, reachable after the CTA.

## Visual and motion behavior

Desktop/tablet: a bounded three-panel story region. The illustration occupies the right/sticky column while labeled narrative sections scroll in the left column. It sticks only within its parent region; it cannot cover the header, conclusion, footer or focusable text. Map normalized region scroll progress continuously from 0 to 1, clamped at both ends, to position, scale and rotation of the three item tiles and a connecting guide line. Each story panel corresponds to a third of this range. Avoid flashy looping effects, auto-scrolling, autoplay or a forced scroll snap. Scrolling backward reverses the animation; direct entry midpage computes the correct state on first mount.

Mobile (roughly <= 720 px): use a compact sticky scene at the top of the story and readable one-column narrative panels; reduce travel distance and pin duration. At 390 px there is no horizontal overflow, no clipped caption, and the final button spans the available width. Wide and narrow layouts keep the same reading order and link destination.

Reduced-motion (`prefers-reduced-motion: reduce`): no sticky animation or item travel. Present a static illustration and the same three sections and CTA in normal flow. Without JavaScript, all narrative and CTA remain visible and navigable; the decorative visual can remain static. Performance target: CSS transforms/opacity only for animated objects; passive scroll listener scheduled through at most one `requestAnimationFrame` per frame, remeasure on resize, clean up on unmount. Do not introduce GSAP, Canvas, WebGL, external assets or font requests for this first pass.

## Architecture and state

Keep `src/app/[locale]/page.tsx` a server component that chooses locale, builds the destination URL and renders semantic headings/sections and the CTA. Introduce one narrowly scoped client component for the decorative scene/progress calculation, or a tiny hook with a scene component if clearer. It accepts only localized decorative labels if needed; it never fetches case data, changes routes, stores votes or reads results. Prefer progress-driven CSS custom properties over React state updates every frame. Restrict motion CSS to home-specific classes in a separate small stylesheet or a focused block in the existing stylesheet. Do not change `RatingGate`, APIs, seeded example IDs, database schema or scoring.

The story text stays in DOM order and is never hidden solely because of scroll progress; motion only decorates the narrative. The “Skip story” anchor and final CTA are reachable in ordinary tab order. Decorative objects have `aria-hidden="true"`; screen readers get headings and explanatory paragraphs, not duplicated animated labels. The sticky region must not trap focus or impede wheel/touch scrolling. No server-side access to `window`/`document`.

## Alternatives considered

- **Recommended: small scroll-progress client enhancement + CSS transforms.** Direct continuous scroll linkage, cross-browser fallback, no additional dependency; modest JS complexity with bounded region/cleanup.
- CSS `animation-timeline: view()` only: excellent progressive enhancement in supporting browsers but less predictable support; may be used as optional enhancement, not the sole functional mechanism.
- GSAP ScrollTrigger: capable pinned choreography but dependency weight and lifecycle complexity are unwarranted for one small home story. `ui-animation` / GSAP external skills are not installed; use built-in Web motion and accessibility guidance. Do not silently install third-party skill packages.

## Verification and acceptance

- Component/home tests assert both locales, normal-order headings, skip target and final link to `EXAMPLE_ALLOCATION_ID`; no pre-vote metrics anywhere on home.
- Browser tests on desktop and 390 px mobile scroll to start/middle/end and back, confirming visible decorative state changes and final CTA route; no body horizontal overflow and no keyboard trap.
- Browser reduced-motion test checks content and CTA remain visible while animated positions remain static. Simulate JavaScript disabled to verify content/link fallback if browser tooling supports it.
- Run `npm test`, `npm run build` and available Playwright home tests; database-backed vote flow may remain skipped unless a disposable migrated database is configured.
- Retain the existing dirty `README.md`, translated product spec and `next-env.d.ts`; perform feature work in an isolated branch/worktree rather than writing over user changes on master.

## Sources and assumptions

Sources: `docs/ui-design-spec.md`, existing `src/app/[locale]/page.tsx` and `global.css`, the `ui-workflow` Web quality protocol, and the user's confirmed destination/scope. No external motion skill or third-party reference was required to define this first-pass treatment. Assumption: the guided example migration has been applied on the destination environment; if not, the existing example URL will be unavailable independently of this motion change.
