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
  LayoutList,
  LayoutGrid,
  Bot,
  User,
  ArrowUpRight,
  PhoneCall,
  Calendar,
  Filter,
} from 'lucide-react';

export type ProposalStatus = 'ALL' | 'DRAFT' | 'SENT' | 'VIEWED' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED';

export interface TierOption {
  name: string; // "Good" | "Better" | "Best"
  label: string;
  price: number;
  monthlyEstimate: number; // e.g. $89/mo
  warrantyYears: string;
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
  selectedTierIndex: number;
  grossMarginPct: number;
  sentDateText: string;
  expiryText: string;
  tiers: [TierOption, TierOption, TierOption];
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
        features: ['Two-stage compressor for 28% lower electric bills', 'Variable speed blower motor for quiet comfort', 'Smart Wi-Fi Ecobee thermostat included'],
      },
      {
        name: 'Best',
        label: 'Carrier Infinity 18 SEER2 Variable-Speed Inverter',
        price: 14500,
        monthlyEstimate: 168,
        warrantyYears: '10-Yr Parts · 5-Yr Labor',
        features: ['Ultra-efficient inverter (modulates from 25% to 100%)', 'Whisper-quiet operation as low as 58 dBA', 'Infinity Smart Control with humidity management'],
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
    tiers: [
      {
        name: 'Good',
        label: '100A Dedicated Subpanel Installation',
        price: 1650,
        monthlyEstimate: 32,
        warrantyYears: '5-Yr Workmanship',
        features: ['Square D QO 100A 12-space panel', 'Surface mount conduit run to workshop', 'Full AFCI/GFCI protection'],
      },
      {
        name: 'Better',
        label: '125A High-Capacity Subpanel with Surge Protector',
        price: 2450,
        monthlyEstimate: 45,
        warrantyYears: '10-Yr Workmanship',
        isRecommended: true,
        features: ['125A 24-space panel capacity', 'Whole-home Type 2 surge arrester', 'Two 240V 50A welder/tool outlets'],
      },
      {
        name: 'Best',
        label: '200A Smart Load Center & EV Pre-wire',
        price: 3800,
        monthlyEstimate: 65,
        warrantyYears: 'Lifetime Panel · 10-Yr Labor',
        features: ['Smart monitoring breakers with app energy tracking', 'EV Level 2 60A circuit pre-installed', 'Generator interlock bracket included'],
      },
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
        features: ['ComfortFlow recirc pump for instant hot water', 'High capacity 11.2 GPM (supports 4 showers simultaneously)', 'NaviLink Wi-Fi phone monitoring'],
      },
      {
        name: 'Best',
        label: 'Navien NPE-240A2 + Whole-House Scale Prevention System',
        price: 6400,
        monthlyEstimate: 85,
        warrantyYears: 'Lifetime Scale Guard · 15-Yr Exchanger',
        features: ['Includes PeakFlow anti-scale cartridge system', 'Protects plumbing against harsh desert calcium buildup', 'Full bypass isolation valves included'],
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
    tiers: [
      {
        name: 'Good',
        label: 'Lennox Merit 14.5 SEER2',
        price: 11200,
        monthlyEstimate: 125,
        warrantyYears: '10-Yr Compressor',
        features: ['Single-stage scroll', 'Direct-drive blower'],
      },
      {
        name: 'Better',
        label: 'Lennox Elite 16 SEER2 High Efficiency',
        price: 14895,
        monthlyEstimate: 155,
        warrantyYears: '10-Yr Parts & Labor',
        isRecommended: true,
        features: ['Two-stage compressor', 'QuietZone sound dampening'],
      },
      {
        name: 'Best',
        label: 'Lennox Signature Ultimate Inverter',
        price: 17500,
        monthlyEstimate: 195,
        warrantyYears: '12-Yr Complete Unit Replacement',
        features: ['Variable capacity 20+ SEER2', 'S40 Smart Thermostat with air quality monitoring'],
      },
    ],
  },
  {
    id: 'est-2421',
    estimateNumber: 'EST-2421',
    customerName: 'Deborah Cruz',
    customerPhone: '(602) 555-4499',
    serviceAddress: '2411 W Glendale Ave, Phoenix, AZ 85021',
    tradeType: 'ELECTRICAL',
    title: 'Electrical upgrade',
    amount: 2100,
    status: 'EXPIRED',
    repName: 'Marco Diaz',
    createdDateText: 'Wed, Oct 7',
    selectedTierIndex: 0,
    grossMarginPct: 40.0,
    sentDateText: 'Sent Sep 23 (30 days expired)',
    expiryText: 'Expired',
    tiers: [
      {
        name: 'Good',
        label: 'Meter Socket & Mast Replacement',
        price: 2100,
        monthlyEstimate: 35,
        warrantyYears: '5-Yr Workmanship',
        features: ['Overhead service mast riser', 'Utility seal coordination'],
      },
      {
        name: 'Better',
        label: 'Heavy-Duty Meter Combo with Main Disconnect',
        price: 3200,
        monthlyEstimate: 50,
        warrantyYears: '10-Yr Workmanship',
        features: ['200A exterior disconnect switch', 'Surge protector built-in'],
      },
      {
        name: 'Best',
        label: 'Whole Home Underground Conversion & Panel',
        price: 5400,
        monthlyEstimate: 75,
        warrantyYears: 'Lifetime Panel',
        features: ['Underground utility trenching', 'Full copper bus panel'],
      },
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
    tiers: [
      {
        name: 'Good',
        label: 'Carrier Base 14 SEER2',
        price: 10500,
        monthlyEstimate: 120,
        warrantyYears: '10-Yr Parts',
        features: ['Single-stage package unit'],
      },
      {
        name: 'Better',
        label: 'Carrier Performance 16 SEER2',
        price: 14895,
        monthlyEstimate: 155,
        warrantyYears: '10-Yr Parts & 2-Yr Labor',
        features: ['Dual stage quiet package'],
      },
      {
        name: 'Best',
        label: 'Carrier Infinity Variable',
        price: 17200,
        monthlyEstimate: 190,
        warrantyYears: '10-Yr Complete Replacement',
        features: ['Inverter technology'],
      },
    ],
  },
  {
    id: 'est-2460',
    estimateNumber: 'EST-2460',
    customerName: 'Scottsdale Bistro',
    customerPhone: '(480) 555-3344',
    serviceAddress: '7114 E Stetson Dr, Scottsdale, AZ 85251',
    tradeType: 'PLUMBING',
    title: 'Water heater replacement',
    amount: 2450,
    status: 'ACCEPTED',
    repName: 'Jessica Thompson',
    createdDateText: 'Mon, Oct 5',
    selectedTierIndex: 0,
    grossMarginPct: 44.0,
    sentDateText: 'Accepted Oct 5',
    expiryText: 'Accepted',
    tiers: [
      {
        name: 'Good',
        label: 'Commercial 50-Gal Gas High Recovery',
        price: 2450,
        monthlyEstimate: 40,
        warrantyYears: '6-Yr Tank · 1-Yr Labor',
        features: ['Heavy-duty commercial anode rod', 'Brass drain valve'],
      },
      {
        name: 'Better',
        label: 'Commercial 75-Gal High Recovery Unit',
        price: 3600,
        monthlyEstimate: 55,
        warrantyYears: '10-Yr Tank · 2-Yr Labor',
        features: ['Dual anodes', 'Electronic ignition'],
      },
      {
        name: 'Best',
        label: 'Commercial Dual On-Demand Tankless Array',
        price: 5800,
        monthlyEstimate: 80,
        warrantyYears: '15-Yr Heat Exchanger',
        features: ['Manifolded twin units for redundancy in restaurant'],
      },
    ],
  },
  {
    id: 'est-2443',
    estimateNumber: 'EST-2443',
    customerName: 'Eric Taylor',
    customerPhone: '(602) 555-7711',
    serviceAddress: '1420 W Bethany Home Rd, Phoenix, AZ 85013',
    tradeType: 'ELECTRICAL',
    title: 'Electrical upgrade',
    amount: 1650,
    status: 'ACCEPTED',
    repName: 'Daniel Reed',
    createdDateText: 'Thu, Oct 1',
    selectedTierIndex: 0,
    grossMarginPct: 43.0,
    sentDateText: 'Accepted Oct 1',
    expiryText: 'Accepted',
    tiers: [
      {
        name: 'Good',
        label: '100A Panel Replacement',
        price: 1650,
        monthlyEstimate: 30,
        warrantyYears: '10-Yr Panel',
        features: ['Standard panel replace'],
      },
      {
        name: 'Better',
        label: '200A Panel Upgrade',
        price: 2800,
        monthlyEstimate: 45,
        warrantyYears: 'Lifetime Panel',
        features: ['Copper bus upgrade'],
      },
      {
        name: 'Best',
        label: '200A Panel + Generator Interlock',
        price: 3900,
        monthlyEstimate: 60,
        warrantyYears: 'Lifetime Panel',
        features: ['Backup ready'],
      },
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
    tiers: [
      {
        name: 'Good',
        label: '50-Gal Electric Standard',
        price: 3200,
        monthlyEstimate: 45,
        warrantyYears: '6-Yr Tank',
        features: ['Standard electric replacement'],
      },
      {
        name: 'Better',
        label: 'Hybrid Heat Pump Water Heater 50-Gal',
        price: 4600,
        monthlyEstimate: 65,
        warrantyYears: '10-Yr Tank',
        features: ['Saves up to $330/yr in electricity'],
      },
      {
        name: 'Best',
        label: 'Hybrid Heat Pump Water Heater 65-Gal + Leak Detection',
        price: 5400,
        monthlyEstimate: 75,
        warrantyYears: '10-Yr Complete Replacement',
        features: ['Automatic water shutoff valve'],
      },
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
    tiers: [
      {
        name: 'Good',
        label: '50-Gal Standard Atmospheric Gas',
        price: 3200,
        monthlyEstimate: 45,
        warrantyYears: '6-Yr Tank',
        features: ['Bradford White defender safety system'],
      },
      {
        name: 'Better',
        label: '50-Gal Power Vent Energy Star Gas',
        price: 4300,
        monthlyEstimate: 60,
        warrantyYears: '10-Yr Tank',
        features: ['Quiet side-wall power blower'],
      },
      {
        name: 'Best',
        label: 'Tankless Condensing Ultra-Low NOx',
        price: 5800,
        monthlyEstimate: 80,
        warrantyYears: '15-Yr Heat Exchanger',
        features: ['Continuous hot water'],
      },
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
    tiers: [
      {
        name: 'Good',
        label: 'Trane 4-Ton 14 SEER2',
        price: 13500,
        monthlyEstimate: 145,
        warrantyYears: '10-Yr Parts',
        features: ['Single-stage'],
      },
      {
        name: 'Better',
        label: 'Trane 4-Ton 16 SEER2',
        price: 16500,
        monthlyEstimate: 180,
        warrantyYears: '10-Yr Parts & Labor',
        features: ['Two-stage'],
      },
      {
        name: 'Best',
        label: 'Trane 4-Ton Variable Speed Inverter Dual Fuel',
        price: 19750,
        monthlyEstimate: 215,
        warrantyYears: '12-Yr Unit Replacement',
        features: ['Gas furnace + variable heat pump combo'],
      },
    ],
  },
  {
    id: 'est-2409',
    estimateNumber: 'EST-2409',
    customerName: 'Canyon Ridge Offices',
    customerPhone: '(602) 555-9000',
    serviceAddress: '9200 N 7th Ave, Phoenix, AZ 85021',
    tradeType: 'ELECTRICAL',
    title: 'Electrical upgrade',
    amount: 2100,
    status: 'ACCEPTED',
    repName: 'Tara Quinn',
    createdDateText: 'Sun, Sep 27',
    selectedTierIndex: 0,
    grossMarginPct: 42.0,
    sentDateText: 'Accepted Sep 27',
    expiryText: 'Accepted',
    tiers: [
      {
        name: 'Good',
        label: 'Commercial LED Retrofit & Breakers',
        price: 2100,
        monthlyEstimate: 35,
        warrantyYears: '5-Yr Fixtures',
        features: ['DLC certified panels'],
      },
      {
        name: 'Better',
        label: 'LED Retrofit + Daylight Harvesting Sensors',
        price: 3400,
        monthlyEstimate: 50,
        warrantyYears: '7-Yr Fixtures',
        features: ['Automated dimming'],
      },
      {
        name: 'Best',
        label: 'Smart Networked Commercial Lighting System',
        price: 5200,
        monthlyEstimate: 75,
        warrantyYears: '10-Yr System',
        features: ['App schedule management'],
      },
    ],
  },
  {
    id: 'est-2402',
    estimateNumber: 'EST-2402',
    customerName: 'Susan Lewis',
    customerPhone: '(480) 555-5511',
    serviceAddress: '6801 E Thomas Rd, Scottsdale, AZ 85251',
    tradeType: 'PLUMBING',
    title: 'Water heater replacement',
    amount: 4900,
    status: 'ACCEPTED',
    repName: 'Daniel Reed',
    createdDateText: 'Wed, Sep 23',
    selectedTierIndex: 1,
    grossMarginPct: 41.0,
    sentDateText: 'Accepted Sep 23',
    expiryText: 'Accepted',
    tiers: [
      {
        name: 'Good',
        label: 'Standard Tankless NPE-180A2',
        price: 3800,
        monthlyEstimate: 55,
        warrantyYears: '15-Yr Exchanger',
        features: ['8.4 GPM'],
      },
      {
        name: 'Better',
        label: 'Recirculating Tankless NPE-240A2',
        price: 4900,
        monthlyEstimate: 68,
        warrantyYears: '15-Yr Exchanger & 3-Yr Labor',
        features: ['Built-in pump'],
      },
      {
        name: 'Best',
        label: 'NPE-240A2 + Whole Home Water Conditioning',
        price: 6800,
        monthlyEstimate: 90,
        warrantyYears: 'Lifetime Anti-scale',
        features: ['Descaler included'],
      },
    ],
  },
];

export default function EstimatesPage() {
  const [proposals, setProposals] = useState<Proposal[]>(INITIAL_PROPOSALS);
  const [statusFilter, setStatusFilter] = useState<ProposalStatus>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'TABLE' | 'CARDS'>('TABLE');

  // Preview / Slide-over Drawer
  const [activeProposal, setActiveProposal] = useState<Proposal | null>(null);
  const [selectedTierInPreview, setSelectedTierInPreview] = useState<number>(1);
  const [isSendingSms, setIsSendingSms] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New Estimate Creation Modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newTrade, setNewTrade] = useState<'HVAC' | 'ELECTRICAL' | 'PLUMBING'>('HVAC');
  const [newTitle, setNewTitle] = useState('');
  const [newAmount, setNewAmount] = useState('11500');

  // Counts for Filter Badges matching demo screen
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

  // Calculate Open Pipeline value (Draft + Sent + Viewed)
  const openPipelineValue = proposals
    .filter((p) => p.status === 'DRAFT' || p.status === 'SENT' || p.status === 'VIEWED')
    .reduce((sum, p) => sum + p.amount, 0);

  // Quick SMS Follow-Up Trigger
  const handleSendReminder = (p: Proposal) => {
    setIsSendingSms(true);
    setTimeout(() => {
      setIsSendingSms(false);
      setToastMessage(`Automated proposal reminder link sent to ${p.customerName} (${p.customerPhone})`);
      setTimeout(() => setToastMessage(null), 4000);
    }, 450);
  };

  // Simulate Digital Customer Acceptance
  const handleSimulateSign = (proposalId: string) => {
    setProposals((prev) =>
      prev.map((p) => (p.id === proposalId ? { ...p, status: 'ACCEPTED', sentDateText: 'Digitally signed just now' } : p))
    );
    if (activeProposal && activeProposal.id === proposalId) {
      setActiveProposal((prev) => (prev ? { ...prev, status: 'ACCEPTED', sentDateText: 'Digitally signed just now' } : null));
    }
    setToastMessage('🎉 Customer signature simulated! Proposal accepted and official project created.');
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Handle Create New Estimate
  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName || !newTitle) return;

    const parsedAmount = parseFloat(newAmount) || 9500;
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
      selectedTierIndex: 1,
      grossMarginPct: 40.0,
      sentDateText: 'Drafted just now',
      expiryText: 'Valid for 14 days',
      tiers: [
        {
          name: 'Good',
          label: `${newTitle} — Standard`,
          price: Math.round(parsedAmount * 0.8),
          monthlyEstimate: Math.round((parsedAmount * 0.8) / 96),
          warrantyYears: '5-Yr Warranty',
          features: ['Standard system replacement', 'Code compliance & permit filing'],
        },
        {
          name: 'Better',
          label: `${newTitle} — High Efficiency`,
          price: parsedAmount,
          monthlyEstimate: Math.round(parsedAmount / 96),
          warrantyYears: '10-Yr Warranty',
          isRecommended: true,
          features: ['High-efficiency model', 'Smart thermostat/controller included', 'Extended labor warranty'],
        },
        {
          name: 'Best',
          label: `${newTitle} — Premium Ultimate`,
          price: Math.round(parsedAmount * 1.25),
          monthlyEstimate: Math.round((parsedAmount * 1.25) / 96),
          warrantyYears: 'Lifetime / 12-Yr Warranty',
          features: ['Top-of-the-line inverter/efficiency', 'Whisper-quiet acoustic rating', 'Full 5-year labor guarantee'],
        },
      ],
    };

    setProposals([newProposal, ...proposals]);
    setIsCreateOpen(false);
    setNewCustName('');
    setNewCustPhone('');
    setNewTitle('');
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

      {/* Header matching demo screen */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Estimates</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">${openPipelineValue.toLocaleString()} open pipeline</span>.
            Estimates live in your field service software; Elijah tracks views and follows up.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex items-center bg-surface border border-border rounded-lg p-0.5">
            <button
              onClick={() => setViewMode('TABLE')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                viewMode === 'TABLE' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <LayoutList className="w-3.5 h-3.5" />
              Pipeline Table
            </button>
            <button
              onClick={() => setViewMode('CARDS')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                viewMode === 'CARDS' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              Tiered Cards
            </button>
          </div>

          <Button
            onClick={() => setIsCreateOpen(true)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-4 py-2 rounded-lg text-sm shadow-sm flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New estimate
          </Button>
        </div>
      </div>

      {/* Filter Tabs matching demo UI pill bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 rounded-full font-medium transition-colors whitespace-nowrap ${
              statusFilter === 'ALL'
                ? 'bg-[#0f172a] text-white dark:bg-white dark:text-[#0f172a]'
                : 'bg-surface hover:bg-surface-hover text-muted-foreground hover:text-foreground border border-border/60'
            }`}
          >
            All <span className="opacity-75 ml-1">{countAll}</span>
          </button>

          <button
            onClick={() => setStatusFilter('DRAFT')}
            className={`px-3 py-1.5 rounded-full font-medium transition-colors whitespace-nowrap ${
              statusFilter === 'DRAFT'
                ? 'bg-[#0f172a] text-white dark:bg-white dark:text-[#0f172a]'
                : 'bg-surface hover:bg-surface-hover text-muted-foreground hover:text-foreground border border-border/60'
            }`}
          >
            Draft <span className="opacity-75 ml-1">{countDraft}</span>
          </button>

          <button
            onClick={() => setStatusFilter('SENT')}
            className={`px-3 py-1.5 rounded-full font-medium transition-colors whitespace-nowrap ${
              statusFilter === 'SENT'
                ? 'bg-[#0f172a] text-white dark:bg-white dark:text-[#0f172a]'
                : 'bg-surface hover:bg-surface-hover text-muted-foreground hover:text-foreground border border-border/60'
            }`}
          >
            Sent <span className="opacity-75 ml-1">{countSent}</span>
          </button>

          <button
            onClick={() => setStatusFilter('VIEWED')}
            className={`px-3 py-1.5 rounded-full font-medium transition-colors whitespace-nowrap ${
              statusFilter === 'VIEWED'
                ? 'bg-[#0f172a] text-white dark:bg-white dark:text-[#0f172a]'
                : 'bg-surface hover:bg-surface-hover text-muted-foreground hover:text-foreground border border-border/60'
            }`}
          >
            Viewed <span className="opacity-75 ml-1">{countViewed}</span>
          </button>

          <button
            onClick={() => setStatusFilter('ACCEPTED')}
            className={`px-3 py-1.5 rounded-full font-medium transition-colors whitespace-nowrap ${
              statusFilter === 'ACCEPTED'
                ? 'bg-[#0f172a] text-white dark:bg-white dark:text-[#0f172a]'
                : 'bg-surface hover:bg-surface-hover text-muted-foreground hover:text-foreground border border-border/60'
            }`}
          >
            Accepted <span className="opacity-75 ml-1">{countAccepted}</span>
          </button>

          <button
            onClick={() => setStatusFilter('DECLINED')}
            className={`px-3 py-1.5 rounded-full font-medium transition-colors whitespace-nowrap ${
              statusFilter === 'DECLINED'
                ? 'bg-[#0f172a] text-white dark:bg-white dark:text-[#0f172a]'
                : 'bg-surface hover:bg-surface-hover text-muted-foreground hover:text-foreground border border-border/60'
            }`}
          >
            Declined <span className="opacity-75 ml-1">{countDeclined}</span>
          </button>

          <button
            onClick={() => setStatusFilter('EXPIRED')}
            className={`px-3 py-1.5 rounded-full font-medium transition-colors whitespace-nowrap ${
              statusFilter === 'EXPIRED'
                ? 'bg-[#0f172a] text-white dark:bg-white dark:text-[#0f172a]'
                : 'bg-surface hover:bg-surface-hover text-muted-foreground hover:text-foreground border border-border/60'
            }`}
          >
            Expired <span className="opacity-75 ml-1">{countExpired}</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search estimates or customers..."
            className="w-full bg-surface border border-border rounded-lg pl-9 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {/* Main Content Area */}
      {viewMode === 'TABLE' ? (
        /* ======================== 1. TABLE VIEW (Matching Demo Screenshot) ======================== */
        <div className="rounded-xl border border-border bg-surface/95 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-hover/80 text-muted-foreground font-semibold border-b border-border uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Estimate</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Title</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Rep</th>
                  <th className="py-3 px-4">Follow-up</th>
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
                    const isAwaitingOrSent = p.status === 'SENT' || p.status === 'VIEWED';
                    return (
                      <tr
                        key={p.id}
                        onClick={() => {
                          setActiveProposal(p);
                          setSelectedTierInPreview(p.selectedTierIndex);
                        }}
                        className="hover:bg-surface-hover/50 cursor-pointer transition-colors group"
                      >
                        {/* Estimate Number + Drafted by Elijah badge */}
                        <td className="py-3 px-4 font-mono font-medium text-foreground whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span>{p.estimateNumber}</span>
                            {p.isDraftedByElijah && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-sans font-semibold bg-indigo-950/80 text-indigo-300 border border-indigo-800/60 flex items-center gap-1">
                                <Bot className="w-3 h-3 text-indigo-400" />
                                Drafted by Elijah
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Customer Name */}
                        <td className="py-3 px-4 font-semibold text-foreground whitespace-nowrap">
                          {p.customerName}
                        </td>

                        {/* Title */}
                        <td className="py-3 px-4 text-muted-foreground max-w-[260px] truncate" title={p.title}>
                          {p.title}
                        </td>

                        {/* Amount */}
                        <td className="py-3 px-4 font-semibold text-foreground whitespace-nowrap">
                          ${p.amount.toLocaleString()}
                        </td>

                        {/* Status Pill */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          {p.status === 'ACCEPTED' && (
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              Accepted
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
                        <td className="py-3 px-4 text-muted-foreground whitespace-nowrap">
                          {p.repName}
                        </td>

                        {/* Follow-up Column matching demo screenshot */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          {p.followUpStatus?.isActive ? (
                            <div>
                              <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                                active
                              </span>
                              <div className="text-[10px] text-muted-foreground mt-0.5">
                                {p.followUpStatus.nextStep}
                              </div>
                            </div>
                          ) : (
                            <span className="text-muted-foreground/60">—</span>
                          )}
                        </td>

                        {/* Created Date */}
                        <td className="py-3 px-4 text-muted-foreground whitespace-nowrap">
                          {p.createdDateText}
                        </td>

                        {/* Action buttons */}
                        <td className="py-3 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1.5">
                            {isAwaitingOrSent && (
                              <button
                                onClick={() => handleSendReminder(p)}
                                title="Send follow-up SMS now"
                                className="p-1.5 rounded hover:bg-surface-hover text-primary transition-colors"
                              >
                                <Send className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button
                              onClick={() => {
                                setActiveProposal(p);
                                setSelectedTierInPreview(p.selectedTierIndex);
                              }}
                              className="px-2 py-1 rounded hover:bg-surface-hover text-muted-foreground hover:text-foreground text-[11px] font-medium flex items-center gap-1"
                            >
                              Details
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
      ) : (
        /* ======================== 2. TIERED CARDS VIEW (Good / Better / Best) ======================== */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProposals.map((p) => {
            const chosenTier = p.tiers[p.selectedTierIndex];
            return (
              <div
                key={p.id}
                className="rounded-2xl border border-border bg-surface/90 shadow-md flex flex-col p-6 space-y-4 hover:border-primary/50 transition-colors"
              >
                {/* Card Top */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-primary font-semibold">{p.estimateNumber}</span>
                      <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                        {p.tradeType}
                      </span>
                    </div>
                    <h3 className="font-bold text-foreground text-base mt-1">{p.customerName}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-1">{p.title}</p>
                  </div>

                  {p.status === 'ACCEPTED' ? (
                    <Badge variant="outline" className="text-emerald-400 border-emerald-500/30 text-[10px]">
                      Signed
                    </Badge>
                  ) : p.status === 'DRAFT' ? (
                    <Badge variant="outline" className="text-amber-400 border-amber-500/30 text-[10px]">
                      Draft
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-blue-400 border-blue-500/30 text-[10px]">
                      Awaiting Sign
                    </Badge>
                  )}
                </div>

                {/* Price Display */}
                <div className="bg-background/80 border border-border/80 rounded-xl p-3.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-muted-foreground uppercase font-mono">
                        Selected: {chosenTier.name} Tier
                      </span>
                      <div className="text-2xl font-black text-foreground mt-0.5">
                        ${chosenTier.price.toLocaleString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-semibold text-emerald-400">{p.grossMarginPct}% Margin</span>
                      <div className="text-[11px] text-muted-foreground font-mono">
                        ~${chosenTier.monthlyEstimate}/mo financed
                      </div>
                    </div>
                  </div>

                  {/* 3-Tier Mini Bar */}
                  <div className="grid grid-cols-3 gap-1.5 mt-3 pt-3 border-t border-border/60">
                    {p.tiers.map((t, idx) => (
                      <div
                        key={t.name}
                        className={`text-center py-1.5 px-1 rounded text-[10px] font-mono transition-all ${
                          idx === p.selectedTierIndex
                            ? 'bg-primary text-primary-foreground font-bold shadow-sm'
                            : 'bg-surface text-muted-foreground'
                        }`}
                      >
                        <div className="uppercase text-[9px]">{t.name}</div>
                        <div>${(t.price / 1000).toFixed(1)}k</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card Footer */}
                <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                  <span>{p.sentDateText}</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setActiveProposal(p);
                      setSelectedTierInPreview(p.selectedTierIndex);
                    }}
                    className="text-xs h-7 px-3"
                  >
                    View Details
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ======================== 3. DETAIL DRAWER / MODAL (Good / Better / Best) ======================== */}
      {activeProposal && (
        <Modal
          isOpen={!!activeProposal}
          onClose={() => setActiveProposal(null)}
          title={`Proposal ${activeProposal.estimateNumber} — ${activeProposal.customerName}`}
        >
          <div className="space-y-6 max-h-[80vh] overflow-y-auto pr-1">
            {/* Header Meta */}
            <div className="bg-surface/80 border border-border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-foreground">{activeProposal.title}</h3>
                  {activeProposal.isDraftedByElijah && (
                    <Badge variant="outline" className="text-indigo-400 border-indigo-500/30 text-[10px]">
                      Drafted by Elijah AI
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {activeProposal.serviceAddress} · {activeProposal.customerPhone}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {activeProposal.status === 'ACCEPTED' ? (
                  <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                    Accepted & Work Order Issued
                  </Badge>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => handleSimulateSign(activeProposal.id)}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs h-8"
                  >
                    <Check className="w-3.5 h-3.5 mr-1" />
                    Simulate Customer Sign
                  </Button>
                )}
              </div>
            </div>

            {/* 3-Tier Good / Better / Best Breakdown */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Choose or Recommend Tier (Good / Better / Best)
                </span>
                <span className="text-xs text-muted-foreground font-mono">
                  {activeProposal.grossMarginPct}% Target Gross Margin
                </span>
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
                            {tier.name}
                          </span>
                          {isSelected && <Check className="w-4 h-4 text-primary" />}
                        </div>

                        <div className="mt-2 text-xl font-black text-foreground">
                          ${tier.price.toLocaleString()}
                        </div>
                        <div className="text-xs text-emerald-400 font-mono font-medium">
                          or ${tier.monthlyEstimate}/mo financed
                        </div>

                        <p className="mt-2 text-xs font-semibold text-foreground/90 line-clamp-2">
                          {tier.label}
                        </p>

                        <div className="mt-2 text-[10px] text-muted-foreground font-mono bg-background/60 p-1.5 rounded">
                          🛡️ {tier.warrantyYears}
                        </div>

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
                          variant={isSelected ? 'default' : 'outline'}
                          className="w-full text-xs h-7"
                        >
                          {isSelected ? 'Selected Tier' : `Select ${tier.name}`}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Autonomous Follow-up Timeline */}
            <div className="border border-border/80 rounded-xl p-4 bg-surface/50">
              <div className="flex items-center justify-between text-xs font-semibold text-foreground mb-3">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  Elijah Autonomous Follow-Up Cadence
                </span>
                <span className="text-muted-foreground font-mono text-[11px]">
                  Recipe: Unsold estimate follow-up
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
                <div className="p-2.5 rounded bg-background/80 border border-border/60">
                  <div className="text-[10px] font-mono text-emerald-400 font-semibold">DAY 0 — SENT</div>
                  <div className="text-muted-foreground mt-0.5">Proposal SMS & Email with e-sign link</div>
                </div>
                <div className="p-2.5 rounded bg-background/80 border border-border/60">
                  <div className="text-[10px] font-mono text-primary font-semibold">DAY 2 — SMS CHECK</div>
                  <div className="text-muted-foreground mt-0.5">&quot;Any questions about {activeProposal.tradeType}?&quot;</div>
                </div>
                <div className="p-2.5 rounded bg-background/80 border border-border/60">
                  <div className="text-[10px] font-mono text-muted-foreground font-semibold">DAY 5 — CALL TASK</div>
                  <div className="text-muted-foreground mt-0.5">Assigned to {activeProposal.repName}</div>
                </div>
                <div className="p-2.5 rounded bg-background/80 border border-border/60">
                  <div className="text-[10px] font-mono text-muted-foreground font-semibold">DAY 7 — RECAP</div>
                  <div className="text-muted-foreground mt-0.5">Options & financing recap</div>
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
                    `https://desertair.com/estimate/${activeProposal.estimateNumber}?token=demo`
                  );
                  setToastMessage('Proposal link copied to clipboard!');
                  setTimeout(() => setToastMessage(null), 3000);
                }}
                className="text-xs"
              >
                <Share2 className="w-3.5 h-3.5 mr-1" />
                Copy Proposal Link
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
                  {isSendingSms ? 'Sending...' : 'Send SMS Follow-up Now'}
                </Button>
                <Button size="sm" onClick={() => setActiveProposal(null)} className="text-xs">
                  Close
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* ======================== 4. CREATE NEW ESTIMATE MODAL ======================== */}
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
              <label className="text-xs font-semibold text-foreground">Customer Phone (SMS E-sign)</label>
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
                <label className="text-xs font-semibold text-foreground">Base Amount ($)</label>
                <input
                  type="number"
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value)}
                  placeholder="e.g. 11500"
                  className="w-full mt-1 bg-surface border border-border rounded-lg p-2.5 text-xs text-foreground focus:ring-1 focus:ring-primary focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground">Estimate Title / Scope</label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. 5-Ton Heat Pump Replacement"
                className="w-full mt-1 bg-surface border border-border rounded-lg p-2.5 text-xs text-foreground focus:ring-1 focus:ring-primary focus:outline-none"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-primary text-primary-foreground">
                Draft Estimate
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
