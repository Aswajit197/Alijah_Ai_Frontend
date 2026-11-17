'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
  Loader2,
} from 'lucide-react';

interface CompanyProfile {
  name: string;
  slug: string;
  phone?: string | null;
  tradeType: string;
  address?: string | null;
}

function CustomerBookingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const companySlug = searchParams?.get('company') || '';

  const [company, setCompany] = useState<CompanyProfile | null>(null);
  const [isLoadingCompany, setIsLoadingCompany] = useState(true);

  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
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
  const [confirmedJob, setConfirmedJob] = useState<{
    jobId: string;
    jobNumber: string;
    customerName: string;
    companyName: string;
    trackingUrl: string;
  } | null>(null);

  // Load company branding dynamically based on ?company= slug
  useEffect(() => {
    const fetchCompany = async () => {
      setIsLoadingCompany(true);
      try {
        const slug = companySlug || 'default';
        const res = await fetch(`http://localhost:5000/api/v1/jobs/company/${slug}`);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !address.trim() || !reportedIssue.trim()) {
      setError('Please fill in your name, contact phone, service address, and issue description.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch('http://localhost:5000/api/v1/jobs/public-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantSlug: company?.slug || companySlug || undefined,
          name: name.trim(),
          companyName: companyName.trim() || undefined,
          phone: phone.trim(),
          email: email.trim() || undefined,
          address: address.trim(),
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
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-black text-white shadow-md shadow-blue-500/20">
              {displayName.charAt(0)}
            </div>
            <div>
              <h1 className="text-sm font-bold text-white flex items-center gap-2">
                <span>{displayName}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  {displayTrade}
                </span>
              </h1>
              <p className="text-[11px] text-slate-400">24/7 Fast Repair & Emergency Dispatch</p>
            </div>
          </div>

          <a
            href={`tel:${displayPhone}`}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700/80 text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition-colors"
          >
            <Phone className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">{displayPhone}</span>
            <span className="sm:hidden">Call</span>
          </a>
        </div>
      </header>

      {/* Main Container */}
      <main className="w-full max-w-3xl px-4 py-8">
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
          /* Booking Form */
          <div className="space-y-6">
            <div className="text-center space-y-2 max-w-xl mx-auto">
              <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Fast Service Dispatch · {displayName}
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Schedule Service or Emergency Repair
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Book in under 60 seconds. Our dispatchers will match an available technician and send real-time arrival tracking straight to your phone.
              </p>
            </div>

            {error && (
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-slate-800 shadow-2xl space-y-6">
              {/* Section 1: Contact Details */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  1. Your Contact & Property Details
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Jessica Taylor"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Business / Facility (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Taylor Dental Clinic"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Mobile Phone (for live arrival alerts) *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. (702) 555-0199"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Email Address (Optional)
                    </label>
                    <input
                      type="email"
                      placeholder="e.g. jessica@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Service Street Address *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 1420 Boulder Creek Rd, Henderson, NV"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Gate / Lockbox Code (If any)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. #3842 or Keybox on side"
                      value={gateCode}
                      onChange={(e) => setGateCode(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Property Access Notes
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Beware of friendly dog in yard"
                      value={accessNotes}
                      onChange={(e) => setAccessNotes(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Service & Issue */}
              <div className="space-y-3 pt-4 border-t border-slate-800/80">
                <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                  <Wrench className="w-4 h-4" />
                  2. What Problem Are You Experiencing?
                </h3>

                {/* Urgency Selector */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1.5">
                    How Urgent Is This?
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setUrgency('EMERGENCY')}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        urgency === 'EMERGENCY'
                          ? 'bg-rose-500/20 border-rose-500 text-rose-300 shadow-md shadow-rose-500/10'
                          : 'bg-slate-800/40 border-slate-700 text-slate-400 hover:border-slate-600'
                      }`}
                    >
                      <div className="font-bold text-xs flex items-center gap-1.5 text-rose-400">
                        <Flame className="w-3.5 h-3.5" /> Emergency
                      </div>
                      <p className="text-[10px] mt-0.5 opacity-80">No Heat / AC, gas odor, leaks</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setUrgency('HIGH')}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        urgency === 'HIGH'
                          ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-md shadow-amber-500/10'
                          : 'bg-slate-800/40 border-slate-700 text-slate-400 hover:border-slate-600'
                      }`}
                    >
                      <div className="font-bold text-xs flex items-center gap-1.5 text-amber-400">
                        <AlertTriangle className="w-3.5 h-3.5" /> High Priority
                      </div>
                      <p className="text-[10px] mt-0.5 opacity-80">Unit struggling, strange noises</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setUrgency('NORMAL')}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        urgency === 'NORMAL'
                          ? 'bg-blue-500/20 border-blue-500 text-blue-300 shadow-md shadow-blue-500/10'
                          : 'bg-slate-800/40 border-slate-700 text-slate-400 hover:border-slate-600'
                      }`}
                    >
                      <div className="font-bold text-xs flex items-center gap-1.5 text-blue-400">
                        <Clock className="w-3.5 h-3.5" /> Standard
                      </div>
                      <p className="text-[10px] mt-0.5 opacity-80">Tune-up, routine repair</p>
                    </button>
                  </div>
                </div>

                {/* Symptoms Description */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Describe the Symptoms & Issue *
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="e.g. The unit stopped working this afternoon. Strange noise and not functioning properly."
                    value={reportedIssue}
                    onChange={(e) => setReportedIssue(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 leading-relaxed"
                  />
                </div>

                {/* Optional Equipment Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Unit Brand (If known)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Carrier, Trane, Lennox, Rheem"
                      value={equipmentBrand}
                      onChange={(e) => setEquipmentBrand(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Preferred Arrival Time
                    </label>
                    <select
                      value={preferredWindow}
                      onChange={(e) => setPreferredWindow(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="First Available">First Available Technician</option>
                      <option value="Morning (8:00 AM - 12:00 PM)">Morning (8:00 AM – 12:00 PM)</option>
                      <option value="Afternoon (12:00 PM - 4:00 PM)">Afternoon (12:00 PM – 4:00 PM)</option>
                      <option value="Evening (4:00 PM - 8:00 PM)">Evening (4:00 PM – 8:00 PM)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-4 rounded-2xl bg-primary hover:bg-primary-hover text-white text-sm font-bold flex items-center justify-center gap-2 shadow-xl shadow-primary-glow transition-all disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Submit Request & Get Live Tracker</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
                <p className="text-center text-[11px] text-slate-500 mt-2">
                  No account or password required · Dispatched directly to {displayName}
                </p>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}

export default function CustomerSelfBookingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#080C15] flex items-center justify-center text-slate-400 text-xs">
          <Loader2 className="w-5 h-5 animate-spin mr-2 text-primary" />
          Loading booking portal...
        </div>
      }
    >
      <CustomerBookingContent />
    </Suspense>
  );
}
