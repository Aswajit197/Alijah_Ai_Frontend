'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Target,
  Search,
  Filter,
  Plus,
  ArrowRight,
  PhoneCall,
  Globe,
  MessageSquare,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Clock,
  MapPin,
  ExternalLink,
  Flame,
  ChevronDown,
  ChevronRight,
  User,
  Zap,
  Building2,
  Calendar,
  Send,
  X,
  FileText,
  BadgeAlert,
  ArrowUpRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Modal } from '@/components/ui/modal';
import { apiRequest } from '@/lib/api';

export type LeadStatus =
  | 'New'
  | 'Qualified'
  | 'Booked'
  | 'Converted'
  | 'Unbooked'
  | 'Follow-up'
  | 'Lost';

export type UrgencyType = 'Emergency' | 'Same day' | 'This week' | 'Flexible';

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email?: string;
  dateStr: string;
  service: string;
  trade: 'HVAC' | 'Plumbing' | 'Electrical';
  source: 'Missed call' | 'Website' | 'Google LSA' | 'Google Search' | 'Equipment QR' | 'Referral';
  urgency: UrgencyType;
  type: 'Residential' | 'Commercial';
  serviceArea: string;
  isValidArea: boolean;
  status: LeadStatus;
  statusSubtext?: string;
  qualificationNote: string;
  timelineSnippet?: string[];
  serviceAddress?: string;
  estimatedValue?: string;
}


