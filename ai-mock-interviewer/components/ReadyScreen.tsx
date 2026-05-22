import React from 'react';
import { InterviewData } from '../types';

interface ReadyScreenProps {
  onStart: () => void;
  interviewData: InterviewData;
}

const ReadyScreen: React.FC<ReadyScreenProps> = ({ onStart, interviewData }) => {
  return (
    <div className="text-center p-4 animate-fade-in space-y-8">
      <h2 className="text-3xl font-bold text-slate-100">You're All Set!</h2>
      
      <div className="bg-slate-700/50 rounded-lg p-6 max-w-lg mx-auto text-left space-y-3">
        <h3 className="text-lg font-semibold text-sky-300 text-center mb-4">Interview Details</h3>
         <div className="flex justify-between">
            <span className="font-semibold text-slate-400">Name:</span>
            <span className="text-slate-200">{interviewData.userName}</span>
        </div>
        <div className="flex justify-between">
            <span className="font-semibold text-slate-400">Role:</span>
            <span className="text-slate-200">{interviewData.jobRole}</span>
        </div>
        <div className="flex justify-between">
            <span className="font-semibold text-slate-400">Duration:</span>
            <span className="text-slate-200">{interviewData.timeLimit} minutes</span>
        </div>
         <div className="flex justify-between">
            <span className="font-semibold text-slate-400">Resume:</span>
            <span className="text-slate-200">{interviewData.resume ? 'Uploaded' : 'Not provided'}</span>
        </div>
      </div>

      <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-6 max-w-lg mx-auto text-left space-y-3">
        <h3 className="text-lg font-semibold text-yellow-300 text-center mb-4">Instructions</h3>
        <ul className="list-disc list-inside text-slate-300 space-y-2">
            <li>Find a quiet, well-lit environment to minimize distractions.</li>
            <li>Ensure your microphone and camera are working and enabled in the browser.</li>
            <li>Speak clearly and at a natural pace, as you would in a real interview.</li>
            <li>The AI will ask you a series of questions. There will be a pause for you to answer after each one.</li>
            <li>The session is timed and will end automatically. The full video recording and transcript will be used for your performance analysis.</li>
        </ul>
      </div>

      <div className="pt-2">
        <button
          onClick={onStart}
          className="w-full max-w-xs mx-auto bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-500 transition-transform transform hover:scale-105 shadow-lg"
        >
          Begin Interview
        </button>
      </div>
    </div>
  );
};

export default ReadyScreen;