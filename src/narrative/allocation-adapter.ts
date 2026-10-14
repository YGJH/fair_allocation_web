import { parseAllocation, parseCase, type Allocation, type CaseInput } from '../domain/model';
import {
  ACT_THREE_DEFINITION,
  type ActThreeAllocation,
  type ActThreeDefinition,
  type ActThreeWritId,
  type DivisibleCampaignDefinition,
  type MixedCampaignDefinition,
} from './campaign-definition';

export type VisibleGoodShares<GoodId extends string = string> = {
  goodId: GoodId;
  shares: readonly number[];
};

export type VisibleAllocation<GoodId extends string = string> = readonly VisibleGoodShares<GoodId>[];

export type VisibleMixedGoodAllocation<GoodId extends string = string> =
  | { goodId: GoodId; shares: readonly number[] }
  | { goodId: GoodId; owner: number };
export type VisibleMixedAllocation<GoodId extends string = string> = readonly VisibleMixedGoodAllocation<GoodId>[];

export type DomainAllocationData = {
  caseData: CaseInput;
  allocation: Allocation;
};

function assertDefinition(definition: DivisibleCampaignDefinition) {
  if (definition.parties.length === 0) throw new Error('a campaign allocation needs at least one party');
  if (new Set(definition.parties).size !== definition.parties.length) {
    throw new Error('campaign party IDs must be unique');
  }
  if (new Set(definition.goods.map(({ id }) => id)).size !== definition.goods.length) {
    throw new Error('campaign good IDs must be unique');
  }

  for (const good of definition.goods) {
    if (good.values.length !== definition.parties.length) {
      throw new Error(`valuation count must match parties for ${good.id}`);
    }
    for (const value of good.values) {
      if (!Number.isInteger(value) || value < 0 || value % good.totalShares !== 0) {
        throw new Error(`valuation must expand to integer units for ${good.id}`);
      }
    }
  }
}

function parseVisibleAllocation(
  definition: DivisibleCampaignDefinition,
  input: unknown,
): VisibleAllocation {
  if (!Array.isArray(input)) throw new Error('visible allocation must be an array');
  if (input.length !== definition.goods.length) throw new Error('each visible good needs shares');

  const rows = new Map<string, readonly number[]>();
  for (const candidate of input) {
    if (typeof candidate !== 'object' || candidate === null || Array.isArray(candidate)) {
      throw new Error('each visible good allocation must be an object');
    }
    const keys = Object.keys(candidate);
    if (keys.length !== 2 || !keys.includes('goodId') || !keys.includes('shares')) {
      throw new Error('visible good allocation has unexpected fields');
    }

    const { goodId, shares } = candidate as { goodId?: unknown; shares?: unknown };
    if (typeof goodId !== 'string' || !Array.isArray(shares)) {
      throw new Error('visible good allocation is malformed');
    }
    if (rows.has(goodId)) throw new Error(`duplicate visible good: ${goodId}`);
    rows.set(goodId, shares);
  }

  return definition.goods.map((good) => {
    const shares = rows.get(good.id);
    if (!shares) throw new Error(`missing visible good: ${good.id}`);
    if (shares.length !== definition.parties.length) {
      throw new Error(`share count must match parties for ${good.id}`);
    }
    if (shares.some((share) => !Number.isInteger(share) || share < 0 || share > good.totalShares)) {
      throw new Error(`shares must be integers from 0 to ${good.totalShares} for ${good.id}`);
    }
    if (shares.reduce((sum, share) => sum + share, 0) !== good.totalShares) {
      throw new Error(`shares must total ${good.totalShares} for ${good.id}`);
    }
    return { goodId: good.id, shares };
  });
}

function unitItemId(goodId: string, unit: number) {
  return `${goodId}:unit-${unit + 1}`;
}

/** Converts authored tenths into deterministic domain-only unit goods. */
export function adaptDivisibleAllocation(
  definition: DivisibleCampaignDefinition,
  input: unknown,
): DomainAllocationData {
  assertDefinition(definition);
  const visibleAllocation = parseVisibleAllocation(definition, input);

  const items = definition.goods.flatMap((good) =>
    Array.from({ length: good.totalShares }, (_, unit) => unitItemId(good.id, unit)),
  );
  const values = definition.parties.map((_, party) => definition.goods.flatMap((good) =>
    Array.from({ length: good.totalShares }, () => good.values[party] / good.totalShares),
  ));
  const allocation = visibleAllocation.flatMap(({ shares }) => shares.flatMap((share, party) =>
    Array.from({ length: share }, () => party),
  ));

  const caseData = parseCase({ agents: [...definition.parties], items, values });
  return { caseData, allocation: parseAllocation(caseData, allocation) };
}

/** Returns each party's own utility contribution under each authored good. */
export function adaptMixedAllocation<
  PartyId extends string,
  Good extends {
    id: string;
    values: readonly number[];
  } & ({ kind: 'divisible'; totalShares: number } | { kind: 'indivisible' }),
