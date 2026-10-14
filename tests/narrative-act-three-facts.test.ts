import { describe, expect, test } from 'vitest';
import {
  ACT_THREE_DEFINITION,
  type ActThreeAllocation,
} from '../src/narrative/campaign-definition';
import {
  adaptActThreeAllocation,
  validateThirdActAllocation,
} from '../src/narrative/allocation-adapter';
import {
  ACT_THREE_EXHAUSTIVE_SUMMARY,
  analyzeActThreeAllocation,
  enumerateActThreeAllocations,
  exactNSW,
  gradeActThree,
  isEF,
  isEF1,
  isEFX,
  isZeroProduct,
} from '../src/narrative/act-three-facts';

const owners = (allocation: ActThreeAllocation) => allocation.map(({ owner }) => owner);

/** Source: master-script.zh-TW.md §§3–4, §§6–10. */
describe('IP-11 canonical Third Act facts', () => {
  test('locks the documented camps, Writ IDs, localized copy, and valuation matrix', () => {
    expect(ACT_THREE_DEFINITION.parties).toEqual(['wai-chao', 'ji-zhen', 'nei-ting']);
    expect(ACT_THREE_DEFINITION.writs.map(({ id }) => id)).toEqual([
      'military-command', 'salt-tax', 'grain-route', 'firearms', 'border-market', 'imperial-weaving',
    ]);
    expect(ACT_THREE_DEFINITION.writs.map(({ name, description, values }) => ({
      zhName: name['zh-TW'],
      zhDescription: description['zh-TW'],
      values,
    }))).toEqual([
      { zhName: '符｜薊鎮節制', zhDescription: '長城守軍聽誰指揮', values: [5, 35, 10] },
      { zhName: '鹽｜兩淮鹽課', zhDescription: '賣鹽的稅，全國最大一筆現銀', values: [30, 10, 35] },
      { zhName: '糧｜邊餉轉運', zhDescription: '軍糧由誰運、誰發', values: [20, 30, 10] },
      { zhName: '火｜火器督造', zhDescription: '槍砲由誰造', values: [20, 20, 15] },
      { zhName: '市｜宣大互市', zhDescription: '與草原部落的邊境買賣', values: [15, 5, 10] },
      { zhName: '織｜蘇杭織造', zhDescription: '替宮裡織綢緞', values: [10, 0, 20] },
    ]);
  });

  test('keeps authored copy bilingual and in one-to-one parity', () => {
    for (const camp of ACT_THREE_DEFINITION.parties) {
      const detail = ACT_THREE_DEFINITION.partyDetails[camp];
      expect(detail.name.en).not.toBe('');
      expect(detail.name['zh-TW']).not.toBe('');
      expect(detail.description.en).not.toBe('');
      expect(detail.description['zh-TW']).not.toBe('');
    }
    for (const writ of ACT_THREE_DEFINITION.writs) {
      expect(writ.name.en).not.toBe('');
      expect(writ.name['zh-TW']).not.toBe('');
      expect(writ.description.en).not.toBe('');
      expect(writ.description['zh-TW']).not.toBe('');
    }
  });

  test('canonicalizes deterministic Writ order and rejects malformed owner maps', () => {
    const source = ACT_THREE_DEFINITION.demonstrations.rankOrderRoundRobin;
    const reversed = [...source].reverse();
    expect(validateThirdActAllocation(reversed)).toEqual(source);
    expect(adaptActThreeAllocation(source)).toEqual(adaptActThreeAllocation(reversed));
    expect(() => validateThirdActAllocation(source.slice(1))).toThrow();
    expect(() => validateThirdActAllocation([
      ...source.slice(0, 5),
      { writId: source[5].writId, owner: 3 },
    ])).toThrow();
    expect(() => validateThirdActAllocation([
      ...source.slice(0, 5),
      { writId: source[5].writId, owner: 0, extra: true } as never,
    ])).toThrow();
    expect(() => validateThirdActAllocation([
      ...source.slice(0, 5),
      { writId: 'not-authored', owner: 0 } as never,
    ])).toThrow();
    const divisibleWritDefinition = {
      ...ACT_THREE_DEFINITION,
      writs: ACT_THREE_DEFINITION.writs.map((writ) => ({ ...writ, kind: 'divisible', totalShares: 10 })),
    } as never;
    expect(() => validateThirdActAllocation(source, divisibleWritDefinition)).toThrow('indivisible');
  });

  test('enumerates all allocations in stable lexicographic order', () => {
    const records = enumerateActThreeAllocations();
    expect(records).toHaveLength(729);
    expect(owners(records[0].allocation)).toEqual([0, 0, 0, 0, 0, 0]);
    expect(owners(records[1].allocation)).toEqual([0, 0, 0, 0, 0, 1]);
    expect(owners(records[728].allocation)).toEqual([2, 2, 2, 2, 2, 2]);
    expect(enumerateActThreeAllocations()).toEqual(records);
  });

  test('locks the exhaustive fairness and NSW counts', () => {
    expect(ACT_THREE_EXHAUSTIVE_SUMMARY).toMatchObject({
      allocationCount: 729,
      efCount: 0,
      efxCount: 31,
      ef1Count: 153,
      zeroProductCount: 219,
      maxNSW: 125125n,
      maxNSWAllocationCount: 1,
      maxNSWIsEFX: true,
    });
    expect(owners(ACT_THREE_EXHAUSTIVE_SUMMARY.maxNSWAllocation)).toEqual([1, 2, 1, 0, 0, 2]);
  });

  test('locks the scripted allocations and Grade criteria', () => {
    const rankOrder = analyzeActThreeAllocation(ACT_THREE_DEFINITION.demonstrations.rankOrderRoundRobin);
    expect(rankOrder).toMatchObject({ utilities: [50n, 55n, 30n], nsw: 82500n, ef: false, ef1: true, efx: false });
    expect(gradeActThree(rankOrder)).toBe('平常');

    const unbalanced = analyzeActThreeAllocation(ACT_THREE_DEFINITION.demonstrations.unbalanced);
    expect(unbalanced).toMatchObject({ utilities: [55n, 65n, 15n], nsw: 53625n, ef1: false, efx: false });
    expect(gradeActThree(unbalanced)).toBe('不稱職');

    const frontier = analyzeActThreeAllocation(ACT_THREE_DEFINITION.demonstrations.efxFrontier);
    expect(frontier).toMatchObject({ utilities: [35n, 55n, 55n], nsw: 105875n, ef: false, ef1: true, efx: true });
    expect(gradeActThree(frontier)).toBe('稱職');

    const maximum = analyzeActThreeAllocation(ACT_THREE_DEFINITION.demonstrations.nswMaximum);
    expect(maximum).toMatchObject({ utilities: [35n, 65n, 55n], nsw: 125125n, ef: false, ef1: true, efx: true });
    expect(isEF(maximum)).toBe(false);
    expect(isEF1(maximum)).toBe(true);
    expect(isEFX(maximum)).toBe(true);
    expect(isZeroProduct(maximum)).toBe(false);
    expect(exactNSW(maximum)).toBe(125125n);
    expect(maximum.envyPairs).toEqual([
      expect.objectContaining({ i: 0, j: 2, gap: 5n }),
    ]);
  });
});
