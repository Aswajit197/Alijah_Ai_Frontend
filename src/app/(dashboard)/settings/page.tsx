'use client';

import React from 'react';
import { Settings, Shield, Users, Building2, Key, CheckCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function SettingsPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
          <Settings className="w-6 h-6 text-primary" />
          <span>Company Settings & Team</span>
        </h1>
        <p className="text-xs text-muted mt-1">
          Manage your company profile, tenant security parameters, and operational staff.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Company Profile Card */}
        <div className="p-6 rounded-3xl bg-surface/90 border border-border space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-border">
            <Building2 className="w-5 h-5 text-primary" />
            <h2 className="text-sm font-bold text-white">Company Profile</h2>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-muted block text-[11px]">Organization Name</span>
              <span className="text-white font-semibold text-sm">{user?.tenantName || 'Desert Air HVAC & Plumbing'}</span>
            </div>

            <div>
              <span className="text-muted block text-[11px]">Tenant Identifier</span>
              <span className="text-white font-mono bg-surface-elevated px-2 py-0.5 rounded border border-border">
                {user?.tenantSlug || 'desert-air'}
              </span>
            </div>

            <div>
              <span className="text-muted block text-[11px]">Primary Location</span>
              <span className="text-slate-300">Las Vegas & Henderson, NV</span>
            </div>
          </div>
        </div>

        {/* User Session Security */}
        <div className="p-6 rounded-3xl bg-surface/90 border border-border space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-border">
            <Shield className="w-5 h-5 text-emerald-400" />
            <h2 className="text-sm font-bold text-white">Security & Active Session</h2>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-muted block text-[11px]">Signed In As</span>
              <span className="text-white font-semibold">{user?.name} ({user?.email})</span>
            </div>

            <div>
              <span className="text-muted block text-[11px]">Assigned Role</span>
              <span className="text-emerald-400 font-semibold capitalize">{user?.role?.name}</span>
            </div>

            <div>
              <span className="text-muted block text-[11px]">Approval Limit</span>
              <span className="text-slate-300 font-mono">
                ${Number(user?.role?.approvalLimit || 0).toLocaleString()} USD
              </span>
            </div>

            <div className="pt-2 flex items-center gap-1.5 text-[11px] text-emerald-400">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Session secured with HTTP Cookie + JWT expiration guards</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
