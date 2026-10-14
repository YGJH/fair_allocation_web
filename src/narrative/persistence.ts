import { z } from 'zod';
import { ACT_ONE_DEFINITION, ACT_TWO_DEFINITION, ACT_THREE_DEFINITION } from './campaign-definition';
import { analyzeActOneAllocation, analyzeActTwoAllocation, analyzeActThreeAllocation, evaluateActOneMasterChallenge, evaluateActTwoMasterChallenge, evaluateActThreeMasterChallenge, gradeActOne, gradeActTwo, gradeActThree, buildEpilogueSummary } from './campaign-rules';
import { initialCampaignState, type ParsedCampaignState } from './state-machine';
import { evaluateNationalEnding } from './ending-rules';
import type { CampaignAct, CampaignCutsceneSlot, CampaignState } from './types';

export const CAMPAIGN_V2_STORAGE_KEY = 'settled-shares-campaign-v2';
export const LEGACY_CAMPAIGN_V1_STORAGE_KEY = 'settled-shares-campaign-v1';
export const LEGACY_CAMPAIGN_NOTICE_STORAGE_KEY = 'settled-shares-campaign-v2-rebuilt-notice';
export interface StorageLike { getItem(key: string): string | null; setItem(key: string, value: string): void; }
export type CampaignSettings = { readonly subtitles: boolean; readonly volume: number; readonly dialogueAutoPlay: boolean; readonly dialogueSpeed: 'slow' | 'standard' | 'fast' };
export type CampaignRecall = { readonly watchedCutsceneSlots: readonly CampaignCutsceneSlot[]; readonly watchedRevealActs: readonly CampaignAct[]; readonly firstUseGuidanceCompleted: boolean };
export type CampaignSaveV2 = { readonly version: 2; readonly campaign: CampaignState; readonly settings: CampaignSettings; readonly recall: CampaignRecall };
export type ParsedCampaignSaveV2 = Omit<CampaignSaveV2, 'campaign'> & { readonly campaign: ParsedCampaignState };
export const DEFAULT_CAMPAIGN_SETTINGS: CampaignSettings = Object.freeze({ subtitles: true, volume: 1, dialogueAutoPlay: false, dialogueSpeed: 'standard' });
export const DEFAULT_CAMPAIGN_RECALL: CampaignRecall = Object.freeze({ watchedCutsceneSlots: [], watchedRevealActs: [], firstUseGuidanceCompleted: false });

const actOneClueIds = ['clue-chen-shouye-valuations', 'clue-chen-congzheng-valuations', 'clue-chen-elder-equal-split', 'clue-yiwu-original-ruling'] as const;
const actTwoClueIds = ['clue-pei-boqian-valuations', 'clue-pei-zhongwen-valuations', 'clue-xue-shoucheng-valuations', 'clue-loom-workshop-indivisible'] as const;
const actThreeClueIds = ['clue-wai-chao-valuations', 'clue-ji-zhen-valuations', 'clue-nei-ting-valuations', 'clue-emperor-no-unanimity'] as const;
const clueIdSchema = z.enum([...actOneClueIds, ...actTwoClueIds, ...actThreeClueIds] as [string, ...string[]]);
const cutsceneSlotSchema = z.enum(['cs-00', 'cs-01', 'cs-02', 'cs-03', 'cs-04', 'cs-05', 'cs-06', 'cs-07', 'cs-08', 'cs-09', 'cs-10', 'cs-11', 'cs-12', 'cs-13', 'cs-14']);
const phaseSchema = z.enum(['cutscene', 'title', 'intro', 'investigation', 'allocation', 'intuition-rating', 'debrief', 'revision-decision', 'revision', 'final-verdict', 'challenge', 'ledger', 'replay', 'act-two-transition', 'act-three-transition', 'ending', 'completed']);
const returnTargetSchema = z.enum(['title', 'intro', 'investigation', 'allocation', 'intuition-rating', 'debrief', 'revision-decision', 'revision', 'final-verdict', 'challenge', 'ledger', 'replay', 'act-two-transition', 'act-three-transition', 'ending']);
const ratingSchema = z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]);
const gradeSchema = z.enum(['不稱職', '平常', '稱職']);
const endingIdSchema = z.enum(['鼎足而立', '江陵之怨', '薊門之怨', '大璫之怨', '留中不發']);
const endingSeveritySchema = z.enum(['none', 'mild', 'severe']);
const endingPartySchema = z.enum(['外朝', '薊鎮', '內廷']);
const endingResolutionSchema = z.object({ ending: endingIdSchema, severity: endingSeveritySchema, mostAggrievedParty: endingPartySchema.nullable(), envyGap: z.number().int().nonnegative().nullable() }).strict();
const endingStateSchema = z.object({ resolution: endingResolutionSchema, hiddenEnding: z.boolean(), summary: z.object({
  grades: z.tuple([gradeSchema, gradeSchema, gradeSchema]),
  initialRatings: z.tuple([ratingSchema, ratingSchema, ratingSchema]),
  masterSeals: z.tuple([z.boolean(), z.boolean(), z.boolean()]),
  yiwuVignette: z.enum(['competent-or-better', 'ordinary-or-below']),
  hangzhouVignette: z.enum(['competent-or-better', 'ordinary-or-below']),
  overallSeal: z.enum(['國之權衡', '持平良吏', '循例之官']),
  hiddenEnding: z.boolean(),
}).strict(), nationalCutsceneWatched: z.boolean(), hiddenCutsceneWatched: z.boolean() }).strict();

