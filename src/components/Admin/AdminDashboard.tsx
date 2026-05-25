import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  BarChart3, 
  Database, 
  Settings, 
  ShieldCheck, 
  Activity, 
  TrendingUp, 
  MessageSquare, 
  Search,
  MoreVertical,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Globe,
  Lock,
  ArrowUpRight,
  Plus,
  LogOut
} from 'lucide-react';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../App';
import { SettingsSection } from '../SettingsSection';

type AdminTab = 'overview' | 'users' | 'content' | 'security' | 'settings' | 'account';

export function AdminDashboard() {
  const { logout, userData } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeInterviews: 0,
    proAnalyses: 0,
    apiHealth: '99.9%'
  });

  useEffect(() => {
    async function fetchStats() {
      try {
        const usersSnap = await getDocs(collection(db, 'users'));
        let totalAnalyses = 0;
        usersSnap.docs.forEach(d => {
          const usage = d.data().usage || {};
          totalAnalyses += (usage.resumeAnalyses || 0) + (usage.skillGaps || 0);
        });
        setStats(prev => ({
          ...prev,
          totalUsers: usersSnap.size,
          proAnalyses: totalAnalyses,
        }));
      } catch (err) {
        console.error('Failed to fetch admin stats:', err);
      }
    }
    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex font-sans">
      {/* Sidebar Navigation */}
      <aside className="w-80 bg-white border-r border-zinc-200 flex flex-col p-8 sticky top-0 h-screen">
        <div className="mb-12 flex items-center gap-3">
          <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-white font-black italic">
            C
          </div>
          <div>
            <h2 className="text-sm font-black uppercase tracking-widest text-zinc-900 leading-none">Admin</h2>
            <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-tighter">CareerBoost OS v1.0</p>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          <SidebarLink 
            active={activeTab === 'overview'} 
            onClick={() => setActiveTab('overview')}
            icon={<BarChart3 className="w-4 h-4" />}
            label="Platform Overview"
          />
          <SidebarLink 
            active={activeTab === 'users'} 
            onClick={() => setActiveTab('users')}
            icon={<Users className="w-4 h-4" />}
            label="User Management"
          />
          <SidebarLink 
            active={activeTab === 'content'} 
            onClick={() => setActiveTab('content')}
            icon={<Database className="w-4 h-4" />}
            label="Content & Bootcamps"
          />
          <SidebarLink 
            active={activeTab === 'security'} 
            onClick={() => setActiveTab('security')}
            icon={<ShieldCheck className="w-4 h-4" />}
            label="Security & Audit"
          />
          <SidebarLink 
            active={activeTab === 'settings'} 
            onClick={() => setActiveTab('settings')}
            icon={<Settings className="w-4 h-4" />}
            label="System Configuration"
          />
          <SidebarLink 
            active={activeTab === 'account'} 
            onClick={() => setActiveTab('account')}
            icon={<ShieldCheck className="w-4 h-4" />}
            label="My Account"
          />
        </nav>

        <div className="pt-8 border-t border-zinc-100">
          <div 
            onClick={() => setActiveTab('account')}
            className="bg-zinc-50 rounded-2xl p-4 flex items-center justify-between gap-3 cursor-pointer hover:bg-zinc-100 transition-all border border-transparent hover:border-zinc-200"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-zinc-200 border-2 border-white overflow-hidden flex items-center justify-center">
                 {userData?.photoURL ? (
                    <img src={userData.photoURL} alt="Admin" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                 ) : (
                    <Users className="w-5 h-5 text-zinc-400" />
                 )}
              </div>
              <div>
                <p className="text-xs font-black text-zinc-900 truncate max-w-[100px]">{userData?.displayName || 'Admin'}</p>
                <p className="text-[10px] font-bold text-emerald-500 uppercase">Status: Online</p>
              </div>
            </div>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                logout();
              }}
              className="p-2 hover:bg-zinc-200 rounded-xl text-zinc-400 hover:text-rose-600 transition-all"
              title="Terminate Session"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-12 overflow-y-auto">
        <header className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-zinc-900 capitalize">
              {activeTab.replace('-', ' ')}
            </h1>
            <p className="text-zinc-600 italic serif">Managing platform state and user orchestrations.</p>
          </div>
          <div className="flex gap-4">
             <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                <input 
                  type="text" 
                  placeholder="Universal search..." 
                  className="pl-12 pr-6 py-3 bg-white border border-zinc-200 rounded-2xl text-sm font-bold w-64 outline-none focus:ring-2 focus:ring-black/5"
                />
             </div>
             <button className="w-12 h-12 bg-white border border-zinc-200 rounded-2xl flex items-center justify-center text-zinc-900 hover:bg-zinc-50 transition-all">
                <Activity className="w-5 h-5 text-zinc-600" />
             </button>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {activeTab === 'overview' && <OverviewTab key="overview" stats={stats} onNavigate={setActiveTab} />}
          {activeTab === 'users' && <UsersTab key="users" />}
          {activeTab === 'content' && <ContentTab key="content" />}
          {activeTab === 'account' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 bg-white rounded-[3rem] border border-zinc-200 shadow-sm">
                <SettingsSection />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

function SidebarLink({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold text-sm transition-all ${
        active 
        ? 'bg-zinc-900 text-white shadow-xl shadow-zinc-200' 
        : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 px-4'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function OverviewTab({ stats, onNavigate }: { stats: any, onNavigate: (tab: AdminTab) => void }) {
  const { userData } = useAuth();
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-12"
    >
      {/* Admin Greeting */}
      <div 
        onClick={() => onNavigate('account')}
        className="bg-white border border-zinc-200 rounded-[3rem] p-8 flex items-center justify-between shadow-sm cursor-pointer group hover:border-zinc-400 transition-all"
      >
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 bg-zinc-100 rounded-[2rem] overflow-hidden border-2 border-white shadow-xl flex items-center justify-center group-hover:scale-105 transition-transform">
            {userData?.photoURL ? (
              <img src={userData.photoURL} alt="Admin" className="w-full h-full object-cover" />
            ) : (
              <Users className="w-8 h-8 text-zinc-300" />
            )}
          </div>
          <div>
            <h2 className="text-2xl font-black text-zinc-900 tracking-tight group-hover:text-zinc-600 transition-colors">Welcome back, {userData?.displayName || 'Root Admin'}</h2>
            <p className="text-zinc-600 font-bold uppercase text-[10px] tracking-widest mt-1">Platform orchestration node active</p>
          </div>
        </div>
        <div className="hidden lg:flex gap-4">
          <div className="text-right">
            <p className="text-[10px] font-black text-emerald-500 uppercase">System Status</p>
            <p className="text-xs font-bold text-zinc-900">Synchronized</p>
          </div>
          <div className="w-[1px] h-10 bg-zinc-100" />
          <div className="text-right">
            <p className="text-[10px] font-black text-blue-600 uppercase">Auth Level</p>
            <p className="text-xs font-bold text-zinc-900">Platform Admin</p>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <MetricCard 
          label="Total Entities" 
          value={stats.totalUsers} 
          trend="+12% weekly" 
          icon={<Users className="w-5 h-5 text-blue-700" />}
          bg="bg-blue-50"
        />
        <MetricCard 
          label="Concurrent Sessions" 
          value={stats.activeInterviews} 
          trend="Stable" 
          icon={<Activity className="w-5 h-5 text-emerald-600" />}
          bg="bg-emerald-50"
        />
        <MetricCard 
          label="Value Extractions" 
          value={stats.proAnalyses} 
          trend="+408 today" 
          icon={<Zap className="w-5 h-5 text-amber-500" />}
          bg="bg-amber-50"
        />
        <MetricCard 
          label="API Node Health" 
          value={stats.apiHealth} 
          trend="Optimal" 
          icon={<Globe className="w-5 h-5 text-blue-700" />}
          bg="bg-blue-50"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white border border-zinc-200 rounded-[3rem] p-10 shadow-sm relative overflow-hidden">
           <div className="flex justify-between items-center mb-10">
              <div>
                <h3 className="text-xl font-black text-zinc-900">User Growth Vector</h3>
                <p className="text-xs text-zinc-600 font-bold uppercase tracking-widest mt-1">Last 30-Day Orchestration</p>
              </div>
              <div className="flex gap-2">
                 <button className="px-4 py-2 bg-zinc-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest">Active</button>
                 <button className="px-4 py-2 bg-zinc-100 text-zinc-400 rounded-xl text-[10px] font-black uppercase tracking-widest">Historical</button>
              </div>
           </div>
           
           <div className="h-64 flex items-end gap-3 px-4">
              {[45, 67, 89, 120, 98, 145, 178, 156, 190, 210, 245, 190, 260, 280, 230].map((v, i) => (
                <div key={i} className="flex-1 space-y-2 group">
                   <div className="relative h-full flex flex-col justify-end">
                      <motion.div 
                        initial={{ height: 0 }}
                        animate={{ height: `${(v/300)*100}%` }}
                        className="w-full bg-zinc-100 rounded-full group-hover:bg-zinc-900 transition-all cursor-pointer relative"
                      >
                         <div className="absolute top-[-30px] left-1/2 -translate-x-1/2 bg-zinc-900 text-white text-[8px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            {v} Users
                         </div>
                      </motion.div>
                   </div>
                   <p className="text-[8px] text-zinc-300 font-bold text-center">D{i+1}</p>
                </div>
              ))}
           </div>
        </div>

        <div className="bg-zinc-900 text-white border border-zinc-800 rounded-[3rem] p-10 shadow-2xl relative overflow-hidden">
           <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full -mr-32 -mt-32 blur-3xl" />
           <h3 className="text-xl font-black mb-6">System Alerts</h3>
           <div className="space-y-6">
              <AlertItem 
                icon={<AlertTriangle className="w-4 h-4 text-amber-400" />} 
                title="Rate Limit Spike" 
                time="2m ago"
                desc="User ID #8291 exceeded tokens."
              />
              <AlertItem 
                icon={<CheckCircle2 className="w-4 h-4 text-emerald-400" />} 
                title="Backup Completed" 
                time="14m ago"
                desc="Cloud SQL mirror synchronized."
              />
              <AlertItem 
                icon={<Activity className="w-4 h-4 text-blue-500" />} 
                title="Gemini 1.5 Sync" 
                time="1h ago"
                desc="Context window optimization applied."
              />
              <AlertItem 
                icon={<ShieldCheck className="w-4 h-4 text-blue-500" />} 
                title="Firewall Audit" 
                time="3h ago"
                desc="No unauthorized access detected."
              />
           </div>
           <button className="w-full mt-10 py-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">
              View Log History
           </button>
        </div>
      </div>
    </motion.div>
  );
}

function MetricCard({ label, value, trend, icon, bg }: any) {
  return (
    <div className="bg-white border border-zinc-200 rounded-[2.5rem] p-8 shadow-sm hover:shadow-xl hover:shadow-zinc-100 transition-all group">
      <div className={`w-12 h-12 ${bg} rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110`}>
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-1">{label}</p>
        <h4 className="text-3xl font-black text-zinc-900 leading-tight">{value}</h4>
        <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-tighter mt-2">{trend}</p>
      </div>
    </div>
  );
}

function AlertItem({ icon, title, time, desc }: any) {
  return (
    <div className="flex gap-4 items-start pb-4 border-b border-white/10 last:border-0">
      <div className="pt-1">{icon}</div>
      <div>
        <div className="flex justify-between items-center mb-1">
          <h4 className="text-xs font-black">{title}</h4>
          <span className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest">{time}</span>
        </div>
        <p className="text-[10px] text-zinc-400 leading-tight">{desc}</p>
      </div>
    </div>
  );
}

function UsersTab() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const q = query(collection(db, 'users'), limit(20));
        const snap = await getDocs(q);
        const userList = snap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setUsers(userList);
      } catch (err) {
        console.error("Failed to fetch users:", err);
        // Fallback to mock data if fetch fails
        setUsers([
          { id: '1', displayName: 'Kesara Lalitha', email: 'kesarajulalitha@gmail.com', role: 'Platform Admin', tier: 'premium', usage: { resumeAnalyses: 12 } },
          { id: '2', displayName: 'Jane Candidate', email: 'jane.candidate@example.com', role: 'Senior Developer', tier: 'premium', usage: { resumeAnalyses: 5 } },
        ]);
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, []);

  if (loading) {
     return (
        <div className="h-64 flex items-center justify-center">
           <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} className="w-8 h-8 border-4 border-zinc-900 border-t-transparent rounded-full" />
        </div>
     );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white border border-zinc-200 rounded-[3.5rem] overflow-hidden shadow-sm"
    >
      <div className="p-8 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/30">
        <div className="flex items-center gap-4">
           <Users className="w-6 h-6 text-zinc-900" />
           <h3 className="text-xl font-black text-zinc-900">Registered Entities</h3>
        </div>
        <div className="flex gap-3">
           <button className="flex items-center gap-2 px-6 py-3 bg-white border border-zinc-200 rounded-xl text-xs font-bold text-zinc-600">
              <Filter className="w-4 h-4" /> Filter By Tier
           </button>
           <button className="flex items-center gap-2 px-6 py-3 bg-zinc-900 text-white rounded-xl text-xs font-bold">
              <Plus className="w-4 h-4" /> Provision New
           </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-zinc-100">
              <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-zinc-600">Identity</th>
              <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-zinc-600">Class & Level</th>
              <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-zinc-600">Status</th>
              <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-zinc-600">Usage</th>
              <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-zinc-600"></th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-zinc-50 hover:bg-zinc-50/50 transition-colors group">
                <td className="px-10 py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-zinc-100 rounded-xl flex items-center justify-center font-black text-zinc-500 group-hover:bg-zinc-900 group-hover:text-white transition-all overflow-hidden">
                       {user.photoURL ? (
                          <img src={user.photoURL} alt={user.displayName} className="w-full h-full object-cover" />
                       ) : (
                          user.displayName?.charAt(0) || 'U'
                       )}
                    </div>
                    <div>
                      <p className="text-sm font-black text-zinc-900">{user.displayName || 'Anonymous'}</p>
                      <p className="text-[10px] text-zinc-600 font-medium">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-10 py-6 text-sm font-bold text-zinc-600">
                  {user.role || 'User'}
                </td>
                <td className="px-10 py-6">
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    user.tier === 'premium' ? 'bg-blue-50 text-blue-700' : 'bg-zinc-100 text-zinc-600'
                  }`}>
                    {user.tier || 'basic'}
                  </span>
                </td>
                <td className="px-10 py-6">
                   <p className="text-xs font-bold text-zinc-900">{user.usage?.resumeAnalyses || 0} Analyses</p>
                </td>
                <td className="px-10 py-6 text-right">
                  <button className="p-3 text-zinc-500 hover:text-zinc-900 transition-colors">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

function ContentTab() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <AdminCard 
          icon={<Zap className="w-6 h-6 text-amber-500" />} 
          title="Internal Bootcamps" 
          desc="Manage active learning paths and module content."
          action="Manage 3 Active"
        />
        <AdminCard 
          icon={<MessageSquare className="w-6 h-6 text-blue-700" />} 
          title="AI Prompt Library" 
          desc="Refine Boost AI system prompts and response templates."
          action="Edit Library"
        />
      </div>

      <div className="bg-white border border-zinc-200 rounded-[3rem] p-10">
         <h3 className="text-xl font-black mb-8">Role Database</h3>
         <div className="space-y-4">
            {['AI Engineer', 'Product Manager', 'Data Scientist', 'Frontend Architect'].map(role => (
              <div key={role} className="flex items-center justify-between p-6 bg-zinc-50 border border-zinc-100 rounded-2xl hover:border-zinc-300 transition-all group">
                <div className="flex items-center gap-6">
                  <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-zinc-600">
                    <Search className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-zinc-900">{role}</span>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-[10px] text-zinc-600 font-bold uppercase">Linked Questions</p>
                    <p className="text-xs font-black">120+ Assets</p>
                  </div>
                  <button className="p-2 bg-white rounded-lg border border-zinc-100 text-zinc-400 hover:text-zinc-900">
                    <ArrowUpRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
         </div>
         <button className="w-full mt-8 py-5 border-2 border-dashed border-zinc-200 rounded-3xl text-[10px] font-black uppercase text-zinc-600 hover:border-zinc-900 hover:text-zinc-900 transition-all">
            Aggregate New Market Role
         </button>
      </div>
    </motion.div>
  );
}

function AdminCard({ icon, title, desc, action }: any) {
  return (
    <div className="p-10 bg-white border border-zinc-200 rounded-[3rem] shadow-sm hover:shadow-xl transition-all">
      <div className="w-14 h-14 bg-zinc-50 rounded-2xl flex items-center justify-center mb-6">{icon}</div>
      <h3 className="text-2xl font-black mb-2">{title}</h3>
          <p className="text-zinc-500 italic serif mb-8 leading-relaxed opacity-90">{desc}</p>
      <button className="px-8 py-4 bg-zinc-900 text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest">
        {action}
      </button>
    </div>
  );
}

