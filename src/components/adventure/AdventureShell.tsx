'use client';

import {
  useCallback,
  useEffect,
  useId,
  useReducer,
  useRef,
  useState,
} from 'react';
import type { Locale } from '../../i18n/copy';
import { getAdventureCopy } from '../../i18n/adventure';
import { analyzeActOneAllocation, analyzeActTwoAllocation, analyzeActThreeAllocation } from '../../narrative/campaign-rules';
import { ACT_TWO_DEFINITION, type ActTwoClueId } from '../../narrative/campaign-definition';
import {
  createCampaignSave,
  DEFAULT_CAMPAIGN_RECALL,
  DEFAULT_CAMPAIGN_SETTINGS,
  loadCampaignSave,
  markRebuiltCampaignNoticeSeen,
  saveCampaign,
  type CampaignLoadResult,
  type CampaignRecall,
  type CampaignSettings,
  type StorageLike,
} from '../../narrative/persistence';
import {
  selectCanStartAllocation,
  selectCurrentTask,
  selectRequiredClueProgress,
} from '../../narrative/selectors';
import {
  campaignReducer,
  initialCampaignState,
} from '../../narrative/state-machine';
import type { ActOneRecord, ActTwoRecord, ActThreeRecord, CampaignAllocation, CampaignVerdict } from '../../narrative/types';
import type { AuthoredCutsceneSlot, AvailableCutsceneSlot } from '../../narrative/media-manifest';
import { AdventureDialog } from './AdventureDialog';
import { AllocationWorkbench } from './AllocationWorkbench';
import { ACT_ONE_CLUE_IDS, InvestigationDossier } from './InvestigationDossier';
import { ScenePlate } from './ScenePlate';
import { CutscenePlayer } from './CutscenePlayer';
import { GameStage } from './GameStage';
import { JudgmentGate } from './JudgmentGate';
import { CaseScrollDebrief } from './CaseScrollDebrief';
import { ShareGauge } from './ShareGauge';
import flowStyles from './VerdictFlow.module.css';
import { PauseMenu } from './PauseMenu';
import { MasterChallenge } from './MasterChallenge';
import { PerformanceLedger } from './PerformanceLedger';
import { RecallArchive } from './RecallArchive';
import { ActTwoInvestigation } from './ActTwoInvestigation';
import { ActTwoDebrief, ActTwoRevision } from './ActTwoVerdict';
import { ActTwoChallenge } from './ActTwoChallenge';
import { ActThreeChallenge, ActThreeDebrief, ActThreeInvestigation, ActThreeLedger, ActThreeRevision, ActThreeWorkbench } from './ActThreeFlow';
import { ActTwoLedger } from './ActTwoLedger';
import { NationalEnding } from './NationalEnding';
import styles from './AdventureShell.module.css';

type LoadReason = Exclude<CampaignLoadResult, { status: 'restored' }>['reason'];
type EntryMode = 'first-visit' | 'returning';

function getBrowserStorage(): StorageLike | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function verdictForAllocation(allocation: CampaignAllocation, act: 1 | 2 | 3 = 1): CampaignVerdict | null {
  try {
    const analysis = act === 1 ? analyzeActOneAllocation(allocation) : act === 2 ? analyzeActTwoAllocation(allocation) : analyzeActThreeAllocation(allocation);
    return {
      allocation: allocation.map((row) => ({ goodId: row.goodId, shares: [...row.shares], ...(row.owner === undefined ? {} : { owner: row.owner }) })),
      metrics: { utilities: analysis.utilities.map(Number), nsw: analysis.nsw.toString(), proportionality: analysis.proportionality, ef: analysis.ef, ef1: analysis.ef1, efx: analysis.efx, envyPairs: analysis.envyPairs.map(({ i, j, gap }) => ({ i, j, gap: Number(gap) })) },
    };
  } catch { return null; }
}

