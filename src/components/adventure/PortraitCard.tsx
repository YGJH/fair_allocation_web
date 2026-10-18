'use client';

import { useEffect, useState } from 'react';
import type { Locale } from '../../i18n/copy';
import {
  getPortraitAsset,
  type CharacterId,
  type PortraitExpression,
} from '../../narrative/media-manifest';
import styles from './Investigation.module.css';

export type PortraitPresentation = 'dialogue-solo' | 'dialogue-duo' | 'thumbnail' | 'workbench';
export type PortraitEmphasis = 'speaker' | 'listener' | 'neutral';

export function PortraitCard({
  locale,
  name,
  role,
  reaction,
  characterId,
  expression = 'calm',
  imageSrc,
  presentation = 'thumbnail',
  emphasis = 'neutral',
  side,
  selected = false,
  onActivate,
}: {
  locale: Locale;
  name: string;
  role: string;
  reaction?: string;
  characterId?: CharacterId;
  expression?: PortraitExpression;
  imageSrc?: string;
  presentation?: PortraitPresentation;
  emphasis?: PortraitEmphasis;
  side?: 'left' | 'right';
  selected?: boolean;
  onActivate?: () => void;
}) {
  const asset = characterId ? getPortraitAsset(characterId, expression) : undefined;
  const resolvedSrc = imageSrc ?? asset?.src;
  const [failed, setFailed] = useState(!resolvedSrc);
  useEffect(() => setFailed(!resolvedSrc), [resolvedSrc]);

  const initial = name.trim().slice(0, 1) || '?';
  const className = [
    styles.portrait,
    styles[`portrait_${presentation.replace('-', '_')}`],
    styles[`portrait_${emphasis}`],
    side ? styles[`portrait_${side}`] : '',
    selected ? styles.isSelected : '',
  ].filter(Boolean).join(' ');
  const content = (
    <>
      <span className={styles.portraitFrame} aria-hidden="true">
        {failed ? (
          <span className={styles.portraitFallback}>{initial}</span>
        ) : (
          <img
            className={styles.portraitImage}
            src={resolvedSrc}
            width={asset?.width ?? 2752}
            height={asset?.height ?? 1536}
            style={{ objectPosition: asset?.objectPosition ?? 'center top' }}
            alt=""
            onError={() => setFailed(true)}
          />
        )}
      </span>
      <span className={styles.portraitLabel}>
        <strong className={styles.portraitName}>{name}</strong>
        <small className={styles.portraitRole}>{role}</small>
        {reaction ? <small className={styles.portraitReaction}>{reaction}</small> : null}
      </span>
    </>
  );
  return onActivate ? (
    <button
      type="button"
      className={className}
      aria-pressed={selected}
      data-presentation={presentation}
      data-expression={expression}
      data-emphasis={emphasis}
      onClick={onActivate}
    >
      {content}
    </button>
  ) : (
    <div className={className} data-presentation={presentation} data-expression={expression} data-emphasis={emphasis}>
      {content}
    </div>
  );
}
