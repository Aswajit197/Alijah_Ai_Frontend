'use client';

import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  MapPin,
  Clock,
  Wrench,
  CheckCircle,
  FileText,
  Navigation,
  Phone,
  Camera,
  AlertCircle,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { apiRequest } from '@/lib/api';

interface ActiveJob {
  id: string;
  jobNumber?: string;
  title: string;
  status: string;
  priority: string;
  scheduledStart?: string;
  scheduledEnd?: string;
  serviceAddress?: string;
  gateCode?: string;
  reportedIssue?: string;
  notes?: string;
  customer?: {
    id: string;
    name: string;
    companyName?: string;
    phone: string;
    address?: string;
    city?: string;
    state?: string;
    gateCode?: string;
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
  };
}

export default function TechPortalPage() {
  const [job, setJob] = useState<ActiveJob | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [fieldNotes, setFieldNotes] = useState('');

  const loadActiveJob = async () => {
    setIsLoading(true);
    try {
      const active = await apiRequest<ActiveJob | null>('/jobs/active-tech');
      setJob(active);
      if (active?.notes) {
        setFieldNotes(active.notes);
      }
    } catch (err: any) {
      console.error('Failed to load active job:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadActiveJob();
  }, []);

  const handleStatusChange = async (newStatus: string) => {
    if (!job) return;
    setIsUpdating(true);
    try {
      await apiRequest(`/jobs/${job.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
      loadActiveJob();
    } catch (err: any) {
      alert(`Error updating job: ${err.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSaveNotes = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!job) return;
    setIsUpdating(true);
    try {
      await apiRequest(`/jobs/${job.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ notes: fieldNotes }),
      });
      setIsNotesModalOpen(false);
      loadActiveJob();
    } catch (err: any) {
      alert(`Error saving notes: ${err.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const startTime = job?.scheduledStart
    ? new Date(job.scheduledStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '11:30 AM';
  const endTime = job?.scheduledEnd
    ? new Date(job.scheduledEnd).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '1:30 PM';

  const customerName = job?.customer?.companyName || job?.customer?.name || 'Henderson Medical Clinic';
  const address = job?.serviceAddress || job?.customer?.address || '840 Sunridge Heights Pkwy, Henderson, NV';
  const gateCode = job?.gateCode || job?.customer?.gateCode || '#3842 (Building C)';
  const phone = job?.customer?.phone || '(702) 555-0144';

  const getStatusText = (s?: string) => {
    switch (s) {
      case 'EN_ROUTE':
        return 'On Route to Job';
      case 'ON_SITE':
        return 'On Site / Diagnostic in Progress';
      case 'COMPLETED':
        return 'Work Completed';
      default:
        return 'Dispatched';
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[11px] font-mono text-emerald-400 font-semibold uppercase tracking-wider">
            Mobile Field App
          </span>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-emerald-400" />
            <span>Technician Live Dispatch</span>
          </h1>
        </div>

        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 animate-pulse">
          {getStatusText(job?.status)}
        </span>
      </div>

      {isLoading ? (
        <div className="py-20 text-center text-muted text-xs">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 animate-pulse mx-auto mb-3" />
          Loading assigned work order...
        </div>
      ) : !job ? (
        <div className="p-8 rounded-3xl bg-surface border border-border text-center space-y-3">
          <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
          <h3 className="font-bold text-white text-base">All Caught Up!</h3>
          <p className="text-xs text-muted">No active work orders currently dispatched to your queue.</p>
        </div>
      ) : (
        /* Active Job Card */
        <div className="p-5 sm:p-6 rounded-3xl bg-surface/95 border border-border space-y-5 shadow-2xl">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div>
              <span className="text-[10px] font-mono text-muted uppercase">Active Work Order</span>
              <h2 className="text-base font-bold text-white">
                {job.jobNumber || 'JOB-9041'} · {customerName}
              </h2>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-ai flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>{startTime} – {endTime}</span>
              </span>
            </div>
          </div>

          {/* Location & Navigation */}
          <div className="p-3.5 rounded-2xl bg-surface-card border border-border/80 space-y-2.5">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2 text-xs text-white font-medium">
                  <MapPin className="w-4 h-4 text-rose-400 shrink-0" />
                  <span className="truncate">{address}</span>
                </div>
                {gateCode && (
                  <div className="text-xs text-amber-400 font-mono font-semibold pl-6">
                    Gate / Access: {gateCode}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <a
                  href={`tel:${phone}`}
                  className="p-2 rounded-xl bg-surface-elevated hover:bg-border text-slate-300 hover:text-white border border-border transition-colors"
                  title="Call Customer"
                >
                  <Phone className="w-3.5 h-3.5" />
                </a>

                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-elevated hover:bg-border text-xs font-medium text-ai border border-border transition-colors"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Navigate</span>
                </a>
              </div>
            </div>
          </div>

          {/* Customer Live Tracking Link */}
          <div className="p-3 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-between text-xs">
            <div>
              <span className="font-semibold text-sky-200">Customer Live Tracking Link</span>
              <p className="text-[11px] text-sky-300/80">Homeowner / facility manager tracking view</p>
            </div>
            <a
              href={`/track/${job.id}`}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-200 border border-sky-500/30 font-semibold flex items-center gap-1.5 text-xs transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Customer View</span>
            </a>
          </div>

          {/* Issue & Diagnostic Notes */}
          <div className="space-y-2 text-xs">
            <span className="font-bold uppercase tracking-wider text-muted text-[10px]">
              Reported Issue & Symptoms
            </span>
            <p className="p-3 rounded-xl bg-surface-elevated border border-border text-slate-300 leading-relaxed">
              {job.reportedIssue || job.title}
            </p>
          </div>

          {/* Equipment Profile */}
          {job.equipment && (
            <div className="p-3 rounded-xl bg-surface-elevated/60 border border-border flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <Wrench className="w-4 h-4 text-primary shrink-0" />
                <span className="text-slate-300 truncate">
                  {job.equipment.brand} {job.equipment.name} {job.equipment.modelNumber ? `(${job.equipment.modelNumber})` : ''} · S/N: {job.equipment.serialNumber || 'N/A'}
                </span>
              </div>
              <span className="text-[10px] text-emerald-400 font-mono font-medium shrink-0 ml-2">
                {job.equipment.warrantyStatus === 'UNDER_WARRANTY' ? 'Under Warranty' : 'Out of Warranty'}
              </span>
            </div>
          )}

          {/* Saved Field Notes */}
          {job.notes && (
            <div className="p-3 rounded-xl bg-surface-elevated/40 border border-border/60 text-xs">
              <span className="text-[10px] uppercase font-bold text-subtle block mb-1">
                Technician Field Notes:
              </span>
              <p className="text-slate-300 italic">"{job.notes}"</p>
            </div>
          )}

          {/* Quick Field Status Lifecycle Actions */}
          <div className="space-y-2.5 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="gap-2 text-xs h-11"
                onClick={() => setIsNotesModalOpen(true)}
              >
                <Camera className="w-4 h-4" />
                <span>Add Photos / Notes</span>
              </Button>

              {job.status === 'DISPATCHED' && (
                <Button
                  className="gap-2 text-xs h-11 bg-sky-600 hover:bg-sky-500 shadow-md shadow-sky-600/30"
                  isLoading={isUpdating}
                  onClick={() => handleStatusChange('EN_ROUTE')}
                >
                  <Navigation className="w-4 h-4" />
                  <span>Mark En Route</span>
                </Button>
              )}

              {job.status === 'EN_ROUTE' && (
                <Button
                  className="gap-2 text-xs h-11 bg-primary hover:bg-primary-hover shadow-md shadow-primary-glow"
                  isLoading={isUpdating}
                  onClick={() => handleStatusChange('ON_SITE')}
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Mark Arrived on Site</span>
                </Button>
              )}

              {(job.status === 'ON_SITE' || job.status === 'SCHEDULED') && (
                <Button
                  className="gap-2 text-xs h-11 bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-600/30"
                  isLoading={isUpdating}
                  onClick={() => handleStatusChange('COMPLETED')}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Complete Work Order</span>
                </Button>
              )}

              {job.status === 'COMPLETED' && (
                <div className="col-span-1 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold text-center flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Job Completed</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Field Notes Modal */}
      <Modal
        isOpen={isNotesModalOpen}
        onClose={() => setIsNotesModalOpen(false)}
        title="Field Diagnostic Notes"
        description="Record on-site findings, equipment serial verification, and diagnostic steps."
      >
        <form onSubmit={handleSaveNotes} className="space-y-4">
          <div>
            <textarea
              rows={4}
              value={fieldNotes}
              onChange={(e) => setFieldNotes(e.target.value)}
              placeholder="e.g. Suction pressure tested at 55 PSI. Evaporator coils de-iced. Thermostat sensor recalibrated."
              className="w-full p-3 bg-surface border border-border rounded-xl text-xs text-white placeholder:text-muted focus:outline-none focus:border-primary"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
            <Button type="button" variant="ghost" onClick={() => setIsNotesModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isUpdating}>
              Save Field Notes
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
