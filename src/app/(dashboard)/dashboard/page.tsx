'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { apiRequest } from '@/lib/api';
import {
  Zap,
  PhoneCall,
  CalendarPlus,
  Users,
  AlertTriangle,
  Sparkles,
  Bot,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Clock,
  Truck,
  Check,
  FileText,
  MapPin,
  ExternalLink,
  RefreshCw,
  ShieldCheck,
  Wrench,
  Search,
  Copy,
  QrCode,
} from 'lucide-react';

interface RealJob {
  id: string;
  jobNumber?: string;
  title: string;
  status: string;
  priority: string;
  scheduledDate?: string;
  scheduledStart?: string;
  scheduledEnd?: string;
  serviceAddress?: string;
  gateCode?: string;
  reportedIssue?: string;
  notes?: string;
  totalAmount?: number | null;
  createdAt: string;
  customer?: {
    id: string;
    name: string;
    phone: string;
    address?: string;
    city?: string;
    state?: string;
  };
  technician?: {
    id: string;
    name: string;
    email: string;
  } | null;
}

interface RealTechnician {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: {
    name: string;
    slug: string;
  };
}

interface RealVoiceCall {
  id: string;
  callerNumber?: string;
  customerName?: string;
  serviceAddress?: string;
  summary?: string;
  userSentiment?: string;
  status?: string;
  isSuccessful?: boolean;
  createdAt?: string;
  bookingStatus?: string;
}

