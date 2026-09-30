import { isLocale } from '../../i18n/locale';
import { EXAMPLE_CASE_ID, SURVEY_CASES } from '../../shared/example';
import { HomeExperience } from '../../components/HomeExperience';

export default async function LocalePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const l = isLocale(locale) ? locale : 'en';
  return <HomeExperience
    locale={l}
    allocationHref={`/${l}/cases/${EXAMPLE_CASE_ID}`}
    questions={SURVEY_CASES.map(({ key, allocationId, caseData, owners }) => ({ key, allocationId, caseData, owners }))}
  />;
}