const shareSchema = z.number().int().min(0).max(10);
const actOneGoodIds = ['paddy-field', 'oil-tea-hillside', 'silver'] as const;
const actTwoDivisibleGoodIds = ['mulberry-fields', 'cash-silver', 'raw-silk'] as const;
const actOneRowSchema = z.object({
  goodId: z.enum(actOneGoodIds),
  shares: z.tuple([shareSchema, shareSchema]),
}).strict();
const actTwoWorkshopRowSchema = z.object({
  goodId: z.literal('loom-workshop'),
  shares: z.array(shareSchema).length(0),
  owner: z.number().int().min(0).max(2),
}).strict();
const actTwoDivisibleRowSchema = z.object({
  goodId: z.enum(actTwoDivisibleGoodIds),
  shares: z.tuple([shareSchema, shareSchema, shareSchema]),
}).strict();
function withUniqueGoods<T extends z.ZodTypeAny>(schema: T, expectedIds: readonly string[], expectedLength: number) {
  return z.array(schema).length(expectedLength).superRefine((rows, context) => {
    const ids = rows.map((row) => (row as { goodId: string }).goodId);
    if (new Set(ids).size !== ids.length || ids.some((id) => !expectedIds.includes(id)) || expectedIds.some((id) => !ids.includes(id))) {
      context.addIssue({ code: 'custom', message: 'Allocation must contain exactly the authored goods for its act.' });
    }
    for (const row of rows as Array<{ shares: readonly number[] }>) {
      if (row.shares.length > 0 && row.shares.reduce((sum, share) => sum + share, 0) !== 10) context.addIssue({ code: 'custom', message: 'Shares must total ten.' });
    }
  });
}
const actOneAllocationSchema = withUniqueGoods(actOneRowSchema, actOneGoodIds, 3);
const actTwoAllocationSchema = withUniqueGoods(z.union([actTwoWorkshopRowSchema, actTwoDivisibleRowSchema]), ['loom-workshop', ...actTwoDivisibleGoodIds], 4);
const actThreeWritIds = ['military-command', 'salt-tax', 'grain-route', 'firearms', 'border-market', 'imperial-weaving'] as const;
const actThreeAllocationSchema = z.array(z.object({ goodId: z.enum(actThreeWritIds), writId: z.enum(actThreeWritIds), shares: z.array(z.never()).length(0), owner: z.number().int().min(0).max(2) }).strict()).length(6).superRefine((rows, context) => {
  const ids = rows.map(({ goodId }) => goodId);
  if (new Set(ids).size !== ids.length || actThreeWritIds.some((id) => !ids.includes(id))) context.addIssue({ code: 'custom', message: 'Act III must contain each Writ exactly once.' });
  if (rows.some(({ goodId, writId }) => goodId !== writId)) context.addIssue({ code: 'custom', message: 'Writ and row IDs must agree.' });
});
export const campaignAllocationSchema = z.union([actOneAllocationSchema, actTwoAllocationSchema, actThreeAllocationSchema]);

