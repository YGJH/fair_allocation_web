import { describe, expect, test } from 'vitest';
import { ACT_ONE_DEFINITION } from '../src/narrative/campaign-definition';
import {
  CAMPAIGN_V2_STORAGE_KEY,
  DEFAULT_CAMPAIGN_RECALL,
  DEFAULT_CAMPAIGN_SETTINGS,
  LEGACY_CAMPAIGN_NOTICE_STORAGE_KEY,
  LEGACY_CAMPAIGN_V1_STORAGE_KEY,
  createCampaignSave,
  decodeCampaignSave,
  encodeCampaignSave,
  loadCampaignSave,
  markRebuiltCampaignNoticeSeen,
  saveCampaign,
  type StorageLike,
} from '../src/narrative/persistence';
import {
  campaignReducer,
  initialCampaignState,
  type CampaignAction,
} from '../src/narrative/state-machine';
import type { CampaignAllocation, CampaignState } from '../src/narrative/types';

class MemoryStorage implements StorageLike {
  readonly values = new Map<string, string>();

  getItem(key: string) {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string) {
    this.values.set(key, value);
  }
}

const halfSplit: CampaignAllocation = ACT_ONE_DEFINITION.demonstrations.halfSplit;
const frontier: CampaignAllocation = ACT_ONE_DEFINITION.demonstrations.frontier;

function apply(state: CampaignState, action: CampaignAction) {
  return campaignReducer(state, action);
}

function legalStates(): CampaignState[] {
  const states: CampaignState[] = [];
  let state = initialCampaignState();
  const dispatch = (action: CampaignAction) => {
    state = apply(state, action);
    states.push(state);
  };

  states.push(state);
  dispatch({ type: 'COMPLETE_CUTSCENE' });
  dispatch({ type: 'BEGIN_FROM_TITLE' });
  dispatch({ type: 'COMPLETE_CUTSCENE' });
  dispatch({ type: 'COMPLETE_INTRO' });
  for (const { id } of ACT_ONE_DEFINITION.clues) dispatch({ type: 'DISCOVER_CLUE', clueId: id });
  dispatch({ type: 'START_ALLOCATION' });
  dispatch({ type: 'SET_DRAFT_ALLOCATION', allocation: frontier });
  dispatch({ type: 'LOCK_INITIAL_VERDICT' });
  dispatch({ type: 'SUBMIT_INTUITION_RATING', rating: 5 });
  dispatch({ type: 'COMPLETE_DEBRIEF' });
  dispatch({ type: 'CHOOSE_REVISION', revise: true });
  dispatch({ type: 'SET_REVISION_ALLOCATION', allocation: frontier });
  dispatch({ type: 'LOCK_FINAL_VERDICT' });
  dispatch({ type: 'ENTER_CHALLENGE' });
  dispatch({ type: 'COMPLETE_CUTSCENE' });
  dispatch({ type: 'SET_CHALLENGE_ALLOCATION', allocation: frontier });
  dispatch({ type: 'VIEW_CHALLENGE_HINT', stage: 1 });
  dispatch({ type: 'SUBMIT_CHALLENGE' });
  dispatch({ type: 'LEAVE_CHALLENGE' });
  dispatch({ type: 'ENTER_CHALLENGE' });
  dispatch({ type: 'LEAVE_CHALLENGE' });
  dispatch({ type: 'START_REPLAY', act: 1 });
  dispatch({ type: 'SET_REPLAY_ALLOCATION', allocation: frontier });
  dispatch({ type: 'SUBMIT_REPLAY' });
  dispatch({ type: 'CONFIRM_REPLAY_OVERWRITE' });
  dispatch({ type: 'CONTINUE_ACT' });
  dispatch({ type: 'COMPLETE_CUTSCENE' });
  dispatch({ type: 'START_REPLAY', act: 1 });
  dispatch({ type: 'SUBMIT_REPLAY' });
  dispatch({ type: 'CANCEL_REPLAY' });
  dispatch({ type: 'START_REPLAY', act: 1 });
  dispatch({ type: 'SUBMIT_REPLAY' });
  dispatch({ type: 'CONFIRM_REPLAY_OVERWRITE' });

  let alternate = states.find(({ phase }) => phase === 'debrief')!;
  const alternateDispatch = (action: CampaignAction) => {
    alternate = apply(alternate, action);
    states.push(alternate);
  };
  alternateDispatch({ type: 'COMPLETE_DEBRIEF' });
  alternateDispatch({ type: 'CHOOSE_REVISION', revise: false });
  alternateDispatch({ type: 'SKIP_CHALLENGE' });
  alternateDispatch({ type: 'COMPLETE_CUTSCENE' });
  alternateDispatch({ type: 'ENTER_CHALLENGE' });
  alternateDispatch({ type: 'SKIP_CHALLENGE' });
  return states;
}

