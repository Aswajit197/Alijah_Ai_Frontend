'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  MapPin,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  Edit3,
  Globe,
  Check,
  X,
  Loader2,
  ArrowRight,
  ShieldCheck,
  Building2,
  Layers,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Badge } from '@/components/ui/badge';
import { apiRequest } from '@/lib/api';

export interface ServiceArea {
  id: string;
  name: string;
  zipCodes: string[];
}

const DEFAULT_AREAS: ServiceArea[] = [
  {
    id: 'area-1',
    name: 'East Valley (Scottsdale, Paradise Valley & Tempe)',
    zipCodes: [
      '85250',
      '85251',
      '85253',
      '85254',
      '85255',
      '85257',
      '85258',
      '85281',
      '85282',
      '85283',
    ],
  },
  {
    id: 'area-2',
    name: 'Central & Downtown Phoenix',
    zipCodes: ['85001', '85003', '85004', '85006', '85008', '85012', '85014', '85016', '85018'],
  },
  {
    id: 'area-3',
    name: 'West Valley (Glendale & Peoria Core)',
    zipCodes: ['85301', '85302', '85303', '85304', '85306', '85308', '85345', '85381'],
  },
  {
    id: 'area-4',
    name: 'Southeast Valley (Mesa, Chandler & Gilbert)',
    zipCodes: ['85201', '85202', '85203', '85204', '85210', '85224', '85225', '85233', '85234'],
  },
];

