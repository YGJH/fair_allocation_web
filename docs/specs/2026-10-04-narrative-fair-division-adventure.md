# Specification: The Art of Settled Shares (定分止爭錄) — 3D Narrative Fair Division Adventure

> **Revision 2 (2026-10-10)**: aligned with the second edition of `docs/story/master-script.zh-TW.md`, ADR-0004 and ADR-0005. The master script is the source of truth for dialogue, matrices, thresholds, and ending text; this spec states what the software must do. Terms follow `GLOSSARY.md`.

## Problem Statement

When learning algorithmic game theory and microeconomic fair allocation, students and general audiences face steep conceptual hurdles:

1. **Abstract Formulations**: Formal criteria—Proportionality, Envy-Freeness, EF1, EFX, and Nash Social Welfare (NSW)—are traditionally presented as dry inequalities or abstract matrices, obscuring the human intuition of fairness and jealousy.
2. **Disconnect from Subjective Value**: Learners struggle to internalize that "fairness" depends on asymmetric subjective valuations, where identical objects hold radically different value to different people.
3. **Lack of Consequence & Immersion**: Static calculators fail to convey the tension of real mediation, and do not show why dividing things that cannot be cut is fundamentally harder than dividing things that can.

## Solution

A 3D "Point & Click" historical narrative adventure set entirely in the Wanli reign of the Ming dynasty (1574–1581). The player is one person throughout—Cheng Heng, a fictional abacus-trained official—and the three cases form a single causal chain that carries him from a provincial courtroom to the emperor's audience hall.

| Act | Setting | Player's office | Parties | Goods | Concepts |
| :--- | :--- | :--- | :---: | :--- | :--- |
| I | Yiwu, 1575 | Prefectural Judge | 2 | 3 divisible | Subjective valuation, Proportionality, Cut-and-Choose |
| II | Hangzhou, 1580 | Prefectural Judge | 3 | 3 divisible + 1 indivisible | Envy, Envy Graph, Compensation, Harmony Score (NSW) |
| III | Beijing, 1581 | Supervising Secretary | 3 | 6 indivisible Writs | EF may not exist, EF1, EFX, Zero Product, Round-Robin |

Difficulty climbs from divisible to indivisible. Acts I and II are tutorials with wide success regions; Act III is the capstone, where no envy-free allocation exists and only 31 of 729 allocations are EFX.

In every act the player investigates the scene to collect valuations, commits an Initial Verdict by intuition, rates it before any indicator is revealed, reads the Case Scroll Debrief, may make one Revision with the unlocked Tools, and receives a Grade in the Performance Ledger. The Act III Final Verdict alone selects one of five National Endings.

---

## User Stories

### Exploration and investigation

1. As a player, I want to explore a 3D isometric historical scene using point-and-click navigation, so that I feel immersed in each dispute.
2. As a player, I want to inspect contested objects in the scene, so that I understand which can be cut and which cannot.
3. As a player, I want to question each party, so that I uncover their private valuations.
4. As a player, I want a dossier that records every valuation I have heard, so that I can reason about trade-offs without taking notes.
5. As a player, I want Master Zhou to tell me in plain language what to look at, what the rule is, and what to do next, so that I never need outside knowledge to proceed.

### Allocation

6. As a player, I want to split each divisible good in tenths with a slider, so that sharing a good feels different from handing over an object.
7. As a player, I want to drag each indivisible good to exactly one party, so that its indivisibility is tangible.
8. As a player, I want to see parties react (expression, speech bubble) as I allocate, so that I sense tension before I see numbers.
9. As a player, I want every mathematical indicator hidden while I make my Initial Verdict, so that it reflects my intuition.
10. As a player, I want to rate how fair my Initial Verdict feels (1–5) before the reveal, so that I can compare intuition with theory.

### Reveal, revision, and scoring

