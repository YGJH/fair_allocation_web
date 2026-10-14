'use client';

import { useEffect, useRef, useState } from 'react';
import type { Locale } from '../../i18n/copy';
import { ACT_ONE_DEFINITION, ACT_TWO_DEFINITION, type ActOneGoodId } from '../../narrative/campaign-definition';
import type { CampaignAllocation } from '../../narrative/types';
import { getAdventureCopy } from '../../i18n/adventure';
import { PortraitCard } from './PortraitCard';
import styles from './Investigation.module.css';

export function AllocationWorkbench(props: {
  locale: Locale; allocation: CampaignAllocation; canLock: boolean; guidanceCompleted?: boolean;
  onCompleteGuidance?: () => void; onChange: (allocation: CampaignAllocation) => void;
  onLock: () => void; onReturn: () => void; revisionMode?: boolean; act?: 1 | 2;
}) {
  if (props.act === 2) return <ActTwoWorkbench {...props} />;
  return <ActOneWorkbench {...props} />;
}

function ActOneWorkbench({ locale, allocation, canLock, guidanceCompleted = true, onCompleteGuidance = () => {}, onChange, onLock, onReturn, revisionMode = false }: Parameters<typeof AllocationWorkbench>[0]) {
  const investigationCopy = getAdventureCopy(locale).investigation;
  const copy = investigationCopy.allocation;
  const partyIds = ACT_ONE_DEFINITION.parties;
  const paddyShares = allocation.find(({ goodId }) => goodId === 'paddy-field')?.shares;
  const silverShares = allocation.find(({ goodId }) => goodId === 'silver')?.shares;
  const reactionKey = paddyShares && silverShares
    ? paddyShares[0] === 10 && silverShares[1] === 10 ? 'brothersExchange'
      : paddyShares[1] > 5 ? 'paddyToYounger' : silverShares[0] > 5 ? 'silverToElder' : null : null;
  const reactionKeyRef = useRef<string | null>(null);
  const [visibleReactionKey, setVisibleReactionKey] = useState<string | null>(null);
  useEffect(() => { if (reactionKeyRef.current !== reactionKey) { reactionKeyRef.current = reactionKey; setVisibleReactionKey(reactionKey); } }, [reactionKey]);
  const reaction = visibleReactionKey ? investigationCopy.reactions[visibleReactionKey as keyof typeof investigationCopy.reactions] : null;
  function adjust(goodId: ActOneGoodId, partyIndex: number, delta: number) {
    const row = allocation.find(({ goodId: candidateId }) => candidateId === goodId); if (!row) return;
    const nextParty = row.shares[partyIndex] + delta; const other = 1 - partyIndex; const nextOther = row.shares[other] - delta;
    if (nextParty < 0 || nextParty > 10 || nextOther < 0 || nextOther > 10) return;
    onChange(allocation.map((candidate) => candidate.goodId === goodId ? { ...candidate, shares: partyIndex === 0 ? [nextParty, nextOther] : [nextOther, nextParty] } : candidate));
  }
  function setPartyZero(goodId: ActOneGoodId, value: number) {
    if (!Number.isInteger(value) || value < 0 || value > 10) return;
    onChange(allocation.map((candidate) => candidate.goodId === goodId ? { ...candidate, shares: [value, 10 - value] } : candidate));
  }
  return <section className={styles.workbench} aria-labelledby="allocation-workbench-title" data-allocation-workbench>
    <header><p className={styles.task}><strong>{copy.heading}</strong></p><h2 id="allocation-workbench-title">{copy.heading}</h2><p className={styles.explanation}>{revisionMode ? copy.revisionInstructions : copy.instructions}</p></header>
    {!guidanceCompleted ? <aside className={styles.guidance} aria-labelledby="allocation-guidance-title"><h3 id="allocation-guidance-title">{copy.guidance.title}</h3><p>{copy.guidance.body}</p><ol><li>{copy.guidance.ask}</li><li>{copy.guidance.chooseGood}</li><li>{copy.guidance.adjustShares}</li><li>{copy.guidance.lock}</li></ol><button type="button" onClick={onCompleteGuidance}>{copy.guidance.dismiss}</button></aside> : null}
    {reaction ? <div className={styles.reaction} role="status" aria-live="polite"><PortraitCard locale={locale} name={reaction.name} role={reaction.role} /><p className={styles.liveText}>{reaction.text}</p></div> : null}
    {ACT_ONE_DEFINITION.goods.map((good) => { const row = allocation.find(({ goodId }) => goodId === good.id); if (!row) return null; const first = row.shares[0]; const second = row.shares[1]; const name = copy.goodNames[good.id]; const firstName = copy.partyNames[partyIds[0]].name; const secondName = copy.partyNames[partyIds[1]].name; const label = copy.shareBar(name, firstName, first, secondName, second); return <section className={styles.goodRow} key={good.id} aria-labelledby={`good-${good.id}`}>
      <div className={styles.goodHeader}><h3 id={`good-${good.id}`}>{name}</h3><span>{first + second}/10</span></div><div className={styles.shareBar} role="img" aria-label={label}>{Array.from({ length: 10 }, (_, index) => <span key={index} style={{ background: index < first ? '#5e7b5a' : '#2f4a63' }} />)}</div><p className={styles.liveText} aria-live="polite">{label}</p><label className={styles.rangeLabel} htmlFor={`range-${good.id}`}>{copy.shares(name, firstName, first)}</label><input className={styles.range} id={`range-${good.id}`} type="range" min={0} max={10} step={1} value={first} onChange={(event) => setPartyZero(good.id, Number(event.target.value))} onKeyDown={(event) => { if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') { event.preventDefault(); setPartyZero(good.id, first - 1); } else if (event.key === 'ArrowRight' || event.key === 'ArrowUp') { event.preventDefault(); setPartyZero(good.id, first + 1); } }} aria-label={label} aria-valuetext={label} />
      <div className={styles.adjustments}>{partyIds.map((partyId, index) => <div key={partyId}><span className={styles.rangeLabel}>{copy.partyNames[partyId].name}: {row.shares[index]}/10</span><button type="button" aria-label={copy.decrease(name, copy.partyNames[partyId].name)} disabled={row.shares[index] === 0 || row.shares[1 - index] === 10} onClick={() => adjust(good.id, index, -1)}>−</button><button type="button" aria-label={copy.increase(name, copy.partyNames[partyId].name)} disabled={row.shares[index] === 10 || row.shares[1 - index] === 0} onClick={() => adjust(good.id, index, 1)}>+</button></div>)}</div>
    </section>; })}
    {!revisionMode && !canLock ? <p className={styles.explanation}>{copy.requiredCluesExplanation}</p> : null}<div className={styles.actions}>{!revisionMode ? <button type="button" className={styles.return} onClick={onReturn}>{copy.returnToInvestigation}</button> : null}<button type="button" className={styles.primary} disabled={!canLock} onClick={onLock}>{revisionMode ? copy.revisionLock : copy.lock}</button></div>
  </section>;
}

function ActTwoWorkbench({ locale, allocation, canLock, onChange, onLock, onReturn, revisionMode = false }: Parameters<typeof AllocationWorkbench>[0]) {
  const copy = getAdventureCopy(locale).actTwo;
  const parties = ACT_TWO_DEFINITION.parties;
  const names = copy.partyNames;
  const ownerRow = allocation.find(({ goodId }) => goodId === 'loom-workshop');
  const owner = ownerRow?.owner ?? 2;
  const updateOwner = (value: number) => onChange(allocation.map((row) => row.goodId === 'loom-workshop' ? { goodId: row.goodId, shares: [], owner: value } : row));
  const updateShare = (goodId: string, party: number, value: number) => {
    const row = allocation.find((candidate) => candidate.goodId === goodId); if (!row || !Number.isInteger(value) || value < 0 || value > 10) return;
    const shares = [...row.shares];
    const delta = value - shares[party];
    shares[party] = value;
    const others = parties.map((_, index) => index).filter((index) => index !== party);
    if (delta > 0) {
      let remaining = delta;
      for (const index of [...others].reverse()) {
        const transfer = Math.min(shares[index], remaining);
        shares[index] -= transfer;
        remaining -= transfer;
      }
      if (remaining > 0) return;
    } else if (delta < 0) {
      let remaining = -delta;
      for (const index of others) {
        const transfer = Math.min(10 - shares[index], remaining);
        shares[index] += transfer;
        remaining -= transfer;
      }
      if (remaining > 0) return;
    }
    onChange(allocation.map((candidate) => candidate.goodId === goodId ? { ...candidate, shares } : candidate));
  };
  return <section className={styles.workbench} aria-labelledby="act-two-workbench-title" data-allocation-workbench>
    <header><p className={styles.task}><strong>{copy.taskLabel}</strong></p><h2 id="act-two-workbench-title">{copy.allocationHeading}</h2><p className={styles.explanation}>{revisionMode ? copy.revisionInstructions : copy.allocationInstructions}</p></header>
    <fieldset className={styles.goodRow}><legend>{copy.goodNames['loom-workshop']}</legend><p>{copy.indivisibleLabel}</p><div className={styles.adjustments}>{parties.map((party, index) => <label key={party}><input type="radio" name="loom-owner" checked={owner === index} onChange={() => updateOwner(index)} />{names[party].name}</label>)}</div><p className={styles.liveText}>{copy.ownerLabel(names[parties[owner]].name)}</p></fieldset>
    {ACT_TWO_DEFINITION.goods.filter((good) => good.kind === 'divisible').map((good) => { const row = allocation.find((candidate) => candidate.goodId === good.id); if (!row) return null; return <fieldset className={styles.goodRow} key={good.id}><legend>{copy.goodNames[good.id]}</legend><div className={styles.shareBar} role="img" aria-label={copy.goodNames[good.id]}>{Array.from({ length: 10 }, (_, unit) => <span key={unit} style={{ background: unit < row.shares[0] ? '#5e7b5a' : unit < row.shares[0] + row.shares[1] ? '#7b6a4d' : '#2f4a63' }} />)}</div>{parties.map((party, index) => <label className={styles.rangeLabel} key={party} htmlFor={`act-two-${good.id}-${index}`}>{copy.sharesLabel(names[party].name, row.shares[index])}<input className={styles.range} id={`act-two-${good.id}-${index}`} type="range" min={0} max={10} value={row.shares[index]} onChange={(event) => updateShare(good.id, index, Number(event.target.value))} aria-label={copy.sharesLabel(names[party].name, row.shares[index])} /></label>)}</fieldset>; })}
    {!canLock ? <p className={styles.explanation}>{copy.requiredCluesExplanation}</p> : null}<div className={styles.actions}>{!revisionMode ? <button type="button" className={styles.return} onClick={onReturn}>{copy.returnToInvestigation}</button> : null}<button type="button" className={styles.primary} disabled={!canLock} onClick={onLock}>{revisionMode ? copy.revisionLock : copy.lock}</button></div>
  </section>;
}
