import { copy } from '../../i18n/copy';
import { isLocale } from '../../i18n/locale';
import { EXAMPLE_ALLOCATION_ID } from '../../shared/example';
import { ScrollScene } from '../../components/ScrollScene';

export default async function LocalePage({params}:{params:Promise<{locale:string}>}){
 const {locale}=await params; const l=isLocale(locale)?locale:'en'; const t=copy[l];
 const steps=[[t.stepOne,t.stepOneDetail],[t.stepTwo,t.stepTwoDetail],[t.stepThree,t.stepThreeDetail]];
 return <main id="main-content"><div className="container">
  <section className="story-intro" aria-labelledby="hero-title"><p className="eyebrow"><span className="eyebrow-dot" aria-hidden="true"/> {t.heroEyebrow}</p><h1 id="hero-title">{t.heroTitle}</h1><p className="hero-intro">{t.heroIntro}</p><div className="story-intro-links"><span className="eyebrow">{t.scrollCue} <span aria-hidden="true">↓</span></span><a className="story-skip" href="#story-finish">{t.skipStory} <span aria-hidden="true">↘</span></a></div></section>
  <section id="story" className="story-section" data-scroll-story aria-labelledby="steps-title"><div className="section-heading"><p className="eyebrow">01 — 03</p><h2 id="steps-title">{t.howItWorks}</h2></div><div className="story-layout"><ol className="story-steps" aria-label={t.howItWorks}>{steps.map(([title,description],index)=><li key={title} className="story-step"><span className="step-number" aria-hidden="true">0{index+1}</span><h3>{title}</h3><p>{description}</p></li>)}</ol><ScrollScene/></div></section>
  <section id="story-finish" className="story-finish" aria-labelledby="story-finish-title"><p className="eyebrow">03 / 03</p><h2 id="story-finish-title">{t.storyFinish}</h2><p>{t.storyFinishDetail}</p><a className="button button-primary" href={`/${l}/allocations/${EXAMPLE_ALLOCATION_ID}`}>{t.tryExample} <span aria-hidden="true">↗</span></a></section>
  <aside className="home-note"><span className="eyebrow">{t.heroAside}</span><p>{t.heroQuestion}</p><span className="note-mark" aria-hidden="true">↗</span></aside><section className="lesson-note"><h2>{t.homeTitle}</h2><p>{t.lesson}</p></section>
 </div></main>;
}
