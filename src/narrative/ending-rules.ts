import type { CampaignMetrics, CampaignVerdict } from './types';

/** The five authored National Endings. Keep these identifiers stable for saves. */
export type NationalEndingId = '鼎足而立' | '江陵之怨' | '薊門之怨' | '大璫之怨' | '留中不發';
export type GrievanceParty = '外朝' | '薊鎮' | '內廷';
export type EndingSeverity = 'none' | 'mild' | 'severe';

export type NationalEndingResolution = {
  readonly ending: NationalEndingId;
  readonly severity: EndingSeverity;
  readonly mostAggrievedParty: GrievanceParty | null;
  /** The maximum envy gap belonging to the selected party. */
  readonly envyGap: number | null;
};

const partyByIndex: readonly GrievanceParty[] = ['外朝', '薊鎮', '內廷'];
// The script's canonical tie order is 內廷, 薊鎮, 外朝.
const tieOrder: readonly number[] = [2, 1, 0];
const grievanceEnding: Record<GrievanceParty, NationalEndingId> = {
  '外朝': '江陵之怨',
  '薊鎮': '薊門之怨',
  '內廷': '大璫之怨',
};

function maxGapByParty(metrics: Pick<CampaignMetrics, 'envyPairs'>): readonly (number | null)[] {
  const gaps: (number | null)[] = [null, null, null];
  for (const pair of metrics.envyPairs ?? []) {
    const gap = Number(pair.gap);
    if (gaps[pair.i] === null || gap > (gaps[pair.i] ?? 0)) gaps[pair.i] = gap;
  }
  return gaps;
}

/** Selects the Most Aggrieved Party using the authored gap/utility/tie rules. */
export function selectMostAggrievedParty(
  metrics: Pick<CampaignMetrics, 'utilities' | 'envyPairs'>,
): { readonly party: GrievanceParty; readonly envyGap: number } | null {
  const gaps = maxGapByParty(metrics);
  const candidates = [0, 1, 2].filter((index) => gaps[index] !== null);
  if (candidates.length === 0) return null;
  const selected = candidates.reduce((current, candidate) => {
    const currentGap = gaps[current] ?? 0;
    const candidateGap = gaps[candidate] ?? 0;
    if (candidateGap > currentGap) return candidate;
    if (candidateGap < currentGap) return current;
    const currentUtility = metrics.utilities[current] ?? Number.POSITIVE_INFINITY;
    const candidateUtility = metrics.utilities[candidate] ?? Number.POSITIVE_INFINITY;
    if (candidateUtility < currentUtility) return candidate;
    if (candidateUtility > currentUtility) return current;
    return tieOrder.indexOf(candidate) < tieOrder.indexOf(current) ? candidate : current;
  });
  return { party: partyByIndex[selected], envyGap: gaps[selected] ?? 0 };
}

/**
 * Resolves the National Ending from the Act III Final Verdict only.
 * Zero Product deliberately precedes EFX and all grievance branches.
 */
export function evaluateNationalEnding(
  finalVerdict: Pick<CampaignVerdict, 'metrics'> | CampaignMetrics,
): NationalEndingResolution {
  const metrics = 'metrics' in finalVerdict ? finalVerdict.metrics : finalVerdict;
  if (metrics.utilities.some((utility) => utility === 0) || metrics.nsw === '0') {
    return { ending: '留中不發', severity: 'none', mostAggrievedParty: null, envyGap: null };
  }
  if (metrics.efx) {
    return { ending: '鼎足而立', severity: 'none', mostAggrievedParty: null, envyGap: null };
  }
  const aggrieved = selectMostAggrievedParty(metrics);
  if (!aggrieved) {
    // A valid non-zero non-EFX Act III allocation always has an envy witness.
    // Keeping this deterministic makes the persisted boundary defensive too.
    return { ending: '江陵之怨', severity: metrics.ef1 ? 'mild' : 'severe', mostAggrievedParty: '外朝', envyGap: 0 };
  }
  return {
    ending: grievanceEnding[aggrieved.party],
    severity: metrics.ef1 ? 'mild' : 'severe',
    mostAggrievedParty: aggrieved.party,
    envyGap: aggrieved.envyGap,
  };
}

export const resolveNationalEnding = evaluateNationalEnding;
export const NATIONAL_ENDING_TIE_ORDER: readonly GrievanceParty[] = ['內廷', '薊鎮', '外朝'];
