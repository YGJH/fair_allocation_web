import { isLocale } from '../../i18n/locale';
import { copy } from '../../i18n/copy';
import { LanguageSwitch } from '../../components/LanguageSwitch';
import './global.css';
export default async function LocaleLayout({children,params}:{children:React.ReactNode;params:Promise<{locale:string}>}){
 const {locale}=await params; const l=isLocale(locale)?locale:'en'; const t=copy[l];
 return <html lang={l}><body><a className="skip-link" href="#main-content">{t.skipToContent}</a><header className="site-header"><div className="container header-inner"><a className="brand" href={`/${l}`}><span className="brand-symbol" aria-hidden="true">◒</span><span>{t.homeTitle}<small>{t.siteTagline}</small></span></a><nav className="site-nav" aria-label={l==='en'?'Main navigation':'主選單'}><a href={`/${l}/cases/new`}>{t.newCase}</a><LanguageSwitch locale={l}/></nav></div></header>{children}<footer className="site-footer"><div className="container">{t.siteTagline} <span aria-hidden="true">·</span> {t.homeTitle}</div></footer></body></html>;
}
export async function generateMetadata({params}:{params:Promise<{locale:string}>}){ const {locale}=await params; const l=isLocale(locale)?locale:'en'; return {title:copy[l].homeTitle}; }
