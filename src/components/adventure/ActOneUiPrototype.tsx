'use client';

// UI question: compare three lower-complexity Act I flows via ?variant= on the existing adventure route.

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Locale } from '../../i18n/copy';
import { getAdventureCopy } from '../../i18n/adventure';
import { ACT_ONE_DEFINITION, type ActOneClueId, type ActOneGoodId } from '../../narrative/campaign-definition';
import { getCutsceneStill, getPortraitAsset, getScenePlateAsset, type CharacterId } from '../../narrative/media-manifest';
import styles from './ActOneUiPrototype.module.css';

export type ActOnePrototypeVariant = 'focus' | 'guided' | 'dossier';

const VARIANTS: readonly ActOnePrototypeVariant[] = ['focus', 'guided', 'dossier'];

const EVIDENCE: readonly { readonly id: ActOneClueId; readonly characterId?: CharacterId }[] = [
  { id: 'clue-chen-shouye-valuations', characterId: 'chen-shouye' },
  { id: 'clue-chen-congzheng-valuations', characterId: 'chen-congzheng' },
  { id: 'clue-chen-elder-equal-split', characterId: 'chen-elder' },
  { id: 'clue-yiwu-original-ruling' },
];

const VARIANT_LABELS: Readonly<Record<Locale, Readonly<Record<ActOnePrototypeVariant, string>>>> = {
  en: {
    focus: 'One thing at a time',
    guided: 'Clear next step',
    dossier: 'Open case file',
  },
  'zh-TW': {
    focus: '一屏一件事',
    guided: '只看下一步',
    dossier: '打開案卷',
  },
};

const PROTOTYPE_COPY: Readonly<Record<Locale, {
  readonly badge: string;
  readonly firstAct: string;
  readonly start: string;
  readonly testimony: (current: number, total: number) => string;
  readonly nextTestimony: string;
  readonly beginAllocation: string;
  readonly allocationTitle: string;
  readonly allocationBody: string;
  readonly elderShare: (value: number, younger: number) => string;
  readonly lockInitial: string;
  readonly lockRevision: string;
  readonly initialResult: string;
  readonly revisionResult: string;
  readonly elderUtility: (name: string, value: number) => string;
  readonly youngerUtility: (name: string, value: number) => string;
  readonly bothDue: string;
  readonly oneShort: string;
  readonly accept: string;
  readonly revise: string;
  readonly finish: string;
  readonly endingTitle: string;
  readonly restart: string;
  readonly stepEvidence: string;
  readonly stepAllocation: string;
  readonly stepVerdict: string;
  readonly previousVariant: string;
  readonly nextVariant: string;
  readonly switcherLabel: (position: number, total: number, name: string) => string;
  readonly stepLabels: readonly [string, string, string];
}>> = {
  en: {
    badge: 'Act I · interaction prototype',
    firstAct: 'The brothers’ case',
    start: 'Hear the case',
    testimony: (current, total) => `Testimony ${current} of ${total}`,
    nextTestimony: 'Next testimony',
    beginAllocation: 'Divide the estate',
    allocationTitle: 'Make your first ruling',
    allocationBody: 'Give the elder brother a share of each good. His brother receives the rest. The measures stay hidden until you submit.',
    elderShare: (value, younger) => `Elder ${value}/10 · Younger ${younger}/10`,
    lockInitial: 'Reveal the ruling',
    lockRevision: 'Finish this ruling',
    initialResult: 'Your first ruling is now fixed. Here is what each brother received by his own measure.',
    revisionResult: 'Your revised ruling is ready to enter the record.',
    elderUtility: (name, value) => `${name}: ${value} of 100`,
    youngerUtility: (name, value) => `${name}: ${value} of 100`,
    bothDue: 'Both brothers receive their due share.',
    oneShort: 'At least one brother falls below his due share.',
    accept: 'Keep this ruling',
    revise: 'Revise once',
    finish: 'Close the case',
    endingTitle: 'The brothers share a table again.',
    restart: 'Try this flow again',
    stepEvidence: 'Hear the brothers',
    stepAllocation: 'Divide the estate',
    stepVerdict: 'See the result',
    previousVariant: 'Previous layout',
    nextVariant: 'Next layout',
    switcherLabel: (position, total, name) => `Prototype ${position}/${total} · ${name}`,
    stepLabels: ['Testimony', 'Division', 'Ruling'],
  },
  'zh-TW': {
    badge: '第一幕 · 操作試作',
    firstAct: '兄弟析產案',
    start: '開始查案',
    testimony: (current, total) => `證詞 ${current}/${total}`,
    nextTestimony: '聽下一段證詞',
    beginAllocation: '開始分家產',
    allocationTitle: '請下初判',
    allocationBody: '設定哥哥分得各項家產的成數，弟弟取得餘額。提交以前，不顯示公平指標。',
    elderShare: (value, younger) => `哥哥 ${value} 成 · 弟弟 ${younger} 成`,
    lockInitial: '揭曉判詞',
    lockRevision: '完成這次改判',
    initialResult: '初判已固定。現在看看兄弟各自按自己的估值，實際分得多少。',
    revisionResult: '改判已完成，可以記入考成簿。',
    elderUtility: (name, value) => `${name}：${value}/100 分`,
    youngerUtility: (name, value) => `${name}：${value}/100 分`,
    bothDue: '兄弟兩人都得其分。',
    oneShort: '至少有一人未得其分。',
    accept: '接受這份判決',
    revise: '改判一次',
    finish: '結束本案',
    endingTitle: '兄弟又在一張桌上吃飯了。',
    restart: '再試一次',
    stepEvidence: '聽取證詞',
    stepAllocation: '分配家產',
    stepVerdict: '查看結果',
    previousVariant: '上一種版面',
    nextVariant: '下一種版面',
    switcherLabel: (position, total, name) => `試作版 ${position}/${total} · ${name}`,
    stepLabels: ['證詞', '分家', '判詞'],
  },
};

