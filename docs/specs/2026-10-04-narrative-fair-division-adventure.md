# Specification: The Art of Settled Shares (定分止爭錄) — 3D Narrative Fair Division Adventure

## Problem Statement

When learning algorithmic game theory and microeconomic fair allocation, students and general audiences face steep conceptual hurdles:

1. **Abstract Formulations**: Formal mathematical criteria—such as Envy-Freeness up to One Item (EF1), Envy-Freeness up to any positively-valued Item (EFX), and Nash Social Welfare (NSW)—are traditionally presented as dry algebraic inequalities or abstract matrices, obscuring the human intuition of fairness and jealousy.
2. **Disconnect from Subjective Value**: Learners struggle to internalize that "fairness" depends heavily on asymmetric subjective valuations, where identical physical objects hold radically disparate value to different individuals.
3. **Lack of Consequence & Immersion**: Static calculators and toy tables fail to convey the tension of real-world mediation—where misallocations spark strikes, clan feuds, or political collapse—nor do they illustrate why finding optimal indivisible allocations is NP-hard while computing a single candidate allocation is trivial.

## Solution

A 3D "Point & Click" historical narrative adventure (*The Art of Settled Shares* / 《定分止爭錄》, derived from *The Book of Lord Shang* 《商君書·定分》) set in historical China across three escalating tiers of social and institutional conflict grounded in authentic archival jurisprudence:

1. **Act I (Song Dynasty Bianjing Guild / 大宋紹聖二年 · 汴京彩帛行師徒析產案)**: Anchored in *The Clear and Bright Collection of Court Decisions* (《名公書判清明集》) and *The Eastern Capital: A Dream of Splendor* (《東京夢華錄》). Resolves a merchant guild partnership dispute over indivisible heirloom merchandise, introducing subjective valuations, Envy, and EF1.
2. **Act II (Ming Dynasty Prefectural Yamen / 明嘉靖三十五年 · 松江府染坊宗祧鬮分案)**: Anchored in authentic *Huizhou Division Deeds* (《徽州千年契約文書·析產鬮書》), Hai Rui's verdicts (《海忠介公判詞》), and *The Great Ming Code* (《大明律》). Presides as magistrate over an aristocratic clan inheritance feud, introducing EFX and the reality that EFX allocations may fail to exist.
3. **Act III (Ming Imperial War Council / 明萬曆四年深秋 · 乾清深宮「九邊軍國大計案」)**: Anchored in *History of Ming* (《明史·神宗本紀一》, 《明史·張居正傳》, 《明史·戚繼光傳》). Advises Emperor Shenzong in balancing Grand Secretary Zhang Juzheng, Frontier Commander Qi Jiguang, and Chief Eunuch Feng Bao with border military tallies, salt monopoly revenue, and treasury silver bullion, illustrating Nash Social Welfare (NSW), the peril of zero utility product, and fractional bullion compensation (Fractional NSW).

Players investigate the 3D diorama scene to uncover hidden stakeholder valuations, place indivisible tokens onto ancient ritual scales, commit an intuitive ruling before any formula is unveiled (rate-before-reveal), receive an in-depth scroll debrief on their allocation's mathematical properties, and steer the empire toward one of four distinct historical endings.

---

## User Stories

