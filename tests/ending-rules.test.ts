import { describe, expect, test } from 'vitest';
import { evaluateNationalEnding, selectMostAggrievedParty } from '../src/narrative/ending-rules';
import { getAdventureCopy } from '../src/i18n/adventure';
import type { CampaignMetrics } from '../src/narrative/types';

function metrics(overrides: Partial<CampaignMetrics> = {}): CampaignMetrics {
  return {
    utilities: [40, 35, 30], nsw: '42000', proportionality: true, ef: false, ef1: true, efx: false,
    envyPairs: [{ i: 0, j: 1, gap: 7 }, { i: 1, j: 2, gap: 9 }, { i: 2, j: 0, gap: 5 }],
    ...overrides,
  };
}

describe('National Ending evaluator', () => {
  test('covers the five endings with zero-product precedence', () => {
    expect(evaluateNationalEnding(metrics({ efx: true, ef1: true })).ending).toBe('鼎足而立');
    expect(evaluateNationalEnding(metrics({ envyPairs: [{ i: 0, j: 1, gap: 12 }], ef1: true })).ending).toBe('江陵之怨');
    expect(evaluateNationalEnding(metrics({ utilities: [40, 35, 30], envyPairs: [{ i: 1, j: 2, gap: 12 }], ef1: true })).ending).toBe('薊門之怨');
    expect(evaluateNationalEnding(metrics({ utilities: [40, 35, 30], envyPairs: [{ i: 2, j: 0, gap: 12 }], ef1: true })).ending).toBe('大璫之怨');
    expect(evaluateNationalEnding(metrics({ utilities: [0, 35, 30], efx: true, nsw: '0' })).ending).toBe('留中不發');
  });

  test('selects mild and severe variants for every grievance ending', () => {
    const parties = [
      { party: '外朝' as const, ending: '江陵之怨' as const, envyPairs: [{ i: 0, j: 1, gap: 12 }] },
      { party: '薊鎮' as const, ending: '薊門之怨' as const, envyPairs: [{ i: 1, j: 2, gap: 12 }] },
      { party: '內廷' as const, ending: '大璫之怨' as const, envyPairs: [{ i: 2, j: 0, gap: 12 }] },
    ];
    for (const { party, ending, envyPairs } of parties) {
      expect(evaluateNationalEnding(metrics({ envyPairs, ef1: true }))).toMatchObject({ ending, severity: 'mild', mostAggrievedParty: party });
      expect(evaluateNationalEnding(metrics({ envyPairs, ef1: false }))).toMatchObject({ ending, severity: 'severe', mostAggrievedParty: party });
    }
  });

  test('keeps 鼎足而立 and 留中不發 canonical and severity-free', () => {
    expect(evaluateNationalEnding(metrics({ efx: true, ef1: false }))).toMatchObject({ ending: '鼎足而立', severity: 'none', mostAggrievedParty: null });
    expect(evaluateNationalEnding(metrics({ utilities: [0, 35, 30], efx: true, ef1: true, nsw: '0' }))).toMatchObject({ ending: '留中不發', severity: 'none', mostAggrievedParty: null });
  });

  test('exposes the full authored mild/severe copy in both locales', () => {
    for (const locale of ['zh-TW', 'en'] as const) {
      const copy = getAdventureCopy(locale).ending;
      expect(copy.history['鼎足而立'].formal).toContain(locale === 'zh-TW' ? '名分已定' : 'the names were settled');
      expect(copy.history['留中不發'].formal).toContain(locale === 'zh-TW' ? '凡事之不可分者，不如不分' : 'what could not be divided was better left undivided');
      for (const ending of ['江陵之怨', '薊門之怨', '大璫之怨'] as const) {
        expect(copy.history[ending].mild.formal).not.toBe(copy.history[ending].severe.formal);
        expect(copy.history[ending].mild.plain).not.toBe(copy.history[ending].severe.plain);
      }
    }
  });

  test('uses largest outgoing gap, then utility, then 內廷/薊鎮/外朝 tie order', () => {
    expect(selectMostAggrievedParty(metrics({ envyPairs: [{ i: 0, j: 1, gap: 8 }, { i: 1, j: 2, gap: 9 }, { i: 2, j: 0, gap: 10 }] }))).toEqual({ party: '內廷', envyGap: 10 });
    expect(selectMostAggrievedParty(metrics({ utilities: [25, 19, 20], envyPairs: [{ i: 0, j: 1, gap: 9 }, { i: 1, j: 2, gap: 9 }, { i: 2, j: 0, gap: 9 }] }))).toEqual({ party: '薊鎮', envyGap: 9 });
    expect(selectMostAggrievedParty(metrics({ utilities: [20, 20, 20], envyPairs: [{ i: 0, j: 1, gap: 9 }, { i: 1, j: 2, gap: 9 }, { i: 2, j: 0, gap: 9 }] }))).toEqual({ party: '內廷', envyGap: 9 });
  });
});
