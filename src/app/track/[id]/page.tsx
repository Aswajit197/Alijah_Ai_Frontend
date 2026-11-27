'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  Wrench,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  ShieldCheck,
  AlertCircle,
  Truck,
  Sparkles,
  Calendar,
  RefreshCw,
  Building2,
  User,
} from 'lucide-react';

interface PublicJobTracking {
  id: string;
  jobNumber: string | null;
  title: string;
  status: 'UNSCHEDULED' | 'SCHEDULED' | 'DISPATCHED' | 'EN_ROUTE' | 'ON_SITE' | 'COMPLETED' | 'CANCELLED';
  priority: string;
  scheduledDate: string | null;
  scheduledStart: string | null;
  scheduledEnd: string | null;
  serviceAddress: string | null;
  reportedIssue: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  customer: {
    name: string;
    companyName?: string | null;
    address: string;
  };
  equipment?: {
    name: string;
    brand: string;
    modelNumber?: string | null;
    type: string;
  } | null;
  technician?: {
    name: string;
    role: string;
  } | null;
  company: {
    name: string;
    phone: string;
    tradeType: string;
  };
}

export default function PublicJobTrackingPage() {
  const params = useParams();
  const jobId = params?.id as string;

  const [job, setJob] = useState<PublicJobTracking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLiveConnected, setIsLiveConnected] = useState(false);

  const fetchTracking = async (isManual = false) => {
    if (!jobId) return;
    if (isManual) setIsRefreshing(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
      const res = await fetch(`${apiUrl}/jobs/public-track/${jobId}`);
      const data = await res.json();

      if (data.success && data.data) {
        setJob(data.data);
        setError(null);
        setLastRefreshed(new Date());
      } else {
        setError(data.message || 'Unable to locate service dispatch record.');
      }
    } catch (err: any) {
      setError('Could not connect to service tracking server.');
    } finally {
      setLoading(false);
      if (isManual) setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (!jobId) return;

    let eventSource: EventSource | null = null;
    let fallbackTimer: NodeJS.Timeout | null = null;
    let isTerminated = false;

    // Connect to Server-Sent Events (SSE) Stream
    const setupSSE = () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
        const streamUrl = `${apiUrl}/jobs/public-track/${jobId}/stream`;
        eventSource = new EventSource(streamUrl);

        eventSource.onopen = () => {
          setIsLiveConnected(true);
          setError(null);
          // If SSE connection succeeded, clear any fallback polling
          if (fallbackTimer) {
            clearInterval(fallbackTimer);
            fallbackTimer = null;
          }
        };

        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            setJob(data);
            setLoading(false);
            setLastRefreshed(new Date());
            setError(null);

            // If job reached completed/cancelled, gracefully close SSE stream
            if (data.status === 'COMPLETED' || data.status === 'CANCELLED') {
              isTerminated = true;
              eventSource?.close();
              setIsLiveConnected(false);
            }
          } catch (e) {
            console.error('Error parsing SSE event:', e);
          }
        };

        eventSource.onerror = () => {
          setIsLiveConnected(false);
          eventSource?.close();

          // Only fallback to polling if not terminated and not already scheduled
          if (!isTerminated && !fallbackTimer) {
            fallbackTimer = setInterval(() => {
              if (!document.hidden && !isTerminated) {
                fetchTracking();
              }
            }, 8000);
          }
        };
      } catch (err) {
        console.error('SSE initialization error:', err);
        fetchTracking();
      }
    };

    setupSSE();

    // Pause/resume on tab visibility
    const handleVisibility = () => {
      if (!document.hidden && !isTerminated && !isLiveConnected) {
        fetchTracking();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      if (eventSource) eventSource.close();
      if (fallbackTimer) clearInterval(fallbackTimer);
    };
  }, [jobId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080C15] flex flex-col items-center justify-center p-4 text-center">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4 animate-pulse">
          <Wrench className="w-6 h-6 text-primary animate-spin" />
        </div>
        <p className="text-sm font-medium text-slate-300">Connecting to Live Service Dispatch...</p>
        <p className="text-xs text-slate-500 mt-1">Retrieving real-time technician status</p>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-[#080C15] flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto">
        <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mb-4">
          <AlertCircle className="w-7 h-7 text-rose-400" />
        </div>
        <h2 className="text-lg font-bold text-white mb-2">Tracking Link Not Found</h2>
        <p className="text-sm text-slate-400 mb-6">
          {error || 'This service request may have been rescheduled or is no longer accessible.'}
        </p>
        <button
          onClick={() => fetchTracking(true)}
          className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white border border-slate-700 flex items-center gap-2"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Retry Connection
        </button>
      </div>
    );
  }

  // Calculate timeline steps
  const steps = [
    {
      id: 'RECEIVED',
      title: 'Request Confirmed',
      desc: 'Work order logged into dispatch system',
      isCompleted: true,
      isActive: job.status === 'UNSCHEDULED',
    },
    {
      id: 'ASSIGNED',
      title: 'Technician Assigned',
      desc: job.technician ? `${job.technician.name} assigned` : 'Assigning certified technician',
      isCompleted: ['SCHEDULED', 'DISPATCHED', 'EN_ROUTE', 'ON_SITE', 'COMPLETED'].includes(job.status),
      isActive: job.status === 'SCHEDULED' || job.status === 'DISPATCHED',
    },
    {
      id: 'EN_ROUTE',
      title: 'Technician En Route',
      desc: job.status === 'EN_ROUTE' ? 'Technician is driving to your property' : 'Scheduled transit to site',
      isCompleted: ['ON_SITE', 'COMPLETED'].includes(job.status),
      isActive: job.status === 'EN_ROUTE',
    },
    {
      id: 'ON_SITE',
      title: 'Servicing on Site',
      desc: job.status === 'ON_SITE' ? 'Technician is actively working on unit' : 'On-site diagnostics and repair',
      isCompleted: job.status === 'COMPLETED',
      isActive: job.status === 'ON_SITE',
    },
    {
      id: 'COMPLETED',
      title: 'Service Completed',
      desc: job.status === 'COMPLETED' ? 'Work finished & verified' : 'Final inspection and signoff',
      isCompleted: job.status === 'COMPLETED',
      isActive: false,
    },
  ];

  const formatTimeWindow = () => {
    if (!job.scheduledStart && !job.scheduledEnd) {
      if (job.scheduledDate) return new Date(job.scheduledDate).toLocaleDateString();
      return 'Arrival window being finalized';
    }
    const start = job.scheduledStart
      ? new Date(job.scheduledStart).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
      : '';
    const end = job.scheduledEnd
      ? new Date(job.scheduledEnd).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
      : '';
    return `${start} – ${end}`;
  };

  return (
    <div className="min-h-screen bg-[#080C15] text-slate-100 flex flex-col items-center">
      {/* Top Mobile/Desktop Header */}
      <header className="w-full border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-black text-white shadow-md shadow-blue-500/20">
              E
            </div>
            <div>
              <h1 className="text-sm font-bold text-white flex items-center gap-1.5">
                {job.company.name}
              </h1>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                <span className={`inline-block w-2 h-2 rounded-full ${isLiveConnected ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'}`} />
                {isLiveConnected ? 'Live Real-Time Stream (SSE)' : 'Live Dispatch Tracking'}
              </div>
            </div>
          </div>

          <a
            href={`tel:${job.company.phone}`}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700/80 text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition-colors"
          >
            <Phone className="w-3.5 h-3.5 text-emerald-400" />
            <span>Call Office</span>
          </a>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="w-full max-w-2xl px-4 py-6 space-y-5">
        {/* Status Hero Card */}
        <div className="p-6 rounded-3xl bg-gradient-to-b from-slate-900/90 to-slate-900/40 border border-slate-800 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -z-10 pointer-events-none" />

          <div className="flex items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-400 font-mono text-xs font-bold">
                {job.jobNumber || 'DISPATCH'}
              </span>
              <span className="text-xs text-slate-400 font-medium">
                {job.customer.companyName || job.customer.name}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                isLiveConnected
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isLiveConnected ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'}`} />
                {isLiveConnected ? 'Real-Time SSE' : 'Connecting'}
              </span>

              <button
                onClick={() => fetchTracking(true)}
                className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
                title="Refresh tracking status"
              >
                <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin text-blue-400' : ''}`} />
                <span>Sync</span>
              </button>
            </div>
          </div>

          {/* Dynamic Headline Based on Status */}
          {job.status === 'EN_ROUTE' && (
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-semibold animate-pulse">
                <Truck className="w-3.5 h-3.5" />
                Technician is on the way
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight">
                {job.technician?.name || 'Your technician'} is En Route
              </h2>
              <p className="text-sm text-slate-300">
                Estimated arrival window:{' '}
                <span className="font-semibold text-white">{formatTimeWindow()}</span>
              </p>
            </div>
          )}

          {job.status === 'ON_SITE' && (
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-400 text-xs font-semibold">
                <Wrench className="w-3.5 h-3.5 animate-spin" />
                Service In Progress
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight">
                Technician is On Site
              </h2>
              <p className="text-sm text-slate-300">
                {job.technician?.name || 'Technician'} is currently inspecting and servicing your unit.
              </p>
            </div>
          )}

          {job.status === 'COMPLETED' && (
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Work Completed
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight">
                Service Order Complete
              </h2>
              <p className="text-sm text-slate-300">
                All scheduled work and diagnostic checklists have been finished.
              </p>
            </div>
          )}

          {['UNSCHEDULED', 'SCHEDULED', 'DISPATCHED'].includes(job.status) && (
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-400 text-xs font-semibold">
                <Clock className="w-3.5 h-3.5" />
                Service Scheduled
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight">
                Your Service Is Confirmed
              </h2>
              <p className="text-sm text-slate-300">
                Scheduled arrival window:{' '}
                <span className="font-semibold text-white">{formatTimeWindow()}</span>
              </p>
            </div>
          )}
        </div>

        {/* Live Step Timeline */}
        <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80 space-y-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            Live Dispatch Timeline
          </h3>

          <div className="relative pl-6 space-y-8 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-800">
            {steps.map((step, idx) => {
              const isDone = step.isCompleted;
              const isCurrent = step.isActive;

              return (
                <div key={idx} className="relative flex items-start gap-4">
                  {/* Step Pin */}
                  <div
                    className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                      isDone
                        ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/30'
                        : isCurrent
                        ? 'bg-blue-600 text-white ring-4 ring-blue-500/20 animate-pulse'
                        : 'bg-slate-800 border border-slate-700 text-slate-500'
                    }`}
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-current" />
                    )}
                  </div>

                  {/* Step Text */}
                  <div className="space-y-0.5">
                    <p
                      className={`text-sm font-bold ${
                        isDone
                          ? 'text-white'
                          : isCurrent
                          ? 'text-blue-400 font-extrabold'
                          : 'text-slate-500'
                      }`}
                    >
                      {step.title}
                    </p>
                    <p className="text-xs text-slate-400 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Assigned Technician Card (if assigned) */}
        {job.technician && (
          <div className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800/80 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <User className="w-3.5 h-3.5 text-blue-400" />
              Your Certified Technician
            </h3>

            <div className="flex items-center gap-4">
              <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-blue-600/30 to-indigo-600/20 border border-blue-500/30 flex items-center justify-center font-bold text-blue-300 text-lg shadow-inner">
                {job.technician.name.split(' ').map((n) => n[0]).join('')}
              </div>

              <div className="space-y-1 flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white">{job.technician.name}</h4>
                  <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full font-medium">
                    <ShieldCheck className="w-3 h-3" /> Verified
                  </span>
                </div>
                <p className="text-xs text-slate-400">{job.technician.role}</p>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 pt-1 border-t border-slate-800/60">
              All {job.company.name} technicians are licensed, background-checked, and carry full liability coverage.
            </p>
          </div>
        )}

        {/* Service Location & Equipment Card */}
        <div className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800/80 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Building2 className="w-3.5 h-3.5 text-blue-400" />
            Service Details
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Service Location */}
            <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-800 space-y-1.5">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-rose-400" />
                Service Address
              </div>
              <p className="font-medium text-white">{job.serviceAddress || job.customer.address}</p>
              <p className="text-[11px] text-slate-400">{job.customer.companyName || job.customer.name}</p>
            </div>

            {/* Equipment Unit */}
            <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-800 space-y-1.5">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5 text-blue-400" />
                Equipment Unit
              </div>
              {job.equipment ? (
                <>
                  <p className="font-medium text-white">
                    {job.equipment.brand} · {job.equipment.modelNumber || job.equipment.name}
                  </p>
                  <p className="text-[11px] text-slate-400">{job.equipment.name}</p>
                </>
              ) : (
                <p className="text-slate-400 italic">Standard Diagnostic Service</p>
              )}
            </div>
          </div>

          {/* Reported Issue */}
          {job.reportedIssue && (
            <div className="space-y-1 text-xs">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Reported Issue & Symptoms
              </span>
              <p className="p-3.5 rounded-2xl bg-slate-800/30 border border-slate-800 text-slate-300 leading-relaxed">
                {job.reportedIssue}
              </p>
            </div>
          )}

          {/* Technician Field Notes (if completed or added) */}
          {job.notes && (
            <div className="space-y-1 text-xs">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Technician Field Resolution Notes
              </span>
              <p className="p-3.5 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 text-slate-200 leading-relaxed">
                {job.notes}
              </p>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="text-center py-4 space-y-2">
          <p className="text-xs text-slate-500">
            Powered by <span className="font-semibold text-slate-400">Elijah AI Operations Engine</span>
          </p>
          <p className="text-[10px] text-slate-600">
            Last updated: {lastRefreshed.toLocaleTimeString()} · Real-time status sync
          </p>
        </div>
      </main>
    </div>
  );
}
