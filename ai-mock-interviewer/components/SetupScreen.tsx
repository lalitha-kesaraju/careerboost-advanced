import React, { useState } from 'react';
import { InterviewData } from '../types';
import SpinnerIcon from './icons/SpinnerIcon';

// Add declarations for window-injected libraries to avoid TypeScript errors.
declare global {
  interface Window {
    mammoth: any;
    'pdfjs-dist/build/pdf': any;
  }
}

interface SetupScreenProps {
  onStart: (data: InterviewData) => void;
}

const SetupScreen: React.FC<SetupScreenProps> = ({ onStart }) => {
  const [userName, setUserName] = useState('');
  const [jobRole, setJobRole] = useState('');
  const [timeLimit, setTimeLimit] = useState(10);
  const [resumeText, setResumeText] = useState('');
  const [fileName, setFileName] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setResumeText('');
      setFileName('');
      return;
    }

    setIsParsing(true);
    setFileName(file.name);
    setError('');

    try {
      if (file.type === 'application/pdf') {
        const pdfjsLib = window['pdfjs-dist/build/pdf'];
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js`;
        const reader = new FileReader();
        reader.onload = async (e) => {
          try {
            const data = new Uint8Array(e.target?.result as ArrayBuffer);
            const pdf = await pdfjsLib.getDocument({ data }).promise;
            let content = '';
            for (let i = 1; i <= pdf.numPages; i++) {
              const page = await pdf.getPage(i);
              const textContent = await page.getTextContent();
              content += textContent.items.map((item: any) => item.str).join(' ');
            }
            setResumeText(content);
          } catch (err) {
             setError(`Error parsing PDF file. Please ensure it's not corrupted.`);
             setFileName('');
          } finally {
            setIsParsing(false);
          }
        };
        reader.readAsArrayBuffer(file);
      } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        const reader = new FileReader();
        reader.onload = async (e) => {
          try {
            const arrayBuffer = e.target?.result as ArrayBuffer;
            const result = await window.mammoth.extractRawText({ arrayBuffer });
            setResumeText(result.value);
          } catch (err) {
            setError('Error parsing DOCX file. Please try another file.');
            setFileName('');
          } finally {
            setIsParsing(false);
          }
        };
        reader.readAsArrayBuffer(file);
      } else if (file.type === 'text/plain') {
        const text = await file.text();
        setResumeText(text);
        setIsParsing(false);
      } else {
        setError("Unsupported file type. Please upload .txt, .pdf, or .docx");
        setFileName('');
        setIsParsing(false);
      }
    } catch (err) {
      console.error("Error parsing file:", err);
      setError(`Failed to read ${file.name}. Please try a different file.`);
      setResumeText('');
      setFileName('');
      setIsParsing(false);
    }
  };

  const handleStart = () => {
    if (!userName.trim()) {
      setError('Please enter your name.');
      return;
    }
    if (!jobRole.trim()) {
      setError('Please enter a job role.');
      return;
    }
    const parsedTime = Number(timeLimit);
    if (isNaN(parsedTime) || parsedTime < 1 || parsedTime > 20) {
      setError('Please set a time limit between 1 and 20 minutes.');
      return;
    }
    setError('');
    onStart({
      userName,
      jobRole,
      timeLimit: parsedTime,
      resume: resumeText,
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-semibold text-slate-100">Prepare for Your Interview</h2>
        <p className="text-slate-400 mt-1">Configure the settings for your mock interview session.</p>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="userName" className="block text-sm font-medium text-slate-300 mb-1">
            Your Name
          </label>
          <input
            type="text"
            id="userName"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            className="w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="e.g., Jane Doe"
          />
        </div>

        <div>
          <label htmlFor="jobRole" className="block text-sm font-medium text-slate-300 mb-1">
            Job Role
          </label>
          <input
            type="text"
            id="jobRole"
            value={jobRole}
            onChange={(e) => setJobRole(e.target.value)}
            className="w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="e.g., Software Engineer"
          />
        </div>

        <div>
          <label htmlFor="timeLimit" className="block text-sm font-medium text-slate-300 mb-1">
            Interview Time Limit (1-20 minutes)
          </label>
          <input
            type="number"
            id="timeLimit"
            value={timeLimit}
            onChange={(e) => setTimeLimit(parseInt(e.target.value, 10))}
            min="1"
            max="20"
            className="w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label htmlFor="resume" className="block text-sm font-medium text-slate-300 mb-1">
            Upload Resume (Optional)
          </label>
          <input
            type="file"
            id="resume"
            onChange={handleFileChange}
            accept=".txt,.pdf,.docx"
            className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500"
          />
          {isParsing && (
            <div className="flex items-center text-sm text-sky-400 mt-2">
              <SpinnerIcon className="animate-spin h-4 w-4 mr-2" />
              Parsing {fileName}...
            </div>
          )}
          {!isParsing && fileName && !error && (
            <p className="text-sm text-green-400 mt-2">Successfully loaded {fileName}.</p>
          )}
        </div>
      </div>
      
      {error && <p className="text-red-400 text-sm text-center">{error}</p>}

      <div className="pt-2">
        <button
          onClick={handleStart}
          disabled={isParsing}
          className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-500 transition-transform transform hover:scale-105 shadow-lg disabled:bg-slate-600 disabled:cursor-not-allowed"
        >
          {isParsing ? 'Processing Resume...' : 'Start Interview'}
        </button>
      </div>
    </div>
  );
};

export default SetupScreen;