function actForAllocation(allocation: readonly { goodId: string }[]) {
  if (allocation.some(({ goodId }) => actThreeWritIds.includes(goodId as (typeof actThreeWritIds)[number]))) return 3;
  return allocation.some(({ goodId }) => goodId === 'loom-workshop') ? 2 : 1;
}
function allocationMatchesAct(allocation: readonly { goodId: string }[], act: 1 | 2 | 3) {
  const result = (act === 1 ? actOneAllocationSchema : act === 2 ? actTwoAllocationSchema : actThreeAllocationSchema).safeParse(allocation);
  return result.success;
}
function expectedMetrics(allocation: unknown) {
  const act = actForAllocation(allocation as readonly { goodId: string }[]);
  return act === 1 ? analyzeActOneAllocation(allocation) : act === 2 ? analyzeActTwoAllocation(allocation) : analyzeActThreeAllocation(allocation);
}
const metricsSchema = z.object({
  utilities: z.array(z.number().int().min(0).max(100)).min(2).max(3), nsw: z.string().regex(/^(0|[1-9]\d*)$/),
  proportionality: z.boolean(), ef: z.boolean(), ef1: z.boolean(), efx: z.boolean(),
  envyPairs: z.array(z.object({ i: z.number().int().min(0), j: z.number().int().min(0), gap: z.number().int().nonnegative() }).strict()).optional(),
}).strict();
export const campaignVerdictSchema = z.object({ allocation: campaignAllocationSchema, metrics: metricsSchema, missingClueIds: z.array(clueIdSchema).optional() }).strict().superRefine((verdict, context) => {
  try {
    const analysis = expectedMetrics(verdict.allocation);
    const expected = { utilities: analysis.utilities.map(Number), nsw: analysis.nsw.toString(), proportionality: analysis.proportionality, ef: analysis.ef, ef1: analysis.ef1, efx: analysis.efx, envyPairs: analysis.envyPairs.map(({ i, j, gap }) => ({ i, j, gap: Number(gap) })) };
    const supplied = { ...verdict.metrics, envyPairs: verdict.metrics.envyPairs ?? [] };
    if (JSON.stringify(supplied) !== JSON.stringify(expected)) context.addIssue({ code: 'custom', message: 'Verdict metrics do not match its allocation.' });
  } catch { context.addIssue({ code: 'custom', message: 'Verdict allocation is not analyzable.' }); }
});

const challengeSchema = z.object({ status: z.enum(['not-started', 'in-progress', 'skipped', 'completed']), allocation: campaignAllocationSchema.nullable(), hintStage: z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3)]), sealEligible: z.boolean(), reachedFrontier: z.boolean(), masterSeal: z.boolean(), checked: z.boolean().default(false), returnTo: z.literal('ledger') }).strict().superRefine((challenge, context) => {
  const active = challenge.status === 'in-progress' || challenge.status === 'completed';
  if (active && challenge.allocation === null) context.addIssue({ code: 'custom', message: 'Active challenge requires an allocation.' });
  if (challenge.status === 'not-started' && challenge.allocation !== null) context.addIssue({ code: 'custom', message: 'Challenge cannot have allocation before it starts.' });
  if (challenge.sealEligible !== (challenge.hintStage !== 3)) context.addIssue({ code: 'custom', message: 'Third hint removes seal eligibility.' });
  if (challenge.status !== 'completed') {
    if (challenge.reachedFrontier || challenge.masterSeal) context.addIssue({ code: 'custom', message: 'Incomplete challenge cannot have awards.' });
    return;
  }
  if (!challenge.allocation) return;
  try {
    const analysis = expectedMetrics(challenge.allocation);
    const result = actForAllocation(challenge.allocation) === 1
      ? evaluateActOneMasterChallenge(analysis, challenge.sealEligible)
      : actForAllocation(challenge.allocation) === 2
        ? evaluateActTwoMasterChallenge(analysis, challenge.sealEligible)
        : evaluateActThreeMasterChallenge({ efx: analysis.efx, nsw: analysis.nsw }, challenge.sealEligible);
    if (!result.completed || result.reachedFrontier !== challenge.reachedFrontier || result.masterSeal !== challenge.masterSeal) context.addIssue({ code: 'custom', message: 'Challenge awards do not match allocation.' });
  } catch { context.addIssue({ code: 'custom', message: 'Challenge allocation is not analyzable.' }); }
});

