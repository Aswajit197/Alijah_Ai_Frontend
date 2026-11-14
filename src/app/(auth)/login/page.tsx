'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Zap, ArrowRight, AlertCircle, ShieldAlert, Sparkles, Building2, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { apiRequest } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { CompanyUser } from '@/lib/auth';

const DEMO_ROLES = [
  { role: 'Owner', name: 'Michael Carter', email: 'owner@pashupat.cloud', desc: 'Executive & Approvals' },
  { role: 'Office Manager', name: 'Amanda Brooks', email: 'office@pashupat.cloud', desc: 'Inbox & Exceptions' },
  { role: 'Dispatcher', name: 'Robert Martinez', email: 'dispatcher@pashupat.cloud', desc: 'Schedule & Routing' },
  { role: 'Sales', name: 'Daniel Reed', email: 'sales@pashupat.cloud', desc: 'Pipeline & Proposals' },
  { role: 'Technician', name: 'Mike Rodriguez', email: 'technician@pashupat.cloud', desc: 'Mobile Field App' },
  { role: 'Finance', name: 'Rachel Green', email: 'finance@pashupat.cloud', desc: 'AR & Invoices' },
];

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  const [email, setEmail] = useState('owner@pashupat.cloud');
  const [password, setPassword] = useState('password123');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check for expired session query param
  useEffect(() => {
    if (searchParams.get('expired') === 'true') {
      setError('Your session has expired. Please sign in again.');
    }
  }, [searchParams]);

  const handleSubmit = async (e?: React.FormEvent, customEmail?: string) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setError(null);

    const loginEmail = customEmail || email;

    try {
      const result = await apiRequest<{ token: string; user: CompanyUser }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: loginEmail.toLowerCase().trim(),
          password: password,
        }),
      });

      login(result.token, result.user);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please verify your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('password123');
    handleSubmit(undefined, demoEmail);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/3 -translate-x-1/2 w-[500px] h-[500px] bg-primary/15 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 translate-x-1/2 w-[400px] h-[400px] bg-ai/10 blur-[130px] rounded-full pointer-events-none" />

      <div className="w-full max-w-xl relative z-10">
        {/* Brand header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-elevated border border-border/80 text-xs text-slate-300 mb-4 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>AI Operations Platform · Multi-Tenant</span>
          </div>

          <div className="flex items-center justify-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-ai flex items-center justify-center text-white shadow-lg shadow-primary-glow">
              <Zap className="w-5 h-5 fill-white" />
            </div>
            <h1 className="text-3xl font-black tracking-tight text-white">ELIJAH AI</h1>
          </div>

          <p className="text-sm text-muted mt-2 max-w-md mx-auto">
            Your 24/7 AI workforce that handles incoming calls, scheduling, estimates, and billing inside your field operations.
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-surface/90 backdrop-blur-xl border border-border rounded-3xl p-6 sm:p-8 shadow-2xl">
          {error && (
            <div className="mb-6 p-4 bg-danger/10 border border-danger/30 rounded-2xl flex items-center gap-3 text-red-400 text-xs font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={(e) => handleSubmit(e)} className="space-y-4">
            <div>
              <Input
                label="Work Email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
              />
            </div>

            <div>
              <Input
                label="Password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
              />
            </div>

            <Button type="submit" className="w-full mt-2" size="lg" isLoading={isLoading}>
              Sign In to Company Portal <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </form>

          {/* Quick Demo Role Switcher */}
          <div className="mt-8 pt-6 border-t border-border/80">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-ai" />
                1-Click Role Explorer (Demo Mode)
              </span>
              <span className="text-[11px] text-subtle">Password: password123</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {DEMO_ROLES.map((d) => (
                <button
                  key={d.role}
                  type="button"
                  onClick={() => handleQuickLogin(d.email)}
                  disabled={isLoading}
                  className="flex flex-col items-start p-2.5 rounded-xl bg-surface-elevated/50 hover:bg-surface-elevated border border-border/60 hover:border-border-hover text-left transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  <span className="font-semibold text-xs text-slate-100">{d.role}</span>
                  <span className="text-[10px] text-muted truncate w-full mt-0.5">{d.name}</span>
                  <span className="text-[9px] text-ai mt-1 font-mono truncate w-full">{d.desc}</span>
                </button>
              ))}
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
