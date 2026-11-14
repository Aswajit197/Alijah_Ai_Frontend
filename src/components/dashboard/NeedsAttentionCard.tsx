'use client';

import React from 'react';
import {
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Check,
  X,
  Sparkles,
  DollarSign,
  PhoneCall,
  User,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NeedsAttentionCardProps {
  roleSlug?: string;
}

export function NeedsAttentionCard({ roleSlug = 'owner' }: NeedsAttentionCardProps) {
  // Escalations tailored by role
  const getEscalations = () => {
    switch (roleSlug) {
      case 'dispatcher':
        return [
          {
            id: 'esc-1',
            urgency: 'HIGH',
            title: 'No Tech Available for Emergency Slot',
            context: 'Inbound caller with flooded basement in North Las Vegas requested immediate service. Tech Robert is 45 mins away.',
            recommendedAction: 'Reassign non-urgent filter replacement job to tomorrow morning.',
            tags: ['Emergency', 'Routing'],
          },
          {
            id: 'esc-2',
            urgency: 'MEDIUM',
            title: 'Customer Requested Specific Tech (Mike R.)',
            context: 'Repeat commercial client at Apex Logistics requested Mike R. for scheduled chiller maintenance.',
            recommendedAction: 'Swap lane with Tech Daniel on Friday at 9:00 AM.',
            tags: ['Customer Request', 'Tech Lock'],
          },
        ];

      case 'sales_estimator':
        return [
          {
            id: 'esc-1',
            urgency: 'HIGH',
            title: 'Customer Discount Exception: 18% Requested',
            context: 'Highlander Country Club quote ($18,400) - General Manager requested $3,300 discount to sign today.',
            recommendedAction: 'Your threshold limit is $1,500. Forwarding to Owner or accept $1,500 max.',
            tags: ['Discount Exception', 'Pipeline'],
          },
          {
            id: 'esc-2',
            urgency: 'MEDIUM',
            title: 'Unsigned Proposal Expiring in 24 Hours',
            context: 'Residential AC replacement ($6,900) sent to David Sterling. AI sent 2 SMS reminders with 1 positive reply.',
            recommendedAction: 'Trigger 1-click personal phone call callback.',
            tags: ['Expiring Bid'],
          },
        ];

      case 'technician':
        return [
          {
            id: 'esc-1',
            urgency: 'HIGH',
            title: 'Customer Gate Code Invalid (Stop #2)',
            context: 'Arrived at 482 Canyon Vista Dr. Callbox code #9941 is not responding. Customer did not pick up automated SMS.',
            recommendedAction: 'AI has placed an outbound call to customer mobile #2.',
            tags: ['Access Blocked', 'Stop #2'],
          },
        ];

      case 'finance':
        return [
          {
            id: 'esc-1',
            urgency: 'HIGH',
            title: 'Chargeback / Disputed Invoice #1029 ($1,450)',
            context: 'Commercial tenant claims diagnostic fee should have been waived under annual warranty clause.',
            recommendedAction: 'Review attached service contract clause 4.2 before issuing $150 courtesy credit.',
            tags: ['Invoice Dispute', 'AR Risk'],
          },
        ];

      case 'office_manager':
      case 'owner':
      default:
        return [
          {
            id: 'esc-1',
            urgency: 'CRITICAL',
            title: 'Commercial HVAC Replacement Proposal ($24,800)',
            context: 'Apex Warehousing signed AI quote. Project value exceeds manager threshold of $5,000.',
            recommendedAction: 'Review equipment margin (38%) and authorize contract counter-signature.',
            tags: ['Approval > $5k', 'Executive'],
          },
          {
            id: 'esc-2',
            urgency: 'HIGH',
            title: 'Escalated Customer Callback: Repeat AC Freezing',
            context: 'Customer Mrs. Henderson called twice. AI detected frustration (Sentiment Score: -0.78). System prioritized immediate management callback.',
            recommendedAction: 'Call customer with full diagnostic history from prior visit.',
            tags: ['High Churn Risk', 'VIP Client'],
          },
        ];
    }
  };

  const escalations = getEscalations();

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
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  {escalations.length} Pending
                </span>
              </h3>
              <p className="text-[11px] text-muted">
                Exceptions escalated by Elijah AI for human decision
              </p>
            </div>
          </div>
        </div>

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

              <p className="text-xs text-muted leading-relaxed mb-3">
                {item.context}
              </p>

              <div className="p-2.5 rounded-xl bg-surface-elevated/80 border border-border/80 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-[11px] text-slate-300">
                  <Sparkles className="w-3.5 h-3.5 text-ai shrink-0" />
                  <span className="truncate">
                    <strong>AI Recommendation:</strong> {item.recommendedAction}
                  </span>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <Button size="sm" variant="primary" className="h-7 text-xs px-2.5">
                    <Check className="w-3 h-3 mr-1" />
                    Approve
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 pt-4 border-t border-border flex items-center justify-between">
        <span className="text-xs text-muted">
          All routine inquiries are auto-handled without bothering you.
        </span>
        <button className="text-xs font-semibold text-primary hover:text-indigo-400 flex items-center gap-1 transition-colors">
          <span>Go to Escalation Queue</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
