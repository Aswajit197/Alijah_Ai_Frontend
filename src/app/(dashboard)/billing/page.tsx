'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Badge } from '@/components/ui/badge';
import {
  CreditCard,
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
  RefreshCw,
  Share2,
  Receipt,
  Download,
  PhoneCall,
  MessageSquare,
  FileText,
  Calendar,
  Layers,
  Building,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
} from 'lucide-react';

export type InvoiceStatus = 'PAID' | 'SENT' | 'OVERDUE' | 'PARTIAL' | 'DRAFT';

export interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  category: 'Labor' | 'Parts' | 'Diagnostic' | 'Permit';
}

export interface Invoice {
  id: string;
  invoiceNumber: string; // e.g. "INV-2026-1048"
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  serviceAddress: string;
  linkedJobNumber: string; // e.g. "JOB-1048"
  issueDate: string;
  dueDate: string;
  daysOverdue?: number;
  subtotal: number;
  tax: number;
  total: number;
  amountPaid: number;
  balanceDue: number;
  status: InvoiceStatus;
  tradeType: 'HVAC' | 'ELECTRICAL' | 'PLUMBING';
  paymentMethod?: string;
  paidAt?: string;
  lineItems: InvoiceLineItem[];
  quickbooksSyncStatus: 'SYNCED' | 'PENDING' | 'ERROR';
  dunningCadence: {
    smsReminderSent: boolean;
    overdueNoticeSent: boolean;
    aiPhoneCallScheduled: boolean;
  };
}

