'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Badge } from '@/components/ui/badge';
import {
  Briefcase,
  Layers,
  Search,
  Plus,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Send,
  MessageSquare,
  Wrench,
  Flame,
  Check,
  X,
  FileText,
  Calendar,
  Building,
  DollarSign,
  Truck,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Filter,
  RefreshCw,
  Zap,
} from 'lucide-react';

export type ProjectStage = 'Deposit' | 'Permit' | 'Equipment' | 'Install' | 'Inspection' | 'Complete';

export interface ProjectMilestone {
  label: string;
  stage: ProjectStage;
  isComplete: boolean;
  completedAt?: string;
  notes?: string;
}

export interface ProjectItem {
  id: string;
  projectNumber: string; // e.g. "PRJ-302"
  title: string;
  customerName: string;
  customerPhone: string;
  serviceAddress: string;
  value: number;
  stage: ProjectStage;
  progressPct: number;
  tradeType: 'HVAC' | 'ELECTRICAL' | 'PLUMBING';
  assignedCrew: string;
  permitNumber?: string;
  equipmentModel: string;
  lastElijahAction: string;
  lastActionTime: string;
  milestones: ProjectMilestone[];
  timelineMessages: Array<{
    timestamp: string;
    channel: 'SMS' | 'PERMIT_PORTAL' | 'CREW_DISPATCH';
    message: string;
  }>;
}

