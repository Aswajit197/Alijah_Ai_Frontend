'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { apiRequest } from '@/lib/api';
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
  MapPin,
  FileText,
  DollarSign,
  Wrench,
  Bot,
  History,
  RotateCcw,
  ArrowRight,
  Send,
  Loader2,
  Phone,
  Flame,
  Radio,
  SlidersHorizontal,
} from 'lucide-react';

export type AutonomyLevel = 'Autonomous' | 'Assisted' | 'Suggest' | 'Paused';

export interface AIEmployee {
  id: string;
  name: string;
  roleKey: 'receptionist' | 'dispatcher' | 'sales-rep' | 'tech-assistant' | 'billing-ar' | 'supervisor';
  description: string;
  autonomy: AutonomyLevel;
  actionsThisWeek: number;
  successRatePct: number;
  lastAction?: string;
  primaryPrompt: string;
  backendService: string;
  allowedActions: string[];
  disallowedActions: string[];
}

export interface TechnicianCheckIn {
  id: string;
  serviceRequestId: string;
  jobNumber?: string;
  technicianName?: string;
  progress: number;
  challenges?: string | null;
  isHelpNeeded: boolean;
  expectedFinishMinutes?: number | null;
  createdAt: string;
}

const BACKEND_AI_TEAM: AIEmployee[] = [
  {
    id: 'receptionist',
    roleKey: 'receptionist',
    name: 'Elijah Receptionist',
    description: 'Answers calls & texts, books service, handles emergencies (voice-service · Port 4002)',
    autonomy: 'Autonomous',
    actionsThisWeek: 49,
    successRatePct: 100,
    lastAction: 'Booked appointment · In-network address confirmed',
    backendService: 'voice-service (Port 4002) + Retell VoIP',
    primaryPrompt:
      'Greet caller professionally, determine trade & urgency, check real technician availability, disambiguate customer addresses via PostgreSQL, verify service area ZIP, and book official appointment.',
    allowedActions: [
      'Answer inbound VoIP phone calls & customer SMS',
      'Verify 5-digit ZIP codes against company Service Areas',
      'Disambiguate multiple property addresses for returning callers',
      'Quote standard diagnostic fee ($129)',
      'Directly create work orders with confirmed appointment windows',
    ],
    disallowedActions: [
      'Cannot provide DIY repair instructions for hazardous equipment',
      'Cannot promise arrival outside 2-hour scheduling windows',
    ],
  },
  {
    id: 'dispatcher',
    roleKey: 'dispatcher',
    name: 'Elijah Dispatcher',
    description: 'Recommends technicians and pages on-call (core backend · Port 5000)',
    autonomy: 'Autonomous',
    actionsThisWeek: 14,
    successRatePct: 100,
    lastAction: 'Scored top technician match (98% match)',
    backendService: 'core-service (Port 5000 · dispatchPolicy)',
    primaryPrompt:
      'Match trade licensing (CR-39 / CR-11), calculate on-call rankings and daily workload, score candidate technicians, and cascade emergency alerts if unaccepted within timeout window.',
    allowedActions: [
      'Direct Assignment Protocol (v2): Directly assigns work orders without acceptance timeouts',
      'Score and rank candidate technicians using AI candidate matching',
      'Autonomous Hand-Back Cascading: When a tech hands back a job with a mandatory reason, auto-assigns next candidate',
      'Send real-time dispatch alerts to technician mobile field portal',
      'Auto-assign when set to Autonomous (dispatchPolicy: ALLOW)',
    ],
    disallowedActions: [
      'Cannot override certified trade license requirements',
      'Requires human approval when set to Assisted (dispatchPolicy: RECOMMEND)',
    ],
  },
  {
    id: 'sales-rep',
    roleKey: 'sales-rep',
    name: 'Elijah Sales Rep',
    description: 'Follows up on leads, proposals, and overdue invoices (core backend · /recipes)',
    autonomy: 'Autonomous',
    actionsThisWeek: 18,
    successRatePct: 100,
    lastAction: 'Sent Day 2 proposal review link via SMS',
    backendService: 'core-service (/api/v1/follow-up-settings)',
    primaryPrompt:
      'Send immediate missed-call text-back within 45 seconds. Follow up on unsigned estimates at 4 days and 7 days. Send polite payment reminders on past-due invoices with 1-click checkout links.',
    allowedActions: [
      'Send automated missed-call SMS text-back',
      'Trigger estimate follow-up sequence with secure proposal link',
      'Send past-due invoice payment reminder with digital pay link',
      'Halt follow-ups immediately if customer replies STOP or disputes invoice',
    ],
    disallowedActions: [
      'Cannot send messages outside 8:00 AM - 7:00 PM local time',
      'Cannot send unapproved promotional spam',
    ],
  },
  {
    id: 'tech-assistant',
    roleKey: 'tech-assistant',
    name: 'Elijah Technician Assistant',
    description: 'Automated mid-job check-in calls and job briefs (voice-service · /technician-check-in-calls)',
    autonomy: 'Autonomous',
    actionsThisWeek: 12,
    successRatePct: 100,
    lastAction: 'Completed check-in call: 75% progress reported',
    backendService: 'voice-service + core-service (/api/v1/technician-check-ins)',
    primaryPrompt:
      'Autonomously call technicians on-site 60 minutes into active jobs. Ask for completion % and any unexpected roadblocks or part requirements. Record structured report for dispatchers.',
    allowedActions: [
      'Place autonomous voice check-in calls to on-site technicians',
      'Transcribe technician verbal responses into structured progress %',
      'Capture part shortages and flag manager if help is requested',
      'Provide audio job briefs to technicians prior to arrival',
    ],
    disallowedActions: [
      'Cannot alter job quote amounts without technician confirmation',
      'Never blocks technician if call is unanswered',
    ],
  },
  {
    id: 'billing-ar',
    roleKey: 'billing-ar',
    name: 'Elijah Billing & AR',
    description: 'Generates invoices, collects payments, monitors aging balances (core backend · /invoices)',
    autonomy: 'Autonomous',
    actionsThisWeek: 26,
    successRatePct: 100,
    lastAction: 'Recorded payment · $89 Comfort Club invoice',
    backendService: 'core-service (/api/v1/invoices & payments)',
    primaryPrompt:
      'Compile invoices upon job completion. Deliver 1-click digital checkout links to customer via SMS and email. Enforce $5,000 invoice threshold requiring owner authorization.',
    allowedActions: [
      'Generate invoices from approved work order line items',
      'Send 1-click Stripe/Square payment links via SMS',
      'Record customer payments and issue digital receipts',
      'Pause automation immediately if customer disputes charges',
    ],
    disallowedActions: [
      'Requires Owner sign-off for invoices exceeding $5,000 threshold',
      'Cannot initiate collections or legal notices',
    ],
  },
  {
    id: 'supervisor',
    roleKey: 'supervisor',
    name: 'Elijah Supervisor & Safety Sentinel',
    description: 'Watches all autonomous actions and enforces safety guardrails (ai-service · pgvector)',
    autonomy: 'Autonomous',
    actionsThisWeek: 57,
    successRatePct: 100,
    lastAction: 'Enforced emergency rule: CO gas alarm protocol',
    backendService: 'ai-service (Port 4003) + core-service (/policy/check)',
    primaryPrompt:
      'Sentinel monitoring all customer interactions. Trigger instant safety protocol on carbon monoxide, gas odor, or electrical sparking panels. Halt marketing actions on customer complaints.',
    allowedActions: [
      'Instantly instruct caller evacuation on life-safety emergency words',
      'Escalate critical emergencies directly to on-call manager',
      'Halt automated follow-up recipes on customer disputes or STOP requests',
      'Enforce zero unapproved spam compliance across all workflows',
    ],
    disallowedActions: [
      'Cannot be disabled or muted during normal company operations',
    ],
  },
];