function validateRecordAllocations(record: { initialVerdict: { allocation: readonly { goodId: string }[] }; finalVerdict: { allocation: readonly { goodId: string }[] }; challenge: { allocation: readonly { goodId: string }[] | null } }, act: 1 | 2 | 3, context: z.RefinementCtx) {
  if (!allocationMatchesAct(record.initialVerdict.allocation, act) || !allocationMatchesAct(record.finalVerdict.allocation, act) || (record.challenge.allocation !== null && !allocationMatchesAct(record.challenge.allocation, act))) {
    context.addIssue({ code: 'custom', message: `Act ${act} record contains an allocation from another act.` });
  }
}
const actOneRecordSchema = z.object({ act: z.literal(1), initialVerdict: campaignVerdictSchema, intuitionRating: ratingSchema, revisionUsed: z.boolean(), finalVerdict: campaignVerdictSchema, grade: gradeSchema, challenge: challengeSchema }).strict().superRefine((record, context) => {
  validateRecordAllocations(record, 1, context);
  if (record.grade !== gradeActOne({ utilities: record.finalVerdict.metrics.utilities.map(BigInt) })) context.addIssue({ code: 'custom', message: 'Act I grade does not match Final Verdict.' });
});
const actTwoRecordSchema = z.object({ act: z.literal(2), initialVerdict: campaignVerdictSchema, intuitionRating: ratingSchema, revisionUsed: z.boolean(), finalVerdict: campaignVerdictSchema, grade: gradeSchema, challenge: challengeSchema }).strict().superRefine((record, context) => {
  validateRecordAllocations(record, 2, context);
  if (record.grade !== gradeActTwo(record.finalVerdict.metrics)) context.addIssue({ code: 'custom', message: 'Act II grade does not match Final Verdict.' });
});
const actThreeRecordSchema = z.object({ act: z.literal(3), initialVerdict: campaignVerdictSchema, intuitionRating: ratingSchema, revisionUsed: z.boolean(), finalVerdict: campaignVerdictSchema, grade: gradeSchema, challenge: challengeSchema }).strict().superRefine((record, context) => {
  validateRecordAllocations(record, 3, context);
  if (record.grade !== gradeActThree({ ef1: record.finalVerdict.metrics.ef1, efx: record.finalVerdict.metrics.efx, nsw: BigInt(record.finalVerdict.metrics.nsw) })) context.addIssue({ code: 'custom', message: 'Act III grade does not match Final Verdict.' });
});
const recordSchema = z.union([actOneRecordSchema, actTwoRecordSchema, actThreeRecordSchema]);
const replaySchema = z.object({ selectedAct: z.union([z.literal(1), z.literal(2), z.literal(3)]), returnTo: z.enum(['ledger', 'act-two-transition', 'act-three-transition']), draftAllocation: campaignAllocationSchema, sandboxRecord: recordSchema.nullable() }).strict().superRefine((replay, context) => {
  if (!allocationMatchesAct(replay.draftAllocation, replay.selectedAct)) context.addIssue({ code: 'custom', message: 'Replay allocation does not match its selected act.' });
  if (replay.sandboxRecord && replay.sandboxRecord.act !== replay.selectedAct) context.addIssue({ code: 'custom', message: 'Replay record does not match its selected act.' });
});

