import { AdventureShell } from '../../../components/adventure/AdventureShell';
import { isLocale } from '../../../i18n/locale';

export default async function AdventurePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const selectedLocale = isLocale(locale) ? locale : 'zh-TW';
  return <AdventureShell locale={selectedLocale} />;
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const zh = locale === 'zh-TW';
  return {
    title: zh ? '定分止爭錄｜萬曆年間互動篇章' : 'The Art of Settled Shares',
    description: zh
      ? '隨程衡走進明萬曆年間三樁彼此相連的案件，在抉擇與後果中替人把名分定下來。'
      : 'Follow Cheng Heng through three connected cases in the Wanli reign, where each decision settles a claim and shapes its consequences.',
  };
}