>(
  definition: MixedCampaignDefinition<PartyId, Good>,
  input: unknown,
): DomainAllocationData {
  if (definition.parties.length === 0) throw new Error('a campaign allocation needs at least one party');
  if (new Set(definition.parties).size !== definition.parties.length) {
    throw new Error('campaign party IDs must be unique');
  }
  if (new Set(definition.goods.map(({ id }) => id)).size !== definition.goods.length) {
    throw new Error('campaign good IDs must be unique');
  }
  if (!Array.isArray(input) || input.length !== definition.goods.length) {
    throw new Error('each mixed good needs an allocation');
  }

  const rows = new Map<string, { shares?: readonly number[]; owner?: number }>();
  for (const candidate of input) {
    if (typeof candidate !== 'object' || candidate === null || Array.isArray(candidate)) {
      throw new Error('each mixed good allocation must be an object');
    }
    const keys = Object.keys(candidate);
    if (keys.length < 2 || keys.length > 3 || !keys.includes('goodId')) {
      throw new Error('mixed good allocation has unexpected fields');
    }
    const { goodId, shares, owner } = candidate as {
      goodId?: unknown;
      shares?: unknown;
      owner?: unknown;
    };
    if (typeof goodId !== 'string' || rows.has(goodId)) {
      throw new Error('mixed good allocation has an invalid or duplicate good');
    }
    if (shares !== undefined && !Array.isArray(shares)) {
      throw new Error(`shares must be an array for ${goodId}`);
    }
    if (owner !== undefined && (typeof owner !== 'number' || !Number.isInteger(owner) || owner < 0 || owner >= definition.parties.length)) {
      throw new Error(`owner out of range for ${goodId}`);
    }
    rows.set(goodId, {
      ...(shares !== undefined && { shares: shares as readonly number[] }),
      ...(owner !== undefined && { owner: owner as number }),
    });
  }

  const normalized = definition.goods.map((good) => {
    const row = rows.get(good.id);
    if (!row) throw new Error(`missing mixed good: ${good.id}`);
    if (good.values.length !== definition.parties.length) {
      throw new Error(`valuation count must match parties for ${good.id}`);
    }
    for (const value of good.values) {
      if (!Number.isInteger(value) || value < 0 || (good.kind === 'divisible' && value % good.totalShares !== 0)) {
        throw new Error(`invalid valuation for ${good.id}`);
      }
    }
    if (good.kind === 'divisible') {
      if (!row.shares || row.owner !== undefined || row.shares.length !== definition.parties.length) {
        throw new Error(`divisible allocation is malformed for ${good.id}`);
      }
      if (row.shares.some((share) => !Number.isInteger(share) || share < 0 || share > good.totalShares)) {
        throw new Error(`shares must be integers from 0 to ${good.totalShares} for ${good.id}`);
      }
      if (row.shares.reduce((sum, share) => sum + share, 0) !== good.totalShares) {
        throw new Error(`shares must total ${good.totalShares} for ${good.id}`);
      }
      return { good, shares: row.shares } as const;
    }
    if (row.owner === undefined || (row.shares !== undefined && row.shares.length > 0)) {
      throw new Error(`indivisible allocation is malformed for ${good.id}`);
    }
    return { good, owner: row.owner } as const;
  });

  const items = normalized.flatMap(({ good }) => good.kind === 'divisible'
    ? Array.from({ length: good.totalShares }, (_, unit) => `${good.id}:unit-${unit + 1}`)
    : [good.id]);
  const values = definition.parties.map((_, party) => normalized.flatMap(({ good }) => good.kind === 'divisible'
    ? Array.from({ length: good.totalShares }, () => good.values[party] / good.totalShares)
    : [good.values[party]],
  ));
  const allocation = normalized.flatMap((entry) => entry.good.kind === 'divisible'
    ? entry.shares!.flatMap((share, party) => Array.from({ length: share }, () => party))
    : [entry.owner]);
  const caseData = parseCase({ agents: [...definition.parties], items, values });
  return { caseData, allocation: parseAllocation(caseData, allocation) };
}

export function aggregateOwnMixedUtilitiesByGood<
  PartyId extends string,
  Good extends {
    id: string;
    values: readonly number[];
  } & ({ kind: 'divisible'; totalShares: number } | { kind: 'indivisible' }),
>(
  definition: MixedCampaignDefinition<PartyId, Good>,
  input: unknown,
): Record<string, number[]> {
  adaptMixedAllocation(definition, input);
  const result: Record<string, number[]> = {};
  const rows = input as readonly { goodId: string; shares?: readonly number[]; owner?: number }[];
  for (const good of definition.goods) {
    const row = rows.find((candidate) => candidate.goodId === good.id);
    if (!row) throw new Error(`missing mixed good: ${good.id}`);
    result[good.id] = definition.parties.map((_, party) => {
      if (good.kind === 'divisible') return (row.shares?.[party] ?? 0) * (good.values[party] / good.totalShares);
      return row.owner === party ? good.values[party] : 0;
    });
  }
  return result;
}

