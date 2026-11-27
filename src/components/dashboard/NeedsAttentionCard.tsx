'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Check,
  Sparkles,
  Loader2,
  Calendar,
  PhoneCall,
  User,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { apiRequest } from '@/lib/api';

interface NeedsAttentionCardProps {
  roleSlug?: string;
}

interface EscalationItem {
  id: string;
  urgency: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  title: string;
  context: string;
  recommendedAction: string;
  tags: string[];
  actionHref?: string;
  actionLabel?: string;
}

export function NeedsAttentionCard({ roleSlug = 'owner' }: NeedsAttentionCardProps) {
  const [escalations, setEscalations] = useState<EscalationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadLiveEscalations = async () => {
      setIsLoading(true);
      try {
        const [jobs, calls] = await Promise.all([
          apiRequest<any[]>('/jobs').catch(() => []),
          apiRequest<any[]>('/jobs/voice-calls').catch(() => []),
        ]);

        if (!isMounted) return;

        const items: EscalationItem[] = [];

        // 1. Live Job Escalations (Unassigned, Emergency, or Tech Declined)
        for (const job of jobs || []) {
          if (!job.technicianId || job.status === 'UNSCHEDULED') {
            items.push({
              id: `job-${job.id}`,
              urgency: job.priority === 'EMERGENCY' ? 'CRITICAL' : 'HIGH',
              title: `Unassigned Work Order: ${job.jobNumber || job.title}`,
              context: `${job.reportedIssue || 'Service visit booked via 24/7 AI Receptionist'} — Customer: ${job.customer?.name || 'Customer'} (${job.serviceAddress || 'Address on file'})`,
              recommendedAction: 'Assign available technician from the Schedule & Dispatch swimlanes.',
              tags: [job.priority || 'Standard', 'Dispatch Required'],
              actionHref: '/schedule',
              actionLabel: 'Assign Tech',
            });
          } else if (job.notes && job.notes.includes('[ESCALATION]')) {
            items.push({
              id: `job-esc-${job.id}`,
              urgency: 'HIGH',
              title: `Technician Declined: ${job.jobNumber || job.title}`,
              context: job.notes,
              recommendedAction: 'Reassign to secondary technician or adjust appointment window.',
              tags: ['Declined', 'Reassign'],
              actionHref: '/schedule',
              actionLabel: 'Reassign',
            });
          }
        }

        // 2. Live Call Escalations (Friction, negative sentiment, or dropped)
        for (const call of calls || []) {
          const isNegative =
            call.userSentiment === 'Negative' ||
            (call.sentiment && String(call.sentiment).toLowerCase() === 'negative');
          const isFailed = call.isSuccessful === false;

          if (isNegative || isFailed) {
            items.push({
              id: `call-${call.id}`,
              urgency: isFailed ? 'HIGH' : 'MEDIUM',
              title: `Inbound Call Review: ${call.customerName || 'Caller'}`,
              context:
                call.summary ||
                'AI detected customer friction or call disconnected before confirmation.',
              recommendedAction: 'Review call recording in Unified Inbox and initiate management callback.',
              tags: ['Call Review', call.userSentiment || 'Sentiment'],
              actionHref: '/inbox',
              actionLabel: 'Review Call',
            });
          }
        }

        setEscalations(items);
      } catch (err) {
        console.error('Failed to load live escalations:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadLiveEscalations();

    return () => {
      isMounted = false;
    };
  }, [roleSlug]);

  return (
    <div className="p-6 rounded-3xl bg-surface/90 border border-border flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                <span>Needs Your Attention</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                    escalations.length > 0
                      ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                      : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                  }`}
                >
                  {isLoading ? '...' : `${escalations.length} Pending`}
                </span>
              </h3>
              <p className="text-[11px] text-muted">
                Exceptions escalated by Elijah AI for human decision
              </p>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="py-12 flex flex-col items-center justify-center text-muted gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
            <span className="text-xs">Checking live system exceptions...</span>
          </div>
        ) : escalations.length === 0 ? (
          <div className="py-10 px-6 rounded-2xl bg-surface-card border border-border/60 text-center flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-3">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-white mb-1">
              All Operations Autonomous & On Track
            </h4>
            <p className="text-xs text-muted max-w-md leading-relaxed">
              No human intervention is currently required. Elijah AI is autonomously managing your
              calls, service area checks, pricing quotes, and technician appointments.
            </p>
          </div>
        ) : (
          <div className="space-y-3.5 mt-4">
            {escalations.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-surface-card border border-border/80 hover:border-border transition-all"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                          item.urgency === 'CRITICAL'
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {item.urgency}
                      </span>
                      {item.tags.map((tag, tIdx) => (
                        <span
                          key={tIdx}
                          className="text-[10px] text-muted bg-surface-elevated px-2 py-0.5 rounded border border-border/50"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <h4 className="text-xs font-bold text-white">{item.title}</h4>
                  </div>
                </div>

                <p className="text-xs text-muted leading-relaxed mb-3">{item.context}</p>

                <div className="p-2.5 rounded-xl bg-surface-elevated/80 border border-border/80 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-[11px] text-slate-300">
                    <Sparkles className="w-3.5 h-3.5 text-ai shrink-0" />
                    <span className="truncate">
                      <strong>AI Recommendation:</strong> {item.recommendedAction}
                    </span>
                  </div>

                  {item.actionHref && (
                    <div className="flex items-center gap-1 shrink-0">
                      <Link href={item.actionHref}>
                        <Button size="sm" variant="primary" className="h-7 text-xs px-2.5">
                          <Check className="w-3 h-3 mr-1" />
                          {item.actionLabel || 'Resolve'}
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-5 pt-4 border-t border-border flex items-center justify-between">
        <span className="text-xs text-muted">
          All routine inquiries are auto-handled without bothering you.
        </span>
        <Link
          href="/inbox"
          className="text-xs font-semibold text-primary hover:text-indigo-400 flex items-center gap-1 transition-colors"
        >
          <span>Go to Unified AI Inbox</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
