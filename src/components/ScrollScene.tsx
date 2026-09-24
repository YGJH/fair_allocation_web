'use client';
import { useEffect, useRef } from 'react';

/** Decorative only: the complete story and its link remain server-rendered. */
export function ScrollScene(){
 const ref=useRef<HTMLDivElement>(null);
 useEffect(()=>{
  const scene=ref.current;
  const region=scene?.closest('[data-scroll-story]');
  if(!scene||!region)return;
  const preference=window.matchMedia('(prefers-reduced-motion: reduce)');
  let frame=0;
  const update=()=>{
   frame=0;
   if(preference.matches){scene.style.setProperty('--story-progress','0');return;}
   const bounds=region.getBoundingClientRect();
   const progress=Math.max(0,Math.min(1,-bounds.top/Math.max(1,bounds.height-window.innerHeight)));
   scene.style.setProperty('--story-progress',String(progress));
  };
  const schedule=()=>{if(!frame)frame=window.requestAnimationFrame(update);};
  schedule();
  window.addEventListener('scroll',schedule,{passive:true});
  window.addEventListener('resize',schedule);
  preference.addEventListener('change',schedule);
  return()=>{
   window.removeEventListener('scroll',schedule);
   window.removeEventListener('resize',schedule);
   preference.removeEventListener('change',schedule);
   window.cancelAnimationFrame(frame);
  };
 },[]);
 return <div ref={ref} className="story-visual" aria-hidden="true"><span className="story-person story-person--one"/><span className="story-person story-person--two"/><span className="story-object story-object--one">✦</span><span className="story-object story-object--two">◈</span><span className="story-object story-object--three">✳</span></div>;
}
