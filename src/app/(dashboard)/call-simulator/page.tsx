'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Badge } from '@/components/ui/badge';
import {
  PhoneCall,
  PhoneOff,
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
  Volume2,
  VolumeX,
  Terminal,
  Activity,
  Layers,
  Search,
  ExternalLink,
  Check,
  X,
  FileText,
  Calendar,
  Sliders,
  Radio,
} from 'lucide-react';

export interface ScenarioPreset {
  id: string;
  title: string;
  category: 'EMERGENCY' | 'PRICE_SHOP' | 'OUT_OF_AREA' | 'ESCALATION' | 'COMMERCIAL';
  callerName: string;
  callerPhone: string;
  callerAddress: string;
  description: string;
  difficulty: 'Standard' | 'Challenging' | 'Edge Case';
  trade: 'HVAC' | 'ELECTRICAL' | 'PLUMBING';
  turns: Array<{
    speaker: 'caller' | 'elijah';
    text: string;
    delayMs: number;
    toolCall?: {
      name: string;
      args: Record<string, any>;
      result: Record<string, any>;
      latencyMs: number;
    };
  }>;
}

const SCENARIOS: ScenarioPreset[] = [
  {
    id: 'sc-1',
    title: 'AC Failure in 108°F Heat with Water Dripping',
    category: 'EMERGENCY',
    callerName: 'Sarah Jenkins',
    callerPhone: '(480) 555-0192',
    callerAddress: '4221 E Camelback Rd, Phoenix, AZ 85018',
    description: 'Frustrated homeowner calling after AC stopped blowing cold air and indoor ceiling drywall is damp. Verifies emergency heat triage and priority dispatch slotting.',
    difficulty: 'Challenging',
    trade: 'HVAC',
    turns: [
      {
        speaker: 'elijah',
        text: 'Thank you for calling Vanguard Electric and Air. My name is Elijah, your AI assistant. How can I help you today?',
        delayMs: 600,
      },
      {
        speaker: 'caller',
        text: 'Hi! My AC unit completely stopped cooling and it is 108 degrees outside. Worse, there is water starting to drip through our upstairs ceiling!',
        delayMs: 1800,
      },
      {
        speaker: 'elijah',
        text: 'I completely understand how stressful that is, Sarah. Because your indoor temperature is rising rapidly and there is active water leakage, I am classifying this as an emergency dispatch. May I verify your service address so I can get a senior HVAC technician en route?',
        delayMs: 1400,
        toolCall: {
          name: 'classify_intent_and_urgency',
          args: { issue: 'AC stopped cooling + ceiling water leak', ambient_temp: 108 },
          result: { urgency: 'LEVEL_1_EMERGENCY', priority: 'HIGH', dispatch_protocol: 'SAME_DAY' },
          latencyMs: 142,
        },
      },
      {
        speaker: 'caller',
        text: 'Yes please, I am at 4221 East Camelback Road in Phoenix, 85018.',
        delayMs: 1600,
      },
      {
        speaker: 'elijah',
        text: 'Got it, 4221 East Camelback in Phoenix. We have our technician Marcus nearby in Arcadia who can be at your door between 1:00 PM and 3:00 PM today. Our diagnostic fee is $129, which we credit 50% toward your repair if you approve the work. Shall I lock that in for you right now?',
        delayMs: 1900,
        toolCall: {
          name: 'check_tech_availability_and_pricing',
          args: { zip: '85018', trade: 'HVAC', urgency: 'EMERGENCY' },
          result: { tech_name: 'Marcus Vance', slot: '1:00 PM - 3:00 PM', diagnostic_fee: 129.0 },
          latencyMs: 188,
        },
      },
      {
        speaker: 'caller',
        text: 'Yes please, book that right away! Thank you so much.',
        delayMs: 1200,
      },
      {
        speaker: 'elijah',
        text: 'You are all set, Sarah! I have booked Marcus for 1:00 PM to 3:00 PM today under Work Order JOB-1051. You will receive an SMS confirmation link with live technician tracking shortly. In the meantime, please turn off your thermostat to prevent further water overflow.',
        delayMs: 1700,
        toolCall: {
          name: 'create_work_order',
          args: { customer: 'Sarah Jenkins', phone: '(480) 555-0192', address: '4221 E Camelback Rd', slot: '1:00 PM - 3:00 PM' },
          result: { job_number: 'JOB-1051', status: 'BOOKED', calendar_synced: true, sse_broadcasted: true },
          latencyMs: 240,
        },
      },
    ],
  },
  {
    id: 'sc-2',
    title: 'Price Shopper Inquiring About Electrical Panel Upgrade',
    category: 'PRICE_SHOP',
    callerName: 'David Chen',
    callerPhone: '(602) 555-0344',
    callerAddress: '7810 N 16th St, Phoenix, AZ 85020',
    description: 'Homeowner bought a new Tesla and is shopping around for panel upgrade costs. Tests Elijah quoting pricing transparently and pitching free on-site consultation.',
    difficulty: 'Standard',
    trade: 'ELECTRICAL',
    turns: [
      {
        speaker: 'elijah',
        text: 'Thank you for calling Vanguard Electric and Air. My name is Elijah. How can I help you today?',
        delayMs: 600,
      },
      {
        speaker: 'caller',
        text: 'Hi, I just bought an electric vehicle and need to upgrade my main electrical panel to 200 amps. How much do you guys charge for that?',
        delayMs: 1600,
      },
      {
        speaker: 'elijah',
        text: 'Congratulations on the new EV! A standard 200-amp main electrical service upgrade typically ranges from $2,800 to $4,200 depending on your utility company meter feed and grounding requirements, and that includes city permit filing and inspection. We offer free on-site estimates for panel replacements. Would you like me to send our master electrician out to evaluate your panel at no charge?',
        delayMs: 2100,
        toolCall: {
          name: 'query_knowledge_base',
          args: { query: 'electrical panel 200A upgrade estimate pricing range' },
          result: { found: true, range: '$2,800 - $4,200', free_estimates: true },
          latencyMs: 86,
        },
      },
      {
        speaker: 'caller',
        text: 'Oh that is free? Sure! Can someone come by tomorrow afternoon around 2 PM?',
        delayMs: 1400,
      },
      {
        speaker: 'elijah',
        text: 'Yes! Tomorrow at 2:00 PM is wide open. May I get your name and service address?',
        delayMs: 1200,
        toolCall: {
          name: 'check_availability',
          args: { date: 'tomorrow', time: '14:00', trade: 'ELECTRICAL' },
          result: { available: true, slot: '2:00 PM - 4:00 PM' },
          latencyMs: 110,
        },
      },
    ],
  },
  {
    id: 'sc-3',
    title: 'Out of Coverage Area Inquiry (Tucson / 85701)',
    category: 'OUT_OF_AREA',
    callerName: 'Maria Rodriguez',
    callerPhone: '(520) 555-0891',
    callerAddress: '310 N Stone Ave, Tucson, AZ 85701',
    description: 'Caller asking for AC service in downtown Tucson. Verifies Elijah respectfully declines outside service ZIP while recommending partner network.',
    difficulty: 'Edge Case',
    trade: 'HVAC',
    turns: [
      {
        speaker: 'elijah',
        text: 'Thank you for calling Vanguard Electric and Air. My name is Elijah. How may I assist you?',
        delayMs: 600,
      },
      {
        speaker: 'caller',
        text: 'Hello, our commercial chiller in Tucson is making a loud buzzing noise. Can you send someone down here today?',
        delayMs: 1600,
      },
      {
        speaker: 'elijah',
        text: 'Thank you for reaching out! What ZIP code are you located in?',
        delayMs: 1000,
      },
      {
        speaker: 'caller',
        text: 'We are down in Tucson, ZIP code 85701.',
        delayMs: 1100,
      },
      {
        speaker: 'elijah',
        text: 'I appreciate you checking with us! Our direct emergency fleet currently covers the greater Phoenix Metropolitan area, including Scottsdale, Mesa, Tempe, and Chandler. Because Tucson is outside our immediate service radius, we cannot dispatch a technician today, but I would be glad to recommend our certified partner network in Pima County.',
        delayMs: 1900,
        toolCall: {
          name: 'validate_service_area',
          args: { zip: '85701' },
          result: { serviceable: false, reason: 'TUCSON_OUTSIDE_RADIUS', suggestion: 'REFER_PARTNER' },
          latencyMs: 95,
        },
      },
    ],
  },
  {
    id: 'sc-4',
    title: 'Unhappy Returning Customer - Warranty Re-Service',
    category: 'ESCALATION',
    callerName: 'Robert Vance',
    callerPhone: '(480) 555-0722',
    callerAddress: '1902 E Bell Rd, Phoenix, AZ 85022',
    description: 'Customer whose capacitor was replaced 4 days ago says cooling stopped again. Tests 100% free warranty re-visit protocol and priority dispatch without charging new diagnostic.',
    difficulty: 'Challenging',
    trade: 'HVAC',
    turns: [
      {
        speaker: 'elijah',
        text: 'Thank you for calling Vanguard Electric and Air. My name is Elijah. How can I help you?',
        delayMs: 600,
      },
      {
        speaker: 'caller',
        text: 'I am calling because your tech came out just 4 days ago to fix my AC and it just stopped working again! I already paid you guys $350 and I am not happy.',
        delayMs: 2000,
      },
      {
        speaker: 'elijah',
        text: 'I am so sorry to hear that, Robert. I see your work order from Tuesday where we replaced your dual capacitor. Under our Vanguard 100% Satisfaction Guarantee, all our repairs are backed by a 1-year parts and labor warranty, and we will never charge you another diagnostic fee for a repeat issue. I am flagging this as an immediate supervisor recall and can have our lead technician back at your home today between 3:00 PM and 5:00 PM at zero cost to diagnose. Would that work for you?',
        delayMs: 2400,
        toolCall: {
          name: 'lookup_customer_history_and_warranty',
          args: { phone: '(480) 555-0722' },
          result: { customer_found: true, last_job: 'JOB-1039', warranty_active: true, fee_override: 0.0 },
          latencyMs: 160,
        },
      },
      {
        speaker: 'caller',
        text: 'Okay, I appreciate you standing behind your work without arguing. Yes, please send the lead tech today at 3.',
        delayMs: 1400,
      },
    ],
  },
];

