import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  CheckCircle2, User, Mail, Phone, MapPin, Linkedin, 
  ArrowRight, Save, FileText, Layout, ListChecks, 
  MessageSquareText, Plus, X, Briefcase, GraduationCap, 
  Lightbulb, Globe, CheckSquare
} from 'lucide-react';

interface ResumeReviewSectionProps {
  initialData: any;
  onNext: (data: any) => void;
  onPrev: () => void;
}

export function ResumeReviewSection({ initialData, onNext, onPrev }: ResumeReviewSectionProps) {
  const [formData, setFormData] = useState({
    personalInfo: {
      fullName: initialData.personalInfo?.fullName || '',
      email: initialData.personalInfo?.email || '',
      phone: initialData.personalInfo?.phone || '',
      location: initialData.personalInfo?.location || '',
      website: initialData.personalInfo?.website || ''
    },
    summary: initialData.summary || '',
    skills: initialData.skills || [],
    experience: (initialData.experience || []).map((exp: any) => ({
      title: exp.title || '',
      company: exp.company || '',
      duration: exp.duration || '',
      description: exp.description || ''
    })),
    projects: (initialData.projects || []).map((proj: any) => ({
      title: proj.title || '',
      description: proj.description || '',
      link: proj.link || ''
    })),
    education: (initialData.education || []).map((edu: any) => ({
      degree: edu.degree || '',
      school: edu.school || '',
      year: edu.year || ''
    }))
  });
  const [confirmed, setConfirmed] = useState(false);

  const handleNext = () => {
    if (!confirmed) {
      alert("Please confirm that the information is correct.");
      return;
    }
    onNext(formData);
  };

  const addExperience = () => {
    setFormData({
      ...formData,
      experience: [...formData.experience, { title: '', company: '', duration: '', description: '' }]
    });
  };

  const addProject = () => {
    setFormData({
      ...formData,
      projects: [...formData.projects, { title: '', description: '', link: '' }]
    });
  };

  const addEducation = () => {
    setFormData({
      ...formData,
      education: [...formData.education, { degree: '', school: '', year: '' }]
    });
  };

  return (
    <div className="space-y-12">
      {/* Progress Bar */}
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-2">
           <div className="flex flex-col items-center">
             <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-200 z-10 cursor-pointer" onClick={onPrev}>
               <CheckCircle2 className="w-6 h-6" />
             </div>
             <span className="text-xs font-bold text-emerald-600 mt-2 uppercase tracking-widest">Upload</span>
           </div>
           <div className="flex-1 h-1 bg-emerald-500 mx-4 -mt-6" />
           <div className="flex flex-col items-center">
             <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-100 z-10 border-4 border-white">
               <span className="font-bold">2</span>
             </div>
             <span className="text-xs font-bold text-indigo-600 mt-2 uppercase tracking-widest">Review</span>
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

      <div className="max-w-5xl mx-auto pb-20">
        <div className="mb-10 text-center">
          <h2 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">Review Your Resume</h2>
          <p className="text-gray-500 italic serif text-lg opacity-80">Review and edit the parsed information before sending for analysis</p>
        </div>

        <div className="space-y-12">
          {/* 1. Personal Information */}
          <section className="bg-white rounded-[2.5rem] border border-gray-100 p-10 shadow-2xl shadow-gray-200/40">
            <div className="flex items-center gap-4 mb-10">
              <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 font-black text-xl">1</div>
              <h3 className="text-2xl font-black text-gray-900 tracking-tight">Personal Information</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                   Full Name <span className="text-red-500">*</span>
                </label>
                <input 
                  value={formData.personalInfo.fullName}
                  onChange={(e) => setFormData({...formData, personalInfo: {...formData.personalInfo, fullName: e.target.value}})}
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold focus:bg-white focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all"
                  placeholder="e.g. Rohith"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                   Email <span className="text-red-500">*</span>
                </label>
                <input 
                  value={formData.personalInfo.email}
                  onChange={(e) => setFormData({...formData, personalInfo: {...formData.personalInfo, email: e.target.value}})}
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold focus:bg-white focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all"
                  placeholder="email@example.com"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Phone</label>
                <input 
                  value={formData.personalInfo.phone}
                  onChange={(e) => setFormData({...formData, personalInfo: {...formData.personalInfo, phone: e.target.value}})}
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold focus:bg-white focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all"
                  placeholder="6305164517"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Location</label>
                <input 
                  value={formData.personalInfo.location}
                  onChange={(e) => setFormData({...formData, personalInfo: {...formData.personalInfo, location: e.target.value}})}
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold focus:bg-white focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all"
                  placeholder="Location"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">LinkedIn/Website URL</label>
                <input 
                  value={formData.personalInfo.website}
                  onChange={(e) => setFormData({...formData, personalInfo: {...formData.personalInfo, website: e.target.value}})}
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold focus:bg-white focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all"
                  placeholder="https://linkedin.com/in/..."
                />
              </div>
            </div>
          </section>

          {/* 2. Professional Summary */}
          <section className="bg-white rounded-[2.5rem] border border-gray-100 p-10 shadow-2xl shadow-gray-200/40">
            <div className="flex items-center gap-4 mb-10">
              <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 font-black text-xl">2</div>
              <h3 className="text-2xl font-black text-gray-900 tracking-tight">Professional Summary</h3>
            </div>
            
            <textarea 
              value={formData.summary}
              onChange={(e) => setFormData({...formData, summary: e.target.value})}
              rows={6}
              className="w-full bg-gray-50 border border-gray-100 rounded-[2rem] p-8 text-sm font-medium leading-relaxed focus:bg-white focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all resize-none"
              placeholder="Briefly describe your professional achievements and skills..."
            />
          </section>

          {/* 3. Skills */}
          <section className="bg-white rounded-[2.5rem] border border-gray-100 p-10 shadow-2xl shadow-gray-200/40">
            <div className="flex items-center gap-4 mb-10">
              <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 font-black text-xl">3</div>
              <h3 className="text-2xl font-black text-gray-900 tracking-tight">Skills</h3>
            </div>
            
            <div className="mb-6">
              <p className="text-xs text-gray-400 font-bold mb-4">💡 Tip: Type and press enter to add new skills</p>
              <input 
                type="text"
                placeholder="Select or type skills..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const val = (e.target as HTMLInputElement).value.trim();
                    if (val && !formData.skills.includes(val)) {
                      setFormData({ ...formData, skills: [...formData.skills, val] });
                      (e.target as HTMLInputElement).value = '';
                    }
                  }
                }}
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold focus:bg-white focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all"
              />
            </div>

            <div className="flex flex-wrap gap-3">
              {formData.skills.map((skill: string, idx: number) => (
                <div key={idx} className="group px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-black uppercase tracking-widest border border-indigo-100 flex items-center gap-2">
                   {skill}
                   <button 
                     onClick={() => setFormData({...formData, skills: formData.skills.filter((_: any, i: number) => i !== idx)})}
                     className="hover:text-red-500 transition-colors"
                   >
                     <X className="w-3 h-3" />
                   </button>
                </div>
              ))}
            </div>
          </section>

          {/* 4. Work Experience */}
          <section className="bg-white rounded-[2.5rem] border border-gray-100 p-10 shadow-2xl shadow-gray-200/40">
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 font-black text-xl">4</div>
                <h3 className="text-2xl font-black text-gray-900 tracking-tight">Work Experience</h3>
              </div>
              <button 
                onClick={addExperience}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-700 transition-all"
              >
                <Plus className="w-4 h-4" /> Add Experience
              </button>
            </div>

            <div className="space-y-6">
              {formData.experience.length === 0 ? (
                <div className="py-12 text-center bg-gray-50 rounded-[2rem] border border-dashed border-gray-200">
                  <Briefcase className="w-8 h-8 text-gray-300 mx-auto mb-4" />
                  <p className="text-sm font-medium text-gray-400">No work experience added yet</p>
                </div>
              ) : formData.experience.map((exp: any, idx: number) => (
                <div key={idx} className="p-8 bg-gray-50 rounded-[2rem] border border-gray-100 relative group/card">
                  <button 
                    onClick={() => setFormData({...formData, experience: formData.experience.filter((_: any, i: number) => i !== idx)})}
                    className="absolute top-4 right-4 p-2 text-gray-300 hover:text-red-500 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <input 
                      value={exp.title}
                      onChange={(e) => {
                        const newExp = [...formData.experience];
                        newExp[idx].title = e.target.value;
                        setFormData({...formData, experience: newExp});
                      }}
                      placeholder="Job Title"
                      className="w-full bg-white border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-indigo-500 transition-all"
                    />
                    <input 
                      value={exp.company}
                      onChange={(e) => {
                        const newExp = [...formData.experience];
                        newExp[idx].company = e.target.value;
                        setFormData({...formData, experience: newExp});
                      }}
                      placeholder="Company"
                      className="w-full bg-white border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-indigo-500 transition-all"
                    />
                    <input 
                      value={exp.duration}
                      onChange={(e) => {
                        const newExp = [...formData.experience];
                        newExp[idx].duration = e.target.value;
                        setFormData({...formData, experience: newExp});
                      }}
                      placeholder="Duration (e.g. 2021 - 2023)"
                      className="w-full bg-white border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-indigo-500 transition-all"
                    />
                    <textarea 
                      value={exp.description}
                      onChange={(e) => {
                        const newExp = [...formData.experience];
                        newExp[idx].description = e.target.value;
                        setFormData({...formData, experience: newExp});
                      }}
                      placeholder="Description"
                      rows={3}
                      className="w-full md:col-span-2 bg-white border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-indigo-500 transition-all resize-none"
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 5. Projects */}
          <section className="bg-white rounded-[2.5rem] border border-gray-100 p-10 shadow-2xl shadow-gray-200/40">
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 font-black text-xl">5</div>
                <h3 className="text-2xl font-black text-gray-900 tracking-tight">Projects</h3>
              </div>
              <button 
                onClick={addProject}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-700 transition-all"
              >
                <Plus className="w-4 h-4" /> Add Project
              </button>
            </div>

            <div className="space-y-6">
              {formData.projects.length === 0 ? (
                <div className="py-12 text-center bg-gray-50 rounded-[2rem] border border-dashed border-gray-200">
                  <Lightbulb className="w-8 h-8 text-gray-300 mx-auto mb-4" />
                  <p className="text-sm font-medium text-gray-400">No projects added yet</p>
                </div>
              ) : formData.projects.map((proj: any, idx: number) => (
                <div key={idx} className="p-8 bg-gray-50 rounded-[2rem] border border-gray-100 relative">
                  <button 
                    onClick={() => setFormData({...formData, projects: formData.projects.filter((_: any, i: number) => i !== idx)})}
                    className="absolute top-4 right-4 p-2 text-gray-300 hover:text-red-500 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <input 
                      value={proj.title}
                      onChange={(e) => {
                        const newProj = [...formData.projects];
                        newProj[idx].title = e.target.value;
                        setFormData({...formData, projects: newProj});
                      }}
                      placeholder="Project Title"
                      className="w-full bg-white border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-indigo-500 transition-all"
                    />
                    <input 
                      value={proj.link}
                      onChange={(e) => {
                        const newProj = [...formData.projects];
                        newProj[idx].link = e.target.value;
                        setFormData({...formData, projects: newProj});
                      }}
                      placeholder="Project Link (Optional)"
                      className="w-full bg-white border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-indigo-500 transition-all"
                    />
                    <textarea 
                      value={proj.description}
                      onChange={(e) => {
                        const newProj = [...formData.projects];
                        newProj[idx].description = e.target.value;
                        setFormData({...formData, projects: newProj});
                      }}
                      placeholder="Project Description"
                      rows={2}
                      className="w-full md:col-span-2 bg-white border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-indigo-500 transition-all resize-none"
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 6. Education */}
          <section className="bg-white rounded-[2.5rem] border border-gray-100 p-10 shadow-2xl shadow-gray-200/40">
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 font-black text-xl">6</div>
                <h3 className="text-2xl font-black text-gray-900 tracking-tight">Education</h3>
              </div>
              <button 
                onClick={addEducation}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-700 transition-all"
              >
                <Plus className="w-4 h-4" /> Add Education
              </button>
            </div>

            <div className="space-y-6">
              {formData.education.length === 0 ? (
                <div className="py-12 text-center bg-gray-50 rounded-[2rem] border border-dashed border-gray-200">
                  <GraduationCap className="w-8 h-8 text-gray-300 mx-auto mb-4" />
                  <p className="text-sm font-medium text-gray-400">No education added yet</p>
                </div>
              ) : formData.education.map((edu: any, idx: number) => (
                <div key={idx} className="p-8 bg-gray-50 rounded-[2rem] border border-gray-100 relative">
                  <button 
                    onClick={() => setFormData({...formData, education: formData.education.filter((_: any, i: number) => i !== idx)})}
                    className="absolute top-4 right-4 p-2 text-gray-300 hover:text-red-500 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <input 
                      value={edu.degree}
                      onChange={(e) => {
                        const newEdu = [...formData.education];
                        newEdu[idx].degree = e.target.value;
                        setFormData({...formData, education: newEdu});
                      }}
                      placeholder="Degree / Major"
                      className="w-full bg-white border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-indigo-500 transition-all"
                    />
                    <input 
                      value={edu.school}
                      onChange={(e) => {
                        const newEdu = [...formData.education];
                        newEdu[idx].school = e.target.value;
                        setFormData({...formData, education: newEdu});
                      }}
                      placeholder="School / University"
                      className="w-full bg-white border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-indigo-500 transition-all"
                    />
                    <input 
                      value={edu.year}
                      onChange={(e) => {
                        const newEdu = [...formData.education];
                        newEdu[idx].year = e.target.value;
                        setFormData({...formData, education: newEdu});
                      }}
                      placeholder="Graduation Year"
                      className="w-full bg-white border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-indigo-500 transition-all"
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Confirmation & Actions */}
          <section className="space-y-8">
             <label className="flex items-start gap-4 p-6 bg-emerald-50/50 border border-emerald-100 rounded-[2rem] cursor-pointer hover:bg-emerald-50 transition-colors group">
                <div className="relative flex items-center justify-center pt-1">
                   <input 
                     type="checkbox"
                     checked={confirmed}
                     onChange={(e) => setConfirmed(e.target.checked)}
                     className="peer w-6 h-6 rounded-lg border-2 border-gray-200 appearance-none checked:bg-emerald-500 checked:border-emerald-500 transition-all cursor-pointer"
                   />
                   <CheckSquare className="absolute w-4 h-4 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" />
                </div>
                <div className="space-y-1">
                   <p className="text-sm font-black text-gray-900"> Yes, I confirm that all information above is parsed correctly and I'm ready to proceed with the analysis</p>
                </div>
             </label>

             <div className="flex flex-col md:flex-row gap-4">
                <button 
                  onClick={onPrev}
                  className="px-8 py-5 bg-white border border-gray-100 rounded-2xl text-gray-400 font-black uppercase tracking-widest text-[10px] hover:bg-gray-50 transition-all"
                >
                  Upload New Resume
                </button>
                <button 
                  onClick={handleNext}
                  className={`flex-1 py-5 rounded-2xl font-black text-white flex items-center justify-center gap-3 transition-all shadow-xl ${
                    confirmed ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100' : 'bg-gray-300 cursor-not-allowed'
                  }`}
                >
                  Continue to Resume Analysis →
                </button>
             </div>
          </section>
        </div>
      </div>
    </div>
  );
}

