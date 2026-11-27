'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Wrench,
  Flame,
  Droplet,
  Zap,
  Phone,
  MapPin,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Building2,
  Key,
  Radio,
  FileText,
  ChevronDown,
  ChevronUp,
  User,
  HelpCircle,
} from 'lucide-react';
import WebCallWidget from '@/components/calling/WebCallWidget';

interface CompanyProfile {
  name: string;
  slug: string;
  phone?: string | null;
  tradeType: string;
  address?: string | null;
}

export default function BrandedCustomerBookingPage() {
  const router = useRouter();
  const params = useParams();
  const companySlug = (params?.slug as string) || 'default';

  const [company, setCompany] = useState<CompanyProfile | null>(null);
  const [isLoadingCompany, setIsLoadingCompany] = useState(true);

  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [gateCode, setGateCode] = useState('');
  const [accessNotes, setAccessNotes] = useState('');

  const [tradeType, setTradeType] = useState('HVAC');
  const [urgency, setUrgency] = useState<'EMERGENCY' | 'HIGH' | 'NORMAL'>('NORMAL');
  const [reportedIssue, setReportedIssue] = useState('');
  const [equipmentBrand, setEquipmentBrand] = useState('');
  const [equipmentModel, setEquipmentModel] = useState('');
  const [preferredWindow, setPreferredWindow] = useState('First Available');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookingMode, setBookingMode] = useState<'voice' | 'form'>('voice');
  const [showExtraDetails, setShowExtraDetails] = useState(false);
  const [confirmedJob, setConfirmedJob] = useState<{
    jobId: string;
    jobNumber: string;
    customerName: string;
    companyName: string;
    trackingUrl: string;
  } | null>(null);

  // Load company branding dynamically based on /book/[slug]
  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
    const fetchCompany = async () => {
      setIsLoadingCompany(true);
      try {
        const res = await fetch(`${apiUrl}/jobs/company/${companySlug}`);
        const data = await res.json();
        if (data.success && data.data) {
          setCompany(data.data);
          if (data.data.tradeType) {
            setTradeType(data.data.tradeType);
          }
        }
      } catch (err) {
        console.error('Failed to load company branding:', err);
      } finally {
        setIsLoadingCompany(false);
      }
    };

    fetchCompany();
  }, [companySlug]);

  const ISSUE_PRESETS = [
    { label: '❄️ AC Not Cooling', text: 'AC stopped cooling, blowing warm air' },
    { label: '⚡ Breaker / Power Out', text: 'Breaker keeps tripping, outlets not working' },
    { label: '💧 Water Leak', text: 'Water pipe leaking or drain backed up' },
    { label: '🔥 Heating Issue', text: 'Furnace/heater not blowing warm air' },
    { label: '🛠️ Tune-Up', text: 'Routine system inspection and maintenance' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !address.trim() || !zipCode.trim() || !reportedIssue.trim()) {
      setError('Please fill in your name, contact phone, street address, ZIP code, and issue description.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
      const res = await fetch(`${apiUrl}/jobs/public-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantSlug: company?.slug || companySlug,
          name: name.trim(),
          companyName: companyName.trim() || undefined,
          phone: phone.trim(),
          email: email.trim() || undefined,
          address: address.trim(),
          zipCode: zipCode.trim(),
          gateCode: gateCode.trim() || undefined,
          accessNotes: accessNotes.trim() || undefined,
          reportedIssue: reportedIssue.trim(),
          priority: urgency,
          equipmentBrand: equipmentBrand.trim() || undefined,
          equipmentModel: equipmentModel.trim() || undefined,
          preferredWindow,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to submit service request.');
      }

      setConfirmedJob(data.data);
    } catch (err: any) {
      setError(err.message || 'Could not connect to service dispatch.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayName = company?.name || 'Desert Air HVAC & Plumbing';
  const displayPhone = company?.phone || '(480) 555-0199';
  const displayTrade = company?.tradeType || 'HVAC';

  return (
    <div className="min-h-screen bg-[#080C15] text-slate-100 flex flex-col items-center">
      {/* Top Header */}
      <header className="w-full border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-2xl mx-auto px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-black text-white shadow-md shadow-blue-500/20 text-xs">
              {displayName.charAt(0)}
            </div>
            <div>
              <h1 className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>{displayName}</span>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  {displayTrade}
                </span>
              </h1>
              <p className="text-[10px] text-slate-400">24/7 Fast Repair & Emergency Dispatch</p>
            </div>
          </div>

          <a
            href={`tel:${displayPhone}`}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700/80 text-[11px] font-semibold text-slate-200 flex items-center gap-1.5 transition-colors"
          >
            <Phone className="w-3 h-3 text-emerald-400" />
            <span className="hidden sm:inline">{displayPhone}</span>
            <span className="sm:hidden">Call</span>
          </a>
        </div>
      </header>

      {/* Main Container */}
      <main className="w-full max-w-xl px-4 py-6">
        {confirmedJob ? (
          /* Confirmation / Success Screen */
          <div className="p-8 sm:p-10 rounded-3xl bg-slate-900/80 border border-emerald-500/30 text-center space-y-6 shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400 shadow-lg shadow-emerald-500/20">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-xs font-bold">
                {confirmedJob.jobNumber} CONFIRMED · {confirmedJob.companyName}
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Service Request Received!
              </h2>
              <p className="text-sm text-slate-300 max-w-lg mx-auto">
                Thank you, <span className="font-semibold text-white">{confirmedJob.customerName}</span>. Your request has been queued in the{' '}
                <strong className="text-white">{confirmedJob.companyName}</strong> dispatch system. We have notified our on-call technicians.
              </p>
            </div>

            {/* Live Tracking Call-to-Action */}
            <div className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700/80 text-left space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Live Technician GPS & Status Tracker</h4>
                  <p className="text-xs text-slate-400">
                    Track your technician’s arrival window, vehicle status, and live field progress.
                  </p>
                </div>
              </div>

              <button
                onClick={() => router.push(confirmedJob.trackingUrl)}
                className="w-full py-3.5 px-4 rounded-xl bg-primary hover:bg-primary-hover text-white text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary-glow transition-all"
              >
                <span>Open Live Service Tracker</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              A dispatch confirmation has also been registered for your phone ({phone}).
            </p>
          </div>
        ) : (
          /* Booking Choices & Forms */
          <div className="space-y-6">
            <div className="text-center space-y-2 max-w-xl mx-auto">
              <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Fast Service Dispatch · {displayName}
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Schedule Service or Emergency Repair
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Book instantly via 24/7 AI Voice Dispatch, or fill out the online form below.
              </p>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="flex p-1.5 rounded-2xl bg-slate-900/90 border border-slate-800 max-w-md mx-auto shadow-lg">
              <button
                type="button"
                onClick={() => setBookingMode('voice')}
                className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  bookingMode === 'voice'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Radio className="w-4 h-4 text-emerald-300" />
                <span>Call with AI (90s)</span>
                <span className="px-1.5 py-0.2 rounded-md bg-emerald-500/20 text-emerald-300 text-[9px] font-mono border border-emerald-500/30">
                  INSTANT
                </span>
              </button>

              <button
                type="button"
                onClick={() => setBookingMode('form')}
                className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  bookingMode === 'form'
                    ? 'bg-slate-800 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileText className="w-4 h-4 text-blue-400" />
                <span>Online Form</span>
              </button>
            </div>

            {error && (
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* MODE 1: Voice Calling Widget */}
            {bookingMode === 'voice' && (
              <div className="space-y-4">
                <WebCallWidget
                  companySlug={companySlug}
                  companyName={displayName}
                  tradeType={displayTrade}
                  onCallFinished={async () => {
                    // Check if a job was created or notify customer
                  }}
                />

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => setBookingMode('form')}
                    className="text-xs text-slate-400 hover:text-blue-400 underline underline-offset-4 transition-colors cursor-pointer"
                  >
                    Prefer to type instead? Fill out the online booking form &rarr;
                  </button>
                </div>
              </div>
            )}

            {/* MODE 2: Online Booking Form */}
            {bookingMode === 'form' && (
              <form onSubmit={handleSubmit} className="p-5 sm:p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4 max-w-xl mx-auto">
                {/* Voice CTA Banner */}
                <div className="p-2.5 px-3 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-between text-xs text-blue-300">
                  <div className="flex items-center gap-1.5 truncate">
                    <Sparkles className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span className="truncate">Don&apos;t want to type? Speak to our AI dispatcher.</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setBookingMode('voice')}
                    className="font-bold underline text-blue-400 hover:text-white shrink-0 ml-2 cursor-pointer"
                  >
                    Call with AI &rarr;
                  </button>
                </div>

                {/* 1. Problem Selector & Description */}
                <div className="space-y-2">
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                    What can we help you with? *
                  </label>
                  
                  {/* Quick Preset Chips */}
                  <div className="flex flex-wrap gap-1.5">
                    {ISSUE_PRESETS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setReportedIssue(preset.text)}
                        className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                          reportedIssue === preset.text
                            ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                            : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:border-slate-500'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>

                  <textarea
                    required
                    rows={2}
                    placeholder="Describe symptoms (e.g. Unit not turning on, strange clicking noise)..."
                    value={reportedIssue}
                    onChange={(e) => setReportedIssue(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950/60 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 leading-relaxed"
                  />
                </div>

                {/* 2. Contact & Address (Compact 2-col) */}
                <div className="space-y-2.5 pt-1">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Jessica Taylor"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-950/60 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                        Mobile Phone (for arrival SMS) *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="e.g. (602) 555-0199"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-950/60 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                        Street Address *
                      </label>
                      <div className="relative">
                        <MapPin className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                        <input
                          type="text"
                          required
                          placeholder="e.g. 100 N Central Ave"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 bg-slate-950/60 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                        ZIP Code *
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={10}
                        placeholder="e.g. 85004"
                        value={zipCode}
                        onChange={(e) => setZipCode(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-950/60 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. Urgency & Arrival Window */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-xs">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      Priority Level
                    </label>
                    <div className="grid grid-cols-3 gap-1">
                      <button
                        type="button"
                        onClick={() => setUrgency('NORMAL')}
                        className={`py-1.5 px-2 rounded-lg border text-center text-[11px] font-semibold transition-all cursor-pointer ${
                          urgency === 'NORMAL'
                            ? 'bg-blue-600/30 border-blue-500 text-blue-300'
                            : 'bg-slate-800/40 border-slate-700/60 text-slate-400 hover:border-slate-600'
                        }`}
                      >
                        Standard
                      </button>

                      <button
                        type="button"
                        onClick={() => setUrgency('HIGH')}
                        className={`py-1.5 px-2 rounded-lg border text-center text-[11px] font-semibold transition-all cursor-pointer ${
                          urgency === 'HIGH'
                            ? 'bg-amber-500/30 border-amber-500 text-amber-300'
                            : 'bg-slate-800/40 border-slate-700/60 text-slate-400 hover:border-slate-600'
                        }`}
                      >
                        High
                      </button>

                      <button
                        type="button"
                        onClick={() => setUrgency('EMERGENCY')}
                        className={`py-1.5 px-2 rounded-lg border text-center text-[11px] font-semibold transition-all cursor-pointer ${
                          urgency === 'EMERGENCY'
                            ? 'bg-rose-500/30 border-rose-500 text-rose-300'
                            : 'bg-slate-800/40 border-slate-700/60 text-slate-400 hover:border-slate-600'
                        }`}
                      >
                        🚨 Urgent
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      Preferred Arrival
                    </label>
                    <select
                      value={preferredWindow}
                      onChange={(e) => setPreferredWindow(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950/60 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="First Available">First Available Technician</option>
                      <option value="Morning (8:00 AM - 12:00 PM)">Morning (8 AM – 12 PM)</option>
                      <option value="Afternoon (12:00 PM - 4:00 PM)">Afternoon (12 PM – 4 PM)</option>
                      <option value="Evening (4:00 PM - 8:00 PM)">Evening (4 PM – 8 PM)</option>
                    </select>
                  </div>
                </div>

                {/* 4. Collapsible Optional Details */}
                <div className="pt-1 border-t border-slate-800/80">
                  <button
                    type="button"
                    onClick={() => setShowExtraDetails(!showExtraDetails)}
                    className="flex items-center gap-1.5 text-[11px] text-slate-400 hover:text-blue-400 font-medium transition-colors cursor-pointer"
                  >
                    {showExtraDetails ? (
                      <ChevronUp className="w-3.5 h-3.5 text-blue-400" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5" />
                    )}
                    <span>
                      {showExtraDetails
                        ? 'Hide optional property details'
                        : '+ Add gate code, brand, or notes (optional)'}
                    </span>
                  </button>

                  {showExtraDetails && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2.5 text-xs animate-in fade-in duration-150">
                      <div>
                        <label className="block text-[10px] text-slate-400 mb-1">
                          Gate / Lockbox Code
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. #3842 or Keybox on side"
                          value={gateCode}
                          onChange={(e) => setGateCode(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-slate-950/60 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] text-slate-400 mb-1">
                          Unit Brand (If known)
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Carrier, Trane, Square D"
                          value={equipmentBrand}
                          onChange={(e) => setEquipmentBrand(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-slate-950/60 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] text-slate-400 mb-1">
                          Email (for receipt)
                        </label>
                        <input
                          type="email"
                          placeholder="e.g. jessica@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-slate-950/60 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] text-slate-400 mb-1">
                          Access Notes
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Ring front bell twice"
                          value={accessNotes}
                          onChange={(e) => setAccessNotes(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-slate-950/60 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* 5. Submit CTA */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Submit Request & Get Live Tracker</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                  <p className="text-center text-[10px] text-slate-500 mt-2">
                    ⚡ Instant dispatch confirmation · Live technician GPS tracker sent via SMS
                  </p>
                </div>
              </form>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
