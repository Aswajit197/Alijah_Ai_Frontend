'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Badge } from '@/components/ui/badge';
import {
  Zap,
  PhoneCall,
  CalendarPlus,
  Users,
  ShieldAlert,
  Sparkles,
  Bot,
  CheckCircle2,
  Database,
  Lock,
  Search,
  ArrowRight,
  TrendingUp,
  DollarSign,
  Clock,
  Truck,
  Check,
  AlertTriangle,
  Receipt,
  FileText,
  MapPin,
  ExternalLink,
  ChevronDown,
  RefreshCw,
  X,
  Volume2,
} from 'lucide-react';

interface TaskItem {
  id: string;
  type: 'fix' | 'approve' | 'dispatch' | 'review';
  title: string;
  context: string;
  dueText: string;
  isPastDue?: boolean;
  actionPayload?: {
    customerName?: string;
    amount?: string;
    itemType?: string;
    recommendation?: string;
  };
}

export default function DashboardPage() {
  const { user } = useAuth();

  // Active role (allows previewing other roles directly for demos)
  const userRole = user?.role?.slug || 'owner';
  const [activeRole, setActiveRole] = useState<string>(userRole);

  // Timeframe and location filters
  const [timeframe, setTimeframe] = useState<'24h' | '7d' | '30d'>('24h');
  const [location, setLocation] = useState<'all' | 'central' | 'scottsdale' | 'east_valley'>('all');

  // "Ask Elijah" Natural Language Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [aiAnswer, setAiAnswer] = useState<{
    query: string;
    answer: string;
    actionLabel?: string;
    actionHref?: string;
  } | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // Task Resolution & Modal State
  const [activeTask, setActiveTask] = useState<TaskItem | null>(null);
  const [resolvedTaskIds, setResolvedTaskIds] = useState<string[]>([]);
  const [isActionSubmitting, setIsActionSubmitting] = useState(false);
  const [actionSuccessToast, setActionSuccessToast] = useState<string | null>(null);

  // Quickbook status state
  const [qbConnected, setQbConnected] = useState(false);

  // Handle Ask Elijah Query
  const handleAskElijah = (queryToRun?: string) => {
    const q = (queryToRun || searchQuery).trim();
    if (!q) return;

    setIsSearching(true);
    setTimeout(() => {
      setIsSearching(false);
      const lower = q.toLowerCase();

      if (lower.includes('owe') || lower.includes('5,000') || lower.includes('balance') || lower.includes('5000')) {
        setAiAnswer({
          query: q,
          answer: 'Apex Warehousing currently has the largest outstanding balance: $6,450 (Invoice #1012, 14 days overdue). An automated SMS payment link was dispatched yesterday with 1 customer click.',
          actionLabel: 'View Invoice & AR Aging',
          actionHref: '/customers',
        });
      } else if (lower.includes('emergency') || lower.includes('urgent') || lower.includes('hazard')) {
        setAiAnswer({
          query: q,
          answer: '1 active emergency work order: Main breaker buzzing violently with sparks (Sarah Connor - 777 Sunset Blvd). Automatically routed to Field Technician Tek Chand (Status: DISPATCHED).',
          actionLabel: 'View on Schedule Board',
          actionHref: '/schedule',
        });
      } else if (lower.includes('tech') || lower.includes('capacity') || lower.includes('load') || lower.includes('schedule')) {
        setAiAnswer({
          query: q,
          answer: 'Phoenix Metro technician capacity is currently 83% booked today across 3 active technician swimlanes. 2 open afternoon arrival windows remain between 2:00 PM and 6:00 PM.',
          actionLabel: 'Open Calendar Swimlanes',
          actionHref: '/schedule',
        });
      } else if (lower.includes('conversion') || lower.includes('rate') || lower.includes('performance') || lower.includes('revenue')) {
        setAiAnswer({
          query: q,
          answer: 'Elijah AI has booked 23 out of 28 bookable inbound voice calls today (82.1% booking conversion rate), generating an estimated $19,757 in confirmed work orders.',
          actionLabel: 'Review Unified Inbox Calls',
          actionHref: '/inbox',
        });
      } else {
        setAiAnswer({
          query: q,
          answer: `Elijah AI analyzed your operational records for "${q}". 0 system blocks detected. All technicians are GPS-synced and active on their assigned routes.`,
          actionLabel: 'Explore Unified Inbox',
          actionHref: '/inbox',
        });
      }
    }, 400);
  };

  // Role Configuration Data
  const getRoleData = (role: string) => {
    switch (role) {
      case 'office_manager':
        return {
          roleTitle: 'Office Manager',
          roleSubtitle: 'Urgent Inbox, Exception Triage & Customer Callbacks',
          heroStatText: 'Elijah resolved 18 customer inquiries today · 3 exceptions awaiting triage · Avg response time 1.8 min',
          kpis: [
            { label: 'Urgent Exceptions', value: '3 Open', sub: '2 high priority triage', icon: ShieldAlert, color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' },
            { label: 'Scheduled Callbacks', value: '14 Calls', sub: 'Transcribed & prioritized', icon: PhoneCall, color: 'text-primary bg-primary/10 border-primary/20' },
            { label: 'Unbooked Leads', value: '5 Requests', sub: 'Web inquiries pending', icon: Users, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
            { label: 'Customer CSAT', value: '98.6%', sub: 'Autonomous post-job polls', icon: CheckCircle2, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
            { label: 'Tasks Auto-Created', value: '24 Tasks', sub: 'Delegated to staff lanes', icon: Sparkles, color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
            { label: 'Staff Time Saved', value: '3.6 h', sub: 'Autonomous voice intake', icon: Clock, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
          ],
          tasks: [
            {
              id: 'task-1',
              type: 'fix',
              title: 'Booking not confirmed — Nina Patel, Wed 10–12',
              context: 'Customer requested 10-12 PM window but did not answer SMS confirmation link within 15 minutes.',
              dueText: 'due 9 min',
              isPastDue: false,
              actionPayload: { customerName: 'Nina Patel', itemType: 'Appointment Confirmation', recommendation: 'Place outbound call or lock slot directly.' },
            },
            {
              id: 'task-2',
              type: 'fix',
              title: 'Customer requested manager callback — Marcus Webb',
              context: 'Customer requested clarification on $129 diagnostic fee vs repair credit.',
              dueText: 'due just now',
              isPastDue: true,
              actionPayload: { customerName: 'Marcus Webb', itemType: 'Fee Dispute', recommendation: 'Confirm that $129 fee is credited toward repair.' },
            },
            {
              id: 'task-3',
              type: 'fix',
              title: 'QuickBooks Online (Demo) needs to be reconnected',
              context: 'OAuth refresh token expired. Invoice auto-sync is currently paused.',
              dueText: 'Past due',
              isPastDue: true,
              actionPayload: { itemType: 'QuickBooks OAuth', recommendation: 'Authenticate connection with 1-click token refresh.' },
            },
            {
              id: 'task-4',
              type: 'approve',
              title: 'Rescheduling request: Juan Ortiz moving to Friday 2 PM',
              context: 'Customer called after-hours line requesting Friday afternoon instead of Thursday.',
              dueText: 'due 1 h',
              isPastDue: false,
              actionPayload: { customerName: 'Juan Ortiz', itemType: 'Schedule Change', recommendation: 'Authorize move to Friday swimlane.' },
            },
          ] as TaskItem[],
        };

      case 'dispatcher':
        return {
          roleTitle: 'Dispatcher',
          roleSubtitle: 'Technician Swimlanes, Calendar Routing & Emergency Dispatch',
          heroStatText: '8 of 10 field technicians active · 16 work orders on calendar · 100% capacity filled',
          kpis: [
            { label: 'Field Techs Active', value: '8 / 10 Active', sub: '2 on break / staging', icon: Truck, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
            { label: 'Jobs Scheduled Today', value: '16 Work Orders', sub: '12 standard · 4 emergencies', icon: CalendarPlus, color: 'text-primary bg-primary/10 border-primary/20' },
            { label: 'AI Route Savings', value: '28.4 Miles', sub: 'Traffic-aware batching', icon: TrendingUp, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
            { label: 'Unassigned Jobs', value: '1 Work Order', sub: 'Waiting for territory fit', icon: ShieldAlert, color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' },
            { label: 'Arrival Accuracy', value: '96.2%', sub: 'Within 2h arrival window', icon: CheckCircle2, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
            { label: 'First-Time Fix', value: '91.0%', sub: 'Pre-matched equipment', icon: Sparkles, color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
          ],
          tasks: [
            {
              id: 'task-d1',
              type: 'dispatch',
              title: 'Emergency: Main breaker buzzing with sparks — Sarah Connor',
              context: 'High-voltage fire hazard in Phoenix Central (85004). Auto-triage tagged ASAP dispatch.',
              dueText: 'due immediately',
              isPastDue: true,
              actionPayload: { customerName: 'Sarah Connor', itemType: 'Emergency Dispatch', recommendation: 'Assign to Tek Chand (4 mins away).' },
            },
            {
              id: 'task-d2',
              type: 'fix',
              title: 'Late arrival risk: Tech Mike R. running 22 mins behind',
              context: 'Previous diagnostic job ran over on capacitor replacement. Customer arrival window closing.',
              dueText: 'due 15 min',
              isPastDue: false,
              actionPayload: { customerName: 'Robert Miller', itemType: 'Window Push Notification', recommendation: 'Send automated "Tech running 15m behind" courtesy text.' },
            },
            {
              id: 'task-d3',
              type: 'fix',
              title: 'Gate code missing — 1725 E Camelback Rd (Stop #3)',
              context: 'Homeowner did not specify security gate code during automated call intake.',
              dueText: 'due 30 min',
              isPastDue: false,
              actionPayload: { customerName: 'Michael Scott', itemType: 'Gate Access Code', recommendation: 'Send instant 1-click SMS access request to customer.' },
            },
          ] as TaskItem[],
        };

      case 'sales_estimator':
        return {
          roleTitle: 'Sales & Estimator',
          roleSubtitle: 'Sales Pipeline, Tiered Proposals & Automated Follow-Ups',
          heroStatText: 'Active pipeline $48,200 · 6 bids awaiting customer signature · 42.5% win rate',
          kpis: [
            { label: 'Active Pipeline Value', value: '$48,200', sub: '14 active proposals', icon: DollarSign, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
            { label: 'Bids Pending Signature', value: '6 Proposals', sub: '2 automated SMS sent', icon: FileText, color: 'text-primary bg-primary/10 border-primary/20' },
            { label: 'Closed This Month', value: '$34,900', sub: '+18% vs last month', icon: TrendingUp, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
            { label: 'Avg Ticket Value', value: '$4,850', sub: 'Good / Better / Best tiered', icon: Sparkles, color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
            { label: 'Proposal Win Rate', value: '42.5%', sub: 'Industry benchmark 31%', icon: CheckCircle2, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
            { label: 'Automated Dunning', value: '24 Sent', sub: 'Two-way SMS cadence', icon: PhoneCall, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
          ],
          tasks: [
            {
              id: 'task-s1',
              type: 'approve',
              title: 'Send $11,250 heat pump estimate to Carl Jensen',
              context: 'Good/Better/Best proposal generated by AI based on Carrier 5-ton heat pump replacement.',
              dueText: 'due 3 h',
              isPastDue: false,
              actionPayload: { customerName: 'Carl Jensen', amount: '$11,250', itemType: 'Carrier 5-Ton Proposal', recommendation: 'Authorize proposal delivery via SMS link.' },
            },
            {
              id: 'task-s2',
              type: 'approve',
              title: 'Send $14,500 premium inverter estimate to Linda Parker',
              context: 'High-efficiency inverter HVAC unit recommendation following compressor burnout.',
              dueText: 'due 6 h',
              isPastDue: false,
              actionPayload: { customerName: 'Linda Parker', amount: '$14,500', itemType: 'Trane Inverter Package', recommendation: 'Review gross margin (41%) and send.' },
            },
            {
              id: 'task-s3',
              type: 'fix',
              title: 'Highlander Club discount exception: 15% requested',
              context: 'General manager requested $2,400 courtesy discount to execute agreement today.',
              dueText: 'due 45 min',
              isPastDue: false,
              actionPayload: { customerName: 'Highlander Country Club', amount: '$18,400', itemType: 'Discount Request', recommendation: 'Threshold limit is $1,500. Forward to owner or counter with $1,500.' },
            },
          ] as TaskItem[],
        };

      case 'technician':
        return {
          roleTitle: 'Field Technician',
          roleSubtitle: 'Mobile Field Portal, On-Site Checklist & Work Orders',
          heroStatText: '4 stops assigned today · Next arrival: 1725 E Camelback Rd · Mobile App active',
          kpis: [
            { label: 'Assigned Stops Today', value: '4 Stops', sub: '2 completed · 2 remaining', icon: Truck, color: 'text-primary bg-primary/10 border-primary/20' },
            { label: 'Next Arrival Window', value: '1:30 - 3:30 PM', sub: 'Stop #3 · Camelback Rd', icon: Clock, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
            { label: 'Equipment Scanned', value: '6 Units', sub: 'QR serials tagged in CRM', icon: Zap, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
            { label: 'On-Site Checklists', value: '100% Pass', sub: 'Safety & refrigerant check', icon: CheckCircle2, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
            { label: 'Customer Reviews', value: '5.0 ★', sub: '8 positive reviews logged', icon: Sparkles, color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
            { label: 'Avg Time on Site', value: '48 Min', sub: 'High diagnostic efficiency', icon: TrendingUp, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
          ],
          tasks: [
            {
              id: 'task-t1',
              type: 'fix',
              title: 'Gate code invalid for Stop #3 — Callbox not responding',
              context: '1725 E Camelback Rd. Customer did not pick up initial call.',
              dueText: 'due now',
              isPastDue: true,
              actionPayload: { customerName: 'Michael Scott', itemType: 'Access Issue', recommendation: 'AI will call customer secondary number.' },
            },
            {
              id: 'task-t2',
              type: 'approve',
              title: 'Customer approved $185 capacitor repair — Sign-off required',
              context: 'Customer gave verbal approval on site. Digital signature ready for customer portal.',
              dueText: 'due 20 min',
              isPastDue: false,
              actionPayload: { customerName: 'Michael Scott', amount: '$185', itemType: 'Repair Work Order', recommendation: 'Collect digital signature on phone.' },
            },
          ] as TaskItem[],
        };

      case 'finance':
        return {
          roleTitle: 'Finance & Accounts Receivable',
          roleSubtitle: 'AR Aging, Automated Invoice Collection & Payments',
          heroStatText: '$14,820 collected via Elijah this week · 2 invoices past due · 0 disputed payments',
          kpis: [
            { label: 'Collected via Elijah', value: '$14,820', sub: 'Instant SMS payment links', icon: DollarSign, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
            { label: 'Invoices Issued', value: '28 Invoices', sub: 'All synced with ledger', icon: Receipt, color: 'text-primary bg-primary/10 border-primary/20' },
            { label: 'Overdue Balance', value: '$2,450', sub: 'Down 32% this month', icon: ShieldAlert, color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' },
            { label: 'Avg Days to Pay', value: '3.2 Days', sub: 'Industry benchmark 24 days', icon: TrendingUp, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
            { label: 'Stripe Pay Links Sent', value: '31 Sent', sub: '94% collection completion', icon: Sparkles, color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
            { label: 'Collection Rate', value: '98.1%', sub: 'Automated SMS follow-ups', icon: CheckCircle2, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
          ],
          tasks: [
            {
              id: 'task-f1',
              type: 'fix',
              title: 'QuickBooks Online (Demo) needs to be reconnected',
              context: 'API sync token expired. Automatic invoice export paused.',
              dueText: 'Past due',
              isPastDue: true,
              actionPayload: { itemType: 'QuickBooks Sync', recommendation: 'Authenticate connection with 1-click token refresh.' },
            },
            {
              id: 'task-f2',
              type: 'review',
              title: 'Invoice #1029 past due by 14 days — Apex Logistics ($1,450)',
              context: 'Commercial customer claims diagnostic charge should be covered by warranty.',
              dueText: 'Past due',
              isPastDue: true,
              actionPayload: { customerName: 'Apex Logistics', amount: '$1,450', itemType: 'Overdue Invoice', recommendation: 'Review clause 4.2 of maintenance contract.' },
            },
          ] as TaskItem[],
        };

      case 'owner':
      default:
        return {
          roleTitle: 'Business Owner',
          roleSubtitle: 'Executive Overview, Booked Work & AI Return on Investment (ROI)',
          heroStatText: 'Elijah handled 35 conversations in the last 24 hours and booked $19,757 in work.',
          kpis: [
            { label: 'Calls Handled by Elijah', value: '26 Calls', sub: '14 after-hours answered', icon: PhoneCall, color: 'text-primary bg-primary/10 border-primary/20' },
            { label: 'Jobs Booked', value: '23 Jobs', sub: '83% of bookable calls', icon: CalendarPlus, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
            { label: 'Booked Work', value: '$19,757', sub: 'From Elijah-booked jobs', icon: DollarSign, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
            { label: 'Recovered Estimates', value: '$3,480', sub: '$12,480 more influenced', icon: TrendingUp, color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
            { label: 'Payments via Elijah', value: '$1,863', sub: '$6,338 collected in total', icon: Receipt, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
            { label: 'Admin Time Saved', value: '2.4 h', sub: '43 autonomous actions', icon: Clock, color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' },
          ],
          tasks: [
            {
              id: 'task-o1',
              type: 'fix',
              title: 'Booking not confirmed — Nina Patel, Wed 10–12',
              context: 'Customer did not click SMS appointment verification link within 15 minutes.',
              dueText: 'due 9 min',
              isPastDue: false,
              actionPayload: { customerName: 'Nina Patel', itemType: 'Appointment Lock', recommendation: 'Confirm slot and dispatch technician.' },
            },
            {
              id: 'task-o2',
              type: 'fix',
              title: 'QuickBooks Online (Demo) needs to be reconnected',
              context: 'Invoice sync authorization token expired. Click below to reconnect demo account.',
              dueText: 'Past due',
              isPastDue: true,
              actionPayload: { itemType: 'QuickBooks OAuth', recommendation: 'Authenticate connection with 1-click token refresh.' },
            },
            {
              id: 'task-o3',
              type: 'fix',
              title: 'Late arrival, customer upset — Juan Ortiz',
              context: 'Tech Mike R. is delayed due to severe freeway accident. Customer expressed dissatisfaction.',
              dueText: 'Past due',
              isPastDue: true,
              actionPayload: { customerName: 'Juan Ortiz', itemType: 'Customer Escalation', recommendation: 'Offer $25 courtesy credit and notify updated arrival.' },
            },
            {
              id: 'task-o4',
              type: 'fix',
              title: 'Unhappy customer — Marcus Webb',
              context: 'Customer requested explanation of diagnostic fee before authorizing blower motor repair.',
              dueText: 'due just now',
              isPastDue: true,
              actionPayload: { customerName: 'Marcus Webb', itemType: 'Customer Inquiry', recommendation: 'Authorize fee waiver if repair is approved.' },
            },
            {
              id: 'task-o5',
              type: 'approve',
              title: 'Send $11,250 heat pump estimate to Carl Jensen',
              context: 'Proposal exceeds manager threshold of $5,000. Equipment margin is 38.5%.',
              dueText: 'due 3 h',
              isPastDue: false,
              actionPayload: { customerName: 'Carl Jensen', amount: '$11,250', itemType: 'Proposal Approval (> $5k)', recommendation: 'Authorize counter-signature and send to customer.' },
            },
            {
              id: 'task-o6',
              type: 'approve',
              title: 'Send $14,500 heat pump estimate to Linda Parker',
              context: 'Commercial tenant requested high-efficiency dual-stage unit. 41% gross margin.',
              dueText: 'due 6 h',
              isPastDue: false,
              actionPayload: { customerName: 'Linda Parker', amount: '$14,500', itemType: 'Executive Approval', recommendation: 'Authorize proposal delivery.' },
            },
          ] as TaskItem[],
        };
    }
  };

  const currentRoleData = getRoleData(activeRole);

  // Execute Task Resolution
  const handleResolveTask = (task: TaskItem) => {
    setIsActionSubmitting(true);
    setTimeout(() => {
      setIsActionSubmitting(false);
      setResolvedTaskIds((prev) => [...prev, task.id]);
      if (task.title.includes('QuickBooks')) {
        setQbConnected(true);
      }
      setActionSuccessToast(`Action resolved successfully: "${task.title.slice(0, 40)}..."`);
      setActiveTask(null);
      setTimeout(() => setActionSuccessToast(null), 4000);
    }, 450);
  };

  // Autonomous Activity Feed Data
  const autonomousActions = [
    { role: 'Office Manager', action: 'Created call task for a person', target: 'Ellen Fischer', timeAgo: 'just now', color: 'text-purple-400 bg-purple-500/10' },
    { role: 'Receptionist', action: 'Booked appointment', target: 'Linda Garcia', timeAgo: '14m ago', color: 'text-primary bg-primary/10' },
    { role: 'Receptionist', action: 'Answered call and classified intent', target: 'Linda Garcia', timeAgo: '18m ago', color: 'text-primary bg-primary/10' },
    { role: 'Dispatcher', action: 'Optimized travel route to avoid Camelback traffic', target: 'Tech Tek Chand', timeAgo: '35m ago', color: 'text-emerald-400 bg-emerald-500/10' },
    { role: 'Billing Bot', action: 'Collected $420 invoice via SMS payment link', target: 'David Sterling', timeAgo: '1h ago', color: 'text-amber-400 bg-amber-500/10' },
    { role: 'Receptionist', action: 'Answered emergency call and dispatched technician', target: 'Sarah Connor', timeAgo: '2h ago', color: 'text-rose-400 bg-rose-500/10' },
    { role: 'Receptionist', action: 'Answered call and classified intent', target: 'Aaron Alvarez', timeAgo: '3h ago', color: 'text-primary bg-primary/10' },
  ];

  return (
    <div className="space-y-6 pb-8">
      {/* ========================================================================= */}
      {/* 1. TOP BAR: Natural Language Ask Elijah + Location & Timeframe Filters   */}
      {/* ========================================================================= */}
      <div className="rounded-2xl bg-surface/90 border border-border p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Ask Elijah Search Input */}
        <div className="flex-1 w-full max-w-2xl relative">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-muted absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAskElijah()}
              placeholder="Ask Elijah or search... e.g. Who owes us more than $5,000?"
              className="w-full pl-10 pr-24 py-2.5 text-xs rounded-xl bg-background border border-border focus:outline-none focus:border-primary text-white placeholder:text-muted/60 transition-all shadow-inner"
            />
            <Button
              type="button"
              size="sm"
              onClick={() => handleAskElijah()}
              disabled={isSearching}
              className="absolute right-1.5 h-7 px-3 text-xs bg-primary hover:bg-primary-hover text-white rounded-lg gap-1.5 shadow-sm shadow-primary-glow/30"
            >
              {isSearching ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
              <span>Ask</span>
            </Button>
          </div>

          {/* Quick Query Pills */}
          <div className="flex items-center gap-1.5 mt-2 overflow-x-auto no-scrollbar text-[11px] text-muted">
            <span className="text-[10px] text-subtle shrink-0">Try asking:</span>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('Who owes us more than $5,000?');
                handleAskElijah('Who owes us more than $5,000?');
              }}
              className="px-2 py-0.5 rounded-md bg-surface-elevated hover:bg-primary/20 hover:text-white border border-border/60 text-slate-300 transition-colors whitespace-nowrap cursor-pointer"
            >
              💵 Who owes &gt; $5,000?
            </button>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('Show open emergencies');
                handleAskElijah('Show open emergencies');
              }}
              className="px-2 py-0.5 rounded-md bg-surface-elevated hover:bg-rose-500/20 hover:text-white border border-border/60 text-slate-300 transition-colors whitespace-nowrap cursor-pointer"
            >
              🚨 Open emergencies
            </button>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('Technician capacity today');
                handleAskElijah('Technician capacity today');
              }}
              className="px-2 py-0.5 rounded-md bg-surface-elevated hover:bg-emerald-500/20 hover:text-white border border-border/60 text-slate-300 transition-colors whitespace-nowrap cursor-pointer"
            >
              🛠️ Tech capacity today
            </button>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('AI booking conversion rate');
                handleAskElijah('AI booking conversion rate');
              }}
              className="px-2 py-0.5 rounded-md bg-surface-elevated hover:bg-blue-500/20 hover:text-white border border-border/60 text-slate-300 transition-colors whitespace-nowrap cursor-pointer"
            >
              📈 AI conversion rate
            </button>
          </div>
        </div>

        {/* Filters & Dropdowns */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
          {/* Location Selector */}
          <div className="relative">
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value as any)}
              className="appearance-none pl-3 pr-8 py-1.5 text-xs rounded-xl bg-background border border-border text-slate-200 focus:outline-none focus:border-primary cursor-pointer"
            >
              <option value="all">📍 All locations</option>
              <option value="central">Central Phoenix (85001-85099)</option>
              <option value="scottsdale">Scottsdale (85250-85268)</option>
              <option value="east_valley">Mesa / East Valley</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-muted absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Timeframe Selector */}
          <div className="flex items-center rounded-xl bg-background border border-border p-0.5 text-xs">
            {(['24h', '7d', '30d'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTimeframe(t)}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  timeframe === t
                    ? 'bg-primary text-white font-bold shadow-sm shadow-primary-glow/20'
                    : 'text-muted hover:text-white'
                }`}
              >
                {t === '24h' ? 'Last 24h' : t === '7d' ? '7 Days' : '30 Days'}
              </button>
            ))}
          </div>

          {/* Role Preview Switcher (For testing & demos) */}
          <div className="relative">
            <select
              value={activeRole}
              onChange={(e) => setActiveRole(e.target.value)}
              className="appearance-none pl-2.5 pr-7 py-1.5 text-[11px] font-semibold rounded-xl bg-primary/10 border border-primary/30 text-primary focus:outline-none cursor-pointer"
              title="Preview dashboard as different roles"
            >
              <option value="owner">Role: Business Owner</option>
              <option value="office_manager">Role: Office Manager</option>
              <option value="dispatcher">Role: Dispatcher</option>
              <option value="sales_estimator">Role: Sales & Estimator</option>
              <option value="technician">Role: Field Technician</option>
              <option value="finance">Role: Finance / AR</option>
            </select>
            <ChevronDown className="w-3 h-3 text-primary absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* AI Answer Card (Reveals when query is asked) */}
      {aiAnswer && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-primary/15 via-surface-elevated to-surface border border-primary/40 shadow-lg relative flex items-start justify-between gap-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-primary text-white flex items-center justify-center shrink-0 shadow-md shadow-primary-glow">
              <Bot className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white">Elijah AI Operations Insight</span>
                <span className="text-[10px] text-muted font-mono">Query: &quot;{aiAnswer.query}&quot;</span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed max-w-3xl">
                {aiAnswer.answer}
              </p>
              {aiAnswer.actionLabel && aiAnswer.actionHref && (
                <div className="pt-1.5">
                  <Link href={aiAnswer.actionHref}>
                    <Button variant="outline" size="sm" className="h-7 text-[11px] gap-1.5 text-primary border-primary/40 hover:bg-primary/10">
                      <span>{aiAnswer.actionLabel}</span>
                      <ArrowRight className="w-3 h-3" />
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setAiAnswer(null)}
            className="p-1 rounded-lg text-muted hover:text-white bg-surface border border-border"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Action Success Toast */}
      {actionSuccessToast && (
        <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-medium flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{actionSuccessToast}</span>
          </div>
          <button onClick={() => setActionSuccessToast(null)} className="text-emerald-400 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. HERO GREETING & CONTEXT BANNER                                         */}
      {/* ========================================================================= */}
      <div className="space-y-1.5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
              <span>Good morning, {user?.name?.split(' ')[0] || 'Partner'}</span>
              <span className="text-sm font-normal text-muted">({currentRoleData.roleTitle})</span>
            </h1>
            <p className="text-xs sm:text-sm text-muted mt-1 max-w-3xl">
              {currentRoleData.heroStatText}
            </p>
          </div>

          {/* Quick Shortcuts */}
          <div className="flex items-center gap-2">
            <Link href="/schedule">
              <Button variant="outline" size="sm" className="gap-2 text-xs h-8">
                <CalendarPlus className="w-3.5 h-3.5 text-primary" />
                <span>Schedule Board</span>
              </Button>
            </Link>
            <Link href="/inbox">
              <Button variant="primary" size="sm" className="gap-2 text-xs h-8 shadow-md shadow-primary-glow/20">
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Unified Inbox</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Scenario Banner */}
        <div className="px-4 py-2.5 rounded-xl bg-primary/10 border border-primary/20 text-xs text-slate-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-primary shrink-0" />
            <span>You&apos;re viewing operational triage for <strong>{user?.tenantName || 'Vanguard Electric & Power'}</strong>.</span>
          </div>
          <Link href="/schedule" className="text-primary hover:underline text-xs font-semibold flex items-center gap-1">
            <span>View calendar swimlanes</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. 6-METRIC OPERATIONAL KPI ROW                                           */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3.5">
        {currentRoleData.kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-surface/90 border border-border hover:border-border-hover transition-all flex flex-col justify-between shadow-sm"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-medium text-muted truncate">{kpi.label}</span>
                <div className={`p-1.5 rounded-lg border ${kpi.color}`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
              </div>

              <div>
                <div className="text-xl font-extrabold text-white tracking-tight">{kpi.value}</div>
                <div className="text-[10px] text-subtle mt-0.5 truncate">{kpi.sub}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* 4. MAIN 2-COLUMN SECTION: Needs You (7 Cols) + Operations & Feed (5 Cols)  */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Needs You Action Queue (7 Cols) */}
        <div className="lg:col-span-7 rounded-2xl bg-surface/90 border border-border p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                  <span>Needs you</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-mono">
                    {currentRoleData.tasks.filter((t) => !resolvedTaskIds.includes(t.id)).length} pending
                  </span>
                </h3>
                <p className="text-[11px] text-muted">
                  High-priority items requiring human authorization or triage
                </p>
              </div>
            </div>

            <Link href="/escalations" className="text-xs text-primary hover:underline font-medium">
              See all
            </Link>
          </div>

          {/* Actionable Tasks List */}
          <div className="space-y-2.5">
            {currentRoleData.tasks.map((task) => {
              const isResolved = resolvedTaskIds.includes(task.id);
              return (
                <div
                  key={task.id}
                  onClick={() => !isResolved && setActiveTask(task)}
                  className={`p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                    isResolved
                      ? 'bg-emerald-500/5 border-emerald-500/20 opacity-60'
                      : 'bg-surface-elevated/70 border-border hover:border-primary/40 hover:bg-surface-elevated cursor-pointer shadow-sm'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Action Pill Badge */}
                    {isResolved ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 shrink-0">
                        <Check className="w-3 h-3" />
                        <span>Done</span>
                      </span>
                    ) : task.type === 'fix' ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/40 shrink-0">
                        Fix
                      </span>
                    ) : task.type === 'approve' ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-primary/20 text-primary border border-primary/40 shrink-0">
                        Approve
                      </span>
                    ) : task.type === 'dispatch' ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shrink-0">
                        Dispatch
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/40 shrink-0">
                        Review
                      </span>
                    )}

                    {/* Title & Context */}
                    <div className="min-w-0">
                      <p className={`text-xs font-semibold truncate ${isResolved ? 'line-through text-muted' : 'text-slate-100'}`}>
                        {task.title}
                      </p>
                      <p className="text-[11px] text-muted truncate mt-0.5">{task.context}</p>
                    </div>
                  </div>

                  {/* Due Time Badge */}
                  <span
                    className={`text-[10px] font-medium shrink-0 px-2 py-0.5 rounded ${
                      isResolved
                        ? 'text-emerald-400 bg-emerald-500/10'
                        : task.isPastDue
                        ? 'text-rose-400 bg-rose-500/10 border border-rose-500/20 font-bold'
                        : 'text-subtle bg-surface border border-border'
                    }`}
                  >
                    {isResolved ? 'Resolved' : task.dueText}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: Integrations & Live Feed (5 Cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Top Card: Is Anything Broken? (System Health & Integrations) */}
          <div className="rounded-2xl bg-surface/90 border border-border p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted">
                Is anything broken?
              </h3>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>

            <div className="space-y-2 text-xs">
              {/* QuickBooks Status */}
              <div className="p-2.5 rounded-xl bg-surface-elevated/60 border border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${qbConnected ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                  <span className="text-slate-200">QuickBooks Online (Demo)</span>
                </div>
                {qbConnected ? (
                  <span className="text-[10px] text-emerald-400 font-semibold">Connected</span>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setQbConnected(true);
                      setActionSuccessToast('QuickBooks Online reconnected successfully.');
                      setTimeout(() => setActionSuccessToast(null), 3000);
                    }}
                    className="text-[10px] text-primary hover:underline font-bold"
                  >
                    Reconnect now
                  </button>
                )}
              </div>

              {/* Retell Carrier Telephony */}
              <div className="p-2.5 rounded-xl bg-surface-elevated/60 border border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="text-slate-200">Retell AI Telephony &amp; WebRTC</span>
                </div>
                <span className="text-[10px] text-emerald-400 font-mono">ONLINE · 99.9%</span>
              </div>

              {/* Critical Exceptions Link */}
              <div className="p-2.5 rounded-xl bg-surface-elevated/60 border border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <span className="text-slate-200">Active human triage queue</span>
                </div>
                <Link href="/escalations" className="text-[10px] text-primary hover:underline font-bold flex items-center gap-1">
                  <span>1 critical open</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>

          {/* Bottom Card: What Elijah Just Did (Autonomous Activity Stream) */}
          <div className="rounded-2xl bg-surface/90 border border-border p-5 shadow-sm space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-bold text-white tracking-tight">What Elijah just did</h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-surface-elevated text-slate-300 border border-border">
                AUTONOMOUS FEED
              </span>
            </div>

            <div className="space-y-2.5">
              {autonomousActions.map((item, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-surface-elevated/40 border border-border/60 text-xs flex items-start justify-between gap-3">
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${item.color}`}>
                        {item.role}
                      </span>
                      <span className="text-slate-200 font-medium truncate">{item.action}</span>
                    </div>
                    <p className="text-[11px] text-muted">
                      Customer / Target: <strong className="text-slate-300">{item.target}</strong>
                    </p>
                  </div>
                  <span className="text-[10px] text-subtle font-mono shrink-0">{item.timeAgo}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. INTERACTIVE ACTION MODAL (FOR [FIX] AND [APPROVE] ACTIONS)              */}
      {/* ========================================================================= */}
      {activeTask && (
        <Modal
          isOpen={Boolean(activeTask)}
          onClose={() => setActiveTask(null)}
          title={activeTask.type === 'approve' ? 'Authorize Proposal / Action' : 'Resolve Operational Exception'}
          description="Elijah AI Autonomous Human-in-the-Loop Safeguard"
          maxWidth="lg"
        >
          <div className="space-y-4 pt-1">
            <div className="p-3.5 rounded-xl bg-background border border-border space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">{activeTask.title}</span>
                <span className="text-[10px] text-amber-400 font-mono px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                  {activeTask.dueText}
                </span>
              </div>
              <p className="text-xs text-slate-300">{activeTask.context}</p>
            </div>

            {activeTask.actionPayload && (
              <div className="p-3.5 rounded-xl bg-primary/10 border border-primary/20 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-primary font-bold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI Recommendation</span>
                </div>
                <p className="text-slate-200 leading-relaxed">
                  {activeTask.actionPayload.recommendation}
                </p>
                {activeTask.actionPayload.amount && (
                  <div className="pt-1 flex items-center gap-2">
                    <span className="text-muted">Total Proposal Value:</span>
                    <span className="text-base font-extrabold text-emerald-400">{activeTask.actionPayload.amount}</span>
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setActiveTask(null)}
              >
                Dismiss
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                isLoading={isActionSubmitting}
                onClick={() => handleResolveTask(activeTask)}
                className="gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{activeTask.type === 'approve' ? 'Authorize & Send' : 'Mark Resolved'}</span>
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
