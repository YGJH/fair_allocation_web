'use client';

import { useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from 'react';
import type { CaseInput } from '../domain/model';
import { copy, type Locale } from '../i18n/copy';

type DragSession = {
  element: HTMLButtonElement;
  itemIndex: number;
  pointerId: number;
  startX: number;
  startY: number;
  moved: boolean;
};

export function AllocationEditor({ locale, caseId, caseData }: { locale: Locale; caseId: string; caseData: CaseInput }) {
  const t = copy[locale];
  const [owners, setOwners] = useState<number[]>(Array(caseData.items.length).fill(-1));
  const [selectedItem, setSelectedItem] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const drag = useRef<DragSession | null>(null);
  const suppressClick = useRef(false);
  const assigned = owners.filter((owner) => owner >= 0).length;
  const complete = assigned === owners.length;

  function assign(itemIndex: number, owner: number) {
    if (pending) return;
    setOwners((current) => current.map((value, index) => index === itemIndex ? owner : value));
    setSelectedItem(null);
  }

  function startDrag(event: ReactPointerEvent<HTMLButtonElement>, itemIndex: number) {
    if (pending) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = {
      element: event.currentTarget,
      itemIndex,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      moved: false,
    };
  }

  function moveDrag(event: ReactPointerEvent<HTMLButtonElement>) {
    const session = drag.current;
    if (!session || session.pointerId !== event.pointerId) return;
    const x = event.clientX - session.startX;
    const y = event.clientY - session.startY;
    if (Math.hypot(x, y) > 6) session.moved = true;
    if (!session.moved) return;
    session.element.dataset.dragging = 'true';
    session.element.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${Math.max(-7, Math.min(7, x / 18))}deg) scale(1.06)`;
  }

  function finishDrag(event: ReactPointerEvent<HTMLButtonElement>, allowDrop: boolean) {
    const session = drag.current;
    if (!session || session.pointerId !== event.pointerId) return;
    if (session.moved && allowDrop) {
      session.element.style.pointerEvents = 'none';
      const target = document.elementFromPoint(event.clientX, event.clientY)?.closest<HTMLElement>('[data-drop-agent]');
      session.element.style.removeProperty('pointer-events');
      if (target) assign(session.itemIndex, Number(target.dataset.dropAgent));
      suppressClick.current = true;
    }
    session.element.style.removeProperty('transform');
    delete session.element.dataset.dragging;
    if (session.element.hasPointerCapture(event.pointerId)) session.element.releasePointerCapture(event.pointerId);
    drag.current = null;
  }

  function renderItem(itemIndex: number) {
    const item = caseData.items[itemIndex];
    const owner = owners[itemIndex];
    const values = caseData.agents.map((agent, personIndex) => `${agent} ${caseData.values[personIndex][itemIndex]}`).join(', ');
    const ownerLabel = owner >= 0 ? caseData.agents[owner] : t.itemDock;
    return (
      <button
        className={selectedItem === itemIndex ? 'allocation-token is-selected' : 'allocation-token'}
        type="button"
        key={item}
        aria-pressed={selectedItem === itemIndex}
        aria-label={`${item}. ${values}. ${ownerLabel}`}
        disabled={pending}
        onClick={() => {
          if (suppressClick.current) {
            suppressClick.current = false;
            return;
          }
          setSelectedItem((current) => current === itemIndex ? null : itemIndex);
        }}
        onPointerDown={(event) => startDrag(event, itemIndex)}
        onPointerMove={moveDrag}
        onPointerUp={(event) => finishDrag(event, true)}
        onPointerCancel={(event) => finishDrag(event, false)}
      >
        <span className="allocation-token__name">{item}</span>
        <span className="allocation-token__values" aria-hidden="true">
          {caseData.values.map((row, personIndex) => (
            <span key={caseData.agents[personIndex]} data-person={personIndex}>{row[itemIndex]}</span>
          ))}
        </span>
      </button>
    );
  }

  async function submit() {
    if (!complete || pending) return;
    setPending(true);
    setError('');
    try {
      const response = await fetch(`/api/cases/${caseId}/allocations`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ owners }),
      });
      if (!response.ok) throw new Error();
      const data = await response.json();
      window.location.href = `/${locale}/allocations/${data.id}`;
    } catch {
      setError(t.networkError);
      setPending(false);
    }
  }

  return (
    <section className="panel allocation-editor" aria-labelledby="allocation-editor-title" aria-busy={pending}>
      <div className="panel-heading allocation-heading">
        <div>
          <h2 id="allocation-editor-title">{t.allocationEditorTitle}</h2>
          <p className="allocation-gesture-hint">{t.allocationGestureHint}</p>
        </div>
        <div
          className="assignment-count"
          aria-live="polite"
          style={{ '--allocation-progress': `${owners.length ? assigned / owners.length * 100 : 0}%` } as CSSProperties}
        ><strong>{assigned}</strong><span>/ {caseData.items.length}</span></div>
      </div>

      {error && <p role="alert">{error}</p>}

      <div className="allocation-board" data-allocation-board>
        <div className="allocation-dock" data-drop-agent="-1">
          <div>
            <h3>{t.itemDock}</h3>
            <p>{selectedItem === null ? t.allocationGestureHint : t.itemSelected}</p>
          </div>
          <div className="allocation-token-list">
            {caseData.items.map((_, itemIndex) => owners[itemIndex] === -1 ? renderItem(itemIndex) : null)}
            {assigned === caseData.items.length && <span className="dock-empty" aria-hidden="true">✓</span>}
          </div>
        </div>

        <div className="allocation-targets">
          {caseData.agents.map((agent, personIndex) => {
            const ownedItems = caseData.items.map((_, itemIndex) => itemIndex).filter((itemIndex) => owners[itemIndex] === personIndex);
            return (
              <section
                className={selectedItem === null ? 'agent-drop-zone' : 'agent-drop-zone is-ready'}
                data-drop-agent={personIndex}
                key={agent}
                aria-labelledby={`agent-${personIndex}-name`}
              >
                <header>
                  <span className="agent-orb" aria-hidden="true">{agent.slice(0, 1)}</span>
                  <div><h3 id={`agent-${personIndex}-name`}>{agent}</h3><span>{ownedItems.length} / {caseData.items.length}</span></div>
                </header>
                <div className="agent-token-list">
                  {ownedItems.map(renderItem)}
                  {!ownedItems.length && <span className="drop-placeholder" aria-hidden="true" />}
                </div>
                <button
                  className="drop-zone-action"
                  type="button"
                  disabled={selectedItem === null || pending}
                  onClick={() => selectedItem !== null && assign(selectedItem, personIndex)}
                  aria-label={`${t.placeHere}: ${agent}`}
                >{t.placeHere}</button>
              </section>
            );
          })}
        </div>
      </div>

      <div className="sr-only">
        {caseData.items.map((item, i) => {
          const inputId = `owner-${i}`;
          return (
            <div key={item}>
              <label htmlFor={inputId}>{locale === 'zh-TW' ? `${item} 的歸屬` : `${item} owner`}</label>
              <select
                id={inputId}
                value={owners[i]}
                disabled={pending}
                onChange={(event) => assign(i, Number(event.target.value))}
              >
                <option value={-1}>{t.selectOwner}</option>
                {caseData.agents.map((agent, j) => <option key={agent} value={j}>{agent}</option>)}
              </select>
            </div>
          );
        })}
      </div>

      <div className="editor-action-row">
        <p className={complete ? 'completion-note completion-note--ready' : 'completion-note'}>
          <span aria-hidden="true">{complete ? '✓' : '○'}</span> {complete ? t.assignmentComplete : t.assignmentIncomplete}
        </p>
        <button className="button button-primary" type="button" disabled={!complete || pending} onClick={submit}>
          {pending ? t.submitting : t.submitAllocation}
        </button>
      </div>
    </section>
  );
}
