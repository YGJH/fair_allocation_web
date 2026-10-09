'use client';

import { useEffect, useRef } from 'react';
import type { NarrativePhase, NarrativeScenario } from '../../narrative/types';
import { SceneRuntime } from '../../three/SceneRuntime';

export function SceneCanvas({
  scenario,
  phase,
  owners,
  silver,
  zeroUtility,
  mastered,
  focusTargetId,
  onHotspot,
}: {
  scenario: NarrativeScenario;
  phase: NarrativePhase;
  owners: number[];
  silver: number[];
  zeroUtility: boolean;
  mastered: boolean;
  focusTargetId: string | null;
  onHotspot: (targetId: string) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const runtimeRef = useRef<SceneRuntime | null>(null);
  const onHotspotRef = useRef(onHotspot);
  const sceneId = phase === 'prologue' ? 'prologue' : scenario.id;
  onHotspotRef.current = onHotspot;

  useEffect(() => {
    if (!canvasRef.current) return;
    const runtime = new SceneRuntime(canvasRef.current, sceneId, scenario, (targetId) => onHotspotRef.current(targetId));
    runtimeRef.current = runtime;
    return () => {
      runtimeRef.current = null;
      runtime.dispose();
    };
  }, [scenario, sceneId]);

  useEffect(() => {
    runtimeRef.current?.update({ phase, owners, silver, zeroUtility, mastered, focusTargetId });
  }, [focusTargetId, mastered, owners, phase, silver, zeroUtility]);

  return <canvas ref={canvasRef} aria-hidden="true" />;
}