export default function ServiceAreasPage() {
  const [areas, setAreas] = useState<ServiceArea[]>(DEFAULT_AREAS);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionToast, setActionToast] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );

  // Modal State (Add or Edit)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArea, setEditingArea] = useState<ServiceArea | null>(null);
  const [areaName, setAreaName] = useState('');
  const [zipInput, setZipInput] = useState('');
  const [currentZipChips, setCurrentZipChips] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Coverage Sandbox State
  const [testZip, setTestZip] = useState('');
  const [testResult, setTestResult] = useState<{
    tested: boolean;
    isServed: boolean;
    areaName?: string;
  } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setActionToast({ type, message });
    setTimeout(() => setActionToast(null), 4000);
  };

  // Fetch Service Areas from Backend
  const loadAreas = async () => {
    setIsLoading(true);
    try {
      const res = await apiRequest<{ data: ServiceArea[] }>('/service-areas');
      if (res && Array.isArray(res.data) && res.data.length > 0) {
        setAreas(res.data);
      }
    } catch (err) {
      console.warn('Using initial service area defaults:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAreas();
  }, []);

  // Open Add Modal
  const handleOpenAdd = () => {
    setEditingArea(null);
    setAreaName('');
    setZipInput('');
    setCurrentZipChips([]);
    setFormError(null);
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (area: ServiceArea) => {
    setEditingArea(area);
    setAreaName(area.name);
    setZipInput('');
    setCurrentZipChips([...area.zipCodes]);
    setFormError(null);
    setIsModalOpen(true);
  };

  // Add ZIP chip from input (handles single or comma-separated)
  const handleAddZipChips = () => {
    if (!zipInput.trim()) return;

    // Split by comma, space, or newline
    const rawTokens = zipInput.split(/[\s,]+/);
    const newZips: string[] = [];

    for (const token of rawTokens) {
      const cleaned = token.trim();
      if (/^\d{5}$/.test(cleaned)) {
        if (!currentZipChips.includes(cleaned) && !newZips.includes(cleaned)) {
          newZips.push(cleaned);
        }
      }
    }

    if (newZips.length === 0 && rawTokens.length > 0) {
      setFormError('Please enter valid 5-digit US ZIP codes (e.g. 85001).');
      return;
    }

    setCurrentZipChips((prev) => [...prev, ...newZips]);
    setZipInput('');
    setFormError(null);
  };

  const handleRemoveZipChip = (zipToRemove: string) => {
    setCurrentZipChips((prev) => prev.filter((z) => z !== zipToRemove));
  };

  // Save Service Area (Create or Update)
  const handleSubmitArea = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!areaName.trim()) {
      setFormError('Service area name is required.');
      return;
    }

    // Flush any pending text in the zipInput
    let finalZips = [...currentZipChips];
    if (zipInput.trim()) {
      const extraTokens = zipInput.split(/[\s,]+/);
      for (const token of extraTokens) {
        const cleaned = token.trim();
        if (/^\d{5}$/.test(cleaned) && !finalZips.includes(cleaned)) {
          finalZips.push(cleaned);
        }
      }
    }

    if (finalZips.length === 0) {
      setFormError('At least one 5-digit ZIP code must be assigned to this area.');
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      if (editingArea) {
        // PUT /api/v1/service-areas/{id}
        await apiRequest(`/service-areas/${editingArea.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            name: areaName.trim(),
            zipCodes: finalZips,
          }),
        });

        setAreas((prev) =>
          prev.map((a) =>
            a.id === editingArea.id ? { ...a, name: areaName.trim(), zipCodes: finalZips } : a
          )
        );
        showToast(`Updated service area "${areaName.trim()}".`);
      } else {
        // POST /api/v1/service-areas
        const res = await apiRequest<{ data: ServiceArea }>('/service-areas', {
          method: 'POST',
          body: JSON.stringify({
            name: areaName.trim(),
            zipCodes: finalZips,
          }),
        });

        const created: ServiceArea = res.data || {
          id: `area-${Date.now()}`,
          name: areaName.trim(),
          zipCodes: finalZips,
        };

        setAreas((prev) => [created, ...prev]);
        showToast(`Created service area "${areaName.trim()}" with ${finalZips.length} ZIP codes.`);
      }

      setIsModalOpen(false);
    } catch (err: any) {
      const errorMsg =
        err.message ||
        (err.code === 'SERVICE_AREA_NAME_TAKEN'
          ? 'An area with this name already exists.'
          : err.code === 'ZIP_CODE_ALREADY_SERVED'
          ? 'One or more of these ZIP codes are already assigned to another area.'
          : 'Failed to save service area.');
      setFormError(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Service Area
  const handleDeleteArea = async (areaId: string, areaName: string) => {
    if (!confirm(`Are you sure you want to delete "${areaName}"? Callers in these ZIP codes will be marked out-of-zone.`)) {
      return;
    }

    try {
      await apiRequest(`/service-areas/${areaId}`, {
        method: 'DELETE',
      });
    } catch (err) {
      console.warn('API delete area fallback:', err);
    }

    setAreas((prev) => prev.filter((a) => a.id !== areaId));
    showToast(`Removed "${areaName}".`);
  };

  // Test ZIP coverage
  const handleTestZipCoverage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = testZip.trim();
    if (!clean) return;

    const matchedArea = areas.find((a) => a.zipCodes.includes(clean));
    if (matchedArea) {
      setTestResult({
        tested: true,
        isServed: true,
        areaName: matchedArea.name,
      });
    } else {
      setTestResult({
        tested: true,
        isServed: false,
      });
    }
  };

  // Computed Statistics
  const totalZipCount = Array.from(new Set(areas.flatMap((a) => a.zipCodes))).length;
  const filteredAreas = areas.filter((a) => {
    const q = searchQuery.toLowerCase();
    return (
      a.name.toLowerCase().includes(q) ||
      a.zipCodes.some((z) => z.includes(q))
    );
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Toast Notification */}
      {actionToast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 backdrop-blur-md border px-5 py-3 rounded-2xl shadow-xl shadow-black/40 animate-in fade-in slide-in-from-bottom-3 duration-200 text-white ${
            actionToast.type === 'error'
              ? 'bg-rose-950/90 border-rose-500/50 text-rose-200'
              : 'bg-surface-elevated/95 border-primary/40'
          }`}
        >
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
              actionToast.type === 'error'
                ? 'bg-rose-500/20 text-rose-400'
                : 'bg-primary/20 text-primary'
            }`}
          >
            {actionToast.type === 'error' ? (
              <AlertTriangle className="w-3.5 h-3.5" />
            ) : (
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            )}
          </div>
          <span className="text-sm font-medium">{actionToast.message}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
              <MapPin className="w-6 h-6 text-primary" />
              <span>Service Areas & Coverage Zones</span>
            </h1>
            <Badge variant="outline" className="border-blue-500/30 text-blue-400 bg-blue-500/10 text-xs">
              Dispatch & Receptionist Guardrails
            </Badge>
          </div>
          <p className="text-xs text-muted mt-1">
            Define geographic boundaries and active 5-digit ZIP codes. Elijah AI validates caller addresses against these zones during inbound call intake and online customer booking.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href="/settings">
            <Button
              variant="outline"
              size="sm"
              className="border-border text-slate-300 hover:text-white text-xs h-9 px-3.5 rounded-xl"
            >
              Company Settings
            </Button>
          </Link>

          <Button
            size="sm"
            onClick={handleOpenAdd}
            className="bg-primary hover:bg-primary-hover text-white text-xs h-9 px-4 rounded-xl shadow-md shadow-primary-glow/20 flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Add Service Area
          </Button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-surface-card border border-border/80 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Configured Zones</span>
            <Layers className="w-4 h-4 text-primary" />
          </div>
          <div className="text-2xl font-black text-white">{areas.length}</div>
          <div className="text-[11px] text-muted">Active dispatch regions</div>
        </div>

        <div className="p-4 rounded-2xl bg-surface-card border border-border/80 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Total Served ZIPs</span>
            <MapPin className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400">{totalZipCount}</div>
          <div className="text-[11px] text-emerald-400/80">Unique 5-digit postal codes</div>
        </div>

        <div className="p-4 rounded-2xl bg-surface-card border border-border/80 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Out-of-Zone Policy</span>
            <ShieldCheck className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-base font-bold text-white pt-1">$45 Surcharge / Transfer</div>
          <div className="text-[11px] text-slate-400">Escalates to manager or adds fee</div>
        </div>

        <div className="p-4 rounded-2xl bg-surface-card border border-border/80 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>AI Receptionist Check</span>
            <Sparkles className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-base font-bold text-purple-300 pt-1">Automated ZIP Lookup</div>
          <div className="text-[11px] text-slate-400">Real-time address disambiguation</div>
        </div>
      </div>

      {/* Coverage Checker Sandbox Tool */}
      <div className="p-5 rounded-2xl bg-surface-card border border-blue-500/30 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Search className="w-4 h-4 text-blue-400" />
              Live Address & ZIP Code Coverage Tester
            </h3>
            <p className="text-xs text-muted mt-0.5">
              Simulate what Elijah or the booking widget tells a customer who enters their ZIP code.
            </p>
          </div>
        </div>

        <form onSubmit={handleTestZipCoverage} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <div className="relative flex-1">
            <input
              type="text"
              maxLength={5}
              placeholder="Enter 5-digit ZIP code (e.g. 85251, 85004, 90210)..."
              value={testZip}
              onChange={(e) => {
                setTestZip(e.target.value);
                setTestResult(null);
              }}
              className="w-full px-4 py-2.5 bg-surface-elevated/90 border border-border rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 font-mono"
            />
          </div>

          <Button
            type="submit"
            size="sm"
            disabled={!testZip.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-5 h-10 rounded-xl shrink-0 font-medium"
          >
            Verify Coverage
          </Button>
        </form>

        {testResult && testResult.tested && (
          <div className="pt-2 animate-in fade-in duration-150">
            {testResult.isServed ? (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-emerald-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>
                    ZIP code <strong className="font-mono text-white">{testZip}</strong> is <strong>IN-NETWORK</strong> in zone: <strong className="text-white">{testResult.areaName}</strong>.
                  </span>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  Instant Dispatch Eligible
                </span>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-rose-300">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>
                    ZIP code <strong className="font-mono text-white">{testZip}</strong> is <strong>OUT OF COVERAGE AREA</strong>.
                  </span>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40">
                  $45 Out-of-Zone Surcharge
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main Service Areas Grid */}
      <div className="space-y-4">
        {/* Search & Filter Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs text-slate-400">
            Showing <strong className="text-white font-mono">{filteredAreas.length}</strong> active service areas
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by zone name or ZIP..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 bg-surface-elevated/80 border border-border rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-primary font-sans"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Areas Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredAreas.length === 0 ? (
            <div className="col-span-2 p-12 text-center rounded-2xl bg-surface-card border border-border/80 text-muted">
              <MapPin className="w-8 h-8 mx-auto text-slate-600 mb-2 opacity-50" />
              <p className="font-medium text-slate-300">No service areas match your search</p>
              <p className="text-[11px] text-slate-500 mt-1">
                Try a different keyword or create a new service territory.
              </p>
            </div>
          ) : (
            filteredAreas.map((area) => (
              <div
                key={area.id}
                className="p-5 rounded-2xl bg-surface-card border border-border/80 hover:border-border transition-all space-y-3.5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5">
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-primary shrink-0" />
                        <span>{area.name}</span>
                      </h3>
                      <div className="text-[11px] text-slate-400">
                        {area.zipCodes.length} covered postal ZIP codes
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleOpenEdit(area)}
                        className="p-1.5 rounded-lg border border-border bg-surface text-slate-300 hover:text-white hover:border-primary/60 hover:bg-surface-elevated transition-all"
                        title="Edit name and ZIPs"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteArea(area.id, area.name)}
                        className="p-1.5 rounded-lg border border-border bg-surface text-slate-400 hover:text-rose-400 hover:border-rose-500/40 hover:bg-rose-500/10 transition-all"
                        title="Delete service area"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* ZIP Code Badges */}
                  <div className="flex flex-wrap gap-1.5 pt-3">
                    {area.zipCodes.map((zip) => (
                      <span
                        key={zip}
                        className="px-2 py-0.5 rounded-md bg-surface-elevated border border-border/80 text-[11px] font-mono text-slate-300 hover:text-white hover:border-primary/50 transition-colors"
                      >
                        {zip}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-border/50 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1 text-emerald-400">
                    <CheckCircle2 className="w-3 h-3" />
                    Covered by Elijah 24/7 AI Receptionist
                  </span>
                  <button
                    onClick={() => {
                      setTestZip(area.zipCodes[0] || '');
                      setTestResult({
                        tested: true,
                        isServed: true,
                        areaName: area.name,
                      });
                    }}
                    className="hover:text-primary transition-colors font-medium text-[10px] uppercase tracking-wider"
                  >
                    Test this zone
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add / Edit Service Area Modal */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            if (!isSubmitting) setIsModalOpen(false);
          }}
          title={editingArea ? `Edit Service Area · ${editingArea.name}` : 'Add New Service Area'}
          className="max-w-xl"
        >
          <form onSubmit={handleSubmitArea} className="space-y-4 text-xs">
            {formError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <div>
              <label className="block text-slate-400 mb-1 text-[11px] font-medium">
                Service Area / Territory Name
              </label>
              <input
                type="text"
                placeholder="e.g. East Valley - Scottsdale & Tempe"
                value={areaName}
                onChange={(e) => setAreaName(e.target.value)}
                className="w-full px-3 py-2 bg-surface border border-border rounded-xl text-white text-xs focus:outline-none focus:border-primary"
                required
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 text-[11px] font-medium">
                Assigned 5-Digit ZIP Codes
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter 5-digit ZIPs (or paste comma-separated e.g. 85250, 85251, 85253)..."
                  value={zipInput}
                  onChange={(e) => setZipInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddZipChips();
                    }
                  }}
                  className="flex-1 px-3 py-2 bg-surface border border-border rounded-xl text-white text-xs focus:outline-none focus:border-primary font-mono"
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={handleAddZipChips}
                  className="bg-surface-elevated hover:bg-primary text-slate-200 hover:text-white border border-border text-xs px-4 h-9 rounded-xl shrink-0"
                >
                  Add ZIP(s)
                </Button>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                Press Enter or click Add to add ZIP codes as chips. Each ZIP can only belong to one area.
              </p>
            </div>

            {/* Current ZIP Chips Container */}
            <div className="p-3 rounded-xl bg-surface/70 border border-border min-h-[90px] max-h-[160px] overflow-y-auto space-y-2">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>Selected ZIP Codes:</span>
                <span className="font-mono text-white font-semibold">{currentZipChips.length} ZIPs</span>
              </div>

              {currentZipChips.length === 0 ? (
                <div className="text-center py-4 text-slate-500 text-[11px]">
                  No ZIP codes added yet. Type or paste ZIP codes above.
                </div>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {currentZipChips.map((zip) => (
                    <span
                      key={zip}
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-surface-elevated border border-primary/30 text-primary text-[11px] font-mono"
                    >
                      <span>{zip}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveZipChip(zip)}
                        className="hover:text-rose-400 transition-colors ml-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end gap-2 pt-3 border-t border-border/80">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsModalOpen(false)}
                disabled={isSubmitting}
                className="text-xs h-9"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSubmitting}
                className="bg-primary hover:bg-primary-hover text-white text-xs h-9 px-5 shadow-md shadow-primary-glow/20 flex items-center gap-1.5"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    {editingArea ? 'Save Changes' : 'Create Area'}
                  </>
                )}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
