'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Bell,
  BellOff,
  CheckCheck,
  Flame,
  Truck,
  Navigation,
  Clock,
  AlertTriangle,
  AlertCircle,
  X,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { apiRequest } from '@/lib/api';

export interface AppNotification {
  id: string;
  tenantId: string;
  userId?: string | null;
  type: string;
  title: string;
  message: string;
  priority: 'URGENT' | 'HIGH' | 'NORMAL' | 'LOW';
  link?: string | null;
  entityType?: string | null;
  entityId?: string | null;
  isRead: boolean;
  createdAt: string;
}

export function NotificationDropdown() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<'ALL' | 'UNREAD' | 'URGENT'>('ALL');
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch notifications from backend
  const fetchNotifications = async () => {
    try {
      const res = await apiRequest<{ notifications: AppNotification[]; unreadCount: number }>(
        '/notifications?limit=25'
      );
      if (res && res.notifications) {
        setNotifications(res.notifications);
        setUnreadCount(res.unreadCount ?? 0);
      }
    } catch (err) {
      // Silently fail if not logged in or network error
      console.debug('Notification fetch error:', err);
    }
  };

  // Initial fetch and 15-second polling for live autonomous updates
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Mark single notification as read
  const handleMarkAsRead = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    // Optimistic UI update
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));

    try {
      await apiRequest(`/notifications/${id}/read`, { method: 'PATCH' });
    } catch (err) {
      console.error('Failed to mark notification read:', err);
    }
  };

  // Mark all notifications as read
  const handleMarkAllRead = async () => {
    // Optimistic update
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);

    try {
      await apiRequest('/notifications/read-all', { method: 'PATCH' });
    } catch (err) {
      console.error('Failed to mark all read:', err);
    }
  };

  // Resolve destination link with jobId query param
  const getDestinationLink = (n: AppNotification): string | null => {
    let url = n.link || '/schedule';
    if (url.startsWith('/schedule') && !url.includes('jobId=')) {
      if (n.entityId) {
        url = `/schedule?jobId=${n.entityId}`;
      } else {
        const match = n.title.match(/JOB-\d+/i) || n.message.match(/JOB-\d+/i);
        if (match) {
          url = `/schedule?jobId=${match[0]}`;
        }
      }
    }
    return url;
  };

  // Click on a notification item: mark read and navigate with deep-link
  const handleNotificationClick = (n: AppNotification) => {
    if (!n.isRead) {
      handleMarkAsRead(n.id);
    }
    const dest = getDestinationLink(n);
    if (dest) {
      setIsOpen(false);
      router.push(dest);
    }
  };

  // Filter list based on selected tab
  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'UNREAD') return !n.isRead;
    if (filter === 'URGENT') return n.priority === 'URGENT' || n.priority === 'HIGH';
    return true;
  });

  // Helper for notification type icons & badge styling
  const getTypeBadge = (type: string, priority: string) => {
    if (priority === 'URGENT' || type === 'EMERGENCY_LEAD') {
      return {
        icon: <Flame className="w-3.5 h-3.5 text-red-400" />,
        badgeClass: 'bg-red-500/20 text-red-400 border-red-500/30',
        label: 'EMERGENCY',
      };
    }
    if (type === 'JOB_DISPATCH') {
      return {
        icon: <Truck className="w-3.5 h-3.5 text-purple-400" />,
        badgeClass: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
        label: 'DISPATCH',
      };
    }
    if (type === 'TECH_STATUS_CHANGE') {
      return {
        icon: <Navigation className="w-3.5 h-3.5 text-blue-400" />,
        badgeClass: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
        label: 'FIELD TECH',
      };
    }
    if (type === 'DISPATCH_TIMEOUT') {
      return {
        icon: <Clock className="w-3.5 h-3.5 text-amber-400" />,
        badgeClass: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
        label: 'RE-ASSIGNED',
      };
    }
    if (type === 'ESCALATION_REQUIRED') {
      return {
        icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />,
        badgeClass: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
        label: 'ESCALATION',
      };
    }
    return {
      icon: <Sparkles className="w-3.5 h-3.5 text-slate-400" />,
      badgeClass: 'bg-surface-elevated text-slate-300 border-border',
      label: 'SYSTEM',
    };
  };

  // Helper for relative timestamps
  const getRelativeTime = (dateStr: string) => {
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  const hasUrgentUnread = notifications.some(
    (n) => !n.isRead && (n.priority === 'URGENT' || n.priority === 'HIGH')
  );

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) fetchNotifications();
        }}
        className="relative p-2 rounded-xl text-muted hover:text-white hover:bg-surface-elevated transition-colors"
        title="AI Operational Notifications"
        aria-label="Notifications"
      >
        <Bell className="w-4 h-4" />
        
        {unreadCount > 0 && (
          <>
            {/* Pulsing indicator for urgent alerts */}
            {hasUrgentUnread && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 animate-ping" />
            )}
            <span
              className={`absolute -top-1 -right-1 px-1.5 py-0.2 text-[10px] font-bold font-mono rounded-full border shadow-sm ${
                hasUrgentUnread
                  ? 'bg-red-600 text-white border-red-400'
                  : 'bg-primary text-white border-primary/40'
              }`}
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          </>
        )}
      </button>

      {/* Dropdown Popover */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-surface/95 backdrop-blur-2xl border border-border/90 shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/80 bg-surface-elevated/40">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white tracking-tight">Notifications</span>
              {unreadCount > 0 && (
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-primary/20 text-primary border border-primary/30">
                  {unreadCount} new
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="flex items-center gap-1 text-[11px] font-medium text-slate-400 hover:text-white transition-colors"
                title="Mark all as read"
              >
                <CheckCheck className="w-3.5 h-3.5 text-primary" />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5 px-4 py-2 border-b border-border/60 bg-surface/50 text-xs">
            {(['ALL', 'UNREAD', 'URGENT'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-2.5 py-1 rounded-lg font-semibold text-[11px] transition-all ${
                  filter === tab
                    ? 'bg-primary text-white shadow-sm shadow-primary/30'
                    : 'text-slate-400 hover:text-white hover:bg-surface-elevated'
                }`}
              >
                {tab === 'ALL' ? 'All' : tab === 'UNREAD' ? 'Unread' : 'Urgent 🚨'}
              </button>
            ))}
          </div>

          {/* Notification Items List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-border/50">
            {filteredNotifications.length === 0 ? (
              <div className="py-10 px-4 text-center flex flex-col items-center justify-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-surface-elevated border border-border flex items-center justify-center text-slate-500">
                  <BellOff className="w-5 h-5" />
                </div>
                <p className="text-xs font-semibold text-slate-300">No notifications here</p>
                <p className="text-[11px] text-muted max-w-[200px]">
                  All autonomous work orders & dispatch alerts are caught up.
                </p>
              </div>
            ) : (
              filteredNotifications.map((n) => {
                const { icon, badgeClass, label } = getTypeBadge(n.type, n.priority);
                const isUrgent = n.priority === 'URGENT';

                return (
                  <div
                    key={n.id}
                    onClick={() => handleNotificationClick(n)}
                    className={`p-3.5 hover:bg-surface-elevated/70 transition-all cursor-pointer relative group flex gap-3 ${
                      !n.isRead ? 'bg-primary/5' : ''
                    }`}
                  >
                    {/* Unread indicator dot */}
                    {!n.isRead && (
                      <span className="absolute left-1.5 top-4 w-1.5 h-1.5 rounded-full bg-primary" />
                    )}

                    {/* Icon Column */}
                    <div className="shrink-0 mt-0.5">
                      <div className="w-8 h-8 rounded-xl bg-surface-elevated border border-border/80 flex items-center justify-center">
                        {icon}
                      </div>
                    </div>

                    {/* Content Column */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider ${badgeClass}`}
                        >
                          {label}
                        </span>
                        <span className="text-[10px] text-muted whitespace-nowrap">
                          {getRelativeTime(n.createdAt)}
                        </span>
                      </div>

                      <h4
                        className={`text-xs font-semibold truncate ${
                          isUrgent ? 'text-red-300 font-bold' : !n.isRead ? 'text-white' : 'text-slate-300'
                        }`}
                      >
                        {n.title}
                      </h4>

                      <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5 leading-relaxed">
                        {n.message}
                      </p>

                      {/* Clickable link hint */}
                      {n.link && (
                        <div className="mt-1.5 flex items-center gap-1 text-[10px] font-medium text-primary hover:underline">
                          <span>View Details</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2.5 bg-surface-elevated/40 border-t border-border/70 flex items-center justify-between text-[11px] text-muted">
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
              </span>
              <span className="text-[10px] text-slate-400 font-medium">Elijah Live Operations Feed</span>
            </div>
            <button
              onClick={() => {
                setIsOpen(false);
                router.push('/schedule');
              }}
              className="text-[10px] font-semibold text-primary hover:text-white transition-colors"
            >
              Dispatch Board →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
