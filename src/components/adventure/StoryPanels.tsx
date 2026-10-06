'use client';

import type { CSSProperties } from 'react';
import type { Locale } from '../../i18n/copy';
import type { EndingKind } from '../../narrative/state-machine';
import type { NarrativeScenario, StoryBeat, VerdictReport } from '../../narrative/types';
import { localize } from '../../narrative/types';

export function StoryBriefing({
  locale,
  beat,
  current,
  total,
  onContinue,
}: {
  locale: Locale;
  beat: StoryBeat;
  current: number;
  total: number;
  onContinue: () => void;
}) {
  const zh = locale === 'zh-TW';
  const speaker = localize(beat.speaker, locale);
  return (
    <section className={`story-briefing story-briefing--${beat.tone}`} aria-labelledby="story-speaker" aria-live="polite">
      <div className="story-briefing__rail" aria-hidden="true">
        <span>{beat.tone === 'system' ? '令' : speaker.slice(0, 1)}</span>
        <i />
      </div>
      <div className="story-briefing__content">
        <header>
          <div>
            <span>{beat.tone === 'system' ? (zh ? '任務訊息' : 'Mission message') : (zh ? '場景對話' : 'Scene dialogue')}</span>
            <h2 id="story-speaker">{speaker}</h2>
          </div>
          <p>{current} / {total}</p>
        </header>
        <blockquote>{localize(beat.text, locale)}</blockquote>
        <p className="story-briefing__action"><span aria-hidden="true">◈</span>{localize(beat.action, locale)}</p>
        <footer>
          <div className="story-briefing__steps" aria-label={zh ? `劇情進度 ${current} / ${total}` : `Story progress ${current} of ${total}`}>
            {Array.from({ length: total }, (_, index) => <i className={index < current ? 'is-past' : ''} key={index} />)}
          </div>
          <button type="button" className="adventure-primary" onClick={onContinue}>
            {current === total ? (zh ? '開始查案' : 'Begin investigation') : (zh ? '繼續對話' : 'Continue dialogue')}
          </button>
        </footer>
      </div>
    </section>
  );
}

export function JudgmentGate({ locale, onRate }: { locale: Locale; onRate: (rating: number) => void }) {
  const zh = locale === 'zh-TW';
  return (
    <section className="judgment-gate" aria-labelledby="judgment-title">
      <p>{zh ? '先評價，後揭曉' : 'Rate before reveal'}</p>
      <h2 id="judgment-title">{zh ? '大人覺得，這一判當真公平嗎？' : 'Magistrate, does this ruling truly feel fair?'}</h2>
      <div role="group" aria-label={zh ? '公平程度一到五分' : 'Fairness rating from one to five'}>
        {[1, 2, 3, 4, 5].map((rating) => (
          <button type="button" key={rating} onClick={() => onRate(rating)} aria-label={`${rating} / 5`}>
            <span aria-hidden="true">{rating}</span>
            <small>{rating === 1 ? (zh ? '極不公平' : 'Very unfair') : rating === 5 ? (zh ? '非常公平' : 'Very fair') : ''}</small>
          </button>
        ))}
      </div>
      <p>{zh ? '選定前，EF1、EFX 與 NSW 仍然封存在卷宗裡。' : 'EF1, EFX, and NSW remain sealed until you commit your intuition.'}</p>
    </section>
  );
}

