'use client';
import { usePathname, useRouter } from 'next/navigation';
import { copy, type Locale } from '../i18n/copy';
export function LanguageSwitch({locale}:{locale:Locale}){ const router=useRouter(); const path=usePathname(); const next=locale==='en'?'zh-TW':'en'; return <button type="button" onClick={()=>{ document.cookie=`fair-locale=${next}; SameSite=Lax; Path=/`; router.push(path.replace(/^\/(en|zh-TW)/,`/${next}`)); }}>{copy[next].languageName}</button>; }
