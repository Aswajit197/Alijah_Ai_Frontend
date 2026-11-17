'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { RoleKpiSection } from '@/components/dashboard/RoleKpiSection';
import { NeedsAttentionCard } from '@/components/dashboard/NeedsAttentionCard';
import { AiAgentStatusCard } from '@/components/dashboard/AiAgentStatusCard';
import {
  Zap,
  PhoneCall,
  CalendarPlus,
  UserPlus,
  ShieldAlert,
  Sparkles,
  Bot,
  CheckCircle2,
  Database,
  Lock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function DashboardPage() {
  const { user } = useAuth();

  const roleSlug = user?.role?.slug || 'owner';
  const roleName = user?.role?.name || 'Owner';

  const getRoleDescription = (slug: string) => {
    switch (slug) {
      case 'office_manager':
        return 'Urgent Inbox & Exceptions · Customer callbacks, AI escalations, day-to-day triage';
      case 'dispatcher':
        return 'Schedule & Swimlanes · After-hours call booking, technician scheduling, route changes';
      case 'sales_estimator':
        return 'Pipeline & Proposals · Quote approvals, follow-up texts, customer discount requests';
      case 'technician':
        return 'Mobile Field Portal (/tech) · New job dispatch, equipment notes, address & gate codes';
      case 'finance':
        return 'AR Aging & Invoices · Disputed payments, refund requests, unpaid invoices';
      case 'owner':
      default:
        return 'Executive Overview & ROI · Major approvals (> $5k), contract signing, system supervision';
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-surface to-surface-card border border-border p-6 sm:p-8">
        {/* Ambient lighting glow */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 -mb-16 w-60 h-60 bg-ai/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-primary/15 text-primary border border-primary/30 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{roleName} View</span>
              </span>

              <span className="text-xs text-muted">
                {user?.tenantName}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Welcome back, {user?.name || 'Partner'} 👋
            </h1>

            <p className="text-xs sm:text-sm text-muted max-w-2xl leading-relaxed">
              {getRoleDescription(roleSlug)}
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <a href="/schedule">
              <Button variant="outline" size="sm" className="gap-2 text-xs">
                <CalendarPlus className="w-3.5 h-3.5 text-primary" />
                <span>Book Service</span>
              </Button>
            </a>

            <a href="/tech">
              <Button variant="primary" size="sm" className="gap-2 text-xs shadow-md shadow-primary-glow">
                <Zap className="w-3.5 h-3.5" />
                <span>Mobile Field App</span>
              </Button>
            </a>
          </div>
        </div>
      </div>

      {/* Role-Adaptive KPI Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-subtle">
            Operational Health & Metrics
          </h2>
          <span className="text-[11px] text-muted">Updated in real-time</span>
        </div>
        <RoleKpiSection roleSlug={roleSlug} roleName={roleName} />
      </div>

      {/* Main 2-Column Dashboard Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Human-In-The-Loop Escalation Queue */}
        <div className="lg:col-span-7">
          <NeedsAttentionCard roleSlug={roleSlug} />
        </div>

        {/* Right Column (5 cols): Real-Time AI Autonomous Operations Stream */}
        <div className="lg:col-span-5">
          <AiAgentStatusCard />
        </div>
      </div>

      {/* System Infrastructure Bar */}
      <div className="p-4 rounded-2xl bg-surface/60 border border-border/70 flex flex-wrap items-center justify-between gap-4 text-xs text-muted">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span>PostgreSQL (pgvector): <strong>Active</strong></span>
          </div>

          <div className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-primary" />
            <span>Multi-Tenant Context: <strong>{user?.tenantSlug}</strong></span>
          </div>

          <div className="flex items-center gap-1.5">
            <Bot className="w-3.5 h-3.5 text-ai" />
            <span>Elijah Core AI Engine: <strong>Autonomous Triage Active</strong></span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px]">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-slate-300 font-mono">Port 3000 · Company Portal</span>
        </div>
      </div>
    </div>
  );
}