type PrototypePhase = 'welcome' | 'evidence' | 'allocation' | 'verdict' | 'ending';
type Shares = [number, number, number];

type PrototypeModel = {
  readonly locale: Locale;
  readonly phase: PrototypePhase;
  readonly stageLabel: string;
  readonly title: string;
  readonly body: string;
  readonly imageSrc: string;
  readonly imageAlt: string;
  readonly speaker?: string;
  readonly evidencePosition?: string;
  readonly isRevision: boolean;
  readonly shares: Shares;
  readonly goodNames: Readonly<Record<ActOneGoodId, string>>;
  readonly elderName: string;
  readonly youngerName: string;
  readonly elderUtility: number;
  readonly youngerUtility: number;
  readonly resultSummary: string;
  readonly primaryLabel: string;
  readonly onPrimary: () => void;
  readonly secondaryLabel?: string;
  readonly onSecondary?: () => void;
  readonly onShareChange: (index: number, value: number) => void;
};

function PrototypeStageContent({ model }: { readonly model: PrototypeModel }) {
  const copy = PROTOTYPE_COPY[model.locale];

  return (
    <>
      <p className={styles.stageLabel}>{model.stageLabel}</p>
      {model.evidencePosition ? <p className={styles.evidencePosition}>{model.evidencePosition}</p> : null}
      {model.speaker ? <p className={styles.speaker}>{model.speaker}</p> : null}
      <h1>{model.title}</h1>
      <p className={styles.body}>{model.body}</p>

      {model.phase === 'allocation' ? (
        <div className={styles.goods}>
          {ACT_ONE_DEFINITION.goods.map((good, index) => (
            <label className={styles.good} key={good.id}>
              <span className={styles.goodHeader}>
                <strong>{model.goodNames[good.id]}</strong>
                <output>{copy.elderShare(model.shares[index], 10 - model.shares[index])}</output>
              </span>
              <input
                type="range"
                min={0}
                max={10}
                step={1}
                value={model.shares[index]}
                onChange={(event) => model.onShareChange(index, Number(event.target.value))}
                aria-label={model.goodNames[good.id]}
              />
            </label>
          ))}
        </div>
      ) : null}

      {model.phase === 'verdict' ? (
        <section className={styles.result} aria-label={model.resultSummary}>
          <p>{copy.elderUtility(model.elderName, model.elderUtility)}</p>
          <p>{copy.youngerUtility(model.youngerName, model.youngerUtility)}</p>
          <strong>{model.resultSummary}</strong>
        </section>
      ) : null}

      <div className={styles.actions}>
        <button type="button" className={styles.primary} onClick={model.onPrimary}>
          {model.primaryLabel}
        </button>
        {model.secondaryLabel && model.onSecondary ? (
          <button type="button" className={styles.secondary} onClick={model.onSecondary}>
            {model.secondaryLabel}
          </button>
        ) : null}
      </div>
    </>
  );
}

function FocusLayout({ model }: { readonly model: PrototypeModel }) {
  return (
    <main className={styles.focusView}>
      <figure className={styles.focusImage}>
        <img src={model.imageSrc} alt={model.imageAlt} />
        <figcaption>{model.imageAlt}</figcaption>
      </figure>
      <section className={styles.focusPanel}>
        <PrototypeStageContent model={model} />
      </section>
    </main>
  );
}