function validNonHiddenEndingState(): CampaignState {
  let state = initialCampaignState();
  const dispatch = (action: CampaignAction) => {
    state = apply(state, action);
  };

  dispatch({ type: 'COMPLETE_CUTSCENE' });
  dispatch({ type: 'BEGIN_FROM_TITLE' });
  dispatch({ type: 'COMPLETE_CUTSCENE' });
  dispatch({ type: 'COMPLETE_INTRO' });
  for (const { id } of ACT_ONE_DEFINITION.clues) dispatch({ type: 'DISCOVER_CLUE', clueId: id });
  dispatch({ type: 'START_ALLOCATION' });
  dispatch({ type: 'LOCK_INITIAL_VERDICT' });
  dispatch({ type: 'SUBMIT_INTUITION_RATING', rating: 3 });
  dispatch({ type: 'COMPLETE_DEBRIEF' });
  dispatch({ type: 'CHOOSE_REVISION', revise: false });
  dispatch({ type: 'SKIP_CHALLENGE' });
  dispatch({ type: 'COMPLETE_CUTSCENE' });
  dispatch({ type: 'CONTINUE_ACT' });
  dispatch({ type: 'COMPLETE_CUTSCENE' });
  dispatch({ type: 'BEGIN_ACT_TWO' });
  dispatch({ type: 'COMPLETE_CUTSCENE' });
  dispatch({ type: 'COMPLETE_INTRO' });
  dispatch({ type: 'DISCOVER_CLUE', clueId: 'clue-loom-workshop-indivisible' });
  dispatch({ type: 'START_ALLOCATION' });
  dispatch({ type: 'LOCK_INITIAL_VERDICT' });
  dispatch({ type: 'SUBMIT_INTUITION_RATING', rating: 3 });
  dispatch({ type: 'COMPLETE_DEBRIEF' });
  dispatch({ type: 'CHOOSE_REVISION', revise: false });
  dispatch({ type: 'SKIP_CHALLENGE' });
  dispatch({ type: 'CONTINUE_ACT' });
  dispatch({ type: 'COMPLETE_CUTSCENE' });
  dispatch({ type: 'BEGIN_ACT_THREE' });
  dispatch({ type: 'COMPLETE_CUTSCENE' });
  dispatch({ type: 'COMPLETE_INTRO' });
  dispatch({ type: 'DISCOVER_CLUE', clueId: 'clue-emperor-no-unanimity' });
  dispatch({ type: 'START_ALLOCATION' });
  dispatch({ type: 'LOCK_INITIAL_VERDICT' });
  dispatch({ type: 'SUBMIT_INTUITION_RATING', rating: 3 });
  dispatch({ type: 'COMPLETE_DEBRIEF' });
  dispatch({ type: 'CHOOSE_REVISION', revise: false });
  dispatch({ type: 'SKIP_CHALLENGE' });
  dispatch({ type: 'CONTINUE_ACT' });
  dispatch({ type: 'COMPLETE_CUTSCENE' });

  expect(state.phase).toBe('ending');
  expect(state.ending?.hiddenEnding).toBe(false);
  return state;
}

function expectReset(raw: string, reason?: string) {
  const result = decodeCampaignSave(raw);
  expect(result.status).toBe('reset');
  if (result.status === 'reset' && reason) expect(result.reason).toBe(reason);
}