1. As a player, I want to explore a 3D isometric historical scene using point-and-click navigation, so that I feel immersed in the environment of each dispute.
2. As a player, I want to inspect contested physical objects in the 3D space, so that I can learn their historical context and understand their tangible indivisibility.
3. As a player, I want to interrogate disputing stakeholders and read ledger clues, so that I can uncover each party's private subjective valuations for the items.
4. As a player, I want to see an organized valuation dossier that records discovered preference scores, so that I can reason about trade-offs before assigning goods.
5. As a player, I want an intuitive ritual scale/workbench interface where I can drag and drop items to assign them to specific agents, so that making allocations feels tangible and deliberate.
6. As a player, I want to observe immediate emotional micro-reactions (facial portraits, animated sentiment cues) from stakeholders as I place items on the scales, so that I can perceive interpersonal tension dynamically.
7. As a player, I want the system to conceal all formal mathematical metrics (EF1, EFX, NSW, envy graphs) during my drafting phase, so that my initial allocation reflects pure human intuition and moral judgment.
8. As a player, I want to submit my draft allocation as an official verdict/ruling, so that my decision feels consequential and binding.
9. As a player, I want to rate how fair my own ruling feels (on a 1-to-5 scale) before seeing any mathematical verification, so that I can benchmark my ethical intuition against formal theory.
10. As a player, I want a "Case Scroll Debrief" (斷案卷宗) revealed after submission, so that I can see the exact breakdown of agent utilities, envy pairs, EF1/EFX compliance, and NSW score.
11. As a player, I want clear, natural-language explanations when EF1 or EFX fails (e.g., "Agent B envies Agent A; removing Mirror leaves envy intact"), so that I understand why my intuitive ruling fell short of formal fairness.
12. As a player in Act I, I want to discover how removing a single item cures envy (EF1), so that I understand the fundamental relaxation of envy-freeness in indivisible goods.
13. As a player in Act II, I want to experiment with allocations where EF1 holds but EFX fails, so that I can grasp the stricter standard of removing any positively valued item.
14. As a player in Act II, I want to experience cases where no valid EFX allocation exists, so that I recognize the theoretical limits and open problems of indivisible fair division.
15. As a player in Act III, I want to see a live Nash Social Welfare multiplier meter, so that I can understand how welfare is measured as the product of all parties' utilities.
16. As a player in Act III, I want to witness a dramatic crisis warning if any faction receives zero utility, so that I realize why NSW mathematically prohibits leaving any essential party completely empty-handed.
17. As a player in Act III, I want to allocate divisible silver bullion alongside indivisible authority tokens, so that I can explore how fractional allocations provide an optimal theoretical benchmark.
18. As a player, I want my cumulative arbitration tendencies (egalitarian, envy-minimizing, welfare-maximizing, or autocratic) tracked across all three acts, so that my journey culminates in a personalized epilogue.
19. As a player, I want to unlock one of four historical endings (Benevolent Prime Minister, Strict Legalist, Cunning Autocrat, or Reclusive Scholar), so that my philosophical approach to fairness is rewarded with narrative closure.
20. As a player, I want to toggle seamlessly between Traditional Chinese (繁體中文) and English (en) without losing my investigation progress, so that I can experience the story in my preferred language.
21. As a player who relies on keyboard navigation or reduced motion, I want full keyboard accessibility on all interactive elements and respect for system motion settings, so that the experience is universally accessible.
22. As an educator/evaluator, I want to view a post-game summary comparing the player's intuitive fairness ratings with mathematically optimal outcomes, so that I can lead classroom discussions on intuition versus formal proofs.

---

## Implementation Decisions

### Architectural Seams & Modularity

1. **Pure Scoring Domain Seam (`src/domain/score.ts`)**:
   - The narrative acts strictly feed into the existing, battle-tested `scoreAllocation(caseData, allocation)` pure domain function.
   - All scenario goods, agents, and valuation matrices are represented using standard `CaseInput` schemas. No custom scoring math or hardcoded formulas are embedded inside UI components.

2. **Scenario & Narrative Engine Seam**:
   - The game progression is governed by a deterministic, typed state machine managing three sequential acts and the final epilogue.
   - Progression States:
     - `SCENE_INVESTIGATION`: 3D Point & Click mode; player collects clues and unlocks stakeholder valuations.
     - `ALLOCATION_WORKBENCH`: Player manipulates items on the scale; live sentiment feedback is displayed.
     - `JUDGMENT_GATE`: Player commits allocation and rates intuitive fairness (1–5) prior to metric exposure.
     - `VERDICT_REVEAL`: Mathematical metrics, envy graph, and historical story consequences are rendered.
     - `ACT_TRANSITION` / `EPILOGUE`: Accumulates alignment vectors toward the 4 ending paths.

