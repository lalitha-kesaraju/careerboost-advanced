export type BFTrait = 'EXT' | 'AGR' | 'CSN' | 'NEU' | 'OPN';

export interface BigFiveQuestion {
  id: number;
  text: string;
  trait: BFTrait;
  keyed: '+' | '-';
}

export const LIKERT_CHOICES = [
  { value: 1, label: 'Strongly Disagree' },
  { value: 2, label: 'Disagree' },
  { value: 3, label: 'Neutral' },
  { value: 4, label: 'Agree' },
  { value: 5, label: 'Strongly Agree' },
];

export const TRAIT_LABELS: Record<BFTrait, string> = {
  EXT: 'Extraversion',
  AGR: 'Agreeableness',
  CSN: 'Conscientiousness',
  NEU: 'Neuroticism',
  OPN: 'Openness',
};

export const TRAIT_DESCRIPTIONS: Record<BFTrait, string> = {
  EXT: 'Energy drawn from social interaction',
  AGR: 'Cooperation and trust towards others',
  CSN: 'Organization, discipline and goal focus',
  NEU: 'Sensitivity to stress and negative emotion',
  OPN: 'Curiosity and openness to new experiences',
};

export const TRAIT_COLORS: Record<BFTrait, string> = {
  EXT: '#6366f1', // indigo
  AGR: '#10b981', // emerald
  CSN: '#f59e0b', // amber
  NEU: '#ef4444', // red
  OPN: '#8b5cf6', // violet
};

