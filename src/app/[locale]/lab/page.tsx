import { HomeExperience } from '../../../components/HomeExperience';
import { isLocale } from '../../../i18n/locale';
import { EXAMPLE_CASE_ID, SURVEY_CASES } from '../../../shared/example';

export default async function LabPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const selectedLocale = isLocale(locale) ? locale : 'en';
  return (
    <HomeExperience
      locale={selectedLocale}
      allocationHref={`/${selectedLocale}/cases/${EXAMPLE_CASE_ID}`}
      questions={SURVEY_CASES.map(({ key, allocationId, caseData, owners }) => ({ key, allocationId, caseData, owners }))}
    />
  );
}
