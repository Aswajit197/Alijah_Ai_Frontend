'use client';

import React, { useState } from 'react';
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
  Share2,
  Bot,
  User,
  PhoneCall,
  Calendar,
  Layers,
  MapPin,
  FileCheck,
  Wrench,
  Zap,
  Flame,
} from 'lucide-react';

export type ProposalStatus = 'ALL' | 'DRAFT' | 'SENT' | 'VIEWED' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED';

export interface TierOption {
  name: string; // "Good" | "Better" | "Best"
  label: string;
  price: number;
  monthlyEstimate?: number;
  warrantyYears?: string;
  isRecommended?: boolean;
  features: string[];
}

export interface Proposal {
  id: string;
  estimateNumber: string; // e.g. "EST-2208"
  isDraftedByElijah?: boolean;
  customerName: string;
  customerPhone: string;
  serviceAddress: string;
  tradeType: 'HVAC' | 'ELECTRICAL' | 'PLUMBING';
  title: string;
  amount: number;
  status: 'DRAFT' | 'SENT' | 'VIEWED' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED';
  repName: string;
  followUpStatus?: {
    isActive: boolean;
    nextStep?: string; // e.g. "Next email Sun, Oct 18"
    viewsCount?: number;
  };
  createdDateText: string;
  selectedTierIndex?: number;
  grossMarginPct?: number;
  sentDateText: string;
  expiryText: string;
  hasTiers?: boolean;
  tiers?: TierOption[];
  scopeItems?: string[];
  notes?: string;
}

