'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Badge } from '@/components/ui/badge';
import {
  FileText,
  DollarSign,
  TrendingUp,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Send,
  Plus,
  Search,
  ChevronRight,
  ShieldCheck,
  Check,
  X,
  Eye,
  ExternalLink,
  Flame,
  Zap,
  Wrench,
  Percent,
  RefreshCw,
  Share2,
} from 'lucide-react';

export type ProposalStatus = 'AWAITING_SIGNATURE' | 'ACCEPTED' | 'DRAFT' | 'EXPIRED';

export interface TierOption {
  name: string; // "Good" | "Better" | "Best"
  label: string; // "Base 14 SEER2" | "Two-Stage 16 SEER2" | "Variable Inverter 18 SEER2"
  price: number;
  monthlyEstimate: number; // e.g. $89/mo
  warrantyYears: string;
  isRecommended?: boolean;
  features: string[];
}

export interface Proposal {
  id: string;
  estimateNumber: string; // "EST-1041"
  customerName: string;
  customerPhone: string;
  serviceAddress: string;
  tradeType: 'HVAC' | 'ELECTRICAL' | 'PLUMBING';
  title: string;
  status: ProposalStatus;
  selectedTierIndex: number;
  grossMarginPct: number;
  sentDateText: string;
  expiryText: string;
  tiers: [TierOption, TierOption, TierOption];
  notes?: string;
}

