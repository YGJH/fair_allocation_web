'use client';

import { useState } from 'react';
import type { Locale } from '../../i18n/copy';
import styles from './Investigation.module.css';

export function PortraitCard({
  locale,
  name,
  role,
  reaction,
  imageSrc,
  selected = false,
  onActivate,
}: {
  locale: Locale;
  name: string;
  role: string;
  reaction?: string;
  imageSrc?: string;
  selected?: boolean;
  onActivate?: () => void;
}) {
  const [failed, setFailed] = useState(!imageSrc);
  const initial = name.trim().slice(0, 1) || '?';
  const content = (
    <>
      {failed ? (
        <span className={styles.portraitFallback} aria-hidden="true">{initial}</span>
      ) : (
        <img className={styles.portraitImage} src={imageSrc} alt="" onError={() => setFailed(true)} />
      )}
      <span>
        <strong className={styles.portraitName}>{name}</strong>
        <small className={styles.portraitRole}>{role}</small>
        {reaction ? <small className={styles.portraitRole}>{reaction}</small> : null}
      </span>
    </>
  );
  return onActivate ? (
    <button type="button" className={`${styles.portrait} ${selected ? styles.isSelected : ''}`} aria-pressed={selected} onClick={onActivate}>
      {content}
    </button>
  ) : (
    <div className={styles.portrait}>{content}</div>
  );
}
