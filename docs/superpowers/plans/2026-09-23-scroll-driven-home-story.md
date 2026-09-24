# Scroll-Driven Home Story Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task in the current session. Steps use checkbox (`- [ ]`) syntax for tracking. Do not dispatch subagents without an explicit operator request to delegate.

**Goal:** Make the bilingual home page a scroll-driven inspect → judge → learn story ending in one guided-example CTA, with accessible static fallbacks.

**Architecture:** Keep `src/app/[locale]/page.tsx` server-rendered and the narrative/CTA in DOM order. A small client-only `ScrollScene` component reads bounded story progress, writes a CSS custom property to its own decorative element and leaves navigation and ratings untouched. Home-specific CSS owns sticky layout and responsive/reduced-motion states.

**Tech Stack:** Next.js App Router, React, TypeScript, CSS transforms, browser `requestAnimationFrame`, Vitest/Testing Library and Playwright. No new dependencies.

**Spec:** `docs/superpowers/specs/2026-09-23-scroll-driven-home-story-design.md` (also see `docs/ui-design-spec.md`).

## Global Constraints

- Modify home only; do not change `RatingGate`, scoring, allocation APIs, database schema or seeded example IDs. The final link must be `/${locale}/allocations/${EXAMPLE_ALLOCATION_ID}` and navigate only on click.
- Keep “New case” as optional header navigation, not a hero CTA. Do not display example EF1, EFX, NSW, leaderboard or aggregate results before rating.
- All new copy appears in both `en` and `zh-TW` via `src/i18n/copy.ts`. Static HTML must expose all three steps and the final CTA even without JavaScript.
- Desktop/tablet: bounded sticky decorative scene. <=720 px: compact sticky illustration plus stacked narrative. Reduced motion: no sticky animation; same content and CTA in normal flow. No forced scroll/snap or keyboard trap.
- Animate compositor-friendly transforms/opacity only; passive scroll listener, at most one scheduled animation frame, resize support and unmount cleanup. No GSAP, Canvas, WebGL or external font/asset downloads.
- Preserve uncommitted `README.md`, translated product spec and `next-env.d.ts` on master. Execute in an isolated worktree; restore only generated artifacts in that isolated tree if Next dev writes them.

## File map and interfaces

- `src/app/[locale]/page.tsx`: home server component with hero, ordered three-section narrative, skip link, final CTA and lesson. Uses `EXAMPLE_ALLOCATION_ID` from `src/shared/example.ts` and `copy[l]` from `src/i18n/copy.ts`.
- `src/components/ScrollScene.tsx`: decorative client component, zero props; reads nearest ancestor `[data-scroll-story]`, sets `--story-progress` on its own element; no route/data calls.
- `src/app/[locale]/story.css`: home-specific story layout, item transformations, sticky bounds, <=720 px and reduced-motion rules; imported once from `src/app/[locale]/global.css`.
- `src/i18n/copy.ts`: `scrollCue`, `skipStory`, `storyFinish`, `storyFinishDetail` in both locales; reuse `stepOne` / `stepTwo` / `stepThree`, `tryExample`, `lesson`.
- `tests/home-ui.test.tsx`: semantic/route contracts; `tests/e2e/home.spec.ts`: actual scroll/reverse/reduced-motion/no-JS/mobile behavior.

---

### Task 1: Story content and final CTA without JavaScript

**Files:** Modify `src/app/[locale]/page.tsx`, `src/i18n/copy.ts`, `src/app/[locale]/global.css`, `tests/home-ui.test.tsx`.

**Interfaces:** The story region uses `<section id="story" data-scroll-story>`; each step is a `<li className="story-step">` in an `<ol aria-label={t.howItWorks}>`; final panel uses `id="story-finish"` and contains exactly one `Try the example` anchor. Existing `.home-note` and lesson remain after it so the current mobile check can still run.

- [ ] **Step 1: Write failing assertions** in the existing bilingual test; the production change caught is accidentally leaving the primary CTA above the story or hiding content from no-JS clients.

```tsx
const story=screen.getByRole('list',{name:locale==='en'?/how it works/i:/如何使用/});
expect(story.children).toHaveLength(3);
expect(screen.getByRole('link',{name:locale==='en'?/skip story/i:/略過故事/}).getAttribute('href')).toBe('#story-finish');
const cta=screen.getByRole('link',{name:locale==='en'?/try the example/i:/試試範例/});
expect(cta.closest('#story-finish')).not.toBeNull();
expect(cta.getAttribute('href')).toBe(`/${locale}/allocations/${EXAMPLE_ALLOCATION_ID}`);
expect(screen.queryByRole('link',{name:locale==='en'?/create your own/i:/建立自己的案例/})).toBeNull();
```

