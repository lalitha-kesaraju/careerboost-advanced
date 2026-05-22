import React, { useState } from 'react';
import SetupScreen from './components/SetupScreen';
import InterviewScreen from './components/InterviewScreen';
import AnalysisScreen from './components/AnalysisScreen';
import ReadyScreen from './components/ReadyScreen';
import { AppState, InterviewData, AnalysisReport } from './types';
import { generateAnalysis } from './services/geminiService';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.SETUP);
  const [interviewData, setInterviewData] = useState<InterviewData | null>(null);
  const [analysisReport, setAnalysisReport] = useState<AnalysisReport | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState<boolean>(false);

  const handleStartInterview = (data: InterviewData) => {
    setInterviewData(data);
    setAppState(AppState.READY);
  };

  const handleConfirmStart = () => {
    setAppState(AppState.INTERVIEW);
  };

  const handleFinishInterview = async (transcript: string, recordingUrl: string | null) => {
    if (!interviewData) return;
    setAppState(AppState.ANALYSIS);
    setIsLoadingAnalysis(true);
    setAnalysisError(null);
    try {
      const fullInterviewData = { ...interviewData, transcript, recordingUrl };
      setInterviewData(fullInterviewData);
      const report = await generateAnalysis(fullInterviewData.resume, fullInterviewData.jobRole, transcript);
      setAnalysisReport(report);
    } catch (error) {
      console.error("Error generating analysis:", error);
      setAnalysisError("Failed to generate the analysis report. Please try again.");
    } finally {
      setIsLoadingAnalysis(false);
    }
  };

  const handleRestart = () => {
    setAppState(AppState.SETUP);
    setInterviewData(null);
    setAnalysisReport(null);
    setAnalysisError(null);
    setIsLoadingAnalysis(false);
  };

  const renderContent = () => {
    switch (appState) {
      case AppState.SETUP:
        return <SetupScreen onStart={handleStartInterview} />;
      case AppState.READY:
        if (!interviewData) return <SetupScreen onStart={handleStartInterview} />;
        return <ReadyScreen onStart={handleConfirmStart} interviewData={interviewData} />;
      case AppState.INTERVIEW:
        if (!interviewData) return <SetupScreen onStart={handleStartInterview} />;
        return <InterviewScreen interviewData={interviewData} onFinish={handleFinishInterview} />;
      case AppState.ANALYSIS:
        return (
          <AnalysisScreen
            report={analysisReport}
            isLoading={isLoadingAnalysis}
            error={analysisError}
            onRestart={handleRestart}
            interviewData={interviewData}
          />
        );
      default:
        return <SetupScreen onStart={handleStartInterview} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4 font-sans">
      <div className="w-full max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-sky-400 to-indigo-500 text-transparent bg-clip-text">
            AI Mock Interviewer
          </h1>
          <p className="text-slate-400 mt-2">Your personal AI-powered interview coach.</p>
        </header>
        <main className="bg-slate-800 rounded-2xl shadow-2xl p-6 md:p-8">
          {renderContent()}
        </main>
        <footer className="text-center mt-8 text-slate-500 text-sm">
            <p>Powered by Google Gemini</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
