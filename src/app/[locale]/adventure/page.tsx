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
    title: zh ? '定分止爭錄｜互動式公平分配劇情' : 'The Art of Settled Shares',
    description: zh
      ? '走進汴京商行、松江公堂與萬曆深宮，在 Three.js 歷史場景中理解 EF1、EFX 與納許社會福利。'
      : 'A Three.js historical narrative about EF1, EFX, and Nash social welfare.',
  };
}
