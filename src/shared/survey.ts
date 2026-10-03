export type SurveyQuestionKey = 'nonIdentical' | 'optimalTension' | 'equalButMovable' | 'identical' | 'challenge';

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
