'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Zap, ArrowRight, AlertCircle, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { apiRequest } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { CompanyUser } from '@/lib/auth';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check for expired session query param
  useEffect(() => {
    if (searchParams.get('expired') === 'true') {
      setError('Your session has expired. Please sign in again.');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const result = await apiRequest<{ token: string; user: CompanyUser }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: email.toLowerCase().trim(),
          password,
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

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/3 -translate-x-1/2 w-[500px] h-[500px] bg-primary/15 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 translate-x-1/2 w-[400px] h-[400px] bg-ai/10 blur-[130px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
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

          <p className="text-sm text-muted mt-2 max-w-sm mx-auto">
            Autonomous operations and intelligence platform for modern trade contractors.
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
              <Input
                label="Password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                autoComplete="current-password"
              />
            </div>

            <Button type="submit" className="w-full mt-2" size="lg" isLoading={isLoading}>
              Sign In to Company Portal <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </form>

          {/* Security footnote */}
          <div className="mt-6 pt-5 border-t border-border/70 text-center">
            <div className="inline-flex items-center gap-1.5 text-xs text-subtle">
              <ShieldCheck className="w-3.5 h-3.5 text-accent" />
              <span>Protected by Elijah AI 256-bit encrypted session</span>
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