export const campaignStateSchema = z.object({
  act: z.union([z.literal(1), z.literal(2), z.literal(3)]), phase: phaseSchema,
  cutscene: z.object({ slotId: cutsceneSlotSchema, returnTo: returnTargetSchema }).strict().nullable(),
  ending: endingStateSchema.nullable(), discoveredClueIds: z.array(clueIdSchema).superRefine((ids, context) => { if (new Set(ids).size !== ids.length) context.addIssue({ code: 'custom', message: 'Clues must be unique.' }); }),
  draftAllocation: campaignAllocationSchema, initialVerdict: campaignVerdictSchema.nullable(), intuitionRating: ratingSchema.nullable(), revisionAllocation: campaignAllocationSchema.nullable(), revisionUsed: z.boolean(), finalVerdict: campaignVerdictSchema.nullable(), recordHistory: z.array(recordSchema).default([]), actRecord: recordSchema.nullable(), challenge: challengeSchema, replay: replaySchema.nullable(), dependentResults: z.object({ ledger: z.literal('current'), ending: z.literal('current') }).strict(),
}).strict().superRefine((state, context) => {
  const issue = (message: string) => context.addIssue({ code: 'custom', message });
  if ((state.phase === 'cutscene') !== (state.cutscene !== null)) issue('Cutscene data must exist only in cutscene phase.');
  if ((state.phase === 'ending' || state.phase === 'completed') !== (state.ending !== null)) issue('Ending data must exist only in ending or completed phase.');
  if (state.ending && state.ending.hiddenCutsceneWatched && !state.ending.hiddenEnding) issue('CS-14 cannot be watched before the hidden ending is unlocked.');
  if (state.ending && !state.finalVerdict) issue('Ending requires the Act III Final Verdict.');
  if (state.ending && state.act !== 3) issue('Ending belongs to Act III.');
  if (state.ending && state.finalVerdict) {
    const expectedEnding = evaluateNationalEnding(state.finalVerdict);
    if (JSON.stringify(state.ending.resolution) !== JSON.stringify(expectedEnding)) issue('Ending resolution does not match the Final Verdict.');
    const allRecords = [...state.recordHistory, ...(state.actRecord ? [state.actRecord] : [])];
    const expectedHidden = allRecords.length === 3 && allRecords.every((record) => record.challenge.masterSeal);
    const expectedSummary = buildEpilogueSummary(allRecords, expectedHidden);
    if (state.ending.hiddenEnding !== expectedHidden || JSON.stringify(state.ending.summary) !== JSON.stringify(expectedSummary)) issue('Epilogue summary does not match completed records.');
    if ((state.phase === 'ending' || state.phase === 'completed') && !state.ending.nationalCutsceneWatched) issue('Ending cannot open before the National Ending cutscene.');
    if ((state.phase === 'ending' || state.phase === 'completed') && state.ending.hiddenEnding && !state.ending.hiddenCutsceneWatched) issue('Hidden ending cannot open before CS-14.');
  }
  if ((state.phase === 'replay') !== (state.replay !== null)) issue('Replay data must exist only in replay phase.');
  if (state.revisionUsed !== (state.revisionAllocation !== null)) issue('Revision state must represent zero or one Revision.');
  const stateAllocationAct = state.act === 2 && (state.phase === 'act-two-transition' || (state.phase === 'replay' && state.replay?.returnTo === 'act-two-transition')) ? 1 : state.act === 3 && (state.phase === 'act-three-transition' || (state.phase === 'replay' && state.replay?.returnTo === 'act-three-transition')) ? (state.actRecord?.act === 2 ? 2 : 3) : state.act;
  if (!allocationMatchesAct(state.draftAllocation, stateAllocationAct)) issue('Draft allocation does not match the active act.');
  if (state.initialVerdict && (!allocationMatchesAct(state.initialVerdict.allocation, stateAllocationAct) || JSON.stringify(state.initialVerdict.allocation) !== JSON.stringify(state.draftAllocation))) issue('Initial Verdict must remain the committed draft allocation for the active act.');
  if (state.revisionAllocation && !allocationMatchesAct(state.revisionAllocation, stateAllocationAct)) issue('Revision allocation does not match the active act.');
  if (state.finalVerdict && !allocationMatchesAct(state.finalVerdict.allocation, stateAllocationAct)) issue('Final Verdict allocation does not match the active act.');
  if (state.challenge.allocation !== null && !allocationMatchesAct(state.challenge.allocation, stateAllocationAct)) issue('Challenge allocation does not match the active act.');
  if (state.act === 1 && state.recordHistory.length > 0) issue('Act I cannot contain completed records from a later act.');
  if (state.act === 2 && state.recordHistory.some((record) => record.act !== 1)) issue('Act II history may only contain the completed Act I record.');
  if (state.act === 2 && state.phase !== 'act-two-transition' && state.recordHistory.length > 1) issue('Act II history may contain only one completed Act I record.');
  if (state.act === 3 && (state.recordHistory.length > 2 || state.recordHistory.some((record, index) => record.act !== index + 1))) issue('Act III history must preserve Acts I and II.');
  const opening = ['title', 'intro', 'investigation', 'allocation'].includes(state.phase) || (state.phase === 'cutscene' && ['cs-00', 'cs-01', 'cs-04', 'cs-07'].includes(state.cutscene?.slotId ?? '')); 
  if (opening && (state.initialVerdict || state.intuitionRating || state.revisionUsed || state.revisionAllocation || state.finalVerdict || state.actRecord || state.replay)) issue('Opening phase cannot contain committed verdict progress.');
  if (state.phase === 'cutscene') {
    const slot = state.cutscene?.slotId;
    const legal = ['cs-00', 'cs-01', 'cs-02', 'cs-03', 'cs-04', 'cs-05', 'cs-06', 'cs-07', 'cs-08', 'cs-09', 'cs-10', 'cs-11', 'cs-12', 'cs-13', 'cs-14'].includes(slot ?? '');
    if (!legal) issue('Unknown Cutscene slot.');
  }
  const actOneClueSet = state.discoveredClueIds.every((id) => (actOneClueIds as readonly string[]).includes(id));
  const actTwoClueSet = state.discoveredClueIds.every((id) => (actTwoClueIds as readonly string[]).includes(id));
  const actThreeClueSet = state.discoveredClueIds.every((id) => (actThreeClueIds as readonly string[]).includes(id));
  if (state.act === 1 && !actOneClueSet) issue('Act I cannot contain later-act clues.');
  if (state.act === 2 && !actTwoClueSet && state.phase !== 'act-two-transition' && !(state.phase === 'replay' && state.replay?.returnTo === 'act-two-transition')) issue('Act II cannot contain other-act clues.');
  if (state.act === 3 && !actThreeClueSet && state.phase !== 'act-three-transition' && !(state.phase === 'replay' && state.replay?.returnTo === 'act-three-transition')) issue('Act III cannot contain other-act clues.');
  if (state.act === 2 && state.phase !== 'act-two-transition' && state.phase !== 'replay' && !allocationMatchesAct(state.draftAllocation, 2)) issue('Act II state must use mixed goods.');
  if (state.act === 3 && state.phase !== 'act-three-transition' && state.phase !== 'replay' && !allocationMatchesAct(state.draftAllocation, 3)) issue('Act III state must use Writs.');
  if (state.phase === 'act-two-transition') {
    if (state.act !== 2 || state.actRecord?.act !== 1 || state.recordHistory.length !== 0) issue('Act II transition must carry the active completed Act I record before handoff.');
  } else if (state.phase === 'act-three-transition') {
    const initialTransition = state.actRecord?.act === 2 && state.recordHistory.length === 1 && state.recordHistory[0].act === 1;
    const completedTransition = state.actRecord?.act === 3 && state.recordHistory.length === 2 && state.recordHistory.every((record, index) => record.act === index + 1);
    if (state.act !== 3 || (!initialTransition && !completedTransition)) issue('Act III transition must carry the completed prior records.');
  } else if (state.actRecord && state.actRecord.act !== state.act && !(state.phase === 'replay' && (state.replay?.returnTo === 'act-two-transition' || state.replay?.returnTo === 'act-three-transition'))) issue('Record act must match campaign act.');
  const cluesForbidden = state.phase === 'title' || state.phase === 'intro' || (state.phase === 'cutscene' && ['cs-00', 'cs-01', 'cs-04'].includes(state.cutscene?.slotId ?? ''));
  if (cluesForbidden && state.discoveredClueIds.length > 0) issue('Clues cannot be discovered before investigation.');
  if (state.phase === 'cutscene') {
    const target = state.cutscene?.returnTo;
    const slot = state.cutscene?.slotId;
    const validTarget = (slot === 'cs-00' && target === 'title') || (slot === 'cs-01' && target === 'intro') || (slot === 'cs-02' && target === 'challenge') || (slot === 'cs-03' && target === 'act-two-transition') || (slot === 'cs-04' && target === 'intro') || (slot === 'cs-05' && target === 'challenge') || (slot === 'cs-06' && target === 'act-three-transition') || (slot === 'cs-07' && target === 'intro') || (slot === 'cs-08' && target === 'challenge') || (['cs-09', 'cs-10', 'cs-11', 'cs-12'].includes(slot ?? '') && target === 'act-three-transition') || (['cs-09', 'cs-10', 'cs-11', 'cs-12', 'cs-13', 'cs-14'].includes(slot ?? '') && target === 'ending');
    if (!validTarget) issue('Cutscene return target is not reachable.');
  }
  if (state.phase === 'final-verdict' || state.phase === 'challenge' || state.phase === 'ledger' || state.phase === 'act-three-transition' || state.phase === 'ending' || state.phase === 'completed') {
    if (!state.initialVerdict || !state.intuitionRating || !state.finalVerdict || !state.actRecord) issue('Complete phases require a Final Verdict and record.');
  }
  if (state.phase === 'revision' && (!state.initialVerdict || !state.intuitionRating || !state.revisionUsed || !state.revisionAllocation || state.finalVerdict || state.actRecord)) issue('Revision phase requires one active Revision.');
  if (state.phase === 'final-verdict' && state.finalVerdict) {
    const expected = state.revisionUsed ? state.revisionAllocation : state.initialVerdict?.allocation;
    if (!expected || JSON.stringify(expected) !== JSON.stringify(state.finalVerdict.allocation)) issue('Final Verdict must match the selected Revision path.');
  }
  if (state.actRecord) {
    if (JSON.stringify(state.actRecord.initialVerdict) !== JSON.stringify(state.initialVerdict) || state.actRecord.intuitionRating !== state.intuitionRating || state.actRecord.revisionUsed !== state.revisionUsed || JSON.stringify(state.actRecord.finalVerdict) !== JSON.stringify(state.finalVerdict) || JSON.stringify(state.actRecord.challenge) !== JSON.stringify(state.challenge)) issue('Campaign state and Performance Ledger record must agree.');
  }
  if (state.act === 2 && state.phase !== 'act-two-transition' && !(state.phase === 'replay' && state.replay?.returnTo === 'act-two-transition') && state.actRecord?.act === 1) issue('Act II active record cannot replace its preserved Act I history.');
  if (state.replay) {
    const expectedReturn = state.act === 1 ? 'ledger' : 'act-two-transition';
    if (state.replay.returnTo !== expectedReturn) issue('Replay return target must match its originating boundary.');
  }
  if (state.phase === 'replay' && state.replay?.selectedAct !== 1 && state.replay?.selectedAct !== 2 && state.replay?.selectedAct !== 3) issue('Replay act is not authored.');
});