function GuidedLayout({ model }: { readonly model: PrototypeModel }) {
  const copy = PROTOTYPE_COPY[model.locale];
  const activeStep = model.phase === 'allocation' ? 1 : model.phase === 'verdict' || model.phase === 'ending' ? 2 : 0;

  return (
    <main className={styles.guidedView}>
      <header className={styles.guidedHeader}>
        <p>{copy.badge}</p>
        <ol aria-label={model.locale === 'zh-TW' ? '案件進度' : 'Case progress'}>
          {copy.stepLabels.map((step, index) => (
            <li key={step} data-current={index === activeStep ? 'true' : undefined} data-complete={index < activeStep ? 'true' : undefined}>
              <span>{index + 1}</span>{step}
            </li>
          ))}
        </ol>
      </header>
      <div className={styles.guidedBody}>
        <figure className={styles.guidedImage}>
          <img src={model.imageSrc} alt={model.imageAlt} />
          <figcaption>{model.imageAlt}</figcaption>
        </figure>
        <section className={styles.guidedPanel}>
          <PrototypeStageContent model={model} />
        </section>
      </div>
    </main>
  );
}

function DossierLayout({ model }: { readonly model: PrototypeModel }) {
  return (
    <main className={styles.dossierView}>
      <aside className={styles.dossierImage}>
        <img src={model.imageSrc} alt={model.imageAlt} />
        <p>{model.imageAlt}</p>
      </aside>
      <article className={styles.dossierPage}>
        <div className={styles.dossierRule} aria-hidden="true" />
        <PrototypeStageContent model={model} />
      </article>
    </main>
  );
}

function PrototypeSwitcher({ locale, variant }: { readonly locale: Locale; readonly variant: ActOnePrototypeVariant }) {
  const router = useRouter();
  const labels = VARIANT_LABELS[locale];
  const copy = PROTOTYPE_COPY[locale];
  const activeIndex = VARIANTS.indexOf(variant);

  const choose = useCallback((index: number) => {
    const next = VARIANTS[(index + VARIANTS.length) % VARIANTS.length];
    router.replace(`/${locale}/adventure?variant=${next}`, { scroll: false });
  }, [locale, router]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const target = event.target;
      if (target instanceof HTMLElement && target.matches('input, textarea, select, [contenteditable="true"]')) return;
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      event.preventDefault();
      choose(activeIndex + (event.key === 'ArrowRight' ? 1 : -1));
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex, choose]);

  return (
    <nav className={styles.prototypeSwitcher} aria-label={locale === 'zh-TW' ? '試作版面切換' : 'Prototype layout switcher'}>
      <button type="button" aria-label={copy.previousVariant} onClick={() => choose(activeIndex - 1)}>←</button>
      <span>{copy.switcherLabel(activeIndex + 1, VARIANTS.length, labels[variant])}</span>
      <button type="button" aria-label={copy.nextVariant} onClick={() => choose(activeIndex + 1)}>→</button>
    </nav>
  );
}