const INITIAL_PROPOSALS: Proposal[] = [
  {
    id: 'est-1',
    estimateNumber: 'EST-1041',
    customerName: 'Carl Jensen',
    customerPhone: '480-555-0144',
    serviceAddress: '1725 E Camelback Rd, Phoenix, AZ 85016',
    tradeType: 'HVAC',
    title: 'Carrier 5-Ton Comfort 14 Heat Pump Replacement',
    status: 'AWAITING_SIGNATURE',
    selectedTierIndex: 1, // "Better" selected
    grossMarginPct: 38.5,
    sentDateText: 'Sent 2h ago via SMS',
    expiryText: 'Valid for 7 days',
    tiers: [
      {
        name: 'Good',
        label: 'Carrier 14.3 SEER2 Standard Single Stage',
        price: 8400,
        monthlyEstimate: 98,
        warrantyYears: '10-Yr Parts · 1-Yr Labor',
        features: ['Standard single-stage scroll compressor', 'Quiet acoustic top grill (72 dBA)', 'Programmable digital thermostat'],
      },
      {
        name: 'Better',
        label: 'Carrier Performance 16 SEER2 Two-Stage Heat Pump',
        price: 11250,
        monthlyEstimate: 129,
        warrantyYears: '10-Yr Parts · 2-Yr Labor',
        isRecommended: true,
        features: ['Two-stage compressor for 28% lower electric bills', 'Variable speed blower motor for quiet comfort', 'Smart Wi-Fi Ecobee thermostat included', 'High-efficiency 4-inch media filter cabinet'],
      },
      {
        name: 'Best',
        label: 'Carrier Infinity 18 SEER2 Variable-Speed Inverter',
        price: 14500,
        monthlyEstimate: 168,
        warrantyYears: '10-Yr Parts · 5-Yr Labor',
        features: ['Ultra-efficient inverter (modulates from 25% to 100%)', 'Whisper-quiet operation as low as 58 dBA', 'Infinity Smart Control with humidity management', '10-Year complete unit replacement warranty'],
      },
    ],
  },
  {
    id: 'est-2',
    estimateNumber: 'EST-1042',
    customerName: 'Linda Parker',
    customerPhone: '602-555-0199',
    serviceAddress: '100 N Central Ave, Phoenix, AZ 85004',
    tradeType: 'HVAC',
    title: 'Trane XR16 High-Efficiency Dual-Stage Package',
    status: 'AWAITING_SIGNATURE',
    selectedTierIndex: 2, // "Best" selected
    grossMarginPct: 41.0,
    sentDateText: 'Sent 5h ago via SMS',
    expiryText: 'Valid for 14 days',
    tiers: [
      {
        name: 'Good',
        label: 'Trane XR14 Single Stage',
        price: 9200,
        monthlyEstimate: 105,
        warrantyYears: '10-Yr Compressor · 5-Yr Parts',
        features: ['Climatuff compressor reliability', 'Spine Fin all-aluminum outdoor coil', 'Standard digital thermostat'],
      },
      {
        name: 'Better',
        label: 'Trane XR16 Two-Stage Comfort System',
        price: 12800,
        monthlyEstimate: 145,
        warrantyYears: '10-Yr Parts · 3-Yr Labor',
        isRecommended: true,
        features: ['Two stages of cooling for desert summer peaks', 'Weatherguard fasteners & zinc-coated base', 'Nexia smart diagnostics integration'],
      },
      {
        name: 'Best',
        label: 'Trane XV18 TruComfort Variable Speed',
        price: 14500,
        monthlyEstimate: 168,
        warrantyYears: '12-Yr Compressor · 10-Yr Parts · 5-Yr Labor',
        features: ['750 levels of automatic speed modulation', 'CleanEffects electronic air cleaner included', 'Near-silent operation even in 115°F heat'],
      },
    ],
  },
  {
    id: 'est-3',
    estimateNumber: 'EST-1043',
    customerName: 'Highlander Country Club',
    customerPhone: '480-555-8822',
    serviceAddress: '742 Evergreen Terrace, Phoenix, AZ 85001',
    tradeType: 'HVAC',
    title: 'Commercial 10-Ton Rooftop Package Unit Replacement',
    status: 'DRAFT',
    selectedTierIndex: 1,
    grossMarginPct: 36.0,
    sentDateText: 'Drafted by Estimator Daniel Reed',
    expiryText: 'Pending executive discount approval',
    tiers: [
      {
        name: 'Good',
        label: 'Commercial Standard 10-Ton Packaged Unit',
        price: 14200,
        monthlyEstimate: 160,
        warrantyYears: '5-Yr Compressor · 1-Yr Parts',
        features: ['Belt-drive centrifugal blower', 'High-pressure cutoff switches'],
      },
      {
        name: 'Better',
        label: 'Commercial High-Efficiency 10-Ton with Economizer',
        price: 18400,
        monthlyEstimate: 210,
        warrantyYears: '10-Yr Compressor · 3-Yr Parts',
        isRecommended: true,
        features: ['Integrated dry-bulb economizer for free cooling', 'Direct-drive variable speed indoor fan', 'Smoke detector & phase monitoring safety'],
      },
      {
        name: 'Best',
        label: 'Commercial Ultra-Efficiency Dual Inverter 10-Ton',
        price: 22800,
        monthlyEstimate: 260,
        warrantyYears: '10-Yr Parts & Compressor · 5-Yr Labor',
        features: ['Dual tandem inverter scroll compressors', 'BACnet / Modbus building automation interface', 'Full stainless steel drain pan & coil coating'],
      },
    ],
  },
  {
    id: 'est-4',
    estimateNumber: 'EST-1044',
    customerName: 'David Sterling',
    customerPhone: '480-555-9933',
    serviceAddress: '1004 N Central Ave, Phoenix, AZ 85004',
    tradeType: 'HVAC',
    title: 'Lennox Merit 15 SEER2 Split Heat Pump System',
    status: 'AWAITING_SIGNATURE',
    selectedTierIndex: 0,
    grossMarginPct: 39.2,
    sentDateText: 'Sent 6 days ago (2 follow-ups sent)',
    expiryText: '⚠️ Expiring in 24 hours',
    tiers: [
      {
        name: 'Good',
        label: 'Lennox Merit ML14XP1 14.5 SEER2',
        price: 6900,
        monthlyEstimate: 79,
        warrantyYears: '5-Yr Parts · 1-Yr Labor',
        isRecommended: true,
        features: ['Efficient scroll compressor', 'Corrosion-resistant steel cabinet', 'Standard 1-year labor warranty'],
      },
      {
        name: 'Better',
        label: 'Lennox Elite EL16XP1 Two-Stage 16 SEER2',
        price: 9400,
        monthlyEstimate: 108,
        warrantyYears: '10-Yr Parts · 2-Yr Labor',
        features: ['Two-stage heating & cooling', 'Sound dampening insulation jacket', 'Smart S30 thermostat compatibility'],
      },
      {
        name: 'Best',
        label: 'Lennox Signature SL25XPV Variable Inverter',
        price: 13200,
        monthlyEstimate: 152,
        warrantyYears: '10-Yr Parts · 5-Yr Labor',
        features: ['Most efficient heat pump on the market', 'Precise Comfort inverter modulation', 'PureAir air purification system included'],
      },
    ],
  },
  {
    id: 'est-5',
    estimateNumber: 'EST-1045',
    customerName: 'Elena Rostova',
    customerPhone: '480-555-9988',
    serviceAddress: '777 Sunset Blvd, Phoenix, AZ 85004',
    tradeType: 'PLUMBING',
    title: 'Navien NPE-240A2 Condensing Tankless Water Heater',
    status: 'ACCEPTED',
    selectedTierIndex: 1,
    grossMarginPct: 44.5,
    sentDateText: 'Signed yesterday at 4:15 PM',
    expiryText: 'Approved · Work order created',
    tiers: [
      {
        name: 'Good',
        label: 'Standard 50-Gal Atmospheric Gas Water Heater',
        price: 2200,
        monthlyEstimate: 28,
        warrantyYears: '6-Yr Tank & Parts',
        features: ['Standard tank replacement', 'Includes new gas flex line & shutoff'],
      },
      {
        name: 'Better',
        label: 'Navien NPE-240A2 High-Efficiency Tankless',
        price: 3450,
        monthlyEstimate: 42,
        warrantyYears: '15-Yr Heat Exchanger · 5-Yr Parts',
        isRecommended: true,
        features: ['Endless on-demand hot water (9.8 GPM)', 'Dual stainless steel heat exchangers (0.95 UEF)', 'Built-in ComfortFlow buffer tank & recirculation pump'],
      },
      {
        name: 'Best',
        label: 'Navien Tankless + Whole-Home Halo Water Filtration',
        price: 5200,
        monthlyEstimate: 62,
        warrantyYears: '15-Yr Heat Exchanger · 10-Yr Filtration',
        features: ['All Navien tankless features', 'Halo 5-stage whole-home carbon & scale filtration', 'Zero maintenance design with digital valve'],
      },
    ],
  },
  {
    id: 'est-6',
    estimateNumber: 'EST-1046',
    customerName: 'Marcus Vance',
    customerPhone: '602-555-4411',
    serviceAddress: '2410 E University Dr, Phoenix, AZ 85034',
    tradeType: 'ELECTRICAL',
    title: 'Square D 200A Service Panel Upgrade & Surge Protection',
    status: 'ACCEPTED',
    selectedTierIndex: 1,
    grossMarginPct: 42.0,
    sentDateText: 'Signed 3 days ago',
    expiryText: 'Completed & Invoiced',
    tiers: [
      {
        name: 'Good',
        label: 'Basic 200A Main Panel Replacement',
        price: 3600,
        monthlyEstimate: 44,
        warrantyYears: '5-Yr Equipment · 1-Yr Labor',
        features: ['200A 40-circuit main breaker panel', 'New copper ground rod installation', 'City permit and inspection included'],
      },
      {
        name: 'Better',
        label: 'Square D QO 200A Panel + Whole-Home Surge + EV Pre-wire',
        price: 4800,
        monthlyEstimate: 58,
        warrantyYears: '10-Yr Equipment · 5-Yr Labor',
        isRecommended: true,
        features: ['Premium Square D QO copper bus panel', 'Type 2 whole-home surge protective device', '50A 240V Level 2 EV charging circuit pre-wire'],
      },
      {
        name: 'Best',
        label: 'Smart Grid Ready 200A Panel + Generator Interlock + EV Charger',
        price: 6900,
        monthlyEstimate: 82,
        warrantyYears: 'Lifetime Panel · 10-Yr Labor',
        features: ['Includes all Better tier upgrades', 'Manual transfer switch / generator interlock kit', 'Installed 48A smart EV wall charger'],
      },
    ],
  },
];

