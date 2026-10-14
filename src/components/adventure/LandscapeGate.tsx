'use client';

import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import styles from './AdventureStage.module.css';

const PHONE_PORTRAIT_QUERY = '(orientation: portrait) and (max-width: 600px) and (pointer: coarse)';

type LandscapeGateLabels = {
  readonly title: string;
  readonly description: string;
};

type LandscapeGateProps = {
  readonly children: ReactNode;
  readonly labels: LandscapeGateLabels;
  readonly onBlockedChange?: (blocked: boolean) => void;
};

export function LandscapeGate({ children, labels, onBlockedChange }: LandscapeGateProps) {
  const [blocked, setBlocked] = useState(false);
  const gateTitleId = useId();
  const gateDescriptionId = useId();
  const contentRef = useRef<HTMLDivElement>(null);
  const gateRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia?.(PHONE_PORTRAIT_QUERY);
    if (!mediaQuery) return;

    const update = () => {
      setBlocked(mediaQuery.matches);
      onBlockedChange?.(mediaQuery.matches);
    };
    update();
    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', update);
      return () => mediaQuery.removeEventListener('change', update);
    }

    mediaQuery.addListener?.(update);
    return () => mediaQuery.removeListener?.(update);
  }, [onBlockedChange]);

  useEffect(() => {
    if (blocked) {
      const activeElement = document.activeElement;
      previousFocusRef.current = activeElement instanceof HTMLElement
        && contentRef.current?.contains(activeElement)
        ? activeElement
        : null;
      gateRef.current?.focus();
      return;
    }

    if (previousFocusRef.current?.isConnected) previousFocusRef.current.focus();
    previousFocusRef.current = null;
  }, [blocked]);

  return (
    <div className={styles.landscapeRoot}>
      <div
        ref={contentRef}
        className={`${styles.gatedContent}${blocked ? ` ${styles.gatedContentBlocked}` : ''}`}
        aria-hidden={blocked || undefined}
        inert={blocked || undefined}
      >
        {children}
      </div>
      <div
        ref={gateRef}
        className={styles.orientationGate}
        data-blocked={blocked}
        role="dialog"
        aria-modal="true"
        aria-labelledby={gateTitleId}
        aria-describedby={gateDescriptionId}
        aria-hidden={!blocked}
        tabIndex={blocked ? -1 : undefined}
      >
        <div className={styles.rotateMark} aria-hidden="true">
          <span />
        </div>
        <h1 id={gateTitleId}>{labels.title}</h1>
        <p id={gateDescriptionId}>{labels.description}</p>
      </div>
    </div>
  );
}

export type { LandscapeGateLabels, LandscapeGateProps };
