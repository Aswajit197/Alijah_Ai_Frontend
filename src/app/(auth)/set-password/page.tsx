'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Zap,
  Lock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Building2,
  Clock,
  Sparkles,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { apiRequest } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { CompanyUser } from '@/lib/auth';

interface InvitationDetails {
  valid: boolean;
  email: string;
  name: string;
  tenantName: string;
  tenantSlug: string;
  role: string;
  expiresAt: string;
}

function SetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const { login } = useAuth();

  const [invitation, setInvitation] = useState<InvitationDetails | null>(null);
  const [isValidating, setIsValidating] = useState(true);
  const [validationError, setValidationError] = useState<string | null>(null);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setValidationError('No invitation token found in link.');
      setIsValidating(false);
      return;
    }

    const verifyToken = async () => {
      try {
        const data = await apiRequest<InvitationDetails>(`/auth/invitation/${token}`);
        setInvitation(data);
      } catch (err: any) {
        setValidationError(err.message || 'Invitation is invalid or has expired.');
      } finally {
        setIsValidating(false);
      }
    };

    verifyToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (password.length < 8) {
      setSubmitError('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setSubmitError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await apiRequest<{ token: string; user: CompanyUser }>('/auth/set-password', {
        method: 'POST',
        body: JSON.stringify({
          token,
          password,
        }),
      });

      setIsSuccess(true);
      // Automatically log the user in with their new credentials
      login(result.token, result.user);

      // Short delay for visual delight, then navigate to dashboard
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to set password. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // State 1: Verifying token
  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/20 border border-primary/40 flex items-center justify-center text-primary mx-auto animate-pulse">
            <Zap className="w-6 h-6 fill-primary" />
          </div>
          <p className="text-sm font-medium text-muted">
            Verifying single-use invitation security token...
          </p>
        </div>
      </div>
    );
  }

  // State 2: Invalid or expired token
  if (validationError || !invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <div className="w-full max-w-md p-8 rounded-3xl bg-surface/90 border border-border text-center space-y-5 shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-danger/10 border border-danger/20 flex items-center justify-center text-red-400 mx-auto">
            <AlertCircle className="w-7 h-7" />
          </div>

          <div>
            <h1 className="text-xl font-bold text-white">Invitation Expired or Invalid</h1>
            <p className="text-xs text-muted mt-2 leading-relaxed">
              {validationError || 'This single-use link has expired or has already been used to set a password.'}
            </p>
          </div>

          <div className="pt-2">
            <Link href="/login">
              <Button className="w-full" variant="outline">
                Return to Login
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // State 3: Success Screen
  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <div className="w-full max-w-md p-8 rounded-3xl bg-surface/90 border border-border text-center space-y-5 shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mx-auto animate-bounce">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div>
            <h1 className="text-xl font-bold text-white">Password Activated!</h1>
            <p className="text-xs text-muted mt-2">
              Welcome to <strong>{invitation.tenantName}</strong>. Launching your operations dashboard...
            </p>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-elevated text-xs text-primary font-mono animate-pulse">
            <span>Signing you in securely...</span>
          </div>
        </div>
      </div>
    );
  }

  // State 4: Set Password Form
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/3 -translate-x-1/2 w-[500px] h-[500px] bg-primary/15 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 translate-x-1/2 w-[400px] h-[400px] bg-ai/10 blur-[130px] rounded-full pointer-events-none" />

      <div className="w-full max-w-lg relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-elevated border border-border/80 text-xs text-slate-300 mb-3 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-ai" />
            <span>Onboarding & Account Activation</span>
          </div>

          <div className="flex items-center justify-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary to-ai flex items-center justify-center text-white shadow-md shadow-primary-glow">
              <Zap className="w-5 h-5 fill-white" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white">ELIJAH AI</h1>
          </div>
        </div>

        {/* Set Password Card */}
        <div className="bg-surface/90 backdrop-blur-xl border border-border rounded-3xl p-6 sm:p-8 shadow-2xl">
          {/* Tenant & User Greeting */}
          <div className="p-4 rounded-2xl bg-surface-card border border-border/80 mb-6 flex items-start justify-between gap-4">
            <div>
              <span className="text-[10px] font-mono uppercase text-muted tracking-wider">
                Invitation For
              </span>
              <h2 className="text-base font-bold text-white">{invitation.name}</h2>
              <p className="text-xs text-slate-300 mt-0.5">{invitation.email}</p>
            </div>

            <div className="text-right">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-primary/20 text-primary border border-primary/30">
                <ShieldCheck className="w-3 h-3" />
                <span>{invitation.role}</span>
              </span>
              <p className="text-[11px] text-muted mt-1 truncate max-w-[150px]">
                {invitation.tenantName}
              </p>
            </div>
          </div>

          {/* Expiration warning banner */}
          <div className="mb-5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-2 text-xs text-amber-400">
            <Clock className="w-4 h-4 shrink-0" />
            <span>Single-use invitation link · Valid for 24 hours</span>
          </div>

          {submitError && (
            <div className="mb-5 p-3.5 bg-danger/10 border border-danger/30 rounded-xl flex items-center gap-2.5 text-red-400 text-xs font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{submitError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Input
                label="New Password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                helper="Must contain 8 or more characters"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 text-muted hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div>
              <Input
                label="Confirm Password"
                type={showPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat your password"
              />
            </div>

            <Button
              type="submit"
              className="w-full mt-2"
              size="lg"
              isLoading={isSubmitting}
            >
              Activate Account & Enter Operations <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </form>

          <div className="mt-6 pt-5 border-t border-border/80 text-center">
            <p className="text-xs text-muted">
              Already have an active password?{' '}
              <Link href="/login" className="text-primary hover:underline font-semibold">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="w-8 h-8 rounded-xl bg-primary/20 border border-primary/40 animate-pulse" />
        </div>
      }
    >
      <SetPasswordForm />
    </Suspense>
  );
}

