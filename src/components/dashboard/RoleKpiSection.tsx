'use client';

import React from 'react';
import {
  TrendingUp,
  DollarSign,
  PhoneCall,
  ShieldAlert,
  Clock,
  Users,
  Calendar,
  Truck,
  FileText,
  Percent,
  CheckCircle2,
  Wrench,
  Receipt,
  CreditCard,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

interface RoleKpiSectionProps {
  roleSlug?: string;
  roleName?: string;
}

export function RoleKpiSection({ roleSlug = 'owner', roleName = 'Owner' }: RoleKpiSectionProps) {
  const getKpis = () => {
    switch (roleSlug) {
      case 'office_manager':
        return [
          {
            title: 'Urgent Triage Queue',
            value: '4 Pending',
            subtext: 'Requires staff review',
            icon: ShieldAlert,
            trend: '2 High priority',
            trendType: 'warning',
            color: 'from-amber-500/20 to-amber-600/5 text-amber-400 border-amber-500/30',
          },
          {
            title: 'AI Escalated Calls',
            value: '7 Callbacks',
            subtext: 'Auto-transcribed & prioritized',
            icon: PhoneCall,
            trend: '+12 handled today',
            trendType: 'positive',
            color: 'from-primary/20 to-primary/5 text-primary border-primary/30',
          },
          {
            title: 'Unassigned Leads',
            value: '9 Requests',
            subtext: 'Web form & after-hours',
            icon: Users,
            trend: 'Avg response < 4 min',
            trendType: 'neutral',
            color: 'from-ai/20 to-ai/5 text-ai border-ai/30',
          },
          {
            title: 'Customer CSAT',
            value: '98.6%',
            subtext: 'Autonomous post-job surveys',
            icon: CheckCircle2,
            trend: '+2.4% vs last mo',
            trendType: 'positive',
            color: 'from-emerald-500/20 to-emerald-600/5 text-emerald-400 border-emerald-500/30',
          },
        ];

      case 'dispatcher':
        return [
          {
            title: 'Field Technicians Active',
            value: '8 / 10 Active',
            subtext: '2 On break / staging',
            icon: Truck,
            trend: 'All GPS synced',
            trendType: 'positive',
            color: 'from-emerald-500/20 to-emerald-600/5 text-emerald-400 border-emerald-500/30',
          },
          {
            title: 'Jobs Scheduled Today',
            value: '16 Work Orders',
            subtext: '12 standard · 4 emergencies',
            icon: Calendar,
            trend: '100% capacity filled',
            trendType: 'positive',
            color: 'from-primary/20 to-primary/5 text-primary border-primary/30',
          },
          {
            title: 'AI Route Savings',
            value: '28.4 Miles',
            subtext: 'Traffic-aware batching',
            icon: TrendingUp,
            trend: '~$42 fuel saved',
            trendType: 'positive',
            color: 'from-ai/20 to-ai/5 text-ai border-ai/30',
          },
          {
            title: 'Pending Urgent Dispatch',
            value: '1 Unassigned',
            subtext: 'AC Down - Elderly care center',
            icon: AlertCircle,
            trend: 'Needs tech in 20m',
            trendType: 'warning',
            color: 'from-amber-500/20 to-amber-600/5 text-amber-400 border-amber-500/30',
          },
        ];

      case 'sales_estimator':
        return [
          {
            title: 'Open Proposal Pipeline',
            value: '$94,200',
            subtext: '14 active bids in review',
            icon: DollarSign,
            trend: '+$18.5k this week',
            trendType: 'positive',
            color: 'from-emerald-500/20 to-emerald-600/5 text-emerald-400 border-emerald-500/30',
          },
          {
            title: 'Pending Approvals',
            value: '6 Quotes',
            subtext: 'Customer requested revisions',
            icon: FileText,
            trend: '3 > $10,000',
            trendType: 'neutral',
            color: 'from-primary/20 to-primary/5 text-primary border-primary/30',
          },
          {
            title: 'AI SMS Follow-ups',
            value: '28 Active',
            subtext: 'Automated objection handling',
            icon: Sparkles,
            trend: '72% open rate',
            trendType: 'positive',
            color: 'from-ai/20 to-ai/5 text-ai border-ai/30',
          },
          {
            title: 'Close Rate (MoTD)',
            value: '68.5%',
            subtext: 'Industry benchmark: 45%',
            icon: Percent,
            trend: '+8.1% with AI follow',
            trendType: 'positive',
            color: 'from-emerald-500/20 to-emerald-600/5 text-emerald-400 border-emerald-500/30',
          },
        ];

      case 'technician':
        return [
          {
            title: 'Assigned Work Orders',
            value: '4 Jobs Today',
            subtext: '2 Completed · 1 Active · 1 Upcoming',
            icon: Wrench,
            trend: 'Shift ends at 5:00 PM',
            trendType: 'neutral',
            color: 'from-primary/20 to-primary/5 text-primary border-primary/30',
          },
          {
            title: 'Next Destination',
            value: '11:30 AM',
            subtext: 'Compressor Diagnostic · Henderson',
            icon: Clock,
            trend: 'Gate Code: #4821',
            trendType: 'positive',
            color: 'from-ai/20 to-ai/5 text-ai border-ai/30',
          },
          {
            title: 'Truck Inventory Tracked',
            value: '34 Parts Synced',
            subtext: 'Auto-depleted upon invoice',
            icon: Truck,
            trend: 'R-410A Tank low',
            trendType: 'warning',
            color: 'from-amber-500/20 to-amber-600/5 text-amber-400 border-amber-500/30',
          },
          {
            title: 'Field Portal Sync',
            value: 'Online · Offline Ready',
            subtext: 'Photos & voice notes cached',
            icon: CheckCircle2,
            trend: 'Latency: 28ms',
            trendType: 'positive',
            color: 'from-emerald-500/20 to-emerald-600/5 text-emerald-400 border-emerald-500/30',
          },
        ];

      case 'finance':
        return [
          {
            title: 'Collected This Week',
            value: '$46,250',
            subtext: 'Stripe, ACH & Field CCs',
            icon: DollarSign,
            trend: '+22.4% vs last week',
            trendType: 'positive',
            color: 'from-emerald-500/20 to-emerald-600/5 text-emerald-400 border-emerald-500/30',
          },
          {
            title: 'Overdue Receivables',
            value: '$12,800',
            subtext: '4 accounts past 30 days',
            icon: Receipt,
            trend: '2 on auto-reminders',
            trendType: 'warning',
            color: 'from-amber-500/20 to-amber-600/5 text-amber-400 border-amber-500/30',
          },
          {
            title: 'AI Auto-Invoices Sent',
            value: '38 Sent',
            subtext: 'Generated immediately on job completion',
            icon: CreditCard,
            trend: '100% matched to POs',
            trendType: 'positive',
            color: 'from-primary/20 to-primary/5 text-primary border-primary/30',
          },
          {
            title: 'Pending Approvals',
            value: '1 Disputed',
            subtext: 'Customer requested $350 fee waiver',
            icon: AlertCircle,
            trend: 'Needs Owner sign-off',
            trendType: 'warning',
            color: 'from-amber-500/20 to-amber-600/5 text-amber-400 border-amber-500/30',
          },
        ];

      // Default to OWNER view
      case 'owner':
      default:
        return [
          {
            title: "Today's Revenue",
            value: '$18,450',
            subtext: '11 completed jobs & deposits',
            icon: DollarSign,
            trend: '+14.2% vs yesterday',
            trendType: 'positive',
            color: 'from-emerald-500/20 to-emerald-600/5 text-emerald-400 border-emerald-500/30',
          },
          {
            title: 'AI Autonomous Intercepts',
            value: '48 Inbound Calls',
            subtext: '92% triaged & booked without dispatch staff',
            icon: PhoneCall,
            trend: 'Avg triage time: 42s',
            trendType: 'positive',
            color: 'from-primary/20 to-primary/5 text-primary border-primary/30',
          },
          {
            title: 'Approvals Requiring You',
            value: '3 Over $5k',
            subtext: 'Exceeds team threshold',
            icon: ShieldAlert,
            trend: 'Total: $24,800 value',
            trendType: 'warning',
            color: 'from-amber-500/20 to-amber-600/5 text-amber-400 border-amber-500/30',
          },
          {
            title: 'Labor Overhead ROI',
            value: '3.8x Multiplier',
            subtext: 'Autonomous dispatch & 24/7 night coverage',
            icon: Sparkles,
            trend: 'Zero missed night leads',
            trendType: 'positive',
            color: 'from-ai/20 to-ai/5 text-ai border-ai/30',
          },
        ];
    }
  };

  const kpis = getKpis();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi, idx) => {
        const Icon = kpi.icon;
        return (
          <div
            key={idx}
            className="p-5 rounded-2xl bg-surface/90 border border-border hover:border-border-hover transition-all duration-200 relative overflow-hidden group shadow-sm hover:shadow-md"
          >
            {/* Soft background ambient gradient */}
            <div
              className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl ${kpi.color} opacity-30 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform`}
            />

            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-muted tracking-tight">
                {kpi.title}
              </span>
              <div className={`p-2 rounded-xl bg-surface-elevated border border-border/80 text-white`}>
                <Icon className="w-4 h-4 text-slate-200" />
              </div>
            </div>

            <div className="mb-2">
              <span className="text-2xl font-bold tracking-tight text-white">
                {kpi.value}
              </span>
            </div>

            <div className="flex items-center justify-between text-[11px] pt-2 border-t border-border/50">
              <span className="text-subtle truncate max-w-[150px]">{kpi.subtext}</span>
              <span
                className={`font-semibold shrink-0 ${
                  kpi.trendType === 'positive'
                    ? 'text-emerald-400'
                    : kpi.trendType === 'warning'
                    ? 'text-amber-400'
                    : 'text-slate-300'
                }`}
              >
                {kpi.trend}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