export default function EstimatesPage() {
  const [proposals, setProposals] = useState<Proposal[]>(INITIAL_PROPOSALS);
  const [statusFilter, setStatusFilter] = useState<'ALL' | ProposalStatus>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [tradeFilter, setTradeFilter] = useState<'ALL' | 'HVAC' | 'ELECTRICAL' | 'PLUMBING'>('ALL');

  // Preview & Action Modals
  const [previewProposal, setPreviewProposal] = useState<Proposal | null>(null);
  const [selectedTierInPreview, setSelectedTierInPreview] = useState<number>(1);
  const [isSendingSms, setIsSendingSms] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New Proposal Creation Modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newTrade, setNewTrade] = useState<'HVAC' | 'ELECTRICAL' | 'PLUMBING'>('HVAC');
  const [newTitle, setNewTitle] = useState('');
  const [newGoodPrice, setNewGoodPrice] = useState('7900');
  const [newBetterPrice, setNewBetterPrice] = useState('10500');
  const [newBestPrice, setNewBestPrice] = useState('13900');

  // Filtered Proposals
  const filteredProposals = proposals.filter((p) => {
    if (statusFilter !== 'ALL' && p.status !== statusFilter) return false;
    if (tradeFilter !== 'ALL' && p.tradeType !== tradeFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        p.estimateNumber.toLowerCase().includes(q) ||
        p.customerName.toLowerCase().includes(q) ||
        p.title.toLowerCase().includes(q) ||
        p.serviceAddress.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Calculate High-Level Metrics
  const totalPipeline = proposals
    .filter((p) => p.status === 'AWAITING_SIGNATURE' || p.status === 'DRAFT')
    .reduce((sum, p) => sum + p.tiers[p.selectedTierIndex].price, 0);

  const awaitingCount = proposals.filter((p) => p.status === 'AWAITING_SIGNATURE').length;

  const acceptedValue = proposals
    .filter((p) => p.status === 'ACCEPTED')
    .reduce((sum, p) => sum + p.tiers[p.selectedTierIndex].price, 0);

  // Handle Quick SMS Reminder
  const handleSendReminder = (p: Proposal) => {
    setIsSendingSms(true);
    setTimeout(() => {
      setIsSendingSms(false);
      setToastMessage(`Automated proposal SMS link sent to ${p.customerName} (${p.customerPhone})`);
      setTimeout(() => setToastMessage(null), 4000);
    }, 400);
  };

  // Simulate Digital Customer Signature
  const handleSimulateSign = (proposalId: string) => {
    setProposals((prev) =>
      prev.map((p) => (p.id === proposalId ? { ...p, status: 'ACCEPTED', sentDateText: 'Digitally signed just now' } : p))
    );
    if (previewProposal && previewProposal.id === proposalId) {
      setPreviewProposal((prev) => (prev ? { ...prev, status: 'ACCEPTED', sentDateText: 'Digitally signed just now' } : null));
    }
    setToastMessage('🎉 Customer signature simulated! Proposal accepted and official work order created.');
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Handle Create Proposal
  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const goodP = parseFloat(newGoodPrice) || 5000;
    const betterP = parseFloat(newBetterPrice) || 8000;
    const bestP = parseFloat(newBestPrice) || 11000;

    const newEst: Proposal = {
      id: `est-${Date.now()}`,
      estimateNumber: `EST-${Math.floor(1000 + Math.random() * 9000)}`,
      customerName: newCustName || 'New Client',
      customerPhone: newCustPhone || '480-555-0100',
      serviceAddress: 'Phoenix, AZ',
      tradeType: newTrade,
      title: newTitle || `${newTrade} System Replacement`,
      status: 'AWAITING_SIGNATURE',
      selectedTierIndex: 1,
      grossMarginPct: 39.5,
      sentDateText: 'Generated just now',
      expiryText: 'Valid for 14 days',
      tiers: [
        {
          name: 'Good',
          label: `${newTrade} Standard Package`,
          price: goodP,
          monthlyEstimate: Math.round(goodP / 84),
          warrantyYears: '5-Yr Equipment Warranty',
          features: ['Standard replacement', 'Code compliance & permits included'],
        },
        {
          name: 'Better',
          label: `${newTrade} High-Efficiency Package`,
          price: betterP,
          monthlyEstimate: Math.round(betterP / 84),
          warrantyYears: '10-Yr Parts & Labor',
          isRecommended: true,
          features: ['High-efficiency dual stage performance', 'Smart digital control included', 'Priority maintenance plan'],
        },
        {
          name: 'Best',
          label: `${newTrade} Premium Inverter / Smart System`,
          price: bestP,
          monthlyEstimate: Math.round(bestP / 84),
          warrantyYears: '12-Yr Complete Unit Replacement',
          features: ['Top-of-the-line variable speed technology', 'Maximum utility rebate eligible', 'Whole-home protection included'],
        },
      ],
    };

    setProposals([newEst, ...proposals]);
    setIsCreateOpen(false);
    setToastMessage(`✅ ${newEst.estimateNumber} created and ready to dispatch to customer!`);
    setTimeout(() => setToastMessage(null), 4000);

    // Reset Form
    setNewCustName('');
    setNewCustPhone('');
    setNewTitle('');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-medium flex items-center justify-between shadow-lg animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-emerald-400 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary shadow-sm">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
                <span>Tiered Estimates &amp; Proposals</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/30 font-mono">
                  Good / Better / Best
                </span>
              </h1>
              <p className="text-xs text-muted mt-0.5">
                Multi-option proposal engine with automated SMS follow-ups, margin tracking, and instant digital signing
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={() => setIsCreateOpen(true)}
            className="gap-2 text-xs shadow-md shadow-primary-glow"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create New Proposal</span>
          </Button>
        </div>
      </div>

      {/* High-Level Financial Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-surface/90 border border-border shadow-sm space-y-1">
          <div className="flex items-center justify-between text-muted text-xs">
            <span>Active Pipeline</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-white tracking-tight">
            ${totalPipeline.toLocaleString()}
          </div>
          <p className="text-[11px] text-muted">{awaitingCount} bids pending customer decision</p>
        </div>

        <div className="p-4 rounded-2xl bg-surface/90 border border-border shadow-sm space-y-1">
          <div className="flex items-center justify-between text-muted text-xs">
            <span>Awaiting Signature</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold text-white tracking-tight">{awaitingCount} Proposals</div>
          <p className="text-[11px] text-amber-400">2 automated SMS follow-ups active</p>
        </div>

        <div className="p-4 rounded-2xl bg-surface/90 border border-border shadow-sm space-y-1">
          <div className="flex items-center justify-between text-muted text-xs">
            <span>Signed &amp; Won</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-white tracking-tight">
            ${acceptedValue.toLocaleString()}
          </div>
          <p className="text-[11px] text-emerald-400">+18% close rate vs single-bid quotes</p>
        </div>

        <div className="p-4 rounded-2xl bg-surface/90 border border-border shadow-sm space-y-1">
          <div className="flex items-center justify-between text-muted text-xs">
            <span>Win Rate</span>
            <TrendingUp className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-extrabold text-white tracking-tight">42.5%</div>
          <p className="text-[11px] text-muted">Above industry benchmark (31%)</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-2xl bg-surface/90 border border-border p-3.5 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Search Box */}
          <div className="w-full sm:max-w-md relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by customer, proposal ID (EST-1041), or equipment..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-background border border-border text-white placeholder:text-muted/60 focus:outline-none focus:border-primary transition-all"
            />
          </div>

          {/* Trade Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs w-full sm:w-auto justify-start sm:justify-end">
            {(['ALL', 'HVAC', 'ELECTRICAL', 'PLUMBING'] as const).map((tr) => (
              <button
                key={tr}
                type="button"
                onClick={() => setTradeFilter(tr)}
                className={`px-2.5 py-1 rounded-lg transition-all text-[11px] font-semibold ${
                  tradeFilter === tr
                    ? 'bg-primary text-white shadow-sm shadow-primary-glow/20'
                    : 'text-muted hover:text-white bg-surface-elevated/70 border border-border/70'
                }`}
              >
                {tr}
              </button>
            ))}
          </div>
        </div>

        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar border-t border-border/60 pt-2.5 text-xs">
          {[
            { id: 'ALL', label: 'All Proposals' },
            { id: 'AWAITING_SIGNATURE', label: 'Awaiting Signature (Pending)' },
            { id: 'ACCEPTED', label: 'Accepted & Signed' },
            { id: 'DRAFT', label: 'Drafts & Exceptions' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id as any)}
              className={`px-3 py-1 rounded-xl transition-all text-xs ${
                statusFilter === tab.id
                  ? 'bg-surface-elevated text-white font-bold border border-border shadow-sm'
                  : 'text-muted hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Proposals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filteredProposals.map((p) => {
          const selectedTier = p.tiers[p.selectedTierIndex];
          const isPending = p.status === 'AWAITING_SIGNATURE';
          const isAccepted = p.status === 'ACCEPTED';
          const isDraft = p.status === 'DRAFT';

          return (
            <div
              key={p.id}
              className="rounded-2xl bg-surface/90 border border-border hover:border-primary/40 transition-all p-5 flex flex-col justify-between shadow-sm space-y-4"
            >
              {/* Card Top: Number, Trade, Status */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-primary px-2 py-0.5 rounded bg-primary/10 border border-primary/20">
                      {p.estimateNumber}
                    </span>
                    <span className="text-[10px] text-subtle font-medium uppercase tracking-wider">
                      {p.tradeType}
                    </span>
                  </div>

                  {/* Status Badge */}
                  {isAccepted ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      <span>Signed</span>
                    </span>
                  ) : isPending ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>Awaiting Sign</span>
                    </span>
                  ) : isDraft ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/15 text-blue-300 border border-blue-500/30">
                      Draft Review
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-300 border border-rose-500/30">
                      Expired
                    </span>
                  )}
                </div>

                {/* Customer & Title */}
                <div>
                  <h3 className="text-sm font-bold text-white tracking-tight">{p.customerName}</h3>
                  <p className="text-xs text-muted truncate mt-0.5">{p.title}</p>
                  <p className="text-[11px] text-subtle truncate mt-0.5">{p.serviceAddress}</p>
                </div>
              </div>

              {/* 3-Tier Mini Price Breakdown */}
              <div className="p-3 rounded-xl bg-background/80 border border-border/80 space-y-2">
                <div className="flex items-center justify-between text-[11px] text-muted">
                  <span>Selected Option: <strong>{selectedTier.name} Tier</strong></span>
                  <span className="text-emerald-400 font-bold">{p.grossMarginPct}% Margin</span>
                </div>

                {/* Price Display */}
                <div className="flex items-baseline justify-between">
                  <div className="text-xl font-extrabold text-white">
                    ${selectedTier.price.toLocaleString()}
                  </div>
                  <span className="text-[11px] text-muted font-mono">
                    ~${selectedTier.monthlyEstimate}/mo financed
                  </span>
                </div>

                {/* Good / Better / Best Micro Tabs */}
                <div className="grid grid-cols-3 gap-1 pt-1">
                  {p.tiers.map((t, idx) => (
                    <div
                      key={t.name}
                      className={`text-center py-1 px-1 rounded text-[10px] font-mono ${
                        idx === p.selectedTierIndex
                          ? 'bg-primary/20 text-white font-bold border border-primary/40'
                          : 'bg-surface-elevated text-subtle'
                      }`}
                    >
                      <div className="font-sans text-[9px] uppercase tracking-wider">{t.name}</div>
                      <div>${(t.price / 1000).toFixed(1)}k</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sent Status & Expiry */}
              <div className="text-[11px] flex items-center justify-between text-muted pt-1 border-t border-border/60">
                <span className="truncate">{p.sentDateText}</span>
                <span className="font-medium text-slate-300 shrink-0">{p.expiryText}</span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedTierInPreview(p.selectedTierIndex);
                    setPreviewProposal(p);
                  }}
                  className="flex-1 text-xs h-8 gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5 text-primary" />
                  <span>View Details</span>
                </Button>

                {isPending && (
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={() => handleSendReminder(p)}
                    disabled={isSendingSms}
                    className="text-xs h-8 px-3 gap-1.5 shadow-sm shadow-primary-glow/20"
                    title="Send instant SMS follow-up with signing link"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send SMS</span>
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: Full 3-Tier Interactive Proposal Viewer & Digital Signer        */}
      {/* ========================================================================= */}
      {previewProposal && (
        <Modal
          isOpen={Boolean(previewProposal)}
          onClose={() => setPreviewProposal(null)}
          title={`${previewProposal.estimateNumber} — ${previewProposal.title}`}
          description={`Customer: ${previewProposal.customerName} (${previewProposal.customerPhone}) · ${previewProposal.serviceAddress}`}
          maxWidth="2xl"
        >
          <div className="space-y-6 pt-2">
            {/* Top Status Ribbon */}
            <div className="p-3 rounded-xl bg-surface-elevated border border-border flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-muted">Status:</span>
                <Badge variant={previewProposal.status === 'ACCEPTED' ? 'success' : 'warning'}>
                  {previewProposal.status === 'ACCEPTED' ? 'Signed & Approved' : 'Awaiting Customer Signature'}
                </Badge>
              </div>

              <div className="flex items-center gap-4 text-slate-300 font-mono text-[11px]">
                <span>Gross Margin: <strong className="text-emerald-400">{previewProposal.grossMarginPct}%</strong></span>
                <span>Est. Profit: <strong className="text-emerald-400">${Math.round(previewProposal.tiers[selectedTierInPreview].price * (previewProposal.grossMarginPct / 100)).toLocaleString()}</strong></span>
              </div>
            </div>

            {/* 3-Tier Side-by-Side Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {previewProposal.tiers.map((tier, idx) => {
                const isSelected = selectedTierInPreview === idx;
                return (
                  <div
                    key={tier.name}
                    onClick={() => setSelectedTierInPreview(idx)}
                    className={`rounded-2xl p-4.5 border transition-all flex flex-col justify-between cursor-pointer space-y-4 relative ${
                      isSelected
                        ? 'bg-primary/10 border-primary shadow-lg shadow-primary-glow/15'
                        : 'bg-background/80 border-border hover:border-border-hover'
                    }`}
                  >
                    {tier.isRecommended && (
                      <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-primary text-white shadow-md">
                        Recommended
                      </span>
                    )}

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-muted">{tier.name} Tier</span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-primary" />}
                      </div>

                      <h4 className="text-xs font-semibold text-white leading-snug">{tier.label}</h4>

                      <div className="pt-2">
                        <div className="text-2xl font-extrabold text-white">${tier.price.toLocaleString()}</div>
                        <div className="text-[11px] text-muted font-mono">or ~${tier.monthlyEstimate}/mo (84 mos)</div>
                      </div>

                      <div className="text-[11px] text-emerald-400 font-medium py-1">
                        🛡️ {tier.warrantyYears}
                      </div>

                      <ul className="space-y-1.5 pt-2 text-[11px] text-slate-300 border-t border-border/60">
                        {tier.features.map((feat, fIdx) => (
                          <li key={fIdx} className="flex items-start gap-1.5">
                            <Check className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <button
                      type="button"
                      className={`w-full py-1.5 rounded-xl text-xs font-bold transition-all ${
                        isSelected
                          ? 'bg-primary text-white shadow-sm'
                          : 'bg-surface-elevated text-slate-300 border border-border'
                      }`}
                    >
                      {isSelected ? '✓ Selected Plan' : 'Select Plan'}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Bottom Modal Actions */}
            <div className="p-4 rounded-xl bg-surface border border-border flex flex-col sm:flex-row items-center justify-between gap-3 pt-3">
              <div className="text-xs text-muted">
                Selected: <strong className="text-white">{previewProposal.tiers[selectedTierInPreview].name} Tier</strong> — Total{' '}
                <strong className="text-emerald-400 text-sm">${previewProposal.tiers[selectedTierInPreview].price.toLocaleString()}</strong>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleSendReminder(previewProposal)}
                >
                  <Send className="w-3.5 h-3.5 mr-1.5" />
                  <span>Send Customer SMS</span>
                </Button>

                {previewProposal.status !== 'ACCEPTED' && (
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={() => handleSimulateSign(previewProposal.id)}
                    className="shadow-md shadow-primary-glow"
                  >
                    <Check className="w-3.5 h-3.5 mr-1.5" />
                    <span>Simulate Customer Sign</span>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: Create New Tiered Proposal                                       */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create Tiered Good / Better / Best Proposal"
        description="Generates an interactive 3-tier proposal link sent directly to customer via SMS & Email"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4 pt-2 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-200 block mb-1">Customer Full Name</label>
              <input
                type="text"
                required
                value={newCustName}
                onChange={(e) => setNewCustName(e.target.value)}
                placeholder="e.g. Robert Vance"
                className="w-full px-3 py-2 rounded-xl bg-background border border-border text-white text-xs focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-200 block mb-1">Customer Mobile Phone</label>
              <input
                type="tel"
                required
                value={newCustPhone}
                onChange={(e) => setNewCustPhone(e.target.value)}
                placeholder="480-555-0199"
                className="w-full px-3 py-2 rounded-xl bg-background border border-border text-white text-xs focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-200 block mb-1">Trade Category</label>
              <select
                value={newTrade}
                onChange={(e) => setNewTrade(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-background border border-border text-white text-xs focus:outline-none focus:border-primary"
              >
                <option value="HVAC">HVAC (Heating &amp; Air)</option>
                <option value="ELECTRICAL">Electrical Service</option>
                <option value="PLUMBING">Plumbing &amp; Water Heaters</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-200 block mb-1">Proposal Title</label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Trane 4-Ton System Replacement"
                className="w-full px-3 py-2 rounded-xl bg-background border border-border text-white text-xs focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          {/* Pricing Options */}
          <div className="p-3.5 rounded-xl bg-background border border-border space-y-3">
            <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span>Tiered Package Pricing ($ USD)</span>
            </h4>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-muted block text-[11px] mb-1">Good (Base)</label>
                <input
                  type="number"
                  value={newGoodPrice}
                  onChange={(e) => setNewGoodPrice(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-surface border border-border text-white text-xs font-mono"
                />
              </div>

              <div>
                <label className="text-primary font-bold block text-[11px] mb-1">Better (Recommended)</label>
                <input
                  type="number"
                  value={newBetterPrice}
                  onChange={(e) => setNewBetterPrice(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-surface border border-primary/50 text-white text-xs font-mono font-bold"
                />
              </div>

              <div>
                <label className="text-muted block text-[11px] mb-1">Best (Premium)</label>
                <input
                  type="number"
                  value={newBestPrice}
                  onChange={(e) => setNewBestPrice(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-surface border border-border text-white text-xs font-mono"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" className="shadow-md shadow-primary-glow">
              Generate &amp; Save Proposal
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