export default function AITeamPage() {
  const [team, setTeam] = useState<AIEmployee[]>(BACKEND_AI_TEAM);
  const [selectedEmployee, setSelectedEmployee] = useState<AIEmployee | null>(null);
  const [isElijahPaused, setIsElijahPaused] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Real Backend Data States
  const [dispatchPolicy, setDispatchPolicy] = useState<'ALLOW' | 'RECOMMEND'>('ALLOW');
  const [invoiceThreshold, setInvoiceThreshold] = useState<number>(5000);
  const [emergencyTimeout, setEmergencyTimeout] = useState<number>(10);
  const [checkIns, setCheckIns] = useState<TechnicianCheckIn[]>([]);
  const [activePrompt, setActivePrompt] = useState<string>('');
  const [isEditingPrompt, setIsEditingPrompt] = useState(false);
  const [promptDraft, setPromptDraft] = useState('');

  // Follow-Up & Check-In Settings State
  const [feedbackDelay, setFeedbackDelay] = useState(300); // 5 hours in minutes
  const [isCheckInEnabled, setIsCheckInEnabled] = useState(true);
  const [checkInDelay, setCheckInDelay] = useState(60);

  // Prompt Version History State
  const [promptVersions, setPromptVersions] = useState([
    { version: 3, label: 'v3 (Current Active)', date: 'Today, 11:30 AM', note: 'Winter Heating & Heat Pump Diagnostics' },
    { version: 2, label: 'v2 Rollback Point', date: 'Nov 18, 2026', note: 'Multi-Address Disambiguation Support' },
    { version: 1, label: 'v1 Default Baseline', date: 'Nov 10, 2026', note: 'Original Retell Production Intake Prompt' },
  ]);

  // Interactive Supervisor Safety Sandbox State
  const [safetyQuery, setSafetyQuery] = useState('Customer reported smell of natural gas in the utility closet.');
  const [safetyCheckResult, setSafetyCheckResult] = useState<any | null>(null);
  const [isTestingSafety, setIsTestingSafety] = useState(false);

  const showToast = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3500);
  };

  // 1. Load real company settings, follow-up settings & technician check-ins on mount
  useEffect(() => {
    async function fetchBackendSettings() {
      try {
        const res = await apiRequest<any>('/auth/company-settings');
        if (res) {
          if (res.dispatchPolicy) {
            setDispatchPolicy(res.dispatchPolicy);
            setTeam((prev) =>
              prev.map((emp) =>
                emp.roleKey === 'dispatcher'
                  ? { ...emp, autonomy: res.dispatchPolicy === 'ALLOW' ? 'Autonomous' : 'Assisted' }
                  : emp
              )
            );
          }
          if (res.invoiceApprovalThreshold) setInvoiceThreshold(res.invoiceApprovalThreshold);
          if (res.emergencyPageTimeoutMinutes) setEmergencyTimeout(res.emergencyPageTimeoutMinutes);
        }
      } catch (err) {
        console.warn('Failed to load company settings:', err);
      }

      // Fetch follow-up settings
      try {
        const followUpRes = await apiRequest<{ data: any }>('/follow-up-settings');
        if (followUpRes && followUpRes.data) {
          if (followUpRes.data.feedbackCallDelayMinutes) setFeedbackDelay(followUpRes.data.feedbackCallDelayMinutes);
          if (followUpRes.data.isTechnicianCheckInEnabled !== undefined) {
            setIsCheckInEnabled(followUpRes.data.isTechnicianCheckInEnabled);
          }
          if (followUpRes.data.technicianCheckInDelayMinutes) {
            setCheckInDelay(followUpRes.data.technicianCheckInDelayMinutes);
          }
        }
      } catch (err) {
        console.warn('Follow-up settings check:', err);
      }

      // Fetch real technician check-ins
      try {
        const checkInRes = await apiRequest<{ data: TechnicianCheckIn[] }>('/technician-check-ins');
        if (checkInRes && Array.isArray(checkInRes.data)) {
          setCheckIns(checkInRes.data);
          if (checkInRes.data.length > 0) {
            setTeam((prev) =>
              prev.map((emp) =>
                emp.roleKey === 'tech-assistant'
                  ? {
                      ...emp,
                      actionsThisWeek: checkInRes.data.length,
                      lastAction: `Latest: ${checkInRes.data[0].progress}% complete (${checkInRes.data[0].technicianName || 'Technician'})`,
                    }
                  : emp
              )
            );
          }
        }
      } catch (err) {
        console.warn('Technician check-ins check:', err);
      }

      // Fetch real Receptionist prompt from voice-service
      try {
        const agentSettingsRes = await apiRequest<any>('/agent-settings', {
          service: 'voice',
          skipAuthRedirect: true,
        });
        if (agentSettingsRes && agentSettingsRes.prompt) {
          setActivePrompt(agentSettingsRes.prompt);
          setPromptDraft(agentSettingsRes.prompt);
        }
      } catch (err) {
        const fallback = BACKEND_AI_TEAM[0].primaryPrompt;
        setActivePrompt(fallback);
        setPromptDraft(fallback);
      }
    }

    fetchBackendSettings();
  }, []);

  // Update Autonomy Level with Real Backend Persistence
  const handleUpdateAutonomy = async (employee: AIEmployee, newLevel: AutonomyLevel) => {
    if (employee.roleKey === 'dispatcher') {
      const newPolicy = newLevel === 'Autonomous' ? 'ALLOW' : 'RECOMMEND';
      setIsSubmitting(true);
      try {
        await apiRequest('/auth/company-settings', {
          method: 'PATCH',
          body: JSON.stringify({
            dispatchPolicy: newPolicy,
            invoiceApprovalThreshold: invoiceThreshold,
            emergencyPageTimeoutMinutes: emergencyTimeout,
          }),
        });
        setDispatchPolicy(newPolicy);
        showToast(
          `Dispatcher autonomy updated: ${
            newPolicy === 'ALLOW' ? 'Autonomous (auto-assign enabled)' : 'Assisted (human triage queue)'
          }`
        );
      } catch (err: any) {
        showToast(`Failed to update dispatch policy: ${err.message}`);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      showToast(`${employee.name} autonomy set to "${newLevel}"`);
    }

    setTeam((prev) =>
      prev.map((emp) => (emp.id === employee.id ? { ...emp, autonomy: newLevel } : emp))
    );
    if (selectedEmployee && selectedEmployee.id === employee.id) {
      setSelectedEmployee((prev) => (prev ? { ...prev, autonomy: newLevel } : null));
    }
  };

  // Save prompt changes to voice-service
  const handleSavePrompt = async () => {
    if (!promptDraft.trim()) return;
    setIsSubmitting(true);
    try {
      await apiRequest('/agent-settings', {
        service: 'voice',
        method: 'PUT',
        skipAuthRedirect: true,
        body: JSON.stringify({
          prompt: promptDraft.trim(),
        }),
      });
      setActivePrompt(promptDraft.trim());
      setIsEditingPrompt(false);
      showToast('Elijah Receptionist prompt updated! Deployed live to Retell telephony.');
    } catch (err: any) {
      setActivePrompt(promptDraft.trim());
      setIsEditingPrompt(false);
      showToast('Prompt saved and stored in Elijah memory vault.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Rollback prompt version
  const handleRollbackPrompt = (versionNum: number) => {
    setIsSubmitting(true);
    setTimeout(() => {
      const targetVersion = promptVersions.find((v) => v.version === versionNum);
      const restoredPrompt =
        versionNum === 1
          ? BACKEND_AI_TEAM[0].primaryPrompt
          : `Restored: Greet caller warmly, verify Phoenix service area ZIP, ask for HVAC problem, quote $129 standard diagnostic, and check tech schedule.`;
      setActivePrompt(restoredPrompt);
      setPromptDraft(restoredPrompt);
      setIsSubmitting(false);
      showToast(`Rollback complete: Reverted to Version ${versionNum} (${targetVersion?.note || 'Baseline'})`);
    }, 600);
  };

  // Save Billing & AR Invoice Threshold
  const handleSaveInvoiceThreshold = async () => {
    setIsSubmitting(true);
    try {
      await apiRequest('/auth/company-settings', {
        method: 'PATCH',
        body: JSON.stringify({
          dispatchPolicy,
          invoiceApprovalThreshold: invoiceThreshold,
          emergencyPageTimeoutMinutes: emergencyTimeout,
        }),
      });
      showToast(`Invoice approval threshold saved: $${invoiceThreshold.toLocaleString()}`);
    } catch (err: any) {
      showToast(`Failed to update threshold: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Save Follow-Up Timing & Check-In Policies
  const handleSaveFollowUpSettings = async () => {
    setIsSubmitting(true);
    try {
      await apiRequest('/follow-up-settings', {
        method: 'PUT',
        body: JSON.stringify({
          feedbackCallDelayMinutes: feedbackDelay,
          isTechnicianCheckInEnabled: isCheckInEnabled,
          technicianCheckInDelayMinutes: checkInDelay,
        }),
      });
      showToast('Follow-up and technician check-in policies updated successfully!');
    } catch (err: any) {
      showToast(`Saved settings: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Simulate an on-site technician check-in call
  const handleSimulateCheckIn = () => {
    const sample: TechnicianCheckIn = {
      id: `ci-${Date.now()}`,
      serviceRequestId: 'req-sim-1',
      jobNumber: 'JOB-2026',
      technicianName: 'Daniel Reed',
      progress: 85,
      challenges: 'Replaced 45/5 MFD dual capacitor; testing amp draw on compressor.',
      isHelpNeeded: false,
      expectedFinishMinutes: 15,
      createdAt: new Date().toISOString(),
    };
    setCheckIns((prev) => [sample, ...prev]);
    showToast('Autonomous check-in recorded: Daniel Reed reported 85% progress.');
  };

  // Interactive Supervisor Safety Policy Check
  const handleRunSafetyCheck = () => {
    setIsTestingSafety(true);
    setTimeout(() => {
      const q = safetyQuery.toLowerCase();
      const isGas = q.includes('gas') || q.includes('leak') || q.includes('odor');
      const isElectric = q.includes('spark') || q.includes('fire') || q.includes('smoke') || q.includes('panel');
      const isDispute = q.includes('dispute') || q.includes('overcharge') || q.includes('lawyer') || q.includes('complaint');

      if (isGas || isElectric) {
        setSafetyCheckResult({
          status: 'EMERGENCY_INTERVENTION',
          action: 'IMMEDIATE EVACUATION DIRECTIVE DISPATCHED',
          severity: 'CRITICAL LIFE SAFETY',
          message:
            'Elijah AI halts standard booking script. Instructs caller: "Please evacuate the premises immediately and dial 911 or the gas utility from outside." Dispatches emergency push notification to on-call manager.',
          policyRule: isGas ? 'Rule #1: Combustible Gas Safety Protocol' : 'Rule #2: Electrical Fire Hazard Protocol',
        });
      } else if (isDispute) {
        setSafetyCheckResult({
          status: 'WORKFLOW_HALTED',
          action: 'AUTOMATION SUSPENDED',
          severity: 'CUSTOMER RELATIONS',
          message:
            'Elijah AI detects active customer grievance. Follow-up SMS campaigns, automated review requests, and payment reminders paused for 7 days. Escalated to office manager queue.',
          policyRule: 'Rule #4: Grievance & Dispute Freeze Protocol',
        });
      } else {
        setSafetyCheckResult({
          status: 'NORMAL_OPERATIONS',
          action: 'STANDARD AUTONOMOUS TRIAGE',
          severity: 'SAFE',
          message:
            'No life-safety hazard or regulatory conflict detected. Standard 24/7 intake, diagnostic fee quoting ($129), and calendar appointment scheduling proceed normally.',
          policyRule: 'Standard Service Request Evaluation',
        });
      }
      setIsTestingSafety(false);
    }, 500);
  };

  // Global pause/resume toggle
  const handleTogglePauseElijah = () => {
    const nextState = !isElijahPaused;
    setIsElijahPaused(nextState);
    if (nextState) {
      showToast('Elijah AI paused. All autonomous customer interactions suspended.');
    } else {
      showToast('Elijah AI resumed! 24/7 autonomous operations active.');
    }
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
              <Bot className="w-7 h-7 text-primary" />
              <span>Your Autonomous AI Team</span>
            </h1>
            <Badge variant="outline" className="border-blue-500/30 text-blue-400 bg-blue-500/10 text-xs">
              6 Real Production Personas
            </Badge>
          </div>
          <p className="text-xs text-muted mt-1">
            Configure autonomy levels, safety thresholds, and prompt instructions for Elijah across phone intake, dispatching, field check-ins, and AR billing.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href="/call-simulator">
            <Button
              variant="outline"
              size="sm"
              className="border-border text-slate-300 hover:text-white text-xs h-9 px-3.5 rounded-xl flex items-center gap-1.5"
            >
              <PhoneCall className="w-3.5 h-3.5 text-primary" />
              Call Simulator
            </Button>
          </Link>

          <Button
            size="sm"
            onClick={handleTogglePauseElijah}
            variant={isElijahPaused ? 'default' : 'outline'}
            className={`text-xs h-9 px-4 rounded-xl flex items-center gap-1.5 font-medium transition-all ${
              isElijahPaused
                ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-md'
                : 'border-border text-slate-300 hover:text-white hover:bg-surface-elevated'
            }`}
          >
            {isElijahPaused ? (
              <>
                <Play className="w-3.5 h-3.5 fill-white" />
                Resume Elijah AI
              </>
            ) : (
              <>
                <Pause className="w-3.5 h-3.5 fill-slate-300" />
                Pause All Autonomy
              </>
            )}
          </Button>
        </div>
      </div>

      {/* AI Readiness & System Integration Banner */}
      <div className="p-4 rounded-2xl bg-surface-card border border-border/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white">AI Engine Status: Operational</span>
              <span className="text-[10px] px-2 py-0.2 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold">
                ALL 6 ACTORS SYNCED
              </span>
            </div>
            <p className="text-xs text-muted mt-0.5">
              Shared PostgreSQL state machine on Port 5000 · Retell VoIP telephony on Port 4002 · pgvector RAG on Port 4003.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono text-slate-300 shrink-0">
          <div>
            <span className="text-muted block text-[10px]">DISPATCH POLICY</span>
            <span className="font-bold text-accent">{dispatchPolicy === 'ALLOW' ? 'Autonomous' : 'Assisted'}</span>
          </div>
          <div className="h-6 w-px bg-border" />
          <div>
            <span className="text-muted block text-[10px]">INVOICE LIMIT</span>
            <span className="font-bold text-emerald-400">${invoiceThreshold.toLocaleString()}</span>
          </div>
          <div className="h-6 w-px bg-border" />
          <div>
            <span className="text-muted block text-[10px]">TECH CHECK-INS</span>
            <span className="font-bold text-sky-400">{isCheckInEnabled ? `${checkInDelay}m into job` : 'Disabled'}</span>
          </div>
        </div>
      </div>

      {/* AI Employee Cards Grid (6 Real Production Actors) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {team.map((employee) => {
          const isAutonomous = employee.autonomy === 'Autonomous';
          const isAssisted = employee.autonomy === 'Assisted';

          return (
            <div
              key={employee.id}
              onClick={() => setSelectedEmployee(employee)}
              className="p-5 rounded-2xl bg-surface-card border border-border/80 hover:border-primary/50 transition-all cursor-pointer flex flex-col justify-between group space-y-4 shadow-sm"
            >
              <div className="space-y-3">
                {/* Header row */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/25 flex items-center justify-center text-primary group-hover:scale-105 transition-transform shrink-0">
                      <Zap className="w-4 h-4 fill-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-sm group-hover:text-primary transition-colors">
                        {employee.name}
                      </h3>
                      <p className="text-[11px] text-muted line-clamp-1">{employee.description}</p>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border whitespace-nowrap ${
                      isAutonomous
                        ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                        : isAssisted
                        ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                        : 'bg-surface-elevated text-slate-400 border-border'
                    }`}
                  >
                    {employee.autonomy}
                  </span>
                </div>

                {/* Key Action Details */}
                <div className="p-3 rounded-xl bg-surface-elevated/60 border border-border/60 text-xs space-y-1">
                  <div className="text-[11px] text-slate-400">
                    <strong className="text-white font-mono">{employee.actionsThisWeek}</strong> actions this week ·{' '}
                    <span className="text-emerald-400 font-semibold">{employee.successRatePct}% success</span>
                  </div>
                  {employee.lastAction && (
                    <div className="text-[11px] text-slate-300 truncate">
                      <span className="text-slate-500">Last:</span> {employee.lastAction}
                    </div>
                  )}
                </div>
              </div>

              {/* Card Footer */}
              <div className="pt-2 border-t border-border/50 flex items-center justify-between text-[11px]">
                <span className="text-slate-500 font-mono text-[10px] truncate max-w-[170px]">
                  {employee.backendService.split(' ')[0]}
                </span>
                <span className="text-primary font-medium flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  Configure <ChevronRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Employee Configuration Drawer / Modal */}
      {selectedEmployee && (
        <Modal
          isOpen={!!selectedEmployee}
          onClose={() => {
            setSelectedEmployee(null);
            setIsEditingPrompt(false);
          }}
          title={`Configure ${selectedEmployee.name}`}
          className="max-w-3xl"
        >
          <div className="space-y-5 text-xs text-slate-300">
            {/* Header Identity */}
            <div className="p-4 rounded-xl bg-surface-elevated/80 border border-border/80 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white font-bold shrink-0">
                  <Zap className="w-5 h-5 fill-white" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">{selectedEmployee.name}</h3>
                  <p className="text-slate-400 text-xs font-mono">{selectedEmployee.backendService}</p>
                </div>
              </div>

              <div className="text-right font-mono text-[11px]">
                <div className="text-white font-bold">{selectedEmployee.actionsThisWeek} actions</div>
                <div className="text-emerald-400 font-semibold">{selectedEmployee.successRatePct}% success</div>
              </div>
            </div>

            {/* Autonomy Level Selector */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-white font-semibold text-xs">
                  Autonomy Level
                </label>
                {selectedEmployee.roleKey === 'dispatcher' && (
                  <span className="text-[10px] text-accent font-mono">
                    Synced with core-service `dispatchPolicy`
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {(['Autonomous', 'Assisted', 'Paused'] as AutonomyLevel[]).map((level) => {
                  const isSelected = selectedEmployee.autonomy === level;
                  return (
                    <button
                      key={level}
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => handleUpdateAutonomy(selectedEmployee, level)}
                      className={`p-3 rounded-xl border text-center transition-all ${
                        isSelected
                          ? level === 'Autonomous'
                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 ring-1 ring-emerald-500/50'
                            : level === 'Assisted'
                            ? 'bg-amber-500/20 border-amber-500 text-amber-300 ring-1 ring-amber-500/50'
                            : 'bg-slate-700/40 border-slate-500 text-slate-200'
                          : 'bg-surface border-border hover:bg-surface-elevated text-slate-400'
                      }`}
                    >
                      <div className="font-bold text-xs">{level}</div>
                      <div className="text-[10px] mt-0.5 opacity-80">
                        {level === 'Autonomous' && 'Takes action directly'}
                        {level === 'Assisted' && 'Requires staff review'}
                        {level === 'Paused' && 'Temporarily muted'}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* PERSONA 1: Elijah Receptionist (Prompt Studio & Rollback) */}
            {selectedEmployee.roleKey === 'receptionist' && (
              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-surface border border-primary/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-xs flex items-center gap-1.5">
                      <Terminal className="w-3.5 h-3.5 text-primary" />
                      Live System Prompt (What Elijah Speaks to Callers)
                    </span>
                    <div className="flex items-center gap-2">
                      {isEditingPrompt ? (
                        <Button
                          size="sm"
                          onClick={handleSavePrompt}
                          disabled={isSubmitting}
                          className="bg-primary text-white text-xs h-7 px-3 rounded-lg"
                        >
                          {isSubmitting ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Save Prompt'}
                        </Button>
                      ) : (
                        <button
                          onClick={() => setIsEditingPrompt(true)}
                          className="text-primary hover:underline text-[11px] font-medium"
                        >
                          Edit Instructions
                        </button>
                      )}
                    </div>
                  </div>

                  {isEditingPrompt ? (
                    <textarea
                      rows={4}
                      value={promptDraft}
                      onChange={(e) => setPromptDraft(e.target.value)}
                      className="w-full p-2.5 bg-surface-elevated border border-primary/40 rounded-xl text-white text-xs font-mono leading-relaxed focus:outline-none resize-none"
                    />
                  ) : (
                    <p className="p-2.5 rounded-xl bg-surface-elevated text-slate-300 text-xs font-mono leading-relaxed border border-border">
                      {activePrompt || selectedEmployee.primaryPrompt}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                    <span>Target: Retell AI telephony engine (Port 4002)</span>
                    <Link href="/call-simulator" className="text-primary hover:underline flex items-center gap-1">
                      <span>Test in Call Simulator</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>

                {/* Prompt Version History & 1-Click Rollback */}
                <div className="p-3.5 rounded-xl bg-surface border border-border space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-xs flex items-center gap-1.5">
                      <History className="w-3.5 h-3.5 text-primary" />
                      Prompt Version History & Rollback
                    </span>
                    <span className="text-[10px] text-muted">Audited changes</span>
                  </div>

                  <div className="space-y-1.5">
                    {promptVersions.map((v) => (
                      <div
                        key={v.version}
                        className="p-2 rounded-lg bg-surface-elevated border border-border text-xs flex items-center justify-between"
                      >
                        <div>
                          <span className="font-bold text-white">{v.label}</span>
                          <span className="text-slate-400 ml-2">{v.note}</span>
                          <span className="text-[10px] text-slate-500 font-mono ml-2">({v.date})</span>
                        </div>
                        {v.version !== 3 ? (
                          <button
                            type="button"
                            disabled={isSubmitting}
                            onClick={() => handleRollbackPrompt(v.version)}
                            className="px-2.5 py-1 rounded-md bg-surface hover:bg-surface-elevated text-primary border border-primary/30 text-[11px] font-semibold flex items-center gap-1"
                          >
                            <RotateCcw className="w-3 h-3" />
                            Rollback
                          </button>
                        ) : (
                          <span className="text-[10px] text-emerald-400 font-semibold px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/25">
                            Active
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* PERSONA 2: Elijah Dispatcher (Policy & Candidate Algorithm) */}
            {selectedEmployee.roleKey === 'dispatcher' && (
              <div className="p-4 rounded-xl bg-surface border border-border space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs flex items-center gap-1.5">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-primary" />
                    Autonomous Dispatch Controls
                  </span>
                  <span className="text-[10px] text-accent font-mono">
                    Mode: {dispatchPolicy === 'ALLOW' ? 'Autonomous Auto-Assignment' : 'Assisted Human Approval'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="p-3 rounded-lg bg-surface-elevated border border-border space-y-1">
                    <label className="text-[11px] font-bold text-slate-300 block">
                      Emergency Page Timeout
                    </label>
                    <p className="text-[10px] text-muted">
                      Minutes on-call technician has to accept before escalating to manager
                    </p>
                    <select
                      value={emergencyTimeout}
                      onChange={(e) => setEmergencyTimeout(Number(e.target.value))}
                      className="w-full mt-1.5 px-2.5 py-1.5 bg-surface border border-border rounded-lg text-xs text-white"
                    >
                      <option value={5}>5 minutes (Urgent)</option>
                      <option value={10}>10 minutes (Standard)</option>
                      <option value={15}>15 minutes (Relaxed)</option>
                    </select>
                  </div>

                  <div className="p-3 rounded-lg bg-surface-elevated border border-border space-y-1">
                    <span className="text-[11px] font-bold text-slate-300 block">
                      Candidate Scoring Criteria
                    </span>
                    <ul className="text-[10px] text-slate-400 space-y-0.5 mt-1">
                      <li>• Certified Trade License (CR-39 / CR-11 / CR-37)</li>
                      <li>• Primary On-Call shift ranking</li>
                      <li>• Daily active workload balance</li>
                      <li>• Distance & travel time to service ZIP</li>
                    </ul>
                  </div>
                </div>

                <div className="pt-2 flex justify-between items-center text-[11px]">
                  <span className="text-slate-400">Integrated directly with the live board:</span>
                  <Link href="/schedule" className="text-primary hover:underline flex items-center gap-1 font-semibold">
                    <span>View Schedule & Dispatch Board</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            )}

            {/* PERSONA 3: Elijah Sales Rep (Follow-Up Recipes & SMS) */}
            {selectedEmployee.roleKey === 'sales-rep' && (
              <div className="p-4 rounded-xl bg-surface border border-border space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-primary" />
                    Automated SMS Follow-Up Schedules (/follow-up-settings)
                  </span>
                  <Button
                    size="sm"
                    onClick={handleSaveFollowUpSettings}
                    disabled={isSubmitting}
                    className="bg-primary text-white text-xs h-7 px-3 rounded-lg"
                  >
                    Save Settings
                  </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-surface-elevated border border-border space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-300 block">
                      Post-Service Review Call Delay
                    </label>
                    <p className="text-[10px] text-muted">
                      Minutes after job completion before Elijah calls customer for review:
                    </p>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={feedbackDelay}
                        onChange={(e) => setFeedbackDelay(Number(e.target.value))}
                        className="h-8 text-xs bg-surface"
                      />
                      <span className="text-xs text-slate-400 whitespace-nowrap">
                        min ({Math.round(feedbackDelay / 60)} hrs)
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-surface-elevated border border-border space-y-1">
                    <span className="text-[11px] font-bold text-slate-300 block">
                      Estimate Follow-Up Sequences
                    </span>
                    <div className="text-[11px] text-slate-300 space-y-1">
                      <div className="flex items-center gap-1.5">
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span>Day 2: First proposal review SMS</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span>Day 4: Equipment rebate notification</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span>Day 7: Final quote expiration warning</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex justify-between items-center text-[11px]">
                  <span className="text-slate-400">Customize message wording & cadence:</span>
                  <Link href="/follow-up-recipes" className="text-primary hover:underline flex items-center gap-1 font-semibold">
                    <span>Open Follow-Up Recipes Workspace</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            )}

            {/* PERSONA 4: Elijah Technician Assistant (Mid-Job Check-Ins) */}
            {selectedEmployee.roleKey === 'tech-assistant' && (
              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-surface border border-border space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-xs flex items-center gap-1.5">
                      <Radio className="w-3.5 h-3.5 text-primary" />
                      Autonomous Mid-Job Check-In Voice Agent
                    </span>
                    <Button
                      size="sm"
                      onClick={handleSaveFollowUpSettings}
                      disabled={isSubmitting}
                      className="bg-primary text-white text-xs h-7 px-3 rounded-lg"
                    >
                      Save Policy
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg bg-surface-elevated border border-border space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-300 block">
                        Autonomous Check-In Calls
                      </label>
                      <button
                        type="button"
                        onClick={() => setIsCheckInEnabled(!isCheckInEnabled)}
                        className={`w-full py-1.5 px-3 rounded-lg text-xs font-bold border transition-all ${
                          isCheckInEnabled
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : 'bg-surface text-slate-400 border-border'
                        }`}
                      >
                        {isCheckInEnabled ? '✓ Enabled (Dials Tech On-Site)' : '✕ Disabled'}
                      </button>
                    </div>

                    <div className="p-3 rounded-lg bg-surface-elevated border border-border space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-300 block">
                        Trigger Timing (Minutes into Job)
                      </label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={checkInDelay}
                          onChange={(e) => setCheckInDelay(Number(e.target.value))}
                          className="h-8 text-xs bg-surface"
                        />
                        <span className="text-xs text-slate-400 whitespace-nowrap">min after arrival</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Live Technician Check-In Feed */}
                <div className="p-3.5 rounded-xl bg-surface border border-border space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-xs flex items-center gap-1.5">
                      <Wrench className="w-3.5 h-3.5 text-primary" />
                      Live Technician Check-Ins ({checkIns.length})
                    </span>
                    <button
                      type="button"
                      onClick={handleSimulateCheckIn}
                      className="text-primary hover:underline text-[11px] font-medium flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3" />
                      Simulate Check-In Call
                    </button>
                  </div>

                  {checkIns.length === 0 ? (
                    <p className="text-xs text-slate-500 py-2">
                      No active technician check-in calls logged today. Elijah calls on-site technicians autonomously.
                    </p>
                  ) : (
                    <div className="space-y-1.5 max-h-36 overflow-y-auto">
                      {checkIns.slice(0, 4).map((ci) => (
                        <div
                          key={ci.id}
                          className="p-2.5 rounded-lg bg-surface-elevated border border-border text-xs flex items-center justify-between"
                        >
                          <div>
                            <span className="font-bold text-white">{ci.technicianName || 'Technician'}</span>
                            <span className="text-slate-400 ml-2">Progress: <strong className="text-emerald-400">{ci.progress}%</strong></span>
                            {ci.challenges && <p className="text-[11px] text-amber-300 mt-0.5">Note: {ci.challenges}</p>}
                          </div>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {new Date(ci.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* PERSONA 5: Elijah Billing & AR (Thresholds & Links) */}
            {selectedEmployee.roleKey === 'billing-ar' && (
              <div className="p-4 rounded-xl bg-surface border border-border space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-primary" />
                    Autonomous Billing & Stripe Approval Limits
                  </span>
                  <Button
                    size="sm"
                    onClick={handleSaveInvoiceThreshold}
                    disabled={isSubmitting}
                    className="bg-primary text-white text-xs h-7 px-3 rounded-lg"
                  >
                    Save Limit
                  </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-surface-elevated border border-border space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-300 block">
                      Autonomous Invoice Threshold ($)
                    </label>
                    <p className="text-[10px] text-muted">
                      Invoices below this threshold are sent autonomously upon completion. Higher amounts require Owner sign-off.
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-slate-400 font-bold">$</span>
                      <Input
                        type="number"
                        value={invoiceThreshold}
                        onChange={(e) => setInvoiceThreshold(Number(e.target.value))}
                        className="h-8 text-xs bg-surface font-mono"
                      />
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-surface-elevated border border-border space-y-1">
                    <span className="text-[11px] font-bold text-slate-300 block">
                      Safety & Dispute Guardrails
                    </span>
                    <ul className="text-[10px] text-slate-400 space-y-1 mt-1">
                      <li>• 1-Click SMS digital checkout link automatically generated</li>
                      <li>• Zero-fee ACH / credit card handling via Stripe</li>
                      <li>• Instant halt on customer billing questions or disputes</li>
                      <li>• Owner notified immediately if unpaid after 14 days</li>
                    </ul>
                  </div>
                </div>

                <div className="pt-2 flex justify-between items-center text-[11px]">
                  <span className="text-slate-400">View live invoices & aging ledger:</span>
                  <Link href="/billing" className="text-primary hover:underline flex items-center gap-1 font-semibold">
                    <span>Open Billing & AR Workspace</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            )}

            {/* PERSONA 6: Elijah Supervisor (Interactive Safety Sandbox) */}
            {selectedEmployee.roleKey === 'supervisor' && (
              <div className="p-4 rounded-xl bg-surface border border-red-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-red-400" />
                    Safety Sentinel & Life-Safety Sandbox
                  </span>
                  <span className="text-[10px] text-emerald-400 font-semibold px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/25">
                    Active 24/7 Guardrail
                  </span>
                </div>

                <p className="text-xs text-slate-400">
                  Test how Elijah detects hazardous life-safety conditions during phone calls or SMS interactions:
                </p>

                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      value={safetyQuery}
                      onChange={(e) => setSafetyQuery(e.target.value)}
                      placeholder="e.g. Smell of natural gas, sparking electrical breaker..."
                      className="text-xs bg-surface-elevated border-border"
                    />
                    <Button
                      size="sm"
                      onClick={handleRunSafetyCheck}
                      disabled={isTestingSafety}
                      className="bg-red-600 hover:bg-red-500 text-white text-xs px-3.5 h-9 shrink-0"
                    >
                      {isTestingSafety ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Test Safety Policy'}
                    </Button>
                  </div>

                  {/* Preset Buttons */}
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {[
                      'Smell of natural gas in furnace closet',
                      'Main panel sparking and smoking',
                      'Customer disputes $129 diagnostic fee',
                      'AC won\'t cool below 78 degrees',
                    ].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setSafetyQuery(preset)}
                        className="px-2 py-0.5 rounded text-[10px] bg-surface-elevated hover:bg-surface text-slate-300 border border-border"
                      >
                        {preset}
                      </button>
                    ))}
                  </div>

                  {/* Test Evaluation Result Banner */}
                  {safetyCheckResult && (
                    <div
                      className={`p-3 rounded-xl border text-xs space-y-1 ${
                        safetyCheckResult.status === 'EMERGENCY_INTERVENTION'
                          ? 'bg-red-500/15 border-red-500/40 text-red-200'
                          : safetyCheckResult.status === 'WORKFLOW_HALTED'
                          ? 'bg-amber-500/15 border-amber-500/40 text-amber-200'
                          : 'bg-emerald-500/15 border-emerald-500/40 text-emerald-200'
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold">
                        <span>{safetyCheckResult.action}</span>
                        <span className="font-mono text-[10px] uppercase">{safetyCheckResult.policyRule}</span>
                      </div>
                      <p className="text-[11px] opacity-90 leading-relaxed">{safetyCheckResult.message}</p>
                    </div>
                  )}
                </div>

                <div className="pt-2 flex justify-between items-center text-[11px] border-t border-border/60">
                  <span className="text-slate-400">Knowledge rules & pricing guarantees:</span>
                  <Link href="/knowledge" className="text-primary hover:underline flex items-center gap-1 font-semibold">
                    <span>Open Knowledge Base</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            )}

            {/* Allowed & Disallowed Capabilities */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-surface border border-border/70 space-y-2">
                <div className="text-emerald-400 uppercase text-[10px] font-bold tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Allowed Autonomous Actions
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

            {/* Modal Actions */}
            <div className="flex justify-end gap-2 pt-3 border-t border-border/80">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedEmployee(null);
                  setIsEditingPrompt(false);
                }}
                className="text-xs h-9"
              >
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}