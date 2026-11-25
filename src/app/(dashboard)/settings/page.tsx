'use client';

import React, { useEffect, useState } from 'react';
import {
  Settings,
  Shield,
  Users,
  Building2,
  CheckCircle,
  UserPlus,
  Clock,
  Copy,
  Check,
  Mail,
  ExternalLink,
  Loader2,
  RefreshCw,
  Sparkles,
  Globe,
  Code,
  QrCode,
  Printer,
  Download,
  Lock,
  Bot,
  Zap,
  SlidersHorizontal,
  MapPin,
  Layers,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';
import QRCode from 'qrcode';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { apiRequest } from '@/lib/api';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  phone?: string;
  isActive: boolean;
  isInviteAccepted?: boolean;
  createdAt: string;
  role: {
    id: string;
    name: string;
    slug: string;
    approvalLimit: number;
  };
}

interface PlatformRole {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

interface CreatedStaffInvite {
  name: string;
  email: string;
  roleName: string;
  inviteLink: string;
  inviteExpiresAt: string;
}

export default function SettingsPage() {
  const { user } = useAuth();
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [roles, setRoles] = useState<PlatformRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Invite Staff Modal State
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [roleId, setRoleId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Staff Invite Result Modal
  const [createdInvite, setCreatedInvite] = useState<CreatedStaffInvite | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedBookingUrl, setCopiedBookingUrl] = useState(false);
  const [copiedEmbedCode, setCopiedEmbedCode] = useState(false);

  // QR Code & Sticker States
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isStickerModalOpen, setIsStickerModalOpen] = useState(false);

  // Operational Dispatch Policy State (Rule 1: dispatch.assign)
  const [dispatchPolicy, setDispatchPolicy] = useState<'ALLOW' | 'RECOMMEND'>('ALLOW');
  const [invoiceLimit, setInvoiceLimit] = useState<number>(5000);
  const [emergencyTimeout, setEmergencyTimeout] = useState<number>(10);
  const [isSavingPolicy, setIsSavingPolicy] = useState(false);
  const [policySavedFeedback, setPolicySavedFeedback] = useState(false);
  const [serviceAreas, setServiceAreas] = useState<Array<{ id: string; name: string; zipCodes: string[] }>>([]);

  const loadServiceAreas = async () => {
    try {
      const res = await apiRequest<{ data: any[] }>('/service-areas');
      if (res && Array.isArray(res.data)) {
        setServiceAreas(res.data);
      }
    } catch (e) {
      // fallback
    }
  };

  const loadCompanySettings = async () => {
    try {
      const res = await apiRequest<any>('/auth/company-settings');
      if (res) {
        if (res.dispatchPolicy) setDispatchPolicy(res.dispatchPolicy);
        if (res.invoiceApprovalThreshold) setInvoiceLimit(res.invoiceApprovalThreshold);
        if (res.emergencyPageTimeoutMinutes) setEmergencyTimeout(res.emergencyPageTimeoutMinutes);
      }
    } catch (e) {
      console.error('Failed to load company settings:', e);
    }
  };

  const handleSavePolicy = async (newPolicy?: 'ALLOW' | 'RECOMMEND') => {
    const policyToSave = newPolicy || dispatchPolicy;
    setIsSavingPolicy(true);
    setPolicySavedFeedback(false);
    try {
      await apiRequest('/auth/company-settings', {
        method: 'PATCH',
        body: JSON.stringify({
          dispatchPolicy: policyToSave,
          invoiceApprovalThreshold: invoiceLimit,
          emergencyPageTimeoutMinutes: emergencyTimeout,
        }),
      });
      if (newPolicy) setDispatchPolicy(newPolicy);
      setPolicySavedFeedback(true);
      setTimeout(() => setPolicySavedFeedback(false), 3000);
    } catch (err: any) {
      console.error('Failed to update company settings:', err);
    } finally {
      setIsSavingPolicy(false);
    }
  };

  const isSuperAdminOrOwner = user?.role?.slug === 'owner' || user?.role?.slug === 'office_manager';

