import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Upload, FileText, CheckCircle2, History, X, ArrowRight, ShieldCheck, Zap, BarChart3, Clock, TrendingUp } from 'lucide-react';
import { useAuth } from '../App';

interface ResumeUploadSectionProps {
  onNext: (data: any) => void;
}

import { parseResume } from '../services/gemini';
import * as pdfjs from 'pdfjs-dist';
import mammoth from 'mammoth';
import { doc, updateDoc, increment, setDoc, collection } from 'firebase/firestore';
import { db } from '../firebase';
import { handleFirestoreError, OperationType } from '../services/firestoreService';

// Set up PDF.js worker from CDN for reliability
pdfjs.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.min.mjs';

export function ResumeUploadSection({ onNext }: ResumeUploadSectionProps) {
  const { user, userData } = useAuth();
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [useRawText, setUseRawText] = useState(false);
  const [rawText, setRawText] = useState('');

  const stats = [
    { 
      label: 'Total Resumes', 
      value: userData?.usage?.resumeAnalyses.toString() || '0', 
      sub: 'Lifetime uploads', 
      icon: FileText, 
      color: 'text-blue-600', 
      bg: 'bg-blue-50', 
      border: 'border-blue-200' 
    },
    { 
      label: 'Successful', 
      value: userData?.usage?.resumeAnalyses.toString() || '0', 
      sub: 'Parsed successfully', 
      icon: CheckCircle2, 
      color: 'text-emerald-600', 
      bg: 'bg-emerald-50', 
      border: 'border-emerald-200' 
    },
    { 
      label: 'Failed', 
      value: '0', 
      sub: 'Upload errors', 
      icon: X, 
      color: 'text-red-600', 
      bg: 'bg-red-50', 
      border: 'border-red-200' 
    },
    { 
      label: 'Sessions', 
      value: (userData?.usage?.resumeAnalyses || 0) > 0 ? '1' : '-', 
      sub: 'Active sessions', 
      icon: Clock, 
      color: 'text-blue-700', 
      bg: 'bg-blue-50', 
      border: 'border-blue-200' 
    },
    { 
      label: 'Success Rate', 
      value: (userData?.usage?.resumeAnalyses || 0) > 0 ? '100%' : '0%', 
      sub: 'Upload success', 
      icon: TrendingUp, 
      color: 'text-orange-600', 
      bg: 'bg-orange-50', 
      border: 'border-orange-200' 
    },
  ];

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const extractTextFromPDF = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
    let fullText = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const strings = content.items.map((item: any) => item.str);
      fullText += strings.join(" ") + "\n";
    }
    return fullText;
  };

  const extractTextFromDocx = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  };

  const handleUpload = async () => {
    setIsUploading(true);
    let text = rawText;
    
    if (!useRawText) {
      if (!file) {
        setIsUploading(false);
        return;
      }
      try {
        if (file.type === 'application/pdf') {
          text = await extractTextFromPDF(file);
        } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
          text = await extractTextFromDocx(file);
        } else {
          text = await file.text();
        }
      } catch (err) {
        console.error("File extraction error:", err);
        alert("Failed to extract text from file. Please try pasting the text manually.");
        setUseRawText(true);
        setIsUploading(false);
        return;
      }
    }

    console.log("Extracted text length:", text?.trim().length || 0);
    
    if (!text || text.trim().length < 30) {
      const currentLength = text?.trim().length || 0;
      alert(`The extracted text from your file is too short (${currentLength} characters). 
      
Please ensure you are uploading a valid resume (PDF, Word, or Text). If the file is an image or contains mostly binary data, our system cannot read it. 

You can also try using the "Paste Text" tab to manually provide your resume content.`);
      setIsUploading(false);
      return;
    }

    // Check for binary garbage (heuristic)
    const nonPrintableRatio = (text.match(/[^\x20-\x7E\s]/g) || []).length / text.length;
    if (nonPrintableRatio > 0.3) {
      alert("The uploaded file appears to be binary or encrypted. Please upload a standard text-based PDF or Word document, or use the 'Paste Text' option.");
      setIsUploading(false);
      return;
    }

    try {
      const parsedData = await parseResume(text);
      
      if (!parsedData || Object.keys(parsedData).length === 0) {
        throw new Error("AI returned empty data. The resume might be unreadable or too complex.");
      }

      // Increment usage in Firestore and save resume doc (non-blocking)
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        const resumeRef = doc(collection(db, 'users', user.uid, 'resumes'));
        
        // We run this in the background so it doesn't block the UI transition
        Promise.all([
          updateDoc(userRef, {
            'usage.resumeAnalyses': increment(1)
          }),
          setDoc(resumeRef, {
            ...parsedData,
            uploadedAt: new Date(),
            fileName: file?.name || 'Manual Paste'
          })
        ]).catch(error => {
          console.error("Failed to save resume session to history:", error);
          // We don't alert here to avoid interrupts if the analysis itself worked
        });
      }
      
      // Move to next step immediately after AI succeeds
      onNext(parsedData);
    } catch (err) {
      console.error("AI Parsing Error:", err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      alert(`Critical Analysis Error: ${errorMessage}\n\nPlease ensure your Gemini API key is valid and you have an active internet connection.`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-12">
      {/* Top Activity Stats */}
      <section>
        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
           <span className="text-2xl">📊</span> Your Activity
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
           {stats.map((stat, i) => (
             <div key={i} className={`p-6 bg-white rounded-2xl border-l-4 ${stat.border} shadow-sm hover:shadow-md transition-shadow`}>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">{stat.label}</span>
                    <span className="text-3xl font-black text-gray-900 mt-1">{stat.value}</span>
                  </div>
                  <stat.icon className={`w-5 h-5 ${stat.color} opacity-40`} />
                </div>
                <p className="text-[10px] text-gray-600 font-medium">{stat.sub}</p>
             </div>
           ))}
        </div>
      </section>

      {/* Progress Bar */}
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-2">
           <div className="flex flex-col items-center">
             <div className="w-10 h-10 rounded-full bg-blue-700 flex items-center justify-center text-white shadow-lg shadow-blue-100 z-10">
               <span className="font-bold">1</span>
             </div>
             <span className="text-xs font-bold text-blue-700 mt-2 uppercase tracking-widest">Upload</span>
           </div>
           <div className="flex-1 h-1 bg-gray-200 mx-4 -mt-6" />
           <div className="flex flex-col items-center">
             <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 z-10 cursor-not-allowed">
               <span className="font-bold">2</span>
             </div>
             <span className="text-xs font-bold text-gray-400 mt-2 uppercase tracking-widest">Review</span>
           </div>
           <div className="flex-1 h-1 bg-gray-200 mx-4 -mt-6" />
           <div className="flex flex-col items-center">
             <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 z-10 cursor-not-allowed">
               <span className="font-bold">3</span>
             </div>
             <span className="text-xs font-bold text-gray-400 mt-2 uppercase tracking-widest">Analysis</span>
           </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto pt-10">
        <div className="text-center mb-10">
          <h2 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">Start Your Analysis</h2>
          <p className="text-gray-600 italic serif text-lg opacity-80">Upload your resume to get deep AI insights into your career path.</p>
        </div>

        <div className="flex gap-4 mb-8">
          <button 
            onClick={() => setUseRawText(false)}
            className={`flex-1 py-4 rounded-xl font-bold text-sm transition-all ${!useRawText ? 'bg-blue-700 text-white shadow-lg shadow-blue-100' : 'bg-white text-gray-600 border border-gray-100'}`}
          >
            File Upload
          </button>
          <button 
            onClick={() => setUseRawText(true)}
            className={`flex-1 py-4 rounded-xl font-bold text-sm transition-all ${useRawText ? 'bg-blue-700 text-white shadow-lg shadow-blue-100' : 'bg-white text-gray-600 border border-gray-100'}`}
          >
            Paste Text
          </button>
        </div>

        {!useRawText ? (
          <div 
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`relative border-2 border-dashed rounded-[2.5rem] p-16 transition-all duration-300 flex flex-col items-center justify-center gap-6 ${
              dragActive 
                ? 'border-blue-700 bg-blue-50/50 scale-[1.02]' 
                : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-gray-50/30'
            }`}
          >
            <div className="w-24 h-24 bg-blue-700 rounded-3xl flex items-center justify-center text-white shadow-2xl shadow-blue-200 mb-2">
              {file ? <FileText className="w-10 h-10" /> : <Upload className="w-10 h-10" />}
            </div>
            
            <div className="text-center">
              <h4 className="text-xl font-bold text-gray-900 mb-1">
                {file ? file.name : 'Choose a file or drag it here'}
              </h4>
              <p className="text-sm text-gray-600 font-medium">PDf, DocX or TXT (Max. 10MB)</p>
            </div>

            <input 
              type="file" 
              className="absolute inset-0 opacity-0 cursor-pointer" 
              onChange={(e) => e.target.files && setFile(e.target.files[0])}
              accept=".pdf,.docx,.txt"
            />
          </div>
        ) : (
          <textarea 
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            placeholder="Paste your resume text here..."
            className="w-full h-64 bg-white border border-gray-100 rounded-[2rem] p-8 text-sm font-medium focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 outline-none transition-all resize-none shadow-sm"
          />
        )}

        {(file || (useRawText && rawText)) && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-10"
          >
            <button 
              onClick={() => {
                if (useRawText && (!rawText || rawText.trim().length < 30)) {
                  alert("Please paste at least 30 characters of your resume content.");
                  return;
                }
                if (!useRawText && !file) {
                  alert("Please select a file to upload.");
                  return;
                }
                handleUpload();
              }}
              disabled={isUploading}
              className="w-full bg-[#1A1A1A] text-white py-5 px-8 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-black transition-all shadow-xl disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <Zap className="w-5 h-5 text-yellow-400 animate-pulse" />
                  AI is Parsing...
                </>
              ) : (
                <>
                  Begin Analysis
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </motion.div>
        )}

        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-6 opacity-60">
           <div className="flex items-start gap-3">
              <div className="p-2 bg-emerald-50 rounded-lg">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-1">Privacy First</p>
                <p className="text-[10px] text-gray-500 leading-tight">Your data is encrypted and used only for your private analysis.</p>
              </div>
           </div>
           <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <BarChart3 className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-1">Deep Analysis</p>
                <p className="text-[10px] text-gray-500 leading-tight">We analyze over 200+ data points for a complete career score.</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}


