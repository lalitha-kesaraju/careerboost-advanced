import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { InterviewData } from '../../types';
import SpinnerIcon from './icons/SpinnerIcon';
import {
    Layout, Mic, Sparkles, Target, Users, Building2, Briefcase, ChevronDown, List, Lightbulb, Upload, Plus, Brain, HelpCircle, ChevronRight, CheckCircle2,
    Search, User, Loader2, Link2
} from 'lucide-react';
import { parseResume } from '../../services/gemini';
import * as pdfjs from 'pdfjs-dist';
import mammoth from 'mammoth';

// Set up PDF.js worker from CDN for reliability
pdfjs.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.min.mjs';
import { getPracticeQuestions } from '../../services/gemini';

interface SetupScreenProps {
  onStart: (data: InterviewData) => void;
  resumeData?: any;
}

const ALL_LANGUAGES = [
  "English", "Hindi", "Spanish", "French", "German", "Japanese", "Mandarin", "Telugu", "Tamil", "Kannada", "Malayalam", "Bengali", "Marathi", "Gujarati", "Punjabi", "Korean", "Russian", "Arabic", "Portuguese", "Italian", "Turkish", "Vietnamese", "Thai", "Dutch", "Greek", "Hebrew", "Indonesian", "Malay", "Polish", "Swedish", "Norwegian"
];

const DETAILED_ROLES = [
  // Software Engineering
  { id: 1, title: 'Frontend Engineer', category: 'Software Engineering' },
  { id: 2, title: 'Backend Engineer', category: 'Software Engineering' },
  { id: 3, title: 'Full Stack Engineer', category: 'Software Engineering' },
  { id: 4, title: 'Mobile App Developer', category: 'Software Engineering' },
  { id: 5, title: 'DevOps Engineer', category: 'Software Engineering' },
  { id: 6, title: 'Security Engineer', category: 'Software Engineering' },
  { id: 7, title: 'QA Automation Engineer', category: 'Software Engineering' },
  { id: 8, title: 'Site Reliability Engineer', category: 'Software Engineering' },
  { id: 9, title: 'Cloud Architect', category: 'Software Engineering' },
  { id: 10, title: 'Blockchain Developer', category: 'Software Engineering' },

  // Data & AI
  { id: 11, title: 'Data Scientist', category: 'Data & AI' },
  { id: 12, title: 'Machine Learning Engineer', category: 'Data & AI' },
  { id: 13, title: 'Data Analyst', category: 'Data & AI' },
  { id: 14, title: 'AI Solutions Architect', category: 'Data & AI' },
  { id: 15, title: 'Natural Language Processing Engineer', category: 'Data & AI' },
  { id: 16, title: 'Computer Vision Engineer', category: 'Data & AI' },
  { id: 17, title: 'Data Engineer', category: 'Data & AI' },
  { id: 18, title: 'Big Data Developer', category: 'Data & AI' },

  // Business & Management
  { id: 19, title: 'Product Manager', category: 'Business & Management' },
  { id: 20, title: 'Project Manager', category: 'Business & Management' },
  { id: 21, title: 'Business Analyst', category: 'Business & Management' },
  { id: 22, title: 'Operations Manager', category: 'Business & Management' },
  { id: 23, title: 'HR Manager', category: 'Business & Management' },
  { id: 24, title: 'Marketing Manager', category: 'Business & Management' },
  { id: 25, title: 'Sales Executive', category: 'Business & Management' },
  { id: 26, title: 'Financial Analyst', category: 'Business & Management' },
  { id: 27, title: 'Customer Success Manager', category: 'Business & Management' },

  // Design & Creative
  { id: 28, title: 'UI/UX Designer', category: 'Design & Creative' },
  { id: 29, title: 'Product Designer', category: 'Design & Creative' },
  { id: 30, title: 'Graphic Designer', category: 'Design & Creative' },
  { id: 31, title: 'Video Editor', category: 'Design & Creative' },
  { id: 32, title: 'Creative Director', category: 'Design & Creative' },

  // Specialized Roles
  { id: 33, title: 'Lawyer', category: 'Specialized' },
  { id: 34, title: 'Doctor', category: 'Specialized' },
  { id: 35, title: 'Teacher', category: 'Specialized' },
  { id: 36, title: 'Mechanical Engineer', category: 'Specialized' },
  { id: 37, title: 'Civil Engineer', category: 'Specialized' },
  { id: 38, title: 'Home Based Catering', category: 'Specialized' },
  { id: 39, title: 'Digital Marketing Manager', category: 'Specialized' }
];

