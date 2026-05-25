import React, { useEffect, useState } from 'react';
import { collection, getDocs, orderBy, query, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../App';
import { AnalysisReport, InterviewData } from '../../types';
import { History, Star, Trash2, ArrowLeft, ChevronRight, Calendar, Clock, Building2, Award } from 'lucide-react';

interface StoredInterview {
  id: string;
  createdAt: any;
  interviewData: InterviewData;
  analysis?: AnalysisReport;
  transcript?: string;
}

interface Props {
  onBack: () => void;
  onViewAnalysis: (analysis: AnalysisReport, interviewData: InterviewData) => void;
}

const SCORE_COLOR = (s: number) =>
  s >= 8 ? 'text-emerald-600' : s >= 6 ? 'text-amber-600' : 'text-rose-600';

const SCORE_BG = (s: number) =>
  s >= 8 ? 'bg-emerald-50 border-emerald-200' : s >= 6 ? 'bg-amber-50 border-amber-200' : 'bg-rose-50 border-rose-200';

const InterviewHistoryPanel: React.FC<Props> = ({ onBack, onViewAnalysis }) => {
  const { user } = useAuth();
  const [interviews, setInterviews] = useState<StoredInterview[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'week' | 'month'>('all');
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const fetchInterviews = async () => {
      setLoading(true);
      try {
        const q = query(collection(db, 'users', user.uid, 'interviews'), orderBy('createdAt', 'desc'));
        const snap = await getDocs(q);
        const items: StoredInterview[] = snap.docs.map(d => ({ id: d.id, ...d.data() } as StoredInterview));
        setInterviews(items);
      } catch (e) {
        console.error('Failed to load history:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchInterviews();
  }, [user]);

  const filtered = interviews.filter(iv => {
    if (filter === 'all') return true;
    const date = iv.createdAt?.toDate?.() ?? new Date(iv.createdAt);
    const now = new Date();
    if (filter === 'week') {
      const week = new Date(); week.setDate(now.getDate() - 7);
      return date >= week;
    }
    if (filter === 'month') {
      const month = new Date(); month.setMonth(now.getMonth() - 1);
      return date >= month;
    }
    return true;
  });

  const handleDelete = async (id: string) => {
    if (!user) return;
    setDeleting(id);
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'interviews', id));
      setInterviews(prev => prev.filter(iv => iv.id !== id));
    } catch (e) {
      console.error('Delete failed:', e);
    } finally {
      setDeleting(null);
    }
  };

  const formatDate = (ts: any) => {
    if (!ts) return '—';
    const d = ts?.toDate?.() ?? new Date(ts);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const avgScore = interviews.length
    ? Math.round(interviews.reduce((s, iv) => s + (iv.analysis?.overall_score ?? 0), 0) / interviews.length * 10) / 10
    : 0;

  const bestScore = interviews.length
    ? Math.max(...interviews.map(iv => iv.analysis?.overall_score ?? 0))
    : 0;

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6 pb-32">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors">
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm font-medium">Back</span>
        </button>
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-blue-100 rounded-2xl flex items-center justify-center">
            <History className="w-6 h-6 text-blue-700" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-gray-900">Interview History</h2>
            <p className="text-sm text-gray-500">{interviews.length} sessions recorded</p>
          </div>
        </div>
      </div>

      {/* Stats row */}
      {interviews.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white border border-gray-200 rounded-2xl p-4 text-center shadow-sm">
            <div className="text-3xl font-black text-blue-700">{interviews.length}</div>
            <div className="text-xs text-gray-500 mt-1 font-medium">Total Sessions</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl p-4 text-center shadow-sm">
            <div className={`text-3xl font-black ${SCORE_COLOR(avgScore)}`}>{avgScore > 0 ? `${avgScore}/10` : '—'}</div>
            <div className="text-xs text-gray-500 mt-1 font-medium">Avg Score</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl p-4 text-center shadow-sm">
            <div className={`text-3xl font-black ${SCORE_COLOR(bestScore)}`}>{bestScore > 0 ? `${bestScore}/10` : '—'}</div>
            <div className="text-xs text-gray-500 mt-1 font-medium flex items-center justify-center gap-1"><Award className="w-3 h-3" /> Best Score</div>
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="flex gap-2">
        {(['all', 'week', 'month'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold capitalize transition-all ${filter === f ? 'bg-blue-700 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            {f === 'all' ? 'All Time' : f === 'week' ? 'This Week' : 'This Month'}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-blue-700 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <History className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">No interviews found</p>
          <p className="text-sm text-gray-400 mt-1">Complete an interview to see your history here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(iv => {
            const score = iv.analysis?.overall_score ?? 0;
            const date = formatDate(iv.createdAt);
            return (
              <div key={iv.id} className={`bg-white border rounded-2xl p-4 shadow-sm flex items-center gap-4 group ${SCORE_BG(score)}`}>
                {/* Score badge */}
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center font-black text-lg shrink-0 ${SCORE_COLOR(score)} bg-white border`}>
                  {score > 0 ? score : '—'}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-gray-900 text-sm truncate">{iv.interviewData?.jobRole ?? 'Interview'}</span>
                    {iv.interviewData?.isPracticeMode && (
                      <span className="text-[10px] px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full font-bold uppercase tracking-wider">Practice</span>
                    )}
                    {iv.interviewData?.difficultyLevel && (
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${iv.interviewData.difficultyLevel === 'hard' ? 'bg-rose-100 text-rose-700' : iv.interviewData.difficultyLevel === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                        {iv.interviewData.difficultyLevel}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 flex-wrap">
                    {iv.interviewData?.dreamCompany && (
                      <span className="flex items-center gap-1"><Building2 className="w-3 h-3" />{iv.interviewData.dreamCompany}</span>
                    )}
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{date}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{iv.interviewData?.timeLimit ?? '?'} min</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {iv.analysis && (
                    <button
                      onClick={() => onViewAnalysis(iv.analysis!, iv.interviewData)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition-colors"
                    >
                      View <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(iv.id)}
                    disabled={deleting === iv.id}
                    className="p-2 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
                  >
                    {deleting === iv.id
                      ? <div className="w-4 h-4 border-2 border-rose-400 border-t-transparent rounded-full animate-spin" />
                      : <Trash2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default InterviewHistoryPanel;