const INITIAL_PROJECTS: ProjectItem[] = [
  {
    id: 'prj-302',
    projectNumber: 'PRJ-302',
    title: 'AC + furnace replacement — Ray Okafor',
    customerName: 'Ray Okafor',
    customerPhone: '(480) 555-0144',
    serviceAddress: '1725 E Camelback Rd, Phoenix, AZ 85016',
    value: 16750,
    stage: 'Permit',
    progressPct: 40,
    tradeType: 'HVAC',
    assignedCrew: 'Marcus Vance & Tyler Brooks (Crew A)',
    permitNumber: 'PHX-MECH-2026-9041',
    equipmentModel: 'Carrier Infinity 18 SEER2 Variable Speed Inverter (5-Ton)',
    lastElijahAction: 'Submitted mechanical permit application to City of Phoenix Building Dept.',
    lastActionTime: '2 hours ago',
    milestones: [
      { label: 'Deposit Paid (50%)', stage: 'Deposit', isComplete: true, completedAt: 'Nov 20 · $8,375.00' },
      { label: 'City Permit Filed', stage: 'Permit', isComplete: true, completedAt: 'Today 10:15 AM · App #9041' },
      { label: 'Equipment Delivery', stage: 'Equipment', isComplete: false, notes: 'ETA Tuesday from Carrier Tempe warehouse' },
      { label: 'Installation Day', stage: 'Install', isComplete: false, notes: 'Scheduled for Thursday 7:30 AM' },
      { label: 'City Inspection & Sign-off', stage: 'Inspection', isComplete: false },
    ],
    timelineMessages: [
      {
        timestamp: 'Nov 20, 2:15 PM',
        channel: 'SMS',
        message: 'Deposit confirmed! Ray, we have locked in your Carrier Infinity 18 installation project (PRJ-302). Elijah is now coordinating city permit filings.',
      },
      {
        timestamp: 'Today, 10:15 AM',
        channel: 'PERMIT_PORTAL',
        message: 'Elijah submitted digital permit filing to City of Phoenix Building Department portal (Plan Review #PHX-MECH-2026-9041).',
      },
      {
        timestamp: 'Today, 10:18 AM',
        channel: 'SMS',
        message: 'Hi Ray! Quick update from Vanguard: your city mechanical permit has been submitted. Equipment delivery is on track for Tuesday.',
      },
    ],
  },
  {
    id: 'prj-301',
    projectNumber: 'PRJ-301',
    title: 'Heat pump replacement — Jane Miller',
    customerName: 'Jane Miller',
    customerPhone: '(602) 555-0812',
    serviceAddress: '8814 E Mountain View Rd, Scottsdale, AZ 85258',
    value: 14995,
    stage: 'Install',
    progressPct: 80,
    tradeType: 'HVAC',
    assignedCrew: 'Carlos Mendez & David R. (Crew B)',
    permitNumber: 'SCT-HVAC-2026-4412',
    equipmentModel: 'Trane XV20i TruComfort High-Efficiency Heat Pump (4-Ton)',
    lastElijahAction: 'Sent install day preparation checklist. Crane lift confirmed for 8:00 AM.',
    lastActionTime: 'Yesterday, 4:30 PM',
    milestones: [
      { label: 'Deposit Paid (50%)', stage: 'Deposit', isComplete: true, completedAt: 'Nov 18 · $7,497.50' },
      { label: 'City Permit Approved', stage: 'Permit', isComplete: true, completedAt: 'Nov 19 · Permit #4412' },
      { label: 'Equipment Staged', stage: 'Equipment', isComplete: true, completedAt: 'Nov 21 · Staged in Bay 3' },
      { label: 'Installation Day', stage: 'Install', isComplete: true, completedAt: 'Today 8:00 AM · Crane on site' },
      { label: 'City Inspection & Sign-off', stage: 'Inspection', isComplete: false, notes: 'Inspector window: Tomorrow 1-3 PM' },
    ],
    timelineMessages: [
      {
        timestamp: 'Nov 19, 11:00 AM',
        channel: 'PERMIT_PORTAL',
        message: 'Scottsdale Municipal Development approved mechanical permit #SCT-HVAC-2026-4412.',
      },
      {
        timestamp: 'Nov 21, 2:00 PM',
        channel: 'SMS',
        message: 'Jane, your Trane XV20i system has arrived and inspected at our shop. Crane lift and install crew are confirmed for 8:00 AM!',
      },
      {
        timestamp: 'Today, 7:45 AM',
        channel: 'CREW_DISPATCH',
        message: 'Crew B (Carlos & David) checked in on-site. Roof crane positioning in progress.',
      },
    ],
  },
  {
    id: 'prj-300',
    projectNumber: 'PRJ-300',
    title: '200A Electrical Main Service Upgrade — Ellen Fischer',
    customerName: 'Ellen Fischer',
    customerPhone: '(602) 555-0921',
    serviceAddress: '312 E Coronado Rd, Phoenix, AZ 85004',
    value: 3850,
    stage: 'Inspection',
    progressPct: 90,
    tradeType: 'ELECTRICAL',
    assignedCrew: 'Leon Vance (Master Electrician)',
    permitNumber: 'PHX-ELEC-2026-1184',
    equipmentModel: 'Square D QO 200A 40-Space Outdoor All-In-One Load Center',
    lastElijahAction: 'APS utility disconnect/reconnect signed off. City inspection scheduled.',
    lastActionTime: 'Nov 21, 1:15 PM',
    milestones: [
      { label: 'Deposit Paid (50%)', stage: 'Deposit', isComplete: true, completedAt: 'Nov 14 · $1,925.00' },
      { label: 'City Permit Approved', stage: 'Permit', isComplete: true, completedAt: 'Nov 15 · #1184' },
      { label: 'Equipment Staged', stage: 'Equipment', isComplete: true, completedAt: 'Nov 16' },
      { label: 'Installation Day', stage: 'Install', isComplete: true, completedAt: 'Nov 18 · Completed' },
      { label: 'City Inspection & Sign-off', stage: 'Inspection', isComplete: false, notes: 'Inspector scheduled for Wed 9 AM' },
    ],
    timelineMessages: [
      {
        timestamp: 'Nov 18, 4:30 PM',
        channel: 'CREW_DISPATCH',
        message: 'Leon completed new 200A panel, ground rod copper bonding, and APS meter re-seat.',
      },
      {
        timestamp: 'Nov 19, 9:00 AM',
        channel: 'SMS',
        message: 'Ellen, your new 200-amp electrical service is fully energized! City of Phoenix inspection is booked for Wednesday.',
      },
    ],
  },
  {
    id: 'prj-299',
    projectNumber: 'PRJ-299',
    title: 'Commercial Walk-in Chiller Overhaul — David Miller',
    customerName: 'David Miller',
    customerPhone: '(602) 555-0188',
    serviceAddress: '5110 S 48th St, Tempe, AZ 85282',
    value: 12145,
    stage: 'Equipment',
    progressPct: 60,
    tradeType: 'HVAC',
    assignedCrew: 'Marcus Vance & Sam K.',
    permitNumber: 'TMP-COM-2026-0812',
    equipmentModel: 'Copeland Dual Scroll Semi-Hermetic Condensing Units (R448A)',
    lastElijahAction: 'Carrier distributor confirmed shipment arriving at shop Tuesday morning.',
    lastActionTime: 'Nov 21, 9:20 AM',
    milestones: [
      { label: 'Deposit Paid (50%)', stage: 'Deposit', isComplete: true, completedAt: 'Nov 15 · $6,072.50' },
      { label: 'City Permit Approved', stage: 'Permit', isComplete: true, completedAt: 'Nov 17 · #0812' },
      { label: 'Equipment Delivery', stage: 'Equipment', isComplete: true, completedAt: 'Nov 21 · Tracking confirmed' },
      { label: 'Installation Day', stage: 'Install', isComplete: false, notes: 'Night installation planned 10 PM' },
      { label: 'City Inspection & Sign-off', stage: 'Inspection', isComplete: false },
    ],
    timelineMessages: [
      {
        timestamp: 'Nov 17, 3:00 PM',
        channel: 'SMS',
        message: 'David, Tempe commercial mechanical permit #0812 has been issued. Compressors arrive Tuesday for Wednesday night swap.',
      },
    ],
  },
];

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectItem[]>(INITIAL_PROJECTS);
  const [selectedStage, setSelectedStage] = useState<string>('All');
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);

  // Filter projects
  const filteredProjects = projects.filter((p) => {
    const matchesStage = selectedStage === 'All' || p.stage === selectedStage;
    const matchesSearch =
      p.projectNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.serviceAddress.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStage && matchesSearch;
  });

  const totalValue = projects.reduce((acc, p) => acc + p.value, 0);

  // Advance stage simulation
  const handleAdvanceStage = (projectId: string) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === projectId) {
          let nextStage: ProjectStage = 'Complete';
          let nextProgress = 100;

          if (p.stage === 'Deposit') {
            nextStage = 'Permit';
            nextProgress = 40;
          } else if (p.stage === 'Permit') {
            nextStage = 'Equipment';
            nextProgress = 60;
          } else if (p.stage === 'Equipment') {
            nextStage = 'Install';
            nextProgress = 80;
          } else if (p.stage === 'Install') {
            nextStage = 'Inspection';
            nextProgress = 90;
          } else if (p.stage === 'Inspection') {
            nextStage = 'Complete';
            nextProgress = 100;
          }

          const updatedMilestones = p.milestones.map((m) =>
            m.stage === p.stage ? { ...m, isComplete: true, completedAt: 'Just now' } : m
          );

          const newTimelineMsg = {
            timestamp: 'Just now',
            channel: 'SMS' as const,
            message: `Hi ${p.customerName.split(' ')[0]}, Elijah here! Your project has advanced to ${nextStage}. We will keep you posted on the next milestone.`,
          };

          return {
            ...p,
            stage: nextStage,
            progressPct: nextProgress,
            milestones: updatedMilestones,
            lastElijahAction: `Advanced project to ${nextStage} and texted customer update.`,
            lastActionTime: 'Just now',
            timelineMessages: [newTimelineMsg, ...p.timelineMessages],
          };
        }
        return p;
      })
    );

    if (selectedProject && selectedProject.id === projectId) {
      setSelectedProject(null);
    }

    setActionNotice('Project milestone advanced! Customer notified via automated SMS.');
    setTimeout(() => setActionNotice(null), 3500);
  };

  const handleSendUpdateSMS = (project: ProjectItem) => {
    setActionNotice(`SMS project status update sent to ${project.customerName} (${project.customerPhone})`);
    setTimeout(() => setActionNotice(null), 3500);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Toast Notification */}
      {actionNotice && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-surface-elevated/95 backdrop-blur-md border border-primary/40 text-white px-5 py-3 rounded-2xl shadow-xl shadow-black/40 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0">
            <Check className="w-3.5 h-3.5 stroke-[3]" />
          </div>
          <span className="text-sm font-medium">{actionNotice}</span>
        </div>
      )}

      {/* Header Banner matching demo screenshot */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/80">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Install & project coordination</h1>
          <p className="text-sm text-slate-300 mt-1">
            Accepted replacement estimates become projects. Elijah keeps the customer informed at every stage.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Active Project Pipeline</div>
            <div className="text-lg font-bold text-white font-mono">${totalValue.toLocaleString()}</div>
          </div>

          <Button
            size="sm"
            onClick={() => setIsNewProjectModalOpen(true)}
            className="bg-primary hover:bg-primary-hover text-white text-xs h-10 px-5 rounded-xl shadow-md shadow-primary-glow/20"
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            New Project
          </Button>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          {['All', 'Deposit', 'Permit', 'Equipment', 'Install', 'Inspection', 'Complete'].map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStage(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                selectedStage === st
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30 font-semibold'
                  : 'bg-surface-elevated/70 text-slate-300 hover:text-white hover:bg-surface-elevated border border-border/60'
              }`}
            >
              {st === 'All' ? 'All Projects' : st}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search projects, customers, permits..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 bg-surface-elevated/80 border border-border rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      {/* Projects Table matching the demo screenshot */}
      <div className="rounded-2xl bg-surface-card border border-border/80 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface/70 border-b border-border/70 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-5 min-w-[320px]">Project</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Value</th>
                <th className="py-3 px-4">Stage</th>
                <th className="py-3 px-5 min-w-[200px]">Progress</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 text-xs">
              {filteredProjects.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted">
                    <Briefcase className="w-8 h-8 mx-auto text-slate-600 mb-2 opacity-50" />
                    <p className="font-medium text-slate-300">No active projects match this stage</p>
                    <p className="text-[11px] text-slate-500 mt-1">Try selecting &ldquo;All Projects&rdquo;.</p>
                  </td>
                </tr>
              ) : (
                filteredProjects.map((p) => (
                  <tr
                    key={p.id}
                    className="hover:bg-surface-elevated/40 transition-colors group cursor-pointer"
                    onClick={() => setSelectedProject(p)}
                  >
                    {/* Project Title */}
                    <td className="py-4 px-5">
                      <div className="font-bold text-white text-xs group-hover:text-primary transition-colors">
                        {p.title}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
                        <span>{p.equipmentModel}</span>
                        <span>·</span>
                        <span className="font-mono text-slate-500">{p.assignedCrew}</span>
                      </div>
                    </td>

                    {/* Customer */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="text-white font-medium">{p.customerName}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{p.customerPhone}</div>
                    </td>

                    {/* Value */}
                    <td className="py-4 px-4 whitespace-nowrap font-mono font-bold text-white">
                      ${p.value.toLocaleString()}
                    </td>

                    {/* Stage Badge */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider ${
                          p.stage === 'Permit'
                            ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                            : p.stage === 'Equipment'
                            ? 'bg-purple-500/15 text-purple-400 border border-purple-500/30'
                            : p.stage === 'Install'
                            ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                            : p.stage === 'Inspection'
                            ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                            : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        }`}
                      >
                        {p.stage}
                      </span>
                    </td>

                    {/* Progress Bar (Matching Demo Screenshot) */}
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden border border-slate-700/60">
                          <div
                            className="bg-blue-600 h-full rounded-full transition-all duration-300"
                            style={{ width: `${p.progressPct}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-mono font-semibold text-slate-400 w-8">
                          {p.progressPct}%
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-1 truncate">
                        Last: <span className="text-slate-300">{p.lastElijahAction}</span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleSendUpdateSMS(p)}
                          title="Send Status Update SMS to Homeowner"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-surface-elevated transition-colors"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
                        </button>

                        <button
                          onClick={() => setSelectedProject(p)}
                          className="px-2.5 py-1 rounded-lg border border-border bg-surface text-slate-300 hover:text-white hover:border-primary/60 hover:bg-surface-elevated text-xs font-medium transition-all"
                        >
                          Details
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Project Coordination Details Modal */}
      {selectedProject && (
        <Modal
          isOpen={!!selectedProject}
          onClose={() => setSelectedProject(null)}
          title={`Project Coordination · ${selectedProject.projectNumber}`}
          className="max-w-3xl"
        >
          <div className="space-y-6 text-xs text-slate-300">
            {/* Top Identity Card */}
            <div className="p-4 rounded-xl bg-surface-elevated border border-border/80 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-white text-base">{selectedProject.title}</h3>
                <p className="text-slate-400 text-xs mt-0.5">{selectedProject.serviceAddress}</p>
                <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                  <span>Customer: <strong className="text-white">{selectedProject.customerName}</strong></span>
                  <span>·</span>
                  <span>Phone: <strong className="text-white font-mono">{selectedProject.customerPhone}</strong></span>
                </div>
              </div>

              <div className="text-right">
                <div className="text-[10px] uppercase font-semibold text-slate-400">Total Contract Value</div>
                <div className="text-xl font-bold text-white font-mono">${selectedProject.value.toLocaleString()}</div>
                <div className="text-[10px] text-emerald-400 font-semibold mt-0.5">50% Deposit Secured</div>
              </div>
            </div>

            {/* 5-Stage Milestone Tracker */}
            <div className="space-y-2">
              <div className="text-slate-400 uppercase text-[10px] font-bold tracking-wider">
                Installation Milestones & Verification
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                {selectedProject.milestones.map((m, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border flex flex-col justify-between ${
                      m.isComplete
                        ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300'
                        : selectedProject.stage === m.stage
                        ? 'bg-blue-950/30 border-blue-500/50 text-blue-200 ring-1 ring-blue-500/30'
                        : 'bg-surface border-border text-slate-500'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[9px] font-bold uppercase font-mono">Step {idx + 1}</span>
                        {m.isComplete ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        ) : selectedProject.stage === m.stage ? (
                          <Clock className="w-3.5 h-3.5 text-blue-400 animate-spin" />
                        ) : (
                          <span className="w-3 h-3 rounded-full border border-slate-600 inline-block" />
                        )}
                      </div>
                      <div className="font-bold text-xs leading-snug">{m.label}</div>
                    </div>

                    <div className="text-[10px] mt-2 font-mono text-slate-400">
                      {m.completedAt || m.notes || 'Pending'}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Elijah Autonomous Activity Feed */}
            <div className="p-4 rounded-xl bg-surface border border-border/80 space-y-3">
              <div className="flex items-center justify-between text-xs pb-1 border-b border-border/70">
                <div className="flex items-center gap-2 font-bold text-white">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  Elijah Project Coordinator Log
                </div>
                <Badge variant="outline" className="border-blue-500/30 text-blue-400 bg-blue-500/10 text-[10px]">
                  Autonomous Customer Updates
                </Badge>
              </div>

              <div className="space-y-2.5 max-h-[160px] overflow-y-auto pr-1">
                {selectedProject.timelineMessages.map((msg, i) => (
                  <div key={i} className="p-2.5 rounded-lg bg-surface-elevated/70 border border-border/60 text-xs space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                      <span className="text-blue-400 font-semibold">{msg.channel}</span>
                      <span>{msg.timestamp}</span>
                    </div>
                    <p className="text-slate-200 text-[11px] leading-relaxed">{msg.message}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border/80">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSendUpdateSMS(selectedProject)}
                className="border-border text-slate-300 text-xs h-9"
              >
                <MessageSquare className="w-3.5 h-3.5 mr-1.5 text-blue-400" />
                Text Customer Update
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedProject(null)}
                  className="text-xs h-9"
                >
                  Close
                </Button>

                {selectedProject.stage !== 'Complete' && (
                  <Button
                    size="sm"
                    onClick={() => handleAdvanceStage(selectedProject.id)}
                    className="bg-blue-600 hover:bg-blue-500 text-white text-xs h-9 shadow-md shadow-blue-600/30"
                  >
                    <ArrowRight className="w-3.5 h-3.5 mr-1.5" />
                    Advance to Next Stage
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* New Project Modal */}
      {isNewProjectModalOpen && (
        <Modal
          isOpen={isNewProjectModalOpen}
          onClose={() => setIsNewProjectModalOpen(false)}
          title="Create New Installation Project"
          className="max-w-xl"
        >
          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-400 mb-1 text-[11px] font-medium">Customer Full Name</label>
              <input
                type="text"
                placeholder="e.g. Thomas Wayne"
                className="w-full px-3 py-2 bg-surface border border-border rounded-xl text-white text-xs focus:outline-none focus:border-primary"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1 text-[11px] font-medium">Phone Number</label>
                <input
                  type="text"
                  placeholder="(480) 555-0199"
                  className="w-full px-3 py-2 bg-surface border border-border rounded-xl text-white text-xs focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1 text-[11px] font-medium">Contract Value ($)</label>
                <input
                  type="number"
                  placeholder="14500"
                  className="w-full px-3 py-2 bg-surface border border-border rounded-xl text-white text-xs focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-1 text-[11px] font-medium">Service Address</label>
              <input
                type="text"
                placeholder="e.g. 5402 E Shea Blvd, Scottsdale, AZ 85254"
                className="w-full px-3 py-2 bg-surface border border-border rounded-xl text-white text-xs focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 text-[11px] font-medium">Equipment System Model</label>
              <input
                type="text"
                placeholder="e.g. Trane Performance 16 SEER2 Heat Pump Replacement"
                className="w-full px-3 py-2 bg-surface border border-border rounded-xl text-white text-xs focus:outline-none focus:border-primary"
              />
            </div>

            <div className="p-3 rounded-xl bg-surface-elevated/70 border border-border/80 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Elijah Autonomous Customer SMS Updates:</span>
              <span className="text-emerald-400 font-mono font-semibold">ENABLED</span>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-border/80">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsNewProjectModalOpen(false)}
                className="text-xs h-9"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  setIsNewProjectModalOpen(false);
                  setActionNotice('Installation project PRJ-303 created! Deposit invoice generated.');
                  setTimeout(() => setActionNotice(null), 3500);
                }}
                className="bg-primary hover:bg-primary-hover text-white text-xs h-9 shadow-md shadow-primary-glow/20"
              >
                Create Project
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
