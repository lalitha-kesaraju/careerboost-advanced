// Real-Time Feedback Service
// Tracks speech patterns and provides instant feedback during interviews

export interface SpeechMetrics {
  wordsPerMinute: number;
  fillerWordsCount: number;
  pauseCount: number;
  sentimentScore: number;
  confidence: number;
  clarity: number;
}

export interface FeedbackIndicator {
  type: 'pace' | 'filler' | 'pause' | 'confidence' | 'clarity';
  level: 'good' | 'warning' | 'critical';
  message: string;
  suggestion?: string;
}

const FILLER_WORDS = new Set([
  'um', 'uh', 'like', 'you know', 'basically', 'actually', 'literally',
  'so', 'right', 'ok', 'okay', 'yeah', 'hmm', 'er', 'ah', 'well', 'kind of', 'sort of',
]);

const POSITIVE_WORDS = ['excellent', 'great', 'good', 'best', 'successful', 'achieved', 'improved', 'delivered', 'built', 'led', 'designed', 'optimized'];
const NEGATIVE_WORDS  = ['bad', 'worst', 'failed', 'difficult', 'problem', 'issue', 'mistake', 'wrong', 'never'];

export class RealTimeFeedbackAnalyzer {
  private startTime: number = 0;
  private totalWords: number = 0;
  private pauseCount: number = 0;
  private lastSpeechTime: number = 0;
  private readonly pauseThreshold = 2500; // ms

  startTracking() {
    this.startTime = Date.now();
    this.totalWords = 0;
    this.pauseCount = 0;
    this.lastSpeechTime = Date.now();
  }

  analyzeSpeech(transcript: string): SpeechMetrics {
    const words = transcript.toLowerCase().split(/\s+/).filter(w => w.length > 0);
    this.totalWords = words.length;

    const elapsedMinutes = Math.max(0.1, (Date.now() - this.startTime) / 60000);
    const wordsPerMinute = Math.round(this.totalWords / elapsedMinutes);

    const fillerWordsCount = words.filter(w => FILLER_WORDS.has(w.replace(/[.,!?;:]/g, ''))).length;

    const now = Date.now();
    if (this.lastSpeechTime > 0 && (now - this.lastSpeechTime) > this.pauseThreshold) {
      this.pauseCount++;
    }
    this.lastSpeechTime = now;

    const confidence = Math.max(0, Math.min(100, 100 - fillerWordsCount * 5 - this.pauseCount * 3));

    const uniqueWords = new Set(words).size;
    const clarity = Math.min(100, (uniqueWords / Math.max(1, words.length)) * 150);

    const positiveCount = words.filter(w => POSITIVE_WORDS.includes(w)).length;
    const negativeCount = words.filter(w => NEGATIVE_WORDS.includes(w)).length;
    const sentimentScore = Math.min(100, Math.max(0, 50 + (positiveCount - negativeCount) * 10));

    return { wordsPerMinute, fillerWordsCount, pauseCount: this.pauseCount, sentimentScore, confidence, clarity };
  }

  generateFeedback(metrics: SpeechMetrics): FeedbackIndicator[] {
    const feedback: FeedbackIndicator[] = [];

    if (metrics.wordsPerMinute < 80 && metrics.wordsPerMinute > 0) {
      feedback.push({ type: 'pace', level: 'warning', message: 'Speaking too slowly', suggestion: 'Pick up the pace slightly to maintain energy' });
    } else if (metrics.wordsPerMinute > 190) {
      feedback.push({ type: 'pace', level: 'critical', message: 'Too fast!', suggestion: 'Slow down — the interviewer needs to follow along' });
    } else if (metrics.wordsPerMinute >= 120 && metrics.wordsPerMinute <= 160) {
      feedback.push({ type: 'pace', level: 'good', message: 'Perfect pace ✓' });
    }

    if (metrics.fillerWordsCount >= 5) {
      feedback.push({ type: 'filler', level: 'critical', message: `${metrics.fillerWordsCount} filler words`, suggestion: 'Pause silently instead of saying "um" or "uh"' });
    } else if (metrics.fillerWordsCount >= 2) {
      feedback.push({ type: 'filler', level: 'warning', message: `${metrics.fillerWordsCount} filler words`, suggestion: 'Reduce "um/uh/like" for a more polished impression' });
    }

    if (metrics.confidence >= 80) {
      feedback.push({ type: 'confidence', level: 'good', message: 'High confidence ✓' });
    } else if (metrics.confidence < 50) {
      feedback.push({ type: 'confidence', level: 'warning', message: 'Low confidence detected', suggestion: 'Use assertive language and avoid hedging' });
    }

    if (metrics.clarity >= 70) {
      feedback.push({ type: 'clarity', level: 'good', message: 'Clear vocabulary ✓' });
    } else if (metrics.clarity < 40) {
      feedback.push({ type: 'clarity', level: 'warning', message: 'Low vocabulary variety', suggestion: 'Use varied, specific words instead of repeating the same terms' });
    }

    return feedback;
  }

  reset() {
    this.startTime = 0;
    this.totalWords = 0;
    this.pauseCount = 0;
    this.lastSpeechTime = 0;
  }
}

export const realTimeFeedbackAnalyzer = new RealTimeFeedbackAnalyzer();
