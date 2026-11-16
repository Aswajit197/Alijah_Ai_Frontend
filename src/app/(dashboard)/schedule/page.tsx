'use client';

import React, { useState, useEffect } from 'react';
import {
  CalendarDays,
  Truck,
  MapPin,
  Clock,
  Plus,
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Filter,
  User,
  Key,
  Wrench,
  Search,
  ExternalLink,
  Smartphone,
  Sparkles,
  ArrowRight,
  X,
  Phone,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Modal } from '@/components/ui/modal';
import { apiRequest } from '@/lib/api';

interface Technician {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: { name: string; slug: string };
}

interface CustomerOption {
  id: string;
  name: string;
  companyName?: string;
  phone: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  gateCode?: string;
  equipments: { id: string; name: string; brand: string; modelNumber?: string; serialNumber?: string }[];
}

interface Job {
  id: string;
  jobNumber?: string;
  customerId: string;
  equipmentId?: string;
  technicianId?: string;
  title: string;
  status: 'UNSCHEDULED' | 'SCHEDULED' | 'DISPATCHED' | 'EN_ROUTE' | 'ON_SITE' | 'COMPLETED' | 'CANCELLED';
  priority: 'EMERGENCY' | 'HIGH' | 'NORMAL' | 'LOW';
  scheduledDate?: string;
  scheduledStart?: string;
  scheduledEnd?: string;
  serviceAddress?: string;
  gateCode?: string;
  reportedIssue?: string;
  notes?: string;
  totalAmount?: number;
  customer?: {
    id: string;
    name: string;
    companyName?: string;
    phone: string;
    address?: string;
    city?: string;
    state?: string;
  };
  equipment?: {
    id: string;
    name: string;
    brand: string;
    modelNumber?: string;
    serialNumber?: string;
  };
  technician?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  createdAt: string;
}

