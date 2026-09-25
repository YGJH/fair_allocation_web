import { copy } from '../../i18n/copy';
import { isLocale } from '../../i18n/locale';
import { EXAMPLE_CASE_ID } from '../../shared/example';
import { HomeExperience } from '../../components/HomeExperience';

export default async function LocalePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const l = isLocale(locale) ? locale : 'en';
  const t = copy[l];

  return <HomeExperience
    locale={l}
    allocationHref={`/${l}/cases/${EXAMPLE_CASE_ID}`}
    copy={{
      kicker: t.heroEyebrow,
      title: t.heroTitle,
      intro: t.heroIntro,
      primary: t.tryExample,
      stageLabel: t.homeStageLabel,
      stageCaption: t.homeStageCaption,
      steps: [t.stepOne, t.stepTwo, t.stepThree],
    }}
  />;
}