const INITIAL_INVOICES: Invoice[] = [
  {
    id: 'inv-1',
    invoiceNumber: 'INV-2026-1048',
    customerName: 'Marcus Webb',
    customerPhone: '(480) 555-0199',
    customerEmail: 'mwebb@webbholdings.com',
    serviceAddress: '4412 N 44th St, Phoenix, AZ 85018',
    linkedJobNumber: 'JOB-1048',
    issueDate: '2026-11-08',
    dueDate: '2026-11-15',
    daysOverdue: 8,
    subtotal: 1314.81,
    tax: 105.19,
    total: 1420.0,
    amountPaid: 0,
    balanceDue: 1420.0,
    status: 'OVERDUE',
    tradeType: 'HVAC',
    quickbooksSyncStatus: 'SYNCED',
    dunningCadence: {
      smsReminderSent: true,
      overdueNoticeSent: true,
      aiPhoneCallScheduled: true,
    },
    lineItems: [
      { id: 'li-1', description: 'Diagnostic Dispatch & Safety Inspection Fee', quantity: 1, unitPrice: 129.0, total: 129.0, category: 'Diagnostic' },
      { id: 'li-2', description: 'OEM 1/3 HP 825 RPM Condenser Fan Motor & Capacitor', quantity: 1, unitPrice: 685.81, total: 685.81, category: 'Parts' },
      { id: 'li-3', description: 'Labor - High-ambient outdoor coil evacuation and motor assembly', quantity: 2.5, unitPrice: 200.0, total: 500.0, category: 'Labor' },
    ],
  },
  {
    id: 'inv-2',
    invoiceNumber: 'INV-2026-1047',
    customerName: 'Nina Patel',
    customerPhone: '(602) 555-0812',
    customerEmail: 'nina.patel@azlawgroup.com',
    serviceAddress: '8814 E Mountain View Rd, Scottsdale, AZ 85258',
    linkedJobNumber: 'JOB-1047',
    issueDate: '2026-11-20',
    dueDate: '2026-11-27',
    subtotal: 351.85,
    tax: 28.15,
    total: 380.0,
    amountPaid: 0,
    balanceDue: 380.0,
    status: 'SENT',
    tradeType: 'ELECTRICAL',
    quickbooksSyncStatus: 'SYNCED',
    dunningCadence: {
      smsReminderSent: true,
      overdueNoticeSent: false,
      aiPhoneCallScheduled: false,
    },
    lineItems: [
      { id: 'li-4', description: 'Electrical Diagnostic Assessment', quantity: 1, unitPrice: 129.0, total: 129.0, category: 'Diagnostic' },
      { id: 'li-5', description: 'Siemens 20A Dual-Function AFCI/GFCI Breaker Replacement', quantity: 2, unitPrice: 85.0, total: 170.0, category: 'Parts' },
      { id: 'li-6', description: 'Panel neutral bar torque verification & terminal tune-up', quantity: 0.5, unitPrice: 105.7, total: 52.85, category: 'Labor' },
    ],
  },
  {
    id: 'inv-3',
    invoiceNumber: 'INV-2026-1046',
    customerName: 'Juan Ortiz',
    customerPhone: '(623) 555-0433',
    customerEmail: 'jortiz@mesawoodworking.com',
    serviceAddress: '2901 W Baseline Rd, Tempe, AZ 85283',
    linkedJobNumber: 'JOB-1046',
    issueDate: '2026-11-19',
    dueDate: '2026-12-04',
    subtotal: 597.22,
    tax: 47.78,
    total: 645.0,
    amountPaid: 0,
    balanceDue: 645.0,
    status: 'SENT',
    tradeType: 'PLUMBING',
    quickbooksSyncStatus: 'SYNCED',
    dunningCadence: {
      smsReminderSent: false,
      overdueNoticeSent: false,
      aiPhoneCallScheduled: false,
    },
    lineItems: [
      { id: 'li-7', description: 'Main sewer lateral digital camera inspection (with recorded video link)', quantity: 1, unitPrice: 220.0, total: 220.0, category: 'Diagnostic' },
      { id: 'li-8', description: 'High-pressure hydrojetting root cutting pass up to 100 ft', quantity: 1, unitPrice: 377.22, total: 377.22, category: 'Labor' },
    ],
  },
  {
    id: 'inv-4',
    invoiceNumber: 'INV-2026-1045',
    customerName: 'Linda Parker',
    customerPhone: '(480) 555-0371',
    customerEmail: 'linda.parker@paradisevalley.org',
    serviceAddress: '6201 N 64th Pl, Paradise Valley, AZ 85253',
    linkedJobNumber: 'JOB-1045',
    issueDate: '2026-11-14',
    dueDate: '2026-11-14',
    subtotal: 13425.93,
    tax: 1074.07,
    total: 14500.0,
    amountPaid: 14500.0,
    balanceDue: 0.0,
    status: 'PAID',
    tradeType: 'HVAC',
    paymentMethod: 'Credit Card (Stripe · Visa ending 8192)',
    paidAt: '2026-11-14 16:42',
    quickbooksSyncStatus: 'SYNCED',
    dunningCadence: {
      smsReminderSent: false,
      overdueNoticeSent: false,
      aiPhoneCallScheduled: false,
    },
    lineItems: [
      { id: 'li-9', description: 'Carrier Infinity 18 SEER2 Variable Speed Inverter Heat Pump', quantity: 1, unitPrice: 9800.0, total: 9800.0, category: 'Parts' },
      { id: 'li-10', description: 'Turnkey Mechanical Installation & Ductwork Plenums Transition', quantity: 1, unitPrice: 3200.0, total: 3200.0, category: 'Labor' },
      { id: 'li-11', description: 'Ecobee Smart Thermostat Premium + 2 Remote Room Sensors', quantity: 1, unitPrice: 425.93, total: 425.93, category: 'Parts' },
    ],
  },
  {
    id: 'inv-5',
    invoiceNumber: 'INV-2026-1044',
    customerName: 'Carl Jensen',
    customerPhone: '(480) 555-0144',
    customerEmail: 'cjensen@jensenarchitecture.com',
    serviceAddress: '1725 E Camelback Rd, Phoenix, AZ 85016',
    linkedJobNumber: 'JOB-1044',
    issueDate: '2026-11-18',
    dueDate: '2026-11-25',
    subtotal: 10416.67,
    tax: 833.33,
    total: 11250.0,
    amountPaid: 5625.0,
    balanceDue: 5625.0,
    status: 'PARTIAL',
    tradeType: 'HVAC',
    paymentMethod: 'ACH Bank Transfer ($5,625 deposit)',
    paidAt: '2026-11-18 11:15',
    quickbooksSyncStatus: 'SYNCED',
    dunningCadence: {
      smsReminderSent: true,
      overdueNoticeSent: false,
      aiPhoneCallScheduled: false,
    },
    lineItems: [
      { id: 'li-12', description: 'Carrier Performance 16 SEER2 Two-Stage System', quantity: 1, unitPrice: 7950.0, total: 7950.0, category: 'Parts' },
      { id: 'li-13', description: 'Mechanical Rigging, Crane Fee & Permit Filing', quantity: 1, unitPrice: 1250.0, total: 1250.0, category: 'Permit' },
      { id: 'li-14', description: 'Dual-circuit line set replacement and brazing with Nitrogen purge', quantity: 1, unitPrice: 1216.67, total: 1216.67, category: 'Labor' },
    ],
  },
  {
    id: 'inv-6',
    invoiceNumber: 'INV-2026-1043',
    customerName: 'Ellen Fischer',
    customerPhone: '(602) 555-0921',
    customerEmail: 'efischer@fischerrealty.com',
    serviceAddress: '312 E Coronado Rd, Phoenix, AZ 85004',
    linkedJobNumber: 'JOB-1043',
    issueDate: '2026-11-16',
    dueDate: '2026-11-16',
    subtotal: 824.07,
    tax: 65.93,
    total: 890.0,
    amountPaid: 890.0,
    balanceDue: 0.0,
    status: 'PAID',
    tradeType: 'ELECTRICAL',
    paymentMethod: 'Apple Pay (Mastercard ending 4401)',
    paidAt: '2026-11-16 14:05',
    quickbooksSyncStatus: 'SYNCED',
    dunningCadence: {
      smsReminderSent: false,
      overdueNoticeSent: false,
      aiPhoneCallScheduled: false,
    },
    lineItems: [
      { id: 'li-15', description: 'Level 2 EV Charger 50A Dedicated Branch Circuit (40ft run in EMT)', quantity: 1, unitPrice: 650.0, total: 650.0, category: 'Labor' },
      { id: 'li-16', description: 'Square D NEMA 14-50 Industrial Receptacle & Metallic In-Use Box', quantity: 1, unitPrice: 174.07, total: 174.07, category: 'Parts' },
    ],
  },
  {
    id: 'inv-7',
    invoiceNumber: 'INV-2026-1042',
    customerName: 'David Miller',
    customerPhone: '(602) 555-0188',
    customerEmail: 'dmiller@arizonacoldchains.com',
    serviceAddress: '5110 S 48th St, Tempe, AZ 85282',
    linkedJobNumber: 'JOB-1042',
    issueDate: '2026-10-15',
    dueDate: '2026-10-22',
    daysOverdue: 32,
    subtotal: 1990.74,
    tax: 159.26,
    total: 2150.0,
    amountPaid: 0,
    balanceDue: 2150.0,
    status: 'OVERDUE',
    tradeType: 'HVAC',
    quickbooksSyncStatus: 'SYNCED',
    dunningCadence: {
      smsReminderSent: true,
      overdueNoticeSent: true,
      aiPhoneCallScheduled: true,
    },
    lineItems: [
      { id: 'li-17', description: 'Commercial Walk-in Cooler R448A Leak Detection & Nitrogen Pressure Test', quantity: 1, unitPrice: 380.0, total: 380.0, category: 'Diagnostic' },
      { id: 'li-18', description: 'Copeland Scroll Compressor Contactor & Dual Pressure Switch Replacement', quantity: 1, unitPrice: 780.74, total: 780.74, category: 'Parts' },
      { id: 'li-19', description: 'Emergency Sunday After-Hours Mechanical Diagnostic Labor', quantity: 4, unitPrice: 207.5, total: 830.0, category: 'Labor' },
    ],
  },
  {
    id: 'inv-8',
    invoiceNumber: 'INV-2026-1041',
    customerName: 'Rachel Adams',
    customerPhone: '(480) 555-0912',
    customerEmail: 'rachel.adams@gmail.com',
    serviceAddress: '742 E Palo Verde Dr, Phoenix, AZ 85014',
    linkedJobNumber: 'JOB-1041',
    issueDate: '2026-11-21',
    dueDate: '2026-11-21',
    subtotal: 267.59,
    tax: 21.41,
    total: 289.0,
    amountPaid: 289.0,
    balanceDue: 0.0,
    status: 'PAID',
    tradeType: 'HVAC',
    paymentMethod: 'Debit Card (Visa ending 1190)',
    paidAt: '2026-11-21 09:30',
    quickbooksSyncStatus: 'SYNCED',
    dunningCadence: {
      smsReminderSent: false,
      overdueNoticeSent: false,
      aiPhoneCallScheduled: false,
    },
    lineItems: [
      { id: 'li-20', description: 'Comprehensive 26-Point Heating & Heat Pump Tune-Up', quantity: 1, unitPrice: 189.0, total: 189.0, category: 'Labor' },
      { id: 'li-21', description: 'MERV 13 High-Efficiency Electrostatic Pleated Filter Set (Pack of 2)', quantity: 1, unitPrice: 78.59, total: 78.59, category: 'Parts' },
    ],
  },
];