const INITIAL_PROPOSALS: Proposal[] = [
  {
    id: 'est-2208',
    estimateNumber: 'EST-2208',
    isDraftedByElijah: true,
    customerName: 'Linda Parker',
    customerPhone: '(602) 555-0199',
    serviceAddress: '100 N Central Ave, Phoenix, AZ 85004',
    tradeType: 'HVAC',
    title: 'Heat pump system replacement',
    amount: 14500,
    status: 'DRAFT',
    repName: 'Jessica Thompson',
    createdDateText: 'Mon, Oct 12',
    selectedTierIndex: 2,
    grossMarginPct: 41.0,
    sentDateText: 'Auto-drafted by Elijah from dispatch diagnostic',
    expiryText: 'Valid for 14 days after send',
    hasTiers: true,
    scopeItems: [
      'Removal & environmentally safe disposal of existing 12-year HVAC unit',
      'Installation of high-efficiency multi-stage heat pump system',
      'New digital programmable thermostat & Wi-Fi gateway configuration',
      'Supply plenum modification & vibration dampening pad installation',
      'Complete nitrogen pressure test, evacuation, and manufacturer refrigerant charge',
      'City permit procurement and final inspection sign-off',
    ],
    tiers: [
      {
        name: 'Good',
        label: 'Trane XR14 Single Stage 14.3 SEER2',
        price: 9200,
        monthlyEstimate: 105,
        warrantyYears: '10-Yr Compressor · 5-Yr Parts',
        features: ['Climatuff compressor reliability', 'Spine Fin all-aluminum outdoor coil', 'Standard digital thermostat'],
      },
      {
        name: 'Better',
        label: 'Trane XR16 Two-Stage High-Efficiency System',
        price: 12800,
        monthlyEstimate: 145,
        warrantyYears: '10-Yr Parts · 3-Yr Labor',
        isRecommended: true,
        features: ['Two stages of cooling for desert summer peaks', 'Weatherguard fasteners & zinc-coated base', 'Nexia smart diagnostics integration'],
      },
      {
        name: 'Best',
        label: 'Trane XV18 TruComfort Variable Speed Inverter',
        price: 14500,
        monthlyEstimate: 168,
        warrantyYears: '12-Yr Compressor · 10-Yr Parts · 5-Yr Labor',
        features: ['750 levels of automatic speed modulation', 'CleanEffects electronic air cleaner included', 'Near-silent operation even in 115°F heat'],
      },
    ],
  },
  {
    id: 'est-1041',
    estimateNumber: 'EST-1041',
    isDraftedByElijah: true,
    customerName: 'Carl Jensen',
    customerPhone: '(480) 555-0144',
    serviceAddress: '1725 E Camelback Rd, Phoenix, AZ 85016',
    tradeType: 'HVAC',
    title: 'Carrier 5-Ton Comfort 14 Heat Pump Replacement',
    amount: 11250,
    status: 'VIEWED',
    repName: 'Jessica Thompson',
    followUpStatus: {
      isActive: true,
      nextStep: 'Next SMS in 2 days',
      viewsCount: 3,
    },
    createdDateText: 'Sun, Oct 11',
    selectedTierIndex: 1,
    grossMarginPct: 38.5,
    sentDateText: 'Sent 2h ago via SMS',
    expiryText: 'Valid for 7 days',
    hasTiers: true,
    scopeItems: [
      'Complete disconnect & removal of aging rooftop split system',
      'Installation of Carrier Performance 16 SEER2 heat pump system',
      'Smart Ecobee thermostat installation & customer mobile app pairing',
      'Duct seal verification and airflow balancing across all registers',
      '10-Year parts and 2-year labor comprehensive warranty',
    ],
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
        features: ['Two-stage compressor for lower bills', 'Variable speed blower motor', 'Smart Wi-Fi Ecobee thermostat included'],
      },
      {
        name: 'Best',
        label: 'Carrier Infinity 18 SEER2 Variable-Speed Inverter',
        price: 14500,
        monthlyEstimate: 168,
        warrantyYears: '10-Yr Parts · 5-Yr Labor',
        features: ['Ultra-efficient inverter system', 'Whisper-quiet operation as low as 58 dBA', 'Infinity Smart Control'],
      },
    ],
  },
  {
    id: 'est-2441',
    estimateNumber: 'EST-2441',
    customerName: 'Carlos Hill',
    customerPhone: '(602) 555-0122',
    serviceAddress: '3810 E Thomas Rd, Phoenix, AZ 85018',
    tradeType: 'ELECTRICAL',
    title: 'Electrical upgrade & subpanel addition',
    amount: 1650,
    status: 'ACCEPTED',
    repName: 'Daniel Reed',
    createdDateText: 'Fri, Oct 9',
    selectedTierIndex: 0,
    grossMarginPct: 45.0,
    sentDateText: 'Digitally signed Oct 9',
    expiryText: 'Accepted',
    hasTiers: false,
    scopeItems: [
      'Install Square D QO 100A dedicated subpanel in detached garage/workshop',
      'Surface-mounted EMT conduit run from main service panel',
      'Dual 50-amp heavy duty branch circuits for welder and high-draw tools',
      'Dual-function AFCI/GFCI circuit breaker protection according to NEC code',
      'Municipal electrical inspection and permit sign-off',
    ],
  },
  {
    id: 'est-2211',
    estimateNumber: 'EST-2211',
    customerName: 'Ellen Fischer',
    customerPhone: '(480) 555-0811',
    serviceAddress: '8830 E Desert Cove Ave, Scottsdale, AZ 85260',
    tradeType: 'PLUMBING',
    title: 'Tankless water heater replacement',
    amount: 4900,
    status: 'SENT',
    repName: 'Daniel Reed',
    followUpStatus: {
      isActive: true,
      nextStep: 'Next email Sun, Oct 18',
      viewsCount: 1,
    },
    createdDateText: 'Thu, Oct 8',
    selectedTierIndex: 1,
    grossMarginPct: 42.0,
    sentDateText: 'Sent Thu, Oct 8 via SMS & Email',
    expiryText: 'Valid for 14 days',
    hasTiers: true,
    scopeItems: [
      'Drain, disconnect, and haul away leaking 50-gallon tank water heater',
      'Supply and install Navien NPE-240A2 condensing tankless unit (11.2 GPM)',
      'Run new 2-inch PVC intake and exhaust venting through exterior wall',
      'Upgrade gas line feed to high-flow 3/4" with dedicated gas shutoff valve',
      'Install built-in recirculation loop for on-demand instant hot water',
    ],
    tiers: [
      {
        name: 'Good',
        label: 'Navien NPE-180A2 Standard Condensing Unit',
        price: 3800,
        monthlyEstimate: 55,
        warrantyYears: '15-Yr Heat Exchanger · 5-Yr Parts',
        features: ['Endless hot water up to 8.4 GPM', 'Dual stainless steel heat exchangers', 'Standard digital controller'],
      },
      {
        name: 'Better',
        label: 'Navien NPE-240A2 High-Flow with Built-in Recirculation',
        price: 4900,
        monthlyEstimate: 68,
        warrantyYears: '15-Yr Heat Exchanger · 5-Yr Parts · 3-Yr Labor',
        isRecommended: true,
        features: ['ComfortFlow recirc pump for instant hot water', 'High capacity 11.2 GPM', 'NaviLink Wi-Fi phone monitoring'],
      },
      {
        name: 'Best',
        label: 'Navien NPE-240A2 + Whole-House Scale Prevention System',
        price: 6400,
        monthlyEstimate: 85,
        warrantyYears: 'Lifetime Scale Guard · 15-Yr Exchanger',
        features: ['Includes PeakFlow anti-scale cartridge system', 'Protects against desert calcium buildup', 'Full bypass isolation valves'],
      },
    ],
  },
  {
    id: 'est-2205',
    estimateNumber: 'EST-2205',
    isDraftedByElijah: true,
    customerName: 'Ray Okafor',
    customerPhone: '(480) 555-0144',
    serviceAddress: '1725 E Camelback Rd, Phoenix, AZ 85016',
    tradeType: 'HVAC',
    title: 'HVAC system replacement',
    amount: 14895,
    status: 'ACCEPTED',
    repName: 'Daniel Reed',
    createdDateText: 'Wed, Oct 7',
    selectedTierIndex: 1,
    grossMarginPct: 39.0,
    sentDateText: 'Accepted & promoted to Project PRJ-302',
    expiryText: 'Converted to Install',
    hasTiers: false,
    scopeItems: [
      'Complete teardown of failed compressor unit and evaporator coil',
      'Installation of Lennox Elite 16 SEER2 high-efficiency heat pump system',
      'Dual-stage cooling configuration with QuietZone acoustic dampening',
      'Full electrical whip and disconnect box replacement',
      '10-Year parts and labor guarantee',
    ],
  },
  {
    id: 'est-2421',
    estimateNumber: 'EST-2421',
    customerName: 'Deborah Cruz',
    customerPhone: '(602) 555-4499',
    serviceAddress: '2411 W Glendale Ave, Phoenix, AZ 85021',
    tradeType: 'ELECTRICAL',
    title: 'Electrical upgrade & meter socket replacement',
    amount: 2100,
    status: 'EXPIRED',
    repName: 'Marco Diaz',
    createdDateText: 'Wed, Oct 7',
    selectedTierIndex: 0,
    grossMarginPct: 40.0,
    sentDateText: 'Sent Sep 23 (Expired)',
    expiryText: 'Expired',
    hasTiers: false,
    scopeItems: [
      'Replace weatherhead, mast riser conduit, and meter enclosure',
      'Coordinate scheduled power disconnect and re-energization with APS utility',
      'Install heavy-duty copper grounding electrode system and bonding jumper',
    ],
  },
  {
    id: 'est-2462',
    estimateNumber: 'EST-2462',
    customerName: 'Sharon Diaz',
    customerPhone: '(480) 555-9191',
    serviceAddress: '512 N 44th St, Phoenix, AZ 85008',
    tradeType: 'HVAC',
    title: 'HVAC system replacement',
    amount: 14895,
    status: 'ACCEPTED',
    repName: 'Daniel Reed',
    createdDateText: 'Tue, Oct 6',
    selectedTierIndex: 1,
    grossMarginPct: 40.5,
    sentDateText: 'Signed Oct 6',
    expiryText: 'Accepted',
    hasTiers: false,
    scopeItems: [
      'Replace aging package unit on roof curb with new Carrier Performance unit',
      'Crane hoist and secure rigging to rooftop mounting curb',
      'New supply/return curb transition duct adaptors and weatherproof flashing',
    ],
  },
  {
    id: 'est-2460',
    estimateNumber: 'EST-2460',
    customerName: 'Scottsdale Bistro',
    customerPhone: '(480) 555-3344',
    serviceAddress: '7114 E Stetson Dr, Scottsdale, AZ 85251',
    tradeType: 'PLUMBING',
    title: 'Commercial water heater replacement',
    amount: 2450,
    status: 'ACCEPTED',
    repName: 'Jessica Thompson',
    createdDateText: 'Mon, Oct 5',
    selectedTierIndex: 0,
    grossMarginPct: 44.0,
    sentDateText: 'Accepted Oct 5',
    expiryText: 'Accepted',
    hasTiers: false,
    scopeItems: [
      'Commercial 50-Gal gas water heater emergency swap for restaurant kitchen',
      'Heavy-duty commercial anode rod and brass drain valve installation',
      'Gas connection flex line replacement and bubble leak testing',
    ],
  },
  {
    id: 'est-2443',
    estimateNumber: 'EST-2443',
    customerName: 'Eric Taylor',
    customerPhone: '(602) 555-7711',
    serviceAddress: '1420 W Bethany Home Rd, Phoenix, AZ 85013',
    tradeType: 'ELECTRICAL',
    title: 'Main breaker panel replacement',
    amount: 1650,
    status: 'ACCEPTED',
    repName: 'Daniel Reed',
    createdDateText: 'Thu, Oct 1',
    selectedTierIndex: 0,
    grossMarginPct: 43.0,
    sentDateText: 'Accepted Oct 1',
    expiryText: 'Accepted',
    hasTiers: false,
    scopeItems: [
      '100A main service panel changeout with Square D QO breaker center',
      'Relabel all branch circuits and balance load across phases',
      'Install whole-home surge protector in panel',
    ],
  },
  {
    id: 'est-2450',
    estimateNumber: 'EST-2450',
    customerName: 'Tyler Wright',
    customerPhone: '(480) 555-8833',
    serviceAddress: '3104 E Shea Blvd, Phoenix, AZ 85028',
    tradeType: 'PLUMBING',
    title: 'Water heater replacement',
    amount: 3200,
    status: 'EXPIRED',
    repName: 'Daniel Reed',
    createdDateText: 'Wed, Sep 30',
    selectedTierIndex: 0,
    grossMarginPct: 38.0,
    sentDateText: 'Expired Sep 30',
    expiryText: 'Expired',
    hasTiers: false,
    scopeItems: [
      '50-Gallon electric water heater replacement with expansion tank',
      'New brass ball valve shutoff and braided stainless water flex lines',
      'Safety pan and drain pipe plumbed to exterior',
    ],
  },
  {
    id: 'est-2440',
    estimateNumber: 'EST-2440',
    customerName: 'Brian Lopez',
    customerPhone: '(602) 555-6622',
    serviceAddress: '7822 N 12th St, Phoenix, AZ 85020',
    tradeType: 'PLUMBING',
    title: 'Water heater replacement',
    amount: 3200,
    status: 'SENT',
    repName: 'Jessica Thompson',
    followUpStatus: {
      isActive: true,
      nextStep: 'Next SMS tomorrow',
      viewsCount: 2,
    },
    createdDateText: 'Wed, Sep 30',
    selectedTierIndex: 0,
    grossMarginPct: 39.0,
    sentDateText: 'Sent via SMS Sep 30',
    expiryText: 'Valid for 7 days',
    hasTiers: false,
    scopeItems: [
      '50-Gallon atmospheric gas water heater with Bradford White Defender system',
      'New thermostatic mixing valve to prevent scalding',
      'Gas valve replacement and chimney draft test verification',
    ],
  },
  {
    id: 'est-2444',
    estimateNumber: 'EST-2444',
    customerName: 'Luis White',
    customerPhone: '(480) 555-1100',
    serviceAddress: '4401 E Greenway Rd, Phoenix, AZ 85032',
    tradeType: 'HVAC',
    title: 'HVAC system replacement',
    amount: 19750,
    status: 'ACCEPTED',
    repName: 'Marco Diaz',
    createdDateText: 'Mon, Sep 28',
    selectedTierIndex: 2,
    grossMarginPct: 43.5,
    sentDateText: 'Accepted Sep 28',
    expiryText: 'Accepted',
    hasTiers: false,
    scopeItems: [
      'Install Trane 4-Ton Variable Speed Inverter Dual Fuel System',
      'High-efficiency gas furnace paired with variable heat pump',
      'New media air filter cabinet and high-MERV filter rack',
    ],
  },
  {
    id: 'est-2409',
    estimateNumber: 'EST-2409',
    customerName: 'Canyon Ridge Offices',
    customerPhone: '(602) 555-9000',
    serviceAddress: '9200 N 7th Ave, Phoenix, AZ 85021',
    tradeType: 'ELECTRICAL',
    title: 'Commercial lighting retrofit & panel service',
    amount: 2100,
    status: 'ACCEPTED',
    repName: 'Tara Quinn',
    createdDateText: 'Sun, Sep 27',
    selectedTierIndex: 0,
    grossMarginPct: 42.0,
    sentDateText: 'Accepted Sep 27',
    expiryText: 'Accepted',
    hasTiers: false,
    scopeItems: [
      'Commercial LED fixture retrofit across primary conference room and corridors',
      'New commercial grade breakers and circuit verification',
    ],
  },
  {
    id: 'est-2402',
    estimateNumber: 'EST-2402',
    customerName: 'Susan Lewis',
    customerPhone: '(480) 555-5511',
    serviceAddress: '6801 E Thomas Rd, Scottsdale, AZ 85251',
    tradeType: 'PLUMBING',
    title: 'Tankless water heater installation',
    amount: 4900,
    status: 'ACCEPTED',
    repName: 'Daniel Reed',
    createdDateText: 'Wed, Sep 23',
    selectedTierIndex: 1,
    grossMarginPct: 41.0,
    sentDateText: 'Accepted Sep 23',
    expiryText: 'Accepted',
    hasTiers: false,
    scopeItems: [
      'Install Navien NPE-240A2 recirculating tankless water heater',
      'Direct vent piping through exterior stucco wall',
      'Hard water scale prevention cartridge filter included',
    ],
  },
];