export function ActOneUiPrototype({ locale, variant }: { readonly locale: Locale; readonly variant: ActOnePrototypeVariant }) {
  const messages = getAdventureCopy(locale);
  const localCopy = PROTOTYPE_COPY[locale];
  const [phase, setPhase] = useState<PrototypePhase>('welcome');
  const [evidenceIndex, setEvidenceIndex] = useState(0);
  const [shares, setShares] = useState<Shares>([5, 5, 5]);
  const [isRevision, setIsRevision] = useState(false);
  const evidence = EVIDENCE[evidenceIndex];
  const clue = messages.investigation.clues[evidence.id];
  const metrics = ACT_ONE_DEFINITION.goods.reduce<[number, number]>((totals, good, index) => {
    totals[0] += good.values[0] * shares[index] / 10;
    totals[1] += good.values[1] * (10 - shares[index]) / 10;
    return totals;
  }, [0, 0]);
  const passesProportionality = metrics.every((utility) => utility >= 50);

  function updateShare(index: number, value: number) {
    setShares((current) => current.map((share, currentIndex) => currentIndex === index ? value : share) as Shares);
  }

  function advanceEvidence() {
    if (evidenceIndex < EVIDENCE.length - 1) setEvidenceIndex((current) => current + 1);
    else setPhase('allocation');
  }

  function submitAllocation() {
    setPhase('verdict');
  }

  function keepRuling() {
    setPhase('ending');
  }

  function reviseOnce() {
    setIsRevision(true);
    setPhase('allocation');
  }

  function resetPrototype() {
    setPhase('welcome');
    setEvidenceIndex(0);
    setShares([5, 5, 5]);
    setIsRevision(false);
  }

  const stageLabel = phase === 'welcome'
    ? localCopy.firstAct
    : phase === 'evidence'
      ? localCopy.stepEvidence
      : phase === 'allocation'
        ? localCopy.stepAllocation
        : phase === 'verdict'
          ? localCopy.stepVerdict
          : localCopy.firstAct;

  const imageSrc = phase === 'welcome'
    ? getCutsceneStill('cs-01', 0)?.imageSrc ?? '/adventure/animatics/cs-01/cs-01-s1.jpg'
    : phase === 'evidence'
      ? evidence.characterId
        ? getPortraitAsset(evidence.characterId, 'calm')?.src ?? getScenePlateAsset(1).src
        : getScenePlateAsset(1).src
      : phase === 'allocation'
        ? getScenePlateAsset(1).src
        : phase === 'verdict'
          ? getCutsceneStill('cs-02', 0)?.imageSrc ?? '/adventure/animatics/cs-02/cs-02-s1.jpg'
          : getCutsceneStill('cs-03', 0)?.imageSrc ?? '/adventure/animatics/cs-03/cs-03-s1.jpg';

  const imageAlt = phase === 'welcome'
    ? messages.transcript.cs01Scene
    : phase === 'evidence'
      ? clue.title
      : phase === 'allocation'
        ? messages.investigation.scene.description
        : phase === 'verdict'
          ? messages.transcript.cs02Scene
          : messages.transcript.cs03Letter;

  const title = phase === 'welcome'
    ? messages.shell.introTitle
    : phase === 'evidence'
      ? clue.title
      : phase === 'allocation'
        ? localCopy.allocationTitle
        : phase === 'verdict'
          ? messages.investigation.debrief.heading
          : localCopy.endingTitle;

  const body = phase === 'welcome'
    ? messages.shell.introBody
    : phase === 'evidence'
      ? clue.text
      : phase === 'allocation'
        ? localCopy.allocationBody
        : phase === 'verdict'
          ? isRevision ? localCopy.revisionResult : localCopy.initialResult
          : messages.transcript.cs03Letter;

  const primaryLabel = phase === 'welcome'
    ? localCopy.start
    : phase === 'evidence'
      ? evidenceIndex < EVIDENCE.length - 1 ? localCopy.nextTestimony : localCopy.beginAllocation
      : phase === 'allocation'
        ? isRevision ? localCopy.lockRevision : localCopy.lockInitial
        : phase === 'verdict'
          ? isRevision ? localCopy.finish : localCopy.accept
          : localCopy.restart;

  const onPrimary = phase === 'welcome'
    ? () => setPhase('evidence')
    : phase === 'evidence'
      ? advanceEvidence
      : phase === 'allocation'
        ? submitAllocation
        : phase === 'verdict'
          ? keepRuling
          : resetPrototype;

  const model: PrototypeModel = {
    locale,
    phase,
    stageLabel,
    title,
    body,
    imageSrc,
    imageAlt,
    ...(phase === 'evidence' ? {
      speaker: clue.speaker,
      evidencePosition: localCopy.testimony(evidenceIndex + 1, EVIDENCE.length),
    } : {}),
    isRevision,
    shares,
    goodNames: messages.investigation.allocation.goodNames,
    elderName: messages.investigation.allocation.partyNames['chen-shouye'].name,
    youngerName: messages.investigation.allocation.partyNames['chen-congzheng'].name,
    elderUtility: metrics[0],
    youngerUtility: metrics[1],
    resultSummary: passesProportionality ? localCopy.bothDue : localCopy.oneShort,
    primaryLabel,
    onPrimary,
    ...(phase === 'verdict' && !isRevision ? {
      secondaryLabel: localCopy.revise,
      onSecondary: reviseOnce,
    } : {}),
    onShareChange: updateShare,
  };

  return (
    <div className={`${styles.prototype} ${styles[`variant_${variant}`]}`} data-act-one-prototype>
      <p className={styles.prototypeBadge}>{localCopy.badge}</p>
      {variant === 'focus' ? <FocusLayout model={model} /> : null}
      {variant === 'guided' ? <GuidedLayout model={model} /> : null}
      {variant === 'dossier' ? <DossierLayout model={model} /> : null}
      <PrototypeSwitcher locale={locale} variant={variant} />
    </div>
  );
}
