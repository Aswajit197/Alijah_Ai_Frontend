'use client';

import React, { useState, useEffect } from 'react';
import {
  Workflow,
  Clock,
  MessageSquare,
  PhoneCall,
  Mail,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Play,
  Save,
  RotateCcw,
  Sparkles,
  Info,
  ChevronDown,
  ArrowDown,
  Check,
  Send,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';

interface Step {
  id: string;
  type: 'text' | 'call_task' | 'email' | 'final_text';
  label: string;
  waitDays: number;
  content: string;
}

interface Recipe {
  id: string;
  title: string;
  trigger: string;
  runningCount: number;
  isEnabled: boolean;
  steps: Step[];
  stopsWhen: string[];
}

const INITIAL_RECIPES: Recipe[] = [
  {
    id: 'unsold-estimate',
    title: 'Unsold estimate follow-up',
    trigger: 'An estimate is sent',
    runningCount: 1,
    isEnabled: true,
    steps: [
      {
        id: 'ue-1',
        type: 'text',
        label: 'Send text',
        waitDays: 2,
        content: "Hi {first}, it's Elijah with Desert Air. Any questions about the estimate for {trade}?",
      },
      {
        id: 'ue-2',
        type: 'call_task',
        label: 'Create call task',
        waitDays: 3,
        content: 'Call {first} about estimate {ref}',
      },
      {
        id: 'ue-3',
        type: 'email',
        label: 'Send email',
        waitDays: 5,
        content: 'Your Desert Air options and financing, recapped',
      },
      {
        id: 'ue-4',
        type: 'final_text',
        label: 'Final text',
        waitDays: 10,
        content: "Hi {first}, we'll close out your estimate for now. Let us know if you'd like to revisit!",
      },
    ],
    stopsWhen: ['Customer replies', 'Estimate accepted', 'Appointment booked', 'Opt-out keyword', 'Dispute logged'],
  },
  {
    id: 'past-due-invoice',
    title: 'Past-due invoice',
    trigger: 'An invoice is past due',
    runningCount: 1,
    isEnabled: true,
    steps: [
      {
        id: 'pdi-1',
        type: 'text',
        label: 'Send text',
        waitDays: 0,
        content: 'Hi {first}, a friendly reminder from Desert Air: invoice {ref} is due.',
      },
      {
        id: 'pdi-2',
        type: 'text',
        label: 'Send text',
        waitDays: 7,
        content: 'Hi {first}, invoice {ref} ({amount}) is still open. Pay online: {link}',
      },
      {
        id: 'pdi-3',
        type: 'email',
        label: 'Send email',
        waitDays: 7,
        content: 'Invoice {ref}: balance reminder',
      },
      {
        id: 'pdi-4',
        type: 'call_task',
        label: 'Create call task',
        waitDays: 7,
        content: 'Finance: call {first} about {ref}',
      },
    ],
    stopsWhen: ['Payment received', 'Dispute logged', 'Promise to pay noted', 'Human takeover'],
  },
  {
    id: 'missed-call',
    title: 'Missed call text-back',
    trigger: 'A call is missed',
    runningCount: 0,
    isEnabled: true,
    steps: [
      {
        id: 'mc-1',
        type: 'text',
        label: 'Send text',
        waitDays: 0,
        content: "Sorry we missed your call! This is Elijah, Desert Air's AI receptionist. How can I help you today?",
      },
    ],
    stopsWhen: ['Customer replies', 'Booked', 'Opt-outs', 'Complaints', 'Disputes', 'Human takeover'],
  },
];

export default function FollowUpRecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>(INITIAL_RECIPES);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeSimulationRecipe, setActiveSimulationRecipe] = useState<Recipe | null>(null);
  const [simulationStepIndex, setSimulationStepIndex] = useState(0);
  const [isSimulating, setIsSimulating] = useState(false);

  // Sync with backend on mount
  useEffect(() => {
    fetch('http://localhost:5000/api/v1/follow-up-settings', {
      headers: { 'x-tenant-id': 'cmwexxk6u0001nrstmjy98yz5' },
    })
      .then((res) => res.json())
      .then((json) => {
        if (json?.data?.recipes && Array.isArray(json.data.recipes) && json.data.recipes.length > 0) {
          setRecipes(json.data.recipes);
        }
      })
      .catch((err) => console.warn('Could not fetch follow-up settings from backend:', err));
  }, []);

  const handleToggleRecipe = (id: string) => {
    setRecipes((prev) =>
      prev.map((r) => (r.id === id ? { ...r, isEnabled: !r.isEnabled } : r))
    );
  };

  const handleWaitChange = (recipeId: string, stepId: string, newDays: number) => {
    setRecipes((prev) =>
      prev.map((r) => {
        if (r.id !== recipeId) return r;
        return {
          ...r,
          steps: r.steps.map((s) => (s.id === stepId ? { ...s, waitDays: Math.max(0, newDays) } : s)),
        };
      })
    );
  };

  const handleContentChange = (recipeId: string, stepId: string, newContent: string) => {
    setRecipes((prev) =>
      prev.map((r) => {
        if (r.id !== recipeId) return r;
        return {
          ...r,
          steps: r.steps.map((s) => (s.id === stepId ? { ...s, content: newContent } : s)),
        };
      })
    );
  };

  const handleSaveTiming = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      // Persist to backend with live recipes state
      await fetch('http://localhost:5000/api/v1/follow-up-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': 'cmwexxk6u0001nrstmjy98yz5',
        },
        body: JSON.stringify({
          feedbackCallDelayMinutes: 300,
          isTechnicianCheckInEnabled: true,
          technicianCheckInDelayMinutes: 60,
          recipes,
        }),
      });

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const startSimulation = (recipe: Recipe) => {
    setActiveSimulationRecipe(recipe);
    setSimulationStepIndex(0);
    setIsSimulating(true);
  };

  return (
    <div className="flex-1 space-y-8 p-6 lg:p-8 max-w-[1600px] mx-auto">
      {/* Top Header matching screenshot */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/60 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
            Follow-up recipes
            <Badge variant="outline" className="border-indigo-500/30 text-indigo-400 bg-indigo-500/10 text-xs py-0.5">
              Autonomous
            </Badge>
          </h1>
          <p className="mt-2 text-sm text-muted-foreground max-w-3xl">
            Each recipe is a ready-made routine. You change the timing; the safety stops are built in and can&apos;t be removed.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={handleSaveTiming}
            disabled={isSaving}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 shadow-md flex items-center gap-2"
          >
            {isSaving ? (
              'Saving...'
            ) : saveSuccess ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                Timing Saved!
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save timing
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Safety Stops Banner */}
      <div className="bg-surface/80 border border-border/80 rounded-xl p-4 flex items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-sm font-semibold text-foreground">Immutable Safety Stops Active</span>
            <p className="text-xs text-muted-foreground">
              Every workflow instantly halts the moment a customer replies, books a slot, requests STOP, or disputes an invoice.
            </p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Zero unapproved spam guardrails guaranteed
        </div>
      </div>

      {/* Recipes 3-Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
        {recipes.map((recipe) => (
          <div
            key={recipe.id}
            className={`rounded-2xl border transition-all duration-200 bg-surface/90 shadow-md flex flex-col p-6 relative ${
              recipe.isEnabled ? 'border-border' : 'border-border/40 opacity-70'
            }`}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-2 pb-3">
              <div>
                <h2 className="text-lg font-bold text-foreground">{recipe.title}</h2>
                <div className="mt-1 text-xs text-muted-foreground flex items-center gap-1.5">
                  <span>When: {recipe.trigger}</span>
                  <span>·</span>
                  <span className="text-primary font-medium">{recipe.runningCount} running</span>
                </div>
              </div>

              {/* Toggle Checkbox matching screenshot */}
              <label className="flex items-center gap-2 cursor-pointer select-none text-sm font-medium text-foreground">
                <input
                  type="checkbox"
                  checked={recipe.isEnabled}
                  onChange={() => handleToggleRecipe(recipe.id)}
                  className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20 accent-primary"
                />
                <span className={recipe.isEnabled ? 'text-primary font-semibold' : 'text-muted-foreground'}>On</span>
              </label>
            </div>

            {/* Trigger Box (Navy Dark Box) */}
            <div className="mt-3 bg-[#0a1526] border border-blue-900/50 text-blue-100 font-semibold px-4 py-3 rounded-xl text-center text-sm shadow-inner">
              {recipe.trigger}
            </div>

            {/* Step Sequence Flow */}
            <div className="mt-2 space-y-1">
              {recipe.steps.map((step, idx) => (
                <div key={step.id} className="flex flex-col items-center">
                  {/* Wait Days Connector */}
                  <div className="py-2 flex items-center gap-2 text-xs font-medium text-muted-foreground">
                    <ArrowDown className="w-3.5 h-3.5 text-muted-foreground/80" />
                    <span>wait</span>
                    <input
                      type="number"
                      min={0}
                      max={90}
                      value={step.waitDays}
                      onChange={(e) => handleWaitChange(recipe.id, step.id, parseInt(e.target.value) || 0)}
                      className="w-12 h-6 px-1.5 text-center bg-background border border-border rounded text-foreground font-mono text-xs focus:ring-1 focus:ring-primary focus:outline-none"
                    />
                    <span>days</span>
                  </div>

                  {/* Step Card */}
                  <div className="w-full bg-background/90 border border-border/80 rounded-xl p-3.5 shadow-sm space-y-2 hover:border-border transition-colors">
                    <div className="flex items-center justify-between text-xs font-semibold text-foreground">
                      <span className="flex items-center gap-1.5">
                        {step.type === 'text' || step.type === 'final_text' ? (
                          <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
                        ) : step.type === 'call_task' ? (
                          <PhoneCall className="w-3.5 h-3.5 text-amber-400" />
                        ) : (
                          <Mail className="w-3.5 h-3.5 text-indigo-400" />
                        )}
                        {step.label}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-mono uppercase">
                        Step {idx + 1}
                      </span>
                    </div>

                    <textarea
                      rows={step.type === 'call_task' || step.type === 'email' ? 1 : 3}
                      value={step.content}
                      onChange={(e) => handleContentChange(recipe.id, step.id, e.target.value)}
                      className="w-full text-xs text-foreground bg-surface/50 border border-border/50 rounded-lg p-2 resize-none focus:outline-none focus:ring-1 focus:ring-primary/40 font-sans"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Safety Stops Footer Note */}
            <div className="mt-6 pt-4 border-t border-border/60 text-xs text-muted-foreground">
              <span className="font-semibold text-foreground/90">Stops when: </span>
              {recipe.stopsWhen.join(' · ')}
            </div>

            {/* Test Simulation Button */}
            <div className="mt-4 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => startSimulation(recipe)}
                className="w-full text-xs border-border/80 text-muted-foreground hover:text-foreground flex items-center justify-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5 text-primary" />
                Simulate Recipe Execution
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Simulation Modal */}
      {activeSimulationRecipe && (
        <Modal
          isOpen={isSimulating}
          onClose={() => setIsSimulating(false)}
          title={`Simulating: ${activeSimulationRecipe.title}`}
        >
          <div className="space-y-4">
            <p className="text-xs text-muted-foreground">
              Trace how Elijah autonomous execution engine triggers each communication step and applies safety evaluations.
            </p>

            <div className="border border-border/80 rounded-xl p-4 bg-surface/80 space-y-3">
              <div className="text-xs font-semibold text-foreground flex items-center justify-between">
                <span>Trigger: {activeSimulationRecipe.trigger}</span>
                <Badge variant="outline" className="text-emerald-400 border-emerald-500/30 text-[10px]">
                  Event Fired
                </Badge>
              </div>

              <div className="space-y-3 pt-2">
                {activeSimulationRecipe.steps.map((st, idx) => {
                  const isPast = idx < simulationStepIndex;
                  const isCurrent = idx === simulationStepIndex;
                  return (
                    <div
                      key={st.id}
                      className={`p-3 rounded-lg border text-xs transition-all ${
                        isCurrent
                          ? 'bg-primary/10 border-primary text-foreground'
                          : isPast
                          ? 'bg-surface border-emerald-500/30 text-muted-foreground'
                          : 'bg-surface/30 border-border/40 text-muted-foreground/60'
                      }`}
                    >
                      <div className="flex items-center justify-between font-semibold mb-1">
                        <span className="flex items-center gap-1.5">
                          {isPast && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                          {isCurrent && <Clock className="w-3.5 h-3.5 text-primary animate-spin" />}
                          Step {idx + 1}: {st.label} (Wait: {st.waitDays}d)
                        </span>
                        <span className="text-[10px] font-mono">
                          {isPast ? 'COMPLETED' : isCurrent ? 'PENDING' : 'QUEUED'}
                        </span>
                      </div>
                      <p className="font-mono text-[11px] mt-1 text-foreground/80">&quot;{st.content}&quot;</p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSimulationStepIndex(0)}
                className="text-xs"
              >
                <RotateCcw className="w-3 h-3 mr-1" /> Reset
              </Button>
              <Button
                size="sm"
                disabled={simulationStepIndex >= activeSimulationRecipe.steps.length - 1}
                onClick={() => setSimulationStepIndex((prev) => prev + 1)}
                className="text-xs bg-primary text-primary-foreground"
              >
                Advance Next Step <ArrowDown className="w-3 h-3 ml-1" />
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
