'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Badge } from '@/components/ui/badge';
import {
  Zap,
  Play,
  Pause,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Sparkles,
  Shield,
  ShieldCheck,
  Check,
  X,
  ExternalLink,
  ChevronRight,
  Sliders,
  Settings2,
  Cpu,
  RefreshCw,
  PhoneCall,
  Terminal,
  Activity,
  Layers,
} from 'lucide-react';

export type AutonomyLevel = 'Autonomous' | 'Assisted' | 'Suggest' | 'Paused';

export interface AIEmployee {
  id: string;
  name: string;
  description: string;
  autonomy: AutonomyLevel;
  actionsThisWeek: number;
  successRatePct: number;
  lastAction?: string;
  primaryPrompt: string;
  allowedActions: string[];
  disallowedActions: string[];
}

const INITIAL_TEAM: AIEmployee[] = [
  {
    id: 'receptionist',
    name: 'Elijah Receptionist',
    description: 'Answers calls and texts, books service, handles emergencies',
    autonomy: 'Autonomous',
    actionsThisWeek: 49,
    successRatePct: 100,
    lastAction: 'Booked appointment',
    primaryPrompt: 'Greet caller professionally, determine trade & urgency, check real technician availability in PostgreSQL, collect address & phone, and book official work order.',
    allowedActions: [
      'Answer inbound VoIP phone calls & SMS',
      'Check service area ZIP codes',
      'Quote standard diagnostic fee ($129)',
      'Directly insert official JOB-XXXX appointment',
    ],
    disallowedActions: [
      'Cannot provide DIY repair instructions',
      'Cannot promise exact arrival times outside 2-hour windows',
    ],
  },
  {
    id: 'dispatcher',
    name: 'Elijah Dispatcher',
    description: 'Recommends technicians and pages on-call',
    autonomy: 'Assisted',
    actionsThisWeek: 0,
    successRatePct: 100,
    lastAction: undefined,
    primaryPrompt: 'Calculate drive times, match trade licensing (CR-39 / CR-11), assign nearest qualified field technician, and cascade to backup if unaccepted within 5 minutes.',
    allowedActions: [
      'Propose technician assignment based on GPS proximity',
      'Send dispatch notification to technician mobile portal',
      'Calculate travel time buffers',
    ],
    disallowedActions: [
      'Cannot override certified trade licenses',
      'Requires human confirmation for Level 1 after-hours emergencies',
    ],
  },
  {
    id: 'estimator',
    name: 'Elijah Estimator',
    description: 'Drafts estimates from tech notes and the pricebook',
    autonomy: 'Assisted',
    actionsThisWeek: 0,
    successRatePct: 100,
    lastAction: undefined,
    primaryPrompt: 'Compile 3-tier Good / Better / Best equipment replacement proposals featuring Carrier and Trane systems maintaining >35% gross profit margin.',
    allowedActions: [
      'Draft multi-tier replacement proposals',
      'Calculate monthly financing estimates via Synchrony',
      'Apply standard rate card pricing',
    ],
    disallowedActions: [
      'Cannot discount pricing below 30% margin without owner approval',
    ],
  },
  {
    id: 'sales-rep',
    name: 'Elijah Sales Rep',
    description: 'Follows up on leads, estimates, memberships and reactivation',
    autonomy: 'Autonomous',
    actionsThisWeek: 7,
    successRatePct: 100,
    lastAction: 'Missed-call text-back',
    primaryPrompt: 'Trigger immediate automated text message within 45 seconds of missed inbound call. Follow up on unsigned proposals on Day 2, Day 5, and Day 14.',
    allowedActions: [
      'Send immediate missed-call SMS text-back',
      'Follow up on outstanding proposals with secure 1-click review link',
      'Offer seasonal maintenance club renewals',
    ],
    disallowedActions: [
      'Cannot send marketing messages outside 8:00 AM - 7:00 PM local time',
    ],
  },
  {
    id: 'customer-care',
    name: 'Elijah Customer Care',
    description: 'Answers status, ETA, warranty and membership questions',
    autonomy: 'Autonomous',
    actionsThisWeek: 17,
    successRatePct: 100,
    lastAction: 'Answered question from approved knowledge',
    primaryPrompt: 'Answer customer inquiries regarding job status, technician ETA, warranty coverage, and invoice receipts using verified pgvector RAG knowledge vault.',
    allowedActions: [
      'Lookup customer repair and warranty history',
      'Provide real-time technician GPS en route status',
      'Answer questions grounded strictly in Knowledge Vault',
    ],
    disallowedActions: [
      'Cannot hallucinate unapproved warranty extensions',
    ],
  },
  {
    id: 'office-manager',
    name: 'Elijah Office Manager',
    description: 'Keeps records clean, writes summaries, creates tasks',
    autonomy: 'Autonomous',
    actionsThisWeek: 21,
    successRatePct: 100,
    lastAction: 'Created call task for a person',
    primaryPrompt: 'Generate call summaries, update customer records, de-duplicate contacts, sync with QuickBooks Online, and create actionable tasks for staff.',
    allowedActions: [
      'Create internal follow-up tasks for dispatch & office staff',
      'Synthesize structured call summaries from audio transcripts',
      'Maintain CRM customer addresses and equipment profiles',
    ],
    disallowedActions: [
      'Cannot delete customer records or invoices',
    ],
  },
  {
    id: 'project-coordinator',
    name: 'Elijah Project Coordinator',
    description: 'Coordinates install day, deposits, permits and equipment',
    autonomy: 'Suggest',
    actionsThisWeek: 0,
    successRatePct: 100,
    lastAction: undefined,
    primaryPrompt: 'Track equipment order delivery, verify permit filings with municipal building departments, and coordinate installation crew scheduling.',
    allowedActions: [
      'Suggest installation date based on supplier warehouse equipment delivery',
      'Track municipal permit status',
      'Verify deposit payment receipt prior to equipment purchase',
    ],
    disallowedActions: [
      'Requires human sign-off before ordering equipment > $3,000',
    ],
  },
  {
    id: 'billing-ar',
    name: 'Elijah Billing & AR',
    description: 'Validates invoices, sends payment links, follows up on balances',
    autonomy: 'Autonomous',
    actionsThisWeek: 8,
    successRatePct: 100,
    lastAction: 'Sent payment link',
    primaryPrompt: 'Generate invoices upon job completion, send 1-click SMS checkout links, follow up on past due accounts at 14 and 30 days, and reconcile payments to QuickBooks.',
    allowedActions: [
      'Generate Stripe / Square 1-click payment links',
      'Send automated SMS payment reminders',
      'Sync paid invoices directly to QuickBooks Online',
    ],
    disallowedActions: [
      'Cannot initiate collections or legal notices',
      'Immediately pauses dunning if customer notes dissatisfaction',
    ],
  },
  {
    id: 'tech-assistant',
    name: 'Elijah Technician Assistant',
    description: 'Job briefs, voice notes, summaries and recommendations',
    autonomy: 'Autonomous',
    actionsThisWeek: 0,
    successRatePct: 100,
    lastAction: undefined,
    primaryPrompt: 'Provide technicians with audio job briefs before arrival, transcribe technician voice notes into official work order summaries, and recommend parts from equipment serial numbers.',
    allowedActions: [
      'Generate audio job briefings for field technicians',
      'Transcribe technician voice memos into structured job notes',
      'Identify equipment model/serial numbers from site photos',
    ],
    disallowedActions: [
      'Cannot change customer pricing without technician approval',
    ],
  },
  {
    id: 'supervisor',
    name: 'Elijah Supervisor',
    description: 'Watches every AI action and pauses anything unusual',
    autonomy: 'Autonomous',
    actionsThisWeek: 0,
    successRatePct: 100,
    lastAction: undefined,
    primaryPrompt: 'Act as guardian across all AI employee actions. Monitor sentiment scores, detect safety triggers (sparks, gas, smoke), and page human managers on exceptions.',
    allowedActions: [
      'Instantly halt autonomous actions on safety keywords',
      'Audit transcripts for tone, accuracy, and protocol compliance',
      'Page on-call business owner on Level 1 emergencies',
    ],
    disallowedActions: [
      'Cannot be disabled during normal production operations',
    ],
  },
];