- [ ] **Step 2: Run** `npx vitest run tests/home-ui.test.tsx`; expect skip link/final-panel assertions to fail on the current hero layout.
- [ ] **Step 3: Implement** a server-rendered intro, three ordered story sections, conclusion and low-priority lesson, reusing existing localized step copy. Add the four dictionary keys in both locales and remove the hero create-case link. The simple art placeholder is noninteractive and `aria-hidden`; motion arrives in Task 2. Keep the existing example route, avoid new hidden data.

```tsx
<a className="story-skip" href="#story-finish">{t.skipStory}</a>
<section id="story" data-scroll-story aria-labelledby="steps-title">
  <ol className="story-steps" aria-label={t.howItWorks}>
    {steps.map(([title,detail],i)=><li className="story-step" key={title}><span aria-hidden="true">0{i+1}</span><h3>{title}</h3><p>{detail}</p></li>)}
  </ol>
  <div className="story-visual" aria-hidden="true"><span className="story-person story-person--one"/><span className="story-person story-person--two"/><span className="story-object story-object--one">✦</span><span className="story-object story-object--two">◈</span><span className="story-object story-object--three">✳</span></div>
</section>
<section id="story-finish" aria-labelledby="story-finish-title">
  <h2 id="story-finish-title">{t.storyFinish}</h2><p>{t.storyFinishDetail}</p>
  <a className="button button-primary" href={`/${l}/allocations/${EXAMPLE_ALLOCATION_ID}`}>{t.tryExample}</a>
</section>
```

- [ ] **Step 4: Run** `npx vitest run tests/home-ui.test.tsx tests/i18n.test.ts && npm run build`; expect all available tests and build to pass. No browser/database required for these assertions.
- [ ] **Step 5: Commit** only Task 1 files: `git add src/app/'[locale]'/page.tsx src/app/'[locale]'/global.css src/i18n/copy.ts tests/home-ui.test.tsx && git commit -m "feat: present guided home story with final CTA"`.

### Task 2: Bounded scroll-progress decorative animation

**Files:** Create `src/components/ScrollScene.tsx`, `src/app/[locale]/story.css`; modify `src/app/[locale]/page.tsx`, `src/app/[locale]/global.css`, `tests/e2e/home.spec.ts`.

**Interfaces:** `ScrollScene(): JSX.Element` renders `.story-visual` plus `.story-object--one/--two/--three`, is `aria-hidden="true"`, and writes `--story-progress` in `[0,1]` to the `.story-visual` element. Use the story section's geometry, not document scroll percentage. The server component imports `<ScrollScene/>` where the Task 1 static visual was.

- [ ] **Step 1: Write failing Playwright interaction test** at 1440 px for visual progress and reverse; compare parsed `--story-progress` with numerical bounds, not screenshots of animation timing. Assert no route change before CTA click.

```ts
test('scrolling the home story drives and reverses the illustration',async({page})=>{
 await page.setViewportSize({width:1440,height:900});
 await page.goto('/en');
 const scene=page.locator('.story-visual');
 const progress=()=>scene.evaluate(el=>Number(el.style.getPropertyValue('--story-progress')));
 await page.locator('#story').scrollIntoViewIfNeeded();
 const start=await progress();
 await page.locator('.story-step').last().scrollIntoViewIfNeeded();
 await expect.poll(progress).toBeGreaterThan(start+.2);
 await page.locator('.story-step').first().scrollIntoViewIfNeeded();
 await expect.poll(progress).toBeLessThan(.5);
 await expect(page).toHaveURL(/\/en$/);
});
```

- [ ] **Step 2: Run** `npx playwright test tests/e2e/home.spec.ts -g 'drives and reverses'`; expect missing progress/style assertion failure.
- [ ] **Step 3: Implement** `ScrollScene` with `useEffect`, `useRef`, one passive `scroll` listener, `resize` listener, `requestAnimationFrame` coalescing and cleanup. Clamp `-region.getBoundingClientRect().top / Math.max(1,region.offsetHeight-innerHeight)` to `[0,1]`; call the update once on mount so direct midpage navigation works. Read `matchMedia('(prefers-reduced-motion: reduce)')`; skip motion updates for reduced preference, reset to `0` and respond if the preference changes. Do not set React state per frame. CSS positions the scene with `position:sticky;top:clamp(1rem,8vh,5rem)` inside the bounded story region, and uses `transform: translate(calc(var(--story-progress) * 120px), calc(var(--story-progress) * -40px)) rotate(calc(var(--story-progress) * 24deg))` on the first tile (and bounded variants for the others). At <=720 px use a shorter sticky scene and mobile-sized travel; reduced motion removes sticky behavior and transforms.