export default function BillingPage() {
  const [invoices, setInvoices] = useState<Invoice[]>(INITIAL_INVOICES);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [tradeFilter, setTradeFilter] = useState<string>('ALL');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isNewInvoiceOpen, setIsNewInvoiceOpen] = useState(false);
  const [isDunningConfigOpen, setIsDunningConfigOpen] = useState(false);
  const [isSyncingQBO, setIsSyncingQBO] = useState(false);
  const [syncSuccessToast, setSyncSuccessToast] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Filtered invoices
  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.linkedJobNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.customerPhone.includes(searchQuery);

    const matchesStatus =
      statusFilter === 'ALL'
        ? true
        : statusFilter === 'OVERDUE'
        ? inv.status === 'OVERDUE'
        : statusFilter === 'UNPAID'
        ? inv.status === 'SENT' || inv.status === 'PARTIAL' || inv.status === 'OVERDUE'
        : inv.status === statusFilter;

    const matchesTrade = tradeFilter === 'ALL' || inv.tradeType === tradeFilter;

    return matchesSearch && matchesStatus && matchesTrade;
  });

  // Financial aggregates
  const totalOutstanding = invoices.reduce((acc, inv) => acc + inv.balanceDue, 0);
  const current0To30 = invoices
    .filter((inv) => inv.status !== 'PAID' && (!inv.daysOverdue || inv.daysOverdue <= 0))
    .reduce((acc, inv) => acc + inv.balanceDue, 0);
  const overdue1To30 = invoices
    .filter((inv) => inv.status === 'OVERDUE' && inv.daysOverdue && inv.daysOverdue <= 30)
    .reduce((acc, inv) => acc + inv.balanceDue, 0);
  const overdue31Plus = invoices
    .filter((inv) => inv.status === 'OVERDUE' && inv.daysOverdue && inv.daysOverdue > 30)
    .reduce((acc, inv) => acc + inv.balanceDue, 0);
  const collectedThisMonth = invoices.reduce((acc, inv) => acc + inv.amountPaid, 0);
  const totalBilled = invoices.reduce((acc, inv) => acc + inv.total, 0);
  const collectionRate = Math.round((collectedThisMonth / totalBilled) * 100);

  // Trigger quick QuickBooks Sync
  const handleQuickBooksSync = () => {
    setIsSyncingQBO(true);
    setTimeout(() => {
      setIsSyncingQBO(false);
      setSyncSuccessToast(true);
      setTimeout(() => setSyncSuccessToast(false), 3500);
    }, 1200);
  };

  // Simulate Instant Payment Link Generation & Copy
  const handleCopyPaymentLink = (invoice: Invoice) => {
    const link = `https://pay.elijahai.io/invoice/${invoice.invoiceNumber.toLowerCase()}`;
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(link);
    }
    setActionNotice(`Stripe 1-Click Pay link copied for ${invoice.customerName}!`);
    setTimeout(() => setActionNotice(null), 3000);
  };

  // Simulate Sending SMS Dunning / Reminder
  const handleSendReminderSMS = (invoiceId: string) => {
    setInvoices((prev) =>
      prev.map((inv) => {
        if (inv.id === invoiceId) {
          return {
            ...inv,
            dunningCadence: {
              ...inv.dunningCadence,
              smsReminderSent: true,
            },
          };
        }
        return inv;
      })
    );
    const target = invoices.find((i) => i.id === invoiceId);
    setActionNotice(`SMS Payment Reminder sent to ${target?.customerName} (${target?.customerPhone})`);
    setTimeout(() => setActionNotice(null), 3500);
  };

  // Simulate Recording Paid in Full
  const handleMarkAsPaid = (invoiceId: string) => {
    setInvoices((prev) =>
      prev.map((inv) => {
        if (inv.id === invoiceId) {
          return {
            ...inv,
            status: 'PAID',
            amountPaid: inv.total,
            balanceDue: 0,
            paymentMethod: 'Manual Entry (Card On File / Check)',
            paidAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
            quickbooksSyncStatus: 'SYNCED',
          };
        }
        return inv;
      })
    );
    if (selectedInvoice && selectedInvoice.id === invoiceId) {
      setSelectedInvoice((prev) =>
        prev
          ? {
              ...prev,
              status: 'PAID',
              amountPaid: prev.total,
              balanceDue: 0,
              paymentMethod: 'Manual Entry (Card On File / Check)',
              paidAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
            }
          : null
      );
    }
    setActionNotice('Payment recorded! Invoice settled and marked as Paid in Full.');
    setTimeout(() => setActionNotice(null), 3000);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Action Notification Toast */}
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
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-white">Billing & Accounts Receivable</h1>
                <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 bg-emerald-500/10 text-xs">
                  Automated AR
                </Badge>
              </div>
              <p className="text-xs text-muted">
                One-click customer payment links, autonomous dunning follow-ups, and 2-way QuickBooks sync.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={handleQuickBooksSync}
            disabled={isSyncingQBO}
            className="border-border text-slate-300 hover:text-white hover:bg-surface-elevated text-xs h-9"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isSyncingQBO ? 'animate-spin text-emerald-400' : 'text-slate-400'}`} />
            {isSyncingQBO ? 'Syncing QBO...' : 'QuickBooks Sync'}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsDunningConfigOpen(true)}
            className="border-indigo-500/30 text-indigo-300 hover:bg-indigo-950/40 text-xs h-9"
          >
            <Sparkles className="w-3.5 h-3.5 mr-1.5 text-indigo-400" />
            Elijah AI Dunning
          </Button>

          <Button
            size="sm"
            onClick={() => setIsNewInvoiceOpen(true)}
            className="bg-primary hover:bg-primary-hover text-white text-xs h-9 shadow-md shadow-primary-glow/20"
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            New Invoice
          </Button>
        </div>
      </div>

      {/* QuickBooks Online Live Status Alert */}
      {syncSuccessToast && (
        <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              <strong>QuickBooks Online Live Sync Complete:</strong> 8 invoices and customer balances matched. 0 sync errors.
            </span>
          </div>
          <span className="text-[10px] text-emerald-400 font-mono font-semibold">Just Now</span>
        </div>
      )}

      {/* AR Aging Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        {/* Total Outstanding */}
        <div className="p-4 rounded-2xl bg-surface-card border border-border/80 relative overflow-hidden group hover:border-border transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-muted uppercase tracking-wider">Total AR Outstanding</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <DollarSign className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">
            ${totalOutstanding.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-slate-400">
            <span className="text-emerald-400 font-medium">18.4 days</span> DSO (Industry avg: 34d)
          </div>
          <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-emerald-500/5 rounded-full blur-xl group-hover:bg-emerald-500/10 transition-colors pointer-events-none" />
        </div>

        {/* Current (0-30 Days) */}
        <div className="p-4 rounded-2xl bg-surface-card border border-border/80 relative overflow-hidden group hover:border-border transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-muted uppercase tracking-wider">Current (0-30 Days)</span>
            <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">
            ${current0To30.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-blue-400">
            <CheckCircle2 className="w-3 h-3" />
            <span>Normal payment window</span>
          </div>
          <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-blue-500/5 rounded-full blur-xl group-hover:bg-blue-500/10 transition-colors pointer-events-none" />
        </div>

        {/* Overdue (1-30 Days Past Due) */}
        <div className="p-4 rounded-2xl bg-surface-card border border-amber-500/30 bg-amber-950/10 relative overflow-hidden group transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider">Overdue (1-30d Past Due)</span>
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-amber-300 tracking-tight">
            ${overdue1To30.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-amber-400 font-medium">
            <Sparkles className="w-3 h-3" />
            <span>AI Dunning active</span>
          </div>
        </div>

        {/* Collected This Month */}
        <div className="p-4 rounded-2xl bg-surface-card border border-border/80 relative overflow-hidden group hover:border-border transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-muted uppercase tracking-wider">Collected (Nov)</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">
            ${collectedThisMonth.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-emerald-400">
            <span className="font-semibold">{collectionRate}%</span> collection efficiency
          </div>
          <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-indigo-500/5 rounded-full blur-xl group-hover:bg-indigo-500/10 transition-colors pointer-events-none" />
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-surface-card border border-border/80 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by invoice #, customer name, job ID, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-surface-elevated/70 border border-border rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-primary transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Trade Filter Tabs */}
          <div className="flex items-center gap-1 bg-surface-elevated/70 p-1 rounded-xl border border-border shrink-0 text-xs">
            {['ALL', 'HVAC', 'ELECTRICAL', 'PLUMBING'].map((trade) => (
              <button
                key={trade}
                onClick={() => setTradeFilter(trade)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  tradeFilter === trade
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-muted hover:text-white'
                }`}
              >
                {trade === 'ALL' ? 'All Trades' : trade}
              </button>
            ))}
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 flex-wrap border-t border-border/40 pt-3">
          <span className="text-[11px] font-medium text-slate-400 mr-2 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Status:
          </span>
          {[
            { key: 'ALL', label: 'All Invoices', count: invoices.length },
            { key: 'OVERDUE', label: 'Past Due', count: invoices.filter((i) => i.status === 'OVERDUE').length, badgeColor: 'text-amber-400' },
            { key: 'UNPAID', label: 'Open Balances', count: invoices.filter((i) => i.balanceDue > 0).length },
            { key: 'PAID', label: 'Paid & Settled', count: invoices.filter((i) => i.status === 'PAID').length, badgeColor: 'text-emerald-400' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                statusFilter === tab.key
                  ? 'bg-surface-elevated text-white border border-border/80 shadow-sm'
                  : 'text-muted hover:text-white hover:bg-surface-elevated/50'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full bg-surface ${tab.badgeColor || 'text-slate-400'}`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Invoices List Table */}
      <div className="rounded-2xl bg-surface-card border border-border/80 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border/80 bg-surface/50 text-[11px] font-semibold text-muted uppercase tracking-wider">
                <th className="py-3 px-4">Invoice / Trade</th>
                <th className="py-3 px-4">Customer & Service</th>
                <th className="py-3 px-4">Linked Job</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4">Total Amount</th>
                <th className="py-3 px-4">Balance Due</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 text-xs">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-muted">
                    <Receipt className="w-8 h-8 mx-auto text-slate-500 mb-2 opacity-50" />
                    <p className="font-medium text-slate-300">No invoices matched your filters</p>
                    <p className="text-[11px] text-slate-500 mt-1">Try resetting search criteria or trade filters.</p>
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => {
                  const isOverdue = inv.status === 'OVERDUE';
                  const isPaid = inv.status === 'PAID';
                  const isPartial = inv.status === 'PARTIAL';

                  return (
                    <tr
                      key={inv.id}
                      className="hover:bg-surface-elevated/40 transition-colors group cursor-pointer"
                      onClick={() => setSelectedInvoice(inv)}
                    >
                      {/* Invoice ID & Trade */}
                      <td className="py-3.5 px-4 font-mono">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white group-hover:text-primary transition-colors">
                            {inv.invoiceNumber}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded tracking-wide ${
                              inv.tradeType === 'HVAC'
                                ? 'bg-orange-500/15 text-orange-400 border border-orange-500/30'
                                : inv.tradeType === 'ELECTRICAL'
                                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                                : 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                            }`}
                          >
                            {inv.tradeType}
                          </span>
                          <span className="text-[10px] text-slate-400">QBO Synced</span>
                        </div>
                      </td>

                      {/* Customer Name & Phone */}
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-white">{inv.customerName}</div>
                        <div className="text-[11px] text-slate-400 truncate max-w-[180px]">{inv.serviceAddress}</div>
                      </td>

                      {/* Linked Job */}
                      <td className="py-3.5 px-4 font-mono text-slate-300">
                        <span className="px-2 py-0.5 rounded bg-surface border border-border text-[11px] text-slate-300">
                          {inv.linkedJobNumber}
                        </span>
                      </td>

                      {/* Due Date & Aging */}
                      <td className="py-3.5 px-4">
                        <div className="text-slate-300">{inv.dueDate}</div>
                        {isOverdue && (
                          <div className="text-[10px] text-red-400 font-semibold flex items-center gap-1 mt-0.5">
                            <AlertTriangle className="w-3 h-3" />
                            <span>{inv.daysOverdue}d past due</span>
                          </div>
                        )}
                        {isPaid && (
                          <div className="text-[10px] text-emerald-400 flex items-center gap-1 mt-0.5">
                            <Check className="w-3 h-3" />
                            <span>Settled</span>
                          </div>
                        )}
                      </td>

                      {/* Total Amount */}
                      <td className="py-3.5 px-4 font-semibold text-slate-200">
                        ${inv.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>

                      {/* Balance Due */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`font-bold ${
                            inv.balanceDue > 0
                              ? isOverdue
                                ? 'text-red-400'
                                : 'text-amber-400'
                              : 'text-slate-400'
                          }`}
                        >
                          ${inv.balanceDue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {inv.status === 'PAID' && (
                          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-[10px]">
                            PAID
                          </Badge>
                        )}
                        {inv.status === 'OVERDUE' && (
                          <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-500/30 text-[10px] animate-pulse">
                            OVERDUE
                          </Badge>
                        )}
                        {inv.status === 'SENT' && (
                          <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/30 text-[10px]">
                            SENT
                          </Badge>
                        )}
                        {inv.status === 'PARTIAL' && (
                          <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/30 text-[10px]">
                            PARTIAL
                          </Badge>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          {inv.balanceDue > 0 && (
                            <>
                              <button
                                onClick={() => handleCopyPaymentLink(inv)}
                                title="Copy 1-Click Pay Link"
                                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-surface-elevated transition-colors"
                              >
                                <Share2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleSendReminderSMS(inv.id)}
                                title="Send SMS Payment Reminder"
                                className="p-1.5 rounded-lg text-indigo-400 hover:text-indigo-300 hover:bg-indigo-950/40 transition-colors"
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}

                          <button
                            onClick={() => setSelectedInvoice(inv)}
                            title="View Invoice Details"
                            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-surface-elevated transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
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

      {/* Invoice Detail & Payment Settlement Modal */}
      {selectedInvoice && (
        <Modal
          isOpen={!!selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
          title={`Invoice ${selectedInvoice.invoiceNumber} · ${selectedInvoice.customerName}`}
          className="max-w-3xl"
        >
          <div className="space-y-6">
            {/* Top Status Bar */}
            <div className="p-4 rounded-xl bg-surface-elevated/70 border border-border/80 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div
                  className={`px-2.5 py-1 rounded-md font-bold text-xs uppercase tracking-wider ${
                    selectedInvoice.status === 'PAID'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : selectedInvoice.status === 'OVERDUE'
                      ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                      : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                  }`}
                >
                  {selectedInvoice.status}
                </div>
                <div className="text-slate-300">
                  Linked Work Order: <span className="font-mono font-semibold text-white">{selectedInvoice.linkedJobNumber}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 bg-emerald-500/10 text-[10px]">
                  QBO Synced (ID #9042)
                </Badge>
                <span className="text-slate-400 font-mono text-[11px]">Due: {selectedInvoice.dueDate}</span>
              </div>
            </div>

            {/* Customer & Address Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-surface/60 border border-border/70 space-y-1.5">
                <div className="text-slate-400 uppercase text-[10px] font-semibold tracking-wider">Bill To</div>
                <div className="text-sm font-semibold text-white">{selectedInvoice.customerName}</div>
                <div className="text-slate-300">{selectedInvoice.serviceAddress}</div>
                <div className="text-slate-400 flex items-center gap-3 pt-1">
                  <span>{selectedInvoice.customerPhone}</span>
                  <span>·</span>
                  <span>{selectedInvoice.customerEmail}</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-surface/60 border border-border/70 space-y-1.5">
                <div className="text-slate-400 uppercase text-[10px] font-semibold tracking-wider">Payment Status & Receipts</div>
                {selectedInvoice.status === 'PAID' ? (
                  <div className="space-y-1">
                    <div className="text-emerald-400 font-semibold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" /> Paid in Full
                    </div>
                    <div className="text-slate-300">{selectedInvoice.paymentMethod}</div>
                    <div className="text-slate-400 text-[11px]">Processed at {selectedInvoice.paidAt}</div>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <div className="text-amber-400 font-semibold">
                      ${selectedInvoice.balanceDue.toFixed(2)} Balance Remaining
                    </div>
                    {selectedInvoice.amountPaid > 0 && (
                      <div className="text-slate-400 text-[11px]">
                        Deposit of ${selectedInvoice.amountPaid.toFixed(2)} recorded on {selectedInvoice.paidAt}
                      </div>
                    )}
                    <div className="text-slate-400 text-[11px]">
                      Dunning Cadence: {selectedInvoice.dunningCadence.smsReminderSent ? 'SMS sent' : 'Ready'} ·{' '}
                      {selectedInvoice.dunningCadence.overdueNoticeSent ? 'Overdue notice sent' : 'Standby'}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Line Items Table */}
            <div className="rounded-xl border border-border/80 overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-surface/80 border-b border-border/80 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    <th className="py-2.5 px-3">Item Description</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3 text-right">Qty</th>
                    <th className="py-2.5 px-3 text-right">Unit Price</th>
                    <th className="py-2.5 px-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {selectedInvoice.lineItems.map((item) => (
                    <tr key={item.id} className="text-slate-200">
                      <td className="py-2.5 px-3 font-medium text-white">{item.description}</td>
                      <td className="py-2.5 px-3">
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface border border-border text-slate-300">
                          {item.category}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-300">{item.quantity}</td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-300">${item.unitPrice.toFixed(2)}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-semibold text-white">${item.total.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Subtotal, Tax, Balance Row */}
            <div className="flex justify-end pt-2 text-xs">
              <div className="w-64 space-y-2">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal:</span>
                  <span className="font-mono text-slate-200">${selectedInvoice.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>AZ State & Local Sales Tax (8.0%):</span>
                  <span className="font-mono text-slate-200">${selectedInvoice.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-white border-t border-border/80 pt-2">
                  <span>Total Amount:</span>
                  <span className="font-mono">${selectedInvoice.total.toFixed(2)}</span>
                </div>
                {selectedInvoice.amountPaid > 0 && (
                  <div className="flex justify-between text-emerald-400 font-medium">
                    <span>Amount Paid:</span>
                    <span className="font-mono">-${selectedInvoice.amountPaid.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-bold border-t border-border/80 pt-2">
                  <span className={selectedInvoice.balanceDue > 0 ? 'text-red-400' : 'text-slate-300'}>
                    Balance Due:
                  </span>
                  <span className={`font-mono ${selectedInvoice.balanceDue > 0 ? 'text-red-400' : 'text-slate-300'}`}>
                    ${selectedInvoice.balanceDue.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-border/80">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    handleCopyPaymentLink(selectedInvoice);
                  }}
                  className="border-border text-slate-300 hover:text-white text-xs h-9"
                >
                  <Share2 className="w-3.5 h-3.5 mr-1.5" />
                  Copy Pay Link
                </Button>

                {selectedInvoice.balanceDue > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSendReminderSMS(selectedInvoice.id)}
                    className="border-indigo-500/30 text-indigo-300 hover:bg-indigo-950/40 text-xs h-9"
                  >
                    <MessageSquare className="w-3.5 h-3.5 mr-1.5 text-indigo-400" />
                    SMS Reminder
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-2">
                {selectedInvoice.balanceDue > 0 && (
                  <Button
                    size="sm"
                    onClick={() => handleMarkAsPaid(selectedInvoice.id)}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs h-9"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                    Record Paid in Full
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedInvoice(null)}
                  className="text-xs h-9"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Autonomous Elijah Dunning Engine Modal */}
      {isDunningConfigOpen && (
        <Modal
          isOpen={isDunningConfigOpen}
          onClose={() => setIsDunningConfigOpen(false)}
          title="Elijah AI Autonomous AR Collections Engine"
          className="max-w-2xl"
        >
          <div className="space-y-5 text-xs text-slate-300">
            <div className="p-4 rounded-xl bg-gradient-to-tr from-indigo-950/60 to-purple-950/40 border border-indigo-500/30 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Autonomous Past-Due Follow-Up Cadence</h4>
                <p className="text-slate-400 text-xs mt-0.5">
                  Elijah monitors unpaid balances and automatically engages customers via polite SMS and conversational voice calls to resolve receivables without staff labor.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-surface border border-border/80 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-white text-xs">Day 3 After Job Completion: Friendly SMS</div>
                  <div className="text-slate-400 text-[11px] mt-0.5">
                    Sends invoice summary and 1-click Apple Pay / Google Pay / Credit card link via SMS.
                  </div>
                </div>
                <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 bg-emerald-500/10 text-[10px]">
                  Enabled
                </Badge>
              </div>

              <div className="p-3.5 rounded-xl bg-surface border border-border/80 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-white text-xs">Day 14 Past Due: Polite Overdue Notice</div>
                  <div className="text-slate-400 text-[11px] mt-0.5">
                    Sends account statement with late fee disclaimer and offers 3-month interest-free financing link.
                  </div>
                </div>
                <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 bg-emerald-500/10 text-[10px]">
                  Enabled
                </Badge>
              </div>

              <div className="p-3.5 rounded-xl bg-surface border border-border/80 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-white text-xs">Day 30 Past Due: Elijah AI Voice Call</div>
                  <div className="text-slate-400 text-[11px] mt-0.5">
                    Autonomous conversational call inquiring if customer experienced any issues with the repair and collecting card over the phone.
                  </div>
                </div>
                <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 bg-emerald-500/10 text-[10px]">
                  Enabled
                </Badge>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-surface-elevated/80 border border-border text-[11px] space-y-1.5 font-mono text-slate-300">
              <div className="text-primary font-bold">Sample Elijah Voice Transcript (Day 30):</div>
              <p className="italic text-slate-400">
                &ldquo;Hi Marcus, this is Elijah with Vanguard Electric. I wanted to check in on how your AC fan motor has been running since our visit, and also help take care of the outstanding balance of $1,420. Would you like me to send a 1-tap secure link to your phone or process your card on file right now?&rdquo;
              </p>
            </div>

            <div className="flex justify-end pt-3 border-t border-border/80">
              <Button
                size="sm"
                onClick={() => setIsDunningConfigOpen(false)}
                className="bg-primary hover:bg-primary-hover text-white text-xs h-9"
              >
                Save Automation Settings
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* New Invoice Modal */}
      {isNewInvoiceOpen && (
        <Modal
          isOpen={isNewInvoiceOpen}
          onClose={() => setIsNewInvoiceOpen(false)}
          title="Create New Official Invoice"
          className="max-w-xl"
        >
          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-400 mb-1 text-[11px] font-medium">Customer Full Name</label>
              <input
                type="text"
                placeholder="e.g. Robert Henderson"
                className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-white text-xs focus:outline-none focus:border-primary"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1 text-[11px] font-medium">Phone Number</label>
                <input
                  type="text"
                  placeholder="(480) 555-0199"
                  className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-white text-xs focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1 text-[11px] font-medium">Trade Service</label>
                <select className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-white text-xs focus:outline-none focus:border-primary">
                  <option value="HVAC">HVAC & Cooling</option>
                  <option value="ELECTRICAL">Electrical & Panels</option>
                  <option value="PLUMBING">Plumbing & Drains</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-1 text-[11px] font-medium">Primary Line Item Description</label>
              <input
                type="text"
                placeholder="e.g. Trane Condenser Coil Cleaning & Refrigerant Charge"
                className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-white text-xs focus:outline-none focus:border-primary"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1 text-[11px] font-medium">Labor & Diagnostic Amount ($)</label>
                <input
                  type="number"
                  placeholder="249.00"
                  className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-white text-xs focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1 text-[11px] font-medium">Parts & Equipment Amount ($)</label>
                <input
                  type="number"
                  placeholder="380.00"
                  className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-white text-xs focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <div className="p-3 rounded-lg bg-surface-elevated/70 border border-border text-[11px] text-slate-400 flex items-center justify-between">
              <span>QuickBooks Auto-Sync on Creation:</span>
              <span className="text-emerald-400 font-semibold font-mono">ENABLED</span>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-border/80">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsNewInvoiceOpen(false)}
                className="text-xs h-9"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  setIsNewInvoiceOpen(false);
                  setActionNotice('Invoice INV-2026-1049 created and synced to QuickBooks!');
                  setTimeout(() => setActionNotice(null), 3000);
                }}
                className="bg-primary hover:bg-primary-hover text-white text-xs h-9 shadow-md shadow-primary-glow/20"
              >
                Create & Issue Invoice
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