export default function SchedulePage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [customers, setCustomers] = useState<CustomerOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [isNewJobModalOpen, setIsNewJobModalOpen] = useState(false);
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);
  const [activeJobForDispatch, setActiveJobForDispatch] = useState<Job | null>(null);

  // Form states - New Job
  const [selectedCustId, setSelectedCustId] = useState('');
  const [selectedEquipId, setSelectedEquipId] = useState('');
  const [assignedTechId, setAssignedTechId] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [jobPriority, setJobPriority] = useState<'EMERGENCY' | 'HIGH' | 'NORMAL' | 'LOW'>('NORMAL');
  const [jobStartTime, setJobStartTime] = useState('11:30');
  const [jobEndTime, setJobEndTime] = useState('13:30');
  const [jobReportedIssue, setJobReportedIssue] = useState('');
  const [jobNotes, setJobNotes] = useState('');
  const [jobAmount, setJobAmount] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load jobs, technicians & customers
  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [jobsData, techsData, custsData] = await Promise.all([
        apiRequest<Job[]>(`/jobs?date=${selectedDate}${statusFilter !== 'ALL' ? `&status=${statusFilter}` : ''}`),
        apiRequest<Technician[]>('/jobs/technicians'),
        apiRequest<CustomerOption[]>('/customers'),
      ]);
      setJobs(jobsData);
      setTechnicians(techsData);
      setCustomers(custsData);
    } catch (err: any) {
      setError(err.message || 'Failed to load scheduling data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedDate, statusFilter]);

  // Selected customer for modal
  const activeCustomer = customers.find((c) => c.id === selectedCustId);

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustId || !jobTitle) return;
    setIsSubmitting(true);

    try {
      let startIso: string | undefined = undefined;
      let endIso: string | undefined = undefined;

      if (assignedTechId && jobStartTime && jobEndTime) {
        startIso = new Date(`${selectedDate}T${jobStartTime}:00`).toISOString();
        endIso = new Date(`${selectedDate}T${jobEndTime}:00`).toISOString();
      }

      await apiRequest('/jobs', {
        method: 'POST',
        body: JSON.stringify({
          customerId: selectedCustId,
          equipmentId: selectedEquipId || undefined,
          technicianId: assignedTechId || undefined,
          title: jobTitle,
          priority: jobPriority,
          scheduledDate: selectedDate,
          scheduledStart: startIso,
          scheduledEnd: endIso,
          reportedIssue: jobReportedIssue || undefined,
          notes: jobNotes || undefined,
          totalAmount: jobAmount > 0 ? Number(jobAmount) : undefined,
        }),
      });

      setIsNewJobModalOpen(false);
      resetJobForm();
      loadData();
    } catch (err: any) {
      alert(`Error creating work order: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeJobForDispatch || !assignedTechId) return;
    setIsSubmitting(true);

    try {
      const startIso = new Date(`${selectedDate}T${jobStartTime}:00`).toISOString();
      const endIso = new Date(`${selectedDate}T${jobEndTime}:00`).toISOString();

      await apiRequest(`/jobs/${activeJobForDispatch.id}/dispatch`, {
        method: 'PATCH',
        body: JSON.stringify({
          technicianId: assignedTechId,
          scheduledDate: selectedDate,
          scheduledStart: startIso,
          scheduledEnd: endIso,
          priority: jobPriority,
          notes: jobNotes || undefined,
        }),
      });

      setIsDispatchModalOpen(false);
      setActiveJobForDispatch(null);
      loadData();
    } catch (err: any) {
      alert(`Error dispatching job: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async (jobId: string, newStatus: string) => {
    try {
      await apiRequest(`/jobs/${jobId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
      loadData();
    } catch (err: any) {
      alert(`Failed to update status: ${err.message}`);
    }
  };

  const resetJobForm = () => {
    setSelectedCustId('');
    setSelectedEquipId('');
    setAssignedTechId('');
    setJobTitle('');
    setJobPriority('NORMAL');
    setJobStartTime('11:30');
    setJobEndTime('13:30');
    setJobReportedIssue('');
    setJobNotes('');
    setJobAmount(0);
  };

  const openDispatchDialog = (job: Job) => {
    setActiveJobForDispatch(job);
    setAssignedTechId(job.technicianId || (technicians[0] ? technicians[0].id : ''));
    setJobPriority(job.priority);
    setJobNotes(job.notes || '');
    if (job.scheduledStart) {
      const s = new Date(job.scheduledStart);
      setJobStartTime(`${String(s.getHours()).padStart(2, '0')}:${String(s.getMinutes()).padStart(2, '0')}`);
    }
    if (job.scheduledEnd) {
      const e = new Date(job.scheduledEnd);
      setJobEndTime(`${String(e.getHours()).padStart(2, '0')}:${String(e.getMinutes()).padStart(2, '0')}`);
    }
    setIsDispatchModalOpen(true);
  };

  // Slices
  const unscheduledJobs = jobs.filter((j) => j.status === 'UNSCHEDULED');
  const scheduledJobs = jobs.filter((j) => j.status !== 'UNSCHEDULED');

  const getPriorityBadge = (p: string) => {
    switch (p) {
      case 'EMERGENCY':
        return <Badge variant="danger" dot>EMERGENCY</Badge>;
      case 'HIGH':
        return <Badge variant="warning">HIGH PRIORITY</Badge>;
      default:
        return <Badge variant="neutral">STANDARD</Badge>;
    }
  };

  const getStatusBadge = (s: string) => {
    switch (s) {
      case 'DISPATCHED':
        return <Badge variant="warning">DISPATCHED</Badge>;
      case 'EN_ROUTE':
        return <Badge variant="info" dot>ON ROUTE</Badge>;
      case 'ON_SITE':
        return <Badge variant="primary" dot>ON SITE</Badge>;
      case 'COMPLETED':
        return <Badge variant="success">COMPLETED</Badge>;
      default:
        return <Badge variant="neutral">SCHEDULED</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Date Control */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
            <CalendarDays className="w-6 h-6 text-primary" />
            <span>Schedule & Technician Swimlanes</span>
          </h1>
          <p className="text-xs text-muted mt-1">
            Real-time technician dispatch board, time windows, on-site sync, and unassigned triage queue.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Date Picker Pill */}
          <div className="flex items-center gap-1.5 p-1 bg-surface border border-border rounded-xl">
            <button
              onClick={() => {
                const d = new Date(selectedDate);
                d.setDate(d.getDate() - 1);
                setSelectedDate(d.toISOString().split('T')[0]);
              }}
              className="p-1.5 rounded-lg text-muted hover:text-white hover:bg-surface-elevated transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="text-xs font-bold text-white px-2">
              {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
              })}
            </span>

            <button
              onClick={() => {
                const d = new Date(selectedDate);
                d.setDate(d.getDate() + 1);
                setSelectedDate(d.toISOString().split('T')[0]);
              }}
              className="p-1.5 rounded-lg text-muted hover:text-white hover:bg-surface-elevated transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
              className="text-[11px] font-semibold text-primary hover:text-accent px-2 border-l border-border/80"
            >
              Today
            </button>
          </div>

          <Button
            onClick={() => {
              resetJobForm();
              setIsNewJobModalOpen(true);
            }}
            className="shadow-lg shadow-primary-glow"
          >
            <Plus className="w-4 h-4 mr-2" />
            Book Work Order
          </Button>
        </div>
      </div>

      {/* Unscheduled Triage Queue Banner */}
      {unscheduledJobs.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-300">
                Unassigned Work Orders Queue ({unscheduledJobs.length})
              </h3>
            </div>
            <span className="text-[11px] text-amber-200/80">Pending technician allocation</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {unscheduledJobs.map((j) => (
              <div
                key={j.id}
                className="p-3.5 rounded-xl bg-surface/90 border border-amber-500/30 flex flex-col justify-between hover:border-amber-400/50 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[11px] font-bold text-accent">{j.jobNumber || 'JOB'}</span>
                    {getPriorityBadge(j.priority)}
                  </div>
                  <h4 className="font-bold text-white text-xs mt-1.5 line-clamp-2">{j.title}</h4>
                  <p className="text-[11px] text-muted mt-1 truncate">
                    {j.customer?.companyName || j.customer?.name} · {j.serviceAddress || 'No address'}
                  </p>
                </div>

                <Button
                  size="sm"
                  onClick={() => openDispatchDialog(j)}
                  className="mt-3 text-xs w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold"
                >
                  <Truck className="w-3.5 h-3.5 mr-1.5" />
                  Dispatch Technician
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Technician Swimlanes */}
      {isLoading ? (
        <div className="py-24 text-center text-muted text-xs">
          <div className="w-8 h-8 rounded-xl bg-primary/20 border border-primary/40 animate-pulse mx-auto mb-3" />
          Loading technician swimlanes & work orders...
        </div>
      ) : technicians.length === 0 ? (
        <div className="py-16 text-center text-muted rounded-2xl bg-surface border border-border">
          <User className="w-8 h-8 mx-auto mb-2 text-subtle" />
          <p className="text-sm font-bold text-white">No active technicians found</p>
          <p className="text-xs text-muted mt-1">Invite team members with the 'technician' role in Settings.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 items-start">
          {technicians.map((tech) => {
            const techJobs = scheduledJobs.filter((j) => j.technicianId === tech.id);

            return (
              <div
                key={tech.id}
                className="rounded-3xl bg-surface/90 border border-border flex flex-col overflow-hidden shadow-xl"
              >
                {/* Swimlane Column Header */}
                <div className="p-4 border-b border-border bg-surface-elevated/70 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-primary to-ai flex items-center justify-center text-white font-bold text-sm shadow-md">
                      {tech.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-sm">{tech.name}</h3>
                      <span className="text-[10px] font-mono text-ai uppercase font-semibold">
                        {tech.role?.name || 'Technician'}
                      </span>
                    </div>
                  </div>

                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-surface-card border border-border text-slate-300">
                    {techJobs.length} Jobs
                  </span>
                </div>

                {/* Scheduled Jobs in this Lane */}
                <div className="p-4 space-y-3 min-h-[300px]">
                  {techJobs.length === 0 ? (
                    <div className="h-40 rounded-2xl border border-dashed border-border/80 flex flex-col items-center justify-center text-center p-4 text-subtle text-xs">
                      <Clock className="w-6 h-6 mb-1 text-subtle/50" />
                      <span>Available for dispatch</span>
                      <span className="text-[10px] text-muted">No scheduled jobs on this date</span>
                    </div>
                  ) : (
                    techJobs.map((j) => {
                      const startTime = j.scheduledStart
                        ? new Date(j.scheduledStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : '';
                      const endTime = j.scheduledEnd
                        ? new Date(j.scheduledEnd).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : '';

                      return (
                        <Card
                          key={j.id}
                          className="space-y-3 bg-surface-card border-border hover:border-border-hover transition-all"
                        >
                          {/* Card Top */}
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-xs font-bold text-accent">
                                  {j.jobNumber}
                                </span>
                                {getPriorityBadge(j.priority)}
                              </div>
                              <h4 className="font-bold text-white text-xs mt-1.5 line-clamp-2">
                                {j.title}
                              </h4>
                            </div>
                            {getStatusBadge(j.status)}
                          </div>

                          {/* Time & Customer Info */}
                          <div className="p-2.5 rounded-xl bg-surface-elevated/70 border border-border/60 space-y-1.5 text-xs">
                            <div className="flex items-center gap-1.5 font-bold text-slate-200">
                              <Clock className="w-3.5 h-3.5 text-ai" />
                              <span>{startTime} – {endTime}</span>
                            </div>

                            <p className="font-semibold text-slate-300 truncate">
                              {j.customer?.companyName || j.customer?.name}
                            </p>

                            {j.serviceAddress && (
                              <p className="text-[11px] text-muted truncate flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-subtle shrink-0" />
                                <span>{j.serviceAddress}</span>
                              </p>
                            )}

                            {j.gateCode && (
                              <p className="text-[10px] text-amber-400 font-mono flex items-center gap-1">
                                <Key className="w-3 h-3 shrink-0" />
                                <span>Gate: {j.gateCode}</span>
                              </p>
                            )}
                          </div>

                          {/* Equipment Tag */}
                          {j.equipment && (
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-300">
                              <Wrench className="w-3 h-3 text-primary shrink-0" />
                              <span className="truncate">{j.equipment.brand} · {j.equipment.name}</span>
                            </div>
                          )}

                          {/* Status Lifecycle Action Buttons */}
                          <div className="pt-2 border-t border-border/60 flex items-center justify-between gap-2">
                            {j.status === 'SCHEDULED' && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="w-full text-xs h-7"
                                onClick={() => handleUpdateStatus(j.id, 'DISPATCHED')}
                              >
                                Dispatch Tech
                              </Button>
                            )}
                            {j.status === 'DISPATCHED' && (
                              <Button
                                size="sm"
                                className="w-full text-xs h-7 bg-sky-600 hover:bg-sky-500"
                                onClick={() => handleUpdateStatus(j.id, 'EN_ROUTE')}
                              >
                                Mark En Route
                              </Button>
                            )}
                            {j.status === 'EN_ROUTE' && (
                              <Button
                                size="sm"
                                className="w-full text-xs h-7 bg-primary hover:bg-primary-hover"
                                onClick={() => handleUpdateStatus(j.id, 'ON_SITE')}
                              >
                                Mark On Site
                              </Button>
                            )}
                            {j.status === 'ON_SITE' && (
                              <Button
                                size="sm"
                                className="w-full text-xs h-7 bg-emerald-600 hover:bg-emerald-500"
                                onClick={() => handleUpdateStatus(j.id, 'COMPLETED')}
                              >
                                Complete Work Order
                              </Button>
                            )}
                            {j.status === 'COMPLETED' && (
                              <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Done & Invoiced
                              </span>
                            )}

                            <div className="flex items-center gap-1.5">
                              <a
                                href={`/track/${j.id}`}
                                target="_blank"
                                rel="noreferrer"
                                className="px-2 py-1 rounded-lg bg-surface-elevated hover:bg-slate-700 text-subtle hover:text-white transition-colors flex items-center gap-1 text-[11px]"
                                title="Customer Live Tracking View"
                              >
                                <ExternalLink className="w-3 h-3 text-sky-400" />
                                <span>Track</span>
                              </a>

                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-xs h-7 text-subtle hover:text-white"
                                onClick={() => openDispatchDialog(j)}
                              >
                                Edit
                              </Button>
                            </div>
                          </div>
                        </Card>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal 1: Create New Work Order */}
      <Modal
        isOpen={isNewJobModalOpen}
        onClose={() => setIsNewJobModalOpen(false)}
        title="Book New Work Order"
        description="Create an operational job ticket and assign a technician to the schedule."
        maxWidth="xl"
      >
        <form onSubmit={handleCreateJob} className="space-y-4">
          {/* Customer Selection */}
          <div>
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
              Select Customer Account *
            </label>
            <select
              value={selectedCustId}
              onChange={(e) => {
                setSelectedCustId(e.target.value);
                setSelectedEquipId('');
              }}
              required
              className="w-full px-3.5 py-2.5 bg-surface border border-border rounded-xl text-xs text-white focus:outline-none focus:border-primary"
            >
              <option value="">-- Choose Customer from CRM --</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.companyName ? `${c.companyName} (${c.name})` : c.name} · {c.phone}
                </option>
              ))}
            </select>
          </div>

          {/* Equipment Dropdown */}
          {activeCustomer && activeCustomer.equipments && activeCustomer.equipments.length > 0 && (
            <div>
              <label className="text-xs font-bold text-ai uppercase tracking-wider block mb-1.5">
                Target Installed Unit (Optional)
              </label>
              <select
                value={selectedEquipId}
                onChange={(e) => setSelectedEquipId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-surface border border-border rounded-xl text-xs text-white focus:outline-none focus:border-ai"
              >
                <option value="">-- None / General Service --</option>
                {activeCustomer.equipments.map((eq) => (
                  <option key={eq.id} value={eq.id}>
                    {eq.brand} {eq.name} {eq.modelNumber ? `(${eq.modelNumber})` : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Job Details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <Input
                label="Work Order Title"
                required
                placeholder="e.g. AC Blowing Warm Air / Emergency Coils Freezing"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
                Priority
              </label>
              <select
                value={jobPriority}
                onChange={(e) => setJobPriority(e.target.value as any)}
                className="w-full px-3.5 py-2.5 bg-surface border border-border rounded-xl text-xs text-white focus:outline-none focus:border-primary"
              >
                <option value="EMERGENCY">Emergency (Red)</option>
                <option value="HIGH">High Priority</option>
                <option value="NORMAL">Standard</option>
                <option value="LOW">Low</option>
              </select>
            </div>
          </div>

          <Input
            label="Reported Symptoms / Customer Description"
            placeholder="e.g. Rooftop Carrier Packaged Unit 5-Ton - Freezing at coils, thermostat error E4"
            value={jobReportedIssue}
            onChange={(e) => setJobReportedIssue(e.target.value)}
          />

          {/* Dispatch Assignment Accordion */}
          <div className="p-4 rounded-2xl bg-surface border border-border space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-primary">
              Schedule & Technician Allocation
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
                  Assign Technician
                </label>
                <select
                  value={assignedTechId}
                  onChange={(e) => setAssignedTechId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-surface-elevated border border-border rounded-xl text-xs text-white focus:outline-none focus:border-primary"
                >
                  <option value="">-- Unassigned (Triage Queue) --</option>
                  {technicians.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.role?.name})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Input
                  label="Start Window"
                  type="time"
                  value={jobStartTime}
                  onChange={(e) => setJobStartTime(e.target.value)}
                />
              </div>

              <div>
                <Input
                  label="End Window"
                  type="time"
                  value={jobEndTime}
                  onChange={(e) => setJobEndTime(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
            <Button type="button" variant="ghost" onClick={() => setIsNewJobModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Create Work Order
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal 2: Quick Dispatch / Reschedule */}
      <Modal
        isOpen={isDispatchModalOpen}
        onClose={() => setIsDispatchModalOpen(false)}
        title={`Dispatch ${activeJobForDispatch?.jobNumber || 'Work Order'}`}
        description="Allocate this job to a technician lane and set arrival window."
        maxWidth="lg"
      >
        <form onSubmit={handleQuickDispatch} className="space-y-4">
          <div className="p-3.5 rounded-xl bg-surface border border-border text-xs space-y-1">
            <p className="font-bold text-white text-sm">{activeJobForDispatch?.title}</p>
            <p className="text-muted">
              {activeJobForDispatch?.customer?.companyName || activeJobForDispatch?.customer?.name} ·{' '}
              {activeJobForDispatch?.serviceAddress}
            </p>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
              Select Field Technician *
            </label>
            <select
              value={assignedTechId}
              onChange={(e) => setAssignedTechId(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 bg-surface border border-border rounded-xl text-xs text-white focus:outline-none focus:border-primary"
            >
              <option value="">-- Choose Technician --</option>
              {technicians.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.role?.name})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Arrival Start Window"
              type="time"
              required
              value={jobStartTime}
              onChange={(e) => setJobStartTime(e.target.value)}
            />

            <Input
              label="Arrival End Window"
              type="time"
              required
              value={jobEndTime}
              onChange={(e) => setJobEndTime(e.target.value)}
            />
          </div>

          <Input
            label="Special Technician Notes"
            placeholder="e.g. Check rooftop disconnect switch first"
            value={jobNotes}
            onChange={(e) => setJobNotes(e.target.value)}
          />

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
            <Button type="button" variant="ghost" onClick={() => setIsDispatchModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Confirm Dispatch
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