export function aggregateOwnUtilitiesByGood(
  definition: DivisibleCampaignDefinition,
  input: unknown,
): Record<string, number[]> {
  assertDefinition(definition);
  const visibleAllocation = parseVisibleAllocation(definition, input);

  return Object.fromEntries(visibleAllocation.map(({ goodId, shares }) => {
    const good = definition.goods.find((candidate) => candidate.id === goodId);
    if (!good) throw new Error(`unknown visible good: ${goodId}`);
    return [goodId, shares.map((share, party) => share * (good.values[party] / good.totalShares))];
  }));
}

function parseThirdActAllocation(
  definition: ActThreeDefinition,
  input: unknown,
): ActThreeAllocation {
  if (definition.parties.length !== 3 || definition.writs.length !== 6) {
    throw new Error('Third Act requires three camps and six Writs');
  }
  if (definition.writs.some((writ) => writ.kind !== 'indivisible')) {
    throw new Error('Third Act Writs must be indivisible');
  }
  if (new Set(definition.parties).size !== definition.parties.length) {
    throw new Error('Third Act camp IDs must be unique');
  }
  if (new Set(definition.writs.map(({ id }) => id)).size !== definition.writs.length) {
    throw new Error('Third Act Writ IDs must be unique');
  }
  if (!Array.isArray(input) || input.length !== definition.writs.length) {
    throw new Error('each Writ needs exactly one owner');
  }

  const rows = new Map<ActThreeWritId, number>();
  for (const candidate of input) {
    if (typeof candidate !== 'object' || candidate === null || Array.isArray(candidate)) {
      throw new Error('each Writ allocation must be an object');
    }
    const keys = Object.keys(candidate);
    const persistedRow = keys.length === 4 && keys.includes('goodId') && keys.includes('writId') && keys.includes('shares') && keys.includes('owner');
    if ((!persistedRow && keys.length !== 2) || !keys.includes('owner') || (!keys.includes('writId') && !keys.includes('goodId'))) {
      throw new Error('Writ allocation has unexpected fields');
    }
    const { writId: explicitWritId, goodId, owner, shares } = candidate as { writId?: unknown; goodId?: unknown; owner?: unknown; shares?: unknown };
    const writId = explicitWritId ?? goodId;
    if (persistedRow && (!Array.isArray(shares) || shares.length !== 0)) throw new Error('Writ rows cannot have shares');
    if (typeof writId !== 'string' || !definition.writs.some((writ) => writ.id === writId)) {
      throw new Error('unknown Writ ID');
    }
    if (rows.has(writId as ActThreeWritId)) throw new Error(`duplicate Writ: ${writId}`);
    if (typeof owner !== 'number' || !Number.isInteger(owner) || owner < 0 || owner >= definition.parties.length) {
      throw new Error(`owner out of range for ${writId}`);
    }
    rows.set(writId as ActThreeWritId, owner);
  }

  return definition.writs.map((writ) => {
    const owner = rows.get(writ.id);
    if (owner === undefined) throw new Error(`missing Writ: ${writ.id}`);
    return { writId: writ.id, owner };
  });
}

/** Validates and canonicalizes one owner per authored Third Act Writ. */
export function validateThirdActAllocation(
  input: unknown,
  definition: ActThreeDefinition = ACT_THREE_DEFINITION,
): ActThreeAllocation {
  return parseThirdActAllocation(definition, input);
}

/** Converts Writ rows into the JSON-safe campaign row shape used by persistence. */
export function toCampaignWritAllocation(input: unknown, definition: ActThreeDefinition = ACT_THREE_DEFINITION) {
  return validateThirdActAllocation(input, definition).map(({ writId, owner }) => ({
    goodId: writId,
    writId,
    shares: [] as readonly number[],
    owner,
  }));
}

/** Accepts persisted campaign rows or authored Writ rows at the state boundary. */
export function normalizeCampaignWritAllocation(input: unknown, definition: ActThreeDefinition = ACT_THREE_DEFINITION) {
  if (!Array.isArray(input)) throw new Error('Writ allocation must be an array');
  const rows = input.map((row) => {
    if (typeof row !== 'object' || row === null) throw new Error('Writ allocation row is malformed');
    const candidate = row as { writId?: unknown; goodId?: unknown; owner?: unknown };
    return { writId: candidate.writId ?? candidate.goodId, owner: candidate.owner };
  });
  return toCampaignWritAllocation(rows, definition);
}

/** Adapts Writ owners to the existing pure domain allocation representation. */
export function adaptThirdActAllocation(
  definition: ActThreeDefinition,
  input: unknown,
): DomainAllocationData {
  const allocation = parseThirdActAllocation(definition, input);
  const items = definition.writs.map((writ) => writ.id);
  const values = definition.parties.map((_, party) =>
    definition.writs.map((writ) => writ.values[party]),
  );
  const caseData = parseCase({ agents: [...definition.parties], items, values });
  return { caseData, allocation: parseAllocation(caseData, allocation.map(({ owner }) => owner)) };
}

/** Convenience adapter for the canonical Third Act definition. */
export function adaptActThreeAllocation(input: unknown): DomainAllocationData {
  return adaptThirdActAllocation(ACT_THREE_DEFINITION, input);
}
