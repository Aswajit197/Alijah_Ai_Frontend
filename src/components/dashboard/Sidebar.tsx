'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Zap,
  LayoutDashboard,
  Inbox,
  CalendarDays,
  Users,
  AlertTriangle,
  Smartphone,
  Settings,
  LogOut,
  X,
  ChevronRight,
  Shield,
  Activity,
  Target,
  FileText,
  CreditCard,
  BookOpen,
  PhoneCall,
  Bot,
  PlayCircle,
  Briefcase,
  Repeat,
  MapPin,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const roleSlug = user?.role?.slug || 'owner';

  const navItems = [
    {
      label: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      badge: null,
      roles: ['owner', 'office_manager', 'dispatcher', 'sales_estimator', 'finance', 'technician'],
    },
    {
      label: 'Unified Inbox',
      href: '/inbox',
      icon: Inbox,
      badge: null,
      badgeColor: 'bg-primary/20 text-primary border-primary/30',
      roles: ['owner', 'office_manager', 'dispatcher'],
    },
    {
      label: 'Leads & Pipeline',
      href: '/leads',
      icon: Target,
      badge: null,
      badgeColor: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      roles: ['owner', 'office_manager', 'dispatcher', 'sales_estimator'],
    },
    {
      label: 'Schedule & Dispatch',
      href: '/schedule',
      icon: CalendarDays,
      badge: null,
      roles: ['owner', 'office_manager', 'dispatcher'],
    },
    {
      label: 'Customers & CRM',
      href: '/customers',
      icon: Users,
      badge: null,
      roles: ['owner', 'office_manager', 'dispatcher', 'sales_estimator', 'finance'],
    },
    {
      label: 'Needs Attention',
      href: '/escalations',
      icon: AlertTriangle,
      badge: null,
      badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30 animate-pulse',
      roles: ['owner', 'office_manager'],
    },
    {
      label: 'AI Team',
      href: '/ai-team',
      icon: Bot,
      badge: null,
      roles: ['owner', 'office_manager'],
    },
    {
      label: 'Mobile Field Portal',
      href: '/tech',
      icon: Smartphone,
      badge: roleSlug === 'technician' ? 'Active' : null,
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      roles: ['technician', 'owner', 'office_manager'],
    },
    {
      label: 'Company Settings',
      href: '/settings',
      icon: Settings,
      badge: null,
      roles: ['owner', 'office_manager'],
    },
  ];

  const visibleNavItems = navItems.filter((item) =>
    item.roles.includes(roleSlug)
  );

  const workspaceItems = [
    {
      label: 'Estimates & Proposals',
      href: '/estimates',
      icon: FileText,
      badge: 'New',
      badgeColor: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
      roles: ['owner', 'office_manager', 'sales_estimator', 'dispatcher'],
    },
    {
      label: 'Follow-up Recipes',
      href: '/recipes',
      icon: Repeat,
      badge: null,
      badgeColor: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
      roles: ['owner', 'office_manager', 'sales_estimator', 'dispatcher'],
    },
    {
      label: 'Billing & AR',
      href: '/billing',
      icon: CreditCard,
      badge: null,
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      roles: ['owner', 'office_manager', 'finance'],
    },
    {
      label: 'Projects',
      href: '/projects',
      icon: Briefcase,
      badge: null,
      roles: ['owner', 'office_manager', 'sales_estimator'],
    },
    {
      label: 'Service Areas',
      href: '/service-areas',
      icon: MapPin,
      badge: null,
      badgeColor: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      roles: ['owner', 'office_manager', 'dispatcher'],
    },
    {
      label: 'Knowledge Base',
      href: '/knowledge',
      icon: BookOpen,
      badge: null,
      badgeColor: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      roles: ['owner', 'office_manager', 'dispatcher', 'sales_estimator', 'technician'],
    },
    {
      label: 'Call Simulator',
      href: '/call-simulator',
      icon: PhoneCall,
      badge: 'Sandbox',
      badgeColor: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
      roles: ['owner', 'office_manager'],
    },
    {
      label: 'Test Drive',
      href: '/test-drive',
      icon: PlayCircle,
      badge: 'QA',
      badgeColor: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      roles: ['owner', 'office_manager'],
    },
  ];

  const visibleWorkspaceItems = workspaceItems.filter((item) =>
    item.roles.includes(roleSlug)
  );

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          'fixed top-0 bottom-0 left-0 z-50 flex flex-col w-72 h-full bg-surface/95 backdrop-blur-xl border-r border-border shrink-0 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-border/70">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary to-ai flex items-center justify-center text-white shadow-md shadow-primary-glow group-hover:scale-105 transition-transform">
              <Zap className="w-5 h-5 fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold tracking-tight text-white text-base">ELIJAH</span>
                <span className="text-xs px-1.5 py-0.5 rounded bg-primary/20 text-primary font-mono font-semibold">
                  AI
                </span>
              </div>
              <p className="text-[10px] text-muted truncate max-w-[140px]">
                {user?.tenantName || 'Trade Operations'}
              </p>
            </div>
          </Link>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted hover:text-white hover:bg-surface-elevated lg:hidden transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* AI Operations Status Pill */}
        <div className="px-4 pt-4 pb-2">
          <div className="p-2.5 rounded-xl bg-surface-elevated/70 border border-border/80 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-slate-300 font-medium">Elijah AI 24/7 Agent</span>
            </div>
            <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/50">
              ONLINE
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 px-4 py-3 space-y-1 overflow-y-auto">
          <div className="text-[10px] uppercase font-semibold text-subtle tracking-wider px-3 mb-2">
            Operations Menu
          </div>

          {visibleNavItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch={true}
                onClick={onClose}
                className={cn(
                  'flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all group active:scale-[0.98]',
                  isActive
                    ? 'bg-primary/15 text-white border border-primary/40 shadow-sm shadow-primary-glow/20'
                    : 'text-muted hover:text-white hover:bg-surface-elevated'
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={cn(
                      'w-4 h-4 transition-colors',
                      isActive ? 'text-primary' : 'text-subtle group-hover:text-slate-300'
                    )}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={cn(
                      'text-[10px] font-semibold px-2 py-0.5 rounded-full border',
                      item.badgeColor
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}

          {visibleWorkspaceItems.length > 0 && (
            <>
              <div className="pt-4 pb-1">
                <div className="text-[10px] uppercase font-semibold text-subtle tracking-wider px-3 mb-1">
                  Workspaces
                </div>
              </div>
              {visibleWorkspaceItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    prefetch={true}
                    onClick={onClose}
                    className={cn(
                      'flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-all group active:scale-[0.98]',
                      isActive
                        ? 'bg-primary/15 text-white border border-primary/40 shadow-sm shadow-primary-glow/20'
                        : 'text-muted hover:text-white hover:bg-surface-elevated'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        className={cn(
                          'w-4 h-4 transition-colors',
                          isActive ? 'text-primary' : 'text-subtle group-hover:text-slate-300'
                        )}
                      />
                      <span className="truncate">{item.label}</span>
                    </div>

                    {item.badge && (
                      <span
                        className={cn(
                          'text-[10px] font-semibold px-2 py-0.5 rounded-full border',
                          item.badgeColor
                        )}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </>
          )}
        </div>

        {/* User Card & Logout in Footer */}
        <div className="p-4 border-t border-border/70 bg-surface/50">
          <div className="p-3 rounded-2xl bg-surface-card border border-border/80 flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-white text-xs font-bold uppercase shrink-0">
                {user?.name ? user.name.slice(0, 2) : 'US'}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate">{user?.name || 'Staff Member'}</p>
                <p className="text-[10px] text-muted truncate capitalize">
                  {user?.role?.name || 'Member'}
                </p>
              </div>
            </div>

            <button
              onClick={() => logout()}
              title="Sign Out"
              className="p-1.5 rounded-lg text-subtle hover:text-red-400 hover:bg-danger/10 transition-colors shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

