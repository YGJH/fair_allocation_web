'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

const fragmentShader = `
  precision highp float;
  varying vec2 vUv;
  uniform float uTime;
  uniform vec2 uPointer;
  uniform vec2 uResolution;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  void main() {
    vec2 uv = vUv;
    float aspect = uResolution.x / max(uResolution.y, 1.0);
    vec2 p = vec2((uv.x - 0.5) * aspect, uv.y - 0.5);
    vec2 pull = (uPointer - 0.5) * 0.045;
    vec2 left = vec2(-0.31 * aspect, 0.0) + pull;
    vec2 right = vec2(0.31 * aspect, 0.0) + pull;
    float dl = length(p - left);
    float dr = length(p - right);
    float field = sin((dl - dr) * 19.0 - uTime * 0.55);
    float orbit = sin((dl + dr) * 24.0 + uTime * 0.38);
    float bridge = exp(-abs(p.y) * 11.0) * exp(-abs(p.x) * 1.7);
    float glowL = 0.045 / max(dl, 0.08);
    float glowR = 0.045 / max(dr, 0.08);
    float grain = (hash(gl_FragCoord.xy + floor(uTime * 8.0)) - 0.5) * 0.018;

    vec3 base = vec3(0.035, 0.145, 0.125);
    vec3 teal = vec3(0.05, 0.44, 0.37);
    vec3 coral = vec3(0.76, 0.24, 0.13);
    vec3 color = base;
    color += teal * glowL * (0.58 + field * 0.12);
    color += coral * glowR * (0.5 - field * 0.1);
    color += vec3(0.08, 0.22, 0.19) * bridge * (0.28 + orbit * 0.08);
    color += grain;
    gl_FragColor = vec4(color, 1.0);
  }
`;

export function AllocationField() {
  const mount = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = mount.current;
    const parent = host?.parentElement;
    if (!host || !parent || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false, powerPreference: 'high-performance' });
    } catch {
      host.dataset.fallback = 'true';
      return;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const geometry = new THREE.PlaneGeometry(2, 2);
    const uniforms = {
      uTime: { value: 0 },
      uPointer: { value: new THREE.Vector2(0.5, 0.5) },
      uResolution: { value: new THREE.Vector2(1, 1) },
    };
    const material = new THREE.ShaderMaterial({ vertexShader, fragmentShader, uniforms });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.domElement.setAttribute('aria-hidden', 'true');
    host.appendChild(renderer.domElement);

    const target = new THREE.Vector2(0.5, 0.5);
    let frame = 0;
    let visible = true;
    let contextLost = false;
    const clock = new THREE.Clock();

    const resize = () => {
      const { width, height } = host.getBoundingClientRect();
      renderer.setSize(Math.max(1, width), Math.max(1, height), false);
      uniforms.uResolution.value.set(Math.max(1, width), Math.max(1, height));
    };
    const render = () => {
      frame = 0;
      if (!visible || document.hidden || contextLost) return;
      uniforms.uTime.value = clock.getElapsedTime();
      uniforms.uPointer.value.lerp(target, 0.055);
      renderer.render(scene, camera);
      frame = requestAnimationFrame(render);
    };
    const start = () => { if (!frame && visible && !document.hidden && !contextLost) frame = requestAnimationFrame(render); };
    const stop = () => { if (frame) cancelAnimationFrame(frame); frame = 0; };
    const pointer = (event: PointerEvent) => {
      const bounds = parent.getBoundingClientRect();
      target.set(
        THREE.MathUtils.clamp((event.clientX - bounds.left) / bounds.width, 0, 1),
        THREE.MathUtils.clamp(1 - (event.clientY - bounds.top) / bounds.height, 0, 1),
      );
    };
    const resetPointer = () => target.set(0.5, 0.5);
    const visibility = () => document.hidden ? stop() : start();
    const lost = (event: Event) => { event.preventDefault(); contextLost = true; stop(); host.dataset.fallback = 'true'; };

    const resizeObserver = new ResizeObserver(resize);
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start(); else stop();
    }, { rootMargin: '120px' });

    resizeObserver.observe(host);
    intersectionObserver.observe(host);
    parent.addEventListener('pointermove', pointer, { passive: true });
    parent.addEventListener('pointerleave', resetPointer);
    renderer.domElement.addEventListener('webglcontextlost', lost);
    document.addEventListener('visibilitychange', visibility);
    resize();
    start();

    return () => {
      stop();
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      parent.removeEventListener('pointermove', pointer);
      parent.removeEventListener('pointerleave', resetPointer);
      renderer.domElement.removeEventListener('webglcontextlost', lost);
      document.removeEventListener('visibilitychange', visibility);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
    };
  }, []);

  return <div ref={mount} className="stage-webgl" aria-hidden="true" />;
}