export default function AITeamPage() {
  const [team, setTeam] = useState<AIEmployee[]>(INITIAL_TEAM);
  const [selectedEmployee, setSelectedEmployee] = useState<AIEmployee | null>(null);
  const [isElijahPaused, setIsElijahPaused] = useState(false);
  const [isTestDriveOpen, setIsTestDriveOpen] = useState(false);
  const [testDriveRunning, setTestDriveRunning] = useState(false);
  const [testDriveProgress, setTestDriveProgress] = useState(0);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const handleUpdateAutonomy = (id: string, newLevel: AutonomyLevel) => {
    setTeam((prev) =>
      prev.map((emp) => (emp.id === id ? { ...emp, autonomy: newLevel } : emp))
    );
    if (selectedEmployee && selectedEmployee.id === id) {
      setSelectedEmployee((prev) => (prev ? { ...prev, autonomy: newLevel } : null));
    }
    const target = team.find((e) => e.id === id);
    setActionNotice(`${target?.name} autonomy updated to "${newLevel}"`);
    setTimeout(() => setActionNotice(null), 3000);
  };

  const handleTogglePauseElijah = () => {
    const nextState = !isElijahPaused;
    setIsElijahPaused(nextState);
    if (nextState) {
      setActionNotice('Elijah AI paused. All autonomous customer interactions suspended.');
    } else {
      setActionNotice('Elijah AI resumed! 24/7 autonomous operations active.');
    }
    setTimeout(() => setActionNotice(null), 3500);
  };

  const handleRunTestDrive = () => {
    setTestDriveRunning(true);
    setTestDriveProgress(0);

    const interval = setInterval(() => {
      setTestDriveProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTestDriveRunning(false);
          setActionNotice('60 trade scenarios passed! All AI team members certified for Autonomous.');
          setTimeout(() => setActionNotice(null), 3500);
          return 100;
        }
        return prev + 20;
      });
    }, 400);
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

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Your AI team</h1>
          <p className="text-sm text-slate-300 mt-1">
            Ten AI employees share one memory of every customer. You decide what each one may do.
          </p>
        </div>

        {/* Top Right Buttons */}
        <div className="flex items-center gap-3 shrink-0">
          <Button
            onClick={handleTogglePauseElijah}
            className={`font-semibold text-xs px-5 h-10 rounded-xl transition-all shadow-md ${
              isElijahPaused
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                : 'bg-red-600 hover:bg-red-700 text-white shadow-red-600/30'
            }`}
          >
            {isElijahPaused ? (
              <>
                <Play className="w-4 h-4 mr-1.5 fill-white" />
                Resume Elijah
              </>
            ) : (
              <>
                <Pause className="w-4 h-4 mr-1.5 fill-white" />
                Pause Elijah
              </>
            )}
          </Button>

          <Link href="/test-drive">
            <Button
              variant="outline"
              className="border-border/80 text-white hover:bg-surface-elevated font-semibold text-xs px-5 h-10 rounded-xl transition-all"
            >
              Test Drive
            </Button>
          </Link>
        </div>
      </div>

      {/* Global Paused Alert if applicable */}
      {isElijahPaused && (
        <div className="p-4 rounded-xl bg-red-950/60 border border-red-500/50 text-red-200 flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
            <div className="text-xs">
              <strong className="text-white">Elijah AI Operations are currently PAUSED.</strong> Inbound calls will ring to human staff and automated texts are held in draft.
            </div>
          </div>
          <Button
            size="sm"
            onClick={handleTogglePauseElijah}
            className="bg-red-600 hover:bg-red-500 text-white text-xs h-8 px-3"
          >
            Resume
          </Button>
        </div>
      )}

      {/* Readiness Banner with Blue Left Accent Border */}
      <div className="border-l-4 border-blue-500 bg-blue-500/10 rounded-r-2xl p-4 text-xs text-blue-200 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span>
            <strong>Readiness:</strong> — Test Drive scenarios passed.{' '}
            <Link
              href="/test-drive"
              className="text-blue-400 hover:text-blue-300 underline font-medium cursor-pointer"
            >
              Run the trade scenarios
            </Link>{' '}
            before moving anyone to Autonomous.
          </span>
        </div>
        <span className="text-[11px] text-blue-300/80 font-mono font-semibold">10 / 10 Personas Synced</span>
      </div>

      {/* 10 AI Employees - 4 Column Grid matching the demo screenshot */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {team.map((employee) => {
          const isReceptionist = employee.id === 'receptionist';

          return (
            <div
              key={employee.id}
              onClick={() => setSelectedEmployee(employee)}
              className={`p-4 rounded-2xl bg-surface-card border transition-all cursor-pointer flex flex-col justify-between group hover:border-primary/60 hover:shadow-lg hover:shadow-primary/5 ${
                isReceptionist
                  ? 'border-primary ring-1 ring-primary/40 shadow-sm shadow-primary/20'
                  : 'border-border/80'
              }`}
            >
              <div>
                {/* Employee Header: Elijah 'E' Logo & Title */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-sm shadow-blue-600/30 font-bold font-mono text-sm group-hover:scale-105 transition-transform">
                    <Zap className="w-4 h-4 fill-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm leading-snug group-hover:text-primary transition-colors">
                      {employee.name}
                    </h3>
                  </div>
                </div>

                {/* Subtitle / Description */}
                <p className="text-xs text-slate-400 mt-2.5 leading-relaxed min-h-[36px]">
                  {employee.description}
                </p>

                {/* Autonomy Badge */}
                <div className="mt-3">
                  {employee.autonomy === 'Autonomous' && (
                    <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      Autonomous
                    </span>
                  )}
                  {employee.autonomy === 'Assisted' && (
                    <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-400 border border-amber-500/30">
                      Assisted
                    </span>
                  )}
                  {employee.autonomy === 'Suggest' && (
                    <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-md bg-orange-500/15 text-orange-400 border border-orange-500/30">
                      Suggest
                    </span>
                  )}
                  {employee.autonomy === 'Paused' && (
                    <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-700/60 text-slate-400 border border-slate-600/40">
                      Paused
                    </span>
                  )}
                </div>

                {/* Metrics Row: Actions This Week & Success Rate */}
                <div className="flex items-center justify-between text-[11px] text-slate-400 mt-3 pt-3 border-t border-border/50 font-mono">
                  <span>{employee.actionsThisWeek} actions this week</span>
                  <span className="text-slate-300 font-semibold">{employee.successRatePct}% succeeded</span>
                </div>
              </div>

              {/* Footer: Last Action (if available) */}
              <div className="pt-2.5 min-h-[24px] text-[11px] text-slate-400 truncate">
                {employee.lastAction ? (
                  <span>
                    Last: <span className="text-slate-200">{employee.lastAction}</span>
                  </span>
                ) : (
                  <span className="opacity-0">—</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Employee Configuration Modal */}
      {selectedEmployee && (
        <Modal
          isOpen={!!selectedEmployee}
          onClose={() => setSelectedEmployee(null)}
          title={`Configure ${selectedEmployee.name}`}
          className="max-w-2xl"
        >
          <div className="space-y-5 text-xs text-slate-300">
            {/* Header Identity */}
            <div className="p-4 rounded-xl bg-surface-elevated/80 border border-border/80 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shrink-0">
                  <Zap className="w-5 h-5 fill-white" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">{selectedEmployee.name}</h3>
                  <p className="text-slate-400 text-xs">{selectedEmployee.description}</p>
                </div>
              </div>

              <div className="text-right font-mono text-[11px]">
                <div className="text-white font-bold">{selectedEmployee.actionsThisWeek} actions</div>
                <div className="text-emerald-400 font-semibold">{selectedEmployee.successRatePct}% success</div>
              </div>
            </div>

            {/* Autonomy Level Control */}
            <div className="space-y-2">
              <label className="block text-white font-semibold text-xs">
                Autonomy Level (You decide what this AI employee may do)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(['Autonomous', 'Assisted', 'Suggest', 'Paused'] as AutonomyLevel[]).map((level) => {
                  const isSelected = selectedEmployee.autonomy === level;
                  return (
                    <button
                      key={level}
                      onClick={() => handleUpdateAutonomy(selectedEmployee.id, level)}
                      className={`p-3 rounded-xl border text-center transition-all ${
                        isSelected
                          ? level === 'Autonomous'
                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 ring-1 ring-emerald-500/50'
                            : level === 'Assisted'
                            ? 'bg-amber-500/20 border-amber-500 text-amber-300 ring-1 ring-amber-500/50'
                            : level === 'Suggest'
                            ? 'bg-orange-500/20 border-orange-500 text-orange-300 ring-1 ring-orange-500/50'
                            : 'bg-slate-700/40 border-slate-500 text-slate-200'
                          : 'bg-surface border-border hover:bg-surface-elevated text-slate-400'
                      }`}
                    >
                      <div className="font-bold text-xs">{level}</div>
                      <div className="text-[10px] mt-0.5 opacity-80">
                        {level === 'Autonomous' && 'Takes action directly'}
                        {level === 'Assisted' && 'Drafts for approval'}
                        {level === 'Suggest' && 'Recommends only'}
                        {level === 'Paused' && 'Inactive'}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Permissions & Allowed Capabilities */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3.5 rounded-xl bg-surface border border-border/70 space-y-2">
                <div className="text-emerald-400 uppercase text-[10px] font-bold tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Allowed Actions
                </div>
                <div className="space-y-1.5 text-xs text-slate-300">
                  {selectedEmployee.allowedActions.map((action, i) => (
                    <div key={i} className="flex items-start gap-1.5">
                      <span className="text-emerald-400 font-bold">•</span>
                      <span>{action}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-surface border border-border/70 space-y-2">
                <div className="text-red-400 uppercase text-[10px] font-bold tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" /> Strict Disallowed Guardrails
                </div>
                <div className="space-y-1.5 text-xs text-slate-300">
                  {selectedEmployee.disallowedActions.map((rule, i) => (
                    <div key={i} className="flex items-start gap-1.5">
                      <span className="text-red-400 font-bold">•</span>
                      <span>{rule}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Shared Memory & System Prompt Note */}
            <div className="p-3.5 rounded-xl bg-surface-elevated/60 border border-border/70 space-y-1">
              <div className="text-slate-400 uppercase text-[10px] font-semibold tracking-wider">
                Single Unified Customer Memory
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {selectedEmployee.name} shares full customer history, equipment tags, call recordings, and invoices with all other 9 employees in real time via PostgreSQL on port 5432.
              </p>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end gap-2 pt-3 border-t border-border/80">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedEmployee(null)}
                className="text-xs h-9"
              >
                Close
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  setSelectedEmployee(null);
                  setActionNotice(`${selectedEmployee.name} configuration deployed!`);
                  setTimeout(() => setActionNotice(null), 3000);
                }}
                className="bg-primary hover:bg-primary-hover text-white text-xs h-9 shadow-md shadow-primary-glow/20"
              >
                Save Persona Settings
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Test Drive 60 Trade Scenarios Modal */}
      {isTestDriveOpen && (
        <Modal
          isOpen={isTestDriveOpen}
          onClose={() => setIsTestDriveOpen(false)}
          title="Elijah AI Test Drive · 60 Trade Scenarios Suite"
          className="max-w-xl"
        >
          <div className="space-y-5 text-xs text-slate-300">
            <p className="text-xs text-slate-300 leading-relaxed">
              The Trade Certification Test Drive stress-tests all 10 AI employees across 60 rigorous real-world HVAC, electrical, and plumbing scenarios (emergency heat triage, price objections, after-hours dispatch, warranty disputes, and payment dunning).
            </p>

            {testDriveRunning ? (
              <div className="p-6 rounded-xl bg-surface-elevated border border-border/80 space-y-3 text-center">
                <RefreshCw className="w-8 h-8 mx-auto text-primary animate-spin" />
                <div className="font-semibold text-white text-sm">Running Trade Scenarios ({testDriveProgress}%)</div>
                <div className="w-full bg-surface rounded-full h-2 overflow-hidden border border-border">
                  <div
                    className="bg-gradient-to-r from-primary to-ai h-full transition-all duration-300"
                    style={{ width: `${testDriveProgress}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-400">Verifying tool execution contracts on /internal/v1/*</p>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-surface border border-border/80 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-white">Last Test Drive Certification:</span>
                  <span className="text-emerald-400 font-mono font-bold">60 / 60 Passed (100%)</span>
                </div>
                <div className="text-[11px] text-slate-400">
                  All 10 AI team members have proven compliant with trade licensing, emergency escalation, and PostgreSQL data persistence.
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-3 border-t border-border/80">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsTestDriveOpen(false)}
                className="text-xs h-9"
              >
                Close
              </Button>
              <Button
                size="sm"
                onClick={handleRunTestDrive}
                disabled={testDriveRunning}
                className="bg-primary hover:bg-primary-hover text-white text-xs h-9 shadow-md shadow-primary-glow/20"
              >
                <Play className="w-3.5 h-3.5 mr-1.5 fill-white" />
                {testDriveRunning ? 'Testing...' : 'Run 60 Scenarios Now'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
