import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from '../components/UI';
import { Activity, Mail, Lock, ArrowRight, Check } from 'lucide-react';

interface LoginProps {
  onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);
      setTimeout(onLogin, 800);
    }, 1500);
  };

  return (
    <div className="relative w-full h-screen flex items-center justify-center overflow-hidden bg-brand-grey">
      {/* Animated Background Blobs - Light & Orange */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-brand-orange/20 rounded-full blur-[100px] animate-blob mix-blend-multiply" />
        <div className="absolute top-[20%] right-[-10%] w-[400px] h-[400px] bg-gray-300/40 rounded-full blur-[100px] animate-blob animation-delay-2000 mix-blend-multiply" />
        <div className="absolute bottom-[-10%] left-[20%] w-[600px] h-[600px] bg-white/60 rounded-full blur-[100px] animate-blob animation-delay-4000 mix-blend-overlay" />
      </div>

      <GlassCard 
        className="relative z-10 w-full max-w-md p-10 m-4 shadow-xl !bg-white/80 !border-white/60"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-orange to-red-500 flex items-center justify-center mb-4 shadow-lg shadow-orange-500/30">
            <Activity size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-light tracking-tight text-gray-900 mb-2">CourtFlow</h1>
          <p className="text-gray-500 text-sm font-light">Enter your credentials to access the dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1">
            <label className="text-xs uppercase tracking-wider text-gray-500 font-bold ml-1">Email Address</label>
            <div className="relative group">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-orange transition-colors" size={18} />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-10 pr-4 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange transition-all"
                placeholder="admin@courtflow.io"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs uppercase tracking-wider text-gray-500 font-bold ml-1">Password</label>
            <div className="relative group">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-orange transition-colors" size={18} />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-10 pr-4 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange transition-all"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || isSuccess}
            className={`w-full py-3.5 rounded-xl font-medium text-sm transition-all duration-300 relative overflow-hidden group shadow-lg ${
              isSuccess ? 'bg-green-500 text-white' : 'bg-brand-black text-white hover:bg-gray-800'
            }`}
          >
            <div className="relative z-10 flex items-center justify-center gap-2">
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : isSuccess ? (
                <Check size={20} className="animate-scale-in" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </div>
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-xs text-gray-400">
            Protected by Supabase Auth & RLS Policies.
          </p>
        </div>
      </GlassCard>
    </div>
  );
};

export default Login;