export function AdventureShell({ locale }: { locale: Locale }) {
  const messages = getAdventureCopy(locale);
  const rebuiltTitleId = useId();
  const rebuiltDescriptionId = useId();
  const restartTitleId = useId();
  const restartDescriptionId = useId();
  const [campaign, dispatch] = useReducer(campaignReducer, undefined, initialCampaignState);
  const [settings, setSettings] = useState<CampaignSettings>(DEFAULT_CAMPAIGN_SETTINGS);
  const [recall, setRecall] = useState<CampaignRecall>(DEFAULT_CAMPAIGN_RECALL);
  const [ready, setReady] = useState(false);
  const [entryMode, setEntryMode] = useState<EntryMode>('first-visit');
  const [active, setActive] = useState(false);
  const [pauseOpen, setPauseOpen] = useState(false);
  const [orientationBlocked, setOrientationBlocked] = useState(false);
  const [confirmingEntryRestart, setConfirmingEntryRestart] = useState(false);
  const [showRebuiltNotice, setShowRebuiltNotice] = useState(false);
  const [loadReason, setLoadReason] = useState<LoadReason | null>(null);
  const [storageUnavailable, setStorageUnavailable] = useState(false);
  const [cutsceneKey, setCutsceneKey] = useState(0);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [replaySlot, setReplaySlot] = useState<AuthoredCutsceneSlot | null>(null);
  const browserStorageRef = useRef<StorageLike | null | undefined>(undefined);
  const startButtonRef = useRef<HTMLButtonElement>(null);
  const restartButtonRef = useRef<HTMLButtonElement>(null);
  const cancelRestartRef = useRef<HTMLButtonElement>(null);
  const acknowledgeRef = useRef<HTMLButtonElement>(null);
  const phaseHeadingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (browserStorageRef.current === undefined) {
      browserStorageRef.current = getBrowserStorage();
    }
    const storage = browserStorageRef.current;
    if (!storage) {
      setStorageUnavailable(true);
      setReady(true);
      return;
    }

    const result = loadCampaignSave(storage);
    dispatch({ type: 'RESTORE_PARSED', state: result.envelope.campaign });
    setSettings(result.envelope.settings);
    setRecall(result.envelope.recall);
    setEntryMode(result.status === 'restored' ? 'returning' : 'first-visit');
    setShowRebuiltNotice(result.showRebuiltCampaignNotice);
    setLoadReason(result.status === 'restored' ? null : result.reason);
    setStorageUnavailable(result.status === 'unavailable');
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready || showRebuiltNotice) return;
    const storage = browserStorageRef.current;
    if (!storage) return;
    const result = saveCampaign(
      storage,
      createCampaignSave(campaign, settings, recall),
    );
    setStorageUnavailable(result.status === 'unavailable');
  }, [campaign, ready, recall, settings, showRebuiltNotice]);

  useEffect(() => {
    if (!active || pauseOpen || orientationBlocked) return;
    if (campaign.phase === 'title'
      || campaign.phase === 'intro'
      || campaign.phase === 'investigation'
      || campaign.phase === 'allocation'
      || campaign.phase === 'intuition-rating'
      || campaign.phase === 'debrief'
      || campaign.phase === 'revision-decision'
      || campaign.phase === 'revision'
      || campaign.phase === 'final-verdict'
      || campaign.phase === 'challenge'
      || campaign.phase === 'ledger'
      || campaign.phase === 'act-two-transition'
      || campaign.phase === 'act-three-transition'
      || campaign.phase === 'ending'
      || campaign.phase === 'completed') {
      phaseHeadingRef.current?.focus();
    }
  }, [active, campaign.phase, orientationBlocked, pauseOpen]);

  const handleOrientationBlockedChange = useCallback((blocked: boolean) => {
    setOrientationBlocked(blocked);
  }, []);

  function restartCampaign() {
    dispatch({ type: 'RESTART_CAMPAIGN' });
    setCutsceneKey((value) => value + 1);
    setConfirmingEntryRestart(false);
    setPauseOpen(false);
    setActive(true);
  }

  function acknowledgeRebuiltCampaign() {
    const storage = browserStorageRef.current;
    if (!storage) {
      setStorageUnavailable(true);
      setShowRebuiltNotice(false);
      return;
    }
    const result = markRebuiltCampaignNoticeSeen(storage);
    if (result.status === 'unavailable') setStorageUnavailable(true);
    setShowRebuiltNotice(false);
  }

  function completeCutscene() {
    const slotId = campaign.cutscene?.slotId;
    if (campaign.phase !== 'cutscene' || !slotId) return;
    setRecall((current) => current.watchedCutsceneSlots.includes(slotId)
      ? current
      : { ...current, watchedCutsceneSlots: [...current.watchedCutsceneSlots, slotId] });
    dispatch({ type: 'COMPLETE_CUTSCENE' });
  }

  function replayArchive(slot: AuthoredCutsceneSlot) {
    setArchiveOpen(false);
    setPauseOpen(false);
    setReplaySlot(slot);
  }

  function updateSettings(patch: Partial<CampaignSettings>) {
    setSettings((current) => ({ ...current, ...patch }));
  }

  function markRevealWatched() {
    setRecall((current) => current.watchedRevealActs.includes(campaign.act)
      ? current
      : { ...current, watchedRevealActs: [...current.watchedRevealActs, campaign.act] });
  }

  const loadMessage = loadReason === 'corrupt-json'
    ? messages.shell.recoveryCorrupt
    : loadReason === 'invalid-save'
      ? messages.shell.recoveryInvalid
      : loadReason === 'unsupported-version'
        ? messages.shell.recoveryVersion
        : loadReason === 'legacy-v1' && !showRebuiltNotice
          ? messages.shell.recoveryLegacy
          : null;

  if (!ready) {
    return (
      <div className={styles.loading} data-adventure-v2 role="status" aria-live="polite">
        <span aria-hidden="true">衡</span>
        <p>{messages.shell.loading}</p>
      </div>
    );
  }

  const taskId = selectCurrentTask(campaign);
  const currentTask = taskId === 'watch-cutscene'
    ? messages.pauseMenu.tasks.watchCutscene
    : taskId === 'open-case'
      ? messages.pauseMenu.tasks.openCase
      : taskId === 'hear-introduction'
        ? messages.pauseMenu.tasks.hearIntroduction
        : taskId === 'find-required-clues'
          ? messages.pauseMenu.tasks.investigation
          : taskId === 'prepare-initial-verdict'
            ? messages.pauseMenu.tasks.allocation
            : taskId === 'rate-initial-verdict'
              ? messages.pauseMenu.tasks.intuitionRating
              : taskId === 'review-debrief'
                ? messages.pauseMenu.tasks.debrief
                : taskId === 'decide-revision'
                  ? messages.pauseMenu.tasks.revisionDecision
                  : taskId === 'prepare-revision'
                    ? messages.pauseMenu.tasks.revision
                    : taskId === 'review-final-verdict'
                      ? messages.pauseMenu.tasks.finalVerdict
                      : taskId === 'solve-master-challenge'
                        ? messages.pauseMenu.tasks.solveMasterChallenge
                        : taskId === 'review-ledger'
                          ? messages.pauseMenu.tasks.reviewLedger
                          : taskId === 'begin-act-two'
                            ? messages.pauseMenu.tasks.beginActTwo
                            : messages.pauseMenu.tasks.phaseBoundary;
  const clueProgress = selectRequiredClueProgress(campaign);
  const liveRevisionVerdict = campaign.phase === 'revision' && campaign.revisionAllocation
    ? verdictForAllocation(campaign.revisionAllocation, campaign.act)
    : null;
  const modalOpen = showRebuiltNotice || confirmingEntryRestart || pauseOpen;

  return (
    <GameStage
      labels={messages.stage}
      lockOrientationOnFullscreen
      landscapeGateLabels={{
        title: messages.stage.rotateTitle,
        description: messages.stage.rotateDescription,
      }}
      onLandscapeBlockedChange={handleOrientationBlockedChange}
      chromeInert={modalOpen}
    >
      <div className={styles.shell} data-adventure-v2 data-phase={campaign.phase}>
        <div
          className={styles.interactiveLayer}
          inert={modalOpen || undefined}
          aria-hidden={modalOpen || undefined}
        >
          <header className={styles.hud}>
            <div className={styles.brand}>
              <span aria-hidden="true">衡</span>
              <strong>{messages.shell.campaignTitle}<small>{messages.shell.campaignTitleEnglish}</small></strong>
            </div>
            <nav className={styles.hudActions} aria-label={messages.shell.campaignTitle}>
              <a href={`/${locale === 'zh-TW' ? 'en' : 'zh-TW'}/adventure`}>
                {messages.shell.languageSwitch}
              </a>
              {active ? (
                <button type="button" onClick={() => setPauseOpen(true)}>
                  {messages.shell.openPause}
                </button>
              ) : null}
            </nav>
          </header>

          {storageUnavailable || loadMessage ? (
            <p className={styles.notice} role="status">
              {storageUnavailable ? messages.shell.storageUnavailable : loadMessage}
            </p>
          ) : null}

          {replaySlot !== null ? (
            <CutscenePlayer
              key={`archive-${replaySlot}`}
              slot={replaySlot as AvailableCutsceneSlot}
              locale={locale}
              settings={settings}
              suspended={orientationBlocked}
              onSubtitlesChange={(subtitles) => updateSettings({ subtitles })}
              onVolumeChange={(volume) => updateSettings({ volume })}
              onComplete={() => setReplaySlot(null)}
            />
          ) : !active ? (
            <section className={styles.entryPanel} aria-labelledby="campaign-entry-title">
              <p className={styles.eyebrow}>{messages.shell.campaignTitleEnglish}</p>
              <h1 id="campaign-entry-title">{messages.shell.campaignTitle}</h1>
              <p>{messages.shell.firstVisitLead}</p>
              <div className={styles.actions}>
                <button
                  ref={startButtonRef}
                  type="button"
                  className={styles.primary}
                  onClick={() => setActive(true)}
                >
                  {entryMode === 'returning' ? messages.shell.continue : messages.shell.start}
                </button>
                {entryMode === 'returning' ? (
                  <button
                    ref={restartButtonRef}
                    type="button"
                    className={styles.secondary}
                    onClick={() => setConfirmingEntryRestart(true)}
                  >
                    {messages.shell.restart}
                  </button>
                ) : null}
              </div>
            </section>
          ) : (
            <div className={styles.phase}>
              {campaign.phase === 'cutscene' && campaign.cutscene ? (
                <CutscenePlayer
                  key={`${campaign.cutscene.slotId}-${cutsceneKey}`}
                  slot={campaign.cutscene.slotId as AvailableCutsceneSlot}
                  locale={locale}
                  settings={settings}
                  suspended={pauseOpen || orientationBlocked}
                  onSubtitlesChange={(subtitles) => updateSettings({ subtitles })}
                  onVolumeChange={(volume) => updateSettings({ volume })}
                  onComplete={completeCutscene}
                />
              ) : campaign.phase === 'title' ? (
                <section className={styles.titlePanel} aria-labelledby="campaign-title">
                  <p className={styles.eyebrow}>{messages.shell.titleEyebrow}</p>
                  <h1 ref={phaseHeadingRef} tabIndex={-1} id="campaign-title">{messages.shell.campaignTitle}</h1>
                  <blockquote>{messages.shell.titleLead}</blockquote>
                  <button type="button" className={styles.primary} onClick={() => dispatch({ type: 'BEGIN_FROM_TITLE' })}>
                    {messages.shell.begin}
                  </button>
                </section>
              ) : campaign.phase === 'intro' ? (
                <section className={styles.titlePanel} aria-labelledby="act-title">
                  <p className={styles.eyebrow}>{campaign.act === 1 ? messages.shell.introEyebrow : campaign.act === 2 ? messages.actTwo.taskLabel : messages.actThree.taskLabel}</p>
                  <h1 ref={phaseHeadingRef} tabIndex={-1} id="act-title">{campaign.act === 1 ? messages.shell.introTitle : campaign.act === 2 ? messages.actTwo.introTitle : messages.actThree.introTitle}</h1>
                  <p>{campaign.act === 1 ? messages.shell.introBody : campaign.act === 2 ? messages.actTwo.introBody : messages.actThree.introBody}</p>
                  <button type="button" className={styles.primary} onClick={() => dispatch({ type: 'COMPLETE_INTRO' })}>
                    {messages.shell.continueIntro}
                  </button>
                </section>
              ) : campaign.phase === 'investigation' ? (
                campaign.act === 2 ? (
                  <ActTwoInvestigation locale={locale} discoveredClueIds={campaign.discoveredClueIds} headingRef={phaseHeadingRef} onDiscoverClue={(clueId) => dispatch({ type: 'DISCOVER_CLUE', clueId })} onStartAllocation={() => dispatch({ type: 'START_ALLOCATION' })} />
                ) : campaign.act === 3 ? (
                  <ActThreeInvestigation locale={locale} discoveredClueIds={campaign.discoveredClueIds} headingRef={phaseHeadingRef} onDiscoverClue={(clueId) => dispatch({ type: 'DISCOVER_CLUE', clueId })} onStartAllocation={() => dispatch({ type: 'START_ALLOCATION' })} />
                ) : (
                  <section className={`${styles.boundaryPanel} ${styles.investigationPanel}`} aria-labelledby="phase-boundary-title">
                    <p className={styles.eyebrow}>{messages.shell.introTitle}</p><h1 ref={phaseHeadingRef} tabIndex={-1} id="phase-boundary-title">{messages.shell.boundaryTitle}</h1>
                    <ScenePlate locale={locale} name={messages.investigation.scene.name} description={messages.investigation.scene.description} fallbackLabel={messages.investigation.scene.fallback} hotspotsLabel={messages.investigation.sceneCluesLabel} hotspots={ACT_ONE_CLUE_IDS.map((clueId) => ({ id: clueId, label: messages.investigation.clues[clueId].title, onActivate: () => dispatch({ type: 'DISCOVER_CLUE', clueId }) }))} />
                    <InvestigationDossier locale={locale} discoveredClueIds={campaign.discoveredClueIds} onDiscoverClue={(clueId) => dispatch({ type: 'DISCOVER_CLUE', clueId })} onStartAllocation={() => dispatch({ type: 'START_ALLOCATION' })} />
                  </section>
                )
              ) : campaign.phase === 'allocation' ? (
                <section className={`${styles.boundaryPanel} ${styles.allocationPanel}`} aria-labelledby="allocation-phase-title">
                  <p className={styles.eyebrow}>{campaign.act === 1 ? messages.shell.introTitle : campaign.act === 2 ? messages.actTwo.taskLabel : messages.actThree.taskLabel}</p>
                  <h1 ref={phaseHeadingRef} tabIndex={-1} id="allocation-phase-title">{campaign.act === 1 ? messages.investigation.allocation.heading : campaign.act === 2 ? messages.actTwo.allocationHeading : messages.actThree.allocationHeading}</h1>
                  {campaign.act === 1 ? <ScenePlate locale={locale} name={messages.investigation.scene.name} description={messages.investigation.scene.description} fallbackLabel={messages.investigation.scene.fallback} /> : campaign.act === 2 ? <ScenePlate locale={locale} name={messages.actTwo.sceneName} description={messages.actTwo.sceneDescription} fallbackLabel={messages.actTwo.sceneFallback} /> : <ScenePlate locale={locale} name={messages.actThree.sceneName} description={messages.actThree.sceneDescription} fallbackLabel={messages.actThree.sceneFallback} />}
                  {campaign.act === 3 ? <ActThreeWorkbench locale={locale} allocation={campaign.draftAllocation} canLock={clueProgress.complete && selectCanStartAllocation({ ...campaign, phase: 'investigation' })} onChange={(allocation) => dispatch({ type: 'SET_DRAFT_ALLOCATION', allocation })} onLock={() => dispatch({ type: 'LOCK_INITIAL_VERDICT' })} onReturn={() => dispatch({ type: 'RETURN_TO_INVESTIGATION' })} /> : <AllocationWorkbench
                    act={campaign.act as 1 | 2}
                    locale={locale}
                    allocation={campaign.draftAllocation}
                    canLock={clueProgress.complete && selectCanStartAllocation({ ...campaign, phase: 'investigation' })}
                    guidanceCompleted={recall.firstUseGuidanceCompleted}
                    onCompleteGuidance={() => setRecall((current) => ({ ...current, firstUseGuidanceCompleted: true }))}
                    onChange={(allocation) => dispatch({ type: 'SET_DRAFT_ALLOCATION', allocation })}
                    onLock={() => dispatch({ type: 'LOCK_INITIAL_VERDICT' })}
                    onReturn={() => dispatch({ type: 'RETURN_TO_INVESTIGATION' })}
                  />}
                </section>
              ) : campaign.phase === 'intuition-rating' ? (
                <section className={`${styles.boundaryPanel} ${styles.ratingPanel}`} aria-labelledby="judgment-gate-title">
                  <JudgmentGate
                    locale={locale}
                    headingRef={phaseHeadingRef}
                    onRate={(rating) => dispatch({ type: 'SUBMIT_INTUITION_RATING', rating })}
                  />
                </section>
              ) : campaign.phase === 'debrief' && campaign.initialVerdict ? (
                <section className={`${styles.boundaryPanel} ${styles.verdictPanel}`} aria-labelledby={campaign.act === 2 ? 'act-two-debrief-title' : 'case-scroll-title'}>
                  {campaign.act === 2 ? <ActTwoDebrief locale={locale} verdict={campaign.initialVerdict} headingRef={phaseHeadingRef} onContinue={() => dispatch({ type: 'COMPLETE_DEBRIEF' })} /> : campaign.act === 3 ? <ActThreeDebrief locale={locale} verdict={campaign.initialVerdict} headingRef={phaseHeadingRef} onContinue={() => dispatch({ type: 'COMPLETE_DEBRIEF' })} /> : <CaseScrollDebrief locale={locale} verdict={campaign.initialVerdict} watched={recall.watchedRevealActs.includes(campaign.act)} onWatched={markRevealWatched} headingRef={phaseHeadingRef} onContinue={() => dispatch({ type: 'COMPLETE_DEBRIEF' })} />}
                </section>
              ) : campaign.phase === 'revision-decision' && campaign.initialVerdict ? (
                <section className={`${styles.boundaryPanel} ${styles.verdictPanel}`} aria-labelledby="revision-decision-title">
                  <div className={flowStyles.revisionPanel}>
                    <p className={flowStyles.eyebrow}>{campaign.act === 2 ? messages.actTwo.debriefHeading : messages.investigation.debrief.eyebrow}</p>
                    <h2 ref={phaseHeadingRef} tabIndex={-1} id="revision-decision-title">{campaign.act === 2 ? messages.actTwo.revisionHeading : messages.investigation.debrief.revisionHeading}</h2>
                    <p>{campaign.act === 2 ? messages.actTwo.debriefBody : messages.investigation.debrief.revisionBody}</p>
                    <div className={flowStyles.revisionActions}><button type="button" className={flowStyles.secondary} onClick={() => dispatch({ type: 'CHOOSE_REVISION', revise: false })}>{campaign.act === 2 ? messages.actTwo.acceptInitial : messages.investigation.debrief.acceptInitial}</button><button type="button" className={flowStyles.primary} onClick={() => dispatch({ type: 'CHOOSE_REVISION', revise: true })}>{campaign.act === 2 ? messages.actTwo.reviseOnce : messages.investigation.debrief.reviseOnce}</button></div>
                  </div>
                </section>
              ) : campaign.phase === 'revision'
                && campaign.initialVerdict
                && campaign.revisionAllocation
                && liveRevisionVerdict ? (
                <section className={`${styles.boundaryPanel} ${styles.verdictPanel}`} aria-labelledby={campaign.act === 2 ? 'act-two-revision-title' : 'revision-phase-title'}>
                  {campaign.act === 2 ? <ActTwoRevision locale={locale} allocation={campaign.revisionAllocation} initialAllocation={campaign.initialVerdict.allocation} headingRef={phaseHeadingRef} onChange={(allocation) => dispatch({ type: 'SET_REVISION_ALLOCATION', allocation })} onLock={() => dispatch({ type: 'LOCK_FINAL_VERDICT' })} /> : campaign.act === 3 ? <ActThreeRevision locale={locale} allocation={campaign.revisionAllocation} initialAllocation={campaign.initialVerdict.allocation} headingRef={phaseHeadingRef} onChange={(allocation) => dispatch({ type: 'SET_REVISION_ALLOCATION', allocation })} onLock={() => dispatch({ type: 'LOCK_FINAL_VERDICT' })} /> : <div className={flowStyles.revisionPanel}>
                    <p className={flowStyles.eyebrow}>{messages.investigation.debrief.eyebrow}</p>
                    <h2 ref={phaseHeadingRef} tabIndex={-1} id="revision-phase-title">{messages.investigation.debrief.revisionHeading}</h2>
                    <p>{messages.investigation.debrief.revisionBody}</p>
                    <div className={flowStyles.comparisonGrid}>
                      {([
                        [messages.investigation.debrief.initialLabel, campaign.initialVerdict.allocation],
                        [messages.investigation.debrief.draftLabel, campaign.revisionAllocation],
                      ] as readonly [string, CampaignAllocation][]).map(([label, allocation]) => (
                        <div className={flowStyles.comparisonCard} key={label}>
                          <h3>{label}</h3>
                          <ul>
                            {allocation.map(({ goodId, shares }) => (
                              <li key={goodId}>{messages.investigation.allocation.goodNames[goodId as keyof typeof messages.investigation.allocation.goodNames]}: {shares[0]} / {shares[1]}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                    <ShareGauge locale={locale} verdict={liveRevisionVerdict} />
                    <AllocationWorkbench
                      locale={locale}
                      allocation={campaign.revisionAllocation}
                      canLock
                      revisionMode
                      onChange={(allocation) => dispatch({ type: 'SET_REVISION_ALLOCATION', allocation })}
                      onLock={() => dispatch({ type: 'LOCK_FINAL_VERDICT' })}
                      onReturn={() => {}}
                    />
                  </div>}
                </section>
              ) : campaign.phase === 'final-verdict' && campaign.finalVerdict ? (
                <section className={`${styles.boundaryPanel} ${styles.verdictPanel}`} aria-labelledby="final-verdict-title">
                  <div className={flowStyles.finalPanel}><p className={flowStyles.eyebrow}>{campaign.act === 1 ? messages.investigation.debrief.eyebrow : campaign.act === 2 ? messages.actTwo.finalHeading : messages.actThree.finalHeading}</p><h2 ref={phaseHeadingRef} tabIndex={-1} id="final-verdict-title">{campaign.act === 1 ? messages.investigation.debrief.finalHeading : campaign.act === 2 ? messages.actTwo.finalHeading : messages.actThree.finalHeading}</h2><p>{campaign.act === 1 ? messages.investigation.debrief.finalBody : campaign.act === 2 ? messages.actTwo.finalBody : messages.actThree.finalBody}</p>{campaign.act === 1 ? <ShareGauge locale={locale} verdict={campaign.finalVerdict} /> : campaign.act === 2 ? <p>{messages.actTwo.harmony(campaign.finalVerdict.metrics.nsw)} · {campaign.finalVerdict.metrics.ef ? messages.actTwo.efLabel : messages.actTwo.envyRemains}</p> : <p>{messages.actThree.ef1Label}: {campaign.finalVerdict.metrics.ef1 ? messages.actThree.statusYes : messages.actThree.statusNo} · {messages.actThree.efxLabel}: {campaign.finalVerdict.metrics.efx ? messages.actThree.statusYes : messages.actThree.statusNo}</p>}<p className={flowStyles.handoff}>{campaign.act === 1 ? messages.investigation.debrief.awaitLedger : campaign.act === 2 ? messages.actTwo.challengeBody : messages.actThree.challengeBody}</p><div className={flowStyles.revisionActions}><button type="button" className={flowStyles.primary} onClick={() => dispatch({ type: 'ENTER_CHALLENGE' })}>{campaign.act === 1 ? messages.masterChallenge.heading : campaign.act === 2 ? messages.actTwo.challengeHeading : messages.actThree.challengeHeading}</button><button type="button" className={flowStyles.secondary} onClick={() => dispatch({ type: 'SKIP_CHALLENGE' })}>{campaign.act === 1 ? messages.masterChallenge.skip : campaign.act === 2 ? messages.actTwo.challengeSkip : messages.actThree.challengeSkip}</button></div></div>
                </section>
              ) : campaign.phase === 'challenge' ? (
                <section className={`${styles.boundaryPanel} ${styles.verdictPanel}`} aria-labelledby={campaign.act === 2 ? 'act-two-challenge-title' : 'master-challenge-title'}>
                  {campaign.act === 2 ? <ActTwoChallenge locale={locale} challenge={campaign.challenge} headingRef={phaseHeadingRef} onChange={(allocation) => dispatch({ type: 'SET_CHALLENGE_ALLOCATION', allocation })} onSubmit={() => dispatch({ type: 'SUBMIT_CHALLENGE' })} onSkip={() => dispatch({ type: 'SKIP_CHALLENGE' })} onLeave={() => dispatch({ type: 'LEAVE_CHALLENGE' })} /> : campaign.act === 3 ? <ActThreeChallenge locale={locale} challenge={campaign.challenge} headingRef={phaseHeadingRef} onChange={(allocation) => dispatch({ type: 'SET_CHALLENGE_ALLOCATION', allocation })} onSubmit={() => dispatch({ type: 'SUBMIT_CHALLENGE' })} onSkip={() => dispatch({ type: 'SKIP_CHALLENGE' })} onLeave={() => dispatch({ type: 'LEAVE_CHALLENGE' })} /> : <MasterChallenge locale={locale} challenge={campaign.challenge} headingRef={phaseHeadingRef} onChange={(allocation) => dispatch({ type: 'SET_CHALLENGE_ALLOCATION', allocation })} onHint={(stage) => dispatch({ type: 'VIEW_CHALLENGE_HINT', stage })} onSubmit={() => dispatch({ type: 'SUBMIT_CHALLENGE' })} onSkip={() => dispatch({ type: 'SKIP_CHALLENGE' })} onLeave={() => dispatch({ type: 'LEAVE_CHALLENGE' })} />}
                </section>
              ) : campaign.phase === 'ledger' && campaign.actRecord ? (
                <section className={`${styles.boundaryPanel} ${styles.verdictPanel}`} aria-labelledby={campaign.act === 2 ? 'act-two-ledger-title' : 'performance-ledger-title'}>
                  {campaign.act === 3 ? <ActThreeLedger locale={locale} record={campaign.actRecord as ActThreeRecord} history={campaign.recordHistory.filter((record): record is ActOneRecord | ActTwoRecord => record.act === 1 || record.act === 2)} headingRef={phaseHeadingRef} onChallenge={() => dispatch({ type: 'ENTER_CHALLENGE' })} onContinue={() => dispatch({ type: 'CONTINUE_ACT' })} onRecall={() => setArchiveOpen((value) => !value)} /> : campaign.act === 2 ? <ActTwoLedger locale={locale} record={campaign.actRecord as ActTwoRecord} history={campaign.recordHistory.filter((record): record is ActOneRecord => record.act === 1)} headingRef={phaseHeadingRef} onChallenge={() => dispatch({ type: 'ENTER_CHALLENGE' })} onContinue={() => dispatch({ type: 'CONTINUE_ACT' })} /> : <PerformanceLedger locale={locale} record={campaign.actRecord as ActOneRecord} headingRef={phaseHeadingRef} onChallenge={() => dispatch({ type: 'ENTER_CHALLENGE' })} onContinue={() => dispatch({ type: 'CONTINUE_ACT' })} onRecall={() => setArchiveOpen((value) => !value)} />}
                  {archiveOpen && (campaign.act === 1 || campaign.act === 3) ? <RecallArchive locale={locale} watchedSlots={recall.watchedCutsceneSlots} onReplay={replayArchive} /> : null}
                </section>
              ) : campaign.phase === 'act-two-transition' ? (
                <section className={styles.boundaryPanel} aria-labelledby="act-two-transition-title"><p className={styles.eyebrow}>{messages.transition.heading}</p><h1 ref={phaseHeadingRef} tabIndex={-1} id="act-two-transition-title">{messages.transition.heading}</h1><p>{messages.transition.body}</p><button type="button" className={styles.primary} onClick={() => dispatch({ type: 'BEGIN_ACT_TWO' })}>{messages.transition.continue}</button></section>
              ) : (campaign.phase === 'ending' || campaign.phase === 'completed') && campaign.ending ? (
                <section className={`${styles.boundaryPanel} ${styles.verdictPanel}`} aria-labelledby="national-ending-title">
                  <NationalEnding locale={locale} ending={campaign.ending} records={[...campaign.recordHistory, ...(campaign.actRecord ? [campaign.actRecord] : [])]} headingRef={phaseHeadingRef} completed={campaign.phase === 'completed'} onContinue={() => dispatch({ type: 'COMPLETE_ENDING' })} />
                </section>
              ) : campaign.phase === 'act-three-transition' ? (
                <section className={styles.boundaryPanel} aria-labelledby="act-three-transition-title"><p className={styles.eyebrow}>{campaign.actRecord?.act === 3 ? messages.actThree.postChallengeBoundaryTitle : messages.actThree.introTitle}</p><h1 ref={phaseHeadingRef} tabIndex={-1} id="act-three-transition-title">{campaign.actRecord?.act === 3 ? messages.actThree.postChallengeBoundaryTitle : messages.actThree.introTitle}</h1><p>{campaign.actRecord?.act === 3 ? messages.actThree.postChallengeBoundaryBody : messages.actThree.introBody}</p>{campaign.actRecord?.act === 3 ? null : <button type="button" className={styles.primary} onClick={() => dispatch({ type: 'BEGIN_ACT_THREE' })}>{messages.actThree.beginActThree}</button>}</section>
              ) : (
                <section className={styles.boundaryPanel} aria-labelledby="unavailable-phase-title">
                  <p className={styles.eyebrow}>{messages.shell.campaignTitle}</p>
                  <h1 ref={phaseHeadingRef} tabIndex={-1} id="unavailable-phase-title">{messages.shell.unavailablePhaseTitle}</h1>
                  <p>{messages.shell.unavailablePhaseBody}</p>
                </section>
              )}
            </div>
          )}
        </div>

        <AdventureDialog
          open={showRebuiltNotice}
          labelledBy={rebuiltTitleId}
          describedBy={rebuiltDescriptionId}
          initialFocusRef={acknowledgeRef}
          restoreFocusRef={startButtonRef}
          dialogClassName={styles.entryPanel}
        >
          <p className={styles.eyebrow}>{messages.shell.campaignTitle}</p>
          <h1 id={rebuiltTitleId}>{messages.shell.rebuiltTitle}</h1>
          <p id={rebuiltDescriptionId}>{messages.shell.rebuiltBody}</p>
          <button ref={acknowledgeRef} type="button" className={styles.primary} onClick={acknowledgeRebuiltCampaign}>
            {messages.shell.acknowledgeRebuild}
          </button>
        </AdventureDialog>

        <AdventureDialog
          open={confirmingEntryRestart}
          labelledBy={restartTitleId}
          describedBy={restartDescriptionId}
          initialFocusRef={cancelRestartRef}
          onEscape={() => setConfirmingEntryRestart(false)}
          dialogClassName={styles.entryPanel}
        >
          <p className={styles.eyebrow}>{messages.shell.campaignTitle}</p>
          <h1 id={restartTitleId}>{messages.shell.restartTitle}</h1>
          <p id={restartDescriptionId}>{messages.shell.restartBody}</p>
          <div className={styles.actions}>
            <button
              ref={cancelRestartRef}
              type="button"
              className={styles.secondary}
              onClick={() => setConfirmingEntryRestart(false)}
            >
              {messages.shell.cancelRestart}
            </button>
            <button type="button" className={styles.danger} onClick={restartCampaign}>
              {messages.shell.confirmRestart}
            </button>
          </div>
        </AdventureDialog>

        <PauseMenu
          open={active && pauseOpen}
          labels={{
            title: messages.pauseMenu.title,
            continue: messages.pauseMenu.continue,
            currentTask: messages.pauseMenu.currentTask,
            controls: messages.pauseMenu.controls,
            subtitles: messages.pauseMenu.subtitles,
            volume: messages.pauseMenu.volume,
            replayCurrentCutscene: messages.pauseMenu.replayCurrentCutscene,
            recallArchive: messages.pauseMenu.recallArchive,
            restart: messages.pauseMenu.restart,
            returnToMenu: messages.pauseMenu.returnToMenu,
            restartConfirmationTitle: messages.pauseMenu.restartConfirmationTitle,
            restartConfirmationBody: messages.pauseMenu.restartConfirmationBody,
            cancelRestart: messages.pauseMenu.cancelRestart,
            confirmRestart: messages.pauseMenu.confirmRestart,
          }}
          currentTask={<p>{currentTask}</p>}
          controlsHelp={<p>{messages.pauseMenu.controlsHelp}</p>}
          subtitles={settings.subtitles}
          volume={settings.volume}
          onContinue={() => setPauseOpen(false)}
          onSubtitlesChange={(subtitles) => updateSettings({ subtitles })}
          onVolumeChange={(volume) => updateSettings({ volume })}
          onReplayCurrentCutscene={campaign.phase === 'cutscene' && campaign.cutscene
            ? () => {
                setPauseOpen(false);
                setCutsceneKey((value) => value + 1);
              }
            : undefined}
          onRestart={restartCampaign}
          onReturnToMenu={() => {
            setPauseOpen(false);
            setEntryMode('returning');
            setActive(false);
          }}
          locale={locale}
          watchedCutsceneSlots={recall.watchedCutsceneSlots}
          onReplayArchive={replayArchive}
        />
      </div>
    </GameStage>
  );
}