export function VerdictReveal({
  locale,
  scenario,
  report,
  rating,
  mastered,
  onChallenge,
  onContinue,
}: {
  locale: Locale;
  scenario: NarrativeScenario;
  report: VerdictReport;
  rating: number;
  mastered: boolean;
  onChallenge: () => void;
  onContinue: () => void;
}) {
  const zh = locale === 'zh-TW';
  const efxWitness = report.efxFailure;
  const ef1Witness = report.ef1Failure;
  return (
    <section className={report.zeroUtility ? 'verdict-scroll is-crisis' : 'verdict-scroll'} aria-labelledby="verdict-title">
      <header>
        <div><p>{zh ? '斷案卷宗' : 'Case scroll debrief'}</p><h2 id="verdict-title">{localize(scenario.title, locale)}</h2></div>
        <span>{zh ? `直覺評價 ${rating}/5` : `Intuition ${rating}/5`}</span>
      </header>

      <div className="verdict-utilities">
        {scenario.agents.map((agent, index) => (
          <article key={agent.id} style={{ '--agent-color': agent.color } as CSSProperties}>
            <span>{localize(agent.name, locale)}</span><strong>{report.utilities[index]}</strong>
          </article>
        ))}
      </div>

      <div className="verdict-metrics">
        {scenario.id !== 'palace' && <Metric label="EF" pass={report.ef} detail={zh ? '完全無嫉妒' : 'Envy-free'} />}
        {scenario.id !== 'palace' && <Metric label="EF1" pass={report.ef1} detail={zh ? '減一物無嫉妒' : 'Up to one item'} />}
        {scenario.id !== 'palace' && <Metric label="EFX" pass={report.efx} detail={zh ? '減任一正價值物皆無嫉妒' : 'Up to any valued item'} />}
        <div className={report.zeroUtility ? 'verdict-metric is-fail' : 'verdict-metric'}>
          <span>NSW</span><strong>{report.nsw}</strong><small>{report.utilities.join(' × ')}</small>
        </div>
      </div>

      <div className="verdict-explanation">
        {report.zeroUtility ? (
          <p><strong>{zh ? '零乘積之劫：' : 'The zero-product peril: '}</strong>{zh ? '至少一方效用為零，因此其他人拿得再多，納許社會福利仍會瞬間歸零。' : 'At least one faction has zero utility, so the Nash product collapses regardless of everyone else’s gains.'}</p>
        ) : report.ef ? (
          <p><strong>{zh ? '卷宗評語：' : 'Clerk’s note: '}</strong>{zh ? '各方從自己的眼光衡量，都不認為別人的組合更好。這是一個完全無嫉妒的裁決。' : 'From every claimant’s own perspective, no other bundle is better. The ruling is fully envy-free.'}</p>
        ) : efxWitness ? (
          <p><strong>{zh ? 'EFX 見證：' : 'EFX witness: '}</strong>{zh
            ? `${localize(scenario.agents[efxWitness.i].name, locale)} 看著 ${localize(scenario.agents[efxWitness.j].name, locale)} 的所得；即使拿走「${localize(scenario.items[efxWitness.item].shortName, locale)}」，嫉妒仍未消失。`
            : `${localize(scenario.agents[efxWitness.i].name, locale)} still envies ${localize(scenario.agents[efxWitness.j].name, locale)} even after ${localize(scenario.items[efxWitness.item].shortName, locale)} is removed.`}</p>
        ) : ef1Witness ? (
          <p><strong>{zh ? 'EF1 見證：' : 'EF1 witness: '}</strong>{zh
            ? `${localize(scenario.agents[ef1Witness.i].name, locale)} 對 ${localize(scenario.agents[ef1Witness.j].name, locale)} 的組合心有不平，而且找不到只拿走一件便能止嫉的方法。`
            : `${localize(scenario.agents[ef1Witness.i].name, locale)} envies ${localize(scenario.agents[ef1Witness.j].name, locale)}, and removing one item cannot cure it.`}</p>
        ) : (
          <p><strong>{zh ? '卷宗評語：' : 'Clerk’s note: '}</strong>{zh ? '此判決通過本幕的核心公平檢驗，但仍可在巧解挑戰中尋找更穩定的分法。' : 'This ruling passes the act’s central test, but the master challenge may reveal a stronger balance.'}</p>
        )}
        {mastered && <p className="verdict-mastered">{zh ? '巧解完成：你找到了本案預設的最高階平衡。' : 'Master challenge complete: you found the scenario’s intended frontier solution.'}</p>}
      </div>

      <footer>
        <button type="button" onClick={onChallenge}>{zh ? '進入巧解挑戰' : 'Open master challenge'}</button>
        <button type="button" className="adventure-primary" onClick={onContinue}>{scenario.act === 3 ? (zh ? '展開史書結局' : 'Open the historical ending') : (zh ? '前往下一幕' : 'Continue to next act')}</button>
      </footer>
    </section>
  );
}

function Metric({ label, pass, detail }: { label: string; pass: boolean; detail: string }) {
  return <div className={pass ? 'verdict-metric' : 'verdict-metric is-fail'}><span>{label}</span><strong>{pass ? '✓' : '×'}</strong><small>{detail}</small></div>;
}

const ENDINGS: Record<EndingKind, { title: { en: string; 'zh-TW': string }; text: { en: string; 'zh-TW': string } }> = {
  'prime-minister': {
    title: { 'zh-TW': '萬民太和 · 盛世良相', en: 'Benevolent Prime Minister' },
    text: { 'zh-TW': '你不輕易放棄任何一方。算籌一動，四海皆安；後人尊你為「神算賢相」。', en: 'You refused to abandon any side. Your calculations steadied the realm, and later generations remembered a minister of measured harmony.' },
  },
  legalist: {
    title: { 'zh-TW': '鐵面無私 · 孤高法家', en: 'The Strict Legalist' },
    text: { 'zh-TW': '你眼裡容不得半點偏差。世人敬你的公正，也畏懼你不肯鬆動的尺度。', en: 'You tolerated no imbalance. The realm respected your justice and feared the measure that never bent.' },
  },
  autocrat: {
    title: { 'zh-TW': '權衡偏重 · 梟雄帝業', en: 'The Cunning Autocrat' },
    text: { 'zh-TW': '你把籌碼壓在強者身上，以弱者的損失換取秩序。功業震天下，民怨也從此埋下。', en: 'You wagered on the powerful and purchased order with weaker lives. Your achievements shook the realm; so did the grievances beneath them.' },
  },
  scholar: {
    title: { 'zh-TW': '洞見乾坤 · 算學宗師', en: 'The Reclusive Scholar' },
    text: { 'zh-TW': '你看見不可分割物品的邊界，完成《定分衡石論》，千年後仍有人沿著你的算路尋找公平。', en: 'You recognized the boundary of indivisible goods and wrote a treatise that guided the search for fairness a thousand years later.' },
  },
};

export function Epilogue({ locale, ending, onRestart }: { locale: Locale; ending: EndingKind; onRestart: () => void }) {
  const copy = ENDINGS[ending];
  return (
    <section className="adventure-epilogue">
      <p>{locale === 'zh-TW' ? '《明史 · 提刑良吏傳》' : 'History of Ming · Exemplary Magistrates'}</p>
      <h1>{copy.title[locale]}</h1>
      <blockquote>{copy.text[locale]}</blockquote>
      <button type="button" className="adventure-primary" onClick={onRestart}>{locale === 'zh-TW' ? '重新執秤' : 'Take up the scales again'}</button>
    </section>
  );
}
