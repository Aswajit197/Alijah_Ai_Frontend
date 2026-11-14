'use client';

import React from 'react';
import {
  PhoneCall,
  CalendarCheck,
  Sparkles,
  Bot,
  ArrowUpRight,
  ShieldAlert,
  Clock,
  CheckCircle,
} from 'lucide-react';

export function AiAgentStatusCard() {
  const recentAutonomousEvents = [
    {
      time: '11:42 AM',
      type: 'voice_call',
      title: 'Inbound Call: AC blowing warm air',
      caller: 'Sarah Jenkins · Henderson, NV',
      outcome: 'Autonomous diagnostic scheduled for 2:30 PM with Tech Mike',
      icon: PhoneCall,
      color: 'text-primary bg-primary/10 border-primary/20',
    },
    {
      time: '11:15 AM',
      type: 'quote_followup',
      title: 'SMS Proposal Follow-up: Heat Pump Replacement',
      caller: 'Marcus Vance · Summerlin, NV',
      outcome: 'Customer viewed bid ($7,450) and replied "Can you install Friday?"',
      icon: Sparkles,
      color: 'text-ai bg-ai/10 border-ai/20',
    },
    {
      time: '10:48 AM',
      type: 'dispatch_route',
      title: 'Automated Route Optimization',
      caller: 'System Fleet Dispatcher',
      outcome: 'Reordered Tech Robert\'s stops to dodge I-15 South traffic delay',
      icon: CalendarCheck,
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    },
    {
      time: '09:30 AM',
      type: 'invoice_collected',
      title: 'Post-Job Invoice #1084',
      caller: 'Autonomous Billing Bot',
      outcome: '$420 payment collected via SMS link within 4 minutes of sign-off',
      icon: CheckCircle,
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    },
  ];

  return (
    <div className="p-6 rounded-3xl bg-surface/90 border border-border flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-ai/15 border border-ai/30 flex items-center justify-center text-ai shadow-sm">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                <span>Elijah Autonomous Feed</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </h3>
              <p className="text-[11px] text-muted">
                Real-time field operations handled by AI
              </p>
            </div>
          </div>

          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-surface-elevated text-slate-300 border border-border">
            LIVE STREAM
          </span>
        </div>

        <div className="space-y-3 mt-4">
          {recentAutonomousEvents.map((evt, idx) => {
            const Icon = evt.icon;
            return (
              <div
                key={idx}
                className="p-3 rounded-2xl bg-surface-card border border-border/70 hover:border-border transition-colors text-xs"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className={`p-1 rounded-md border ${evt.color}`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <span className="font-semibold text-slate-200">{evt.title}</span>
                  </div>
                  <span className="text-[10px] text-subtle font-mono">{evt.time}</span>
                </div>

                <div className="pl-6 space-y-0.5">
                  <p className="text-[11px] text-muted">{evt.caller}</p>
                  <p className="text-[11px] text-slate-300 font-medium">{evt.outcome}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-5 pt-4 border-t border-border flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-muted">
          <Clock className="w-3.5 h-3.5 text-subtle" />
          <span>Average autonomous resolution: <strong>1.4 mins</strong></span>
        </div>
        <button className="text-xs font-semibold text-ai hover:text-cyan-300 flex items-center gap-1 transition-colors">
          <span>View Full AI Audit Log</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