  const loadTeamAndRoles = async () => {
    setIsLoading(true);
    try {
      const rolesData = await apiRequest<PlatformRole[]>('/roles').catch(() => []);
      setRoles(rolesData);
      if (rolesData.length > 0 && !roleId) {
        // Default to office manager or first non-owner role
        const defaultRole = rolesData.find((r) => r.slug === 'office_manager') || rolesData[0];
        setRoleId(defaultRole.id);
      }

      // Only query users if user has administrative privileges (owner or office_manager)
      if (isSuperAdminOrOwner) {
        const usersData = await apiRequest<TeamMember[]>('/users');
        setTeam(usersData);
      }
    } catch (err: any) {
      console.error('Failed to load team data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTeamAndRoles();
    loadCompanySettings();
    loadServiceAreas();
  }, [user?.role?.slug]);

  const handleInviteStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);

    try {
      const result = await apiRequest<any>('/users', {
        method: 'POST',
        body: JSON.stringify({
          name,
          email,
          phone: phone || undefined,
          roleId,
        }),
      });

      const assignedRole = roles.find((r) => r.id === roleId);

      setCreatedInvite({
        name: result.user.name,
        email: result.user.email,
        roleName: assignedRole?.name || 'Staff',
        inviteLink: result.inviteLink,
        inviteExpiresAt: result.inviteExpiresAt,
      });

      setIsInviteModalOpen(false);
      setName('');
      setEmail('');
      setPhone('');
      loadTeamAndRoles();
    } catch (err: any) {
      setFormError(err.message || 'Failed to invite team member');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyLink = (link: string) => {
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // Generate high-resolution QR code for company booking URL
  useEffect(() => {
    const slug = user?.tenantSlug || 'desert-air';
    const bookingUrl =
      typeof window !== 'undefined'
        ? `${window.location.origin}/book/${slug}`
        : `http://localhost:3000/book/${slug}`;

    QRCode.toDataURL(bookingUrl, {
      width: 500,
      margin: 2,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('Failed to generate QR code:', err));
  }, [user?.tenantSlug]);

  const handleDownloadQrPng = () => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = `${user?.tenantSlug || 'service'}-equipment-qr.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintSticker = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    const companyName = user?.tenantName || 'Service Contractor';
    const bookingUrl =
      typeof window !== 'undefined'
        ? `${window.location.origin}/book/${user?.tenantSlug || 'desert-air'}`
        : `http://localhost:3000/book/${user?.tenantSlug || 'desert-air'}`;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Equipment Sticker - ${companyName}</title>
          <style>
            @page { size: 4in 3in; margin: 0; }
            body {
              margin: 0;
              padding: 12px;
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              background: #fff;
              color: #0f172a;
              display: flex;
              align-items: center;
              justify-content: center;
              height: 100vh;
              box-sizing: border-box;
            }
            .sticker {
              width: 3.7in;
              height: 2.7in;
              border: 3px solid #0f172a;
              border-radius: 14px;
              padding: 14px;
              box-sizing: border-box;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: space-between;
              text-align: center;
            }
            .badge {
              font-size: 8px;
              font-weight: 800;
              text-transform: uppercase;
              letter-spacing: 1px;
              color: #2563eb;
              background: #eff6ff;
              padding: 2px 8px;
              border-radius: 9999px;
              border: 1px solid #bfdbfe;
              margin-bottom: 2px;
            }
            .header {
              font-size: 14px;
              font-weight: 900;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              line-height: 1.2;
            }
            .sub {
              font-size: 10px;
              color: #64748b;
              font-weight: 600;
              margin-top: 2px;
            }
            .qr-img {
              width: 115px;
              height: 115px;
              margin: 4px 0;
              border: 1px solid #e2e8f0;
              border-radius: 8px;
              padding: 4px;
            }
            .scan-cta {
              font-size: 11px;
              font-weight: 800;
              color: #0f172a;
              letter-spacing: 0.5px;
            }
            .url {
              font-size: 9px;
              color: #64748b;
              font-family: monospace;
              word-break: break-all;
            }
            .footer {
              font-size: 8px;
              color: #94a3b8;
              font-weight: 600;
              text-transform: uppercase;
              border-top: 1px solid #e2e8f0;
              width: 100%;
              padding-top: 4px;
            }
          </style>
        </head>
        <body>
          <div class="sticker">
            <div>
              <div class="badge">Official Service Tag</div>
              <div class="header">${companyName}</div>
              <div class="sub">24/7 Fast Repair & Emergency Dispatch</div>
            </div>
            <img src="${qrDataUrl}" class="qr-img" />
            <div>
              <div class="scan-cta">SCAN WITH PHONE TO BOOK REPAIR</div>
              <div class="url">${bookingUrl}</div>
            </div>
            <div class="footer">Licensed & Insured · Autonomous Operations Platform</div>
          </div>
          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() { window.close(); };
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const getRoleBadgeVariant = (roleSlug: string): 'success' | 'warning' | 'danger' | 'info' | 'primary' | 'neutral' => {
    switch (roleSlug) {
      case 'owner':
        return 'warning';
      case 'office_manager':
        return 'primary';
      case 'dispatcher':
        return 'info';
      case 'sales_estimator':
        return 'info';
      case 'technician':
        return 'success';
      default:
        return 'neutral';
    }
  };

  return (
    <div className="space-y-8 w-full max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-primary to-ai flex items-center justify-center text-white shadow-md shadow-primary-glow shrink-0">
              <Settings className="w-5 h-5" />
            </div>
            <span>Company Settings & Operations Hub</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1.5">
            Manage organization parameters, customer booking links, physical QR tags, and team roster permissions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3.5 py-1.5 rounded-xl bg-surface-card border border-border text-xs font-mono text-slate-300">
            Tenant: <strong className="text-accent">{user?.tenantSlug || 'vanguard-electric'}</strong>
          </span>
        </div>
      </div>

      {/* Profile & Security Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Company Profile Card */}
        <div className="p-6 rounded-3xl bg-surface/90 border border-border space-y-5 shadow-xl">
          <div className="flex items-center gap-2.5 pb-4 border-b border-border">
            <Building2 className="w-5 h-5 text-primary" />
            <h2 className="text-base font-bold text-white">Company Profile</h2>
          </div>

          <div className="space-y-4">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Organization Name
              </span>
              <span className="text-lg font-bold text-white">
                {user?.tenantName || 'Vanguard Electric & Power'}
              </span>
            </div>

            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Tenant Identifier / Subdomain Slug
              </span>
              <span className="inline-block text-accent font-mono font-bold bg-surface-elevated px-3 py-1 rounded-xl border border-border text-xs">
                {user?.tenantSlug || 'vanguard-electric'}
              </span>
            </div>

            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Primary Service Region
              </span>
              <span className="text-sm font-semibold text-slate-200">
                Phoenix & Scottsdale Metropolitan Area, AZ
              </span>
            </div>
          </div>
        </div>

        {/* User Session Security */}
        <div className="p-6 rounded-3xl bg-surface/90 border border-border space-y-5 shadow-xl">
          <div className="flex items-center gap-2.5 pb-4 border-b border-border">
            <Shield className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-white">Security & Active Session</h2>
          </div>

          <div className="space-y-4">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Signed In Operator
              </span>
              <span className="text-base font-bold text-white">
                {user?.name}{' '}
                <span className="text-xs font-mono text-slate-400 font-normal">
                  ({user?.email})
                </span>
              </span>
            </div>

            <div className="flex items-center gap-6">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Assigned Role
                </span>
                <span className="inline-block px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-bold capitalize">
                  {user?.role?.name || 'Business Owner'}
                </span>
              </div>

              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Approval Limit
                </span>
                <span className="text-sm text-slate-200 font-mono font-bold">
                  ${Number(user?.role?.approvalLimit || 0).toLocaleString()} USD
                </span>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-2 text-xs text-emerald-400 font-medium">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>Session secured with HTTP-Only Cookie + 256-bit JWT guards</span>
            </div>
          </div>
        </div>
      </div>

      {/* Rule 1: The Company Operational Dispatch Policy (dispatch.assign) */}
      <div className="p-6 sm:p-7 rounded-3xl bg-surface/90 border border-border space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400 shrink-0">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">
                  Autonomous AI Dispatch Policy
                </h2>
                <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-surface-elevated text-accent border border-border font-bold">
                  Rule 1: dispatch.assign
                </span>
              </div>
              <p className="text-sm text-slate-400 mt-0.5">
                Configure operational dispatch mode: whether incoming customer requests auto-assign or queue for dispatcher review.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {policySavedFeedback && (
              <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold bg-emerald-950/40 border border-emerald-500/30 px-3 py-1.5 rounded-xl animate-fade-in">
                <Check className="w-3.5 h-3.5" /> Policy Active
              </span>
            )}
            <Button
              size="sm"
              disabled={isSavingPolicy}
              onClick={() => handleSavePolicy()}
              className="bg-primary hover:bg-primary-hover text-white font-bold h-9 px-4 rounded-xl shadow-md"
            >
              {isSavingPolicy ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : null}
              <span>Save Policy</span>
            </Button>
          </div>
        </div>

        {/* 2 Operational Mode Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Autonomous AI Dispatch Card */}
          <div
            onClick={() => {
              setDispatchPolicy('ALLOW');
              handleSavePolicy('ALLOW');
            }}
            className={`cursor-pointer p-5 rounded-2xl border transition-all relative overflow-hidden ${
              dispatchPolicy === 'ALLOW'
                ? 'bg-blue-950/20 border-blue-500/60 shadow-lg shadow-blue-950/30 ring-1 ring-blue-500/50'
                : 'bg-surface-elevated/40 border-border hover:border-slate-700 hover:bg-surface-elevated/70'
            }`}
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                  dispatchPolicy === 'ALLOW' ? 'bg-blue-600 text-white' : 'bg-surface text-slate-400 border border-border'
                }`}>
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Autonomous AI Dispatch</h3>
                  <span className="text-[11px] font-mono text-blue-400 uppercase tracking-wider font-semibold">ALLOW</span>
                </div>
              </div>
              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                dispatchPolicy === 'ALLOW'
                  ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                  : 'bg-surface text-slate-500 border-border'
              }`}>
                {dispatchPolicy === 'ALLOW' ? 'ACTIVE' : 'SELECT'}
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-3">
              Elijah AI immediately evaluates technician trade skills, distance, and daily workload, and <strong>instantly auto-dispatches</strong> the #1 ranked technician without human intervention.
            </p>

            <div className="pt-3 border-t border-slate-800/60 flex items-center gap-2 text-[11px] text-slate-400">
              <CheckCircle className={`w-3.5 h-3.5 ${dispatchPolicy === 'ALLOW' ? 'text-blue-400' : 'text-slate-600'}`} />
              <span>Instant mobile dispatch alert & 10-min acceptance timer</span>
            </div>
          </div>

          {/* Human Dispatcher Triage Card */}
          <div
            onClick={() => {
              setDispatchPolicy('RECOMMEND');
              handleSavePolicy('RECOMMEND');
            }}
            className={`cursor-pointer p-5 rounded-2xl border transition-all relative overflow-hidden ${
              dispatchPolicy === 'RECOMMEND'
                ? 'bg-amber-950/20 border-amber-500/60 shadow-lg shadow-amber-950/30 ring-1 ring-amber-500/50'
                : 'bg-surface-elevated/40 border-border hover:border-slate-700 hover:bg-surface-elevated/70'
            }`}
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                  dispatchPolicy === 'RECOMMEND' ? 'bg-amber-600 text-white' : 'bg-surface text-slate-400 border border-border'
                }`}>
                  <SlidersHorizontal className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Human Dispatcher Triage</h3>
                  <span className="text-[11px] font-mono text-amber-400 uppercase tracking-wider font-semibold">RECOMMEND</span>
                </div>
              </div>
              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                dispatchPolicy === 'RECOMMEND'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                  : 'bg-surface text-slate-500 border-border'
              }`}>
                {dispatchPolicy === 'RECOMMEND' ? 'ACTIVE' : 'SELECT'}
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-3">
              Elijah AI calculates top technician recommendations, but places work orders into the <strong>Unassigned Triage Queue</strong> on your Schedule Board for a human dispatcher to review and approve.
            </p>

