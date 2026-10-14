'use client';

import { useState } from 'react';
import type { ReactNode } from 'react';
import type { Locale } from '../../i18n/copy';
import styles from './Investigation.module.css';

type SceneHotspot = { readonly id: string; readonly label: string; readonly onActivate: () => void };

export function ScenePlate({
  locale,
  name,
  description,
  fallbackLabel,
  imageSrc,
  hotspots = [],
  hotspotsLabel,
  children,
}: {
  locale: Locale;
  name: string;
  description: string;
  fallbackLabel: string;
  imageSrc?: string;
  hotspots?: readonly SceneHotspot[];
  hotspotsLabel?: string;
  children?: ReactNode;
}) {
  const [failed, setFailed] = useState(!imageSrc);
  return (
    <section className={styles.scenePlate} aria-label={name} data-scene-plate data-locale={locale}>
      {failed ? (
        <div className={styles.sceneFallback} role="img" aria-label={`${name}. ${fallbackLabel}`}>
          <strong>{name}</strong>
          <span>{fallbackLabel}</span>
        </div>
      ) : (
        <img className={styles.sceneImage} src={imageSrc} alt={description} onError={() => setFailed(true)} />
      )}
      <div className={styles.sceneCaption}>
        <strong>{name}</strong>
        <span>{description}</span>
      </div>
      {hotspots.length ? (
        <div className={styles.hotspots} aria-label={hotspotsLabel}>
          {hotspots.map((hotspot) => (
            <button className={styles.hotspot} type="button" key={hotspot.id} onClick={hotspot.onActivate}>
              {hotspot.label}
            </button>
          ))}
        </div>
      ) : null}
      {children}
    </section>
  );
}
