import { describe, expect, test } from 'vitest';
import { analyzeFairness } from '../src/domain/fairness';
import {
  adaptDivisibleAllocation,
  adaptMixedAllocation,
  aggregateOwnMixedUtilitiesByGood,
  aggregateOwnUtilitiesByGood,
} from '../src/narrative/allocation-adapter';
import { ACT_ONE_DEFINITION, ACT_TWO_DEFINITION } from '../src/narrative/campaign-definition';
import {
  analyzeActTwoAllocation,
  evaluateActTwoMasterChallenge,
  gradeActTwo,
} from '../src/narrative/campaign-rules';

describe('Act I canonical campaign facts', () => {
  test('uses the stable inventory IDs and requires all four authored clues', () => {
    expect(ACT_ONE_DEFINITION.characters).toEqual([
      'cheng-heng',
      'master-zhou',
      'chen-shouye',
      'chen-congzheng',
      'chen-elder',
    ]);
    expect(ACT_ONE_DEFINITION.parties).toEqual(['chen-shouye', 'chen-congzheng']);
    expect(ACT_ONE_DEFINITION.goods.map(({ id }) => id)).toEqual([
      'paddy-field',
      'oil-tea-hillside',
      'silver',
    ]);
    expect(ACT_ONE_DEFINITION.clues).toEqual([
      { id: 'clue-chen-shouye-valuations', required: true },
      { id: 'clue-chen-congzheng-valuations', required: true },
      { id: 'clue-chen-elder-equal-split', required: true },
      { id: 'clue-yiwu-original-ruling', required: true },
    ]);
    expect(ACT_ONE_DEFINITION.cutscenes).toEqual(['cs-00', 'cs-01', 'cs-02', 'cs-03']);
  });

  test('locks the master-script valuation rows without authored unit IDs', () => {
    expect(ACT_ONE_DEFINITION.goods).toEqual([
      { id: 'paddy-field', totalShares: 10, values: [60, 20] },
      { id: 'oil-tea-hillside', totalShares: 10, values: [20, 20] },
      { id: 'silver', totalShares: 10, values: [20, 60] },
    ]);
    expect(JSON.stringify(ACT_ONE_DEFINITION)).not.toContain(':unit-');
  });

  test('privately expands each visible good into ten deterministic domain units', () => {
    const first = adaptDivisibleAllocation(
      ACT_ONE_DEFINITION,
      ACT_ONE_DEFINITION.demonstrations.frontier,
    );
    const second = adaptDivisibleAllocation(
      ACT_ONE_DEFINITION,
      ACT_ONE_DEFINITION.demonstrations.frontier,
    );

    expect(first).toEqual(second);
    expect(first.caseData.items).toHaveLength(30);
    expect(first.caseData.values[0]).toEqual([
      ...Array(10).fill(6),
      ...Array(10).fill(2),
      ...Array(10).fill(2),
    ]);
    expect(first.caseData.values[1]).toEqual([
      ...Array(10).fill(2),
      ...Array(10).fill(2),
      ...Array(10).fill(6),
    ]);
    expect(aggregateOwnUtilitiesByGood(
      ACT_ONE_DEFINITION,
      ACT_ONE_DEFINITION.demonstrations.frontier,
    )).toEqual({
      'paddy-field': [60, 0],
      'oil-tea-hillside': [10, 10],
      silver: [0, 60],
    });
  });

  test.each([
    {
      name: 'half split',
      allocation: ACT_ONE_DEFINITION.demonstrations.halfSplit,
      utilities: [50n, 50n],
      ef: true,
    },
    {
      name: 'inverted split',
      allocation: ACT_ONE_DEFINITION.demonstrations.inverted,
      utilities: [30n, 30n],
      ef: false,
    },
    {
      name: 'frontier split',
      allocation: ACT_ONE_DEFINITION.demonstrations.frontier,
      utilities: [70n, 70n],
      ef: true,
    },
  ])('scores the canonical $name', ({ allocation, utilities, ef }) => {
    const domain = adaptDivisibleAllocation(ACT_ONE_DEFINITION, allocation);
    expect(analyzeFairness(domain.caseData, domain.allocation)).toMatchObject({
      utilities,
      ef,
    });
  });

  test.each([
    ['negative', [
      { goodId: 'paddy-field', shares: [-1, 11] },
      { goodId: 'oil-tea-hillside', shares: [5, 5] },
      { goodId: 'silver', shares: [5, 5] },
    ]],
    ['above ten', [
      { goodId: 'paddy-field', shares: [11, -1] },
      { goodId: 'oil-tea-hillside', shares: [5, 5] },
      { goodId: 'silver', shares: [5, 5] },
    ]],
    ['fractional', [
      { goodId: 'paddy-field', shares: [4.5, 5.5] },
      { goodId: 'oil-tea-hillside', shares: [5, 5] },
      { goodId: 'silver', shares: [5, 5] },
    ]],
    ['non-ten total', [
      { goodId: 'paddy-field', shares: [4, 5] },
      { goodId: 'oil-tea-hillside', shares: [5, 5] },
      { goodId: 'silver', shares: [5, 5] },
    ]],
  ])('rejects %s shares at the adapter boundary', (_name, allocation) => {
    expect(() => adaptDivisibleAllocation(ACT_ONE_DEFINITION, allocation)).toThrow();
  });
});