            <div className="pt-3 border-t border-slate-800/60 flex items-center gap-2 text-[11px] text-slate-400">
              <CheckCircle className={`w-3.5 h-3.5 ${dispatchPolicy === 'RECOMMEND' ? 'text-amber-400' : 'text-slate-600'}`} />
              <span>Full dispatcher control with AI candidate scoring hints</span>
            </div>
          </div>
        </div>

        {/* Operational Guardrails (Invoice limit & Emergency Timeout) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-border">
          <div className="p-4 rounded-2xl bg-surface-elevated/50 border border-border flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-white block">Invoice Approval Threshold</span>
              <span className="text-[11px] text-slate-400">Invoices above this threshold require Owner sign-off (`invoice.send`)</span>
            </div>
            <div className="w-32 flex items-center gap-1.5">
              <span className="text-slate-400 text-xs font-bold">$</span>
              <input
                type="number"
                value={invoiceLimit}
                onChange={(e) => setInvoiceLimit(Number(e.target.value))}
                className="w-full bg-surface border border-border rounded-xl px-2.5 py-1.5 text-xs text-white font-mono font-bold focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-surface-elevated/50 border border-border flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-white block">Emergency Page Timeout</span>
              <span className="text-[11px] text-slate-400">Minutes before escalating to next on-call technician</span>
            </div>
            <div className="w-24 flex items-center gap-1.5">
              <input
                type="number"
                value={emergencyTimeout}
                onChange={(e) => setEmergencyTimeout(Number(e.target.value))}
                className="w-full bg-surface border border-border rounded-xl px-2.5 py-1.5 text-xs text-white font-mono font-bold focus:outline-none focus:border-primary"
              />
              <span className="text-slate-400 text-xs font-bold">min</span>
            </div>
          </div>
        </div>
      </div>

      {/* Service Areas & Geographic Territory Coverage */}
      <div className="p-6 sm:p-7 rounded-3xl bg-surface/90 border border-border space-y-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-blue-500/10 border border-blue-500/25 flex items-center justify-center text-blue-400 shrink-0">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">
                  Service Areas & Territory Coverage
                </h2>
                <Badge variant="outline" className="border-blue-500/30 text-blue-400 bg-blue-500/10 text-xs">
                  Active Dispatch Guardrails
                </Badge>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                5-digit ZIP codes covered by Elijah AI and online booking. Callers outside these areas are assessed an out-of-zone travel fee ($45) or routed to dispatcher triage.
              </p>
            </div>
          </div>

