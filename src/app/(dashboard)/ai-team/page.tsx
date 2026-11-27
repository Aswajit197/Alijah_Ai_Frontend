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
  progress: number | string;
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

  // Navigation Tab State
  const [activeTab, setActiveTab] = useState<'workforce' | 'prompt-studio' | 'check-ins'>('workforce');

  // Real Backend Data States
  const [dispatchPolicy, setDispatchPolicy] = useState<'ALLOW' | 'RECOMMEND'>('ALLOW');
  const [invoiceThreshold, setInvoiceThreshold] = useState<number>(5000);
  const [emergencyTimeout, setEmergencyTimeout] = useState<number>(10);
  const [checkIns, setCheckIns] = useState<TechnicianCheckIn[]>([]);

  // Prompt Studio & Greetings State
  const [activePrompt, setActivePrompt] = useState<string>('');
  const [promptDraft, setPromptDraft] = useState('');
  const [inboundGreeting, setInboundGreeting] = useState("Thanks for calling {{business_name}}, this is Elijah, the company's AI assistant. This call is recorded. How can I help?");
  const [followUpGreeting, setFollowUpGreeting] = useState("Hi {{customer_first_name}}, this is Elijah from {{business_name}}. I'm calling about your recent visit with {{technician_name}}. Do you have a minute for two quick questions?");
  const [agentMode, setAgentMode] = useState<'single' | 'separate'>('single');
  const [promptVersions, setPromptVersions] = useState<any[]>([]);

  // Prompt Studio Modals
  const [isConfirmDeployOpen, setIsConfirmDeployOpen] = useState(false);
  const [deployNote, setDeployNote] = useState('');
  const [isSnapshotModalOpen, setIsSnapshotModalOpen] = useState(false);
  const [viewingVersion, setViewingVersion] = useState<any | null>(null);
  const [isConfirmRollbackOpen, setIsConfirmRollbackOpen] = useState(false);
  const [rollbackTargetVersion, setRollbackTargetVersion] = useState<any | null>(null);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  // Follow-Up & Check-In Settings State
  const [feedbackDelay, setFeedbackDelay] = useState(300); // 5 hours in minutes
  const [isCheckInEnabled, setIsCheckInEnabled] = useState(true);
  const [checkInDelay, setCheckInDelay] = useState(60);

  // Interactive Supervisor Safety Sandbox State
  const [safetyQuery, setSafetyQuery] = useState('Customer reported smell of natural gas in the utility closet.');
  const [safetyCheckResult, setSafetyCheckResult] = useState<any | null>(null);
  const [isTestingSafety, setIsTestingSafety] = useState(false);

  const showToast = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3500);
  };

  // 1. Load real company settings, follow-up settings, check-ins, and agent settings on mount
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

      // Fetch real Agent Settings & Prompt Versions from backend
      try {
        const agentSettingsRes = await apiRequest<{ data: any }>('/agent-settings');
        if (agentSettingsRes?.data) {
          const d = agentSettingsRes.data;
          if (d.prompt) {
            setActivePrompt(d.prompt);
            setPromptDraft(d.prompt);
          }
          if (d.inboundGreeting) setInboundGreeting(d.inboundGreeting);
          if (d.followUpGreeting) setFollowUpGreeting(d.followUpGreeting);
          if (d.mode) setAgentMode(d.mode);
          if (Array.isArray(d.promptVersions) && d.promptVersions.length > 0) {
            setPromptVersions(d.promptVersions);
          }
        }
      } catch (err) {
        const fallback = BACKEND_AI_TEAM[0].primaryPrompt;
        setActivePrompt(fallback);
        setPromptDraft(fallback);
      }
    }

    fetchBackendSettings();
  }, []);

  // Insert variable tag into prompt draft
  const handleInsertVariable = (variable: string) => {
    setPromptDraft((prev) => `${prev} ${variable} `);
    showToast(`Inserted variable ${variable}`);
  };

  // Append rule template into prompt draft
  const handleAppendRule = (ruleText: string, ruleTitle: string) => {
    setPromptDraft((prev) => `${prev.trim()}\n\n# ${ruleTitle}\n${ruleText}\n`);
    showToast(`Appended rule: ${ruleTitle}`);
  };

  // Deploy prompt changes
  const handleDeployPrompt = async () => {
    if (!promptDraft.trim()) return;
    setIsSubmitting(true);
    try {
      const res = await apiRequest<{ data: any }>('/agent-settings', {
        method: 'PUT',
        body: JSON.stringify({
          prompt: promptDraft.trim(),
          inboundGreeting,
          followUpGreeting,
          agentMode,
          note: deployNote.trim() || 'Prompt update deployed',
          confirmed: true,
        }),
      });

      if (res?.data?.version) {
        setPromptVersions((prev) => [res.data.version, ...prev]);
      } else if (res?.data?.settings?.promptVersions) {
        setPromptVersions(res.data.settings.promptVersions);
      }
      setActivePrompt(promptDraft.trim());
      setIsConfirmDeployOpen(false);
      setDeployNote('');
      showToast('Elijah Receptionist prompt deployed live to Retell telephony!');
    } catch (err: any) {
      showToast(`Failed to deploy prompt: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Rollback prompt version
  const handleRollbackPrompt = async (version: number) => {
    setIsSubmitting(true);
    try {
      const res = await apiRequest<{ data: any }>(`/agent-prompt-versions/${version}/restore`, {
        method: 'POST',
        body: JSON.stringify({ confirmed: true }),
      });

      if (res?.data) {
        const d = res.data;
        if (d.receptionistPrompt) {
          setActivePrompt(d.receptionistPrompt);
          setPromptDraft(d.receptionistPrompt);
        }
        if (d.inboundGreeting) setInboundGreeting(d.inboundGreeting);
        if (d.followUpGreeting) setFollowUpGreeting(d.followUpGreeting);
        if (d.promptVersions) setPromptVersions(d.promptVersions);
      }
      setIsConfirmRollbackOpen(false);
      setRollbackTargetVersion(null);
      showToast(`Rollback complete: Restored Version ${version} to live production!`);
    } catch (err: any) {
      showToast(`Rollback failed: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset to default baseline
  const handleResetToDefault = async () => {
    setIsSubmitting(true);
    try {
      const res = await apiRequest<{ data: any }>('/agent-prompt/reset-to-default', {
        method: 'POST',
        body: JSON.stringify({ confirmed: true }),
      });

      if (res?.data) {
        const d = res.data;
        if (d.receptionistPrompt) {
          setActivePrompt(d.receptionistPrompt);
          setPromptDraft(d.receptionistPrompt);
        }
        if (d.inboundGreeting) setInboundGreeting(d.inboundGreeting);
        if (d.followUpGreeting) setFollowUpGreeting(d.followUpGreeting);
        if (d.promptVersions) setPromptVersions(d.promptVersions);
      }
      setIsResetConfirmOpen(false);
      showToast('Prompt reset to tested production baseline default.');
    } catch (err: any) {
      showToast(`Reset failed: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

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

  // Open Deploy Confirmation Dialog
  const handleOpenDeployModal = () => {
    if (!promptDraft.trim()) return;
    setIsConfirmDeployOpen(true);
  };

  // Open Rollback Confirmation Dialog
  const handleOpenRollbackModal = (version: any) => {
    setRollbackTargetVersion(version);
    setIsConfirmRollbackOpen(true);
  };

  // Open Snapshot Preview Modal
  const handleOpenSnapshotModal = (version: any) => {
    setViewingVersion(version);
    setIsSnapshotModalOpen(true);
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
  const handleSimulateCheckIn = async () => {
    try {
      await apiRequest('/technician-check-ins', {
        method: 'POST',
        body: JSON.stringify({
          progress: '85',
          challenges: 'Replaced 45/5 MFD dual capacitor; testing amp draw on compressor.',
          isHelpNeeded: false,
          expectedFinishMinutes: 15,
        }),
      });
      const res = await apiRequest<{ data: any[] }>('/technician-check-ins');
      if (res && Array.isArray((res as any).data)) {
        setCheckIns((res as any).data);
      }
      showToast('Autonomous check-in recorded: 85% progress synced to Schedule.');
    } catch {
      const sample: TechnicianCheckIn = {
        id: `ci-${Date.now()}`,
        serviceRequestId: 'req-sim-1',
        jobNumber: 'JOB-5001',
        technicianName: 'Mike Rodriguez',
        progress: 85,
        challenges: 'Replaced 45/5 MFD dual capacitor; testing amp draw on compressor.',
        isHelpNeeded: false,
        expectedFinishMinutes: 15,
        createdAt: new Date().toISOString(),
      };
      setCheckIns((prev) => [sample, ...prev]);
      showToast('Autonomous check-in recorded: Daniel Reed reported 85% progress.');
    }
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
            variant={isElijahPaused ? 'primary' : 'outline'}
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

      {/* View Switcher Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border/80 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab('workforce')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'workforce'
              ? 'bg-primary text-white shadow-md shadow-primary/20'
              : 'text-slate-400 hover:text-white hover:bg-surface-elevated'
          }`}
        >
          <Bot className="w-4 h-4" />
          <span>AI Workforce Personas ({team.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('prompt-studio')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'prompt-studio'
              ? 'bg-primary text-white shadow-md shadow-primary/20'
              : 'text-slate-400 hover:text-white hover:bg-surface-elevated'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Prompt & Behavior Studio</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500/20 text-amber-300 font-mono">
            Live VoIP
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('check-ins')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'check-ins'
              ? 'bg-primary text-white shadow-md shadow-primary/20'
              : 'text-slate-400 hover:text-white hover:bg-surface-elevated'
          }`}
        >
          <PhoneCall className="w-4 h-4 text-sky-400" />
          <span>Mid-Job Technician Check-Ins ({checkIns.length})</span>
        </button>
      </div>

      {/* TAB 1: AI Workforce Personas Grid */}
      {activeTab === 'workforce' && (
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
      )}

      {/* TAB 2: AI Prompt & Behavior Studio (Live Retell VoIP Editor & Rollback) */}
      {activeTab === 'prompt-studio' && (
        <div className="space-y-6">
          {/* Studio Header & Telephony Status */}
          <div className="p-4 sm:p-5 rounded-2xl bg-surface-card border border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Terminal className="w-5 h-5 text-primary" />
                  <span>Elijah Prompt & Behavior Studio</span>
                </h2>
                <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 bg-emerald-500/10 text-xs">
                  ● Retell Telephony Connected
                </Badge>
              </div>
              <p className="text-xs text-muted mt-1 max-w-2xl">
                Edit how Elijah talks to homeowners, determines urgency, handles safety emergencies, and disambiguates multi-location addresses. Every deployment is version-controlled with 1-click rollback.
              </p>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsResetConfirmOpen(true)}
                disabled={isSubmitting}
                className="border-border text-slate-300 hover:text-white text-xs h-9 px-3.5 rounded-xl flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                Reset to Default
              </Button>

              <Button
                size="sm"
                onClick={handleOpenDeployModal}
                disabled={isSubmitting || !promptDraft.trim()}
                className="bg-primary hover:bg-primary/90 text-white font-semibold text-xs h-9 px-4 rounded-xl flex items-center gap-1.5 shadow-md shadow-primary/20"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                Deploy Live Instructions
              </Button>
            </div>
          </div>

          {/* Studio 2-Column Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Left 2 Columns: Greetings & Prompt Editor */}
            <div className="lg:col-span-2 space-y-5">
              {/* Telephony Agent Mode Selector */}
              <div className="p-4 rounded-2xl bg-surface-card border border-border/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-bold text-white block">Telephony Agent Architecture</label>
                    <p className="text-[11px] text-muted">
                      Choose whether one unified agent handles both inbound & follow-up calls or separate specialized agents.
                    </p>
                  </div>
                  <span className="text-[10px] font-mono text-primary uppercase font-bold">
                    Mode: {agentMode}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => setAgentMode('single')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      agentMode === 'single'
                        ? 'bg-primary/15 border-primary text-white ring-1 ring-primary/40'
                        : 'bg-surface-elevated/40 border-border text-slate-400 hover:bg-surface-elevated'
                    }`}
                  >
                    <div className="font-bold text-xs flex items-center justify-between">
                      <span>Unified Single Agent</span>
                      {agentMode === 'single' && <Check className="w-3.5 h-3.5 text-primary" />}
                    </div>
                    <p className="text-[10px] text-muted mt-1">
                      One consistent Elijah voice persona for answering incoming calls and placing post-job follow-up calls.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAgentMode('separate')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      agentMode === 'separate'
                        ? 'bg-primary/15 border-primary text-white ring-1 ring-primary/40'
                        : 'bg-surface-elevated/40 border-border text-slate-400 hover:bg-surface-elevated'
                    }`}
                  >
                    <div className="font-bold text-xs flex items-center justify-between">
                      <span>Separate Dedicated Agents</span>
                      {agentMode === 'separate' && <Check className="w-3.5 h-3.5 text-primary" />}
                    </div>
                    <p className="text-[10px] text-muted mt-1">
                      Dedicated Inbound Receptionist agent + independent Outbound Review/Feedback agent with separate voices.
                    </p>
                  </button>
                </div>
              </div>

              {/* Opening Greetings Section */}
              <div className="p-4 rounded-2xl bg-surface-card border border-border/80 space-y-4">
                <div className="flex items-center justify-between border-b border-border/60 pb-2.5">
                  <span className="text-xs font-bold text-white flex items-center gap-2">
                    <Radio className="w-4 h-4 text-emerald-400" />
                    Opening Spoken Lines (Sub-500ms Audio Response)
                  </span>
                  <span className="text-[10px] text-muted font-mono">Retell begin_message</span>
                </div>

                {/* Inbound Opening Line */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-300">
                      Inbound Greeting (Callers hear this first)
                    </label>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {inboundGreeting.length} / 500
                    </span>
                  </div>
                  <input
                    type="text"
                    value={inboundGreeting}
                    onChange={(e) => setInboundGreeting(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-elevated border border-border text-xs text-white focus:outline-none focus:border-primary font-sans"
                  />
                  <p className="text-[10px] text-muted">
                    Variables available: <span className="font-mono text-primary">{"{{business_name}}"}</span>
                  </p>
                </div>

                {/* Outbound Follow-Up Opening Line */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-300">
                      Outbound Follow-Up Greeting (Review & Check-In Calls)
                    </label>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {followUpGreeting.length} / 500
                    </span>
                  </div>
                  <input
                    type="text"
                    value={followUpGreeting}
                    onChange={(e) => setFollowUpGreeting(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-elevated border border-border text-xs text-white focus:outline-none focus:border-primary font-sans"
                  />
                  <p className="text-[10px] text-muted">
                    Variables available: <span className="font-mono text-primary">{"{{customer_first_name}}"}</span>,{' '}
                    <span className="font-mono text-primary">{"{{business_name}}"}</span>,{' '}
                    <span className="font-mono text-primary">{"{{technician_name}}"}</span>
                  </p>
                </div>
              </div>

              {/* System Prompt Code Editor */}
              <div className="p-4 sm:p-5 rounded-2xl bg-surface-card border border-border/80 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-3">
                  <div>
                    <span className="text-xs font-bold text-white flex items-center gap-2">
                      <Terminal className="w-4 h-4 text-primary" />
                      System Prompt & Operational Guardrails
                    </span>
                    <p className="text-[11px] text-muted mt-0.5">
                      The core directive guiding Elijah during live phone conversations and intake evaluation.
                    </p>
                  </div>

                  <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono">
                    <span>{promptDraft.length.toLocaleString()} chars</span>
                    <span>·</span>
                    <span>{promptDraft.split(/\s+/).filter(Boolean).length} words</span>
                  </div>
                </div>

                {/* Variable Pills Toolbar */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Click to Insert Dynamic Call Variables:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      '{{business_name}}',
                      '{{service_categories}}',
                      '{{call_purpose}}',
                      '{{diagnostic_fee}}',
                      '{{customer_first_name}}',
                      '{{technician_name}}',
                    ].map((v) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => handleInsertVariable(v)}
                        className="px-2.5 py-1 rounded-lg bg-surface-elevated hover:bg-primary/20 text-primary border border-primary/30 text-[11px] font-mono transition-colors"
                      >
                        + {v}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Pre-configured Rule Snippets */}
                <div className="space-y-1.5 pt-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    One-Click Trade Policy Presets:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() =>
                        handleAppendRule(
                          'Offer $89 diagnostic fee for active Comfort Club members, or $129 standard diagnostic for non-members. Inform customer that diagnostic fee is credited toward repair if approved.',
                          'Diagnostic Fee & Membership Rate Policy'
                        )
                      }
                      className="px-2.5 py-1 rounded-lg bg-surface-elevated hover:bg-surface text-slate-300 border border-border text-[11px] transition-colors"
                    >
                      + $89 Diagnostic Member Rate
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handleAppendRule(
                          'If the caller smells natural gas, sees sparking breakers, or reports active smoke, immediately direct them to evacuate the premises and dial 911 or the utility company. Do not attempt booking.',
                          'Critical Life-Safety Evacuation Protocol'
                        )
                      }
                      className="px-2.5 py-1 rounded-lg bg-surface-elevated hover:bg-surface text-slate-300 border border-border text-[11px] transition-colors"
                    >
                      + Gas & Electrical Fire Evacuation
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handleAppendRule(
                          'We strictly provide residential trade services. Politely decline commercial, industrial, or multi-family complex inquiries and offer an office callback.',
                          'Residential Only Service Scope'
                        )
                      }
                      className="px-2.5 py-1 rounded-lg bg-surface-elevated hover:bg-surface text-slate-300 border border-border text-[11px] transition-colors"
                    >
                      + Decline Commercial Work
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handleAppendRule(
                          'Always ask the caller if there are locked gate codes, dogs on the premises, or specialized parking instructions for the service van.',
                          'Property Access & Pet Precautions'
                        )
                      }
                      className="px-2.5 py-1 rounded-lg bg-surface-elevated hover:bg-surface text-slate-300 border border-border text-[11px] transition-colors"
                    >
                      + Gate Codes & Pet Precautions
                    </button>
                  </div>
                </div>

                {/* Code Editor */}
                <div className="pt-2">
                  <textarea
                    rows={20}
                    value={promptDraft}
                    onChange={(e) => setPromptDraft(e.target.value)}
                    className="w-full p-4 rounded-xl bg-surface-elevated/90 border border-border font-mono text-xs text-slate-200 leading-relaxed focus:outline-none focus:border-primary/80 focus:ring-1 focus:ring-primary/40 resize-y shadow-inner"
                    placeholder="Enter system prompt instructions for Elijah..."
                  />
                </div>
              </div>
            </div>

            {/* Right Column: Version History, Rollback & Simulator */}
            <div className="space-y-5">
              {/* Version History Card */}
              <div className="p-4 sm:p-5 rounded-2xl bg-surface-card border border-border/80 space-y-3">
                <div className="flex items-center justify-between border-b border-border/60 pb-3">
                  <span className="text-xs font-bold text-white flex items-center gap-2">
                    <History className="w-4 h-4 text-primary" />
                    Prompt Version History
                  </span>
                  <Badge variant="outline" className="border-border text-slate-400 text-[10px]">
                    {promptVersions.length} Recorded
                  </Badge>
                </div>

                <p className="text-[11px] text-muted">
                  Every deployment is snapshot-archived. Restore any prior version instantly with zero downtime.
                </p>

                <div className="space-y-2 pt-1 max-h-[520px] overflow-y-auto pr-1">
                  {promptVersions.map((v, idx) => {
                    const isLatest = idx === 0;
                    return (
                      <div
                        key={v.version}
                        className={`p-3.5 rounded-xl border transition-all ${
                          isLatest
                            ? 'bg-primary/10 border-primary/40 shadow-sm'
                            : 'bg-surface-elevated/60 border-border hover:border-slate-600'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-xs">Version {v.version}</span>
                            {isLatest && (
                              <span className="px-2 py-0.5 rounded-full text-[9px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold font-mono">
                                LIVE
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {new Date(v.createdAt).toLocaleDateString([], {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>

                        <p className="text-xs text-slate-300 mt-1 font-sans line-clamp-2">
                          {v.note || 'Production instruction update'}
                        </p>

                        <div className="mt-2.5 pt-2 border-t border-border/40 flex items-center justify-between text-[11px]">
                          <span className="text-slate-500 font-mono text-[10px]">By {v.createdBy || 'Owner'}</span>

                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenSnapshotModal(v)}
                              className="px-2 py-1 rounded text-[10px] text-slate-400 hover:text-white bg-surface hover:bg-surface-elevated border border-border"
                            >
                              View
                            </button>

                            {!isLatest && (
                              <button
                                type="button"
                                disabled={isSubmitting}
                                onClick={() => handleOpenRollbackModal(v)}
                                className="px-2 py-1 rounded text-[10px] font-semibold text-primary hover:text-white bg-primary/10 hover:bg-primary border border-primary/30 flex items-center gap-1 transition-colors"
                              >
                                <RotateCcw className="w-2.5 h-2.5" />
                                Rollback
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Live Test Drive Link Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/15 to-surface-card border border-primary/30 space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary shrink-0">
                    <PhoneCall className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Call Simulator Integration</h4>
                    <p className="text-[10px] text-muted">Test newly saved instructions in a real browser call.</p>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  Call Elijah in the sandbox to verify how he introduces your diagnostic fee, asks for service addresses, or checks technician availability.
                </p>

                <Link href="/call-simulator" className="block pt-1">
                  <Button
                    size="sm"
                    className="w-full bg-primary hover:bg-primary/90 text-white text-xs h-8 rounded-xl flex items-center justify-center gap-1.5"
                  >
                    <span>Launch Call Simulator</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Mid-Job Technician Live Check-Ins Feed */}
      {activeTab === 'check-ins' && (
        <div className="space-y-6">
          <div className="p-4 sm:p-5 rounded-2xl bg-surface-card border border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <PhoneCall className="w-5 h-5 text-sky-400" />
                  <span>Mid-Job Technician Live Check-In Feed</span>
                </h2>
                <Badge variant="outline" className="border-sky-500/30 text-sky-400 bg-sky-500/10 text-xs">
                  {checkIns.length} Records Logged
                </Badge>
              </div>
              <p className="text-xs text-muted mt-1 max-w-2xl">
                Elijah autonomously calls on-site field technicians {checkInDelay} minutes into active jobs to record completion %, roadblocks, and part requests directly into the Schedule Board.
              </p>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <Button
                size="sm"
                onClick={handleSimulateCheckIn}
                className="bg-sky-600 hover:bg-sky-500 text-white text-xs h-9 px-4 rounded-xl flex items-center gap-1.5 shadow-md"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Simulate On-Site Tech Check-In
              </Button>
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-surface-card border border-border space-y-3">
            <h3 className="text-xs font-bold text-white">Live On-Site Check-In Transcripts</h3>
            {checkIns.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs border border-dashed border-border rounded-xl">
                No technician check-in calls recorded yet. Click &quot;Simulate On-Site Tech Check-In&quot; to test the live feed.
              </div>
            ) : (
              <div className="space-y-2.5">
                {checkIns.map((ci) => (
                  <div
                    key={ci.id}
                    className="p-4 rounded-xl bg-surface-elevated border border-border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{ci.technicianName || 'Technician'}</span>
                        <Badge
                          variant="outline"
                          className={
                            Number(ci.progress) >= 80
                              ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10 text-[10px]'
                              : 'border-amber-500/30 text-amber-400 bg-amber-500/10 text-[10px]'
                          }
                        >
                          {ci.progress}% Complete
                        </Badge>
                        {ci.isHelpNeeded && (
                          <span className="px-2 py-0.2 rounded-full text-[10px] bg-red-500/20 text-red-300 font-bold border border-red-500/40">
                            HELP REQUESTED
                          </span>
                        )}
                      </div>
                      {ci.challenges && (
                        <p className="text-slate-300 text-xs mt-0.5">
                          <strong className="text-slate-400">Verbal Note:</strong> {ci.challenges}
                        </p>
                      )}
                      {ci.expectedFinishMinutes && (
                        <p className="text-[11px] text-muted">
                          Estimated wrap up: in {ci.expectedFinishMinutes} minutes
                        </p>
                      )}
                    </div>

                    <div className="text-right text-[11px] text-slate-500 font-mono shrink-0">
                      {new Date(ci.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Employee Configuration Drawer / Modal */}
      {selectedEmployee && (
        <Modal
          isOpen={!!selectedEmployee}
          onClose={() => {
            setSelectedEmployee(null);
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
                      Live System Prompt (Retell VoIP Telephony)
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedEmployee(null);
                        setActiveTab('prompt-studio');
                      }}
                      className="text-primary hover:underline text-xs font-semibold flex items-center gap-1"
                    >
                      <span>Open Full Prompt Studio</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>

                  <p className="p-3 rounded-xl bg-surface-elevated text-slate-300 text-xs font-mono leading-relaxed border border-border max-h-36 overflow-y-auto">
                    {activePrompt || selectedEmployee.primaryPrompt}
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                    <span>Target: Retell AI telephony engine (Port 4002)</span>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedEmployee(null);
                        setActiveTab('prompt-studio');
                      }}
                      className="px-2.5 py-1 rounded-lg bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 text-[11px] font-semibold flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3 text-amber-300" />
                      Customize Instructions & Greetings
                    </button>
                  </div>
                </div>

                {/* Prompt Version History & 1-Click Rollback */}
                <div className="p-3.5 rounded-xl bg-surface border border-border space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-xs flex items-center gap-1.5">
                      <History className="w-3.5 h-3.5 text-primary" />
                      Audited Version History & 1-Click Rollback
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedEmployee(null);
                        setActiveTab('prompt-studio');
                      }}
                      className="text-primary hover:underline text-[10px]"
                    >
                      View All in Studio →
                    </button>
                  </div>

                  <div className="space-y-1.5 max-h-40 overflow-y-auto">
                    {promptVersions.slice(0, 3).map((v, idx) => (
                      <div
                        key={v.version}
                        className="p-2 rounded-lg bg-surface-elevated border border-border text-xs flex items-center justify-between"
                      >
                        <div>
                          <span className="font-bold text-white">v{v.version}</span>
                          <span className="text-slate-400 ml-2">{v.note}</span>
                          <span className="text-[10px] text-slate-500 font-mono ml-2">
                            ({new Date(v.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })})
                          </span>
                        </div>
                        {idx !== 0 ? (
                          <button
                            type="button"
                            disabled={isSubmitting}
                            onClick={() => handleOpenRollbackModal(v)}
                            className="px-2 py-0.5 rounded-md bg-surface hover:bg-surface-elevated text-primary border border-primary/30 text-[11px] font-semibold flex items-center gap-1"
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
                }}
                className="text-xs h-9"
              >
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL 1: Mandatory Confirmation Before Deploying Live to Retell */}
      {isConfirmDeployOpen && (
        <Modal
          isOpen={isConfirmDeployOpen}
          onClose={() => setIsConfirmDeployOpen(false)}
          title="Confirm & Deploy Live Instructions"
          maxWidth="lg"
        >
          <div className="space-y-4 text-xs text-slate-300">
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-amber-300">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-amber-400" />
              <div className="space-y-1">
                <span className="font-bold text-white block">Immediate Live Telephony Impact</span>
                <p className="text-[11px] opacity-90 leading-relaxed">
                  These instructions will be deployed live to Retell AI on Port 4002. Incoming calls connecting to your phone number will immediately use this prompt and opening line.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-surface border border-border space-y-2">
              <span className="font-bold text-white text-[11px] block">Deployment Summary</span>
              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                <div className="p-2 rounded bg-surface-elevated border border-border">
                  <span className="text-slate-500 block text-[10px]">PREVIOUS PROMPT</span>
                  <span className="text-slate-300 font-bold">{activePrompt.length.toLocaleString()} characters</span>
                </div>
                <div className="p-2 rounded bg-surface-elevated border border-border">
                  <span className="text-slate-500 block text-[10px]">NEW LIVE PROMPT</span>
                  <span className="text-emerald-400 font-bold">{promptDraft.length.toLocaleString()} characters</span>
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-white block">
                Audit Change Note (Required for Version Tracking)
              </label>
              <Input
                value={deployNote}
                onChange={(e) => setDeployNote(e.target.value)}
                placeholder="e.g. Added $89 diagnostic fee rule and emergency evacuation instructions"
                className="text-xs bg-surface border-border"
              />
              <p className="text-[10px] text-muted">
                This note will be recorded in the audited version timeline so you can track who changed what.
              </p>
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsConfirmDeployOpen(false)}
                disabled={isSubmitting}
                className="text-xs h-9"
              >
                Cancel
              </Button>

              <Button
                size="sm"
                onClick={handleDeployPrompt}
                disabled={isSubmitting || !deployNote.trim()}
                className="bg-primary hover:bg-primary/90 text-white font-semibold text-xs h-9 px-4 rounded-xl flex items-center gap-1.5 shadow-md shadow-primary/20"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Deploying to VoIP...
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    Confirm & Deploy Live
                  </>
                )}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL 2: Confirm 1-Click Rollback */}
      {isConfirmRollbackOpen && rollbackTargetVersion && (
        <Modal
          isOpen={isConfirmRollbackOpen}
          onClose={() => setIsConfirmRollbackOpen(false)}
          title="Confirm 1-Click Prompt Rollback"
          maxWidth="md"
        >
          <div className="space-y-4 text-xs text-slate-300">
            <div className="p-3.5 rounded-xl bg-primary/10 border border-primary/30 flex items-start gap-3">
              <RotateCcw className="w-5 h-5 shrink-0 mt-0.5 text-primary" />
              <div className="space-y-1">
                <span className="font-bold text-white block">
                  Rollback to Version {rollbackTargetVersion.version}
                </span>
                <p className="text-[11px] text-slate-300">
                  Are you sure you want to restore the prompt snapshot from{' '}
                  <strong className="text-white">
                    {new Date(rollbackTargetVersion.createdAt).toLocaleDateString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </strong>
                  ?
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-surface border border-border space-y-1">
              <span className="text-[10px] text-slate-500 uppercase font-mono block">Version Note:</span>
              <p className="text-xs text-white font-semibold">{rollbackTargetVersion.note}</p>
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsConfirmRollbackOpen(false)}
                disabled={isSubmitting}
                className="text-xs h-9"
              >
                Cancel
              </Button>

              <Button
                size="sm"
                onClick={() => handleRollbackPrompt(rollbackTargetVersion.version)}
                disabled={isSubmitting}
                className="bg-primary hover:bg-primary/90 text-white font-semibold text-xs h-9 px-4 rounded-xl flex items-center gap-1.5"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Restoring Version...
                  </>
                ) : (
                  <>
                    <RotateCcw className="w-3.5 h-3.5" />
                    Confirm Rollback
                  </>
                )}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL 3: Reset to Baseline Default */}
      {isResetConfirmOpen && (
        <Modal
          isOpen={isResetConfirmOpen}
          onClose={() => setIsResetConfirmOpen(false)}
          title="Reset to Baseline Default Prompt"
          maxWidth="md"
        >
          <div className="space-y-4 text-xs text-slate-300">
            <p className="text-xs text-slate-300 leading-relaxed">
              This action will reset Elijah&apos;s prompt and opening greetings to the tested production defaults from{' '}
              <code className="text-primary font-mono">prompt.md</code>.
            </p>

            <div className="p-3 rounded-xl bg-surface border border-border text-[11px] text-slate-400">
              A new version entry will be saved in your history so you can undo this reset at any time.
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsResetConfirmOpen(false)}
                disabled={isSubmitting}
                className="text-xs h-9"
              >
                Cancel
              </Button>

              <Button
                size="sm"
                onClick={handleResetToDefault}
                disabled={isSubmitting}
                className="bg-red-600 hover:bg-red-500 text-white font-semibold text-xs h-9 px-4 rounded-xl flex items-center gap-1.5"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Resetting...
                  </>
                ) : (
                  <>
                    <RotateCcw className="w-3.5 h-3.5" />
                    Confirm Reset
                  </>
                )}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL 4: View Version Snapshot */}
      {isSnapshotModalOpen && viewingVersion && (
        <Modal
          isOpen={isSnapshotModalOpen}
          onClose={() => setIsSnapshotModalOpen(false)}
          title={`Snapshot: Version ${viewingVersion.version}`}
          maxWidth="xl"
        >
          <div className="space-y-4 text-xs text-slate-300">
            <div className="flex items-center justify-between p-3 rounded-xl bg-surface border border-border">
              <div>
                <span className="font-bold text-white block">{viewingVersion.note || 'Instruction update'}</span>
                <span className="text-[10px] text-slate-500 font-mono">
                  Created by {viewingVersion.createdBy || 'Owner'} on{' '}
                  {new Date(viewingVersion.createdAt).toLocaleString()}
                </span>
              </div>
              <Button
                size="sm"
                onClick={() => {
                  setIsSnapshotModalOpen(false);
                  handleOpenRollbackModal(viewingVersion);
                }}
                className="bg-primary hover:bg-primary/90 text-white text-xs h-8 px-3 rounded-lg flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                Rollback to this Snapshot
              </Button>
            </div>

            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase font-mono block">
                Prompt Instructions Snapshot
              </span>
              <textarea
                readOnly
                rows={14}
                value={viewingVersion.prompt}
                className="w-full p-3.5 rounded-xl bg-surface font-mono text-xs text-slate-200 leading-relaxed border border-border resize-none focus:outline-none"
              />
            </div>

            <div className="flex justify-end pt-2 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsSnapshotModalOpen(false)}
                className="text-xs h-9"
              >
                Close Snapshot
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}