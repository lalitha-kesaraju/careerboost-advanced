import React from 'react';
import { 
  LineChart, 
  Wallet, 
  Target, 
  Search, 
  Settings, 
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Briefcase
} from 'lucide-react';

interface BusinessToolsSectionProps {
  businessPlan: any;
  skillsGap: any;
  budgetEstimate: any;
  resources: any[];
  jobRole: string;
}

const BusinessToolsSection: React.FC<BusinessToolsSectionProps> = ({ 
  businessPlan, 
  skillsGap, 
  budgetEstimate, 
  resources,
  jobRole 
}) => {
  return (
    <div className="space-y-12 mt-16 animate-fade-in">
      <div className="flex items-center gap-4 border-b border-gray-100 pb-6">
        <div className="w-12 h-12 bg-blue-700 rounded-2xl flex items-center justify-center text-white shadow-lg">
          <Briefcase className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Entrepreneurship Suite</h2>
          <p className="text-gray-500 font-medium">Strategic roadmap for your {jobRole} venture</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Business Plan */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-[2rem] border border-gray-100 p-8 shadow-xl">
            <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                <Target className="w-4 h-4" />
              </div>
              Strategic Business Plan
            </h3>
            
            <div className="space-y-6">
              <div>
                <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2">Executive Summary</h4>
                <p className="text-gray-600 text-sm italic serif leading-relaxed">{businessPlan.executive_summary}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100">
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Market Analysis</h4>
                  <p className="text-xs text-gray-600 leading-relaxed italic serif">{businessPlan.market_analysis}</p>
                </div>
                <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100">
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Marketing Strategy</h4>
                  <p className="text-xs text-gray-600 leading-relaxed italic serif">{businessPlan.marketing_strategy}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[2rem] border border-gray-100 p-8 shadow-xl">
             <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-3">
              <div className="w-8 h-8 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
              Financial Roadmap
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 bg-emerald-50 rounded-2xl text-center">
                 <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Break-even</p>
                 <p className="text-2xl font-black text-gray-900">{budgetEstimate.break_even_months} Mo</p>
              </div>
               <div className="col-span-2 p-6 bg-gray-50 rounded-2xl">
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Pricing Recommendation</p>
                 <p className="text-sm font-bold text-gray-700 italic serif">{budgetEstimate.pricing_recommendation}</p>
              </div>
            </div>
            
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Initial Investment</h4>
                <div className="space-y-3">
                  {budgetEstimate.startup_costs?.map((item: any, i: number) => (
                    <div key={i} className="flex justify-between items-center text-sm">
                      <span className="text-gray-500 font-medium italic serif">{item.item}</span>
                      <span className="font-black text-gray-900">${item.cost}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                 <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Monthly Burn Rate</h4>
                 <div className="space-y-3">
                  {budgetEstimate.monthly_expenses?.map((item: any, i: number) => (
                    <div key={i} className="flex justify-between items-center text-sm">
                      <span className="text-gray-500 font-medium italic serif">{item.item}</span>
                      <span className="font-black text-gray-900">${item.cost}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Tools */}
        <div className="space-y-8">
          <div className="bg-gray-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-20">
              <Settings className="w-24 h-24 rotate-12" />
            </div>
             <h3 className="text-xl font-black mb-6 relative z-10">Readiness Gap</h3>
             <div className="space-y-6 relative z-10">
                <div>
                   <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-3">Timeline to Launch</p>
                   <p className="text-2xl font-black">{skillsGap.timeline_to_readiness}</p>
                </div>
                <div>
                   <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-3">Critical Skills Needed</p>
                   <div className="flex flex-wrap gap-2">
                      {skillsGap.skills_needed?.map((skill: string, i: number) => (
                        <span key={i} className="px-3 py-1 bg-white/10 rounded-lg text-[10px] font-black uppercase tracking-wider">{skill}</span>
                      ))}
                   </div>
                </div>
             </div>
          </div>

          <div className="bg-white rounded-[2rem] border border-gray-100 p-8 shadow-xl">
             <h3 className="text-lg font-black text-gray-900 mb-6">Launch Resources</h3>
             <div className="space-y-4">
                {resources?.map((res, i) => (
                  <a 
                    key={i} 
                    href={res.url} 
                    target="_blank" 
                    rel="noreferrer"
                    className="block p-4 bg-gray-50 rounded-2xl hover:bg-blue-700 hover:text-white transition-all group border border-transparent"
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-[10px] font-black uppercase tracking-widest text-blue-500 group-hover:text-white/80">{res.category}</span>
                      <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100" />
                    </div>
                    <p className="text-sm font-black leading-tight mb-1">{res.title}</p>
                    <p className="text-[10px] opacity-60 line-clamp-1 italic serif">{res.description}</p>
                  </a>
                ))}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessToolsSection;