describe('Act II canonical campaign facts', () => {
  test('locks the canonical parties, localized descriptions, mixed goods, and valuation rows', () => {
    expect(ACT_TWO_DEFINITION.parties).toEqual([
      'pei-boqian',
      'pei-zhongwen',
      'xue-shoucheng',
    ]);
    expect(ACT_TWO_DEFINITION.goods).toEqual([
      expect.objectContaining({
        id: 'loom-workshop',
        kind: 'indivisible',
        name: { 'zh-TW': '裴氏機房', en: 'Pei Loom Workshop' },
        values: [30, 10, 50],
      }),
      expect.objectContaining({
        id: 'mulberry-fields',
        kind: 'divisible',
        totalShares: 10,
        name: { 'zh-TW': '桑田', en: 'Mulberry Fields' },
        values: [40, 30, 10],
      }),
      expect.objectContaining({
        id: 'cash-silver',
        kind: 'divisible',
        totalShares: 10,
        name: { 'zh-TW': '現銀', en: 'Cash Silver' },
        values: [10, 40, 10],
      }),
      expect.objectContaining({
        id: 'raw-silk',
        kind: 'divisible',
        totalShares: 10,
        name: { 'zh-TW': '生絲', en: 'Raw Silk' },
        values: [20, 20, 30],
      }),
    ]);
    for (const party of ACT_TWO_DEFINITION.parties) {
      expect(ACT_TWO_DEFINITION.partyDetails[party].name['zh-TW']).not.toBe('');
      expect(ACT_TWO_DEFINITION.partyDetails[party].name.en).not.toBe('');
      expect(ACT_TWO_DEFINITION.partyDetails[party].description['zh-TW']).not.toBe('');
      expect(ACT_TWO_DEFINITION.partyDetails[party].description.en).not.toBe('');
    }
    for (const good of ACT_TWO_DEFINITION.goods) {
      expect(good.name['zh-TW']).not.toBe('');
      expect(good.name.en).not.toBe('');
      expect(good.description['zh-TW']).not.toBe('');
      expect(good.description.en).not.toBe('');
      expect(good.values).toHaveLength(3);
      expect(good.values.every((value) => Number.isInteger(value))).toBe(true);
    }
    expect(ACT_TWO_DEFINITION.unknownValuations).toEqual([]);
  });

  test('locks the sourced envy, compensation, grade, and Harmony Score requirements', () => {
    expect(ACT_TWO_DEFINITION.fairnessRequirements).toEqual({
      proportionalShare: { numerator: 1, denominator: 3 },
      envyFree: true,
      compensation: {
        indivisibleGoodId: 'loom-workshop',
        recipientPartyId: 'xue-shoucheng',
        divisibleGoodId: 'raw-silk',
        shares: [2, 2, 6],
      },
    });
    expect(ACT_TWO_DEFINITION.gradeThresholds).toEqual({
      proportionalShare: { numerator: 1, denominator: 3 },
      competentCriterion: 'ef',
    });
    expect(ACT_TWO_DEFINITION.harmonyScoreTarget).toBe(131_648);
  });

  test.each([
    {
      name: 'patriarchal ruling',
      allocation: ACT_TWO_DEFINITION.demonstrations.patriarchal,
      utilities: [70n, 40n, 30n],
      proportionality: false,
      ef: false,
      nsw: 84_000n,
      envyPairs: [{ i: 2, j: 0, ownUtility: 30n, otherUtility: 60n, gap: 30n }],
      grade: '不稱職',
    },
    {
      name: 'each takes their favourite',
      allocation: ACT_TWO_DEFINITION.demonstrations.eachTakesTheirFavourite,
      utilities: [40n, 40n, 80n],
      proportionality: true,
      ef: false,
      nsw: 128_000n,
      envyPairs: [{ i: 0, j: 2, ownUtility: 40n, otherUtility: 50n, gap: 10n }],
      grade: '平常',
    },
    {
      name: 'equal-looking split',
      allocation: ACT_TWO_DEFINITION.demonstrations.equalLooking,
      utilities: [50n, 50n, 50n],
      proportionality: true,
      ef: true,
      nsw: 125_000n,
      envyPairs: [],
      grade: '稱職',
    },
    {
      name: 'compensation',
      allocation: ACT_TWO_DEFINITION.demonstrations.compensation,
      utilities: [44n, 44n, 68n],
      proportionality: true,
      ef: true,
      nsw: 131_648n,
      envyPairs: [],
      grade: '稱職',
    },
  ])('scores the canonical $name', ({ allocation, utilities, proportionality, ef, nsw, envyPairs, grade }) => {
    const analysis = analyzeActTwoAllocation(allocation);
    expect(analysis).toMatchObject({ utilities, proportionality, ef, nsw, envyPairs });
    expect(gradeActTwo(analysis)).toBe(grade);
  });

  test('records the compensation bundle and the exact Harmony Score frontier', () => {
    expect(aggregateOwnMixedUtilitiesByGood(
      ACT_TWO_DEFINITION,
      ACT_TWO_DEFINITION.demonstrations.compensation,
    )).toEqual({
      'loom-workshop': [0, 0, 50],
      'mulberry-fields': [40, 0, 0],
      'cash-silver': [0, 40, 0],
      'raw-silk': [4, 4, 18],
    });
    const analysis = analyzeActTwoAllocation(ACT_TWO_DEFINITION.demonstrations.compensation);
    expect(evaluateActTwoMasterChallenge(analysis, true)).toEqual({
      completed: true,
      reachedFrontier: true,
      masterSeal: true,
    });
    expect(evaluateActTwoMasterChallenge(analysis, false).masterSeal).toBe(false);
  });

  test('exhaustively locks the wrong-workshop envy requirement and Harmony maximum', () => {
    const divisibleShares: readonly (readonly [number, number, number])[] = Array.from(
      { length: 66 },
      () => [0, 0, 0] as const,
    );
    let shareIndex = 0;
    for (let first = 0; first <= 10; first += 1) {
      for (let second = 0; second <= 10 - first; second += 1) {
        (divisibleShares as [number, number, number][])[shareIndex] = [
          first,
          second,
          10 - first - second,
        ];
        shareIndex += 1;
      }
    }

    let maximumHarmony = 0;
    for (let workshopOwner = 0; workshopOwner < 3; workshopOwner += 1) {
      let workshopOwnerHasEf = false;
      for (const fields of divisibleShares) {
        for (const cash of divisibleShares) {
          for (const silk of divisibleShares) {
            const bundles = [fields, cash, silk];
            const perceived = ACT_TWO_DEFINITION.parties.map((_, observer) =>
              ACT_TWO_DEFINITION.parties.map((_, recipient) =>
                ACT_TWO_DEFINITION.goods[0].values[observer] * (recipient === workshopOwner ? 1 : 0)
                + bundles.reduce((sum, shares, goodIndex) =>
                  sum + shares[recipient] * ACT_TWO_DEFINITION.goods[goodIndex + 1].values[observer] / 10,
                0),
              ),
            );
            const utilities = perceived.map((row, party) => row[party]);
            const harmony = utilities.reduce((product, utility) => product * utility, 1);
            maximumHarmony = Math.max(maximumHarmony, harmony);
            const ef = perceived.every((row, observer) => row.every((value, recipient) =>
              observer === recipient || row[observer] >= value,
            ));
            workshopOwnerHasEf ||= ef;
          }
        }
      }
      if (workshopOwner < 2) expect(workshopOwnerHasEf).toBe(false);
    }
    expect(maximumHarmony).toBe(ACT_TWO_DEFINITION.harmonyScoreTarget);
  }, 30_000);

  test('rejects malformed mixed allocations at the adapter boundary', () => {
    const compensation = ACT_TWO_DEFINITION.demonstrations.compensation;
    expect(() => adaptMixedAllocation(ACT_TWO_DEFINITION, compensation.map((row) =>
      row.goodId === 'loom-workshop'
        ? { goodId: row.goodId, shares: [0, 0, 10] }
        : row,
    ))).toThrow();
    expect(() => adaptMixedAllocation(ACT_TWO_DEFINITION, compensation.map((row) =>
      row.goodId === 'loom-workshop'
        ? { goodId: row.goodId, owner: 3 }
        : row,
    ))).toThrow();
    expect(() => adaptMixedAllocation(ACT_TWO_DEFINITION, compensation.map((row) =>
      row.goodId === 'raw-silk'
        ? { goodId: row.goodId, shares: [2, 2, 5] }
        : row,
    ))).toThrow();
    expect(() => adaptMixedAllocation(ACT_TWO_DEFINITION, compensation.map((row) =>
      row.goodId === 'raw-silk'
        ? { goodId: 'not-authored', shares: [2, 2, 6] }
        : row,
    ))).toThrow();
  });
});
