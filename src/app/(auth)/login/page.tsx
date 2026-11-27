'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Zap,
  ArrowRight,
  AlertCircle,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Sparkles,
  Server,
  Building2,
  UserCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { apiRequest } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { CompanyUser } from '@/lib/auth';

type AuthPhase = 'idle' | 'authenticating' | 'success';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  const [email, setEmail] = useState('amohapatra@pods365.com');
  const [password, setPassword] = useState('password123');
  const [authPhase, setAuthPhase] = useState<AuthPhase>('idle');
  const [authStepText, setAuthStepText] = useState('Authenticating credentials...');
  const [userName, setUserName] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Forgot Password State
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotIsSubmitting, setForgotIsSubmitting] = useState(false);
  const [forgotSuccessMessage, setForgotSuccessMessage] = useState<string | null>(null);
  const [forgotError, setForgotError] = useState<string | null>(null);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);
    setForgotSuccessMessage(null);

    if (!forgotEmail) {
      setForgotError('Please enter your work email.');
      return;
    }

    setForgotIsSubmitting(true);
    try {
      const res = await apiRequest<{
        success: boolean;
        resetLink: string;
        email: string;
      }>('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email: forgotEmail.trim() }),
      });

      setForgotSuccessMessage(
        `A password reset link has been sent to ${res.email}. Please check your email inbox.`
      );
    } catch (err: any) {
      setForgotError(err.message || 'Failed to request password reset.');
    } finally {
      setForgotIsSubmitting(false);
    }
  };

  // Check for expired session query param
  useEffect(() => {
    if (searchParams.get('expired') === 'true') {
      setError('Your session has expired. Please sign in again.');
    }
  }, [searchParams]);

  const executeLogin = async (targetEmail: string, targetPass: string) => {
    setAuthPhase('authenticating');
    setError(null);

    // Step 1: Initializing Handshake
    setAuthStepText('🔐 Verifying 256-bit credentials...');

    try {
      // Small artificial step for visual feedback
      const timer1 = setTimeout(() => {
        setAuthStepText('⚡ Establishing encrypted tenant tunnel...');
      }, 450);

      const result = await apiRequest<{ token: string; user: CompanyUser }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: targetEmail.toLowerCase().trim(),
          password: targetPass,
        }),
      });

      clearTimeout(timer1);
      setAuthStepText('🏢 Loading company workforce...');
      setUserName(result.user.name);

      // Transition to Success Animation
      setAuthPhase('success');

      // Allow the user to see the success animation for 700ms before routing
      setTimeout(() => {
        login(result.token, result.user);
        router.push('/dashboard');
      }, 750);
    } catch (err: any) {
      setAuthPhase('idle');
      setError(err.message || 'Login failed. Please verify your credentials.');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeLogin(email, password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden select-none">
      {/* 1. Cyber Grid Ambient Background */}
      <div className="absolute inset-0 cyber-grid opacity-35 pointer-events-none" />

      {/* 2. Floating Ambient Glow Orbs */}
      <div className="absolute top-1/4 left-1/3 -translate-x-1/2 w-[550px] h-[550px] bg-primary/20 blur-[150px] rounded-full pointer-events-none animate-float-slow" />
      <div className="absolute bottom-1/4 right-1/3 translate-x-1/2 w-[480px] h-[480px] bg-ai/15 blur-[140px] rounded-full pointer-events-none animate-float-reverse" />

      {/* Subtle top light flare */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 max-w-xl h-[1px] bg-gradient-to-r from-transparent via-primary/60 to-transparent pointer-events-none" />

      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Brand header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-elevated/80 border border-border/80 text-[11px] text-slate-300 mb-3 shadow-md backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400/50" />
            <span>AI Operations Platform · 24/7 Autonomous</span>
          </div>

          <div className="flex items-center justify-center gap-3">
            <div className="relative">
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-primary to-ai opacity-70 blur-md animate-pulse" />
              <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-tr from-primary to-ai flex items-center justify-center text-white shadow-xl shadow-primary-glow">
                <Zap className="w-6 h-6 fill-white" />
              </div>
            </div>
            <h1 className="text-3xl font-black tracking-tight text-white drop-shadow-sm">
              ELIJAH <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-ai">AI</span>
            </h1>
          </div>

          <p className="text-xs text-muted mt-2 max-w-xs mx-auto leading-relaxed">
            Autonomous operations and intelligence platform for modern trade contractors.
          </p>
        </div>

        {/* Shimmer Border Wrapper for Login Card */}
        <div className="relative p-[1px] rounded-3xl bg-gradient-to-b from-primary/40 via-border/80 to-ai/30 shadow-[0_0_50px_rgba(79,70,229,0.15)]">
          <div className="bg-surface/95 backdrop-blur-2xl rounded-[calc(1.5rem-1px)] p-6 sm:p-8 relative overflow-hidden">
            
            {/* Top scanning beam when authenticating */}
            {authPhase === 'authenticating' && (
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent animate-shimmer" />
            )}

            {error && authPhase === 'idle' && (
              <div className="mb-5 p-3.5 bg-danger/10 border border-danger/30 rounded-2xl flex items-center gap-2.5 text-red-400 text-xs font-medium animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* FORGOT PASSWORD FORM */}
            {authPhase === 'idle' && showForgotPassword && (
              <form onSubmit={handleForgotPassword} className="space-y-4 text-left">
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Lock className="w-4 h-4 text-ai" />
                    <span>Reset Your Password</span>
                  </h3>
                  <p className="text-[11px] text-muted">
                    Enter your registered work email address. We will generate a secure reset link.
                  </p>
                </div>

                {forgotError && (
                  <div className="p-3 rounded-xl bg-danger-bg border border-danger/30 text-danger text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{forgotError}</span>
                  </div>
                )}

                {forgotSuccessMessage && (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{forgotSuccessMessage}</span>
                  </div>
                )}

                <div>
                  <Input
                    label="Work Email"
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="name@company.com"
                    autoComplete="email"
                    autoFocus
                  />
                </div>

                <div className="space-y-2 pt-1">
                  <Button
                    type="submit"
                    isLoading={forgotIsSubmitting}
                    className="w-full gap-2 text-xs font-bold shadow-lg shadow-primary-glow/30 bg-primary hover:bg-primary-hover text-white transition-all h-10"
                    size="lg"
                  >
                    <span>Send Password Reset Link</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotPassword(false);
                      setForgotError(null);
                      setForgotSuccessMessage(null);
                    }}
                    className="w-full text-center text-xs text-muted hover:text-white transition-colors py-1.5"
                  >
                    ← Back to Sign In
                  </button>
                </div>
              </form>
            )}

            {/* PHASE 1: Normal Form */}
            {authPhase === 'idle' && !showForgotPassword && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Input
                    label="Work Email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    autoComplete="email"
                    autoFocus
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-slate-300">Password</span>
                    <button
                      type="button"
                      onClick={() => {
                        setForgotEmail(email);
                        setShowForgotPassword(true);
                      }}
                      className="text-[11px] font-semibold text-ai hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <Input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    autoComplete="current-password"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full mt-2 gap-2 text-xs font-bold shadow-lg shadow-primary-glow/30 bg-primary hover:bg-primary-hover text-white transition-all h-10"
                  size="lg"
                >
                  <span>Sign In to Company Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </form>
            )}

            {/* PHASE 2: Futuristic Orbital Animation during Sign-In */}
            {authPhase === 'authenticating' && (
              <div className="py-8 flex flex-col items-center justify-center space-y-5 text-center animate-in fade-in zoom-in-95 duration-300">
                {/* Dual Rotating Rings */}
                <div className="relative w-24 h-24 flex items-center justify-center">
                  {/* Outer Dashed Ring */}
                  <div className="absolute inset-0 rounded-full border-2 border-dashed border-primary/50 animate-spin-slow" />
                  
                  {/* Middle Reverse Ring */}
                  <div className="absolute inset-2 rounded-full border-2 border-ai/40 border-t-transparent animate-spin-reverse" />
                  
                  {/* Pulsing Core Radar */}
                  <div className="absolute inset-5 rounded-full bg-primary/20 border border-primary/40 animate-pulse-ring" />
                  
                  {/* Center Glowing Icon */}
                  <div className="relative z-10 w-10 h-10 rounded-full bg-surface-elevated border border-primary/60 flex items-center justify-center text-primary shadow-lg shadow-primary-glow">
                    <Lock className="w-4 h-4 text-white animate-pulse" />
                  </div>
                </div>

                {/* Status Step Text */}
                <div className="space-y-1">
                  <p className="text-xs font-bold text-white font-mono tracking-wide">
                    {authStepText}
                  </p>
                  <p className="text-[10px] text-muted">
                    Establishing zero-trust encrypted workspace session
                  </p>
                </div>
              </div>
            )}

            {/* PHASE 3: Success Glow State */}
            {authPhase === 'success' && (
              <div className="py-8 flex flex-col items-center justify-center space-y-4 text-center animate-in fade-in zoom-in-95 duration-300">
                <div className="relative">
                  <div className="absolute -inset-3 rounded-full bg-emerald-500/30 blur-xl animate-pulse" />
                  <div className="relative w-20 h-20 rounded-full bg-emerald-500/10 border-2 border-emerald-400 flex items-center justify-center text-emerald-400 shadow-xl shadow-emerald-500/20">
                    <CheckCircle2 className="w-10 h-10 animate-in zoom-in duration-300" />
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-white">
                    ✨ Authenticated Successfully
                  </h3>
                  <p className="text-xs text-emerald-400 font-medium">
                    Welcome back, {userName || 'Contractor'}!
                  </p>
                  <p className="text-[10px] text-muted mt-1 font-mono">
                    Launching operations workspace...
                  </p>
                </div>
              </div>
            )}

            {/* Quick Demo Role Switcher */}
            {authPhase === 'idle' && !showForgotPassword && (
              <div className="mt-5 pt-4 border-t border-border/60 space-y-2">
                <div className="flex items-center justify-between text-[10px] text-muted font-semibold uppercase tracking-wider">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-ai" />
                    <span>Demo Role Switcher</span>
                  </span>
                  <span className="text-[9px] text-slate-500">1-Click Credentials</span>
                </div>

                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setEmail('amohapatra@pods365.com');
                      setPassword('password123');
                      setError(null);
                    }}
                    className={`p-2 rounded-xl border text-left transition-all ${
                      email === 'amohapatra@pods365.com'
                        ? 'bg-primary/20 border-primary text-white shadow-sm ring-1 ring-primary/40'
                        : 'bg-surface-elevated/70 border-border/80 hover:border-border-hover text-slate-300 hover:text-white'
                    }`}
                  >
                    <div className="text-xs font-bold flex items-center gap-1">
                      <span>👑</span>
                      <span className="truncate">Owner</span>
                    </div>
                    <p className="text-[9px] text-muted truncate mt-0.5 font-mono">amohapatra</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setEmail('tekchand@pods365.com');
                      setPassword('password123');
                      setError(null);
                    }}
                    className={`p-2 rounded-xl border text-left transition-all ${
                      email === 'tekchand@pods365.com'
                        ? 'bg-primary/20 border-primary text-white shadow-sm ring-1 ring-primary/40'
                        : 'bg-surface-elevated/70 border-border/80 hover:border-border-hover text-slate-300 hover:text-white'
                    }`}
                  >
                    <div className="text-xs font-bold flex items-center gap-1">
                      <span>⚡</span>
                      <span className="truncate">Dispatcher</span>
                    </div>
                    <p className="text-[9px] text-muted truncate mt-0.5 font-mono">tekchand</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setEmail('aswajit.cool123@pods365.com');
                      setPassword('password123');
                      setError(null);
                    }}
                    className={`p-2 rounded-xl border text-left transition-all ${
                      email === 'aswajit.cool123@pods365.com'
                        ? 'bg-primary/20 border-primary text-white shadow-sm ring-1 ring-primary/40'
                        : 'bg-surface-elevated/70 border-border/80 hover:border-border-hover text-slate-300 hover:text-white'
                    }`}
                  >
                    <div className="text-xs font-bold flex items-center gap-1">
                      <span>🔧</span>
                      <span className="truncate">Technician</span>
                    </div>
                    <p className="text-[9px] text-muted truncate mt-0.5 font-mono">aswajit</p>
                  </button>
                </div>
              </div>
            )}

            {/* Security footnote */}
            <div className="mt-5 pt-3 border-t border-border/40 text-center">
              <div className="inline-flex items-center gap-1.5 text-[10px] text-muted">
                <ShieldCheck className="w-3.5 h-3.5 text-accent" />
                <span>Protected by Elijah AI 256-bit encrypted session</span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="w-8 h-8 rounded-xl bg-primary/20 border border-primary/40 animate-pulse" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