// 50 IPIP Big Five questions with correct trait assignment and keying
// Source: kazmi066/big-five-test (questions.js), re-keyed by content analysis
export const BIG_FIVE_QUESTIONS: BigFiveQuestion[] = [
  { id: 1,  text: "I am the life of the party.",                                 trait: 'EXT', keyed: '+' },
  { id: 2,  text: "I feel little concern for others.",                           trait: 'AGR', keyed: '-' },
  { id: 3,  text: "I am always prepared.",                                       trait: 'CSN', keyed: '+' },
  { id: 4,  text: "I get stressed out easily.",                                  trait: 'NEU', keyed: '+' },
  { id: 5,  text: "I have a rich vocabulary.",                                   trait: 'OPN', keyed: '+' },
  { id: 6,  text: "I don't talk a lot.",                                         trait: 'EXT', keyed: '-' },
  { id: 7,  text: "I am interested in people.",                                  trait: 'AGR', keyed: '+' },
  { id: 8,  text: "I leave my belongings around.",                               trait: 'CSN', keyed: '-' },
  { id: 9,  text: "I am relaxed most of the time.",                              trait: 'NEU', keyed: '-' },
  { id: 10, text: "I have difficulty understanding abstract ideas.",              trait: 'OPN', keyed: '-' },
  { id: 11, text: "I feel comfortable around people.",                           trait: 'EXT', keyed: '+' },
  { id: 12, text: "I insult people.",                                            trait: 'AGR', keyed: '-' },
  { id: 13, text: "I pay attention to details.",                                 trait: 'CSN', keyed: '+' },
  { id: 14, text: "I worry about things.",                                       trait: 'NEU', keyed: '+' },
  { id: 15, text: "I have a vivid imagination.",                                 trait: 'OPN', keyed: '+' },
  { id: 16, text: "I keep in the background.",                                   trait: 'EXT', keyed: '-' },
  { id: 17, text: "I sympathize with others' feelings.",                         trait: 'AGR', keyed: '+' },
  { id: 18, text: "I make a mess of things.",                                    trait: 'CSN', keyed: '-' },
  { id: 19, text: "I seldom feel blue.",                                         trait: 'NEU', keyed: '-' },
  { id: 20, text: "I am not interested in abstract ideas.",                      trait: 'OPN', keyed: '-' },
  { id: 21, text: "I start conversations.",                                      trait: 'EXT', keyed: '+' },
  { id: 22, text: "I am not interested in other people's problems.",             trait: 'AGR', keyed: '-' },
  { id: 23, text: "I get chores done right away.",                               trait: 'CSN', keyed: '+' },
  { id: 24, text: "I am easily disturbed.",                                      trait: 'NEU', keyed: '+' },
  { id: 25, text: "I have excellent ideas.",                                     trait: 'OPN', keyed: '+' },
  { id: 26, text: "I have little to say.",                                       trait: 'EXT', keyed: '-' },
  { id: 27, text: "I have a soft heart.",                                        trait: 'AGR', keyed: '+' },
  { id: 28, text: "I often forget to put things back in their proper place.",    trait: 'CSN', keyed: '-' },
  { id: 29, text: "I get upset easily.",                                         trait: 'NEU', keyed: '+' },
  { id: 30, text: "I do not have a good imagination.",                           trait: 'OPN', keyed: '-' },
  { id: 31, text: "I talk to a lot of different people at parties.",             trait: 'EXT', keyed: '+' },
  { id: 32, text: "I like order.",                                               trait: 'CSN', keyed: '+' },
  { id: 33, text: "I change my mood a lot.",                                     trait: 'NEU', keyed: '+' },
  { id: 34, text: "I am quick to understand things.",                            trait: 'OPN', keyed: '+' },
  { id: 35, text: "I don't like to draw attention to myself.",                   trait: 'EXT', keyed: '-' },
  { id: 36, text: "I take time out for others.",                                 trait: 'AGR', keyed: '+' },
  { id: 37, text: "I shirk my duties.",                                          trait: 'CSN', keyed: '-' },
  { id: 38, text: "I have frequent mood swings.",                                trait: 'NEU', keyed: '+' },
  { id: 39, text: "I use difficult words.",                                      trait: 'OPN', keyed: '+' },
  { id: 40, text: "I don't mind being the center of attention.",                 trait: 'EXT', keyed: '+' },
  { id: 41, text: "I feel others' emotions.",                                    trait: 'AGR', keyed: '+' },
  { id: 42, text: "I follow a schedule.",                                        trait: 'CSN', keyed: '+' },
  { id: 43, text: "I get irritated easily.",                                     trait: 'NEU', keyed: '+' },
  { id: 44, text: "I spend time reflecting on things.",                          trait: 'OPN', keyed: '+' },
  { id: 45, text: "I am quiet around strangers.",                                trait: 'EXT', keyed: '-' },
  { id: 46, text: "I make people feel at ease.",                                 trait: 'AGR', keyed: '+' },
  { id: 47, text: "I am exacting in my work.",                                   trait: 'CSN', keyed: '+' },
  { id: 48, text: "I often feel blue.",                                          trait: 'NEU', keyed: '+' },
  { id: 49, text: "I am full of ideas.",                                         trait: 'OPN', keyed: '+' },
  { id: 50, text: "I feel comfortable speaking up in groups.",                   trait: 'EXT', keyed: '+' },
];

export const QUESTIONS_PER_PAGE = 10;
export const TOTAL_PAGES = Math.ceil(BIG_FIVE_QUESTIONS.length / QUESTIONS_PER_PAGE);

/** Compute OCEAN trait scores (0–100) from answers map { questionId → 1-5 }. */
export function computeOceanScores(answers: Record<number, number>): Record<BFTrait, number> {
  const sums: Record<BFTrait, { total: number; count: number }> = {
    EXT: { total: 0, count: 0 },
    AGR: { total: 0, count: 0 },
    CSN: { total: 0, count: 0 },
    NEU: { total: 0, count: 0 },
    OPN: { total: 0, count: 0 },
  };

  for (const q of BIG_FIVE_QUESTIONS) {
    const raw = answers[q.id];
    if (raw === undefined) continue;
    const scored = q.keyed === '+' ? raw : 6 - raw;
    sums[q.trait].total += scored;
    sums[q.trait].count += 1;
  }

  const result = {} as Record<BFTrait, number>;
  for (const trait of Object.keys(sums) as BFTrait[]) {
    const { total, count } = sums[trait];
    result[trait] = count > 0 ? Math.round(((total / count) - 1) / 4 * 100) : 0;
  }
  return result;
}
