'use client';

import { useEffect, useMemo, useReducer, useState } from 'react';
import type { Locale } from '../../i18n/copy';
import { NARRATIVE_SCENARIOS } from '../../narrative/scenarios';
import {
  allocationComplete,
  canStartAllocation,
  initialNarrativeState,
  narrativeReducer,
  resolveEnding,
} from '../../narrative/state-machine';
import type { NarrativeState } from '../../narrative/types';
import { localize } from '../../narrative/types';
import { AllocationWorkbench } from './AllocationWorkbench';
import { InvestigationDossier } from './InvestigationDossier';
import { SceneViewport } from './SceneViewport';
import { Epilogue, JudgmentGate, StoryBriefing, VerdictReveal } from './StoryPanels';
import './adventure.css';

const STORAGE_KEY = 'settled-shares-campaign-v1';

function isStoredState(value: unknown): value is NarrativeState {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<NarrativeState>;
  return typeof candidate.actIndex === 'number'
    && typeof candidate.phase === 'string'
    && Array.isArray(candidate.owners)
    && Array.isArray(candidate.records)
    && Array.isArray(candidate.discoveredClueIds);
}

export function AdventureShell({ locale }: { locale: Locale }) {
  const [state, dispatch] = useReducer(narrativeReducer, undefined, initialNarrativeState);
  const [hydrated, setHydrated] = useState(false);
  const scenario = NARRATIVE_SCENARIOS[state.actIndex];
  const zh = locale === 'zh-TW';
  const activeClue = scenario.clues.find((clue) => clue.id === state.activeClueId) ?? null;
  const progress = scenario.requiredClueIds.filter((clueId) => state.discoveredClueIds.includes(clueId)).length;

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as unknown;
        if (isStoredState(parsed)) dispatch({
          type: 'RESTORE',
          state: {
            ...parsed,
            storyIndex: typeof parsed.storyIndex === 'number' ? parsed.storyIndex : 0,
            committedReport: parsed.committedReport ?? parsed.report ?? null,
          },
        });
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [hydrated, state]);

  function handleHotspot(targetId: string) {
    if (state.phase === 'investigation') {
      const clue = scenario.clues.find((entry) => entry.targetId === targetId);
      if (clue) dispatch({ type: 'INSPECT', clueId: clue.id });
      return;
    }
    if (state.phase === 'allocation' || state.phase === 'challenge') {
      const itemIndex = scenario.items.findIndex((item) => item.id === targetId);
      if (itemIndex >= 0) dispatch({ type: 'SELECT_ITEM', itemIndex });
    }
  }

  const reaction = useMemo(() => {
    if (state.phase !== 'allocation' && state.phase !== 'challenge') return null;
    if (scenario.id === 'guild' && state.owners[0] === 0 && state.owners[2] === 0) {
      return zh ? '顧雲錦：好處你要，名聲你也要，你這是要把我逼上絕路嗎？' : 'Gu Yunjin: You take the profit and the name—must you leave me nothing?';
    }
    if (scenario.id === 'guild' && state.owners[1] === 0) {
      return zh ? '沈景和：大人，這卷字到了我手裡，除了墊桌腳還能做什麼？' : 'Shen Jinghe: Magistrate, what could I do with this manual except prop up a table?';
    }
    if (scenario.id === 'yamen' && state.owners[0] === 0 && state.owners[1] === 0) {
      return zh ? '裴仲文的目光死死盯著金匾，公堂裡的空氣忽然緊了。' : 'Pei Zhongwen fixes his eyes on the plaque. The hall tightens around him.';
    }
    if (scenario.id === 'palace' && allocationComplete(state) && state.owners.every((owner) => owner !== 2) && state.silver[2] === 0) {
      return zh ? '馮保慢慢跪下。宮燈的火苗同時縮成一線。' : 'Feng Bao slowly kneels. Every palace flame narrows to a thread.';
    }
    return null;
  }, [scenario.id, state, zh]);

  const zeroUtility = Boolean(state.report?.zeroUtility);
  const storyBeat = scenario.storyBeats[state.storyIndex] ?? scenario.storyBeats[0];
  const focusTargetId = state.phase === 'briefing'
    ? storyBeat.focusTargetId ?? null
    : state.phase === 'investigation'
      ? activeClue?.targetId ?? null
      : (state.phase === 'allocation' || state.phase === 'challenge') && state.selectedItem !== null
        ? scenario.items[state.selectedItem]?.id ?? null
        : null;
  const sceneLabel = state.phase === 'prologue'
    ? (zh ? '序幕 · 執秤之人' : 'Prologue · Keeper of the Scales')
    : `${localize(scenario.era, locale)} · ${localize(scenario.title, locale)}`;

  return (
    <main id="main-content" className="adventure-shell" data-phase={state.phase}>
      <SceneViewport
        scenario={scenario}
        phase={state.phase}
        owners={state.owners}
        silver={state.silver}
        zeroUtility={zeroUtility}
        mastered={state.challengeMastered}
        focusTargetId={focusTargetId}
        onHotspot={handleHotspot}
      />

      <header className="adventure-hud">
        <a className="adventure-brand" href={`/${locale}/adventure`}><span aria-hidden="true">衡</span><strong>定分止爭錄<small>The Art of Settled Shares</small></strong></a>
        <div className="adventure-hud__chapter">
          <span>{state.phase === 'prologue' ? (zh ? '序幕' : 'Prologue') : `${zh ? '第' : 'Act '}${scenario.act}${zh ? '幕' : ''}`}</span>
          <strong>{sceneLabel}</strong>
        </div>
        <a className="adventure-language" href={`/${locale === 'zh-TW' ? 'en' : 'zh-TW'}/adventure`}>{locale === 'zh-TW' ? 'EN' : '繁中'}</a>
      </header>

      {['investigation', 'allocation', 'judgment', 'reveal', 'challenge'].includes(state.phase) && (
        <InvestigationDossier locale={locale} scenario={scenario} discoveredClueIds={state.discoveredClueIds} />
      )}

      {state.phase === 'prologue' && (
        <section className="adventure-prologue">
          <p>{zh ? '序幕 · 執秤之人' : 'Prologue · Keeper of the Scales'}</p>
          <h1>{zh ? '天下之亂，不是東西太少，而是歸屬未定。' : 'Disorder begins not with scarcity, but with shares left unsettled.'}</h1>
          <blockquote>{zh
            ? '田宅不能切開，兵權不能平分。你是朝廷新任的算學提刑官；今日，要聽清每個人的欲望，算明每一筆得失。'
            : 'Land cannot always be cut. Command cannot be divided. You are the new Imperial Arbitrator: hear each desire, then account for every loss.'}</blockquote>
          <button type="button" className="adventure-primary" disabled={!hydrated} onClick={() => dispatch({ type: 'BEGIN' })}>
            {!hydrated ? (zh ? '展開案卷中…' : 'Opening the case scroll…') : (zh ? '提起天平' : 'Take up the scales')}
          </button>
        </section>
      )}

      {state.phase === 'briefing' && (
        <StoryBriefing
          key={`${scenario.id}-${state.storyIndex}`}
          locale={locale}
          beat={storyBeat}
          current={state.storyIndex + 1}
          total={scenario.storyBeats.length}
          onContinue={() => dispatch({ type: 'ADVANCE_STORY' })}
        />
      )}

      {state.phase === 'investigation' && (
        <section className={canStartAllocation(state) ? 'dialogue-panel is-ready' : 'dialogue-panel'} aria-labelledby="dialogue-speaker">
          <div className="dialogue-panel__progress"><span>{zh ? '搜證' : 'Investigation'}</span><strong>{progress}/{scenario.requiredClueIds.length}</strong></div>
          <div className="dialogue-panel__copy">
            <p id="dialogue-speaker">{activeClue ? localize(activeClue.speaker, locale) : (zh ? '旁白' : 'Narrator')}</p>
            <blockquote>{activeClue ? localize(activeClue.text, locale) : localize(scenario.opening, locale)}</blockquote>
          </div>
          {canStartAllocation(state) ? (
            <div className="mission-brief" role="status">
              <p>{zh ? '系統 · 分配任務已開啟' : 'System · Allocation unlocked'}</p>
              <strong>{localize(scenario.allocationPrompt, locale)}</strong>
              <span>{zh ? `下一步：把 ${scenario.items.length} 件物品全部分給 ${scenario.agents.length} 位當事人。` : `Next: assign all ${scenario.items.length} items among ${scenario.agents.length} claimants.`}</span>
            </div>
          ) : (
            <div className="dialogue-panel__targets" aria-label={zh ? '可調查目標' : 'Investigation targets'}>
              {scenario.clues.map((clue) => (
                <button
                  type="button"
                  className={state.discoveredClueIds.includes(clue.id) ? 'is-discovered' : ''}
                  onClick={() => dispatch({ type: 'INSPECT', clueId: clue.id })}
                  key={clue.id}
                >
                  <span>{clue.kind === 'agent' ? (zh ? '詢問' : 'Ask') : (zh ? '查看' : 'Inspect')}</span>
                  <strong>{clue.kind === 'agent'
                    ? localize(scenario.agents.find((agent) => agent.id === clue.targetId)?.name ?? clue.speaker, locale)
                    : localize(scenario.items.find((item) => item.id === clue.targetId)?.shortName ?? clue.speaker, locale)}</strong>
                </button>
              ))}
            </div>
          )}
          <button type="button" className="adventure-primary" disabled={!canStartAllocation(state)} onClick={() => dispatch({ type: 'START_ALLOCATION' })}>
            {canStartAllocation(state) ? (zh ? '開始分配' : 'Begin allocation') : (zh ? '先問清所有當事人' : 'Interview every claimant first')}
          </button>
        </section>
      )}

      {(state.phase === 'allocation' || state.phase === 'challenge') && (
        <div className="adventure-workbench-wrap">
          {reaction && <p className="adventure-reaction" aria-live="polite">{reaction}</p>}
          <AllocationWorkbench
            locale={locale}
            scenario={scenario}
            owners={state.owners}
            selectedItem={state.selectedItem}
            silver={state.silver}
            report={state.report}
            challenge={state.phase === 'challenge'}
            onSelect={(itemIndex) => dispatch({ type: 'SELECT_ITEM', itemIndex })}
            onAssign={(itemIndex, owner) => dispatch({ type: 'ASSIGN', itemIndex, owner })}
            onSilver={(amounts) => dispatch({ type: 'SET_SILVER', amounts })}
            onCommit={() => dispatch({ type: state.phase === 'challenge' ? 'CHECK_CHALLENGE' : 'COMMIT' })}
          />
          {state.phase === 'challenge' && (
            <button type="button" className="challenge-return" onClick={() => dispatch({ type: 'LEAVE_CHALLENGE' })}>{zh ? '返回斷案卷宗' : 'Return to the case scroll'}</button>
          )}
        </div>
      )}

      {state.phase === 'judgment' && <JudgmentGate locale={locale} onRate={(rating) => dispatch({ type: 'RATE', rating })} />}

      {state.phase === 'reveal' && state.report && state.rating && (
        <VerdictReveal
          locale={locale}
          scenario={scenario}
          report={state.report}
          rating={state.rating}
          mastered={state.challengeMastered}
          onChallenge={() => dispatch({ type: 'ENTER_CHALLENGE' })}
          onContinue={() => dispatch({ type: 'CONTINUE' })}
        />
      )}

      {state.phase === 'transition' && (
        <section className="act-transition">
          <p>{zh ? `第 ${scenario.act} 幕落` : `Act ${scenario.act} complete`}</p>
          <h2>{zh ? '一案既定，更大的秤正在前方等你。' : 'One dispute is settled. A greater scale waits ahead.'}</h2>
          <button type="button" className="adventure-primary" onClick={() => dispatch({ type: 'NEXT_ACT' })}>{zh ? '啟程' : 'Continue'}</button>
        </section>
      )}

      {state.phase === 'epilogue' && <Epilogue locale={locale} ending={resolveEnding(state.records)} onRestart={() => {
        localStorage.removeItem(STORAGE_KEY);
        dispatch({ type: 'RESTART' });
      }} />}
    </main>
  );
}