export const campaignSettingsSchema = z.object({ subtitles: z.boolean(), volume: z.number().finite().min(0).max(1), dialogueAutoPlay: z.boolean(), dialogueSpeed: z.enum(['slow', 'standard', 'fast']) }).strict();
export const campaignRecallSchema = z.object({ watchedCutsceneSlots: z.array(cutsceneSlotSchema).superRefine((slots, context) => { if (new Set(slots).size !== slots.length) context.addIssue({ code: 'custom', message: 'Watched slots must be unique.' }); }), watchedRevealActs: z.array(z.union([z.literal(1), z.literal(2), z.literal(3)])).superRefine((acts, context) => { if (new Set(acts).size !== acts.length) context.addIssue({ code: 'custom', message: 'Watched acts must be unique.' }); }), firstUseGuidanceCompleted: z.boolean().default(false) }).strict();
export const campaignSaveV2Schema = z.object({ version: z.literal(2), campaign: campaignStateSchema, settings: campaignSettingsSchema, recall: campaignRecallSchema }).strict();

export type CampaignDecodeResult = { readonly status: 'restored'; readonly envelope: ParsedCampaignSaveV2 } | { readonly status: 'reset'; readonly reason: 'corrupt-json' | 'unsupported-version' | 'invalid-save'; readonly envelope: ParsedCampaignSaveV2 };
export type CampaignLoadResult = (CampaignDecodeResult & { readonly showRebuiltCampaignNotice: false }) | { readonly status: 'reset'; readonly reason: 'missing' | 'legacy-v1'; readonly envelope: ParsedCampaignSaveV2; readonly showRebuiltCampaignNotice: boolean } | { readonly status: 'unavailable'; readonly reason: 'storage-unavailable'; readonly envelope: ParsedCampaignSaveV2; readonly showRebuiltCampaignNotice: false };
export type CampaignEncodeResult = { readonly status: 'encoded'; readonly value: string } | { readonly status: 'invalid'; readonly reason: 'invalid-save' };
export type CampaignStorageWriteResult = { readonly status: 'saved' } | { readonly status: 'invalid'; readonly reason: 'invalid-save' } | { readonly status: 'unavailable'; readonly reason: 'storage-unavailable' };

