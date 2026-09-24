export { copy, locales, type Locale } from './copy';
import type { Locale } from './copy';
export function selectLocale(acceptLanguage?: string|null, savedPreference?: string|null): Locale { if(savedPreference==='zh-TW'||savedPreference==='en') return savedPreference; return acceptLanguage?.toLowerCase().includes('zh-tw') ? 'zh-TW' : 'en'; }
export function localePath(locale:Locale,path:string){ return `/${locale}${path.startsWith('/')?path:`/${path}`}`; }
export function isLocale(value:string): value is Locale { return value==='zh-TW'||value==='en'; }
