'use client';

import React from 'react';
import { Inbox, MessageSquare, PhoneCall, Sparkles, Filter, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function InboxPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Inbox className="w-6 h-6 text-primary" />
            <span>Unified AI Inbox</span>
          </h1>
          <p className="text-xs text-muted mt-1">
            Omnichannel triage for phone calls, SMS texts, and web contact leads.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2 text-xs">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter</span>
          </Button>
          <Button variant="primary" size="sm" className="gap-2 text-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Summarize Inbox</span>
          </Button>
        </div>
      </div>

      <div className="p-12 rounded-3xl bg-surface/80 border border-border text-center max-w-xl mx-auto space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mx-auto shadow-lg shadow-primary-glow/20">
          <MessageSquare className="w-7 h-7" />
        </div>
        <div>
          <h3 className="text-base font-bold text-white">Unified Inbox Module</h3>
          <p className="text-xs text-muted mt-1 leading-relaxed">
            This module houses incoming VoIP call audio recordings, auto-transcriptions, SMS two-way chat, and customer sentiment tagging. Ready for next sprint phase!
          </p>
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-elevated border border-border text-xs text-slate-300 font-mono">
          <span>Status: Next Feature Milestone</span>
        </div>
      </div>
    </div>
  );
}

