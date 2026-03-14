"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from '@/components/Ui';
import { Activity, Mail, Lock, ArrowRight, Check } from 'lucide-react';
import { auth } from '@/firebase';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

const Login: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message || "Failed to sign in with Google");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative w-full h-screen flex items-center justify-center overflow-hidden bg-brand-grey">
      {/* Animated Background Blobs */}
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
          <p className="text-gray-500 text-sm font-light">Sign in to access the dashboard</p>
        </div>

        <div className="space-y-4">
          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 py-3.5 px-4 bg-white border border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-all shadow-sm group"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-brand-orange/30 border-t-brand-orange rounded-full animate-spin" />
            ) : (
              <>
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
                <span>Sign in with Google</span>
              </>
            )}
          </button>

          {error && (
            <p className="text-xs text-red-500 text-center bg-red-50 p-2 rounded-lg border border-red-100">
              {error}
            </p>
          )}
        </div>

        <div className="mt-8 text-center">
          <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">
            Secure Admin Access Only
          </p>
        </div>
      </GlassCard>
    </div>
  );
};

export default Login;