export default function DashboardPage() {
  const { user } = useAuth();

  const [jobs, setJobs] = useState<RealJob[]>([]);
  const [technicians, setTechnicians] = useState<RealTechnician[]>([]);
  const [calls, setCalls] = useState<RealVoiceCall[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');

  const loadDashboardData = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const [jobsData, techsData, callsData] = await Promise.all([
        apiRequest<RealJob[]>('/jobs').catch(() => []),
        apiRequest<RealTechnician[]>('/jobs/technicians').catch(() => []),
        apiRequest<RealVoiceCall[]>('/jobs/voice-calls').catch(() => []),
      ]);

      setJobs(jobsData || []);
      setTechnicians(techsData || []);
      setCalls(callsData || []);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Derived real metrics (No dummy data)
  const totalJobsCount = jobs.length;
  const activeJobs = jobs.filter((j) => ['SCHEDULED', 'DISPATCHED', 'EN_ROUTE', 'ON_SITE'].includes(j.status));
  const unassignedJobs = jobs.filter((j) => !j.technician || !j.technician.id || j.status === 'UNSCHEDULED');
  const completedJobs = jobs.filter((j) => j.status === 'COMPLETED');
  const emergencyJobs = jobs.filter((j) => j.priority === 'EMERGENCY' && j.status !== 'COMPLETED');
  const fieldTechnicians = technicians.filter((t) => t.role?.slug === 'technician');

  // Human-in-the-Loop Escalations (Real triggers only)
  interface Escalation {
    id: string;
    type: 'unassigned' | 'emergency' | 'declined' | 'call_friction';
    title: string;
    context: string;
    urgency: 'CRITICAL' | 'HIGH' | 'NORMAL';
    actionLabel: string;
    actionHref: string;
  }

  const escalations: Escalation[] = [];

  // 1. Unassigned jobs require dispatch assignment
  for (const job of unassignedJobs) {
    escalations.push({
      id: `unassigned-${job.id}`,
      type: 'unassigned',
      title: `Unassigned Work Order: ${job.jobNumber || job.title}`,
      context: `${job.reportedIssue || 'Service visit booked via 24/7 AI'} — Customer: ${job.customer?.name || 'Customer'} (${job.serviceAddress || 'Address on file'})`,
      urgency: job.priority === 'EMERGENCY' ? 'CRITICAL' : 'HIGH',
      actionLabel: 'Assign Tech',
      actionHref: `/schedule?jobId=${job.id}&jobNumber=${job.jobNumber || ''}`,
    });
  }

  // 2. Emergency work orders needing immediate attention
  for (const job of emergencyJobs) {
    if (!escalations.some((e) => e.id === `unassigned-${job.id}`)) {
      escalations.push({
        id: `emergency-${job.id}`,
        type: 'emergency',
        title: `EMERGENCY Hazard: ${job.jobNumber || job.title}`,
        context: `${job.reportedIssue} — Tech: ${job.technician?.name || 'Unassigned'} (${job.serviceAddress})`,
        urgency: 'CRITICAL',
        actionLabel: 'View Schedule',
        actionHref: `/schedule?jobId=${job.id}&jobNumber=${job.jobNumber || ''}`,
      });
    }
  }

  // 3. Tech Declined Jobs
  for (const job of jobs) {
    if (job.notes && job.notes.includes('[ESCALATION]')) {
      escalations.push({
        id: `declined-${job.id}`,
        type: 'declined',
        title: `Technician Declined Job: ${job.jobNumber || job.title}`,
        context: job.notes,
        urgency: 'HIGH',
        actionLabel: 'Reassign Lane',
        actionHref: `/schedule?jobId=${job.id}&jobNumber=${job.jobNumber || ''}`,
      });
    }
  }

  // 4. Inbound Call Review (Negative sentiment or dropped)
  for (const call of calls) {
    if (call.userSentiment === 'Negative' || call.isSuccessful === false) {
      escalations.push({
        id: `call-${call.id}`,
        type: 'call_friction',
        title: `Inbound Call Friction: ${call.customerName || 'Caller'}`,
        context: call.summary || 'Call ended before appointment confirmation or customer sentiment was negative.',
        urgency: 'HIGH',
        actionLabel: 'Review Audio in Inbox',
        actionHref: `/inbox`,
      });
    }
  }

  // Booking Link URL
  const bookingUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/book/${user?.tenantSlug || 'vanguard-electric'}`
    : `https://elijahai.pashupatashastra.in/book/${user?.tenantSlug || 'vanguard-electric'}`;

  const handleCopyLink = () => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(bookingUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  // Filtered jobs if user is searching
  const filteredJobs = searchQuery.trim()
    ? jobs.filter(
        (j) =>
          j.jobNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          j.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          j.customer?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          j.reportedIssue?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : jobs;

  return (
    <div className="space-y-6 pb-12">
      {/* ========================================================================= */}
      {/* 1. TOP HEADER: Status, Greeting & Quick Action Buttons                    */}
      {/* ========================================================================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-border/70">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Good morning, {user?.name?.split(' ')[0] || 'Team'}
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-primary/20 text-primary border border-primary/30">
              {user?.role?.name || 'Business Owner'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-muted mt-1 flex items-center gap-2">
            <span>{user?.tenantName || 'Vanguard Electric & Power'}</span>
            <span className="text-subtle">·</span>
            <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Elijah AI 24/7 Voice Dispatch Active
            </span>
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => loadDashboardData(true)}
            disabled={isRefreshing}
            className="h-8 text-xs gap-1.5"
            title="Refresh Live Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-primary' : 'text-muted'}`} />
            <span>Refresh</span>
          </Button>

          <Link href="/schedule">
            <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5">
              <CalendarPlus className="w-3.5 h-3.5 text-primary" />
              <span>Schedule Board</span>
            </Button>
          </Link>

          <Link href="/inbox">
            <Button variant="primary" size="sm" className="h-8 text-xs gap-1.5 shadow-md shadow-primary-glow/20">
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Unified Inbox</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. REAL OPERATIONAL METRICS (100% Live Database Values)                   */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Metric 1: Scheduled / Active Work Orders */}
        <div className="p-4 rounded-2xl bg-surface/90 border border-border shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted">Active Work Orders</span>
            <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/20 text-primary">
              <CalendarPlus className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-white tracking-tight">
              {isLoading ? '...' : activeJobs.length}
            </div>
            <div className="text-[11px] text-subtle mt-0.5">
              {totalJobsCount} total orders in system
            </div>
          </div>
        </div>

        {/* Metric 2: Field Technicians Active */}
        <div className="p-4 rounded-2xl bg-surface/90 border border-border shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted">Field Technicians</span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-white tracking-tight">
              {isLoading ? '...' : `${fieldTechnicians.length} Active`}
            </div>
            <div className="text-[11px] text-emerald-400/90 mt-0.5">
              {fieldTechnicians.length > 0 ? 'All certified & synced' : 'Add techs in settings'}
            </div>
          </div>
        </div>

        {/* Metric 3: Unassigned Work Orders */}
        <div className="p-4 rounded-2xl bg-surface/90 border border-border shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted">Unassigned Triage</span>
            <div className={`p-1.5 rounded-lg border ${
              unassignedJobs.length > 0
                ? 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                : 'bg-surface-elevated border-border text-muted'
            }`}>
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className={`text-2xl font-extrabold tracking-tight ${
              unassignedJobs.length > 0 ? 'text-amber-400' : 'text-white'
            }`}>
              {isLoading ? '...' : `${unassignedJobs.length} Jobs`}
            </div>
            <div className="text-[11px] text-subtle mt-0.5">
              {unassignedJobs.length > 0 ? 'Awaiting technician assignment' : 'All jobs dispatched'}
            </div>
          </div>
        </div>

        {/* Metric 4: Completed Jobs */}
        <div className="p-4 rounded-2xl bg-surface/90 border border-border shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted">Completed Work</span>
            <div className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-white tracking-tight">
              {isLoading ? '...' : completedJobs.length}
            </div>
            <div className="text-[11px] text-subtle mt-0.5">
              Done &amp; signed off
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. MAIN SECTION: Needs Your Attention (7 Cols) + Operations & Fleet (5)    */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Needs Your Attention (Real Exceptions Only) */}
        <div className="lg:col-span-7 rounded-2xl bg-surface/90 border border-border p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                  <span>Needs Your Attention</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                      escalations.length > 0
                        ? 'bg-amber-500/20 text-amber-400 border-amber-500/30 animate-pulse'
                        : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    }`}
                  >
                    {isLoading ? '...' : `${escalations.length} Pending`}
                  </span>
                </h2>
                <p className="text-[11px] text-muted">
                  Operational exceptions flagged by Elijah AI for human review
                </p>
              </div>
            </div>

            <Link href="/schedule" className="text-xs text-primary hover:underline font-medium">
              Go to Schedule &rarr;
            </Link>
          </div>

          {/* Escalations List */}
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center text-muted gap-2">
              <RefreshCw className="w-5 h-5 animate-spin text-primary" />
              <span className="text-xs">Checking operational status...</span>
            </div>
          ) : escalations.length === 0 ? (
            /* Clean Empty State: When operations are normal */
            <div className="py-10 px-6 rounded-2xl bg-surface-elevated/40 border border-border/70 text-center flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-3">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-white mb-1">
                All Operations Autonomous &amp; On Track
              </h3>
              <p className="text-xs text-muted max-w-md leading-relaxed">
                No manual intervention required right now. Elijah AI is actively receiving inbound calls, verifying service area coverage, and scheduling appointments.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {escalations.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-xl bg-surface-elevated/60 border border-border hover:border-primary/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${
                          item.urgency === 'CRITICAL'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {item.urgency}
                      </span>
                      <h4 className="text-xs font-bold text-white truncate">{item.title}</h4>
                    </div>
                    <p className="text-xs text-muted leading-relaxed line-clamp-2">
                      {item.context}
                    </p>
                  </div>

                  <Link href={item.actionHref} className="shrink-0">
                    <Button size="sm" variant="primary" className="h-7 text-xs px-3 gap-1 shadow-sm">
                      <span>{item.actionLabel}</span>
                      <ArrowRight className="w-3 h-3" />
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          )}

          <div className="pt-3 border-t border-border/70 flex items-center justify-between text-xs text-muted">
            <span>Autonomous AI auto-triage handles standard calls without disturbing staff.</span>
            <Link href="/inbox" className="text-primary hover:underline font-semibold flex items-center gap-1">
              <span>View Inbound Calls</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* RIGHT COLUMN: Fleet Capacity & Real Operations (5 Cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Card 1: Active Field Fleet */}
          <div className="rounded-2xl bg-surface/90 border border-border p-5 space-y-3.5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-bold text-white tracking-tight">Active Field Fleet</h3>
              </div>
              <Link href="/schedule" className="text-[11px] text-primary hover:underline font-medium">
                Dispatch Board &rarr;
              </Link>
            </div>

            <div className="space-y-2">
              {technicians.length === 0 ? (
                <p className="text-xs text-muted py-2">No technicians found. Invite staff in Settings.</p>
              ) : (
                technicians.slice(0, 5).map((tech) => {
                  const assignedJobs = jobs.filter((j) => j.technician?.id === tech.id && j.status !== 'COMPLETED');
                  const isTech = tech.role?.slug === 'technician';
                  return (
                    <div
                      key={tech.id}
                      className="p-2.5 rounded-xl bg-surface-elevated/40 border border-border/60 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-7 h-7 rounded-lg bg-primary/20 text-primary font-bold flex items-center justify-center shrink-0 text-xs">
                          {tech.name?.charAt(0) || 'T'}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-100 truncate">{tech.name}</p>
                          <p className="text-[10px] text-muted">{tech.role?.name || 'Staff'}</p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        {assignedJobs.length > 0 ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-primary/20 text-primary border border-primary/30">
                            {assignedJobs.length} Active Job{assignedJobs.length > 1 ? 's' : ''}
                          </span>
                        ) : isTech ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            Available
                          </span>
                        ) : (
                          <span className="text-[10px] text-subtle">Office</span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Card 2: 24/7 Public Booking Link & Equipment Tag */}
          <div className="rounded-2xl bg-surface/90 border border-border p-5 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-ai" />
                <h3 className="text-sm font-bold text-white tracking-tight">Customer Booking Portal</h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                LIVE
              </span>
            </div>

            <p className="text-xs text-muted leading-relaxed">
              Share your dedicated link with homeowners or embed on your website for instant 24/7 AI call intake and appointment booking.
            </p>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                readOnly
                value={bookingUrl}
                className="flex-1 px-3 py-1.5 text-xs rounded-xl bg-background border border-border text-slate-300 font-mono truncate"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCopyLink}
                className="h-8 px-2.5 text-xs gap-1"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Copied' : 'Copy'}</span>
              </Button>
              <a href={bookingUrl} target="_blank" rel="noopener noreferrer">
                <Button type="button" variant="primary" size="sm" className="h-8 px-2.5 text-xs">
                  <ExternalLink className="w-3.5 h-3.5" />
                </Button>
              </a>
            </div>
          </div>

          {/* Card 3: Recent Jobs / Activity */}
          <div className="rounded-2xl bg-surface/90 border border-border p-5 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-400" />
                <h3 className="text-sm font-bold text-white tracking-tight">Recent Work Orders</h3>
              </div>
              <Link href="/schedule" className="text-[11px] text-primary hover:underline font-medium">
                View All &rarr;
              </Link>
            </div>

            <div className="space-y-2">
              {jobs.length === 0 ? (
                <p className="text-xs text-muted py-2">No work orders recorded yet.</p>
              ) : (
                jobs.slice(0, 4).map((j) => (
                  <Link
                    key={j.id}
                    href={`/schedule?jobId=${j.id}&jobNumber=${j.jobNumber || ''}`}
                    className="p-2.5 rounded-xl bg-surface-elevated/40 border border-border/60 hover:border-primary/40 block transition-all"
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-bold text-white">{j.jobNumber || j.title}</span>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                        j.status === 'COMPLETED'
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : j.status === 'DISPATCHED'
                          ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                          : 'bg-primary/15 text-primary border border-primary/30'
                      }`}>
                        {j.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted truncate">
                      {j.reportedIssue || j.title} · {j.customer?.name || 'Customer'}
                    </p>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