3. **Alignment Tracking & Epilogue Engine**:
   - Tracks a lightweight 3-dimensional vector across verdicts:
     - `welfarePreference`: Weight assigned to maximizing total NSW product.
     - `envyAversion`: Weight assigned to satisfying strict EF1/EFX.
     - `utilitarianCompromise`: Tendency to sacrifice one party's contentment for stability.
   - The dominant vector at Act III conclusion deterministically resolves the epilogue narrative.

4. **3D Scene Viewport & Visual Presentation**:
   - Implemented via Three.js with an orthographic/isometric perspective, featuring pre-lit historical dioramas for Guild, Yamen, and Imperial Council.
   - Interaction is driven by Raycasting on tagged 3D meshes (items and character figures) paired with accessible HTML overlay dialogues for screen readers and touch devices.
   - Fallback 2D card/table view is preserved for low-power devices and `prefers-reduced-motion` environments.

5. **Bilingual Copy Contract**:
   - All character dialogues, historical descriptions, clue texts, and verdict scrolls are registered under `src/i18n/copy.ts` with complete `en` and `zh-TW` keys.
   - Character names and historical artifacts maintain culturally accurate romanization and traditional script.

---

## Testing Decisions

### Good Test Principles
- Tests must assert **external system behavior and observable contracts**, never private internal variables or Three.js internal render loops.
- Assert that mathematical indicators remain completely hidden from DOM queries until the judgment gate action has been fired.
- Verify that every predefined historical case produces verifiable, mathematically sound EF1, EFX, and NSW scores.

### Module Test Targets
1. **Scenario Definition Validity**: Unit tests ensuring each of the 3 scenario `CaseInput` matrices are positive, non-degenerate, and mathematically produce the intended didactic dilemmas (Act 1 has an EF1 resolution; Act 2 demonstrates EFX tension; Act 3 demonstrates NSW zero-collapse).
2. **State Machine Transitions**: Unit tests verifying that investigation flags correctly unlock allocation readiness, judgment submissions transition through the gate without leaking unrevealed metrics, and ending scores evaluate deterministically.
3. **Scoring Seam Integration**: Integration tests confirming that scenario inputs pass cleanly through `src/domain/score.ts` without runtime mutation.
4. **End-to-End User Flow**: Playwright test asserting the full user journey: Inspect Clues $\to$ Drag Items onto Scales $\to$ Submit Ruling $\to$ Verify Debrief Scroll $\to$ Reach Act Transition.

### Prior Art
- Existing unit tests in `tests/domain.test.ts` and `tests/example-fallback.test.ts`.
- Component interaction tests in `tests/allocation-results.test.tsx` and `tests/application-ui.test.tsx`.

---

## Out of Scope

1. **Multiplayer / Competitive PvP**: No real-time multi-agent bidding or online player-vs-player arbitration tournaments.
2. **Open-Ended Generative AI Dialogue**: Dialogues and historical clues are purposefully scripted and pedagogically focused; no unbounded LLM conversational loops during courtroom trials.
3. **Continuous 3D Character Walking / Physics Simulation**: The game uses point-and-click focus and camera panning rather than a WASD third-person character locomotion engine.
4. **Arbitrary Custom Case Generation within Narrative Mode**: Custom case authoring remains available in the auxiliary Sandbox Mode, while the Narrative Campaign adheres to the structured three-act curriculum.

---

## Further Notes

- **Educational Alignment**: The three scenarios deliberately reflect the historical economic evolution from private mercantile law (Song dynasty merchant guilds) to statutory civil adjudication (Ming dynasty prefectural yamens) and macro fiscal policy (Ming/Qing strategic frontier grain and salt administration).
- **Graceful Fallback**: Like the existing curated example, the narrative campaign is self-contained and functions in memory without requiring an external PostgreSQL instance for default playback.
