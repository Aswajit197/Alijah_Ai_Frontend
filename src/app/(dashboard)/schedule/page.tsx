'use client';

import React from 'react';
import { CalendarDays, Truck, MapPin, Plus, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function SchedulePage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <CalendarDays className="w-6 h-6 text-primary" />
            <span>Schedule & Swimlanes</span>
          </h1>
          <p className="text-xs text-muted mt-1">
            Dynamic calendar dispatch board with technician swimlanes and AI route optimization.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2 text-xs">
            <Sparkles className="w-3.5 h-3.5 text-ai" />
            <span>Auto-Optimize Routes</span>
          </Button>
          <Button variant="primary" size="sm" className="gap-2 text-xs">
            <Plus className="w-3.5 h-3.5" />
            <span>New Dispatch</span>
          </Button>
        </div>
      </div>

      <div className="p-12 rounded-3xl bg-surface/80 border border-border text-center max-w-xl mx-auto space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-ai/10 border border-ai/20 flex items-center justify-center text-ai mx-auto shadow-lg shadow-ai-glow">
          <Truck className="w-7 h-7" />
        </div>
        <div>
          <h3 className="text-base font-bold text-white">Technician Swimlane Board</h3>
          <p className="text-xs text-muted mt-1 leading-relaxed">
            Drag-and-drop technician dispatching, real-time GPS locations, route traffic adjustments, and job status badges. Ready for next sprint phase!
          </p>
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-elevated border border-border text-xs text-slate-300 font-mono">
          <span>Status: Next Feature Milestone</span>
        </div>
      </div>
    </div>
  );
}

