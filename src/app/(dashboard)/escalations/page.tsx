'use client';

import React from 'react';
import { AlertTriangle, CheckCircle2, Filter } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { NeedsAttentionCard } from '@/components/dashboard/NeedsAttentionCard';
import { Button } from '@/components/ui/button';

export default function EscalationsPage() {
  const { user } = useAuth();
  const roleSlug = user?.role?.slug || 'owner';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <AlertTriangle className="w-6 h-6 text-amber-400" />
            <span>Needs Your Attention (Human-In-The-Loop)</span>
          </h1>
          <p className="text-xs text-muted mt-1">
            Dedicated inbox for operations where Elijah AI requires human authority or review.
          </p>
        </div>

        <Button variant="outline" size="sm" className="gap-2 text-xs">
          <Filter className="w-3.5 h-3.5" />
          <span>Filter by Priority</span>
        </Button>
      </div>

      <div className="max-w-4xl">
        <NeedsAttentionCard roleSlug={roleSlug} />
      </div>
    </div>
  );
}
