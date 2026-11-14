'use client';

import React from 'react';
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
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function TechPortalPage() {
  const currentJob = {
    id: 'JOB-9041',
    customer: 'Henderson Medical Clinic',
    contact: 'Dr. Arthur Vance (702-555-0182)',
    address: '840 Sunridge Heights Pkwy, Henderson, NV',
    gateCode: '#3842 (Building C)',
    time: '11:30 AM - 1:30 PM',
    status: 'IN_TRANSIT',
    issue: 'Rooftop Carrier Packaged Unit 5-Ton - Freezing at evaporator coils, thermostat displaying error code E4.',
    equipment: 'Carrier WeatherMaker 48TC (Model 2021) · S/N: 2420U19284',
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

        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
          On Route
        </span>
      </div>

      {/* Active Job Card */}
      <div className="p-5 sm:p-6 rounded-3xl bg-surface/95 border border-border space-y-5 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div>
            <span className="text-[10px] font-mono text-muted uppercase">Active Work Order</span>
            <h2 className="text-base font-bold text-white">{currentJob.id} · {currentJob.customer}</h2>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold text-ai flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>{currentJob.time}</span>
            </span>
          </div>
        </div>

        {/* Location & Navigation */}
        <div className="p-3.5 rounded-2xl bg-surface-card border border-border/80 space-y-2">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs text-white font-medium">
                <MapPin className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{currentJob.address}</span>
              </div>
              <div className="text-xs text-amber-400 font-mono font-semibold pl-6">
                Gate / Access: {currentJob.gateCode}
              </div>
            </div>

            <Button size="sm" variant="outline" className="gap-1.5 text-xs h-8 shrink-0">
              <Navigation className="w-3 h-3 text-ai" />
              <span>Navigate</span>
            </Button>
          </div>
        </div>

        {/* Issue & Diagnostic Notes */}
        <div className="space-y-2 text-xs">
          <span className="font-bold uppercase tracking-wider text-muted text-[10px]">
            Reported Issue & Symptoms
          </span>
          <p className="p-3 rounded-xl bg-surface-elevated border border-border text-slate-300 leading-relaxed">
            {currentJob.issue}
          </p>
        </div>

        {/* Equipment Profile */}
        <div className="p-3 rounded-xl bg-surface-elevated/60 border border-border flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Wrench className="w-4 h-4 text-primary" />
            <span className="text-slate-300">{currentJob.equipment}</span>
          </div>
          <span className="text-[10px] text-emerald-400 font-mono font-medium">Under Warranty</span>
        </div>

        {/* Quick Field Actions */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <Button variant="outline" className="gap-2 text-xs h-11">
            <Camera className="w-4 h-4" />
            <span>Add Photos / Notes</span>
          </Button>
          <Button variant="primary" className="gap-2 text-xs h-11 shadow-md shadow-primary-glow">
            <CheckCircle className="w-4 h-4" />
            <span>Mark Arrived on Site</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

