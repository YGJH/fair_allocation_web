export type SurveyQuestionKey = 'identical' | 'nonIdentical' | 'challenge';

export type SurveyQuestionResult = {
  allocationId: string;
  total: number;
  fair: number;
  unfair: number;
  fairPercent: number | null;
  userVerdict: boolean | null;
};

export type SurveySummary = {
  answered: number;
  totalQuestions: number;
  questions: SurveyQuestionResult[];
};