const DETAILED_COMPANIES = [
  // Tech Giants
  { id: 1, name: 'Google', category: 'Tech Giants' },
  { id: 2, name: 'Microsoft', category: 'Tech Giants' },
  { id: 3, name: 'Amazon', category: 'Tech Giants' },
  { id: 4, name: 'Meta', category: 'Tech Giants' },
  { id: 5, name: 'Apple', category: 'Tech Giants' },
  { id: 6, name: 'Netflix', category: 'Tech Giants' },

  // Indian Tech & IT
  { id: 7, name: 'TCS', category: 'Indian Tech' },
  { id: 8, name: 'Infosys', category: 'Indian Tech' },
  { id: 9, name: 'Wipro', category: 'Indian Tech' },
  { id: 10, name: 'HCL Technologies', category: 'Indian Tech' },
  { id: 11, name: 'Tech Mahindra', category: 'Indian Tech' },
  { id: 12, name: 'Zoho', category: 'Indian Tech' },
  { id: 13, name: 'Freshworks', category: 'Indian Tech' },

  // Startups & Unicorns
  { id: 14, name: 'Zomato', category: 'Startups & Unicorns' },
  { id: 15, name: 'Swiggy', category: 'Startups & Unicorns' },
  { id: 16, name: 'Paytm', category: 'Startups & Unicorns' },
  { id: 17, name: 'Ola', category: 'Startups & Unicorns' },
  { id: 18, name: 'CRED', category: 'Startups & Unicorns' },
  { id: 19, name: 'Byju\'s', category: 'Startups & Unicorns' },
  { id: 20, name: 'Razorpay', category: 'Startups & Unicorns' },
  { id: 21, name: 'Stripe', category: 'Startups & Unicorns' },
  { id: 22, name: 'Airbnb', category: 'Startups & Unicorns' },
  { id: 23, name: 'Uber', category: 'Startups & Unicorns' },

  // Consulting & Finance
  { id: 24, name: 'Deloitte', category: 'Consulting & Finance' },
  { id: 25, name: 'Accenture', category: 'Consulting & Finance' },
  { id: 26, name: 'McKinsey & Company', category: 'Consulting & Finance' },
  { id: 27, name: 'Boston Consulting Group', category: 'Consulting & Finance' },
  { id: 28, name: 'Goldman Sachs', category: 'Consulting & Finance' },
  { id: 29, name: 'JP Morgan Chase', category: 'Consulting & Finance' },
  { id: 30, name: 'Morgan Stanley', category: 'Consulting & Finance' },

  // Others
  { id: 31, name: 'Tesla', category: 'Automotive' },
  { id: 32, name: 'SpaceX', category: 'Aerospace & Defense' },
  { id: 33, name: 'Pfizer', category: 'Healthcare & Pharma' },
  { id: 34, name: 'Johnson & Johnson', category: 'Healthcare & Pharma' },
  { id: 35, name: 'Walmart', category: 'E-commerce & Retail' },
  { id: 36, name: 'Reliance Industries', category: 'Diversified' }
];