describe('Campaign v2 save codec', () => {
  test('round-trips every state on a complete legal Campaign v2 path', () => {
    for (const campaign of legalStates()) {
      const envelope = createCampaignSave(campaign);
      const encoded = encodeCampaignSave(envelope);
      expect(encoded.status, campaign.phase).toBe('encoded');
      if (encoded.status !== 'encoded') continue;

      expect(encoded.value, campaign.phase).not.toContain('bigint');
      const decoded = decodeCampaignSave(encoded.value);
      expect(decoded.status, campaign.phase).toBe('restored');
      if (decoded.status === 'restored') {
        expect(decoded.envelope).toEqual(envelope);
        expect(campaignReducer(initialCampaignState(), {
          type: 'RESTORE_PARSED',
          state: decoded.envelope.campaign,
        })).toEqual(campaign);
      }
    }
  });

  test('round-trips a completed frontier challenge after leaving and re-entering without an edit', () => {
    const states = legalStates();
    const ledgerIndex = states.findIndex(({ phase, challenge }) =>
      phase === 'ledger' && challenge.status === 'completed' && challenge.reachedFrontier);
    const reentered = states[ledgerIndex + 1];

    expect(ledgerIndex).toBeGreaterThanOrEqual(0);
    expect(reentered).toMatchObject({
      phase: 'challenge',
      cutscene: null,
      challenge: { status: 'completed', reachedFrontier: true, masterSeal: true },
    });
    const encoded = encodeCampaignSave(createCampaignSave(reentered));
    expect(encoded.status).toBe('encoded');
    if (encoded.status === 'encoded') {
      expect(decodeCampaignSave(encoded.value)).toMatchObject({
        status: 'restored',
        envelope: { campaign: reentered },
      });
    }
  });

  test('accepts both legacy challenge and new ledger return targets for an in-flight CS-02 save', () => {
    const finalVerdict = legalStates().find(({ phase, act }) => phase === 'final-verdict' && act === 1);
    expect(finalVerdict).toBeTruthy();
    if (!finalVerdict) return;
    for (const returnTo of ['challenge', 'ledger'] as const) {
      const inFlight = { ...finalVerdict, phase: 'cutscene' as const, cutscene: { slotId: 'cs-02' as const, returnTo } };
      const encoded = encodeCampaignSave(createCampaignSave(inFlight));
      expect(encoded.status, returnTo).toBe('encoded');
      if (encoded.status === 'encoded') expect(decodeCampaignSave(encoded.value).status, returnTo).toBe('restored');
    }
  });

  test('rejects discovered clues before investigation but saves partial investigation and allocation progress', () => {
    const cs00 = initialCampaignState();
    const title = apply(cs00, { type: 'COMPLETE_CUTSCENE' });
    const cs01 = apply(title, { type: 'BEGIN_FROM_TITLE' });
    const intro = apply(cs01, { type: 'COMPLETE_CUTSCENE' });
    const firstClue = ACT_ONE_DEFINITION.clues[0].id;
    const allClues = ACT_ONE_DEFINITION.clues.map(({ id }) => id);

    for (const opening of [cs00, title, intro]) {
      for (const discoveredClueIds of [[firstClue], allClues]) {
        expectReset(JSON.stringify(createCampaignSave({
          ...opening,
          discoveredClueIds,
        })), 'invalid-save');
      }
    }

    let investigation = apply(intro, { type: 'COMPLETE_INTRO' });
    investigation = apply(investigation, { type: 'DISCOVER_CLUE', clueId: firstClue });
    expect(encodeCampaignSave(createCampaignSave(investigation)).status).toBe('encoded');

    const allocation = apply(investigation, { type: 'START_ALLOCATION' });
    expect(allocation).toMatchObject({
      phase: 'allocation',
      discoveredClueIds: [firstClue],
      initialVerdict: null,
    });
    expect(encodeCampaignSave(createCampaignSave(allocation)).status).toBe('encoded');
  });

  test('rejects CS-14 persistence when the ending has not unlocked the hidden ending', () => {
    const endingState = validNonHiddenEndingState();
    const valid = createCampaignSave(endingState);
    expect(encodeCampaignSave(valid).status).toBe('encoded');

    const forged = createCampaignSave({
      ...endingState,
      ending: { ...endingState.ending!, hiddenCutsceneWatched: true },
    });
    expect(encodeCampaignSave(forged).status).toBe('invalid');
    expectReset(JSON.stringify(forged), 'invalid-save');
  });

  test('returns typed reset results for corrupt JSON, unknown versions, and invalid nested state', () => {
    expectReset('{not json', 'corrupt-json');
    expectReset(JSON.stringify({ version: 99 }), 'unsupported-version');

    const valid = createCampaignSave(initialCampaignState());
    const invalidCases: unknown[] = [
      { ...valid, campaign: { ...valid.campaign, phase: 'invented-phase' } },
      { ...valid, campaign: { ...valid.campaign, discoveredClueIds: ['not-an-authored-clue'] } },
      {
        ...valid,
        campaign: {
          ...valid.campaign,
          draftAllocation: valid.campaign.draftAllocation.map((row, index) => index === 0
            ? { ...row, shares: [11, -1] }
            : row),
        },
      },
      { ...valid, campaign: { ...valid.campaign, intuitionRating: 6 } },
      { ...valid, campaign: { ...valid.campaign, revisionCount: 2 } },
      {
        ...valid,
        campaign: {
          ...valid.campaign,
          challenge: { ...valid.campaign.challenge, status: 'won' },
        },
      },
      { ...valid, recall: { ...valid.recall, watchedCutsceneSlots: ['cs-99'] } },
    ];

    for (const candidate of invalidCases) {
      expectReset(JSON.stringify(candidate), 'invalid-save');
    }
  });

  test('rejects unreachable phase, Cutscene, Revision, record, replay, and derived-status combinations', () => {
    const states = legalStates();
    const opening = initialCampaignState();
    const finalVerdict = states.find(({ phase }) => phase === 'final-verdict')!;
    const cs03 = states.find(({ phase, cutscene }) => phase === 'cutscene' && cutscene?.slotId === 'cs-03')!;
    const actOneReplay = states.find(({ phase, act }) => phase === 'replay' && act === 1)!;
    const valid = createCampaignSave(opening);
    const unreachable: CampaignState[] = [
      { ...opening, phase: 'final-verdict' },
      { ...opening, cutscene: { slotId: 'cs-00', returnTo: 'act-two-transition' } },
      { ...cs03, cutscene: { slotId: 'cs-03', returnTo: 'title' } },
      { ...opening, phase: 'revision', cutscene: null },
      {
        ...finalVerdict,
        revisionAllocation: halfSplit,
      },
      {
        ...finalVerdict,
        actRecord: {
          ...finalVerdict.actRecord!,
          intuitionRating: finalVerdict.intuitionRating === 5 ? 4 : 5,
        },
      },
      {
        ...actOneReplay,
        replay: { ...actOneReplay.replay!, returnTo: 'act-two-transition' },
      },
      {
        ...opening,
        dependentResults: { ledger: 'stale', ending: 'current' },
      } as unknown as CampaignState,
    ];

    for (const campaign of unreachable) {
      expectReset(JSON.stringify({ ...valid, campaign }), 'invalid-save');
    }
  });

  test('recomputes completed challenge awards and rejects forged challenge truth', () => {
    const completed = legalStates().find(({ phase, challenge }) =>
      phase === 'challenge' && challenge.status === 'completed' && challenge.masterSeal)!;
    const valid = createCampaignSave(completed);
    const replaceChallenge = (challenge: Record<string, unknown>) => ({
      ...completed,
      challenge,
      actRecord: { ...completed.actRecord!, challenge },
    });
    const forged = [
      replaceChallenge({
        ...completed.challenge,
        allocation: halfSplit,
        reachedFrontier: true,
        masterSeal: true,
      }),
      replaceChallenge({
        ...completed.challenge,
        status: 'in-progress',
        reachedFrontier: true,
        masterSeal: true,
      }),
      replaceChallenge({
        ...completed.challenge,
        hintStage: 3,
        sealEligible: false,
        masterSeal: true,
      }),
    ];

    for (const campaign of forged) {
      expectReset(JSON.stringify({ ...valid, campaign }), 'invalid-save');
    }
  });

  test('validates verdict metrics and nested Performance Ledger records', () => {
    const complete = legalStates().find((state) => state.phase === 'ledger');
    expect(complete).toBeDefined();
    const valid = createCampaignSave(complete!);

    expectReset(JSON.stringify({
      ...valid,
      campaign: {
        ...valid.campaign,
        finalVerdict: {
          ...valid.campaign.finalVerdict,
          metrics: { ...valid.campaign.finalVerdict!.metrics, nsw: '4901' },
        },
      },
    }), 'invalid-save');

    expectReset(JSON.stringify({
      ...valid,
      campaign: {
        ...valid.campaign,
        actRecord: {
          ...valid.campaign.actRecord,
          intuitionRating: 0,
        },
      },
    }), 'invalid-save');
  });

  test('applies settings defaults and enforces settings bounds', () => {
    const save = createCampaignSave(initialCampaignState());
    expect(save.settings).toEqual({
      subtitles: true,
      volume: 1,
      dialogueAutoPlay: false,
      dialogueSpeed: 'standard',
      textSize: 'medium',
    });
    expect(DEFAULT_CAMPAIGN_SETTINGS.subtitles).toBe(true);

    for (const volume of [-0.01, 1.01, Number.NaN]) {
      const invalid = { ...save, settings: { ...save.settings, volume } };
      expect(encodeCampaignSave(invalid).status).toBe('invalid');
    }
    for (const dialogueSpeed of ['slow', 'standard', 'fast'] as const) {
      expect(encodeCampaignSave({
        ...save,
        settings: { ...save.settings, dialogueSpeed },
      }).status).toBe('encoded');
    }
    expect(encodeCampaignSave({
      ...save,
      settings: { ...save.settings, dialogueSpeed: 'instant' },
    }).status).toBe('invalid');
  });

  test('defaults guidance recall for an older v2 save that predates the field', () => {
    const save = createCampaignSave(initialCampaignState());
    const { firstUseGuidanceCompleted: _ignored, ...legacyRecall } = save.recall;
    const decoded = decodeCampaignSave(JSON.stringify({ ...save, recall: legacyRecall }));
    expect(decoded.status).toBe('restored');
    if (decoded.status === 'restored') {
      expect(decoded.envelope.recall.firstUseGuidanceCompleted).toBe(false);
    }
  });

  test('round-trips recall independently from campaign progression', () => {
    const envelope = createCampaignSave(
      initialCampaignState(),
      { volume: 0.35, dialogueAutoPlay: true, dialogueSpeed: 'fast' },
      { watchedCutsceneSlots: ['cs-00', 'cs-03'], watchedRevealActs: [1] },
    );
    const encoded = encodeCampaignSave(envelope);
    expect(encoded.status).toBe('encoded');
    if (encoded.status !== 'encoded') return;
    const decoded = decodeCampaignSave(encoded.value);
    expect(decoded.status).toBe('restored');
    if (decoded.status !== 'restored') return;
    expect(decoded.envelope.recall).toEqual({
      watchedCutsceneSlots: ['cs-00', 'cs-03'],
      watchedRevealActs: [1],
      firstUseGuidanceCompleted: false,
    });
    expect(decoded.envelope.campaign.phase).toBe('cutscene');
    expect(DEFAULT_CAMPAIGN_RECALL).toEqual({
      watchedCutsceneSlots: [],
      watchedRevealActs: [],
      firstUseGuidanceCompleted: false,
    });
  });
});