export function createCampaignSave(campaign: CampaignState, settings: Partial<CampaignSettings> = {}, recall: Partial<CampaignRecall> = {}): CampaignSaveV2 {
  return { version: 2, campaign, settings: { ...DEFAULT_CAMPAIGN_SETTINGS, ...settings }, recall: { watchedCutsceneSlots: recall.watchedCutsceneSlots ? [...recall.watchedCutsceneSlots] : [], watchedRevealActs: recall.watchedRevealActs ? [...recall.watchedRevealActs] : [], firstUseGuidanceCompleted: recall.firstUseGuidanceCompleted ?? false } };
}
function asParsed(value: z.infer<typeof campaignSaveV2Schema>): ParsedCampaignSaveV2 { return value as unknown as ParsedCampaignSaveV2; }
function initialParsedEnvelope(): ParsedCampaignSaveV2 { const parsed = campaignSaveV2Schema.safeParse(createCampaignSave(initialCampaignState())); if (!parsed.success) throw new Error('Initial Campaign state does not satisfy save schema.'); return asParsed(parsed.data); }
export function encodeCampaignSave(value: unknown): CampaignEncodeResult { const parsed = campaignSaveV2Schema.safeParse(value); return parsed.success ? { status: 'encoded', value: JSON.stringify(parsed.data) } : { status: 'invalid', reason: 'invalid-save' }; }
export function decodeCampaignSave(raw: string): CampaignDecodeResult { let value: unknown; try { value = JSON.parse(raw); } catch { return { status: 'reset', reason: 'corrupt-json', envelope: initialParsedEnvelope() }; } if (typeof value === 'object' && value !== null && 'version' in value && (value as { version?: unknown }).version !== 2) return { status: 'reset', reason: 'unsupported-version', envelope: initialParsedEnvelope() }; const parsed = campaignSaveV2Schema.safeParse(value); return parsed.success ? { status: 'restored', envelope: asParsed(parsed.data) } : { status: 'reset', reason: 'invalid-save', envelope: initialParsedEnvelope() }; }
export function loadCampaignSave(storage: StorageLike): CampaignLoadResult { try { const raw = storage.getItem(CAMPAIGN_V2_STORAGE_KEY); if (raw !== null) return { ...decodeCampaignSave(raw), showRebuiltCampaignNotice: false }; if (storage.getItem(LEGACY_CAMPAIGN_V1_STORAGE_KEY) !== null) return { status: 'reset', reason: 'legacy-v1', envelope: initialParsedEnvelope(), showRebuiltCampaignNotice: storage.getItem(LEGACY_CAMPAIGN_NOTICE_STORAGE_KEY) !== 'seen' }; return { status: 'reset', reason: 'missing', envelope: initialParsedEnvelope(), showRebuiltCampaignNotice: false }; } catch { return { status: 'unavailable', reason: 'storage-unavailable', envelope: initialParsedEnvelope(), showRebuiltCampaignNotice: false }; } }
export function saveCampaign(storage: StorageLike, envelope: unknown): CampaignStorageWriteResult { const encoded = encodeCampaignSave(envelope); if (encoded.status === 'invalid') return encoded; try { storage.setItem(CAMPAIGN_V2_STORAGE_KEY, encoded.value); return { status: 'saved' }; } catch { return { status: 'unavailable', reason: 'storage-unavailable' }; } }
export function markRebuiltCampaignNoticeSeen(storage: StorageLike): CampaignStorageWriteResult { try { storage.setItem(LEGACY_CAMPAIGN_NOTICE_STORAGE_KEY, 'seen'); return { status: 'saved' }; } catch { return { status: 'unavailable', reason: 'storage-unavailable' }; } }