11. As a player, I want a Case Scroll Debrief after committing, so that I see each party's share, who envies whom, and the act's criteria.
12. As a player, I want the aggrieved party to object in character, so that a failed criterion reads as a human reaction, not an error message.
13. As a player, I want one Revision with the unlocked Tools visible, so that I can act on what I just learned.
14. As a player, I want my Final Verdict graded 不稱職, 平常, or 稱職 in the Performance Ledger, so that I know how well I did.
15. As a player, I want an optional Master Challenge per act that awards a Master Seal, so that I can pursue the best allocation without being blocked.

### Act-specific learning

16. As a player in Act I, I want to see that halving everything gives each brother 50 while giving each what he values gives each 70, so that I learn fairness is not equal pieces.
17. As a player in Act I, I want to play the divider in Cut-and-Choose, so that I see a procedure guarantee fairness without a judge.
18. As a player in Act II, I want to see an allocation where everyone has at least a third yet someone still envies, so that I learn Proportionality is not envy-freeness.
19. As a player in Act II, I want to find that giving the workshop to the wrong heir cannot be repaired by any split of the divisible goods, so that I learn where the indivisible good must go.
20. As a player in Act II, I want to remove envy by shifting shares of a divisible good, so that I learn Compensation.
21. As a player in Act II, I want to compare allocations by their Harmony Score, so that I meet NSW as a way to rank envy-free options.
22. As a player in Act III, I want a three-step explanation of how an edict is drafted, approved, and inspected, so that I understand why my character can send one back.
23. As a player in Act III, I want to see both rejected edicts produce a Zero Product, so that I understand why they were sent back.
24. As a player in Act III, I want a Round-Robin button that fills the Workbench in rank order, so that I have a starting point and can see that picking order matters.
25. As a player in Act III, I want to remove Writs one at a time from an envied bundle, so that I discover the difference between EF1 and EFX by hand.
26. As a player in Act III, I want NSW hidden until the Master Challenge, so that the Revision is solved by reasoning about envy rather than by climbing a number.

### Endings

27. As a player, I want the National Ending to follow from my Act III Final Verdict, so that my allocation visibly changes history.
28. As a player, I want each grievance ending to name the camp I shortchanged and to differ in severity depending on whether EF1 holds, so that the consequence matches the degree of unfairness.
29. As a player, I want short epilogue vignettes for the Act I and Act II families that reflect my Grades there, so that earlier cases still matter.
30. As a player, I want an overall seal summarising my three Grades and a hidden ending for holding all three Master Seals, so that mastery is recognised.

### Access

31. As a player, I want to switch between Traditional Chinese and English without losing progress.
32. As a player who relies on keyboard navigation or reduced motion, I want every interaction reachable by keyboard and system motion settings respected.
33. As an educator, I want a final page listing each act's intuitive rating beside its actual Grade, so that I can lead a discussion on intuition versus formal criteria.

---

## Implementation Decisions

### Scenario data

1. **Divisible goods as unit items.** Each divisible good is ten identical unit items. Per-unit values are integers in all three acts (the matrices are multiples of 10 for divisible goods), so scenarios remain plain `CaseInput` and pass through `scoreAllocation` in `src/domain/score.ts` unchanged. Utilities stay on the 100-point scale.
2. **Scenario definitions carry more than a matrix.** Each act declares which goods are divisible, its Grade thresholds, its Master Challenge target, and any scripted demonstration allocations. These live with the scenarios, not in UI components.
3. **Matrices and thresholds come from the master script.** No value is restated in this spec.

### Domain

4. **New pure checks beside `scoreAllocation`**: envy-freeness, Proportionality, the per-pair envy gap, and the Most Aggrieved Party. `scoreAllocation` already provides utilities, NSW, EF1, and EFX.
5. **Round-Robin** builds on `src/domain/round-robin.ts`, which currently shuffles the picking order from a seed; it must be extended to accept an explicit order, since Act III needs the rank order and its reverse.
6. **Grading** is a pure function from (act, Final Verdict) to Grade and Master Seal.
7. **Ending resolution** is a pure function from the Act III Final Verdict to a National Ending and severity. It replaces the alignment vector, which is removed.

### Progression