const SetupScreen: React.FC<SetupScreenProps> = ({ onStart, resumeData }) => {
  const [setupData, setSetupData] = useState<InterviewData>({
    userName: resumeData?.personalInfo?.fullName || '',
    jobRole: resumeData?.targetRole || '',
    roleCategory: 'Software Engineering',
    dreamCompany: '',
    difficultyLevel: 'medium',
    language: 'English',
    timeLimit: 10,
    resume: '',
    isPracticeMode: false
  });

  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState('');

  // Tool-using: fetch a real job posting so the interview is grounded in the
  // actual role requirements instead of a free-text company/role guess.
  const [jobPostingUrl, setJobPostingUrl] = useState('');
  const [isFetchingPosting, setIsFetchingPosting] = useState(false);
  const [postingFetchError, setPostingFetchError] = useState('');

  const handleFetchJobPosting = async () => {
    if (!jobPostingUrl.trim()) return;
    setIsFetchingPosting(true);
    setPostingFetchError('');
    try {
      const resp = await fetch('/api/fetch-job-posting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: jobPostingUrl.trim() })
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || 'Failed to fetch job posting');
      setSetupData(prev => ({ ...prev, jobPostingText: data.text }));
    } catch (err: any) {
      setPostingFetchError(err.message || 'Failed to fetch job posting');
    } finally {
      setIsFetchingPosting(false);
    }
  };

  const [isTipsModalOpen, setIsTipsModalOpen] = useState(false);
  const [isQuestionsModalOpen, setIsQuestionsModalOpen] = useState(false);

  // Refs for click outside
  const roleDropdownRef = useRef<HTMLDivElement>(null);
  const companyDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (roleDropdownRef.current && !roleDropdownRef.current.contains(event.target as Node)) {
        setShowRoleDropdown(false);
      }
      if (companyDropdownRef.current && !companyDropdownRef.current.contains(event.target as Node)) {
        setShowCompanyDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // New Search & Dropdown State
  const [roleSearchQuery, setRoleSearchQuery] = useState('');
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [isCustomRole, setIsCustomRole] = useState(false);
  const [customRoles, setCustomRoles] = useState<any[]>([]);

  const [companySearchQuery, setCompanySearchQuery] = useState('');
  const [showCompanyDropdown, setShowCompanyDropdown] = useState(false);

  useEffect(() => {
    if (resumeData?.personalInfo?.fullName && !setupData.userName) {
      setSetupData(prev => ({ ...prev, userName: resumeData.personalInfo.fullName }));
    }
    if (resumeData?.targetRole && !setupData.jobRole && !roleSearchQuery) {
      setSetupData(prev => ({ ...prev, jobRole: resumeData.targetRole }));
      setRoleSearchQuery(resumeData.targetRole);
    }
  }, [resumeData]);

  const filteredRoles = useMemo(() => {
    const allRoles = [...DETAILED_ROLES, ...customRoles];
    if (!roleSearchQuery) return allRoles.slice(0, 8); // Show first 8 default
    return allRoles.filter(role => 
      role.title.toLowerCase().includes(roleSearchQuery.toLowerCase()) ||
      role.category.toLowerCase().includes(roleSearchQuery.toLowerCase())
    );
  }, [roleSearchQuery, customRoles]);

  const filteredCompanies = useMemo(() => {
    if (!companySearchQuery) return [];
    return DETAILED_COMPANIES.filter(company => 
      company.name.toLowerCase().includes(companySearchQuery.toLowerCase()) ||
      company.category.toLowerCase().includes(companySearchQuery.toLowerCase())
    );
  }, [companySearchQuery]);

  const handleRoleSelect = (title: string, category: string, isCustomSelection: boolean = false) => {
    setSetupData(prev => ({ ...prev, jobRole: title, roleCategory: category }));
    setRoleSearchQuery(title);
    setShowRoleDropdown(false);
    setIsCustomRole(isCustomSelection);
  };

  const handleCustomRole = () => {
    if (roleSearchQuery.trim()) {
      const newRole = { 
        id: Date.now(), 
        title: roleSearchQuery.trim(), 
        category: 'Custom Role',
        isCustom: true 
      };
      
      // Add to session custom roles if not already there
      if (!customRoles.find(r => r.title.toLowerCase() === newRole.title.toLowerCase())) {
        setCustomRoles(prev => [newRole, ...prev]);
      }
      
      setSetupData(prev => ({ ...prev, jobRole: newRole.title, roleCategory: 'Custom Role' }));
      setShowRoleDropdown(false);
      setIsCustomRole(true);
    }
  };

  const handleCompanySelect = (name: string) => {
    setSetupData(prev => ({ ...prev, dreamCompany: name }));
    setCompanySearchQuery(name);
    setShowCompanyDropdown(false);
  };

  const handleFileUpload = async (file: File) => {
    setIsParsing(true);
    setSetupData(prev => ({ ...prev, resume: file.name }));
    
    try {
      let text = "";
      if (file.type === 'application/pdf') {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          text += content.items.map((item: any) => item.str).join(" ") + "\n";
        }
      } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        text = result.value;
      } else {
        text = await file.text();
      }

      if (text.trim().length > 50) {
        setSetupData(prev => ({ ...prev, resumeText: text }));
        const parsedData = await parseResume(text);
        if (parsedData?.personalInfo?.fullName) {
          setSetupData(prev => ({
            ...prev,
            userName: parsedData.personalInfo.fullName
          }));
        }
        if (parsedData?.targetRole && !roleSearchQuery) {
          setSetupData(prev => ({
            ...prev,
            jobRole: parsedData.targetRole
          }));
          setRoleSearchQuery(parsedData.targetRole);
        }
      }
    } catch (err) {
      console.error("Resume parsing error:", err);
    } finally {
      setIsParsing(false);
    }
  };

  const handleStart = () => {
    // If the user has typed but not selected, we can try to auto-select if it's the only option or just use it as custom
    let finalJobRole = setupData.jobRole;
    if (!finalJobRole && roleSearchQuery.trim()) {
        finalJobRole = roleSearchQuery.trim();
        setIsCustomRole(true);
    }

    if (!setupData.userName.trim() || !finalJobRole.trim()) {
        setError('Please complete all required fields.');
        return;
    }
    
    const finalData = { 
        ...setupData, 
        jobRole: finalJobRole,
        dreamCompany: setupData.dreamCompany || companySearchQuery.trim()
    };
    onStart(finalData);
  };

  const tips = [
    { title: 'Use the STAR Method', description: 'Structure your answers with Situation, Task, Action, Result. This helps provide clear, concise, and complete responses to behavioral questions.', type: "Do's", icon: "⭐" },
    { title: 'Research the Company', description: "Know the company's mission, values, recent news, and products. Show genuine interest and align your answers with their culture.", type: "Preparation", icon: "🔍" },
    { title: 'Prepare Questions', description: 'Always have 2-3 thoughtful questions ready to ask the interviewer. It shows interest and engagement.', type: "Preparation", icon: "❓" },
    { title: 'Practice Active Listening', description: 'Listen carefully to each question before answering. Take a moment to think before you speak.', type: "Do's", icon: "👂" },
    { title: 'Maintain Good Posture', description: 'Sit up straight, maintain eye contact (look at the camera), and use natural gestures. Body language matters!', type: "Do's", icon: "🪑" },
    { title: 'Show Enthusiasm', description: 'Let your passion and energy show. Smile, be positive, and demonstrate genuine interest in the role.', type: "Do's", icon: "😊" }
  ];

  const practiceQuestions = {
    "Behavioral": [
      "Tell me about a time you faced a difficult challenge at work. How did you handle it?",
      "Give an example of a time you worked on a team and encountered conflict. How was it resolved?",
      "Describe a situation where you had to meet a tight deadline. How did you manage your time?",
      "What is your greatest professional achievement so far?",
      "Tell me about a time you failed. What did you learn?"
    ],
    "Technical - General": [
      "Explain a complex technical concept you recently learned to a non-technical person.",
      "How do you ensure the quality of your work?",
      "Walk me through your typical problem-solving process.",
      "What are the most important trends in your industry right now?",
      "How do you stay up-to-date with new technologies?"
    ],
    "Software Engineering": [
      "Explain the difference between a process and a thread.",
      "What is 'Big O' notation and why is it important?",
      "Describe the lifecycle of a software project (SDLC).",
      "What are the advantages and disadvantages of microservices architecture?",
      "How do you approach code reviews?"
    ],
    "Product Management": [
      "How do you prioritize features for a product roadmap?",
      "Tell me about a product you love. How would you improve it?",
      "How do you handle a situation where stakeholders have conflicting priorities?",
      "What metrics would you use to measure the success of a new feature?",
      "Describe a time you had to pivot a product strategy based on data."
    ]
  };

  const ROLES = [
    "General", "Frontend Engineer", "Backend Engineer", "Data Scientist", "Lawyer", "Doctor", "Financial Analyst", "Digital Marketing Manager", "Teacher", "Mechanical Engineer", "Sales Executive", "Hr Manager", "Operations Manager", "Home Based Catering"
  ];

  const [selectedRole, setSelectedRole] = useState<string>("General");
  const [selectedFilter, setSelectedFilter] = useState<string>("All");
  const [expandedQuestionId, setExpandedQuestionId] = useState<number | null>(null);
  const [dynamicQuestions, setDynamicQuestions] = useState<any[]>([]);
  const [isLoadingDynamic, setIsLoadingDynamic] = useState(false);

  const fetchDynamicQuestions = async (role: string = setupData.jobRole) => {
    const targetRole = role || "General";
    setIsLoadingDynamic(true);
    setError('');
    try {
        const data = await getPracticeQuestions(targetRole, setupData.difficultyLevel);
        if (data.questions) {
            setDynamicQuestions(data.questions);
            setSelectedRole(targetRole);
        }
    } catch (err) {
        console.error(err);
        setError('Failed to generate questions. Please try again.');
    } finally {
        setIsLoadingDynamic(false);
    }
  };

  useEffect(() => {
    if (isQuestionsModalOpen && dynamicQuestions.length === 0) {
      fetchDynamicQuestions("General");
    }
  }, [isQuestionsModalOpen]);

  const filteredQuestions = useMemo(() => {
    if (selectedFilter === "All") return dynamicQuestions;
    return dynamicQuestions.filter(q => q.type === selectedFilter);
  }, [dynamicQuestions, selectedFilter]);

  const difficultyLevels = [
    { value: 'easy', label: 'Easy', icon: <Sparkles className="w-5 h-5 text-emerald-500" />, desc: 'Focus on fundamentals and soft skills' },
    { value: 'medium', label: 'Medium', icon: <Target className="w-5 h-5 text-cyan-500" />, desc: 'Standard professional interview' },
    { value: 'hard', label: 'Hard', icon: <Brain className="w-5 h-5 text-rose-500" />, desc: 'Deep technical and complex behavioral' }
  ];

  return (
    <div className="space-y-8">
      {/* Quick Access Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div 
            onClick={() => setIsQuestionsModalOpen(true)}
            className="p-8 bg-gradient-to-br from-cyan-600 to-cyan-800 rounded-[2.5rem] text-white shadow-xl shadow-cyan-100 cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all group overflow-hidden relative"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-white/20 transition-all" />
            <div className="relative z-10 space-y-4">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                <List className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-black tracking-tight">Practice Questions</h3>
                <p className="text-cyan-100 text-sm font-medium">Browse 500+ role-specific questions</p>
              </div>
            </div>
          </div>

          <div 
            onClick={() => setIsTipsModalOpen(true)}
            className="p-8 bg-white border border-gray-100 rounded-[2.5rem] shadow-xl hover:shadow-2xl hover:border-cyan-200 cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all group overflow-hidden relative"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-50 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-cyan-100 transition-all" />
            <div className="relative z-10 space-y-4">
              <div className="w-12 h-12 bg-cyan-50 rounded-2xl flex items-center justify-center">
                <Lightbulb className="w-6 h-6 text-cyan-600" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-gray-900 tracking-tight">Quick Tips</h3>
                <p className="text-gray-500 text-sm font-medium">Ace your next high-stakes interview</p>
              </div>
            </div>
          </div>
      </div>

      <div className="bg-white rounded-[3rem] border border-gray-100 shadow-xl overflow-hidden">
        <div className="p-12 space-y-12">
          <div>
            <h2 className="text-3xl font-black text-gray-900 mb-2">Interview Setup</h2>
            <p className="text-gray-500">Configure your mock interview session</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-8">
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-gray-700">Interview Mode</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div 
                    onClick={() => setSetupData({...setupData, isPracticeMode: true})}
                    className={`p-6 border-2 rounded-[2rem] transition-all cursor-pointer group ${setupData.isPracticeMode ? 'border-cyan-600 bg-cyan-50/20' : 'border-gray-100 hover:border-cyan-300'}`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${setupData.isPracticeMode ? 'bg-cyan-600 text-white' : 'bg-gray-50 text-gray-400 group-hover:bg-cyan-50 group-hover:text-cyan-600'}`}>
                      <Layout className="w-5 h-5" />
                    </div>
                    <h4 className="font-bold text-gray-900 mb-1">Practice Mode</h4>
                    <p className="text-[10px] text-gray-400 font-bold leading-tight">No pressure, instant feedback</p>
                  </div>
                  <div 
                    onClick={() => setSetupData({...setupData, isPracticeMode: false})}
                    className={`p-6 border-2 rounded-[2rem] transition-all cursor-pointer group ${!setupData.isPracticeMode ? 'border-cyan-600 bg-cyan-50/20' : 'border-gray-100 hover:border-cyan-300'}`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${!setupData.isPracticeMode ? 'bg-cyan-600 text-white' : 'bg-gray-50 text-gray-400 group-hover:bg-cyan-50 group-hover:text-cyan-600'}`}>
                      <Mic className="w-5 h-5" />
                    </div>
                    <h4 className="font-bold text-gray-900 mb-1">Mock Interview</h4>
                    <p className="text-[10px] text-gray-400 font-bold leading-tight">Realistic simulation</p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Your Name *</label>
                  <input 
                    type="text" 
                    placeholder="e.g., Jane Doe"
                    value={setupData.userName}
                    onChange={(e) => setSetupData({...setupData, userName: e.target.value})}
                    className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold focus:ring-2 focus:ring-cyan-500/20 outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Job Role *</label>
                    <div className="relative" ref={roleDropdownRef}>
                      <div className="relative">
                        <input 
                          type="text" 
                          placeholder="Search or type a job role..."
                          value={showRoleDropdown ? roleSearchQuery : (setupData.jobRole || roleSearchQuery)}
                          onChange={(e) => {
                            setRoleSearchQuery(e.target.value);
                            setSetupData(prev => ({ ...prev, jobRole: '' }));
                            setShowRoleDropdown(true);
                          }}
                          onFocus={() => setShowRoleDropdown(true)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && roleSearchQuery.trim()) {
                                handleCustomRole();
                            }
                          }}
                          className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold focus:ring-2 focus:ring-cyan-500/20 outline-none transition-all pl-12"
                        />
                        <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-500" />
                      </div>

                      <AnimatePresence>
                        {showRoleDropdown && (
                          <motion.div 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute z-20 w-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-2xl max-h-64 overflow-y-auto overflow-x-hidden scrollbar-cyan"
                          >
                            {filteredRoles.length > 0 ? (
                              <>
                                {filteredRoles.map((role) => (
                                  <button
                                    key={role.id}
                                    type="button"
                                    onClick={() => handleRoleSelect(role.title, role.category, role.isCustom)}
                                    className="w-full text-left px-6 py-4 hover:bg-cyan-50 transition-colors border-b border-gray-50 last:border-b-0 flex justify-between items-center group/item"
                                  >
                                    <div className="flex flex-col">
                                      <span className="font-bold text-gray-900 group-hover/item:text-cyan-600 transition-colors">{role.title}</span>
                                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{role.category}</span>
                                    </div>
                                    {role.isCustom && (
                                      <span className="px-2 py-0.5 bg-cyan-100 text-cyan-600 rounded-md text-[8px] font-black uppercase tracking-tighter">Saved Custom</span>
                                    )}
                                  </button>
                                ))}
                                {roleSearchQuery.trim() && !filteredRoles.find(r => r.title.toLowerCase() === roleSearchQuery.toLowerCase()) && (
                                  <button
                                    type="button"
                                    onClick={handleCustomRole}
                                    className="w-full text-left px-6 py-4 bg-cyan-50/50 hover:bg-cyan-50 transition-colors border-t border-cyan-100 flex items-center gap-3"
                                  >
                                    <span className="text-xl">✨</span>
                                    <div className="flex flex-col">
                                      <span className="font-bold text-cyan-700 underline text-sm">Use custom role: "{roleSearchQuery}"</span>
                                      <span className="text-[10px] text-cyan-400 font-black tracking-widest uppercase">Click to confirm</span>
                                    </div>
                                  </button>
                                )}
                              </>
                            ) : roleSearchQuery.trim() ? (
                              <button
                                type="button"
                                onClick={handleCustomRole}
                                className="w-full text-left px-6 py-4 bg-cyan-50/50 hover:bg-cyan-50 transition-colors flex items-center gap-3"
                              >
                                <span className="text-xl">✨</span>
                                <span className="font-bold text-cyan-700 underline">Use custom role: "{roleSearchQuery}"</span>
                              </button>
                            ) : (
                              <div className="px-6 py-4 text-gray-400 text-sm font-bold text-center">Start typing to search...</div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {setupData.jobRole && !showRoleDropdown && (
                      <motion.div 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="mt-3 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-between"
                      >
                         <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                              <CheckCircle2 className="w-5 h-5 text-white" />
                            </div>
                            <div>
                               <p className="text-xs font-black text-emerald-800 uppercase tracking-widest">Selected Role</p>
                               <div className="flex items-center gap-2">
                                  <p className="font-bold text-emerald-900">{setupData.jobRole}</p>
                                  {isCustomRole && (
                                    <span className="px-2 py-0.5 bg-emerald-200 text-emerald-800 rounded-lg text-[9px] font-black uppercase tracking-tight shadow-sm border border-emerald-300">
                                      Custom Role
                                    </span>
                                  )}
                               </div>
                            </div>
                         </div>
                         <button 
                          onClick={() => {
                            setRoleSearchQuery(setupData.jobRole);
                            setSetupData(prev => ({ ...prev, jobRole: '' }));
                            setShowRoleDropdown(true);
                          }}
                          className="text-[10px] font-black text-emerald-600 hover:text-emerald-700 uppercase tracking-widest underline underline-offset-4"
                         >
                          Change
                         </button>
                      </motion.div>
                    )}
                </div>
                <div className="space-y-2 pt-2">
                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Dream Company (Optional)</label>
                    <div className="relative" ref={companyDropdownRef}>
                      <div className="relative">
                        <input 
                          type="text" 
                          placeholder="Search for your dream company..."
                          value={showCompanyDropdown ? companySearchQuery : (setupData.dreamCompany || companySearchQuery)}
                          onChange={(e) => {
                            setCompanySearchQuery(e.target.value);
                            setSetupData(prev => ({ ...prev, dreamCompany: '' }));
                            setShowCompanyDropdown(true);
                          }}
                          onFocus={() => setShowCompanyDropdown(true)}
                          className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold focus:ring-2 focus:ring-cyan-500/20 outline-none transition-all pl-12"
                        />
                        <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-500" />
                      </div>

                      <AnimatePresence>
                        {showCompanyDropdown && companySearchQuery.trim() && (
                          <motion.div 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute z-20 w-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-2xl max-h-64 overflow-y-auto overflow-x-hidden scrollbar-cyan"
                          >
                            {filteredCompanies.length > 0 ? (
                              filteredCompanies.map((company) => (
                                <button
                                  key={company.id}
                                  type="button"
                                  onClick={() => handleCompanySelect(company.name)}
                                  className="w-full text-left px-6 py-4 hover:bg-cyan-50 transition-colors border-b border-gray-50 last:border-b-0 flex flex-col"
                                >
                                  <span className="font-bold text-gray-900">{company.name}</span>
                                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{company.category}</span>
                                </button>
                              ))
                            ) : (
                              <div className="px-6 py-4 text-gray-400 text-sm font-bold text-center">No companies found</div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {setupData.dreamCompany && !showCompanyDropdown && (
                      <motion.div 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="mt-3 p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-between"
                      >
                         <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                              <Target className="w-5 h-5 text-white" />
                            </div>
                            <div>
                               <p className="text-xs font-black text-blue-800 uppercase tracking-widest">Interview Tailored For</p>
                               <p className="font-bold text-blue-900">{setupData.dreamCompany}</p>
                            </div>
                         </div>
                         <button 
                          onClick={() => {
                            setCompanySearchQuery(setupData.dreamCompany);
                            setSetupData(prev => ({ ...prev, dreamCompany: '' }));
                            setShowCompanyDropdown(true);
                          }}
                          className="text-[10px] font-black text-blue-600 hover:text-blue-700 uppercase tracking-widest underline underline-offset-4"
                         >
                          Change
                         </button>
                      </motion.div>
                    )}

                    {!setupData.dreamCompany && !companySearchQuery && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Categories:</span>
                        {['Tech Giants', 'Indian Tech', 'Consulting & Finance', 'Startups'].map(c => (
                          <span key={c} className="text-[10px] font-bold text-gray-400 hover:text-cyan-400 transition-colors cursor-default">{c}</span>
                        ))}
                      </div>
                    )}
                </div>
                <div className="space-y-4">
                  <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Interview Difficulty</label>
                  <div className="grid grid-cols-1 gap-4">
                    {difficultyLevels.map((level) => (
                      <div 
                        key={level.value}
                        onClick={() => setSetupData({...setupData, difficultyLevel: level.value as any})}
                        className={`p-4 border-2 rounded-2xl transition-all cursor-pointer flex items-center gap-4 group ${setupData.difficultyLevel === level.value ? 'border-cyan-600 bg-cyan-50/20' : 'border-gray-100 hover:border-cyan-300 bg-gray-50/50'}`}
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${setupData.difficultyLevel === level.value ? 'bg-cyan-600 text-white' : 'bg-gray-100 text-gray-400 group-hover:bg-cyan-100'}`}>
                          {level.icon}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-bold text-gray-900">{level.label}</h4>
                            {setupData.difficultyLevel === level.value && <div className="w-2 h-2 bg-cyan-600 rounded-full animate-pulse" />}
                          </div>
                          <p className="text-[10px] text-gray-500 font-medium leading-tight">{level.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Interview Language</label>
                <div className="relative">
                  <select 
                    value={setupData.language}
                    onChange={(e) => setSetupData({...setupData, language: e.target.value})}
                    className="w-full px-12 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold focus:ring-2 focus:ring-cyan-500/20 outline-none appearance-none cursor-pointer"
                  >
                    {ALL_LANGUAGES.map(lang => <option key={lang} value={lang}>{lang}</option>)}
                  </select>
                  <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-500" />
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
              </div>

               <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Interview Duration</label>
                  <span className="text-cyan-600 font-black text-sm bg-cyan-50 px-3 py-1 rounded-full">{setupData.timeLimit} min</span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="30"
                  value={setupData.timeLimit}
                  onChange={(e) => setSetupData({...setupData, timeLimit: parseInt(e.target.value)})}
                  className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-cyan-600"
                />
                <div className="flex justify-between text-[10px] font-black text-gray-400 tracking-widest">
                   <span>1 MIN</span>
                   <span>30 MIN</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Resume Upload (Optional)</label>
                <div className="border-2 border-dashed border-gray-100 rounded-[2rem] p-10 flex flex-col items-center gap-4 hover:border-cyan-200 transition-all cursor-pointer group relative overflow-hidden">
                  <input 
                    type="file" 
                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        handleFileUpload(e.target.files[0]);
                      }
                    }}
                  />
                  <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center group-hover:bg-cyan-50">
                    {isParsing ? (
                      <Loader2 className="w-6 h-6 text-cyan-600 animate-spin" />
                    ) : (
                      <Upload className="w-6 h-6 text-gray-400 group-hover:text-cyan-600" />
                    )}
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-gray-700">
                      {isParsing ? 'Extracting Data...' : (setupData.resume ? setupData.resume : 'Upload Resume')}
                    </p>
                    <p className="text-[10px] text-gray-400">PDF, DOCX, or TXT</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Job Posting URL (Optional)</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="Paste a job posting link..."
                      value={jobPostingUrl}
                      onChange={(e) => setJobPostingUrl(e.target.value)}
                      className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold focus:ring-2 focus:ring-cyan-500/20 outline-none transition-all pl-12"
                    />
                    <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-500" />
                  </div>
                  <button
                    type="button"
                    onClick={handleFetchJobPosting}
                    disabled={isFetchingPosting || !jobPostingUrl.trim()}
                    className="px-6 py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-black transition-all disabled:opacity-40 disabled:pointer-events-none shrink-0"
                  >
                    {isFetchingPosting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Fetch'}
                  </button>
                </div>
                {postingFetchError && (
                  <p className="text-rose-500 text-xs font-bold">{postingFetchError}</p>
                )}
                {setupData.jobPostingText && (
                  <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <p className="text-xs font-bold text-emerald-800">Job posting loaded — questions will be tailored to this specific role.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="pt-10 flex flex-col items-center gap-4">
            <button 
              onClick={handleStart}
              className={`px-12 py-5 bg-gray-900 text-white rounded-2xl font-black shadow-xl hover:bg-black transition-all flex items-center gap-3 ${(!setupData.userName || (!setupData.jobRole && !roleSearchQuery)) ? 'opacity-50 cursor-not-allowed shadow-none' : 'hover:scale-105 active:scale-95'}`}
            >
              Start Interview <Target className="w-5 h-5" />
            </button>
            {error && <p className="text-rose-500 text-xs font-black uppercase tracking-widest">{error}</p>}
          </div>
        </div>
      </div>

      {/* Quick Tips Modal */}
      <AnimatePresence>
        {isTipsModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[2.5rem] w-full max-w-2xl max-h-[85vh] overflow-hidden shadow-2xl flex flex-col"
            >
              <div className="p-10 border-b border-gray-100 flex justify-between items-start">
                <div>
                  <h2 className="text-3xl font-black text-gray-900 tracking-tight">Quick Interview Tips</h2>
                  <p className="text-gray-500 font-medium">Best practices to ace your interview</p>
                </div>
                <button 
                  onClick={() => setIsTipsModalOpen(false)} 
                  className="w-12 h-12 flex items-center justify-center bg-gray-50 hover:bg-rose-50 hover:text-rose-600 rounded-full transition-all"
                >
                    <Plus className="w-6 h-6 rotate-45" />
                </button>
              </div>

              <div className="p-10 overflow-y-auto space-y-8 flex-1">
                <div className="flex flex-col gap-6">
                  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {['All Tips', "Do's", "Don'ts", 'Strategy', 'Preparation'].map(tab => (
                      <button key={tab} className={`px-6 py-2.5 rounded-full text-xs font-black whitespace-nowrap transition-all ${tab === 'All Tips' ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-100' : 'bg-gray-50 text-gray-400 hover:bg-cyan-50 hover:text-cyan-600'}`}>
                        {tab}
                      </button>
                    ))}
                  </div>
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Showing {tips.length} tips</span>
                </div>

                <div className="grid grid-cols-1 gap-10">
                  {tips.map((tip, i) => (
                    <div key={i} className="flex gap-8 items-start group">
                      <div className="w-16 h-16 bg-gray-50 rounded-[1.5rem] flex items-center justify-center text-3xl group-hover:bg-cyan-50 transition-all shrink-0 shadow-sm">
                        {tip.icon}
                      </div>
                      <div className="space-y-2">
                         <div className="flex flex-col">
                            <h4 className="text-xl font-black text-gray-900 group-hover:text-cyan-600 transition-colors">{tip.title}</h4>
                            <span className="text-[10px] font-black text-cyan-500 uppercase tracking-widest mt-0.5">{tip.type}</span>
                         </div>
                         <p className="text-sm text-gray-500 font-medium leading-relaxed italic serif opacity-80">{tip.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-8 bg-gray-50 border-t border-gray-100 flex justify-center">
                 <button 
                  onClick={() => setIsTipsModalOpen(false)}
                  className="px-10 py-4 bg-gray-900 text-white rounded-2xl font-black hover:bg-black transition-all"
                 >
                    Got it, thanks!
                 </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Practice Questions Modal */}
      <AnimatePresence>
        {isQuestionsModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[2.5rem] w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col font-sans border-4 border-white"
            >
              <div className="p-8 bg-gradient-to-r from-blue-500 via-cyan-600 to-purple-600 text-white flex justify-between items-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />
                <div className="flex items-center gap-4 relative z-10">
                   <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/30">
                      <List className="w-8 h-8 text-white" />
                   </div>
                   <div>
                    <h2 className="text-3xl font-black tracking-tight">Practice Questions Library</h2>
                    <p className="text-cyan-100 text-sm font-medium opacity-90">Browse and prepare for common interview questions</p>
                   </div>
                </div>
                <button 
                  onClick={() => setIsQuestionsModalOpen(false)} 
                  className="w-12 h-12 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full transition-all relative z-10 border border-white/20"
                >
                    <Plus className="w-6 h-6 rotate-45" />
                </button>
              </div>

              <div className="px-8 py-6 border-b border-gray-100 bg-white flex flex-wrap items-center gap-4">
                <div className="relative min-w-[200px]">
                  <select 
                    value={selectedRole}
                    onChange={(e) => fetchDynamicQuestions(e.target.value)}
                    className="w-full pl-4 pr-10 py-3 bg-cyan-50 border border-cyan-100 rounded-xl font-bold text-cyan-700 outline-none appearance-none cursor-pointer hover:bg-cyan-100/50 transition-all"
                  >
                    {ROLES.map(role => <option key={role} value={role}>{role}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-400 pointer-events-none" />
                </div>

                <div className="flex bg-gray-100 p-1.5 rounded-2xl gap-1">
                  {['All', 'Technical', 'Behavioral', 'Situational'].map(tab => (
                    <button 
                      key={tab} 
                      onClick={() => setSelectedFilter(tab)}
                      className={`px-6 py-2 rounded-xl text-sm font-black transition-all ${selectedFilter === tab ? 'bg-white text-cyan-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
                
                {isLoadingDynamic && (
                  <div className="flex items-center gap-2 text-cyan-600 ml-auto">
                    <SpinnerIcon className="w-5 h-5 animate-spin" />
                    <span className="text-xs font-black uppercase tracking-widest">Generating...</span>
                  </div>
                )}
              </div>

              <div className="flex-1 overflow-y-auto p-10 bg-gray-50/30">
                <div className="mb-8">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Showing {filteredQuestions.length} questions</span>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  {filteredQuestions.map((q, i) => (
                    <div key={i} className="bg-white border border-gray-100 rounded-[2rem] shadow-sm hover:shadow-md transition-all group overflow-hidden">
                      <div className="p-8 space-y-4">
                        <div className="flex items-center gap-2">
                           <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${
                             q.type === 'Technical' ? 'bg-blue-50 text-blue-600' : 
                             q.type === 'Behavioral' ? 'bg-amber-50 text-amber-600' : 
                             'bg-emerald-50 text-emerald-600'
                           }`}>
                            {q.type?.toLowerCase()}
                           </span>
                           <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{q.category || q.type}</span>
                        </div>
                        
                        <h4 className="text-xl font-black text-gray-900 leading-tight">{q.text}</h4>
                        
                        <button 
                          onClick={() => setExpandedQuestionId(expandedQuestionId === i ? null : i)}
                          className={`flex items-center gap-2 text-xs font-black uppercase tracking-widest transition-all ${expandedQuestionId === i ? 'text-rose-500' : 'text-cyan-600 hover:translate-x-1'}`}
                        >
                          {expandedQuestionId === i ? 'Hide Answer Guide' : 'View Answer Guide'}
                        </button>
                      </div>

                      <AnimatePresence>
                        {expandedQuestionId === i && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="bg-gray-50/50 border-t border-gray-50"
                          >
                            <div className="p-8 space-y-8">
                              <div className="space-y-6">
                                <h5 className="text-sm font-black text-gray-900 uppercase tracking-widest border-b-2 border-cyan-600 pb-2 inline-block">Technical Response Structure</h5>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                  {[
                                    { step: 1, title: 'Definition', desc: 'Start with a clear, concise explanation of the concept.' },
                                    { step: 2, title: 'Key Points', desc: 'Highlight 2-3 important aspects or use cases.' },
                                    { step: 3, title: 'Example', desc: 'Provide a practical example or code snippet if relevant.' },
                                    { step: 4, title: 'Comparison', desc: 'If applicable, compare with alternatives or related concepts.' }
                                  ].map((s) => (
                                    <div key={s.step} className="space-y-2">
                                      <div className="flex items-center gap-2">
                                         <span className="w-6 h-6 bg-cyan-600 text-white rounded-lg flex items-center justify-center text-xs font-black">{s.step}</span>
                                         <h6 className="font-black text-gray-900 text-xs">{s.title}</h6>
                                      </div>
                                      <p className="text-[10px] text-gray-500 font-medium leading-relaxed">{s.desc}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                  <h5 className="text-sm font-black text-gray-900">Sample Answer for: <span className="text-cyan-600 italic">"{q.text}"</span></h5>
                                </div>
                                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm italic serif text-gray-700 leading-relaxed">
                                  {q.sampleAnswer || q.answerGuide}
                                </div>
                              </div>

                              <div className="bg-white/50 p-6 rounded-2xl border border-gray-100">
                                <span className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">💡 Pro Tips:</span>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {[
                                    'Start simple, then go deeper if asked',
                                    "Use analogies to explain complex concepts",
                                    "Mention real-world applications you've worked with",
                                    "Be honest if you don't know something completely"
                                  ].map((tip, idx) => (
                                    <div key={idx} className="flex gap-3 items-center">
                                      <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                                      <p className="text-xs font-bold text-gray-600">{tip}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-8 border-t border-gray-100 bg-white flex flex-col md:flex-row items-center justify-between gap-6">
                 <div className="flex items-center gap-3 text-gray-400">
                    <Lightbulb className="w-6 h-6 text-amber-500" />
                    <p className="text-sm font-medium italic serif">Tip: <span className="font-bold text-gray-600">Practice answering these questions out loud to build confidence</span></p>
                 </div>
                 <button 
                    onClick={() => setIsQuestionsModalOpen(false)}
                    className="px-12 py-4 bg-blue-600 text-white rounded-2xl font-black hover:scale-105 active:scale-95 transition-all shadow-xl shadow-blue-100"
                 >
                    Close
                 </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>

  );
};

export default SetupScreen;
