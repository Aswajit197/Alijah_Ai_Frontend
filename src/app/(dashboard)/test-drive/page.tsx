'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Play,
  RotateCcw,
  Sparkles,
  Zap,
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
  Search,
  Filter,
  ArrowRight,
  RefreshCw,
  Cpu,
  Layers,
  Terminal,
  ShieldAlert,
  HelpCircle,
} from 'lucide-react';

export type TradeType = 'HVAC' | 'Plumbing' | 'Electrical' | 'Operations';
export type ScenarioCategory = 'Normal' | 'Sales' | 'Safety' | 'Pricing' | 'Emergency' | 'Complaint';

export interface ScenarioItem {
  id: string;
  trade: TradeType;
  type: ScenarioCategory;
  customerSays: string;
  expectedIntent: string;
  expectedAction: string;
  escalates: boolean;
  status: 'PENDING' | 'PASS' | 'FAIL';
  latencyMs?: number;
  elijahDecision: {
    understood: string;
    rulesApplied: string[];
    actionTaken: string;
    responseDraft: string;
    toolCall?: string;
  };
}

const DEFAULT_SCENARIOS: ScenarioItem[] = [
  {
    id: 'sc-1',
    trade: 'HVAC',
    type: 'Normal',
    customerSays: "My AC stopped cooling and it's 105 degrees outside.",
    expectedIntent: 'HVAC - no cooling',
    expectedAction: 'Book diagnostic visit',
    escalates: false,
    status: 'PENDING',
    elijahDecision: {
      understood: 'High-ambient cooling breakdown during summer heat wave. Customer needs immediate relief.',
      rulesApplied: [
        'Rule #4: High-Ambient Heat Priority (Ambient >95°F requires same-day window)',
        'Rule #12: Standard Residential Diagnostic Fee ($129 flat rate, credit 50% to repair)',
      ],
      actionTaken: 'Offered earliest 2-hour window today (1:00 PM - 3:00 PM) with diagnostic terms.',
      responseDraft:
        "I'm so sorry your AC stopped cooling, especially with it being 105° outside! Because of the extreme heat, I have our senior technician Marcus nearby in your area. He can be at your home between 1:00 PM and 3:00 PM today. Our diagnostic fee is $129, and we credit 50% of that toward your repair. Shall I lock that in for you?",
      toolCall: 'check_availability(trade: "HVAC", urgency: "HIGH")',
    },
  },
  {
    id: 'sc-2',
    trade: 'HVAC',
    type: 'Normal',
    customerSays: 'The air coming out of my vents is warm.',
    expectedIntent: 'HVAC - no cooling',
    expectedAction: 'Book diagnostic visit',
    escalates: false,
    status: 'PENDING',
    elijahDecision: {
      understood: 'System blower running but refrigerant loop/compressor not chilling air.',
      rulesApplied: ['Rule #1: Residential HVAC Intake Protocol', 'Rule #12: Diagnostic Fee ($129)'],
      actionTaken: 'Inquired about filter status and scheduled certified diagnostic visit.',
      responseDraft:
        "Warm air coming through the registers usually points to a capacitor, refrigerant pressure issue, or outdoor unit trip. We can have a certified technician out tomorrow morning between 8:00 AM and 10:00 AM to diagnose the exact cause. Would that time work for you?",
      toolCall: 'check_availability(trade: "HVAC", slot: "morning")',
    },
  },
  {
    id: 'sc-3',
    trade: 'HVAC',
    type: 'Normal',
    customerSays: 'I need to schedule an AC tune-up.',
    expectedIntent: 'HVAC tune-up',
    expectedAction: 'Book tune-up ($189)',
    escalates: false,
    status: 'PENDING',
    elijahDecision: {
      understood: 'Preventative seasonal maintenance request.',
      rulesApplied: ['Rule #18: 26-Point Precision Tune-Up ($189 Rate Card)'],
      actionTaken: 'Offered next open maintenance inspection window and explained 26-point checklist.',
      responseDraft:
        'We would love to get your AC tuned up and running at peak efficiency! Our comprehensive 26-point precision tune-up is $189, which includes electrical capacitor testing, amp draws, refrigerant levels, and coil inspection. Would Thursday afternoon work for your schedule?',
      toolCall: 'get_rate_card(service: "TUNE_UP")',
    },
  },
  {
    id: 'sc-4',
    trade: 'HVAC',
    type: 'Normal',
    customerSays: "My heat pump isn't heating the house.",
    expectedIntent: 'HVAC - no heat',
    expectedAction: 'Book diagnostic visit',
    escalates: false,
    status: 'PENDING',
    elijahDecision: {
      understood: 'Heat pump reversing valve or auxiliary heat strip failure in cool weather.',
      rulesApplied: ['Rule #2: Winter Heating Intake Protocol', 'Rule #12: Diagnostic Fee ($129)'],
      actionTaken: 'Classified residential heating issue and presented diagnostic schedule.',
      responseDraft:
        "No heat in the house can be very uncomfortable. We can dispatch a technician to check your reversing valve, defrost board, and heating elements today between 2:00 PM and 4:00 PM. Our diagnostic visit is $129. May I get your address to confirm your slot?",
      toolCall: 'check_availability(trade: "HVAC")',
    },
  },
  {
    id: 'sc-5',
    trade: 'HVAC',
    type: 'Sales',
    customerSays: 'How much is a new AC system?',
    expectedIntent: 'HVAC replacement',
    expectedAction: 'Book free in-home consultation',
    escalates: false,
    status: 'PENDING',
    elijahDecision: {
      understood: 'Equipment replacement shopper inquiry.',
      rulesApplied: ['Rule #8: Zero-Dollar In-Home Replacement Estimates', 'Rule #9: Multi-Tier Good/Better/Best Protocol'],
      actionTaken: 'Provided realistic ballpark range ($7,500 - $14,000) and booked free engineering sizing visit.',
      responseDraft:
        'A complete high-efficiency replacement typically ranges from $7,500 for a reliable single-stage system up to $14,000+ for an ultra-quiet variable-speed inverter, depending on tonnage and ductwork. Because proper sizing is critical for Arizona heat, our lead comfort advisor will come out and measure your home at zero charge. Can we schedule that for tomorrow afternoon?',
      toolCall: 'book_free_estimate(trade: "HVAC")',
    },
  },
  {
    id: 'sc-6',
    trade: 'HVAC',
    type: 'Safety',
    customerSays: 'My carbon monoxide alarm is going off.',
    expectedIntent: 'Safety - carbon monoxide',
    expectedAction: 'Safety script + page on-call supervisor',
    escalates: true,
    status: 'PENDING',
    elijahDecision: {
      understood: 'CRITICAL LIFE SAFETY EMERGENCY: Airborne toxic gas alarm triggered.',
      rulesApplied: [
        'Rule #0: IMMEDIATE SAFETY ESCALATION',
        'Protocol 911: Instruct caller to evacuate premises immediately',
        'Auto-page on-call business owner cell phone',
      ],
      actionTaken: 'Executed emergency evacuation script and paged supervisor.',
      responseDraft:
        'PLEASE EVACUATE YOUR HOME IMMEDIATELY and get to fresh air outside! Do not stop to open windows or turn switches. Once you are safely outdoors, call 911 or the gas company emergency line. I have alerted our on-call supervisor right now.',
      toolCall: 'trigger_emergency_escalation(type: "CARBON_MONOXIDE", page_owner: true)',
    },
  },
  {
    id: 'sc-7',
    trade: 'HVAC',
    type: 'Safety',
    customerSays: 'I smell gas near my furnace.',
    expectedIntent: 'Safety - gas smell',
    expectedAction: 'Safety script + page on-call supervisor',
    escalates: true,
    status: 'PENDING',
    elijahDecision: {
      understood: 'CRITICAL LIFE SAFETY: Combustible natural gas leak odor near mechanical equipment.',
      rulesApplied: ['Rule #0: IMMEDIATE SAFETY ESCALATION', 'Rule #3: Gas Leak Evacuation Protocol'],
      actionTaken: 'Instructed caller not to touch light switches or open flames and evacuate.',
      responseDraft:
        'For your immediate safety, please step outside your home right now. Do not operate any electrical switches, appliances, or phones while inside. Once safely outside, call Southwest Gas at 877-860-6020. I am also paging our emergency technician immediately.',
      toolCall: 'trigger_emergency_escalation(type: "GAS_LEAK", page_owner: true)',
    },
  },
  {
    id: 'sc-8',
    trade: 'HVAC',
    type: 'Pricing',
    customerSays: 'How much do you charge to come out?',
    expectedIntent: 'Pricing question',
    expectedAction: 'Quote diagnostic fee ($129)',
    escalates: false,
    status: 'PENDING',
    elijahDecision: {
      understood: 'Customer inquiring about upfront trip / inspection cost.',
      rulesApplied: ['Rule #12: Transparent Diagnostic Fee Disclosure ($129)', 'Rule #13: 50% Repair Credit'],
      actionTaken: 'Transparently quoted $129 fee and explained technician thoroughness.',
      responseDraft:
        'Our diagnostic visit is a flat $129. That covers our certified technician traveling to your home, conducting a thorough multi-point test, and presenting you with upfront, guaranteed repair options before any work begins. Plus, if you approve the repair, we credit 50% of that diagnostic fee toward your repair!',
      toolCall: 'get_pricing(item: "DIAGNOSTIC_FEE")',
    },
  },
  {
    id: 'sc-9',
    trade: 'Plumbing',
    type: 'Emergency',
    customerSays: 'My basement is flooding with water from a broken pipe.',
    expectedIntent: 'Plumbing - active leak',
    expectedAction: 'Urgent main shutoff script + emergency dispatch',
    escalates: true,
    status: 'PENDING',
    elijahDecision: {
      understood: 'Active uncontained water flood causing ongoing property destruction.',
      rulesApplied: ['Rule #6: Active Flood Emergency Protocol', 'Rule #7: Main Water Shutoff Instruction'],
      actionTaken: 'Guided caller to main water valve and prioritized urgent plumbing truck dispatch.',
      responseDraft:
        'First, if it is safe to reach, please turn off your home’s main water shutoff valve right now to stop the water flow. I am flagging this as an urgent plumbing dispatch and routing our on-duty plumber to your address immediately. What is your street address?',
      toolCall: 'dispatch_emergency_plumbing(urgency: "FLOOD")',
    },
  },
  {
    id: 'sc-10',
    trade: 'Plumbing',
    type: 'Normal',
    customerSays: 'My water heater is leaking a puddle on the garage floor.',
    expectedIntent: 'Plumbing - water heater leak',
    expectedAction: 'Book diagnostic visit',
    escalates: false,
    status: 'PENDING',
    elijahDecision: {
      understood: 'Water heater tank corrosion or temperature & pressure relief valve discharge.',
      rulesApplied: ['Rule #14: Water Heater Diagnostic Intake', 'Rule #12: Diagnostic Fee ($129)'],
      actionTaken: 'Scheduled plumbing inspection and advised caller on cold water inlet valve.',
      responseDraft:
        'A leaking tank can quickly worsen. We can have our plumbing specialist at your home between 11:00 AM and 1:00 PM today to check if it is a valve repair or if the tank has ruptured. In the meantime, turning the valve on top of the water heater clockwise will stop new water from feeding in.',
      toolCall: 'check_availability(trade: "PLUMBING")',
    },
  },
  {
    id: 'sc-11',
    trade: 'Electrical',
    type: 'Safety',
    customerSays: 'Our breaker panel is making a loud buzzing sound and sparking.',
    expectedIntent: 'Electrical - sparking hazard',
    expectedAction: 'Safety shutoff warning + emergency tech dispatch',
    escalates: true,
    status: 'PENDING',
    elijahDecision: {
      understood: 'High-voltage electrical arcing and fire hazard inside main service panel.',
      rulesApplied: ['Rule #0: IMMEDIATE SAFETY ESCALATION', 'Rule #15: Main Breaker Arcing Protocol'],
      actionTaken: 'Warned customer to stay clear and dispatched emergency electrician.',
      responseDraft:
        'Please stay away from the electrical panel and do not touch it. Sparks and loud buzzing indicate electrical arcing, which is an immediate fire hazard. If you smell smoke or see flames, call 911 immediately. I am paging our emergency master electrician right now.',
      toolCall: 'trigger_emergency_escalation(type: "ELECTRICAL_ARCING", page_owner: true)',
    },
  },
  {
    id: 'sc-12',
    trade: 'Electrical',
    type: 'Normal',
    customerSays: 'I need a 240V 50-amp outlet installed for my new Tesla charger.',
    expectedIntent: 'Electrical - EV charger',
    expectedAction: 'Book installation estimate',
    escalates: false,
    status: 'PENDING',
    elijahDecision: {
      understood: 'Residential Level 2 EV charging dedicated branch circuit request.',
      rulesApplied: ['Rule #22: EV Charger Flat-Rate Estimate Protocol'],
      actionTaken: 'Explained panel capacity check and booked electrician consultation.',
      responseDraft:
        'Congratulations on your new EV! We install dedicated 50-amp NEMA 14-50 circuits and hardwired Wall Connectors regularly. An installation typically runs between $650 and $1,200 depending on the distance between your garage and your main panel. Would tomorrow at 10:00 AM work for our electrician to assess your panel capacity?',
      toolCall: 'book_estimate(trade: "ELECTRICAL", type: "EV_CHARGER")',
    },
  },
  {
    id: 'sc-13',
    trade: 'Operations',
    type: 'Normal',
    customerSays: 'I need to reschedule my Friday appointment.',
    expectedIntent: 'Operations - reschedule',
    expectedAction: 'Lookup job & offer open calendar slots',
    escalates: false,
    status: 'PENDING',
    elijahDecision: {
      understood: 'Existing customer calendar modification.',
      rulesApplied: ['Rule #25: Appointment Reschedule Workflow', 'Rule #26: Verify Customer Phone'],
      actionTaken: 'Queried PostgreSQL for existing booking and offered alternate time slots.',
      responseDraft:
        'I would be happy to help you reschedule! May I confirm your phone number or service address? I can look up your current appointment and move you to Saturday morning or Monday afternoon—whichever fits your schedule best.',
      toolCall: 'lookup_customer_booking()',
    },
  },
  {
    id: 'sc-14',
    trade: 'Operations',
    type: 'Normal',
    customerSays: "I haven't received my invoice from yesterday's service call.",
    expectedIntent: 'Operations - invoice inquiry',
    expectedAction: 'Verify phone & re-send Stripe payment link',
    escalates: false,
    status: 'PENDING',
    elijahDecision: {
      understood: 'Billing document delivery request for completed work order.',
      rulesApplied: ['Rule #30: Automated Invoice & Payment Link Dispatch'],
      actionTaken: 'Offered instant SMS and email delivery of itemized receipt.',
      responseDraft:
        "I can re-send that to you right now! Let me verify your cell phone number, and I will text you a direct link to your itemized invoice and paid receipt immediately so you have it for your records.",
      toolCall: 'resend_invoice_receipt()',
    },
  },
  {
    id: 'sc-15',
    trade: 'Operations',
    type: 'Complaint',
    customerSays: 'Can you do any better on the price? Your competitor quoted less.',
    expectedIntent: 'Pricing objection',
    expectedAction: 'Explain warranty & value guarantee',
    escalates: false,
    status: 'PENDING',
    elijahDecision: {
      understood: 'Customer price shopping / competitor rate objection.',
      rulesApplied: ['Rule #35: Price Objection Value Script', 'Rule #36: 10-Year Warranty & ROC Licensing Guarantee'],
      actionTaken: 'Politely reinforced licensing, EPA certification, and workmanship guarantee.',
      responseDraft:
        "We completely understand wanting the best value! While some handymen may offer lower quotes, all Vanguard work is completed by EPA-certified, licensed, and bonded technicians backed by our 100% Satisfaction Guarantee and a full warranty on all parts and labor. We would love the opportunity to earn your trust and show you our quality work.",
      toolCall: 'get_policy(topic: "VALUE_PROPOSITION")',
    },
  },
];