```tsx
'use client';
import {useEffect,useRef} from 'react';
export function ScrollScene(){
 const ref=useRef<HTMLDivElement>(null);
 useEffect(()=>{
  const scene=ref.current, region=scene?.closest('[data-scroll-story]');
  if(!scene||!region)return;
  const preference=window.matchMedia('(prefers-reduced-motion: reduce)');let frame=0;
  const update=()=>{frame=0;if(preference.matches){scene.style.setProperty('--story-progress','0');return;}
   const r=region.getBoundingClientRect();
   scene.style.setProperty('--story-progress',String(Math.max(0,Math.min(1,-r.top/Math.max(1,r.height-window.innerHeight)))));
  };
  const schedule=()=>{if(!frame)frame=requestAnimationFrame(update);};
  schedule();window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',schedule);preference.addEventListener('change',schedule);
  return()=>{window.removeEventListener('scroll',schedule);window.removeEventListener('resize',schedule);preference.removeEventListener('change',schedule);cancelAnimationFrame(frame);};
 },[]);
 return <div ref={ref} className="story-visual" aria-hidden="true"><span className="story-person story-person--one"/><span className="story-person story-person--two"/><span className="story-object story-object--one">✦</span><span className="story-object story-object--two">◈</span><span className="story-object story-object--three">✳</span></div>;
}
```

- [ ] **Step 4: Run** `npx playwright test tests/e2e/home.spec.ts && npm test && npm run build`; expect tests pass, zero mobile horizontal overflow, and no score/result data added to home. If selector geometry makes the scroll test ambiguous, adjust its scroll positions to explicit section offsets, not the animation contract.
- [ ] **Step 5: Commit** only Task 2 files: `git add src/components/ScrollScene.tsx src/app/'[locale]'/story.css src/app/'[locale]'/global.css src/app/'[locale]'/page.tsx tests/e2e/home.spec.ts && git commit -m "feat: animate home illustration with scroll progress"`.

### Task 3: Accessibility and fallback acceptance gate

**Files:** Modify `tests/e2e/home.spec.ts` and, only if a regression is demonstrated, the home files from Tasks 1–2. Do not alter non-home screens.

**Interfaces:** The final CTA remains a native anchor with the same href in full motion, reduced motion and JS-disabled contexts.

- [ ] **Step 1: Write failing browser assertions** for reduced-motion/static style, JS-disabled content, end CTA navigation and mobile behavior. Ensure tests navigate the *seeded URL* but do not require a migrated database to validate its href/navigation; do not assert case page content without DB.

```ts
test('reduced motion and no-JS still expose the whole story and CTA',async({browser})=>{
 const reduced=await browser.newContext({reducedMotion:'reduce',viewport:{width:390,height:844}});
 const page=await reduced.newPage();await page.goto('/zh-TW');
 await expect(page.getByRole('list',{name:'如何使用'}).locator('li')).toHaveCount(3);
 await expect(page.getByRole('link',{name:'試試範例'})).toBeVisible();
 expect(await page.locator('body').evaluate(el=>el.scrollWidth)).toBeLessThanOrEqual(390);
 expect(await page.locator('.story-visual').evaluate(el=>getComputedStyle(el).position)).not.toBe('sticky');
 await reduced.close();
 const staticContext=await browser.newContext({javaScriptEnabled:false});
 const staticPage=await staticContext.newPage();await staticPage.goto('/en');
 await expect(staticPage.getByRole('link',{name:'Try the example'})).toHaveAttribute('href',/\/en\/allocations\/00000000-0000-4000-8000-000000000102$/);
 await staticContext.close();
});
```

- [ ] **Step 2: Run** `npx playwright test tests/e2e/home.spec.ts -g 'reduced motion and no-JS'`; expect failure if static fallback or reduced-motion CSS missing. If it already passes after Task 2, introduce this test *before* implementing the reduced-motion CSS in Task 2 instead, to preserve red-green evidence; do not alter production merely to manufacture a red test.
- [ ] **Step 3: Address only observed failures**, e.g. if CSS sticky remains under reduced motion add `@media(prefers-reduced-motion:reduce){.story-visual{position:static}.story-object{transform:none!important;opacity:1}}`; if no-JS hides narrative, remove the initial hidden style. Keep final CTA visible in both modes.
- [ ] **Step 4: Run** `npm test && npm run build && npx playwright test && git diff --check`; record DB-gated learning tests as skipped unless a disposable migrated DB is configured. Verify 390, 768 and 1440 px body widths and keyboard tab order in browser; avoid claiming real user ratings were tested without DB.
- [ ] **Step 5: Commit** only changed home/test files if necessary; preserve original user edits and generated `next-env.d.ts` state. Report verified coverage and any browser/database limitations; do not merge/push without owner choice.
