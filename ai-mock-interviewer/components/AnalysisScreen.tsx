
import React from 'react';
import { AnalysisReport, InterviewData } from '../types';
import SpinnerIcon from './icons/SpinnerIcon';

interface AnalysisScreenProps {
  report: AnalysisReport | null;
  isLoading: boolean;
  error: string | null;
  onRestart: () => void;
  interviewData: InterviewData | null;
}

const ScoreBadge: React.FC<{ score: number }> = ({ score }) => {
  const getColor = (s: number) => {
    if (s >= 8) return 'bg-green-500/20 text-green-300 border-green-400';
    if (s >= 5) return 'bg-yellow-500/20 text-yellow-300 border-yellow-400';
    return 'bg-red-500/20 text-red-300 border-red-400';
  };
  return (
    <span className={`px-2 py-1 text-xs font-bold rounded-full border ${getColor(score)}`}>
      {score}/10
    </span>
  );
};

const AnalysisScreen: React.FC<AnalysisScreenProps> = ({ report, isLoading, error, onRestart, interviewData }) => {
  if (isLoading) {
    return (
      <div className="text-center py-16 flex flex-col items-center animate-fade-in">
        <SpinnerIcon className="animate-spin h-12 w-12 text-sky-400 mb-4" />
        <h2 className="text-2xl font-semibold text-slate-100">Analyzing Your Performance...</h2>
        <p className="text-slate-400 mt-2">Our AI is reviewing your responses, communication, and technical expertise.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16 animate-fade-in">
        <h2 className="text-2xl font-semibold text-red-400">Analysis Failed</h2>
        <p className="text-slate-400 mt-2">{error}</p>
        <button
          onClick={onRestart}
          className="mt-6 bg-indigo-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-indigo-500 transition"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="text-center py-16 animate-fade-in">
        <h2 className="text-2xl font-semibold">No analysis report available.</h2>
        <button
          onClick={onRestart}
          className="mt-6 bg-indigo-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-indigo-500 transition"
        >
          Start New Interview
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-sky-400 to-indigo-500 text-transparent bg-clip-text">
          Interview Report
        </h2>
        {interviewData?.recordingUrl && (
            <div className="my-6">
                <h3 className="text-lg font-semibold text-slate-200 mb-2">Interview Recording</h3>
                <video controls src={interviewData.recordingUrl} className="w-full rounded-lg">
                    Your browser does not support the video element.
                </video>
            </div>
        )}
        <p className="text-slate-300">{report.overall_summary}</p>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-semibold text-slate-200 mb-4 border-b-2 border-slate-700 pb-2">Performance Feedback</h3>
          <div className="space-y-4">
            {report.performance_feedback.map((item, index) => (
              <div key={index} className="bg-slate-700/50 p-4 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-sky-300">{item.area}</h4>
                  <ScoreBadge score={item.score} />
                </div>
                <p className="text-slate-400 text-sm">{item.feedback}</p>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <h3 className="text-xl font-semibold text-slate-200 mb-4 border-b-2 border-slate-700 pb-2">Facial Expression Analysis (Inferred)</h3>
           <div className="space-y-4">
            {report.facial_expression_analysis.map((item, index) => (
               <div key={index} className="bg-slate-700/50 p-4 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-purple-300">{item.expression}</h4>
                  <ScoreBadge score={item.score} />
                </div>
                <p className="text-slate-400 text-sm italic">"{item.justification}"</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-slate-200 mb-4 border-b-2 border-slate-700 pb-2">Vocal Emotional Analysis</h3>
           <div className="space-y-4">
            {report.emotional_analysis.map((item, index) => (
               <div key={index} className="bg-slate-700/50 p-4 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-green-300">{item.emotion}</h4>
                  <ScoreBadge score={item.score} />
                </div>
                <p className="text-slate-400 text-sm italic">"{item.justification}"</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-slate-200 mb-4 border-b-2 border-slate-700 pb-2">Suggestions for Improvement</h3>
           <ul className="space-y-3 list-disc list-inside text-slate-300 bg-slate-700/50 p-4 rounded-lg">
            {report.improvement_suggestions.map((suggestion, index) => (
               <li key={index} className="pl-2">{suggestion}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="text-center pt-6">
        <button
          onClick={onRestart}
          className="bg-indigo-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-indigo-500 transition-transform transform hover:scale-105 shadow-lg"
        >
          Start New Interview
        </button>
      </div>
    </div>
  );
};

export default AnalysisScreen;