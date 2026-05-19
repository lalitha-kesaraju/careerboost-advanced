import React, { useState } from 'react';
import { useAuth } from '../App';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, Mail, ArrowRight, Sparkles, Shield, Rocket } from 'lucide-react';

export function AuthPage() {
  const { login } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    try {
      await login(email, password);
    } catch (err) {
      setError('Authentication failed. Check your credentials.');
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6 font-sans swiss-grid overflow-hidden">
      <div className="max-w-6xl w-full flex flex-col md:flex-row bg-white border border-zinc-200 overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,0.05)] relative z-10 rounded-[3rem]">
        {/* Left Side: Branding */}
        <div className="md:w-1/2 p-16 md:p-24 flex flex-col justify-between relative overflow-hidden bg-white border-b md:border-b-0 md:border-r border-zinc-200 text-center md:text-left">
          <div className="absolute top-0 right-0 w-full h-full bg-cyan-600/[0.02] skew-x-12 translate-x-1/2 pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center justify-center md:justify-start gap-4 mb-24">
              <div className="w-12 h-12 bg-cyan-600 rounded-2xl flex items-center justify-center text-white font-bold shadow-xl shadow-cyan-100 italic text-2xl">
                C
              </div>
              <span className="text-xl font-bold tracking-tight text-zinc-900 font-display">CareerBoost</span>
            </div>
            <h1 className="text-7xl font-extrabold leading-[0.9] tracking-tighter text-zinc-900 font-display mb-10">
              Forge your<br/>
              <span className="text-cyan-600">professional</span><br/>
              destiny.
            </h1>
            <p className="text-zinc-500 text-lg font-medium max-w-sm leading-relaxed mx-auto md:mx-0">
              Cognitive diagnostics and career acceleration powered by verified AI logic patterns.
            </p>
          </div>

          <div className="relative z-10 space-y-12 pt-24 hidden md:block">
             <div className="flex items-center gap-8 group">
                <div className="w-14 h-14 bg-zinc-50 rounded-3xl flex items-center justify-center border border-zinc-100 group-hover:bg-cyan-50 transition-colors">
                   <Shield className="w-6 h-6 text-cyan-600" />
                </div>
                <div>
                   <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">Architecture</p>
                   <p className="text-lg font-bold text-zinc-900 tracking-tight">Verified Infrastructure</p>
                </div>
             </div>
             <div className="flex items-center gap-8 group">
                <div className="w-14 h-14 bg-zinc-50 rounded-3xl flex items-center justify-center border border-zinc-100 group-hover:bg-cyan-50 transition-colors">
                   <Sparkles className="w-6 h-6 text-cyan-600" />
                </div>
                <div>
                   <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">Intelligence</p>
                   <p className="text-lg font-bold text-zinc-900 tracking-tight">AI Calibration System</p>
                </div>
             </div>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="md:w-1/2 p-16 md:p-24 flex flex-col justify-center bg-white">
          <div className="max-w-sm mx-auto w-full space-y-14">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-cyan-600 rounded-2xl flex items-center justify-center text-white mb-6 shadow-xl shadow-cyan-100">
                {isLogin ? <Lock className="w-8 h-8" /> : <Rocket className="w-8 h-8" />}
              </div>
              <h2 className="text-4xl font-bold text-zinc-900 tracking-tighter font-display mb-4">
                {isLogin ? 'Welcome Back' : 'Join CareerBoost'}
              </h2>
              <p className="text-zinc-400 text-sm font-medium">
                {isLogin ? 'Sign in to your account' : 'Start your professional journey today'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-10">
              <div className="space-y-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-zinc-300" />
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full pl-12 pr-4 py-5 bg-white border border-zinc-100 rounded-2xl text-zinc-900 focus:outline-none focus:border-cyan-600 focus:ring-4 focus:ring-cyan-500/5 transition-all text-base font-medium placeholder:text-zinc-200 shadow-sm"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-1">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-zinc-300" />
                    <input 
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-12 pr-4 py-5 bg-white border border-zinc-100 rounded-2xl text-zinc-900 focus:outline-none focus:border-cyan-600 focus:ring-4 focus:ring-cyan-500/5 transition-all text-base font-medium placeholder:text-zinc-200 shadow-sm"
                    />
                  </div>
                </div>
              </div>

              {error && (
                <p className="text-[11px] text-rose-600 font-bold bg-rose-50 p-5 border border-rose-100 rounded-2xl leading-relaxed animate-in fade-in slide-in-from-top-2">
                  System Exception: {error}
                </p>
              )}

              <button 
                type="submit"
                className="w-full py-5.5 bg-cyan-600 text-white font-bold text-sm uppercase tracking-widest hover:bg-cyan-700 transition-all shadow-2xl shadow-cyan-100 rounded-[2rem] flex items-center justify-center gap-3 group"
              >
                {isLogin ? 'Sign In' : 'Create Account'}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </form>

            <div className="text-center pt-8">
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 hover:text-cyan-600 transition-colors py-2"
                id="switch-auth-mode"
              >
                {isLogin ? "Create New Account" : "Already have an account? Sign In"}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Decorative text */}
      <div className="absolute bottom-10 left-10 text-[180px] font-black text-zinc-200/40 uppercase tracking-tighter leading-none pointer-events-none select-none hidden lg:block italic">
        BOOST
      </div>
    </div>
  );
}