export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load live leads from backend
  const loadLeads = async () => {
    setIsLoading(true);
    try {
      const [jobsData, callsData] = await Promise.all([
        apiRequest<any[]>('/jobs').catch(() => []),
        apiRequest<any[]>('/jobs/voice-calls').catch(() => []),
      ]);

      const mappedLeads: Lead[] = [];

      // 1. Map real jobs into Leads
      if (Array.isArray(jobsData)) {
        for (const job of jobsData) {
          mappedLeads.push({
            id: job.id,
            name: job.customer?.name || 'Customer',
            phone: job.customer?.phone || 'Unknown',
            email: job.customer?.email,
            dateStr: new Date(job.createdAt || job.scheduledDate || Date.now()).toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            }),
            service: job.title || job.reportedIssue || 'Electrical Service Visit',
            trade: 'Electrical',
            source: 'Website',
            urgency: job.priority === 'EMERGENCY' ? 'Emergency' : job.priority === 'HIGH' ? 'Same day' : 'Flexible',
            type: job.customer?.customerType === 'COMMERCIAL' ? 'Commercial' : 'Residential',
            serviceArea: job.customer?.city ? `Valid (${job.customer.city})` : 'Valid (Phoenix)',
            isValidArea: true,
            status:
              job.status === 'COMPLETED'
                ? 'Converted'
                : job.status === 'SCHEDULED' || job.status === 'DISPATCHED'
                ? 'Booked'
                : 'Qualified',
            qualificationNote: `Job ${job.jobNumber || ''}: ${job.reportedIssue || 'Service visit scheduled'}.`,
            timelineSnippet: [
              `Created: ${new Date(job.createdAt || Date.now()).toLocaleTimeString()}`,
              `Assigned to: ${job.technician?.name || 'Unassigned'}`,
              `Status: ${job.status}`,
            ],
            serviceAddress: job.serviceAddress || job.customer?.address,
            estimatedValue: job.totalAmount ? `$${job.totalAmount}` : '$129 - $350',
          });
        }
      }

      // 2. Map voice calls that did not result in a booked job (unbooked/inquiry leads)
      if (Array.isArray(callsData)) {
        for (const call of callsData) {
          if (call.status === 'ended' && call.summary) {
            // If the call successfully booked a job or mentions a JOB- number, it is already represented in jobsData above!
            const hasJob = call.summary.match(/JOB-\d+/i) || call.isSuccessful;
            if (hasJob) {
              continue; // Skip already booked calls to prevent duplicate leads
            }

            const alreadyInLeads = mappedLeads.some(
              (l) => l.id === call.id || (call.fromNumber && l.phone === call.fromNumber)
            );

            if (!alreadyInLeads) {
              const durationMin = Math.max(1, Math.round(call.durationMs / 60000));
              const callerMatch =
                call.summary.match(/(?:Caller|The caller|Customer)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i) ||
                call.summary.match(/under\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i);
              const extractedCallerName = callerMatch ? callerMatch[1] : (call.fromNumber ? `Caller (${call.fromNumber})` : 'Inbound Caller');
              const phoneMatch = call.summary.match(/(\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
              const extractedPhone = call.fromNumber || (phoneMatch ? phoneMatch[0] : 'Web Call');

              mappedLeads.push({
                id: call.id,
                name: extractedCallerName,
                phone: extractedPhone,
                dateStr: new Date(call.createdAt).toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                }),
                service: 'Inbound Inquiry (No Booking)',
                trade: 'Electrical',
                source: 'Missed call',
                urgency: 'Flexible',
                type: 'Residential',
                serviceArea: 'Valid (Phoenix)',
                isValidArea: true,
                status: 'Qualified',
                qualificationNote: call.summary,
                timelineSnippet: [
                  `AI Call Duration: ${durationMin}m`,
                  `Status: General Inquiry`,
                  `Sentiment: ${call.userSentiment || 'Neutral'}`,
                ],
                estimatedValue: '$129 - $350',
              });
            }
          }
        }
      }

      setLeads(mappedLeads);
    } catch (err) {
      console.error('Failed to load live leads:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLeads();
  }, []);
  const [activeTab, setActiveTab] = useState<'All' | LeadStatus>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [tradeFilter, setTradeFilter] = useState<'ALL' | 'HVAC' | 'Plumbing' | 'Electrical'>('ALL');
  const [sourceFilter, setSourceFilter] = useState<string>('ALL');
  
  // Selected lead for Timeline Drawer/Modal
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  // Quick Book & Dispatch Modal State
  const [bookingLead, setBookingLead] = useState<Lead | null>(null);
  const [bookingTech, setBookingTech] = useState('Aswajit Mohapatra (Senior Field Tech)');
  const [bookingDate, setBookingDate] = useState('2026-11-18');
  const [bookingWindow, setBookingWindow] = useState('Afternoon (12:00 PM – 4:00 PM)');
  const [bookingPriority, setBookingPriority] = useState<'EMERGENCY' | 'HIGH' | 'NORMAL'>('NORMAL');
  const [bookingNotes, setBookingNotes] = useState('');
  const [sendSmsTracking, setSendSmsTracking] = useState(true);
  const [successBookingToast, setSuccessBookingToast] = useState<{
    jobId: string;
    customerName: string;
    tech: string;
    window: string;
  } | null>(null);

  // New Lead Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newLeadForm, setNewLeadForm] = useState({
    name: '',
    phone: '',
    service: '',
    trade: 'HVAC' as 'HVAC' | 'Plumbing' | 'Electrical',
    source: 'Missed call' as Lead['source'],
    urgency: 'Same day' as UrgencyType,
    serviceArea: 'Valid (Henderson)',
    address: '',
  });

  // Calculate dynamic counts for each stage
  const counts = {
    All: leads.length,
    New: leads.filter((l) => l.status === 'New').length,
    Qualified: leads.filter((l) => l.status === 'Qualified').length,
    Booked: leads.filter((l) => l.status === 'Booked').length,
    Converted: leads.filter((l) => l.status === 'Converted').length,
    Unbooked: leads.filter((l) => l.status === 'Unbooked').length,
    'Follow-up': leads.filter((l) => l.status === 'Follow-up').length,
    Lost: leads.filter((l) => l.status === 'Lost').length,
  };

  // Filtered leads
  const filteredLeads = leads.filter((l) => {
    if (activeTab !== 'All' && l.status !== activeTab) return false;
    if (tradeFilter !== 'ALL' && l.trade !== tradeFilter) return false;
    if (sourceFilter !== 'ALL' && l.source !== sourceFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = l.name.toLowerCase().includes(q);
      const matchPhone = l.phone.toLowerCase().includes(q);
      const matchService = l.service.toLowerCase().includes(q);
      const matchArea = l.serviceArea.toLowerCase().includes(q);
      if (!matchName && !matchPhone && !matchService && !matchArea) return false;
    }
    return true;
  });

  // Update lead status in place
  const handleStatusChange = (leadId: string, newStatus: LeadStatus) => {
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l))
    );
  };

  // Open the Quick Booking Modal pre-filled with this lead's info
  const handleOpenBookingModal = (lead: Lead) => {
    setBookingLead(lead);
    setBookingPriority(lead.urgency === 'Emergency' ? 'EMERGENCY' : 'NORMAL');
    setBookingNotes(`Issue reported: ${lead.service}. ${lead.qualificationNote}`);
    // Select matching technician based on trade
    if (lead.trade === 'Plumbing') {
      setBookingTech('Mike Rodriguez (Master Plumber & Electrician)');
    } else if (lead.trade === 'Electrical') {
      setBookingTech('Mike Rodriguez (Master Plumber & Electrician)');
    } else {
      setBookingTech('Aswajit Mohapatra (Senior Field Tech)');
    }
  };

  // Confirm Booking and convert to Work Order
  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingLead) return;

    const jobNumber = `JOB-${Math.floor(1000 + Math.random() * 9000)}`;

    setLeads((prev) =>
      prev.map((l) => {
        if (l.id === bookingLead.id) {
          const updatedTimeline = [
            `Today: Booked into schedule (${jobNumber}) for ${bookingDate} (${bookingWindow}). Dispatched to ${bookingTech}.`,
            ...(l.timelineSnippet || []),
          ];
          return {
            ...l,
            status: 'Booked' as LeadStatus,
            statusSubtext: `Dispatched to ${bookingTech.split(' ')[0]} (${jobNumber})`,
            timelineSnippet: updatedTimeline,
          };
        }
        return l;
      })
    );

    setSuccessBookingToast({
      jobId: jobNumber,
      customerName: bookingLead.name,
      tech: bookingTech.split(' ')[0],
      window: bookingWindow,
    });

    setBookingLead(null);
  };

  const handleCreateLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeadForm.name || !newLeadForm.phone) return;

    const newLead: Lead = {
      id: `lead-${Date.now()}`,
      name: newLeadForm.name,
      phone: newLeadForm.phone,
      dateStr: 'Just now',
      service: newLeadForm.service || 'Diagnostic Inspection',
      trade: newLeadForm.trade,
      source: newLeadForm.source,
      urgency: newLeadForm.urgency,
      type: 'Residential',
      serviceArea: newLeadForm.serviceArea,
      isValidArea: !newLeadForm.serviceArea.toLowerCase().includes('outside'),
      status: 'New',
      qualificationNote: 'Manual lead intake logged by office dispatcher.',
      timelineSnippet: ['Just now: Logged into pipeline by office staff.'],
      serviceAddress: newLeadForm.address,
    };

    setLeads([newLead, ...leads]);
    setIsAddModalOpen(false);
    setNewLeadForm({
      name: '',
      phone: '',
      service: '',
      trade: 'HVAC',
      source: 'Missed call',
      urgency: 'Same day',
      serviceArea: 'Valid (Henderson)',
      address: '',
    });
  };

  return (
    <div className="space-y-5">
      {/* 1. Header & Stage Breadcrumb Lifecycle */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-1">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Target className="w-6 h-6 text-primary" />
            <span>Leads & Opportunity Pipeline</span>
          </h1>
          <p className="text-xs text-muted mt-1 font-mono flex items-center gap-1.5 flex-wrap">
            <span className="text-white font-semibold">New</span>
            <span>→</span>
            <span className="text-primary font-semibold">Qualified</span>
            <span>→</span>
            <span className="text-emerald-400 font-semibold">Booked</span>
            <span>→</span>
            <span className="text-sky-400 font-semibold">Converted</span>
            <span className="text-muted/60 mx-1">|</span>
            <span className="text-slate-400">or Unbooked</span>
            <span>→</span>
            <span className="text-amber-400">Follow-up</span>
            <span>→</span>
            <span className="text-red-400">Lost</span>
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsAddModalOpen(true)}
            className="gap-2 text-xs shadow-lg shadow-primary-glow/20"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Add Manual Lead</span>
          </Button>
          <Link href="/schedule">
            <Button variant="outline" size="sm" className="gap-2 text-xs border-border bg-surface text-slate-200">
              <Calendar className="w-3.5 h-3.5" />
              <span>Schedule Board</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Success Booking Banner */}
      {successBookingToast && (
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-surface-elevated to-surface border border-emerald-500/30 flex items-center justify-between gap-4 shadow-xl animate-in fade-in duration-300">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white flex items-center gap-2">
                <span>Work Order {successBookingToast.jobId} Booked!</span>
                <Badge variant="success">Confirmed & Dispatched</Badge>
              </h4>
              <p className="text-[11px] text-slate-300 mt-0.5">
                {successBookingToast.customerName} has been booked for <strong>{successBookingToast.window}</strong> and dispatched to <strong>{successBookingToast.tech}</strong>. Automated SMS with live tracking link delivered.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link href="/schedule">
              <Button variant="primary" size="sm" className="gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-500 text-white">
                <Calendar className="w-3.5 h-3.5" />
                <span>View on Schedule →</span>
              </Button>
            </Link>
            <button
              onClick={() => setSuccessBookingToast(null)}
              className="text-xs text-muted hover:text-white p-1 rounded hover:bg-surface"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 2. Top Stage Tabs (With Exact Counts from Screenshot) */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 border-b border-border/70 text-sm">
        {(
          [
            'All',
            'New',
            'Qualified',
            'Booked',
            'Converted',
            'Unbooked',
            'Follow-up',
            'Lost',
          ] as const
        ).map((tab) => {
          const isActive = activeTab === tab;
          const count = counts[tab];

          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap flex items-center gap-2 ${
                isActive
                  ? 'bg-primary text-white shadow-md shadow-primary-glow/20 font-bold'
                  : 'bg-surface/80 text-slate-300 border border-border hover:text-white hover:bg-surface-elevated'
              }`}
            >
              <span>{tab}</span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                  isActive
                    ? 'bg-white/20 text-white'
                    : 'bg-background text-slate-300 border border-border/60'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 3. Search & Multi-Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-surface/80 p-3.5 rounded-2xl border border-border">
        {/* Search */}
        <div className="relative w-full sm:w-88">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search lead name, phone, service, city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 text-sm rounded-xl bg-background border border-border focus:outline-none focus:border-primary text-white placeholder:text-slate-400"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto overflow-x-auto">
          {/* Trade Filter */}
          <select
            value={tradeFilter}
            onChange={(e) => setTradeFilter(e.target.value as any)}
            className="px-3 py-2 text-xs font-semibold rounded-xl bg-background border border-border text-slate-200 focus:outline-none focus:border-primary cursor-pointer"
          >
            <option value="ALL">All Trades</option>
            <option value="HVAC">HVAC</option>
            <option value="Plumbing">Plumbing</option>
            <option value="Electrical">Electrical</option>
          </select>

          {/* Source Filter */}
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="px-3 py-2 text-xs font-semibold rounded-xl bg-background border border-border text-slate-200 focus:outline-none focus:border-primary cursor-pointer"
          >
            <option value="ALL">All Sources</option>
            <option value="Missed call">Missed call</option>
            <option value="Website">Website</option>
            <option value="Google LSA">Google LSA</option>
            <option value="Google Search">Google Search</option>
            <option value="Equipment QR">Equipment QR</option>
          </select>

          <span className="text-xs text-slate-400 shrink-0 font-medium">
            Showing <strong className="text-white font-bold">{filteredLeads.length}</strong> leads
          </span>
        </div>
      </div>

      {/* 4. Main Leads Table */}
      <div className="rounded-2xl bg-surface border border-border overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse table-auto">
            <thead>
              <tr className="border-b border-border bg-surface-elevated/90 text-xs font-bold text-slate-200 uppercase tracking-wider">
                <th className="py-3 px-3">Lead & Type</th>
                <th className="py-3 px-3">Service</th>
                <th className="py-3 px-2.5">Source</th>
                <th className="py-3 px-2.5">Urgency</th>
                <th className="py-3 px-2.5">Service Area</th>
                <th className="py-3 px-2.5">Status</th>
                <th className="py-3 px-3">Elijah's Qualification</th>
                <th className="py-3 px-2.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 space-y-2">
                    <Target className="w-8 h-8 mx-auto opacity-40 text-primary" />
                    <p className="text-sm">No leads found matching current filter.</p>
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => {
                  return (
                    <tr
                      key={lead.id}
                      className="hover:bg-surface-elevated/60 transition-colors group"
                    >
                      {/* 1. Lead Name, Date & Type */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <button
                          onClick={() => setSelectedLead(lead)}
                          className="font-bold text-sm text-sky-400 hover:text-sky-300 hover:underline flex items-center gap-1.5 text-left"
                        >
                          <span>{lead.name}</span>
                        </button>
                        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono mt-0.5">
                          <span>{lead.dateStr}</span>
                          <span>•</span>
                          <span className={lead.type === 'Commercial' ? 'text-amber-400 font-semibold' : 'text-slate-400'}>
                            {lead.type}
                          </span>
                        </div>
                      </td>

                      {/* 2. Service & Trade */}
                      <td className="py-3 px-3 max-w-[200px]">
                        <p className="text-sm font-semibold text-white truncate">{lead.service}</p>
                        <span className="text-xs text-slate-300 font-mono font-medium">{lead.trade}</span>
                      </td>

                      {/* 3. Source */}
                      <td className="py-3 px-2.5 whitespace-nowrap">
                        {lead.source === 'Missed call' && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                            Missed call
                          </span>
                        )}
                        {lead.source === 'Website' && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-sky-500/15 text-sky-300 border border-sky-500/30">
                            Website
                          </span>
                        )}
                        {lead.source === 'Google LSA' && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                            Google LSA
                          </span>
                        )}
                        {lead.source === 'Google Search' && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-500/15 text-purple-300 border border-purple-500/30">
                            Google Search
                          </span>
                        )}
                        {lead.source === 'Equipment QR' && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                            Equipment QR
                          </span>
                        )}
                        {lead.source === 'Referral' && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-700 text-slate-200">
                            Referral
                          </span>
                        )}
                      </td>

                      {/* 4. Urgency */}
                      <td className="py-3 px-2.5 whitespace-nowrap">
                        {lead.urgency === 'Emergency' && (
                          <span className="px-2 py-0.5 rounded text-xs font-bold bg-red-500/20 text-red-300 border border-red-500/40 flex items-center gap-1 w-max">
                            <Flame className="w-3 h-3 text-red-400" />
                            Emergency
                          </span>
                        )}
                        {lead.urgency === 'Same day' && (
                          <span className="px-2 py-0.5 rounded text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                            Same day
                          </span>
                        )}
                        {lead.urgency === 'This week' && (
                          <span className="px-2 py-0.5 rounded text-xs font-semibold bg-blue-500/15 text-blue-300 border border-blue-500/30">
                            This week
                          </span>
                        )}
                        {lead.urgency === 'Flexible' && (
                          <span className="px-2 py-0.5 rounded text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
                            Flexible
                          </span>
                        )}
                      </td>

                      {/* 5. Service Area */}
                      <td className="py-3 px-2.5 whitespace-nowrap">
                        {lead.isValidArea ? (
                          <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                            <span>{lead.serviceArea}</span>
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-xs font-bold bg-red-500/20 text-red-300 border border-red-500/40">
                            {lead.serviceArea}
                          </span>
                        )}
                      </td>

                      {/* 6. Status Dropdown */}
                      <td className="py-3 px-2.5 whitespace-nowrap">
                        <select
                          value={lead.status}
                          onChange={(e) => handleStatusChange(lead.id, e.target.value as LeadStatus)}
                          className={`text-xs font-bold px-2 py-1.5 rounded-lg border focus:outline-none transition-colors cursor-pointer ${
                            lead.status === 'Booked'
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                              : lead.status === 'Qualified'
                              ? 'bg-primary/25 text-indigo-200 border-primary/40'
                              : lead.status === 'Converted'
                              ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                              : lead.status === 'Lost'
                              ? 'bg-red-500/20 text-red-300 border-red-500/40'
                              : lead.status === 'Follow-up'
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                              : 'bg-background text-slate-200 border-border'
                          }`}
                        >
                          <option value="New">New</option>
                          <option value="Qualified">Qualified</option>
                          <option value="Booked">Booked</option>
                          <option value="Converted">Converted</option>
                          <option value="Unbooked">Unbooked</option>
                          <option value="Follow-up">Follow-up</option>
                          <option value="Lost">Lost</option>
                        </select>
                      </td>

                      {/* 7. Elijah's Qualification */}
                      <td className="py-3 px-3 max-w-sm">
                        <p className="text-slate-200 leading-relaxed text-xs line-clamp-2">
                          {lead.qualificationNote}
                        </p>
                        <button
                          onClick={() => setSelectedLead(lead)}
                          className="mt-1 text-[11px] font-bold text-sky-400 hover:text-sky-300 flex items-center gap-1 hover:underline"
                        >
                          <span>▶ Timeline</span>
                        </button>
                      </td>

                      {/* 8. Action */}
                      <td className="py-3 px-2.5 text-right whitespace-nowrap">
                        {lead.status === 'Qualified' || lead.status === 'New' ? (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleOpenBookingModal(lead)}
                            className="text-xs h-7 px-3 font-bold shadow-md shadow-primary-glow/20 bg-primary hover:bg-primary-hover text-white"
                          >
                            Book
                          </Button>
                        ) : lead.status === 'Follow-up' ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => alert(`Triggered AI follow-up SMS sequence to ${lead.name} (${lead.phone})!`)}
                            className="text-xs h-7 px-2.5 border-amber-500/40 text-amber-300 hover:bg-amber-500/20 font-semibold"
                          >
                            Follow-up
                          </Button>
                        ) : (
                          <button
                            onClick={() => setSelectedLead(lead)}
                            className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-surface-elevated"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Lead Dossier & AI Timeline Modal */}
      {selectedLead && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedLead(null)}
          title={`Lead: ${selectedLead.name}`}
          maxWidth="2xl"
        >
          <div className="space-y-4">
            {/* Top Snapshot */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-xl bg-surface border border-border text-xs">
              <div>
                <span className="text-[10px] text-muted uppercase">Phone</span>
                <p className="font-mono font-bold text-white mt-0.5">{selectedLead.phone}</p>
              </div>
              <div>
                <span className="text-[10px] text-muted uppercase">Service / Trade</span>
                <p className="font-bold text-white mt-0.5">{selectedLead.trade}</p>
              </div>
              <div>
                <span className="text-[10px] text-muted uppercase">Urgency</span>
                <p className="font-bold text-amber-400 mt-0.5">{selectedLead.urgency}</p>
              </div>
              <div>
                <span className="text-[10px] text-muted uppercase">Est. Deal Value</span>
                <p className="font-mono font-bold text-emerald-400 mt-0.5">
                  {selectedLead.estimatedValue || '$300 - $800'}
                </p>
              </div>
            </div>

            {/* Address */}
            {selectedLead.serviceAddress && (
              <div className="p-3 rounded-xl bg-surface border border-border flex items-start gap-2 text-xs">
                <MapPin className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] text-muted uppercase">Service Address</span>
                  <p className="text-white font-medium">{selectedLead.serviceAddress}</p>
                </div>
              </div>
            )}

            {/* AI Autonomous Qualification Card */}
            <div className="p-3.5 rounded-xl bg-primary/10 border border-primary/25 space-y-1.5">
              <span className="text-[10px] font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Elijah AI Qualification Analysis</span>
              </span>
              <p className="text-xs text-slate-200 leading-relaxed font-medium">
                {selectedLead.qualificationNote}
              </p>
            </div>

            {/* Interactive Timeline Snippet */}
            {selectedLead.timelineSnippet && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-muted uppercase tracking-wider">
                  Intake & Qualification Timeline
                </h4>
                <div className="p-3 rounded-xl bg-background border border-border space-y-2 text-xs">
                  {selectedLead.timelineSnippet.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                      <span className="text-slate-300 font-mono text-[11px] leading-relaxed">
                        {step}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bottom Actions */}
            <div className="flex items-center justify-between gap-3 pt-3 border-t border-border">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted">Status:</span>
                <Badge variant="primary">{selectedLead.status}</Badge>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    const l = selectedLead;
                    setSelectedLead(null);
                    handleOpenBookingModal(l);
                  }}
                  className="gap-1.5 text-xs font-bold"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Book on Schedule</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    alert(`Automated SMS cadence sent to ${selectedLead.name}!`);
                    setSelectedLead(null);
                  }}
                  className="gap-1.5 text-xs text-amber-400 border-amber-500/30 hover:bg-amber-500/10"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Follow-Up</span>
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* 6. Add Manual Lead Modal */}
      {isAddModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsAddModalOpen(false)}
          title="Add New Lead & Opportunity"
          maxWidth="md"
        >
          <form onSubmit={handleCreateLead} className="space-y-3.5 text-xs">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Customer / Business Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. John Doe or Summit Dental"
                value={newLeadForm.name}
                onChange={(e) => setNewLeadForm({ ...newLeadForm, name: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-background border border-border text-white text-xs focus:outline-none focus:border-primary"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Phone Number *
                </label>
                <input
                  type="text"
                  required
                  placeholder="+1 (702) 555-0100"
                  value={newLeadForm.phone}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-background border border-border text-white text-xs focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Trade Specialty
                </label>
                <select
                  value={newLeadForm.trade}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, trade: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-xl bg-background border border-border text-white text-xs focus:outline-none focus:border-primary"
                >
                  <option value="HVAC">HVAC</option>
                  <option value="Plumbing">Plumbing</option>
                  <option value="Electrical">Electrical</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Service Requested / Symptom
              </label>
              <input
                type="text"
                placeholder="e.g. AC compressor humming, water heater leaking"
                value={newLeadForm.service}
                onChange={(e) => setNewLeadForm({ ...newLeadForm, service: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-background border border-border text-white text-xs focus:outline-none focus:border-primary"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Source
                </label>
                <select
                  value={newLeadForm.source}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, source: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-xl bg-background border border-border text-white text-xs focus:outline-none focus:border-primary"
                >
                  <option value="Missed call">Missed call</option>
                  <option value="Website">Website</option>
                  <option value="Google LSA">Google LSA</option>
                  <option value="Google Search">Google Search</option>
                  <option value="Equipment QR">Equipment QR</option>
                  <option value="Referral">Referral</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Urgency
                </label>
                <select
                  value={newLeadForm.urgency}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, urgency: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-xl bg-background border border-border text-white text-xs focus:outline-none focus:border-primary"
                >
                  <option value="Emergency">Emergency</option>
                  <option value="Same day">Same day</option>
                  <option value="This week">This week</option>
                  <option value="Flexible">Flexible</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Service Address (Optional)
              </label>
              <input
                type="text"
                placeholder="Street address, City, State"
                value={newLeadForm.address}
                onChange={(e) => setNewLeadForm({ ...newLeadForm, address: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-background border border-border text-white text-xs focus:outline-none focus:border-primary"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsAddModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Create Lead
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* 7. Quick Book & Dispatch Work Order Modal */}
      {bookingLead && (
        <Modal
          isOpen={true}
          onClose={() => setBookingLead(null)}
          title={`Quick Book & Dispatch Work Order`}
          maxWidth="2xl"
        >
          <form onSubmit={handleConfirmBooking} className="space-y-4 text-xs">
            {/* Top Work Order Overview Card */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-primary/10 via-surface-elevated to-surface border border-primary/25 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-white">{bookingLead.name}</span>
                  <Badge variant="accent">{bookingLead.trade}</Badge>
                </div>
                <div className="flex items-center gap-1.5 font-mono text-[11px] text-muted">
                  <PhoneCall className="w-3 h-3 text-emerald-400" />
                  <span>{bookingLead.phone}</span>
                </div>
              </div>

              <div className="text-slate-300">
                <span className="text-muted mr-1">Service Requested:</span>
                <strong className="text-white">{bookingLead.service}</strong>
              </div>

              {bookingLead.serviceAddress && (
                <div className="flex items-center gap-1.5 text-slate-300 text-[11px]">
                  <MapPin className="w-3.5 h-3.5 text-red-400 shrink-0" />
                  <span>{bookingLead.serviceAddress}</span>
                </div>
              )}
            </div>

            {/* Technician Lane Assignment */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-200 uppercase tracking-wider">
                Select Field Technician *
              </label>
              <select
                value={bookingTech}
                onChange={(e) => setBookingTech(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-background border border-border text-white text-xs focus:outline-none focus:border-primary font-medium"
              >
                <option value="Aswajit Mohapatra (Senior Field Tech)">
                  Aswajit Mohapatra — Senior Field Technician (HVAC / Electrical Certified)
                </option>
                <option value="Mike Rodriguez (Master Plumber & Electrician)">
                  Mike Rodriguez — Master Plumber & Electrician
                </option>
                <option value="Robert Martinez (Lead HVAC Diagnostic Tech)">
                  Robert Martinez — Lead HVAC Diagnostic Technician
                </option>
              </select>
            </div>

            {/* Date & Arrival Window Presets */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-200 uppercase tracking-wider mb-1">
                  Scheduled Date *
                </label>
                <input
                  type="date"
                  required
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-background border border-border text-white text-xs focus:outline-none focus:border-primary"
                />
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="block text-[11px] font-bold text-slate-200 uppercase tracking-wider">
                  Arrival Window Presets
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    'Morning (8:00 AM – 12:00 PM)',
                    'Afternoon (12:00 PM – 4:00 PM)',
                    'Evening (4:00 PM – 8:00 PM)',
                    '⚡ ASAP Emergency (Next 90 mins)',
                  ].map((win) => (
                    <button
                      type="button"
                      key={win}
                      onClick={() => setBookingWindow(win)}
                      className={`px-2 py-1.5 text-[11px] rounded-lg border text-left transition-all truncate ${
                        bookingWindow === win
                          ? 'bg-primary/20 text-primary border-primary font-bold shadow-sm'
                          : 'bg-surface-elevated text-muted border-border hover:text-white'
                      }`}
                    >
                      {win}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Priority Toggle */}
            <div>
              <label className="block text-[11px] font-bold text-slate-200 uppercase tracking-wider mb-1">
                Job Priority
              </label>
              <div className="flex items-center gap-2">
                {(['NORMAL', 'HIGH', 'EMERGENCY'] as const).map((p) => (
                  <button
                    type="button"
                    key={p}
                    onClick={() => setBookingPriority(p)}
                    className={`px-3 py-1 rounded-xl text-xs font-semibold border transition-all ${
                      bookingPriority === p
                        ? p === 'EMERGENCY'
                          ? 'bg-red-500/20 text-red-400 border-red-500 shadow-sm'
                          : p === 'HIGH'
                          ? 'bg-amber-500/20 text-amber-400 border-amber-500 shadow-sm'
                          : 'bg-primary/20 text-primary border-primary shadow-sm'
                        : 'bg-surface-elevated text-muted border-border hover:text-white'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Special Instructions */}
            <div>
              <label className="block text-[11px] font-bold text-slate-200 uppercase tracking-wider mb-1">
                Field Technician Instructions & Diagnostics
              </label>
              <textarea
                rows={2}
                value={bookingNotes}
                onChange={(e) => setBookingNotes(e.target.value)}
                placeholder="Diagnostic symptoms, gate codes, or access details..."
                className="w-full px-3 py-2 rounded-xl bg-background border border-border text-white text-xs focus:outline-none focus:border-primary placeholder:text-muted/60 leading-relaxed"
              />
            </div>

            {/* SMS Notification Toggle */}
            <div className="p-3 rounded-xl bg-surface-elevated border border-border flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <input
                  type="checkbox"
                  id="smsTracking"
                  checked={sendSmsTracking}
                  onChange={(e) => setSendSmsTracking(e.target.checked)}
                  className="w-4 h-4 rounded text-primary focus:ring-0 bg-background border-border cursor-pointer"
                />
                <label htmlFor="smsTracking" className="cursor-pointer">
                  <span className="font-semibold text-white text-xs block">
                    📲 Send SMS confirmation with live tracking link
                  </span>
                  <span className="text-[10px] text-muted block">
                    Sends customer an automated SMS with the /track/ live dispatch map.
                  </span>
                </label>
              </div>
              <Badge variant="success" className="text-[9px]">Automated</Badge>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setBookingLead(null)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                className="gap-2 shadow-lg shadow-primary-glow/30 bg-primary hover:bg-primary-hover text-white font-bold"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Confirm Booking & Dispatch Work Order</span>
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