          <Link href="/service-areas">
            <Button
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-9 px-4 rounded-xl flex items-center gap-1.5 font-medium shadow-md shadow-blue-600/20"
            >
              <MapPin className="w-3.5 h-3.5" />
              Manage Service Areas
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>

        {/* Quick Zones Overview Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-surface-elevated/60 border border-border space-y-1">
            <span className="text-slate-400 text-xs block">Configured Zones</span>
            <div className="text-2xl font-black text-white">
              {serviceAreas.length > 0 ? serviceAreas.length : 4}
            </div>
            <span className="text-[11px] text-muted">Active dispatch regions</span>
          </div>

          <div className="p-4 rounded-2xl bg-surface-elevated/60 border border-border space-y-1">
            <span className="text-slate-400 text-xs block">Total Covered ZIP Codes</span>
            <div className="text-2xl font-black text-emerald-400">
              {serviceAreas.length > 0
                ? Array.from(new Set(serviceAreas.flatMap((a) => a.zipCodes || []))).length
                : 36}
            </div>
            <span className="text-[11px] text-emerald-400/80">In-network postal codes</span>
          </div>

          <div className="p-4 rounded-2xl bg-surface-elevated/60 border border-border space-y-1">
            <span className="text-slate-400 text-xs block">Primary Region</span>
            <div className="text-base font-bold text-white pt-1">Phoenix Metro, AZ</div>
            <span className="text-[11px] text-slate-400">Valley-wide technician routing</span>
          </div>

          <div className="p-4 rounded-2xl bg-surface-elevated/60 border border-border space-y-1">
            <span className="text-slate-400 text-xs block">Out-of-Zone Guardrail</span>
            <div className="text-base font-bold text-amber-400 pt-1">$45 Travel Surcharge</div>
            <span className="text-[11px] text-slate-400">Automated AI policy check</span>
          </div>
        </div>

        {/* Preview of Configured Areas */}
        <div className="pt-2 flex flex-wrap items-center gap-2">
          {(serviceAreas.length > 0
            ? serviceAreas
            : [
                { id: '1', name: 'East Valley (Scottsdale / Tempe)', zipCodes: ['85250', '85251', '85254', '85258', '85281'] },
                { id: '2', name: 'Central Phoenix Core', zipCodes: ['85001', '85004', '85012', '85016', '85018'] },
                { id: '3', name: 'West Valley (Glendale / Peoria)', zipCodes: ['85301', '85302', '85308', '85345'] },
                { id: '4', name: 'Southeast Valley (Mesa / Chandler)', zipCodes: ['85201', '85202', '85224', '85233'] },
              ]
          ).map((area) => (
            <div
              key={area.id}
              className="px-3 py-1.5 rounded-xl bg-surface border border-border text-xs flex items-center gap-2"
            >
              <MapPin className="w-3.5 h-3.5 text-blue-400" />
              <span className="font-semibold text-white">{area.name}</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-surface-elevated text-slate-400 border border-border">
                {area.zipCodes?.length || 0} ZIPs
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Public Customer Booking & Website Integration */}
      <div className="p-6 sm:p-7 rounded-3xl bg-surface/90 border border-border space-y-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-primary/10 border border-primary/25 flex items-center justify-center text-primary shrink-0">
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                Public Customer Booking & Website Integration
              </h2>
              <p className="text-sm text-slate-400 mt-0.5">
                Your company’s unique online booking portal. Homeowner requests submitted here route directly to your schedule.
              </p>
            </div>
          </div>

          <a
            href={`/book/${user?.tenantSlug || 'vanguard-electric'}`}
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-primary-glow transition-all shrink-0"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Open Live Portal</span>
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
          {/* Card A: Direct Clean URL */}
          <div className="p-5 rounded-2xl bg-surface-elevated/80 border border-border space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-white flex items-center gap-2">
                  <Globe className="w-4 h-4 text-sky-400" />
                  Dedicated Booking URL
                </span>
                <span className="text-xs text-sky-400/90 font-mono font-semibold bg-sky-500/10 px-2 py-0.5 rounded-md border border-sky-500/20">
                  Clean Link
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Add this link behind your website’s &quot;Book Service&quot; button, your Google Business Profile, or emails:
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <input
                type="text"
                readOnly
                value={
                  typeof window !== 'undefined'
                    ? `${window.location.origin}/book/${user?.tenantSlug || 'vanguard-electric'}`
                    : `http://localhost:3000/book/${user?.tenantSlug || 'vanguard-electric'}`
                }
                className="w-full px-3.5 py-2.5 bg-surface border border-border rounded-xl text-xs text-sky-300 font-mono select-all focus:outline-none"
              />
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="shrink-0 text-xs font-bold gap-1.5 h-10 px-3.5"
                onClick={() => {
                  const url =
                    typeof window !== 'undefined'
                      ? `${window.location.origin}/book/${user?.tenantSlug || 'vanguard-electric'}`
                      : `http://localhost:3000/book/${user?.tenantSlug || 'vanguard-electric'}`;
                  navigator.clipboard.writeText(url);
                  setCopiedBookingUrl(true);
                  setTimeout(() => setCopiedBookingUrl(false), 2000);
                }}
              >
                {copiedBookingUrl ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy</span>
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Card B: Website Embed HTML Code */}
          <div className="p-5 rounded-2xl bg-surface-elevated/80 border border-border space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-white flex items-center gap-2">
                  <Code className="w-4 h-4 text-primary" />
                  Website Embed Button
                </span>
                <span className="text-xs text-indigo-400/90 font-mono font-semibold bg-primary/10 px-2 py-0.5 rounded-md border border-primary/20">
                  1-Line Snippet
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Copy and paste this HTML button code directly into your WordPress, Squarespace, or Wix website header or footer:
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <input
                type="text"
                readOnly
                value={`<a href="${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/book/${user?.tenantSlug || 'vanguard-electric'}" target="_blank" style="display:inline-block;background:#4F46E5;color:#fff;padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:bold;">Book Service Online →</a>`}
                className="w-full px-3.5 py-2.5 bg-surface border border-border rounded-xl text-xs text-slate-300 font-mono select-all focus:outline-none"
              />
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="shrink-0 text-xs font-bold gap-1.5 h-10 px-3.5"
                onClick={() => {
                  const code = `<a href="${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/book/${user?.tenantSlug || 'vanguard-electric'}" target="_blank" style="display:inline-block;background:#4F46E5;color:#fff;padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:bold;">Book Service Online →</a>`;
                  navigator.clipboard.writeText(code);
                  setCopiedEmbedCode(true);
                  setTimeout(() => setCopiedEmbedCode(false), 2000);
                }}
              >
                {copiedEmbedCode ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy</span>
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Card C: Equipment QR Code & Printable Sticker */}
          <div className="p-5 rounded-2xl bg-surface-elevated/80 border border-border space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-white flex items-center gap-2">
                  <QrCode className="w-4 h-4 text-emerald-400" />
                  Equipment QR Code Sticker
                </span>
                <span className="text-xs text-emerald-400 font-mono font-semibold bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                  Physical Tag
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Affix to AC units, furnaces, and breaker boxes so homeowners can scan with their phone camera to book 24/7.
              </p>
            </div>

            <div className="flex items-center gap-4 p-3 rounded-2xl bg-surface border border-border my-1">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt="Booking QR Code"
                  className="w-16 h-16 rounded-xl bg-white p-1.5 border border-border/60 shrink-0 shadow-sm"
                />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-surface-card border border-border flex items-center justify-center shrink-0">
                  <QrCode className="w-6 h-6 text-muted animate-pulse" />
                </div>
              )}
              <div className="text-xs space-y-1 min-w-0">
                <p className="font-bold text-white truncate text-sm">
                  {user?.tenantName || 'Vanguard Electric & Power'}
                </p>
                <p className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                  <span>●</span> Scan to Book Service
                </p>
                <p className="text-xs font-mono text-slate-400 truncate">
                  /book/{user?.tenantSlug || 'vanguard-electric'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleDownloadQrPng}
                className="gap-2 text-xs font-semibold h-10"
              >
                <Download className="w-4 h-4 text-sky-400" />
                <span>PNG File</span>
              </Button>