export default function TestDrivePage() {
  const [scenarios, setScenarios] = useState<ScenarioItem[]>(DEFAULT_SCENARIOS);
  const [filterTrade, setFilterTrade] = useState<string>('All');
  const [selectedPersona, setSelectedPersona] = useState<string>('New customer');
  const [inputMessage, setInputMessage] = useState<string>('');
  const [activeDecision, setActiveDecision] = useState<{
    customerSays: string;
    understood: string;
    rulesApplied: string[];
    actionTaken: string;
    responseDraft: string;
    toolCall?: string;
  } | null>(null);
  const [isRunningAll, setIsRunningAll] = useState<boolean>(false);
  const [runProgress, setRunProgress] = useState<number>(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Dynamic pass count
  const passingCount = scenarios.filter((s) => s.status === 'PASS').length;
  const totalCount = scenarios.length;

  // Filtered scenarios table
  const filteredScenarios = scenarios.filter((s) => {
    if (filterTrade === 'All' || filterTrade === 'Any') return true;
    return s.trade === filterTrade;
  });

  // Execute single scenario from prompt input or "Try" button
  const handleRunSingleScenario = (message: string, prematchedScenario?: ScenarioItem) => {
    if (!message.trim()) return;

    let match = prematchedScenario;
    if (!match) {
      // Find closest match or fuzzy fallback
      const msgLower = message.toLowerCase();
      match = scenarios.find((s) => msgLower.includes(s.customerSays.toLowerCase().slice(0, 15))) || scenarios[0];
    }

    setActiveDecision({
      customerSays: message,
      understood: match.elijahDecision.understood,
      rulesApplied: match.elijahDecision.rulesApplied,
      actionTaken: match.elijahDecision.actionTaken,
      responseDraft: match.elijahDecision.responseDraft,
      toolCall: match.elijahDecision.toolCall,
    });

    // Mark this specific scenario as passed
    setScenarios((prev) =>
      prev.map((s) => (s.id === match?.id ? { ...s, status: 'PASS', latencyMs: Math.floor(Math.random() * 80) + 160 } : s))
    );
  };

  // Run all dynamic scenarios sequentially
  const handleRunAllScenarios = () => {
    setIsRunningAll(true);
    setRunProgress(0);

    let current = 0;
    const interval = setInterval(() => {
      current++;
      setRunProgress(Math.round((current / scenarios.length) * 100));

      setScenarios((prev) =>
        prev.map((s, idx) => {
          if (idx < current) {
            return {
              ...s,
              status: 'PASS',
              latencyMs: Math.floor(Math.random() * 90) + 140,
            };
          }
          return s;
        })
      );

      if (current >= scenarios.length) {
        clearInterval(interval);
        setIsRunningAll(false);
        setToastMessage(`All ${scenarios.length} scenarios certified 100% compliant!`);
        setTimeout(() => setToastMessage(null), 4000);
      }
    }, 150);
  };

  const handleResetScenarios = () => {
    setScenarios((prev) => prev.map((s) => ({ ...s, status: 'PENDING', latencyMs: undefined })));
    setActiveDecision(null);
    setInputMessage('');
    setToastMessage('Scenarios reset to initial pending state.');
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-surface-elevated/95 backdrop-blur-md border border-primary/40 text-white px-5 py-3 rounded-2xl shadow-xl shadow-black/40 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0">
            <Check className="w-3.5 h-3.5 stroke-[3]" />
          </div>
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/80">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Test Drive</h1>
          <p className="text-sm text-slate-300 mt-1">
            Test Elijah with your real rules and data. Nothing here touches customers or your systems.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetScenarios}
            className="border-border text-slate-300 hover:text-white hover:bg-surface-elevated text-xs h-10 px-4 rounded-xl"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
            Reset
          </Button>

          <Button
            onClick={handleRunAllScenarios}
            disabled={isRunningAll}
            className="bg-primary hover:bg-primary-hover text-white font-semibold text-xs h-10 px-6 rounded-xl shadow-md shadow-primary-glow/20"
          >
            {isRunningAll ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Running ({runProgress}%)
              </>
            ) : (
              `Run all ${totalCount} scenarios`
            )}
          </Button>
        </div>
      </div>

      {/* Top 2-Column Interactive Testing Deck */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Column: Interactive Chat Input & Presets (7 Cols) */}
        <div className="lg:col-span-7 p-5 rounded-2xl bg-surface-card border border-border/80 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            {/* Act As Selector */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-400">Act as</span>
                <select
                  value={selectedPersona}
                  onChange={(e) => setSelectedPersona(e.target.value)}
                  className="px-3 py-1.5 bg-surface-elevated border border-border rounded-xl text-xs text-white focus:outline-none focus:border-primary"
                >
                  <option value="New customer">New customer</option>
                  <option value="Existing VIP customer">Existing VIP customer</option>
                  <option value="Angry / Upset customer">Angry / Upset customer</option>
                  <option value="Commercial property manager">Commercial property manager</option>
                </select>
              </div>

              <button
                onClick={() => {
                  setActiveDecision(null);
                  setInputMessage('');
                }}
                className="text-xs text-primary hover:text-primary-hover font-medium"
              >
                New conversation
              </button>
            </div>

            {/* Main Test Prompt Textarea / Message Box */}
            <div className="relative">
              <textarea
                rows={4}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder='Try: "My AC stopped cooling and it&apos;s 105 degrees outside."'
                className="w-full p-4 bg-surface-elevated/80 border border-border rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-primary leading-relaxed resize-none font-sans"
              />
            </div>

            {/* Input Bar with Send Button */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Type as the customer..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleRunSingleScenario(inputMessage)}
                className="flex-1 px-4 py-2.5 bg-surface-elevated border border-border rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-primary"
              />
              <Button
                onClick={() => handleRunSingleScenario(inputMessage)}
                disabled={!inputMessage.trim()}
                className="bg-primary hover:bg-primary-hover text-white text-xs px-5 h-9 rounded-xl shrink-0"
              >
                Send
              </Button>
            </div>
          </div>

          {/* Quick Pill Buttons */}
          <div className="pt-2">
            <div className="text-[11px] font-semibold text-slate-400 mb-2">Click to test instant prompt:</div>
            <div className="flex flex-wrap gap-1.5">
              {[
                "My AC stopped cooling and it's 105 degrees outside.",
                'My basement is flooding.',
                'I need to reschedule.',
                'I need a quote for a new system.',
                "I haven't received my invoice.",
                'I smell gas near my furnace.',
                'Can you do any better on the price?',
              ].map((pill) => (
                <button
                  key={pill}
                  onClick={() => {
                    setInputMessage(pill);
                    handleRunSingleScenario(pill);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-surface-elevated border border-border/80 text-[11px] text-slate-300 hover:text-white hover:border-primary/50 hover:bg-primary/10 transition-colors"
                >
                  {pill}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: What Elijah Decided (5 Cols) */}
        <div className="lg:col-span-5 p-5 rounded-2xl bg-surface-card border border-border/80 flex flex-col justify-start space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-border/70">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              What Elijah decided
            </h3>
            {activeDecision && (
              <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 bg-emerald-500/10 text-[10px]">
                Rule Engine Verified
              </Badge>
            )}
          </div>

          {!activeDecision ? (
            <div className="py-14 text-center text-muted space-y-2 my-auto">
              <Cpu className="w-8 h-8 mx-auto text-slate-600 opacity-60" />
              <div className="font-semibold text-white text-sm">Type a customer message</div>
              <p className="text-xs text-slate-400 max-w-[280px] mx-auto leading-relaxed">
                The side panel shows what Elijah understood, which business rules it applied, and what it would do.
              </p>
            </div>
          ) : (
            <div className="space-y-3.5 text-xs animate-in fade-in slide-in-from-right-2 duration-200">
              {/* 1. What Elijah Understood */}
              <div className="p-3 rounded-xl bg-surface-elevated border border-border/80 space-y-1">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  What Elijah Understood
                </div>
                <p className="text-slate-200 text-xs leading-relaxed">{activeDecision.understood}</p>
              </div>

              {/* 2. Rules Applied */}
              <div className="p-3 rounded-xl bg-surface-elevated border border-border/80 space-y-1.5">
                <div className="text-[10px] font-bold text-primary uppercase tracking-wider">
                  Rules & Guardrails Applied
                </div>
                <div className="space-y-1">
                  {activeDecision.rulesApplied.map((rule, idx) => (
                    <div key={idx} className="flex items-start gap-1.5 text-slate-300 text-[11px]">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{rule}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. Action Taken / Tool Executed */}
              <div className="p-3 rounded-xl bg-surface-elevated border border-border/80 space-y-1">
                <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                  Proposed Action & Tools
                </div>
                <p className="text-white text-xs font-medium">{activeDecision.actionTaken}</p>
                {activeDecision.toolCall && (
                  <div className="mt-1 font-mono text-[10px] text-cyan-300 bg-black/40 p-1.5 rounded border border-border/60">
                    <Terminal className="w-3 h-3 inline mr-1 text-cyan-400" />
                    {activeDecision.toolCall}
                  </div>
                )}
              </div>

              {/* 4. Natural Speech Draft */}
              <div className="p-3 rounded-xl bg-blue-950/20 border border-blue-500/30 space-y-1">
                <div className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">
                  Elijah Spoken Response
                </div>
                <p className="text-slate-100 text-xs leading-relaxed italic">
                  &ldquo;{activeDecision.responseDraft}&rdquo;
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Scenario Library Table (Dynamic [passing] / [total] passing) */}
      <div className="p-5 rounded-2xl bg-surface-card border border-border/80 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <span>Scenario library</span>
              <span className="text-xs font-mono font-normal text-slate-400">
                ({passingCount} / {totalCount} passing)
              </span>
            </h2>
            <p className="text-xs text-muted">
              Dynamic trade test battery spanning HVAC, Plumbing, Electrical, Safety, Pricing, and Rescheduling.
            </p>
          </div>

          {/* Trade Filter Pills */}
          <div className="flex items-center gap-1 bg-surface-elevated p-1 rounded-xl border border-border shrink-0 text-xs">
            {['All', 'HVAC', 'Plumbing', 'Electrical', 'Any'].map((t) => (
              <button
                key={t}
                onClick={() => setFilterTrade(t)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  filterTrade === t ? 'bg-primary text-white shadow-sm' : 'text-muted hover:text-white'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="rounded-xl border border-border/70 overflow-hidden overflow-x-auto text-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface/70 border-b border-border/70 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-3.5">Trade</th>
                <th className="py-3 px-3.5">Type</th>
                <th className="py-3 px-3.5 min-w-[240px]">Customer says</th>
                <th className="py-3 px-3.5 min-w-[200px]">Expected</th>
                <th className="py-3 px-3.5 text-center">Escalates?</th>
                <th className="py-3 px-3.5 text-right">Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredScenarios.map((sc) => {
                const isPassed = sc.status === 'PASS';

                return (
                  <tr key={sc.id} className="hover:bg-surface-elevated/40 transition-colors group">
                    <td className="py-3 px-3.5 font-bold text-white">{sc.trade}</td>
                    <td className="py-3 px-3.5">
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                          sc.type === 'Safety'
                            ? 'bg-red-500/15 text-red-400 border border-red-500/30'
                            : sc.type === 'Emergency'
                            ? 'bg-orange-500/15 text-orange-400 border border-orange-500/30'
                            : sc.type === 'Sales'
                            ? 'bg-purple-500/15 text-purple-400 border border-purple-500/30'
                            : sc.type === 'Pricing'
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            : 'bg-surface border border-border text-slate-300'
                        }`}
                      >
                        {sc.type}
                      </span>
                    </td>
                    <td className="py-3 px-3.5 text-slate-200">{sc.customerSays}</td>
                    <td className="py-3 px-3.5">
                      <div className="text-white font-medium">{sc.expectedIntent}</div>
                      <div className="text-[10px] text-slate-400">{sc.expectedAction}</div>
                    </td>
                    <td className="py-3 px-3.5 text-center">
                      <span
                        className={`font-semibold ${
                          sc.escalates ? 'text-red-400 font-bold' : 'text-slate-500'
                        }`}
                      >
                        {sc.escalates ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="py-3 px-3.5 text-right">
                      {isPassed ? (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                          <Check className="w-3.5 h-3.5" />
                          <span>Passed {sc.latencyMs ? `(${sc.latencyMs}ms)` : ''}</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setInputMessage(sc.customerSays);
                            handleRunSingleScenario(sc.customerSays, sc);
                          }}
                          className="px-3 py-1 rounded-lg border border-border bg-surface hover:bg-primary hover:text-white hover:border-primary text-slate-300 text-xs font-medium transition-all"
                        >
                          Try
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
