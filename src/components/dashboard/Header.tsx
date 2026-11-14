'use client';

import React from 'react';
import { Menu, Building2, Bell, Shield, LogOut, ExternalLink, Sparkles } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { user, logout } = useAuth();

  const getRoleBadgeVariant = (roleSlug?: string) => {
    switch (roleSlug) {
      case 'owner':
        return 'warning';
      case 'office_manager':
        return 'primary';
      case 'dispatcher':
        return 'ai';
      case 'sales_estimator':
        return 'accent';
      case 'technician':
        return 'success';
      case 'finance':
        return 'outline';
      default:
        return 'default';
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-surface/80 backdrop-blur-xl border-b border-border px-4 sm:px-6 flex items-center justify-between">
      {/* Left: Mobile hamburger & Active Tenant info */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="p-2 rounded-xl text-muted hover:text-white hover:bg-surface-elevated lg:hidden transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex w-8 h-8 rounded-lg bg-surface-elevated border border-border items-center justify-center text-primary">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-white tracking-tight">
                {user?.tenantName || 'Desert Air HVAC & Plumbing'}
              </span>
              <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-surface-card border border-border text-slate-300 font-mono">
                {user?.tenantSlug || 'desert-air'}
              </span>
            </div>
            <p className="text-[11px] text-muted hidden sm:block">
              Operations Hub · AI Autonomous Triage
            </p>
          </div>
        </div>
      </div>

      {/* Right: Active Role, Notifications, Sign Out */}
      <div className="flex items-center gap-3">
        {/* Role Indicator Badge */}
        {user?.role && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-card border border-border">
            <Shield className="w-3.5 h-3.5 text-primary" />
            <div className="flex flex-col text-right">
              <span className="text-[10px] text-muted uppercase font-semibold leading-none">
                Role
              </span>
              <span className="text-xs font-bold text-white capitalize leading-tight">
                {user.role.name}
              </span>
            </div>
          </div>
        )}

        {/* Quick Demo Switcher Link */}
        <Link
          href="/login"
          title="Switch role in Demo Mode"
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-300 hover:text-white bg-surface-elevated hover:bg-border/60 border border-border transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5 text-ai" />
          <span>Switch Role</span>
        </Link>

        {/* Notification Bell */}
        <button
          className="relative p-2 rounded-xl text-muted hover:text-white hover:bg-surface-elevated transition-colors"
          title="AI Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-ai animate-ping" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-ai" />
        </button>

        {/* Sign Out Button */}
        <button
          onClick={() => logout()}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium text-muted hover:text-red-400 hover:bg-danger/10 border border-transparent hover:border-danger/30 transition-all"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Sign Out</span>
        </button>
      </div>
    </header>
  );
}

