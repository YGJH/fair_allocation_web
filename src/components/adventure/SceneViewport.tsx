'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import type { NarrativePhase, NarrativeScenario } from '../../narrative/types';

const DynamicSceneCanvas = dynamic(
  () => import('./SceneCanvas').then((module) => module.SceneCanvas),
  { ssr: false, loading: () => <div className="adventure-scene__loading" aria-hidden="true" /> },
);

export function SceneViewport(props: {
  scenario: NarrativeScenario;
  phase: NarrativePhase;
  owners: number[];
  silver: number[];
  zeroUtility: boolean;
  mastered: boolean;
  focusTargetId: string | null;
  onHotspot: (targetId: string) => void;
}) {
  const [usePoster, setUsePoster] = useState(false);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setUsePoster(media.matches || !('WebGLRenderingContext' in window));
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  return (
    <div className="adventure-scene" data-phase={props.phase}>
      {usePoster ? (
        // The poster is the deliberate low-motion equivalent of the diorama, not decorative content.
        <img src={props.scenario.poster} alt="" />
      ) : <DynamicSceneCanvas {...props} />}
      <div className="adventure-scene__vignette" aria-hidden="true" />
    </div>
  );
}