export default function EstimatesPage() {
  const [proposals, setProposals] = useState<Proposal[]>(INITIAL_PROPOSALS);
  const [statusFilter, setStatusFilter] = useState<ProposalStatus>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Active Proposal Modal
  const [activeProposal, setActiveProposal] = useState<Proposal | null>(null);
  const [activeModalTab, setActiveModalTab] = useState<'STANDARD' | 'TIERS'>('STANDARD');
  const [selectedTierInPreview, setSelectedTierInPreview] = useState<number>(0);
  const [isSendingSms, setIsSendingSms] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New Estimate Creation Modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newTrade, setNewTrade] = useState<'HVAC' | 'ELECTRICAL' | 'PLUMBING'>('HVAC');
  const [newTitle, setNewTitle] = useState('');
  const [newAmount, setNewAmount] = useState('2450');
  const [enableTiers, setEnableTiers] = useState(false);

  // Filter Counts
  const countAll = proposals.length;
  const countDraft = proposals.filter((p) => p.status === 'DRAFT').length;
  const countSent = proposals.filter((p) => p.status === 'SENT').length;
  const countViewed = proposals.filter((p) => p.status === 'VIEWED').length;
  const countAccepted = proposals.filter((p) => p.status === 'ACCEPTED').length;
  const countDeclined = proposals.filter((p) => p.status === 'DECLINED').length;
  const countExpired = proposals.filter((p) => p.status === 'EXPIRED').length;

  // Filtered Proposals
  const filteredProposals = proposals.filter((p) => {
    if (statusFilter !== 'ALL' && p.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        p.estimateNumber.toLowerCase().includes(q) ||
        p.customerName.toLowerCase().includes(q) ||
        p.title.toLowerCase().includes(q) ||
        p.repName.toLowerCase().includes(q) ||
        p.serviceAddress.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // KPI Calculations
  const openPipelineValue = proposals
    .filter((p) => p.status === 'DRAFT' || p.status === 'SENT' || p.status === 'VIEWED')
    .reduce((sum, p) => sum + p.amount, 0);

  const acceptedValue = proposals
    .filter((p) => p.status === 'ACCEPTED')
    .reduce((sum, p) => sum + p.amount, 0);

  const activeFollowUpsCount = proposals.filter((p) => p.followUpStatus?.isActive).length;

  // Quick SMS Follow-Up Trigger
  const handleSendReminder = (p: Proposal) => {
    setIsSendingSms(true);
    setTimeout(() => {
      setIsSendingSms(false);
      setToastMessage(`Automated proposal link sent to ${p.customerName} via SMS (${p.customerPhone})`);
      setTimeout(() => setToastMessage(null), 4000);
    }, 400);
  };

  // Simulate Digital Customer Acceptance
  const handleSimulateSign = (proposalId: string) => {
    setProposals((prev) =>
      prev.map((p) => (p.id === proposalId ? { ...p, status: 'ACCEPTED', sentDateText: 'Digitally accepted just now' } : p))
    );
    if (activeProposal && activeProposal.id === proposalId) {
      setActiveProposal((prev) => (prev ? { ...prev, status: 'ACCEPTED', sentDateText: 'Digitally accepted just now' } : null));
    }
    setToastMessage('🎉 Proposal accepted! Work order generated and scheduled for dispatch.');
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Send Estimate
  const handleSendEstimate = (proposalId: string) => {
    setProposals((prev) =>
      prev.map((p) => (p.id === proposalId ? { ...p, status: 'SENT', sentDateText: 'Sent just now via SMS & Email' } : p))
    );
    if (activeProposal && activeProposal.id === proposalId) {
      setActiveProposal((prev) => (prev ? { ...prev, status: 'SENT', sentDateText: 'Sent just now via SMS & Email' } : null));
    }
    setToastMessage('Estimate sent to customer with e-sign link!');
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Handle Create New Estimate
  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName || !newTitle) return;

    const parsedAmount = parseFloat(newAmount) || 2450;
    const newEstNum = `EST-${2500 + proposals.length}`;

    const newProposal: Proposal = {
      id: `est-${Date.now()}`,
      estimateNumber: newEstNum,
      isDraftedByElijah: false,
      customerName: newCustName,
      customerPhone: newCustPhone || '(602) 555-0100',
      serviceAddress: 'Phoenix Metro Area, AZ',
      tradeType: newTrade,
      title: newTitle,
      amount: parsedAmount,
      status: 'DRAFT',
      repName: 'Daniel Reed',
      createdDateText: 'Today',
      sentDateText: 'Drafted just now',
      expiryText: 'Valid for 14 days',
      hasTiers: enableTiers,
      scopeItems: [
        `Complete service and materials for ${newTitle}`,
        'Safety compliance check and standard trade permits',
        'Clean work area guarantee and disposal of replaced parts',
        'Standard 1-year workmanship warranty included',
      ],
      tiers: enableTiers
        ? [
            {
              name: 'Good',
              label: `${newTitle} — Standard`,
              price: Math.round(parsedAmount * 0.85),
              monthlyEstimate: Math.round((parsedAmount * 0.85) / 48),
              features: ['Standard system components', 'Standard 1-year warranty'],
            },
            {
              name: 'Better',
              label: `${newTitle} — High Efficiency`,
              price: parsedAmount,
              monthlyEstimate: Math.round(parsedAmount / 48),
              isRecommended: true,
              features: ['Upgraded energy efficiency rating', 'Extended 3-year warranty'],
            },
            {
              name: 'Best',
              label: `${newTitle} — Premium`,
              price: Math.round(parsedAmount * 1.3),
              monthlyEstimate: Math.round((parsedAmount * 1.3) / 48),
              features: ['Top-tier equipment and quiet acoustics', '10-year comprehensive warranty'],
            },
          ]
        : undefined,
    };

    setProposals([newProposal, ...proposals]);
    setIsCreateOpen(false);
    setNewCustName('');
    setNewCustPhone('');
    setNewTitle('');
    setEnableTiers(false);
    setToastMessage(`Created new estimate ${newEstNum}`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <div className="flex-1 space-y-6 p-6 lg:p-8 max-w-[1600px] mx-auto">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-3 bg-foreground text-background px-5 py-3 rounded-xl shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300">
          <Sparkles className="w-4 h-4 text-primary shrink-0" />
          <span className="text-sm font-semibold">{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="ml-2 hover:opacity-75">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-foreground">Estimates & Quotes</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage customer quotes, track views, and automate SMS follow-ups through Elijah.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => setIsCreateOpen(true)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-4 py-2 rounded-lg text-sm shadow-sm flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New estimate
          </Button>
        </div>
      </div>

      {/* High-Level Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-surface/80 border border-border/70 rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Open Pipeline</span>
            <div className="text-2xl font-bold text-foreground mt-1">${openPipelineValue.toLocaleString()}</div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {countDraft + countSent + countViewed} active quotes awaiting customer decision
            </p>
          </div>
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-surface/80 border border-border/70 rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Accepted Quotes</span>
            <div className="text-2xl font-bold text-emerald-400 mt-1">${acceptedValue.toLocaleString()}</div>
            <p className="text-[11px] text-muted-foreground mt-0.5">{countAccepted} approved projects booked</p>
          </div>
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-surface/80 border border-border/70 rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Autonomous Follow-Ups</span>
            <div className="text-2xl font-bold text-primary mt-1">{activeFollowUpsCount} Active</div>
            <p className="text-[11px] text-muted-foreground mt-0.5">Elijah SMS & email cadence keeping deals warm</p>
          </div>
          <div className="p-3 rounded-xl bg-primary/10 text-primary">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-1">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
              statusFilter === 'ALL'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-surface hover:bg-surface-hover text-muted-foreground hover:text-foreground border border-border/60'
            }`}
          >
            All <span className="opacity-75 ml-1">({countAll})</span>
          </button>

          <button
            onClick={() => setStatusFilter('DRAFT')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
              statusFilter === 'DRAFT'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-surface hover:bg-surface-hover text-muted-foreground hover:text-foreground border border-border/60'
            }`}
          >
            Draft <span className="opacity-75 ml-1">({countDraft})</span>
          </button>

          <button
            onClick={() => setStatusFilter('SENT')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
              statusFilter === 'SENT'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-surface hover:bg-surface-hover text-muted-foreground hover:text-foreground border border-border/60'
            }`}
          >
            Sent <span className="opacity-75 ml-1">({countSent})</span>
          </button>

          <button
            onClick={() => setStatusFilter('VIEWED')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
              statusFilter === 'VIEWED'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-surface hover:bg-surface-hover text-muted-foreground hover:text-foreground border border-border/60'
            }`}
          >
            Viewed <span className="opacity-75 ml-1">({countViewed})</span>
          </button>

          <button
            onClick={() => setStatusFilter('ACCEPTED')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
              statusFilter === 'ACCEPTED'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-surface hover:bg-surface-hover text-muted-foreground hover:text-foreground border border-border/60'
            }`}
          >
            Accepted <span className="opacity-75 ml-1">({countAccepted})</span>
          </button>

          <button
            onClick={() => setStatusFilter('EXPIRED')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
              statusFilter === 'EXPIRED'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-surface hover:bg-surface-hover text-muted-foreground hover:text-foreground border border-border/60'
            }`}
          >
            Expired <span className="opacity-75 ml-1">({countExpired})</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search estimates, customers..."
            className="w-full bg-surface border border-border rounded-lg pl-9 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {/* Main Clean Estimates Table */}
      <div className="rounded-xl border border-border bg-surface/95 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-hover/80 text-muted-foreground font-semibold border-b border-border uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Estimate</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Service Scope</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Rep</th>
                <th className="py-3 px-4">Follow-Up</th>
                <th className="py-3 px-4">Created</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredProposals.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-muted-foreground">
                    No estimates match the selected filter.
                  </td>
                </tr>
              ) : (
                filteredProposals.map((p) => {
                  const isAwaitingOrSent = p.status === 'SENT' || p.status === 'VIEWED' || p.status === 'DRAFT';
                  return (
                    <tr
                      key={p.id}
                      onClick={() => {
                        setActiveProposal(p);
                        setActiveModalTab('STANDARD');
                        setSelectedTierInPreview(p.selectedTierIndex || 0);
                      }}
                      className="hover:bg-surface-hover/50 cursor-pointer transition-colors group"
                    >
                      {/* Estimate Number */}
                      <td className="py-3 px-4 font-mono font-medium text-foreground whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-primary">{p.estimateNumber}</span>
                          {p.isDraftedByElijah && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-sans font-medium bg-indigo-950/80 text-indigo-300 border border-indigo-800/60 flex items-center gap-1">
                              <Bot className="w-3 h-3 text-indigo-400" />
                              AI Draft
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Customer Name */}
                      <td className="py-3 px-4 font-semibold text-foreground whitespace-nowrap">
                        <div>
                          <div>{p.customerName}</div>
                          <div className="text-[11px] text-muted-foreground font-normal">{p.customerPhone}</div>
                        </div>
                      </td>

                      {/* Scope Title */}
                      <td className="py-3 px-4 text-muted-foreground max-w-[280px]">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-muted/60 text-muted-foreground shrink-0">
                            {p.tradeType}
                          </span>
                          <span className="truncate text-foreground font-medium" title={p.title}>
                            {p.title}
                          </span>
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="py-3 px-4 font-bold text-foreground whitespace-nowrap text-sm">
                        ${p.amount.toLocaleString()}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        {p.status === 'ACCEPTED' && (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1 w-fit">
                            <Check className="w-3 h-3" /> Accepted
                          </span>
                        )}
                        {p.status === 'DRAFT' && (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            Draft
                          </span>
                        )}
                        {p.status === 'SENT' && (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                            Sent
                          </span>
                        )}
                        {p.status === 'VIEWED' && (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center gap-1 w-fit">
                            <Eye className="w-3 h-3 text-purple-400" /> Viewed
                          </span>
                        )}
                        {p.status === 'DECLINED' && (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                            Declined
                          </span>
                        )}
                        {p.status === 'EXPIRED' && (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-muted/60 text-muted-foreground border border-border">
                            Expired
                          </span>
                        )}
                      </td>

                      {/* Rep Name */}
                      <td className="py-3 px-4 text-muted-foreground whitespace-nowrap">{p.repName}</td>

                      {/* Follow-up */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        {p.followUpStatus?.isActive ? (
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            <span className="text-[11px] text-muted-foreground">{p.followUpStatus.nextStep}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground/50">—</span>
                        )}
                      </td>

                      {/* Created Date */}
                      <td className="py-3 px-4 text-muted-foreground whitespace-nowrap">{p.createdDateText}</td>

                      {/* Action buttons */}
                      <td className="py-3 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2">
                          {isAwaitingOrSent && (
                            <button
                              onClick={() => handleSendReminder(p)}
                              title="Send follow-up SMS reminder"
                              className="p-1.5 rounded-md hover:bg-surface-hover text-primary transition-colors"
                            >
                              <Send className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setActiveProposal(p);
                              setActiveModalTab('STANDARD');
                              setSelectedTierInPreview(p.selectedTierIndex || 0);
                            }}
                            className="px-2.5 py-1 rounded-md bg-surface-hover hover:bg-border text-foreground text-[11px] font-medium flex items-center gap-1 transition-colors"
                          >
                            View Quote
                            <ChevronRight className="w-3 h-3 text-muted-foreground" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ======================== CLEAN ESTIMATE DETAILS MODAL ======================== */}
      {activeProposal && (
        <Modal
          isOpen={!!activeProposal}
          onClose={() => setActiveProposal(null)}
          title={`Estimate ${activeProposal.estimateNumber} — ${activeProposal.customerName}`}
        >
          <div className="space-y-6 max-h-[80vh] overflow-y-auto pr-1">
            {/* Header Status & Top Actions */}
            <div className="bg-surface/80 border border-border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-foreground">{activeProposal.title}</h3>
                  {activeProposal.isDraftedByElijah && (
                    <Badge variant="outline" className="text-indigo-400 border-indigo-500/30 text-[10px]">
                      <Bot className="w-3 h-3 mr-1" /> Drafted by Elijah AI
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                  <MapPin className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  <span>{activeProposal.serviceAddress}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {activeProposal.status === 'ACCEPTED' ? (
                  <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 py-1 px-3">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                    Accepted & Work Order Created
                  </Badge>
                ) : activeProposal.status === 'DRAFT' ? (
                  <Button
                    size="sm"
                    onClick={() => handleSendEstimate(activeProposal.id)}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs h-8"
                  >
                    <Send className="w-3.5 h-3.5 mr-1" />
                    Send to Customer
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => handleSimulateSign(activeProposal.id)}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs h-8"
                  >
                    <Check className="w-3.5 h-3.5 mr-1" />
                    Mark Accepted (Sign)
                  </Button>
                )}
              </div>
            </div>

            {/* Quote Type Toggle: Standard Quote (Default) vs Multi-Tier Options */}
            {activeProposal.hasTiers && activeProposal.tiers && activeProposal.tiers.length > 0 && (
              <div className="flex items-center justify-between bg-surface border border-border rounded-lg p-1 text-xs">
                <button
                  onClick={() => setActiveModalTab('STANDARD')}
                  className={`flex-1 py-1.5 px-3 rounded-md font-medium transition-colors ${
                    activeModalTab === 'STANDARD'
                      ? 'bg-primary text-primary-foreground shadow-sm font-semibold'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Standard Flat Quote (${activeProposal.amount.toLocaleString()})
                </button>
                <button
                  onClick={() => setActiveModalTab('TIERS')}
                  className={`flex-1 py-1.5 px-3 rounded-md font-medium transition-colors ${
                    activeModalTab === 'TIERS'
                      ? 'bg-primary text-primary-foreground shadow-sm font-semibold'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  3-Tier Options (Good / Better / Best)
                </button>
              </div>
            )}

            {/* TAB 1: STANDARD FLAT QUOTE (Simple, Real-World contractor quote) */}
            {(!activeProposal.hasTiers || activeModalTab === 'STANDARD') && (
              <div className="space-y-4">
                {/* Customer & Rep Meta Box */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-background/60 border border-border/80 rounded-xl p-3 text-xs">
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase font-mono">Customer</span>
                    <div className="font-semibold text-foreground mt-0.5">{activeProposal.customerName}</div>
                    <div className="text-muted-foreground">{activeProposal.customerPhone}</div>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase font-mono">Service Trade</span>
                    <div className="font-semibold text-foreground mt-0.5">{activeProposal.tradeType}</div>
                    <div className="text-muted-foreground">Standard Job</div>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase font-mono">Assigned Rep</span>
                    <div className="font-semibold text-foreground mt-0.5">{activeProposal.repName}</div>
                    <div className="text-muted-foreground">Field Tech</div>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase font-mono">Estimate Status</span>
                    <div className="font-semibold text-foreground mt-0.5">{activeProposal.status}</div>
                    <div className="text-muted-foreground">{activeProposal.expiryText}</div>
                  </div>
                </div>

                {/* Scope of Work / Line Items */}
                <div className="border border-border/80 rounded-xl p-4 bg-surface/50">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-primary" />
                    Scope of Work & Deliverables
                  </h4>
                  <ul className="space-y-2 text-xs text-foreground">
                    {(activeProposal.scopeItems || [
                      'Complete inspection, diagnosis, and removal of worn components',
                      'Supply and professional installation of approved hardware & fittings',
                      'Code compliance verification and safety leak/pressure testing',
                      'Manufacturer warranty registration and clean site guarantee',
                    ]).map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Total Price Card */}
                <div className="border border-border/80 rounded-xl p-4 bg-surface/90 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Total Estimated Investment
                    </span>
                    <div className="text-3xl font-extrabold text-foreground mt-1">
                      ${activeProposal.amount.toLocaleString()}
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Includes all labor, equipment, permits, and warranty coverage.
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20">
                      Standard Flat Rate
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: OPTIONAL TIERED GOOD / BETTER / BEST BREAKDOWN (Only when requested) */}
            {activeProposal.hasTiers && activeModalTab === 'TIERS' && activeProposal.tiers && (
              <div className="space-y-4">
                <div className="text-xs text-muted-foreground">
                  Optional multi-tier equipment comparisons allow customers to select between standard, high-efficiency, and premium systems.
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {activeProposal.tiers.map((tier, idx) => {
                    const isSelected = idx === selectedTierInPreview;
                    return (
                      <div
                        key={tier.name}
                        onClick={() => setSelectedTierInPreview(idx)}
                        className={`relative rounded-xl border p-4 cursor-pointer transition-all flex flex-col justify-between ${
                          isSelected
                            ? 'border-primary bg-primary/5 ring-1 ring-primary shadow-md'
                            : 'border-border/80 bg-surface/50 hover:border-border'
                        }`}
                      >
                        {tier.isRecommended && (
                          <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground font-bold uppercase tracking-wider text-[9px] px-2.5 py-0.5 rounded-full shadow-sm">
                            Most Popular
                          </div>
                        )}

                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-extrabold uppercase font-mono text-muted-foreground">
                              {tier.name} Tier
                            </span>
                            {isSelected && <Check className="w-4 h-4 text-primary" />}
                          </div>

                          <div className="mt-2 text-2xl font-black text-foreground">
                            ${tier.price.toLocaleString()}
                          </div>
                          {tier.monthlyEstimate && (
                            <div className="text-xs text-emerald-400 font-mono font-medium">
                              ~${tier.monthlyEstimate}/mo financed
                            </div>
                          )}

                          <p className="mt-2 text-xs font-semibold text-foreground/90 line-clamp-2">{tier.label}</p>

                          {tier.warrantyYears && (
                            <div className="mt-2 text-[10px] text-muted-foreground font-mono bg-background/60 p-1.5 rounded">
                              🛡️ {tier.warrantyYears}
                            </div>
                          )}

                          <ul className="mt-3 space-y-1.5 text-xs text-muted-foreground">
                            {tier.features.map((f, i) => (
                              <li key={i} className="flex items-start gap-1.5 text-[11px]">
                                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                                <span>{f}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="mt-4 pt-3 border-t border-border/50">
                          <Button
                            size="sm"
                            variant={isSelected ? 'primary' : 'outline'}
                            className="w-full text-xs h-7"
                          >
                            {isSelected ? 'Active Selection' : `Select ${tier.name}`}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Autonomous Follow-up Timeline */}
            <div className="border border-border/80 rounded-xl p-4 bg-surface/50">
              <div className="flex items-center justify-between text-xs font-semibold text-foreground mb-3">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  Elijah Autonomous Follow-Up Schedule
                </span>
                <span className="text-muted-foreground font-mono text-[11px]">
                  Recipe: Unsold Estimate Cadence
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
                <div className="p-2.5 rounded bg-background/80 border border-border/60">
                  <div className="text-[10px] font-mono text-emerald-400 font-semibold">DAY 0 — SENT</div>
                  <div className="text-muted-foreground mt-0.5 text-[11px]">Proposal SMS & Email with e-sign link</div>
                </div>
                <div className="p-2.5 rounded bg-background/80 border border-border/60">
                  <div className="text-[10px] font-mono text-primary font-semibold">DAY 2 — SMS CHECK</div>
                  <div className="text-muted-foreground mt-0.5 text-[11px]">&quot;Any questions about {activeProposal.tradeType}?&quot;</div>
                </div>
                <div className="p-2.5 rounded bg-background/80 border border-border/60">
                  <div className="text-[10px] font-mono text-muted-foreground font-semibold">DAY 5 — CALL TASK</div>
                  <div className="text-muted-foreground mt-0.5 text-[11px]">Assigned to {activeProposal.repName}</div>
                </div>
                <div className="p-2.5 rounded bg-background/80 border border-border/60">
                  <div className="text-[10px] font-mono text-muted-foreground font-semibold">DAY 7 — RECAP</div>
                  <div className="text-muted-foreground mt-0.5 text-[11px]">Final reminder & financing recap</div>
                </div>
              </div>
            </div>

            {/* Drawer Actions */}
            <div className="flex items-center justify-between pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(
                    `https://app.elijah.ai/estimate/${activeProposal.estimateNumber}?token=demo`
                  );
                  setToastMessage('Public proposal link copied to clipboard!');
                  setTimeout(() => setToastMessage(null), 3000);
                }}
                className="text-xs"
              >
                <Share2 className="w-3.5 h-3.5 mr-1" />
                Copy Public Link
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleSendReminder(activeProposal)}
                  disabled={isSendingSms}
                  className="text-xs"
                >
                  <Send className="w-3.5 h-3.5 mr-1 text-primary" />
                  {isSendingSms ? 'Sending...' : 'Send SMS Reminder'}
                </Button>
                <Button size="sm" onClick={() => setActiveProposal(null)} className="text-xs">
                  Close
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* ======================== CLEAN & SIMPLE CREATE ESTIMATE MODAL ======================== */}
      {isCreateOpen && (
        <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Create New Estimate">
          <form onSubmit={handleCreateSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-foreground">Customer Name</label>
              <input
                type="text"
                required
                value={newCustName}
                onChange={(e) => setNewCustName(e.target.value)}
                placeholder="e.g. Robert Vance"
                className="w-full mt-1 bg-surface border border-border rounded-lg p-2.5 text-xs text-foreground focus:ring-1 focus:ring-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground">Customer Phone (for SMS E-Sign)</label>
              <input
                type="text"
                value={newCustPhone}
                onChange={(e) => setNewCustPhone(e.target.value)}
                placeholder="e.g. (480) 555-0199"
                className="w-full mt-1 bg-surface border border-border rounded-lg p-2.5 text-xs text-foreground focus:ring-1 focus:ring-primary focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-foreground">Trade Category</label>
                <select
                  value={newTrade}
                  onChange={(e) => setNewTrade(e.target.value as any)}
                  className="w-full mt-1 bg-surface border border-border rounded-lg p-2.5 text-xs text-foreground focus:ring-1 focus:ring-primary focus:outline-none"
                >
                  <option value="HVAC">HVAC</option>
                  <option value="ELECTRICAL">Electrical</option>
                  <option value="PLUMBING">Plumbing</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground">Total Estimate Amount ($)</label>
                <input
                  type="number"
                  required
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value)}
                  placeholder="e.g. 2450"
                  className="w-full mt-1 bg-surface border border-border rounded-lg p-2.5 text-xs text-foreground focus:ring-1 focus:ring-primary focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground">Service Title / Scope of Work</label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. 50-Gallon Gas Water Heater Replacement"
                className="w-full mt-1 bg-surface border border-border rounded-lg p-2.5 text-xs text-foreground focus:ring-1 focus:ring-primary focus:outline-none"
              />
            </div>

            {/* Optional Tier Toggle */}
            <div className="pt-1 flex items-center justify-between border-t border-border/60">
              <div>
                <div className="text-xs font-medium text-foreground">Multi-Tier Comparison (Optional)</div>
                <div className="text-[11px] text-muted-foreground">
                  Include Good, Better, Best options (for equipment replacement quotes)
                </div>
              </div>
              <input
                type="checkbox"
                checked={enableTiers}
                onChange={(e) => setEnableTiers(e.target.checked)}
                className="w-4 h-4 rounded text-primary focus:ring-primary border-border bg-surface"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2 border-t border-border/60">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-primary text-primary-foreground font-semibold">
                Draft Estimate
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
