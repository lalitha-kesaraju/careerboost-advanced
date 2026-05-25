import React, { useEffect, useState } from 'react';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../App';
import { AnalysisReport, InterviewData } from '../../types';
import { BarChart2, TrendingUp, TrendingDown, ArrowLeft, Target, Flame, Star } from 'lucide-react';

interface StoredInterview {
  id: string;
  createdAt: any;
  interviewData: InterviewData;
  analysis?: AnalysisReport;
}

interface Props {
  onBack: () => void;
}

const AREA_COLORS: Record<string, string> = {
  'Technical Knowledge': 'bg-blue-500',
  'Communication Skills': 'bg-blue-600',
  'Problem-Solving': 'bg-emerald-500',
  'HR & Behavioral': 'bg-amber-500',
  'Confidence & Presence': 'bg-rose-500',
};

const AnalyticsDashboard: React.FC<Props> = ({ onBack }) => {
  const { user } = useAuth();
  const [interviews, setInterviews] = useState<StoredInterview[]>([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<7 | 30 | 90>(30);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      setLoading(true);
      try {
        const q = query(collection(db, 'users', user.uid, 'interviews'), orderBy('createdAt', 'asc'));
        const snap = await getDocs(q);
        setInterviews(snap.docs.map(d => ({ id: d.id, ...d.data() } as StoredInterview)));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [user]);

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - range);

  const filtered = interviews.filter(iv => {
    const d = iv.createdAt?.toDate?.() ?? new Date(iv.createdAt);
    return d >= cutoff;
  });

  const analyzed = filtered.filter(iv => iv.analysis);

  // Metrics
  const avgScore = analyzed.length
    ? +(analyzed.reduce((s, iv) => s + (iv.analysis!.overall_score ?? 0), 0) / analyzed.length).toFixed(1)
    : 0;

  const trend = (() => {
    if (analyzed.length < 2) return 0;
    const half = Math.ceil(analyzed.length / 2);
    const first = analyzed.slice(0, half).reduce((s, iv) => s + (iv.analysis!.overall_score ?? 0), 0) / half;
    const second = analyzed.slice(half).reduce((s, iv) => s + (iv.analysis!.overall_score ?? 0), 0) / (analyzed.length - half);
    return +(second - first).toFixed(1);
  })();

  // Score by area
  const areaScores: Record<string, { total: number; count: number }> = {};
  analyzed.forEach(iv => {
    iv.analysis!.performance_feedback?.forEach(pf => {
      if (!areaScores[pf.area]) areaScores[pf.area] = { total: 0, count: 0 };
      areaScores[pf.area].total += pf.score;
      areaScores[pf.area].count++;
    });
  });

  const areaAvgs = Object.entries(areaScores).map(([area, { total, count }]) => ({
    area,
    avg: +(total / count).toFixed(1),
  })).sort((a, b) => a.avg - b.avg);

  const weakest = areaAvgs.slice(0, 2);
  const strongest = areaAvgs.slice(-2).reverse();

  // Score trend last N sessions
  const trendData = analyzed.slice(-10).map((iv, i) => ({
    label: `#${i + 1}`,
    score: iv.analysis!.overall_score ?? 0,
    role: iv.interviewData?.jobRole ?? 'Interview',
  }));

  const maxScore = 10;

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
            <BarChart2 className="w-6 h-6 text-blue-700" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-gray-900">Analytics</h2>
            <p className="text-sm text-gray-500">{analyzed.length} analyzed sessions in last {range} days</p>
          </div>
        </div>
      </div>

      {/* Range filter */}
      <div className="flex gap-2">
        {([7, 30, 90] as const).map(r => (
          <button
            key={r}
            onClick={() => setRange(r)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${range === r ? 'bg-blue-700 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            {r}d
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-blue-700 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : analyzed.length === 0 ? (
        <div className="text-center py-20">
          <BarChart2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">No analyzed interviews in this range</p>
          <p className="text-sm text-gray-400 mt-1">Complete interviews with analysis to see trends</p>
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
              <div className="text-xs text-gray-500 font-medium mb-1">Interviews</div>
              <div className="text-3xl font-black text-blue-700">{analyzed.length}</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
              <div className="text-xs text-gray-500 font-medium mb-1">Avg Score</div>
              <div className={`text-3xl font-black ${avgScore >= 7 ? 'text-emerald-600' : avgScore >= 5 ? 'text-amber-600' : 'text-rose-600'}`}>{avgScore}/10</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
              <div className="text-xs text-gray-500 font-medium mb-1">Trend</div>
              <div className={`text-3xl font-black flex items-center gap-1 ${trend >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {trend >= 0 ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
                {trend >= 0 ? `+${trend}` : trend}
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
              <div className="text-xs text-gray-500 font-medium mb-1">Best</div>
              <div className="text-3xl font-black text-amber-500 flex items-center gap-1">
                <Star className="w-5 h-5" />
                {Math.max(...analyzed.map(iv => iv.analysis!.overall_score ?? 0))}/10
              </div>
            </div>
          </div>

          {/* Score Trend Chart */}
          {trendData.length >= 2 && (
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
              <h3 className="font-black text-gray-900 mb-4 text-sm uppercase tracking-wider">Score Trend (last {trendData.length} sessions)</h3>
              <div className="flex items-end gap-2 h-32">
                {trendData.map((d, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[10px] font-bold text-gray-600">{d.score}</span>
                    <div
                      className="w-full rounded-t-lg transition-all duration-500"
                      style={{
                        height: `${(d.score / maxScore) * 100}%`,
                        background: d.score >= 7 ? '#10b981' : d.score >= 5 ? '#f59e0b' : '#ef4444',
                      }}
                    />
                    <span className="text-[9px] text-gray-400 font-mono">{d.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Area Breakdown */}
          {areaAvgs.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
              <h3 className="font-black text-gray-900 mb-4 text-sm uppercase tracking-wider">Performance by Area</h3>
              <div className="space-y-3">
                {areaAvgs.map(({ area, avg }) => (
                  <div key={area}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-semibold text-gray-700">{area}</span>
                      <span className={`text-sm font-black ${avg >= 7 ? 'text-emerald-600' : avg >= 5 ? 'text-amber-600' : 'text-rose-600'}`}>{avg}/10</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${AREA_COLORS[area] ?? 'bg-blue-500'}`}
                        style={{ width: `${(avg / 10) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Focus areas */}
          {weakest.length > 0 && (
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Target className="w-5 h-5 text-rose-600" />
                  <span className="font-black text-rose-700 text-sm uppercase tracking-wider">Focus Areas</span>
                </div>
                {weakest.map(({ area, avg }) => (
                  <div key={area} className="flex items-center justify-between py-1">
                    <span className="text-sm text-rose-800 font-medium">{area}</span>
                    <span className="text-sm font-black text-rose-600">{avg}/10</span>
                  </div>
                ))}
              </div>
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Flame className="w-5 h-5 text-emerald-600" />
                  <span className="font-black text-emerald-700 text-sm uppercase tracking-wider">Strengths</span>
                </div>
                {strongest.map(({ area, avg }) => (
                  <div key={area} className="flex items-center justify-between py-1">
                    <span className="text-sm text-emerald-800 font-medium">{area}</span>
                    <span className="text-sm font-black text-emerald-600">{avg}/10</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AnalyticsDashboard;
