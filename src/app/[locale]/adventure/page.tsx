import { AdventureShell } from '../../../components/adventure/AdventureShell';
import { ActOneUiPrototype, type ActOnePrototypeVariant } from '../../../components/adventure/ActOneUiPrototype';
import { isLocale } from '../../../i18n/locale';

function isActOnePrototypeVariant(value: string | undefined): value is ActOnePrototypeVariant {
  return value === 'focus' || value === 'guided' || value === 'dossier';
}

export default async function AdventurePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const [{ locale }, query] = await Promise.all([params, searchParams]);
  const selectedLocale = isLocale(locale) ? locale : 'zh-TW';
  const requestedVariant = query.variant;
  const variant = Array.isArray(requestedVariant) ? requestedVariant[0] : requestedVariant;

  if (process.env.NODE_ENV === 'development' && isActOnePrototypeVariant(variant)) {
    return <ActOneUiPrototype locale={selectedLocale} variant={variant} />;
  }

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