              <Button
                type="button"
                size="sm"
                variant="primary"
                onClick={() => setIsStickerModalOpen(true)}
                className="gap-2 text-xs font-bold h-10 shadow-md shadow-primary-glow"
              >
                <Printer className="w-4 h-4" />
                <span>Print Sticker</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Team Management Section */}
      <div className="p-6 sm:p-7 rounded-3xl bg-surface/90 border border-border space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-primary/10 border border-primary/25 flex items-center justify-center text-primary shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>Operational Workforce</span>
                {isSuperAdminOrOwner && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/20 text-accent border border-primary/30">
                    {team.length} Members
                  </span>
                )}
              </h2>
              <p className="text-sm text-slate-400 mt-0.5">
                Add managers, dispatchers, sales estimators, and field technicians with 24-hour onboarding links.
              </p>
            </div>
          </div>

          {isSuperAdminOrOwner && (
            <Button
              onClick={() => setIsInviteModalOpen(true)}
              className="gap-2 text-xs font-bold h-10 px-4 shadow-md shadow-primary-glow shrink-0"
            >
              <UserPlus className="w-4 h-4" />
              <span>Invite Staff Member</span>
            </Button>
          )}
        </div>

        {!isSuperAdminOrOwner ? (
          <div className="p-8 rounded-2xl bg-surface-elevated/40 border border-border text-center space-y-2">
            <Lock className="w-6 h-6 text-muted mx-auto" />
            <p className="text-sm font-semibold text-white">Administrative Access Required</p>
            <p className="text-xs text-muted max-w-md mx-auto leading-relaxed">
              Staff roster records and onboarding controls are restricted to <strong>Business Owners</strong> and <strong>Office Managers</strong>. Please contact your company administrator to manage team members.
            </p>
          </div>
        ) : isLoading ? (
          <div className="py-10 flex flex-col items-center justify-center text-muted gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <span className="text-xs">Loading team roster...</span>
          </div>
        ) : team.length === 0 ? (
          <div className="py-8 text-center text-muted">
            <p className="text-sm">No team members added yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-border/60">
            {team.map((member) => (
              <div
                key={member.id}
                className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs hover:bg-surface-elevated/30 px-3 -mx-3 rounded-2xl transition-colors"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-primary to-ai border border-border flex items-center justify-center text-white font-bold text-sm shadow-md shrink-0">
                    {member.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2.5">
                      <span className="font-bold text-white text-sm">{member.name}</span>
                      <Badge variant={getRoleBadgeVariant(member.role.slug)}>
                        {member.role.name}
                      </Badge>
                    </div>
                    <span className="text-xs font-mono text-slate-400 block">{member.email}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs">
                  {member.isInviteAccepted === false ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Invite Pending</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Active</span>
                    </span>
                  )}

                  <span className="text-slate-300 font-mono text-xs bg-surface-elevated px-3 py-1 rounded-xl border border-border hidden sm:inline">
                    Limit: ${Number(member.role.approvalLimit).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal 1: Invite Team Member */}
      <Modal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        title="Invite New Team Member"
        description="Generates a single-use 24-hour setup link for your new staff member."
        maxWidth="md"
      >
        <form onSubmit={handleInviteStaff} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-danger/10 border border-danger/30 text-red-400 text-xs">
              {formError}
            </div>
          )}

          <Input
            label="Full Name"
            required
            placeholder="e.g. Rachel Adams"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <Input
            label="Work Email"
            type="email"
            required
            placeholder="rachel@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Input
            label="Phone Number (Optional)"
            placeholder="(702) 555-0199"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1.5">
              Assigned Operational Role
            </label>
            <select
              value={roleId}
              onChange={(e) => setRoleId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-surface border border-border rounded-xl text-sm text-slate-100 focus:outline-none focus:border-primary"
            >
              {roles
                .filter((r) => r.slug !== 'owner') // Owners don't invite second owners
                .map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <Button type="button" variant="ghost" onClick={() => setIsInviteModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Generate Invitation Link
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal 2: Staff Invitation Link Created */}
      <Modal
        isOpen={!!createdInvite}
        onClose={() => setCreatedInvite(null)}
        title="Invitation Ready"
        description="Share this link with your staff member to let them set their password."
        maxWidth="lg"
      >
        {createdInvite && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-white">
                  Invitation issued for {createdInvite.name}!
                </h4>
                <p className="text-xs text-slate-300 mt-0.5">
                  Role: <strong>{createdInvite.roleName}</strong> · Email: {createdInvite.email}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>One-Time Set Password Link (Valid 24 Hours)</span>
                </span>
              </div>

              <div className="p-3 bg-surface border border-border rounded-xl flex items-center justify-between gap-3 font-mono text-xs text-accent break-all">
                <span className="truncate">{createdInvite.inviteLink}</span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleCopyLink(createdInvite.inviteLink)}
                  className="shrink-0 gap-1.5 text-xs h-8"
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Link</span>
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
              <Button onClick={() => setCreatedInvite(null)}>
                Done
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Printable Equipment QR Sticker Modal */}
      <Modal
        isOpen={isStickerModalOpen}
        onClose={() => setIsStickerModalOpen(false)}
        title="Printable Equipment Service Tag"
        description="Affix these adhesive vinyl tags to AC condensers, furnaces, water heaters, and breaker panels."
        maxWidth="lg"
      >
        <div className="space-y-5">
          {/* Sticker Preview Card */}
          <div className="p-6 rounded-2xl bg-white text-slate-900 border-4 border-slate-900 shadow-xl max-w-sm mx-auto text-center space-y-3">
            <div>
              <span className="inline-block px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider bg-blue-100 text-blue-700 border border-blue-200">
                Official Equipment Tag
              </span>
              <h3 className="text-base font-black uppercase tracking-tight text-slate-900 mt-1">
                {user?.tenantName || 'Service Contractor'}
              </h3>
              <p className="text-[11px] text-slate-600 font-semibold">
                24/7 Fast Repair & Emergency Dispatch
              </p>
            </div>

            {qrDataUrl && (
              <div className="inline-block p-2 bg-white rounded-xl border-2 border-slate-200 shadow-inner">
                <img
                  src={qrDataUrl}
                  alt="Booking QR Code"
                  className="w-36 h-36 mx-auto"
                />
              </div>
            )}

            <div>
              <p className="text-xs font-extrabold tracking-wide text-slate-900">
                SCAN WITH CAMERA TO BOOK REPAIR
              </p>
              <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                {typeof window !== 'undefined' ? `${window.location.origin}/book/${user?.tenantSlug || 'desert-air'}` : `http://localhost:3000/book/${user?.tenantSlug || 'desert-air'}`}
              </p>
            </div>

            <div className="pt-2 border-t border-slate-200 text-[9px] font-bold text-slate-400 uppercase tracking-wider">
              Licensed · Insured · Professional Trade Contractor
            </div>
          </div>

          {/* Sticker Info Note */}
          <div className="p-3.5 rounded-xl bg-surface border border-border text-xs text-muted flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <p>
              <strong>Technician Tip:</strong> When installing or servicing equipment, slap this 3&quot;x3&quot; sticker on the unit. When the unit fails or needs maintenance years later, the homeowner scans the QR code, instantly routing the work order back to your company!
            </p>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-border">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleDownloadQrPng}
              className="gap-1.5 text-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PNG</span>
            </Button>

            <div className="flex items-center gap-2">
              <Button type="button" variant="ghost" onClick={() => setIsStickerModalOpen(false)}>
                Close
              </Button>
              <Button
                type="button"
                variant="primary"
                onClick={handlePrintSticker}
                className="gap-1.5 text-xs font-bold shadow-md shadow-primary-glow"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Sticker (4x3)</span>
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