8. A deterministic typed state machine per act:
   `INVESTIGATION → INITIAL_VERDICT → JUDGMENT_GATE → DEBRIEF → REVISION → FINAL_VERDICT → MASTER_CHALLENGE (optional) → ACT_TRANSITION`
   followed by `EPILOGUE` after Act III.
9. **Indicator visibility is a function of state.** Nothing is shown before `DEBRIEF`. During `REVISION` and `MASTER_CHALLENGE` the Tools unlocked so far are live. NSW is additionally withheld during Act III `REVISION`.
10. **Exactly one Revision.** Declining it makes the Initial Verdict the Final Verdict.
11. Act I adds a Cut-and-Choose step in which the player partitions as the elder brother and the younger brother's choice is computed.
12. The Performance Ledger stores, per act, the Initial Verdict, its intuitive rating, the Final Verdict, the Grade, and whether the Master Seal was earned.

### Presentation

13. Three.js orthographic dioramas for the Jinhua prefectural court, the Hangzhou prefectural court, and Wenhua Hall, with raycast interaction paired with accessible HTML overlays. A 2D fallback remains for low-power devices and `prefers-reduced-motion`.
14. Cutscene slots CS-00 to CS-14 are defined in the master script. The software plays a video or a still-plus-caption fallback for each; producing the videos is outside this spec.
15. Every classical-Chinese document shown on screen (ledger entries, the send-back note, the history-book endings) is accompanied by a plain-language caption or narration line.

### Copy

16. All dialogue, captions, and scroll text are registered in `src/i18n/copy.ts` with complete `en` and `zh-TW` keys.
17. Dialogue refers to the Act III camps as 文官, 邊軍, 宮裡; tables and developer-facing text use 外朝, 薊鎮, 內廷.

---

## Testing Decisions

Tests assert observable behaviour and contracts, never private state or the Three.js render loop.

1. **Scenario facts** (unit, exhaustive where feasible), locking the properties the story depends on:
   - Act I: halving yields 50/50; the Master Challenge allocation yields 70/70; the scripted Cut-and-Choose yields 50/70.
   - Act II: no envy-free allocation exists when the workshop goes to either son; the maximum Harmony Score is 131,648 and is envy-free; the "each takes their favourite" allocation is proportional but not envy-free.
   - Act III: 0 envy-free, 31 EFX, 153 EF1, 219 Zero Product among 729; the NSW maximum 125,125 is unique and EFX; rank-order Round-Robin is EF1 but not EFX; both rejected edicts are Zero Product.
2. **Grading and ending resolution** (unit): each Grade boundary; each National Ending with both severities; tie-breaking for the Most Aggrieved Party.
3. **State machine** (unit): no indicator is exposed before `DEBRIEF`; only one Revision is possible; NSW is absent from Act III `REVISION`; declining Revision preserves the Initial Verdict.
4. **Scoring seam** (integration): scenarios pass through `scoreAllocation` without mutation, including unit-item divisible goods.
5. **End-to-end** (Playwright): investigate → allocate → rate → debrief → revise → grade → act transition, and one full run reaching a National Ending.

Prior art: `tests/domain.test.ts`, `tests/example-fallback.test.ts`, `tests/allocation-results.test.tsx`, `tests/application-ui.test.tsx`, `tests/e2e/adventure.spec.ts`.

---

## Out of Scope

1. **Multiplayer or competitive play.**
2. **Generative dialogue.** All lines are scripted.
3. **Free character locomotion.** Point-and-click focus and camera moves only.
4. **Custom cases inside the campaign.** Authoring stays in sandbox mode.
5. **Fractional NSW in the campaign.** The solver-backed upper bound remains a sandbox feature.
6. **Producing cutscene video.** Storyboards and generated footage are a separate workstream.

---

## Further Notes

- **Existing implementation**: `src/narrative/scenarios.ts`, the `src/components/adventure/` components, and `tests/e2e/adventure.spec.ts` implement the first edition and must be reworked against this revision.
- **Graceful fallback**: the campaign runs in memory and needs no PostgreSQL instance.
