'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
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
  Flame,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Modal } from '@/components/ui/modal';
import { apiRequest } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

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
  customerType?: string;
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
    gateCode?: string;
    accessNotes?: string;
  };
  equipment?: {
    id: string;
    name: string;
    brand: string;
    modelNumber?: string;
    serialNumber?: string;
    warrantyStatus?: string;
  };
  technician?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  createdAt: string;
}

function ScheduleContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const targetJobParam = searchParams?.get('jobId') || searchParams?.get('jobNumber');
  const [focusedJobId, setFocusedJobId] = useState<string | null>(null);
  const handledJobParamRef = useRef<string | null>(null);

  const [jobs, setJobs] = useState<Job[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [customers, setCustomers] = useState<CustomerOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingJobId, setUpdatingJobId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [viewFilter, setViewFilter] = useState<'ALL' | 'ACTIVE' | 'AVAILABLE'>('ALL');
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [isNewJobModalOpen, setIsNewJobModalOpen] = useState(false);
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);
  const [activeJobForDispatch, setActiveJobForDispatch] = useState<Job | null>(null);
  const [dispatchDate, setDispatchDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [detectedWindow, setDetectedWindow] = useState<string | null>(null);
  const [dispatchServiceAddress, setDispatchServiceAddress] = useState('');
  const [dispatchGateCode, setDispatchGateCode] = useState('');
  const [dispatchReportedIssue, setDispatchReportedIssue] = useState('');
  const [aiRecommendation, setAiRecommendation] = useState<any | null>(null);
  const [isLoadingRecommendation, setIsLoadingRecommendation] = useState(false);
  const [checkIns, setCheckIns] = useState<any[]>([]);

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

  // Searchable Customer State for 1000s of records
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState(false);

  // Load jobs, technicians & customers
  const loadData = async (showLoadingSpinner: boolean = false) => {
    if (showLoadingSpinner) {
      setIsLoading(true);
    }
    setError(null);
    try {
      const [jobsData, techsData, custsData, checkInsData] = await Promise.all([
        apiRequest<Job[]>(`/jobs?date=${selectedDate}${statusFilter !== 'ALL' ? `&status=${statusFilter}` : ''}`),
        apiRequest<Technician[]>('/jobs/technicians'),
        apiRequest<CustomerOption[]>('/customers'),
        apiRequest<{ data: any[] }>('/technician-check-ins').catch(() => null),
      ]);
      setJobs(jobsData);
      setTechnicians(techsData);
      setCustomers(custsData);
      if (checkInsData && Array.isArray((checkInsData as any).data)) {
        setCheckIns((checkInsData as any).data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load scheduling data');
    } finally {
      if (showLoadingSpinner) {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    loadData(true);
  }, [selectedDate, statusFilter]);

  // Selected customer for modal
  const activeCustomer = customers.find((c) => c.id === selectedCustId);

  const selectedTechObj = technicians.find((t) => t.id === assignedTechId);

  // Fast filtered customers for searchable combobox (supports 1000s of CRM records)
  const filteredCustomers = customers
    .filter((c) => {
      if (!customerSearchQuery.trim()) return true;
      const q = customerSearchQuery.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        (c.companyName && c.companyName.toLowerCase().includes(q)) ||
        c.phone.toLowerCase().includes(q) ||
        (c.address && c.address.toLowerCase().includes(q))
      );
    })
    .slice(0, 10);

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
      await loadData(false);
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
      const targetDate = dispatchDate || selectedDate;
      const startIso = new Date(`${targetDate}T${jobStartTime}:00`).toISOString();
      const endIso = new Date(`${targetDate}T${jobEndTime}:00`).toISOString();

      await apiRequest(`/jobs/${activeJobForDispatch.id}/dispatch`, {
        method: 'PATCH',
        body: JSON.stringify({
          technicianId: assignedTechId,
          scheduledDate: targetDate,
          scheduledStart: startIso,
          scheduledEnd: endIso,
          priority: jobPriority,
          notes: jobNotes.trim() || undefined,
          serviceAddress: dispatchServiceAddress.trim() || undefined,
          gateCode: dispatchGateCode.trim() || undefined,
          reportedIssue: dispatchReportedIssue.trim() || undefined,
        }),
      });

      setIsDispatchModalOpen(false);
      setActiveJobForDispatch(null);
      await loadData(false);
    } catch (err: any) {
      alert(`Error dispatching job: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async (jobId: string, newStatus: string) => {
    setUpdatingJobId(jobId);
    // Optimistic UI update: instantly update status without unmounting/flashing the screen
    setJobs((prev) =>
      prev.map((j) => (j.id === jobId ? { ...j, status: newStatus as any } : j))
    );

    try {
      await apiRequest(`/jobs/${jobId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
      await loadData(false); // Silent background sync
    } catch (err: any) {
      alert(`Failed to update status: ${err.message}`);
      await loadData(false);
    } finally {
      setUpdatingJobId(null);
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
    setCustomerSearchQuery('');
    setIsCustomerDropdownOpen(false);
  };

  const openDispatchDialog = (job: Job) => {
    setActiveJobForDispatch(job);
    const preferredTech =
      technicians.find(
        (t) =>
          t.role?.slug === 'technician' ||
          t.role?.name?.toLowerCase().includes('tech')
      ) || technicians[0];
    setAssignedTechId(job.technicianId || (preferredTech ? preferredTech.id : ''));
    setJobPriority(job.priority || 'NORMAL');
    setDispatchDate(
      job.scheduledDate
        ? new Date(job.scheduledDate).toISOString().split('T')[0]
        : selectedDate || new Date().toISOString().split('T')[0]
    );

    let defaultStart = '09:00';
    let defaultEnd = '13:00';
    let foundWindow: string | null = null;
    let cleanNotes = job.notes || '';

    if (job.notes && job.notes.includes('Preferred Window:')) {
      const match = job.notes.match(/Preferred Window:\s*([^\n\r]+)/i);
      if (match && match[1]) {
        foundWindow = match[1].trim();
        const lower = foundWindow.toLowerCase();
        if (lower.includes('morning') || lower.includes('8:00')) {
          defaultStart = '08:00';
          defaultEnd = '12:00';
        } else if (lower.includes('afternoon') || lower.includes('12:00')) {
          defaultStart = '12:00';
          defaultEnd = '16:00';
        } else if (
          lower.includes('evening') ||
          lower.includes('4:00') ||
          lower.includes('16:00')
        ) {
          defaultStart = '16:00';
          defaultEnd = '20:00';
        }
        cleanNotes = cleanNotes
          .replace(/Preferred Window:\s*[^\n\r]+/i, '')
          .replace(/^\s*[\r\n]/gm, '')
          .trim();
      }
    }

    if (job.scheduledStart) {
      const s = new Date(job.scheduledStart);
      defaultStart = `${String(s.getHours()).padStart(2, '0')}:${String(s.getMinutes()).padStart(2, '0')}`;
    }
    if (job.scheduledEnd) {
      const e = new Date(job.scheduledEnd);
      defaultEnd = `${String(e.getHours()).padStart(2, '0')}:${String(e.getMinutes()).padStart(2, '0')}`;
    }

    setDetectedWindow(foundWindow);
    setJobStartTime(defaultStart);
    setJobEndTime(defaultEnd);
    setJobNotes(cleanNotes);
    setDispatchServiceAddress(job.serviceAddress || job.customer?.address || '');
    setDispatchGateCode(job.gateCode || job.customer?.gateCode || '');
    setDispatchReportedIssue(job.reportedIssue || job.title || '');
    setIsDispatchModalOpen(true);

    // Fetch AI technician recommendations for this job
    setAiRecommendation(null);
    setIsLoadingRecommendation(true);
    apiRequest<any>(`/jobs/${job.id}/technician-recommendations`)
      .then((res) => {
        const list = Array.isArray(res) ? res : (res as any)?.data || [];
        if (list && list.length > 0) {
          setAiRecommendation(list[0]);
        }
      })
      .catch((err) => console.warn('Could not load AI recommendations:', err))
      .finally(() => setIsLoadingRecommendation(false));
  };

  // Dedicated helper to smoothly center the card inside the scrollable <main> container
  const scrollCardIntoView = (jobId: string) => {
    const el = document.getElementById(`job-card-${jobId}`);
    if (!el) return false;

    // 1. Native scrollIntoView
    try {
      el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
    } catch {}

    // 2. Direct parent <main> calculation to guarantee absolute vertical centering
    const mainEl = document.querySelector('main');
    if (mainEl) {
      const elRect = el.getBoundingClientRect();
      const mainRect = mainEl.getBoundingClientRect();
      const targetScrollTop =
        mainEl.scrollTop + (elRect.top - mainRect.top) - (mainRect.height / 2) + (elRect.height / 2);
      mainEl.scrollTo({ top: Math.max(0, targetScrollTop), behavior: 'smooth' });
    }
    return true;
  };

  const triggerCenterScroll = (jobId: string) => {
    // Staggered triggers to account for DOM render, font painting, and swimlane card expansion
    [50, 200, 450, 750, 1100].forEach((delay) => {
      setTimeout(() => {
        scrollCardIntoView(jobId);
      }, delay);
    });
  };

  // Deep-link auto-focus from Notifications ("View Details")
  useEffect(() => {
    if (!targetJobParam) return;
    if (handledJobParamRef.current === targetJobParam) return;

    let match = jobs.find(
      (j) =>
        j.id === targetJobParam ||
        (j.jobNumber && j.jobNumber.toLowerCase() === targetJobParam.toLowerCase())
    );

    if (match) {
      handledJobParamRef.current = targetJobParam;
      setFocusedJobId(match.id);

      // Clean the query parameter from URL bar so it doesn't persist or re-trigger on subsequent card clicks
      if (typeof window !== 'undefined') {
        window.history.replaceState(null, '', window.location.pathname);
      }

      // Auto-switch selected date if scheduled on a different day
      if (match.scheduledDate) {
        const jobDateStr = new Date(match.scheduledDate).toISOString().split('T')[0];
        if (jobDateStr && jobDateStr !== selectedDate) {
          setSelectedDate(jobDateStr);
        }
      }

      // Staggered scroll to center the card in viewport
      triggerCenterScroll(match.id);

      // Keep glowing highlight active for 10 seconds
      const fadeTimer = setTimeout(() => {
        setFocusedJobId(null);
      }, 10000);

      return () => {
        clearTimeout(fadeTimer);
      };
    } else if (jobs.length > 0) {
      // If job is on a different date, fetch it directly
      apiRequest<Job>(`/jobs/${targetJobParam}`)
        .then((fetched) => {
          if (fetched && fetched.id) {
            handledJobParamRef.current = targetJobParam;
            if (typeof window !== 'undefined') {
              window.history.replaceState(null, '', window.location.pathname);
            }
            if (fetched.scheduledDate) {
              const d = new Date(fetched.scheduledDate).toISOString().split('T')[0];
              setSelectedDate(d);
            }
            setJobs((prev) => (prev.some((p) => p.id === fetched.id) ? prev : [fetched, ...prev]));
            setFocusedJobId(fetched.id);
            triggerCenterScroll(fetched.id);
          }
        })
        .catch(() => {});
    }
  }, [targetJobParam, jobs]);

  // Dismiss glowing highlight on click anywhere
  useEffect(() => {
    if (!focusedJobId) return;
    const dismissHighlight = () => {
      setFocusedJobId(null);
    };
    window.addEventListener('click', dismissHighlight);
    return () => window.removeEventListener('click', dismissHighlight);
  }, [focusedJobId]);

  // Slices
  const unscheduledJobs = jobs.filter((j) => j.status === 'UNSCHEDULED');
  const scheduledJobs = jobs.filter((j) => j.status !== 'UNSCHEDULED');

  // Sorted technicians:
  // 1. Technicians with assigned jobs on this date show FIRST!
  // 2. Pure field technicians show before office roles
  // 3. Alphabetical
  const sortedTechnicians = [...technicians].sort((a, b) => {
    const aJobs = scheduledJobs.filter((j) => j.technicianId === a.id).length;
    const bJobs = scheduledJobs.filter((j) => j.technicianId === b.id).length;

    // Rule 1: Highest job count first (Technicians with active jobs appear first!)
    if (bJobs !== aJobs) {
      return bJobs - aJobs;
    }

    // Rule 2: Dedicated technicians before office roles
    const aIsTech = a.role?.slug === 'technician' || a.role?.name?.toLowerCase().includes('tech') ? 1 : 0;
    const bIsTech = b.role?.slug === 'technician' || b.role?.name?.toLowerCase().includes('tech') ? 1 : 0;
    if (bIsTech !== aIsTech) {
      return bIsTech - aIsTech;
    }

    // Rule 3: Name alphabetical
    return a.name.localeCompare(b.name);
  });

  // Filter out office accounts (owner, dispatcher, sales_estimator) IF they have 0 jobs scheduled
  // (Office staff should only take up a swimlane if an actual work order was assigned to them)
  const relevantTechnicians = sortedTechnicians.filter((tech) => {
    const jobCount = scheduledJobs.filter((j) => j.technicianId === tech.id).length;
    if (jobCount > 0) return true;
    return tech.role?.slug === 'technician' || tech.role?.name?.toLowerCase().includes('tech');
  });

  const activeTechCount = relevantTechnicians.filter((t) =>
    scheduledJobs.some((j) => j.technicianId === t.id)
  ).length;
  const availableTechCount = relevantTechnicians.length - activeTechCount;

  // Filter based on selected view tab
  const displayedTechnicians = relevantTechnicians.filter((tech) => {
    const hasJobs = scheduledJobs.some((j) => j.technicianId === tech.id);
    if (viewFilter === 'ACTIVE') return hasJobs;
    if (viewFilter === 'AVAILABLE') return !hasJobs;
    return true;
  });

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

          <a
            href={`/book/${user?.tenantSlug || 'desert-air'}`}
            target="_blank"
            rel="noreferrer"
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-surface-elevated hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-border transition-colors"
            title="Open Public Customer Self-Service Booking Page"
          >
            <ExternalLink className="w-3.5 h-3.5 text-sky-400" />
            <span>Customer Booking Page</span>
          </a>

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
            {unscheduledJobs.map((j) => {
              const isFocused = focusedJobId === j.id;
              return (
                <div
                  key={j.id}
                  id={`job-card-${j.id}`}
                  className={`p-3.5 rounded-xl bg-surface/90 flex flex-col justify-between transition-all duration-300 ${
                    isFocused
                      ? 'border-2 border-red-500 ring-4 ring-red-500/50 shadow-2xl shadow-red-500/60 animate-pulse'
                      : 'border border-amber-500/30 hover:border-amber-400/50'
                  }`}
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
              );
            })}
          </div>
        </div>
      )}

      {/* Swimlane Filter Tabs & Metric Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-1.5 p-1 bg-surface border border-border rounded-xl">
          <button
            onClick={() => setViewFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewFilter === 'ALL'
                ? 'bg-primary text-white shadow-sm'
                : 'text-muted hover:text-white'
            }`}
          >
            All Swimlanes ({relevantTechnicians.length})
          </button>
          <button
            onClick={() => setViewFilter('ACTIVE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              viewFilter === 'ACTIVE'
                ? 'bg-primary text-white shadow-sm'
                : 'text-muted hover:text-white'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-sky-400" />
            Active Assigned ({activeTechCount})
          </button>
          <button
            onClick={() => setViewFilter('AVAILABLE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              viewFilter === 'AVAILABLE'
                ? 'bg-primary text-white shadow-sm'
                : 'text-muted hover:text-white'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            Available / Idle ({availableTechCount})
          </button>
        </div>

        <div className="flex items-center gap-3 text-xs text-muted">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
            Available
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-sky-400 inline-block" />
            Active Job
          </span>
          <span className="hidden md:inline text-[11px] text-slate-500 font-mono">
            Sorted by Active Jobs First
          </span>
        </div>
      </div>

      {/* Technician Swimlanes */}
      {isLoading ? (
        <div className="py-24 text-center text-muted text-xs">
          <div className="w-8 h-8 rounded-xl bg-primary/20 border border-primary/40 animate-pulse mx-auto mb-3" />
          Loading technician swimlanes & work orders...
        </div>
      ) : displayedTechnicians.length === 0 ? (
        <div className="py-16 text-center text-muted rounded-2xl bg-surface border border-border">
          <User className="w-8 h-8 mx-auto mb-2 text-subtle" />
          <p className="text-sm font-bold text-white">No matching technicians</p>
          <p className="text-xs text-muted mt-1">Try switching to 'All Swimlanes' tab or assign a work order.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 items-start">
          {displayedTechnicians.map((tech) => {
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
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-bold text-white text-sm">{tech.name}</h3>
                        {techJobs.length > 0 && (
                          <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" title="Active on job" />
                        )}
                      </div>
                      <span className="text-[10px] font-mono text-ai uppercase font-semibold">
                        {tech.role?.name || 'Technician'}
                      </span>
                    </div>
                  </div>

                  {techJobs.length > 0 ? (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30 flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5" />
                      {techJobs.length} {techJobs.length === 1 ? 'Job' : 'Jobs'}
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      Available
                    </span>
                  )}
                </div>

                {/* Scheduled Jobs in this Lane */}
                <div className="p-4 space-y-3 min-h-[300px]">
                  {techJobs.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-border/80 bg-surface-card/40 p-5 flex flex-col items-center text-center justify-between space-y-4 min-h-[220px]">
                      <div className="space-y-2">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          Available for Dispatch
                        </div>
                        <p className="text-xs font-semibold text-slate-300">
                          Full Day Shift Open
                        </p>
                        <p className="text-[11px] text-muted max-w-[200px]">
                          08:00 AM – 06:00 PM · No active assignments on this date
                        </p>
                      </div>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          resetJobForm();
                          setAssignedTechId(tech.id);
                          setIsNewJobModalOpen(true);
                        }}
                        className="w-full text-xs border-dashed border-primary/40 text-primary hover:bg-primary/10 hover:border-primary transition-all"
                      >
                        <Plus className="w-3.5 h-3.5 mr-1.5" />
                        Dispatch to {tech.name.split(' ')[0]}
                      </Button>
                    </div>
                  ) : (
                    techJobs.map((j) => {
                      const startTime = j.scheduledStart
                        ? new Date(j.scheduledStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : '';
                      const endTime = j.scheduledEnd
                        ? new Date(j.scheduledEnd).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : '';
                      const isUpdating = updatingJobId === j.id;
                      const isFocused = focusedJobId === j.id;
                      const isEmergency = j.priority === 'EMERGENCY';

                      return (
                        <Card
                          key={j.id}
                          id={`job-card-${j.id}`}
                          className={`space-y-3 bg-surface-card transition-all duration-300 ${
                            isFocused
                              ? isEmergency
                                ? 'border-2 border-red-500 ring-4 ring-red-500/50 shadow-2xl shadow-red-500/60 animate-pulse'
                                : 'border-2 border-primary ring-4 ring-primary/50 shadow-2xl shadow-primary/60 animate-pulse'
                              : 'border-border hover:border-border-hover'
                          }`}
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

                          {/* Mid-Job Technician Live Check-In Pill */}
                          {(() => {
                            const jobCheckIn = checkIns.find(
                              (c) => c.serviceRequestId === j.id || (j.technician && c.technicianName === j.technician.name)
                            );
                            if (!jobCheckIn) return null;
                            return (
                              <div className="p-2 rounded-xl bg-primary/10 border border-primary/25 text-[11px] flex items-center justify-between">
                                <div className="flex items-center gap-1.5 text-primary font-semibold truncate">
                                  <Sparkles className="w-3.5 h-3.5 shrink-0" />
                                  <span>Elijah Check-In: {jobCheckIn.progress}%</span>
                                  {jobCheckIn.challenges && (
                                    <span className="text-amber-300 font-normal truncate">({jobCheckIn.challenges})</span>
                                  )}
                                </div>
                                {jobCheckIn.isHelpNeeded && (
                                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30">
                                    HELP NEEDED
                                  </span>
                                )}
                              </div>
                            );
                          })()}

                          {/* Hand-Back & Autonomous Re-Dispatch Pill */}
                          {j.notes && (j.notes.includes('Declined by') || j.notes.includes('re-assigned') || j.notes.includes('Handed back')) && (
                            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[10px] text-amber-300 flex items-center justify-between">
                              <span className="font-semibold truncate">⚡ Hand-Back Handled · Next Tech Assigned</span>
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 font-mono">AUTONOMOUS</span>
                            </div>
                          )}

                          {/* Status Lifecycle Action Buttons */}
                          <div className="pt-2 border-t border-border/60 flex items-center justify-between gap-2">
                            {j.status === 'SCHEDULED' && (() => {
                              const todayDateStr = new Date().toISOString().split('T')[0];
                              const jobDateStr = j.scheduledDate ? j.scheduledDate.split('T')[0] : selectedDate;
                              const isFuture = jobDateStr > todayDateStr;
                              return (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  disabled={isUpdating}
                                  className={`w-full text-xs h-7 transition-all ${
                                    isFuture
                                      ? 'border-slate-700/80 text-slate-400 hover:border-amber-500/50 hover:text-amber-300'
                                      : 'border-primary/40 text-primary hover:bg-primary/10'
                                  }`}
                                  onClick={() => {
                                    if (isFuture) {
                                      const confirmDispatch = window.confirm(
                                        `⚠️ Early Dispatch Notice:\n\nThis work order is scheduled for tomorrow (${jobDateStr}).\n\nDispatching now will send an SMS to the customer stating the technician is on the way today.\n\nAre you sure you want to dispatch early?`
                                      );
                                      if (!confirmDispatch) return;
                                    }
                                    handleUpdateStatus(j.id, 'DISPATCHED');
                                  }}
                                >
                                  {isUpdating ? (
                                    <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />
                                  ) : (
                                    <Truck className="w-3 h-3 mr-1.5" />
                                  )}
                                  <span>{isUpdating ? 'Dispatching...' : isFuture ? 'Scheduled (Tomorrow)' : 'Dispatch Tech'}</span>
                                </Button>
                              );
                            })()}
                            {j.status === 'DISPATCHED' && (
                              <Button
                                size="sm"
                                disabled={isUpdating}
                                className="w-full text-xs h-7 bg-sky-600 hover:bg-sky-500 font-semibold"
                                onClick={() => handleUpdateStatus(j.id, 'EN_ROUTE')}
                              >
                                {isUpdating ? (
                                  <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />
                                ) : null}
                                <span>{isUpdating ? 'Updating...' : 'Mark En Route'}</span>
                              </Button>
                            )}
                            {j.status === 'EN_ROUTE' && (
                              <Button
                                size="sm"
                                disabled={isUpdating}
                                className="w-full text-xs h-7 bg-primary hover:bg-primary-hover font-semibold"
                                onClick={() => handleUpdateStatus(j.id, 'ON_SITE')}
                              >
                                {isUpdating ? (
                                  <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />
                                ) : null}
                                <span>{isUpdating ? 'Updating...' : 'Mark On Site'}</span>
                              </Button>
                            )}
                            {j.status === 'ON_SITE' && (
                              <Button
                                size="sm"
                                disabled={isUpdating}
                                className="w-full text-xs h-7 bg-emerald-600 hover:bg-emerald-500 font-bold shadow-md shadow-emerald-950/40"
                                onClick={() => handleUpdateStatus(j.id, 'COMPLETED')}
                              >
                                {isUpdating ? (
                                  <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />
                                ) : (
                                  <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                                )}
                                <span>{isUpdating ? 'Completing...' : 'Complete Work Order'}</span>
                              </Button>
                            )}
                            {j.status === 'COMPLETED' && (
                              <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
                                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
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
          {/* Customer Selection - Searchable Typeahead Combobox for 1,000s of Customers */}
          <div className="relative">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Select Customer Account *
              </label>
              <span className="text-[11px] text-muted">
                {customers.length} total accounts in CRM
              </span>
            </div>

            {selectedCustId && activeCustomer ? (
              <div className="p-3 rounded-2xl bg-surface-elevated border border-primary/40 flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">
                      {activeCustomer.companyName
                        ? `${activeCustomer.companyName} (${activeCustomer.name})`
                        : activeCustomer.name}
                    </span>
                    <Badge variant={activeCustomer.customerType === 'COMMERCIAL' ? 'info' : 'neutral'}>
                      {activeCustomer.customerType || 'RESIDENTIAL'}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-subtle">
                    {activeCustomer.phone} {activeCustomer.address ? `· ${activeCustomer.address}` : ''}
                  </p>
                </div>

                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="text-xs h-7"
                  onClick={() => {
                    setSelectedCustId('');
                    setSelectedEquipId('');
                    setCustomerSearchQuery('');
                    setIsCustomerDropdownOpen(true);
                  }}
                >
                  Change
                </Button>
              </div>
            ) : (
              <div className="relative">
                <div className="relative">
                  <Search className="w-4 h-4 text-muted absolute left-3.5 top-3 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search thousands of clients by name, company, phone, or address..."
                    value={customerSearchQuery}
                    onChange={(e) => {
                      setCustomerSearchQuery(e.target.value);
                      setIsCustomerDropdownOpen(true);
                    }}
                    onFocus={() => setIsCustomerDropdownOpen(true)}
                    className="w-full pl-9 pr-9 py-2.5 bg-surface border border-border rounded-xl text-xs text-white placeholder-muted focus:outline-none focus:border-primary transition-colors"
                  />
                  {customerSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setCustomerSearchQuery('')}
                      className="absolute right-3 top-2.5 text-muted hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {isCustomerDropdownOpen && (
                  <div className="absolute left-0 right-0 top-full mt-1.5 z-30 max-h-60 overflow-y-auto bg-surface-card border border-border rounded-2xl shadow-2xl p-1.5 space-y-1">
                    {filteredCustomers.length > 0 ? (
                      filteredCustomers.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => {
                            setSelectedCustId(c.id);
                            setSelectedEquipId('');
                            setIsCustomerDropdownOpen(false);
                            setCustomerSearchQuery('');
                          }}
                          className="w-full text-left p-2.5 rounded-xl hover:bg-surface-elevated flex items-center justify-between transition-colors group"
                        >
                          <div className="space-y-0.5 min-w-0 pr-2">
                            <p className="text-xs font-semibold text-white group-hover:text-primary transition-colors truncate">
                              {c.companyName ? `${c.companyName} (${c.name})` : c.name}
                            </p>
                            <p className="text-[11px] text-muted truncate">
                              {c.phone} {c.address ? `· ${c.address}` : ''}
                            </p>
                          </div>
                          <Badge variant="neutral" className="text-[10px] shrink-0">
                            {c.customerType || 'CLIENT'}
                          </Badge>
                        </button>
                      ))
                    ) : (
                      <div className="p-4 text-center text-xs text-muted">
                        No customers match &quot;{customerSearchQuery}&quot;
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
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
        title={
          activeJobForDispatch?.status === 'UNSCHEDULED'
            ? `Dispatch ${activeJobForDispatch?.jobNumber || 'Work Order'}`
            : `Reschedule ${activeJobForDispatch?.jobNumber || 'Work Order'}`
        }
        description="Allocate work order to a technician lane, verify site access details, and lock in the customer arrival window."
        maxWidth="2xl"
      >
        <form onSubmit={handleQuickDispatch} className="space-y-4">
          {/* Work Order Overview Card */}
          <div className="p-4 rounded-xl bg-surface border border-border space-y-3">
            {/* Header: Job Number & Priority & Status */}
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-accent bg-accent/10 px-2 py-0.5 rounded border border-accent/20">
                  {activeJobForDispatch?.jobNumber || 'JOB'}
                </span>
                {getPriorityBadge(jobPriority)}
              </div>
              <span className="text-[11px] font-medium text-muted">
                Created:{' '}
                {activeJobForDispatch?.createdAt
                  ? new Date(activeJobForDispatch.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })
                  : 'Today'}
              </span>
            </div>

            {/* Customer & Address Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1 border-t border-border/50">
              <div>
                <span className="text-muted block text-[11px] font-medium">Customer & Contact</span>
                <p className="font-bold text-white text-sm">
                  {activeJobForDispatch?.customer?.companyName ||
                    activeJobForDispatch?.customer?.name ||
                    'Unknown Customer'}
                </p>
                {activeJobForDispatch?.customer?.phone && (
                  <a
                    href={`tel:${activeJobForDispatch.customer.phone}`}
                    className="text-primary hover:text-accent inline-flex items-center gap-1.5 text-xs mt-1"
                  >
                    <Phone className="w-3 h-3" />
                    {activeJobForDispatch.customer.phone}
                  </a>
                )}
                <div className="mt-1.5">
                  <Link
                    href="/customers"
                    className="text-[11px] text-sky-400 hover:underline inline-flex items-center gap-1"
                  >
                    <span>Edit Profile in Customer CRM</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>

              <div>
                <Input
                  label="Service Address (Editable)"
                  placeholder="e.g. 100 North Central Avenue, Phoenix, AZ"
                  value={dispatchServiceAddress}
                  onChange={(e) => setDispatchServiceAddress(e.target.value)}
                />
              </div>
            </div>

            {/* Gate Code & Equipment */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-border/50">
              <div>
                <Input
                  label="Gate / Access / Lockbox Code"
                  placeholder="e.g. #3842 or Keybox 4"
                  value={dispatchGateCode}
                  onChange={(e) => setDispatchGateCode(e.target.value)}
                />
              </div>

              {activeJobForDispatch?.equipment ? (
                <div className="flex flex-col justify-end">
                  <div className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-300 text-xs font-semibold">
                    <Wrench className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                    <span>
                      Unit: <strong className="text-sky-200">{activeJobForDispatch.equipment.name}</strong> ({activeJobForDispatch.equipment.brand})
                    </span>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Editable Reported Issue / Problem description */}
            <div className="pt-2 border-t border-border/50">
              <Input
                label="Reported Issue & Symptoms (Editable)"
                placeholder="e.g. AC stopped cooling, blowing warm air"
                value={dispatchReportedIssue}
                onChange={(e) => setDispatchReportedIssue(e.target.value)}
              />
            </div>
          </div>

          {/* Urgency & Priority Selector */}
          <div>
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
              Urgency & Priority Level
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setJobPriority('EMERGENCY')}
                className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                  jobPriority === 'EMERGENCY'
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500 shadow-sm shadow-rose-950'
                    : 'bg-surface border-border text-slate-400 hover:text-white'
                }`}
              >
                <Flame className="w-3.5 h-3.5 text-rose-400" />
                Emergency
              </button>
              <button
                type="button"
                onClick={() => setJobPriority('HIGH')}
                className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                  jobPriority === 'HIGH'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500 shadow-sm shadow-amber-950'
                    : 'bg-surface border-border text-slate-400 hover:text-white'
                }`}
              >
                <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                High Priority
              </button>
              <button
                type="button"
                onClick={() => setJobPriority('NORMAL')}
                className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                  jobPriority === 'NORMAL'
                    ? 'bg-primary/20 text-accent border-primary shadow-sm shadow-primary-glow'
                    : 'bg-surface border-border text-slate-400 hover:text-white'
                }`}
              >
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Standard
              </button>
            </div>
          </div>

          {/* AI Technician Match Recommendation */}
          {isLoadingRecommendation ? (
            <div className="p-3 rounded-xl bg-surface border border-border text-xs text-muted flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
              <span>Elijah Dispatcher calculating optimal technician match...</span>
            </div>
          ) : aiRecommendation ? (
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-primary/20 via-blue-500/10 to-transparent border border-primary/40 flex items-center justify-between gap-3 shadow-sm">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-primary/25 border border-primary/40 flex items-center justify-center text-primary shrink-0">
                  <Sparkles className="w-4 h-4 fill-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">Elijah AI Match: {aiRecommendation.technician?.name}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                      Top Match
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-0.5">
                    {aiRecommendation.why} · {aiRecommendation.distanceMiles} mi away · {aiRecommendation.jobsThatDay} job(s) today
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (aiRecommendation.technician?.id) {
                    setAssignedTechId(aiRecommendation.technician.id);
                  }
                }}
                className="px-3 py-1.5 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-md transition-all shrink-0 flex items-center gap-1"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Apply Match
              </button>
            </div>
          ) : null}

          {/* Select Field Technician */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Assign Field Technician *
              </label>
              <span className="text-[11px] text-muted">
                {sortedTechnicians.filter((t) => t.role?.slug === 'technician').length} certified tech(s) available
              </span>
            </div>
            <select
              value={assignedTechId}
              onChange={(e) => setAssignedTechId(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 bg-surface border border-border rounded-xl text-xs text-white focus:outline-none focus:border-primary"
            >
              <option value="">-- Choose Field Technician --</option>
              {sortedTechnicians.map((t) => {
                const isCertifiedTech =
                  t.role?.slug === 'technician' || t.role?.name?.toLowerCase().includes('tech');
                return (
                  <option key={t.id} value={t.id}>
                    {isCertifiedTech ? '⚡ ' : '👤 '}
                    {t.name} ({t.role?.name || 'Technician'})
                  </option>
                );
              })}
            </select>

            {selectedTechObj && (
              <div className="mt-2 flex items-center justify-between p-2.5 rounded-xl bg-surface border border-border text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-primary/20 border border-primary/40 flex items-center justify-center font-bold text-accent text-xs">
                    {selectedTechObj.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-white">{selectedTechObj.name}</p>
                    <p className="text-[11px] text-muted">
                      {selectedTechObj.email}{' '}
                      {selectedTechObj.phone ? `· ${selectedTechObj.phone}` : ''}
                    </p>
                  </div>
                </div>
                <span
                  className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                    selectedTechObj.role?.slug === 'technician'
                      ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                      : 'bg-slate-700/50 text-slate-300 border-border'
                  }`}
                >
                  {selectedTechObj.role?.name}
                </span>
              </div>
            )}
          </div>

          {/* Scheduled Arrival Window Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Scheduled Arrival Window *
              </label>
              <span className="text-[11px] text-muted">Customer 2-4 hour appointment window</span>
            </div>

            {/* 1-Click Customer Preference Banner */}
            {detectedWindow && (
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>
                    <strong>Customer Requested:</strong> {detectedWindow}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const lower = detectedWindow.toLowerCase();
                    if (lower.includes('morning') || lower.includes('8:00')) {
                      setJobStartTime('08:00');
                      setJobEndTime('12:00');
                    } else if (lower.includes('afternoon') || lower.includes('12:00')) {
                      setJobStartTime('12:00');
                      setJobEndTime('16:00');
                    } else if (
                      lower.includes('evening') ||
                      lower.includes('4:00') ||
                      lower.includes('16:00')
                    ) {
                      setJobStartTime('16:00');
                      setJobEndTime('20:00');
                    }
                  }}
                  className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px] transition-colors"
                >
                  Apply Window
                </button>
              </div>
            )}

            {/* Quick Preset Buttons */}
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setJobStartTime('08:00');
                  setJobEndTime('12:00');
                }}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-colors ${
                  jobStartTime === '08:00' && jobEndTime === '12:00'
                    ? 'bg-primary/20 text-accent border-primary'
                    : 'bg-surface text-slate-300 border-border hover:bg-surface-elevated'
                }`}
              >
                Morning (8 AM - 12 PM)
              </button>
              <button
                type="button"
                onClick={() => {
                  setJobStartTime('12:00');
                  setJobEndTime('16:00');
                }}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-colors ${
                  jobStartTime === '12:00' && jobEndTime === '16:00'
                    ? 'bg-primary/20 text-accent border-primary'
                    : 'bg-surface text-slate-300 border-border hover:bg-surface-elevated'
                }`}
              >
                Afternoon (12 PM - 4 PM)
              </button>
              <button
                type="button"
                onClick={() => {
                  setJobStartTime('16:00');
                  setJobEndTime('20:00');
                }}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-colors ${
                  jobStartTime === '16:00' && jobEndTime === '20:00'
                    ? 'bg-primary/20 text-accent border-primary'
                    : 'bg-surface text-slate-300 border-border hover:bg-surface-elevated'
                }`}
              >
                Evening (4 PM - 8 PM)
              </button>
              <button
                type="button"
                onClick={() => {
                  const now = new Date();
                  const startH = String(now.getHours()).padStart(2, '0');
                  const startM = String(now.getMinutes()).padStart(2, '0');
                  const endH = String((now.getHours() + 2) % 24).padStart(2, '0');
                  setJobStartTime(`${startH}:${startM}`);
                  setJobEndTime(`${endH}:${startM}`);
                }}
                className="px-2.5 py-1 rounded-lg text-[11px] font-semibold border border-rose-500/30 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 transition-colors"
              >
                ⚡ ASAP (Next 2 Hours)
              </button>
            </div>

            {/* Date and Time Window Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div>
                <label className="text-[11px] font-bold text-muted block mb-1">
                  Dispatch Date
                </label>
                <Input
                  type="date"
                  required
                  value={dispatchDate}
                  onChange={(e) => setDispatchDate(e.target.value)}
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-muted block mb-1">
                  Start Window
                </label>
                <Input
                  type="time"
                  required
                  value={jobStartTime}
                  onChange={(e) => setJobStartTime(e.target.value)}
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-muted block mb-1">
                  End Window
                </label>
                <Input
                  type="time"
                  required
                  value={jobEndTime}
                  onChange={(e) => setJobEndTime(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Special Technician Field Instructions */}
          <div>
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
              Special Technician Field Instructions (Optional)
            </label>
            <textarea
              rows={2}
              value={jobNotes}
              onChange={(e) => setJobNotes(e.target.value)}
              placeholder="e.g. Check rooftop disconnect breaker first, customer will leave side gate unlocked."
              className="w-full px-3.5 py-2.5 bg-surface border border-border rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-primary resize-none"
            />
            <p className="text-[11px] text-muted mt-1">
              Will be instantly visible to the technician on their Mobile Field Portal.
            </p>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-border">
            <span className="text-[11px] text-muted hidden sm:inline">
              Sends live SMS tracking notification to customer upon dispatch.
            </span>
            <div className="flex items-center gap-3 ml-auto">
              <Button type="button" variant="ghost" onClick={() => setIsDispatchModalOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                isLoading={isSubmitting}
                className="bg-primary hover:bg-primary-hover shadow-lg shadow-primary-glow font-bold"
              >
                <Truck className="w-4 h-4 mr-1.5" />
                {activeJobForDispatch?.status === 'UNSCHEDULED' ? 'Confirm Dispatch' : 'Update & Reassign'}
              </Button>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default function SchedulePage() {
  return (
    <Suspense
      fallback={
        <div className="h-full w-full flex items-center justify-center p-8 text-xs text-muted">
          <Loader2 className="w-5 h-5 animate-spin mr-2 text-primary" />
          Loading schedule board & swimlanes...
        </div>
      }
    >
      <ScheduleContent />
    </Suspense>
  );
}