export default function CallSimulatorPage() {
  const [selectedScenario, setSelectedScenario] = useState<ScenarioPreset>(SCENARIOS[0]);
  const [isCallActive, setIsCallActive] = useState(false);
  const [currentTurnIndex, setCurrentTurnIndex] = useState<number>(-1);
  const [transcript, setTranscript] = useState<Array<{ speaker: 'caller' | 'elijah'; text: string; toolCall?: any }>>([]);
  const [toolCallsLog, setToolCallsLog] = useState<any[]>([]);
  const [audioMuted, setAudioMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<'1x' | '1.25x' | '1.5x'>('1x');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [activeSpeaker, setActiveSpeaker] = useState<'caller' | 'elijah' | null>(null);
  const [customCallerModal, setCustomCallerModal] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const transcriptScrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll transcript to bottom
  useEffect(() => {
    if (transcriptScrollRef.current) {
      transcriptScrollRef.current.scrollTop = transcriptScrollRef.current.scrollHeight;
    }
  }, [transcript]);

  // Turn Simulation Loop
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    if (isCallActive && currentTurnIndex < selectedScenario.turns.length) {
      const turn = selectedScenario.turns[currentTurnIndex];
      setActiveSpeaker(turn.speaker);
      setIsSpeaking(true);

      const delay = turn.delayMs / (playbackSpeed === '1.5x' ? 1.5 : playbackSpeed === '1.25x' ? 1.25 : 1);

      timeoutId = setTimeout(() => {
        setTranscript((prev) => [...prev, { speaker: turn.speaker, text: turn.text, toolCall: turn.toolCall }]);
        if (turn.toolCall) {
          setToolCallsLog((prev) => [turn.toolCall, ...prev]);
        }
        setIsSpeaking(false);
        setActiveSpeaker(null);

        // Advance to next turn
        if (currentTurnIndex + 1 < selectedScenario.turns.length) {
          setCurrentTurnIndex((prev) => prev + 1);
        } else {
          // Finished call
          setIsCallActive(false);
          setActionNotice('Call simulation completed! Work order & triage metrics recorded.');
          setTimeout(() => setActionNotice(null), 4000);
        }
      }, delay);
    }

    return () => clearTimeout(timeoutId);
  }, [isCallActive, currentTurnIndex, selectedScenario, playbackSpeed]);

  const handleStartCall = () => {
    setTranscript([]);
    setToolCallsLog([]);
    setIsCallActive(true);
    setCurrentTurnIndex(0);
  };

  const handleResetCall = () => {
    setIsCallActive(false);
    setCurrentTurnIndex(-1);
    setTranscript([]);
    setToolCallsLog([]);
    setIsSpeaking(false);
    setActiveSpeaker(null);
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-border/80">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/20">
              <PhoneCall className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-white">Interactive Call Simulator Sandbox</h1>
                <Badge variant="outline" className="border-cyan-500/30 text-cyan-400 bg-cyan-500/10 text-xs">
                  Voice Sandbox Live
                </Badge>
              </div>
              <p className="text-xs text-muted">
                Test and stress-test Elijah&apos;s autonomous voice receptionist, triage rules, and real CRM tool executions.
              </p>
            </div>
          </div>
        </div>

        {/* Top Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center bg-surface-elevated/80 border border-border rounded-xl p-1 text-xs">
            {(['1x', '1.25x', '1.5x'] as const).map((spd) => (
              <button
                key={spd}
                onClick={() => setPlaybackSpeed(spd)}
                className={`px-2 py-0.5 rounded-lg font-mono text-[11px] font-semibold transition-colors ${
                  playbackSpeed === spd ? 'bg-primary text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                {spd}
              </button>
            ))}
          </div>

          <button
            onClick={() => setAudioMuted(!audioMuted)}
            className="p-2 rounded-xl border border-border bg-surface-card text-slate-300 hover:text-white hover:bg-surface-elevated transition-colors"
            title={audioMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {audioMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>
        </div>
      </div>

      {/* Scenario Presets Selector Cards */}
      <div>
        <div className="text-xs uppercase font-semibold text-slate-400 tracking-wider mb-2.5 flex items-center gap-1.5">
          <Sliders className="w-3.5 h-3.5 text-cyan-400" />
          <span>Select Test Scenario Preset</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {SCENARIOS.map((sc) => {
            const isSelected = selectedScenario.id === sc.id;
            return (
              <div
                key={sc.id}
                onClick={() => {
                  if (isCallActive) handleResetCall();
                  setSelectedScenario(sc);
                }}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-surface-card border-cyan-500/60 shadow-lg shadow-cyan-500/10 ring-1 ring-cyan-500/40'
                    : 'bg-surface-card/60 border-border/80 hover:border-border hover:bg-surface-card'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                        sc.category === 'EMERGENCY'
                          ? 'bg-red-500/15 text-red-400 border border-red-500/30'
                          : sc.category === 'PRICE_SHOP'
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : sc.category === 'OUT_OF_AREA'
                          ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                          : 'bg-purple-500/15 text-purple-400 border border-purple-500/30'
                      }`}
                    >
                      {sc.category}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">{sc.difficulty}</span>
                  </div>

                  <h3 className="text-xs font-bold text-white leading-snug line-clamp-2">{sc.title}</h3>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{sc.description}</p>
                </div>

                <div className="pt-3 mt-2 border-t border-border/50 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                  <span>{sc.callerName}</span>
                  <span className="text-cyan-400 font-semibold">{sc.trade}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Simulation Stage: Live Audio Waveform & Transcript vs Function Tool Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Live Call Stage & Transcript (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Active Call Control Deck */}
          <div className="p-5 rounded-2xl bg-surface-card border border-border/80 relative overflow-hidden space-y-4 shadow-sm">
            {/* Top Deck Info */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-3.5 h-3.5 rounded-full ${
                    isCallActive
                      ? 'bg-emerald-500 animate-ping'
                      : 'bg-slate-600'
                  }`}
                />
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-2">
                    <span>{selectedScenario.callerName}</span>
                    <span className="text-slate-400 font-mono text-[11px] font-normal">{selectedScenario.callerPhone}</span>
                  </div>
                  <div className="text-[11px] text-slate-400">{selectedScenario.callerAddress}</div>
                </div>
              </div>

              {/* Call State Badge */}
              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                    isCallActive
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 animate-pulse'
                      : 'bg-surface border border-border text-slate-400'
                  }`}
                >
                  {isCallActive ? 'CALL IN PROGRESS' : 'READY TO SIMULATE'}
                </span>
              </div>
            </div>

            {/* Audio Waveform Simulator */}
            <div className="h-16 rounded-xl bg-surface/80 border border-border/70 flex items-center justify-center gap-1.5 px-4 overflow-hidden">
              {Array.from({ length: 32 }).map((_, i) => {
                const isActiveHeight = isSpeaking
                  ? Math.sin(i * 0.4 + (Date.now() / 200)) * 24 + 28
                  : 6;
                return (
                  <div
                    key={i}
                    style={{
                      height: `${Math.max(4, Math.min(isActiveHeight, 48))}px`,
                      transition: 'height 0.15s ease',
                    }}
                    className={`w-1 rounded-full ${
                      isSpeaking
                        ? activeSpeaker === 'elijah'
                          ? 'bg-gradient-to-t from-cyan-500 to-blue-400'
                          : 'bg-gradient-to-t from-amber-500 to-orange-400'
                        : 'bg-slate-700/60'
                    }`}
                  />
                );
              })}
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between pt-1">
              <div className="text-[11px] text-slate-400 flex items-center gap-2 font-mono">
                {isSpeaking && (
                  <span className="flex items-center gap-1 text-cyan-400">
                    <Radio className="w-3 h-3 animate-pulse" />
                    <span>{activeSpeaker === 'elijah' ? 'Elijah AI Speaking...' : 'Caller Speaking...'}</span>
                  </span>
                )}
                {!isSpeaking && !isCallActive && transcript.length > 0 && (
                  <span className="text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Call Finished
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {isCallActive ? (
                  <Button
                    size="sm"
                    onClick={handleResetCall}
                    className="bg-red-600 hover:bg-red-500 text-white text-xs h-9 px-4"
                  >
                    <PhoneOff className="w-3.5 h-3.5 mr-1.5" />
                    End Call
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={handleStartCall}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs h-9 px-5 shadow-md shadow-emerald-600/30"
                  >
                    <PhoneCall className="w-3.5 h-3.5 mr-1.5" />
                    Start Scenario Call
                  </Button>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleResetCall}
                  className="border-border text-slate-300 text-xs h-9"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </div>

          {/* Turn Transcript Log */}
          <div className="p-4 rounded-2xl bg-surface-card border border-border/80 space-y-3">
            <div className="flex items-center justify-between text-xs pb-2 border-b border-border/70">
              <span className="font-semibold text-white flex items-center gap-2">
                <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
                Live Conversation Stream
              </span>
              <span className="text-[10px] text-slate-400 font-mono">{transcript.length} Turns Completed</span>
            </div>

            <div
              ref={transcriptScrollRef}
              className="space-y-3 max-h-[380px] overflow-y-auto pr-1 text-xs"
            >
              {transcript.length === 0 ? (
                <div className="py-12 text-center text-muted">
                  <PhoneCall className="w-8 h-8 mx-auto text-slate-600 mb-2 opacity-50" />
                  <p className="font-medium text-slate-300">No active conversation</p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Click &ldquo;Start Scenario Call&rdquo; to simulate a real customer dialogue.
                  </p>
                </div>
              ) : (
                transcript.map((item, idx) => {
                  const isElijah = item.speaker === 'elijah';
                  return (
                    <div
                      key={idx}
                      className={`flex gap-3 animate-in fade-in slide-in-from-bottom-1 duration-200 ${
                        isElijah ? 'justify-start' : 'justify-end'
                      }`}
                    >
                      {isElijah && (
                        <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shrink-0 shadow-sm mt-0.5">
                          <Zap className="w-3.5 h-3.5 fill-white" />
                        </div>
                      )}

                      <div
                        className={`p-3 rounded-2xl max-w-[82%] leading-relaxed ${
                          isElijah
                            ? 'bg-surface-elevated border border-border/80 text-white rounded-tl-sm'
                            : 'bg-primary/20 border border-primary/40 text-slate-100 rounded-tr-sm'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3 text-[10px] mb-1 font-semibold uppercase tracking-wider">
                          <span className={isElijah ? 'text-cyan-400' : 'text-primary'}>
                            {isElijah ? 'Elijah AI Assistant' : selectedScenario.callerName}
                          </span>
                        </div>
                        <p className="text-xs">{item.text}</p>

                        {item.toolCall && (
                          <div className="mt-2 pt-2 border-t border-border/60 flex items-center gap-1.5 text-[10px] text-cyan-300 font-mono">
                            <Terminal className="w-3 h-3 text-cyan-400" />
                            <span>Executed: {item.toolCall.name}()</span>
                            <span className="text-slate-500">·</span>
                            <span className="text-emerald-400">{item.toolCall.latencyMs}ms</span>
                          </div>
                        )}
                      </div>

                      {!isElijah && (
                        <div className="w-7 h-7 rounded-xl bg-surface-elevated border border-border flex items-center justify-center text-slate-300 font-bold text-xs shrink-0 mt-0.5">
                          {selectedScenario.callerName.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Elijah Thought Process & CRM Function Execution Inspector (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-2xl bg-surface-card border border-border/80 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border/70">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-semibold text-white">Function Calls & CRM Execution</h3>
              </div>
              <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 bg-emerald-500/10 text-[10px]">
                PostgreSQL Live Tool Contract
              </Badge>
            </div>

            <p className="text-xs text-muted">
              Real-time audit log of tools executed on <code className="text-cyan-300">/internal/v1/*</code> while Elijah speaks.
            </p>

            {toolCallsLog.length === 0 ? (
              <div className="p-6 rounded-xl bg-surface/60 border border-border/60 text-center text-muted text-xs">
                <Layers className="w-6 h-6 mx-auto text-slate-600 mb-2" />
                <span>Tool executions will appear here during call turns.</span>
              </div>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {toolCallsLog.map((tc, i) => (
                  <div
                    key={i}
                    className="p-3.5 rounded-xl bg-surface-elevated/90 border border-border/80 space-y-2 font-mono text-[11px] animate-in fade-in"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-cyan-400 flex items-center gap-1.5">
                        <Terminal className="w-3.5 h-3.5" />
                        {tc.name}
                      </span>
                      <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/50">
                        {tc.latencyMs} ms
                      </span>
                    </div>

                    {/* Arguments */}
                    <div className="p-2 rounded bg-black/50 border border-border/50 text-slate-300">
                      <div className="text-[9px] uppercase tracking-wider text-slate-500 font-semibold mb-1">Payload:</div>
                      <pre className="text-[10px] text-slate-300 overflow-x-auto whitespace-pre-wrap">
                        {JSON.stringify(tc.args, null, 2)}
                      </pre>
                    </div>

                    {/* Result */}
                    <div className="p-2 rounded bg-black/50 border border-emerald-500/20 text-emerald-300">
                      <div className="text-[9px] uppercase tracking-wider text-emerald-500/70 font-semibold mb-1">Result:</div>
                      <pre className="text-[10px] text-emerald-400 overflow-x-auto whitespace-pre-wrap">
                        {JSON.stringify(tc.result, null, 2)}
                      </pre>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
