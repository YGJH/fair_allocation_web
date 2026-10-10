# 0005: Divisible-First Ladder, Single Revision, and Ledger Scoring

Supersedes the act designs in ADR-0001, the Act II calibration and Act III silver economics in ADR-0002, and the four alignment endings. The 100-point matrices and the automated dossier from ADR-0002 stand.

The first edition opened with indivisible goods and ended by smoothing them with divisible silver, which runs the difficulty backwards: divisible problems are the easy ones. The acts now climb from divisible to indivisible:

1. **Act I**: 2 parties, 3 divisible goods. Proportionality and Cut-and-Choose.
2. **Act II**: 3 parties, 3 divisible goods plus 1 indivisible. Envy, Compensation, Harmony Score.
3. **Act III**: 3 parties, 6 indivisible Writs, nothing to compensate with. EF1, EFX, Zero Product, Round-Robin.

The Act III matrix is chosen so that no envy-free allocation exists among the 729, 31 are EFX, and the unique NSW maximum (125,125) gives the least to the protagonist's patron.

**Single Revision.** Each act keeps Rate-Before-Reveal on the Initial Verdict, then allows one Revision with the unlocked Tools visible. The Final Verdict is what gets graded. This preserves the intuition-versus-theory comparison while letting players act on what they just learned.

**Ledger scoring.** Each Final Verdict receives a Grade (不稱職, 平常, 稱職) and optionally a Master Seal, recorded in the in-fiction Performance Ledger. This replaces the three-dimensional alignment vector.

**Endings from the actual allocation.** The National Ending depends only on the Act III Final Verdict: EFX, else the Most Aggrieved Party, else Zero Product. Zero Product is shown to every player as the inciting incident (the two rejected edicts) rather than relied on as a player outcome, because players rarely leave a party with nothing. Acts I and II affect only short epilogue vignettes and the overall seal.

## Considered Options

- **Keep the silver slider in Act III.** Rejected: it removes the difficulty the climax is meant to teach.
- **Make an envy-free allocation exist in Act III as the top tier.** Rejected: "no perfect answer exists, EFX is the frontier" is both the honest state of the field and the story's conclusion.
- **Show NSW during Act III Revision.** Rejected: hill-climbing a visible product finds the optimum mechanically; NSW is revealed only in the Master Challenge.

## Consequences

- Divisible goods are split in tenths, so they can be modelled as ten identical unit items with integer values and scored by the existing `scoreAllocation`; envy-freeness and proportionality checks must be added to the domain.
- All thresholds and example allocations in the master script were verified by exhaustive enumeration and should be locked by tests when implemented.
