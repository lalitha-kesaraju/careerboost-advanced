import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, Star, Clock, Award, ExternalLink, Search, Filter, Loader2, Target, Zap, ArrowRight, Bookmark, PlayCircle, Terminal, Sparkles, BrainCircuit, Settings2, BarChart3, Archive, Layers, Smartphone, Code2 } from 'lucide-react';
import { getRecommendedCourses } from '../services/gemini';

interface CoursesSectionProps {
  data?: any;
  onDataUpdate?: (data: any) => void;
  onNavigate: (view: string, extra?: string) => void;
}

export function CoursesSection({ data, onDataUpdate, onNavigate }: CoursesSectionProps) {
  const [courses, setCourses] = useState<any[]>(data?.recommendedCourses || []);
  const [loading, setLoading] = useState(!data?.recommendedCourses);
  const [filter, setFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const targetRole = data?.targetRole;
  const missingSkills = data?.missingSkills || [];

  useEffect(() => {
    const fetchCourses = async () => {
      if (!targetRole) {
        setLoading(false);
        return;
      }
      // Check if we have cached recommendations for this specifically
      const cacheKey = `${targetRole}-${JSON.stringify(missingSkills)}`;
      if (data?.coursesCache?.[cacheKey]) {
        setCourses(data.coursesCache[cacheKey]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const result = await getRecommendedCourses(targetRole, missingSkills);
        setCourses(result.courses || []);
        
        if (onDataUpdate) {
          const newCache = { ...(data?.coursesCache || {}) };
          newCache[cacheKey] = result.courses;
          onDataUpdate({ 
            recommendedCourses: result.courses,
            coursesCache: newCache
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (!courses.length || data?.targetRole !== targetRole) {
      fetchCourses();
    }
  }, [targetRole, JSON.stringify(missingSkills)]);

  const filteredCourses = courses.filter(course => {
    const matchesFilter = filter === 'All' || course.level === filter;
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          course.provider.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return (
      <div className="py-20 text-center space-y-8">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
          className="w-24 h-24 bg-cyan-50 rounded-[2.5rem] flex items-center justify-center text-cyan-600 mx-auto shadow-2xl shadow-cyan-100"
        >
          <Loader2 className="w-12 h-12" />
        </motion.div>
        <div>
          <h2 className="text-4xl font-black text-gray-900 mb-2 tracking-tight">Curating Your Curriculum</h2>
          <p className="text-gray-500 italic serif text-lg opacity-60">Boost AI is sourcing elite courses to bridge your {targetRole} skill gaps...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-6">
           <div className="p-4 bg-gray-900 rounded-3xl shadow-2xl shadow-gray-200 text-white relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <BrainCircuit className="w-8 h-8 relative z-10" />
           </div>
           <div>
              <h2 className="text-3xl font-black text-gray-900 tracking-tight">Learning Nexus</h2>
              <p className="text-gray-600 italic serif text-lg opacity-80">
                {targetRole ? (
                  <>Mastering <span className="text-cyan-600 font-bold">{targetRole}</span> via 4-Phase Synthesis</>
                ) : (
                  "Orchestrate your cognitive development"
                )}
              </p>
           </div>
        </div>
        
        <div className="flex items-center gap-3">
           <div className="hidden lg:flex items-center gap-2 px-6 py-3 bg-white border border-gray-100 rounded-2xl shadow-sm">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">AI-First Methodology Active</span>
           </div>
           <button 
             onClick={() => onNavigate('learning-plan')}
             className="px-6 py-4 bg-gray-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all flex items-center gap-3 shadow-xl shadow-gray-200"
           >
              <Target className="w-4 h-4" />
              Roadmap
           </button>
        </div>
      </div>

      {/* 4-Phase Methodology Pitch */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-2 bg-gray-50 rounded-[2.5rem] border border-gray-100">
         {[
           { id: 'understand', label: 'Understand', desc: 'Conceptual Synthesis', color: 'text-blue-600', bg: 'bg-blue-50' },
           { id: 'apply', label: 'Apply', desc: 'Agentic Execution', color: 'text-emerald-600', bg: 'bg-emerald-50' },
           { id: 'evaluate', label: 'Evaluate', desc: 'Outcome Validation', color: 'text-amber-600', bg: 'bg-amber-50' },
           { id: 'master', label: 'Master', desc: 'Longitudinal Retain', color: 'text-purple-600', bg: 'bg-purple-50' },
         ].map(m => (
           <div key={m.id} className="p-6 bg-white rounded-3xl border border-transparent hover:border-gray-200 transition-all group">
              <div className={`w-10 h-10 ${m.bg} ${m.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                 <Zap className="w-5 h-5" />
              </div>
              <p className="text-xs font-black uppercase tracking-widest text-gray-900 mb-1">{m.label}</p>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">{m.desc}</p>
           </div>
         ))}
      </div>

      {/* Internal Bootcamps */}
      <div className="space-y-8">
         <div className="flex items-center justify-between px-2">
            <h3 className="text-2xl font-black text-gray-900 tracking-tight">Synthesized Bootcamps</h3>
            <div className="flex items-center gap-2">
               <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
               <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">AI Training Active</span>
            </div>
         </div>
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Prompt Engineering Elite - Now Featured */}
            <div className="bg-gray-900 text-white p-10 rounded-[3.5rem] relative overflow-hidden group cursor-pointer border-4 border-transparent hover:border-cyan-500/30 transition-all lg:col-span-1" onClick={() => onNavigate('bootcamp', 'prompt-engineering')}>
               <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Sparkles className="w-32 h-32 text-cyan-400" />
               </div>
               <div className="relative z-10 flex flex-col h-full">
                  <div className="flex justify-between items-start mb-8">
                     <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl">
                        <BrainCircuit className="w-8 h-8 text-cyan-400" />
                     </div>
                     <div className="flex flex-col items-end">
                        <span className="px-3 py-1 bg-cyan-500 text-white rounded-full text-[10px] font-black uppercase tracking-widest mb-2 shadow-lg shadow-cyan-500/20">Featured Core</span>
                        <span className="text-[10px] font-mono text-gray-500">v3.5 AG-X6</span>
                     </div>
                  </div>
                  <h4 className="text-4xl font-black mb-3 leading-tight tracking-tight">Prompt Engineering Masterclass</h4>
                  <p className="text-gray-400 text-lg italic serif mb-10 opacity-80 leading-relaxed">
                     Bridge the gap between human intent and machine logic. The foundational course for the AI Era.
                  </p>
                  <div className="mt-auto flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <div className="flex -space-x-3">
                           {[1,2,3].map(i => (
                             <div key={i} className="w-8 h-8 rounded-full border-2 border-gray-900 bg-gray-800 flex items-center justify-center text-[10px] font-black text-cyan-400">
                               P{i}
                             </div>
                           ))}
                        </div>
                        <span className="text-xs font-bold text-gray-500">10k+ Trainees</span>
                     </div>
                     <button className="px-6 py-3 bg-white text-gray-900 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-cyan-50 transition-all flex items-center gap-2">
                        Enter Room <ArrowRight className="w-4 h-4" />
                     </button>
                  </div>
               </div>
            </div>

            <div className="bg-white border border-gray-100 p-10 rounded-[3.5rem] relative overflow-hidden group cursor-pointer hover:border-indigo-200 transition-all" onClick={() => onNavigate('bootcamp', 'dsa')}>
               <div className="relative z-10 flex flex-col h-full">
                  <div className="flex justify-between items-start mb-6">
                     <div className="p-4 bg-indigo-50 rounded-2xl">
                        <Terminal className="w-8 h-8 text-indigo-600" />
                     </div>
                     <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest">Logic Pillar</span>
                  </div>
                  <h4 className="text-3xl font-black text-gray-900 mb-2 leading-tight">Algorithmic Synthesis (DSA)</h4>
                  <p className="text-gray-600 text-sm italic serif mb-8 opacity-80 line-clamp-2">
                     Master data structures through the 4-Phase System. Re-engineered for the modern agentic developer.
                  </p>
                  <div className="mt-auto flex items-center justify-between pt-6 border-t border-gray-50">
                     <div className="flex items-center gap-4">
                        <div className="text-center">
                           <p className="text-[10px] font-black text-gray-400 uppercase">Steps</p>
                           <p className="text-sm font-black">13</p>
                        </div>
                        <div className="text-center">
                           <p className="text-[10px] font-black text-gray-400 uppercase">Phases</p>
                           <p className="text-sm font-black">4</p>
                        </div>
                     </div>
                     <button className="flex items-center gap-2 font-black text-indigo-600 group-hover:scale-110 transition-transform">
                        Launch <ArrowRight className="w-5 h-5" />
                     </button>
                  </div>
               </div>
            </div>

            <div className="bg-white border border-gray-100 p-10 rounded-[3.5rem] relative overflow-hidden group cursor-pointer hover:border-purple-200 transition-all" onClick={() => onNavigate('bootcamp', 'system-design')}>
               <div className="relative z-10 flex flex-col h-full">
                  <div className="flex justify-between items-start mb-6">
                     <div className="p-4 bg-purple-50 rounded-2xl">
                        <Settings2 className="w-8 h-8 text-purple-600" />
                     </div>
                     <span className="px-3 py-1 bg-purple-50 text-purple-600 rounded-full text-[10px] font-black uppercase tracking-widest">Architectural</span>
                  </div>
                  <h4 className="text-3xl font-black text-gray-900 mb-2 leading-tight">Scalable System Architect</h4>
                  <p className="text-gray-600 text-sm italic serif mb-8 opacity-80 line-clamp-2">
                     Learn to design internet-scale systems. From load balancers to distributed agent networks.
                  </p>
                  <div className="mt-auto flex items-center justify-between">
                     <div className="flex items-center gap-2 text-purple-600">
                        <Archive className="w-5 h-5" />
                        <span className="text-xs font-black">Advanced Tier</span>
                     </div>
                     <button className="flex items-center gap-2 font-black text-gray-600 group-hover:text-purple-600 transition-colors">
                        Begin <ArrowRight className="w-5 h-5" />
                     </button>
                  </div>
               </div>
            </div>

            <div className="bg-white border border-gray-100 p-10 rounded-[3.5rem] relative overflow-hidden group cursor-pointer hover:border-emerald-200 transition-all" onClick={() => onNavigate('bootcamp', 'languages')}>
               <div className="relative z-10 flex flex-col h-full">
                  <div className="flex justify-between items-start mb-6">
                     <div className="p-4 bg-emerald-50 rounded-2xl">
                        <Zap className="w-8 h-8 text-emerald-600" />
                     </div>
                     <span className="px-3 py-1 bg-emerald-100 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest">Polyglot</span>
                  </div>
                  <h4 className="text-3xl font-black text-gray-900 mb-2 leading-tight">Modern Language Mastery</h4>
                  <p className="text-gray-600 text-sm italic serif mb-8 opacity-80 line-clamp-2">
                     Learn Python, Go, Rust, and TypeScript via our 4-Phase System. Re-engineered for language fluid performance.
                  </p>
                  <div className="mt-auto flex items-center justify-between">
                     <div className="flex items-center gap-2 text-emerald-600">
                        <Code2 className="w-5 h-5" />
                        <span className="text-xs font-black">6 Core Specs</span>
                     </div>
                     <button className="flex items-center gap-2 font-black text-gray-400 group-hover:text-emerald-600 transition-colors">
                        Master <ArrowRight className="w-5 h-5" />
                     </button>
                  </div>
               </div>
            </div>

            <div className="bg-white border border-gray-100 p-10 rounded-[3.5rem] relative overflow-hidden group cursor-pointer hover:border-rose-200 transition-all" onClick={() => onNavigate('bootcamp', 'full-stack')}>
               <div className="relative z-10 flex flex-col h-full">
                  <div className="flex justify-between items-start mb-6">
                     <div className="p-4 bg-rose-50 rounded-2xl">
                        <Layers className="w-8 h-8 text-rose-600" />
                     </div>
                     <span className="px-3 py-1 bg-rose-50 text-rose-600 rounded-full text-[10px] font-black uppercase tracking-widest">Full Stack</span>
                  </div>
                  <h4 className="text-3xl font-black text-gray-900 mb-2 leading-tight">Full Stack Mastery</h4>
                  <p className="text-gray-500 text-sm italic serif mb-8 opacity-80 line-clamp-2">
                     Ship from idea to production. Modern React, Node.js, and DB orchestration in one streamlined path.
                  </p>
                  <div className="mt-auto flex items-center justify-between">
                     <div className="flex items-center gap-2 text-rose-600">
                        <Zap className="w-5 h-5" />
                        <span className="text-xs font-black">8 Lessons</span>
                     </div>
                     <button className="flex items-center gap-2 font-black text-gray-400 group-hover:text-rose-600 transition-colors">
                        Start Building <ArrowRight className="w-5 h-5" />
                     </button>
                  </div>
               </div>
            </div>

            <div className="bg-white border border-gray-100 p-10 rounded-[3.5rem] relative overflow-hidden group cursor-pointer hover:border-blue-200 transition-all" onClick={() => onNavigate('bootcamp', 'mobile')}>
               <div className="relative z-10 flex flex-col h-full">
                  <div className="flex justify-between items-start mb-6">
                     <div className="p-4 bg-blue-50 rounded-2xl">
                        <Smartphone className="w-8 h-8 text-blue-600" />
                     </div>
                     <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest">Mobile</span>
                  </div>
                  <h4 className="text-3xl font-black text-gray-900 mb-2 leading-tight">Mobile Architecture</h4>
                  <p className="text-gray-500 text-sm italic serif mb-8 opacity-80 line-clamp-2">
                     Master cross-platform and native engineering. High-performance mobile apps at scale.
                  </p>
                  <div className="mt-auto flex items-center justify-between">
                     <div className="flex items-center gap-2 text-blue-600">
                        <Smartphone className="w-5 h-5" />
                        <span className="text-xs font-black">7 Challenges</span>
                     </div>
                     <button className="flex items-center gap-2 font-black text-gray-400 group-hover:text-blue-600 transition-colors">
                        Launch App <ArrowRight className="w-5 h-5" />
                     </button>
                  </div>
               </div>
            </div>

            <div className="bg-white border border-gray-100 p-10 rounded-[3.5rem] relative overflow-hidden group cursor-pointer hover:border-amber-200 transition-all" onClick={() => onNavigate('aptitude')}>
               <div className="relative z-10 flex flex-col h-full">
                  <div className="flex justify-between items-start mb-6">
                     <div className="p-4 bg-amber-50 rounded-2xl">
                        <BarChart3 className="w-8 h-8 text-amber-600" />
                     </div>
                     <span className="px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-[10px] font-black uppercase tracking-widest">Cognitive</span>
                  </div>
                  <h4 className="text-3xl font-black text-gray-900 mb-2 leading-tight">Aptitude Elite</h4>
                  <p className="text-gray-500 text-sm italic serif mb-8 opacity-80 line-clamp-2">
                     Master the 100-step aptitude challenge. Quantitative, Logical, and Verbal reasoning for elite roles.
                  </p>
                  <div className="mt-auto flex items-center justify-between">
                     <div className="flex items-center gap-2 text-amber-600">
                        <Zap className="w-5 h-5" />
                        <span className="text-xs font-black">100 Challenges</span>
                     </div>
                     <button className="flex items-center gap-2 font-black text-gray-400 group-hover:text-amber-600 transition-colors">
                        Enter Arena <ArrowRight className="w-5 h-5" />
                     </button>
                  </div>
               </div>
            </div>
         </div>
      </div>

      {/* Control Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
         <div className="md:col-span-2 relative">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search specific courses or topics..."
              className="w-full bg-white border border-gray-100 rounded-2xl pl-16 pr-8 py-5 text-lg font-bold shadow-xl shadow-gray-200/40 outline-none focus:ring-4 focus:ring-cyan-500/5 transition-all"
            />
         </div>
         <div className="flex gap-2">
            {['All', 'Beginner', 'Intermediate', 'Advanced'].map(l => (
              <button 
                key={l}
                onClick={() => setFilter(l)}
                className={`flex-1 py-4 px-2 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${
                  filter === l ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-100' : 'bg-white border border-gray-100 text-gray-400 hover:text-gray-600'
                }`}
              >
                {l}
              </button>
            ))}
         </div>
      </div>

      {/* Featured recommendations for missing skills */}
      {missingSkills.length > 0 && (
         <div className="bg-emerald-50 border border-emerald-100 rounded-[2.5rem] p-8">
            <div className="flex items-center gap-3 mb-6">
               <Zap className="w-5 h-5 text-emerald-600" />
               <h3 className="text-lg font-black text-emerald-900 tracking-tight">Gap-Bridging Recommendations</h3>
            </div>
            <div className="flex flex-wrap gap-2">
               {missingSkills.slice(0, 5).map((s: string, idx: number) => (
                 <span key={idx} className="px-4 py-2 bg-white border border-emerald-100 rounded-xl text-xs font-bold text-emerald-700 shadow-sm">
                    {s}
                 </span>
               ))}
               {missingSkills.length > 5 && (
                 <span className="px-4 py-2 bg-emerald-100/50 rounded-xl text-xs font-bold text-emerald-600">
                    +{missingSkills.length - 5} more
                 </span>
               )}
            </div>
         </div>
      )}

      {/* Course Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <AnimatePresence mode="popLayout">
          {filteredCourses.map((course, idx) => (
            <motion.div
              layout
              key={course.title}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden shadow-xl shadow-gray-200/40 flex flex-col group hover:shadow-2xl hover:shadow-cyan-100/30 transition-all border-b-4 border-b-transparent hover:border-b-cyan-500"
            >
               <div className="p-8 space-y-6 flex-1">
                  <div className="flex justify-between items-start">
                     <span className="px-3 py-1 bg-gray-100 rounded-lg text-[10px] font-black uppercase tracking-widest text-gray-500">
                        {course.provider}
                     </span>
                     <div className="flex items-center gap-1 text-amber-500">
                        <Star className="w-3 h-3 fill-current" />
                        <span className="text-xs font-black">{course.rating}</span>
                     </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-xl font-black text-gray-900 leading-tight group-hover:text-cyan-600 transition-colors">
                      {course.title}
                    </h4>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{course.level} • {course.duration}</p>
                  </div>

                  <p className="text-sm text-gray-500 italic serif leading-relaxed opacity-80">
                    "{course.whyRecommend}"
                  </p>

                  <div className="flex flex-wrap gap-1.5">
                     {course.skillsCovered.map((s: string, i: number) => (
                       <span key={i} className="px-2 py-1 bg-cyan-50 text-cyan-600 rounded-md text-[9px] font-bold">
                          {s}
                       </span>
                     ))}
                  </div>
               </div>

               <div className="p-6 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                     <PlayCircle className="w-4 h-4 text-cyan-600" />
                     <span className="text-xs font-bold text-gray-900">Certificate Included</span>
                  </div>
                  <a 
                    href={course.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-3 bg-white border border-gray-100 rounded-xl shadow-sm text-cyan-600 hover:bg-cyan-600 hover:text-white transition-all transform hover:scale-110 active:scale-95"
                  >
                     <ExternalLink className="w-4 h-4" />
                  </a>
               </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredCourses.length === 0 && (
         <div className="py-20 text-center opacity-50 space-y-4">
            <BookOpen className="w-16 h-16 mx-auto text-gray-200" />
            <p className="text-xl font-bold text-gray-400">No courses match your criteria.</p>
         </div>
      )}

      {/* CTA Section */}
      <div className="bg-gray-900 text-white rounded-[3rem] p-12 text-center relative overflow-hidden">
         <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/20 to-transparent" />
         <div className="relative z-10 space-y-6">
            <h3 className="text-3xl font-black tracking-tight">Need a Personalized Path?</h3>
            <p className="text-gray-400 italic serif text-lg max-w-xl mx-auto">
              Our Longitudinal Learning Architect can build a multi-month roadmap specifically for your career pivot.
            </p>
            <button 
              onClick={() => onNavigate('learning-plan')}
              className="px-10 py-5 bg-white text-gray-900 font-black rounded-2xl hover:bg-cyan-50 transition-all flex items-center gap-3 mx-auto"
            >
               Architect My Roadmap 
               <ArrowRight className="w-5 h-5" />
            </button>
         </div>
      </div>
    </div>
  );
}
