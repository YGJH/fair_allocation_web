import { copy } from '../../i18n/copy';
import { isLocale } from '../../i18n/locale';
import { EXAMPLE_CASE_ID } from '../../shared/example';
import { HomeExperience } from '../../components/HomeExperience';

export default async function LocalePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const l = isLocale(locale) ? locale : 'en';
  const t = copy[l];

  return <HomeExperience
    allocationHref={`/${l}/cases/${EXAMPLE_CASE_ID}`}
    copy={{
      title: t.heroTitle,
      primary: t.tryExample,
      scrollCue: t.scrollCue,
      stageLabel: t.homeStageLabel,
    }}
  />;
}
