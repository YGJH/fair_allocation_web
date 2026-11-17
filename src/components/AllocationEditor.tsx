'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import type { CaseInput } from '../domain/model';
import { copy, type Locale } from '../i18n/copy';
import { displayItemName } from '../i18n/labels';
import { EnvyGraph } from './EnvyGraph';

type DragSession = {
  element: HTMLButtonElement;
  itemIndex: number;
  input: 'touch' | 'pointer';
  id: number;
  startX: number;
  startY: number;
  startScrollX: number;
  startScrollY: number;
  x: number;
  y: number;
  active: boolean;
  holdTimer: number;
  scrollFrame: number;
  hover: HTMLElement | null;
};

const POINTER_DRAG_THRESHOLD = 6;
const TOUCH_HOLD_MS = 200;
const TOUCH_SCROLL_TOLERANCE = 8;
const AUTO_SCROLL_EDGE = 72;
const AUTO_SCROLL_MAX_SPEED = 16;

export function AllocationEditor({ locale, caseId, caseData }: { locale: Locale; caseId: string; caseData: CaseInput }) {
  const t = copy[locale];
  const [owners, setOwners] = useState<number[]>(Array(caseData.items.length).fill(-1));
  const [selectedItem, setSelectedItem] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const board = useRef<HTMLDivElement>(null);
  const suppressClickUntil = useRef(0);
  const assigned = owners.filter((owner) => owner >= 0).length;
  const complete = assigned === owners.length;

  function assign(itemIndex: number, owner: number) {
    if (pending) return;
    setOwners((current) => current.map((value, index) => index === itemIndex ? owner : value));
    setSelectedItem(null);
  }

  const assignRef = useRef(assign);
  assignRef.current = assign;

  // Drag handling uses native listeners: touch input needs a non-passive touchmove so iOS Safari
  // keeps normal page scrolling until a press-and-hold turns the gesture into a drag.
  useEffect(() => {
    const root = board.current;
    if (!root) return;
    let session: DragSession | null = null;

    const tokenFrom = (target: EventTarget | null) => {
      const token = target instanceof Element ? target.closest<HTMLButtonElement>('[data-item-index]') : null;
      return token && !token.disabled ? token : null;
    };

    const dropTargetAt = (x: number, y: number) => {
      const hit = document.elementFromPoint(x, y);
      return hit?.closest<HTMLElement>('[data-drop-agent]') ?? null;
    };

    const render = () => {
      if (!session?.active) return;
      const dx = session.x - session.startX + (window.scrollX - session.startScrollX);
      const dy = session.y - session.startY + (window.scrollY - session.startScrollY);
      const tilt = Math.max(-7, Math.min(7, dx / 18));
      session.element.style.transform = `translate3d(${dx}px, ${dy}px, 0) rotate(${tilt}deg) scale(1.06)`;
      const hover = dropTargetAt(session.x, session.y);
      if (hover !== session.hover) {
        if (session.hover) delete session.hover.dataset.dropHover;
        if (hover) hover.dataset.dropHover = 'true';
        session.hover = hover;
      }
    };

    const autoScroll = () => {
      if (!session?.active) return;
      const height = window.visualViewport?.height ?? window.innerHeight;
      let speed = 0;
      if (session.y < AUTO_SCROLL_EDGE) speed = -AUTO_SCROLL_MAX_SPEED * (1 - Math.max(0, session.y) / AUTO_SCROLL_EDGE);
      else if (session.y > height - AUTO_SCROLL_EDGE) speed = AUTO_SCROLL_MAX_SPEED * (1 - Math.max(0, height - session.y) / AUTO_SCROLL_EDGE);
      if (speed) {
        window.scrollBy({ top: speed, behavior: 'instant' as ScrollBehavior });
        render();
      }
      session.scrollFrame = requestAnimationFrame(autoScroll);
    };

    const activate = () => {
      if (!session || session.active) return;
      session.active = true;
      session.element.dataset.dragging = 'true';
      if (session.input === 'touch') navigator.vibrate?.(8);
      render();
      session.scrollFrame = requestAnimationFrame(autoScroll);
    };

    const begin = (element: HTMLButtonElement, input: DragSession['input'], id: number, x: number, y: number) => {
      end(false);
      session = {
        element,
        itemIndex: Number(element.dataset.itemIndex),
        input,
        id,
        startX: x,
        startY: y,
        startScrollX: window.scrollX,
        startScrollY: window.scrollY,
        x,
        y,
        active: false,
        holdTimer: 0,
        scrollFrame: 0,
        hover: null,
      };
    };

    const end = (drop: boolean) => {
      const current = session;
      if (!current) return;
      session = null;
      window.clearTimeout(current.holdTimer);
      cancelAnimationFrame(current.scrollFrame);
      if (current.active) {
        const target = drop ? dropTargetAt(current.x, current.y) : null;
        suppressClickUntil.current = performance.now() + 500;
        if (current.hover) delete current.hover.dataset.dropHover;
        current.element.style.removeProperty('transform');
        delete current.element.dataset.dragging;
        if (target) assignRef.current(current.itemIndex, Number(target.dataset.dropAgent));
      }
    };

    const onPointerDown = (event: PointerEvent) => {
      if (event.pointerType === 'touch' || event.button !== 0) return;
      const token = tokenFrom(event.target);
      if (token) begin(token, 'pointer', event.pointerId, event.clientX, event.clientY);
    };
    const onPointerMove = (event: PointerEvent) => {
      if (session?.input !== 'pointer' || session.id !== event.pointerId) return;
      session.x = event.clientX;
      session.y = event.clientY;
      if (!session.active && Math.hypot(session.x - session.startX, session.y - session.startY) > POINTER_DRAG_THRESHOLD) activate();
      else render();
    };
    const onPointerEnd = (event: PointerEvent) => {
      if (session?.input !== 'pointer' || session.id !== event.pointerId) return;
      end(event.type === 'pointerup');
    };

    const findTouch = (list: TouchList) => {
      if (!session) return null;
      for (let index = 0; index < list.length; index += 1) {
        if (list[index].identifier === session.id) return list[index];
      }
      return null;
    };
    const onTouchStart = (event: TouchEvent) => {
      if (event.touches.length > 1) {
        end(false);
        return;
      }
      const token = tokenFrom(event.target);
      const touch = event.changedTouches[0];
      if (!token || !touch) return;
      begin(token, 'touch', touch.identifier, touch.clientX, touch.clientY);
      session!.holdTimer = window.setTimeout(activate, TOUCH_HOLD_MS);
    };
    const onTouchMove = (event: TouchEvent) => {
      const touch = session?.input === 'touch' ? findTouch(event.changedTouches) : null;
      if (!session || !touch) return;
      session.x = touch.clientX;
      session.y = touch.clientY;
      if (!session.active) {
        // Moving before the hold completes means the user is scrolling the page.
        if (Math.hypot(session.x - session.startX, session.y - session.startY) > TOUCH_SCROLL_TOLERANCE) end(false);
        return;
      }
      if (event.cancelable) event.preventDefault();
      render();
    };
    const onTouchEnd = (event: TouchEvent) => {
      const touch = session?.input === 'touch' ? findTouch(event.changedTouches) : null;
      if (!session || !touch) return;
      session.x = touch.clientX;
      session.y = touch.clientY;
      if (session.active && event.cancelable) event.preventDefault();
      end(event.type === 'touchend');
    };
    const onContextMenu = (event: Event) => {
      if (session?.active || tokenFrom(event.target)) event.preventDefault();
    };

    root.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerEnd);
    window.addEventListener('pointercancel', onPointerEnd);
    root.addEventListener('touchstart', onTouchStart, { passive: true });
    root.addEventListener('touchmove', onTouchMove, { passive: false });
    root.addEventListener('touchend', onTouchEnd, { passive: false });
    root.addEventListener('touchcancel', onTouchEnd, { passive: false });
    root.addEventListener('contextmenu', onContextMenu);

    return () => {
      end(false);
      root.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerEnd);
      window.removeEventListener('pointercancel', onPointerEnd);
      root.removeEventListener('touchstart', onTouchStart);
      root.removeEventListener('touchmove', onTouchMove);
      root.removeEventListener('touchend', onTouchEnd);
      root.removeEventListener('touchcancel', onTouchEnd);
      root.removeEventListener('contextmenu', onContextMenu);
    };
  }, []);

  function renderItem(itemIndex: number) {
    const item = caseData.items[itemIndex];
    const label = displayItemName(locale, item, itemIndex);
    const owner = owners[itemIndex];
    const values = caseData.agents.map((agent, personIndex) => `${agent} ${caseData.values[personIndex][itemIndex]}`).join(', ');
    const ownerLabel = owner >= 0 ? caseData.agents[owner] : t.itemDock;
    return (
      <button
        className={selectedItem === itemIndex ? 'allocation-token is-selected' : 'allocation-token'}
        type="button"
        key={item}
        aria-pressed={selectedItem === itemIndex}
        aria-label={`${label}. ${values}. ${ownerLabel}`}
        disabled={pending}
        data-item-index={itemIndex}
        onClick={() => {
          if (performance.now() < suppressClickUntil.current) return;
          setSelectedItem((current) => current === itemIndex ? null : itemIndex);
        }}
      >
        <span className="allocation-token__name">{label}</span>
        <span className="allocation-token__values" aria-hidden="true">
          {caseData.values.map((row, personIndex) => (
            <span key={caseData.agents[personIndex]} data-person={personIndex}><small>{caseData.agents[personIndex]}</small>{row[itemIndex]}</span>
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

      <div className="allocation-board" data-allocation-board ref={board}>
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

      <EnvyGraph locale={locale} caseData={caseData} owners={owners} />

      <div className="sr-only">
        {caseData.items.map((item, i) => {
          const inputId = `owner-${i}`;
          const label = displayItemName(locale, item, i);
          return (
            <div key={item}>
              <label htmlFor={inputId}>{locale === 'zh-TW' ? `${label} 的歸屬` : `${label} owner`}</label>
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