describe('Campaign v2 allocation shape validation', () => {
  test('rejects mixed Act II rows in Act I and malformed Act II divisible rows', () => {
    const save = createCampaignSave(initialCampaignState());
    const mixedActOne = {
      ...save,
      campaign: {
        ...save.campaign,
        draftAllocation: [
          { goodId: 'loom-workshop', shares: [], owner: 0 },
          ...save.campaign.draftAllocation.slice(1),
        ],
      },
    };
    expect(encodeCampaignSave(mixedActOne).status).toBe('invalid');
    const invalidActTwo = {
      ...save,
      campaign: {
        ...save.campaign,
        act: 2 as const,
        phase: 'investigation' as const,
        cutscene: null,
        draftAllocation: [
          { goodId: 'loom-workshop', shares: [], owner: 2 },
          { goodId: 'mulberry-fields', shares: [10, 0, 0] },
          { goodId: 'cash-silver', shares: [10, 0] },
          { goodId: 'raw-silk', shares: [0, 0, 10] },
        ],
      },
    };
    expect(encodeCampaignSave(invalidActTwo).status).toBe('invalid');
  });
});

describe('Campaign v2 storage boundary', () => {
  test('uses stable v2 and legacy keys and shows the rebuilt-campaign notice exactly until marked seen', () => {
    expect(CAMPAIGN_V2_STORAGE_KEY).toBe('settled-shares-campaign-v2');
    expect(LEGACY_CAMPAIGN_V1_STORAGE_KEY).toBe('settled-shares-campaign-v1');
    const storage = new MemoryStorage();
    storage.setItem(LEGACY_CAMPAIGN_V1_STORAGE_KEY, '{legacy contents are deliberately ignored}');

    const first = loadCampaignSave(storage);
    expect(first).toMatchObject({
      status: 'reset',
      reason: 'legacy-v1',
      showRebuiltCampaignNotice: true,
    });
    expect(storage.getItem(CAMPAIGN_V2_STORAGE_KEY)).toBeNull();

    expect(markRebuiltCampaignNoticeSeen(storage)).toEqual({ status: 'saved' });
    expect(storage.getItem(LEGACY_CAMPAIGN_NOTICE_STORAGE_KEY)).toBe('seen');
    const second = loadCampaignSave(storage);
    expect(second).toMatchObject({
      status: 'reset',
      reason: 'legacy-v1',
      showRebuiltCampaignNotice: false,
    });
  });

  test('restores the same campaign independent of locale', () => {
    const storage = new MemoryStorage();
    const campaign = legalStates().at(-1)!;
    const save = createCampaignSave(campaign, { volume: 0.5 });
    expect(saveCampaign(storage, save)).toEqual({ status: 'saved' });

    // Locale is intentionally absent from both the storage API and save envelope.
    const restoredWhileEnglish = loadCampaignSave(storage);
    const restoredWhileTraditionalChinese = loadCampaignSave(storage);
    expect(restoredWhileEnglish).toEqual(restoredWhileTraditionalChinese);
    expect(restoredWhileEnglish.status).toBe('restored');
    if (restoredWhileEnglish.status === 'restored') {
      expect(restoredWhileEnglish.envelope.campaign).toEqual(campaign);
      expect(Object.hasOwn(restoredWhileEnglish.envelope, 'locale')).toBe(false);
    }
  });

  test('degrades unavailable and throwing storage to typed results', () => {
    const unavailable: StorageLike = {
      getItem() { throw new Error('blocked'); },
      setItem() { throw new Error('blocked'); },
    };
    expect(loadCampaignSave(unavailable)).toMatchObject({
      status: 'unavailable',
      reason: 'storage-unavailable',
    });
    expect(saveCampaign(unavailable, createCampaignSave(initialCampaignState()))).toEqual({
      status: 'unavailable',
      reason: 'storage-unavailable',
    });
    expect(markRebuiltCampaignNoticeSeen(unavailable)).toEqual({
      status: 'unavailable',
      reason: 'storage-unavailable',
    });
  });

  test('returns an initial typed reset when no save exists', () => {
    const result = loadCampaignSave(new MemoryStorage());
    expect(result).toMatchObject({
      status: 'reset',
      reason: 'missing',
      showRebuiltCampaignNotice: false,
      envelope: { version: 2, campaign: { phase: 'cutscene' } },
    });
  });
});
