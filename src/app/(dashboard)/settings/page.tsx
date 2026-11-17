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
} from 'lucide-react';
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

  const loadTeamAndRoles = async () => {
    setIsLoading(true);
    try {
      const [usersData, rolesData] = await Promise.all([
        apiRequest<TeamMember[]>('/users'),
        apiRequest<PlatformRole[]>('/roles'),
      ]);
      setTeam(usersData);
      setRoles(rolesData);
      if (rolesData.length > 0 && !roleId) {
        // Default to office manager or first non-owner role
        const defaultRole = rolesData.find((r) => r.slug === 'office_manager') || rolesData[0];
        setRoleId(defaultRole.id);
      }
    } catch (err: any) {
      console.error('Failed to load team data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTeamAndRoles();
  }, []);

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
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
          <Settings className="w-6 h-6 text-primary" />
          <span>Company Settings & Staff</span>
        </h1>
        <p className="text-xs text-muted mt-1">
          Manage your organization parameters, operational workforce, and team onboarding.
        </p>
      </div>

      {/* Profile & Security Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Company Profile Card */}
        <div className="p-6 rounded-3xl bg-surface/90 border border-border space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-border">
            <Building2 className="w-5 h-5 text-primary" />
            <h2 className="text-sm font-bold text-white">Company Profile</h2>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-muted block text-[11px]">Organization Name</span>
              <span className="text-white font-semibold text-sm">
                {user?.tenantName || 'Desert Air HVAC & Plumbing'}
              </span>
            </div>

            <div>
              <span className="text-muted block text-[11px]">Tenant Identifier / Slug</span>
              <span className="text-accent font-mono bg-surface-elevated px-2 py-0.5 rounded border border-border">
                {user?.tenantSlug || 'desert-air'}
              </span>
            </div>

            <div>
              <span className="text-muted block text-[11px]">Primary Location</span>
              <span className="text-slate-300">Las Vegas & Henderson, NV</span>
            </div>
          </div>
        </div>

        {/* User Session Security */}
        <div className="p-6 rounded-3xl bg-surface/90 border border-border space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-border">
            <Shield className="w-5 h-5 text-emerald-400" />
            <h2 className="text-sm font-bold text-white">Security & Active Session</h2>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-muted block text-[11px]">Signed In As</span>
              <span className="text-white font-semibold">
                {user?.name} ({user?.email})
              </span>
            </div>

            <div>
              <span className="text-muted block text-[11px]">Assigned Role</span>
              <span className="text-emerald-400 font-semibold capitalize">{user?.role?.name}</span>
            </div>

            <div>
              <span className="text-muted block text-[11px]">Approval Limit</span>
              <span className="text-slate-300 font-mono">
                ${Number(user?.role?.approvalLimit || 0).toLocaleString()} USD
              </span>
            </div>

            <div className="pt-2 flex items-center gap-1.5 text-[11px] text-emerald-400">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Session secured with HTTP Cookie + JWT expiration guards</span>
            </div>
          </div>
        </div>
      </div>

      {/* Public Customer Booking & Website Integration */}
      <div className="p-6 rounded-3xl bg-surface/90 border border-border space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Public Customer Booking & Website Integration</h2>
              <p className="text-xs text-muted">
                Your company’s unique online booking portal. Homeowner requests submitted here route directly to your schedule.
              </p>
            </div>
          </div>

          <a
            href={`/book/${user?.tenantSlug || 'desert-air'}`}
            target="_blank"
            rel="noreferrer"
            className="px-3.5 py-1.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-primary-glow transition-all"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Open Live Portal</span>
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
          {/* Card A: Direct Clean URL */}
          <div className="p-4 rounded-2xl bg-surface-elevated/80 border border-border space-y-2.5 flex flex-col justify-between">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-sky-400" />
                  Dedicated Booking URL
                </span>
                <span className="text-[10px] text-muted font-mono">Clean Branded Path</span>
              </div>
              <p className="text-[11px] text-muted">
                Add this link behind your website’s &quot;Book Service&quot; button, your Google Business Profile, or emails:
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <input
                type="text"
                readOnly
                value={typeof window !== 'undefined' ? `${window.location.origin}/book/${user?.tenantSlug || 'desert-air'}` : `http://localhost:3000/book/${user?.tenantSlug || 'desert-air'}`}
                className="w-full px-3 py-2 bg-surface border border-border rounded-xl text-xs text-sky-300 font-mono select-all focus:outline-none truncate"
              />
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="shrink-0 text-xs gap-1.5 h-9"
                onClick={() => {
                  const url = typeof window !== 'undefined' ? `${window.location.origin}/book/${user?.tenantSlug || 'desert-air'}` : `http://localhost:3000/book/${user?.tenantSlug || 'desert-air'}`;
                  navigator.clipboard.writeText(url);
                  setCopiedBookingUrl(true);
                  setTimeout(() => setCopiedBookingUrl(false), 2000);
                }}
              >
                {copiedBookingUrl ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Card B: Website Embed HTML Code */}
          <div className="p-4 rounded-2xl bg-surface-elevated/80 border border-border space-y-2.5 flex flex-col justify-between">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Code className="w-3.5 h-3.5 text-primary" />
                  Website Embed Button
                </span>
                <span className="text-[10px] text-muted font-mono">1-Line Snippet</span>
              </div>
              <p className="text-[11px] text-muted">
                Copy and paste this HTML code directly into your WordPress, Squarespace, or Wix website header or footer:
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <input
                type="text"
                readOnly
                value={`<a href="${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/book/${user?.tenantSlug || 'desert-air'}" target="_blank" style="display:inline-block;background:#4F46E5;color:#fff;padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:bold;">Book Service Online →</a>`}
                className="w-full px-3 py-2 bg-surface border border-border rounded-xl text-xs text-slate-300 font-mono select-all focus:outline-none truncate"
              />
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="shrink-0 text-xs gap-1.5 h-9"
                onClick={() => {
                  const code = `<a href="${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/book/${user?.tenantSlug || 'desert-air'}" target="_blank" style="display:inline-block;background:#4F46E5;color:#fff;padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:bold;">Book Service Online →</a>`;
                  navigator.clipboard.writeText(code);
                  setCopiedEmbedCode(true);
                  setTimeout(() => setCopiedEmbedCode(false), 2000);
                }}
              >
                {copiedEmbedCode ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Card C: Equipment QR Code & Printable Sticker */}
          <div className="p-4 rounded-2xl bg-surface-elevated/80 border border-border space-y-2.5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <QrCode className="w-3.5 h-3.5 text-emerald-400" />
                  Equipment QR Code Sticker
                </span>
                <span className="text-[10px] text-emerald-400 font-mono bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                  Physical Tag
                </span>
              </div>
              <p className="text-[11px] text-muted">
                Affix to AC units, furnaces, and breaker boxes so homeowners can scan with their phone camera to book 24/7.
              </p>
            </div>

            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-surface border border-border my-1">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt="Booking QR Code"
                  className="w-14 h-14 rounded-lg bg-white p-1 border border-border/60 shrink-0"
                />
              ) : (
                <div className="w-14 h-14 rounded-lg bg-surface-card border border-border flex items-center justify-center shrink-0">
                  <QrCode className="w-5 h-5 text-muted animate-pulse" />
                </div>
              )}
              <div className="text-xs space-y-0.5 min-w-0">
                <p className="font-bold text-white truncate text-xs">{user?.tenantName || 'Service Company'}</p>
                <p className="text-[11px] text-emerald-400 font-medium">Scan to Book Service</p>
                <p className="text-[10px] font-mono text-muted truncate">/book/{user?.tenantSlug || 'desert-air'}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleDownloadQrPng}
                className="gap-1.5 text-xs h-9"
              >
                <Download className="w-3.5 h-3.5 text-sky-400" />
                <span>PNG</span>
              </Button>

              <Button
                type="button"
                size="sm"
                variant="primary"
                onClick={() => setIsStickerModalOpen(true)}
                className="gap-1.5 text-xs h-9 shadow-md shadow-primary-glow font-bold"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Sticker</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Team Management Section */}
      <div className="p-6 rounded-3xl bg-surface/90 border border-border space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              <span>Operational Workforce ({team.length})</span>
            </h2>
            <p className="text-xs text-muted mt-0.5">
              Add managers, dispatchers, sales estimators, and field technicians with 24-hour onboarding links.
            </p>
          </div>

          <Button onClick={() => setIsInviteModalOpen(true)} size="sm" className="gap-1.5 text-xs">
            <UserPlus className="w-3.5 h-3.5" />
            <span>Invite Staff Member</span>
          </Button>
        </div>

        {isLoading ? (
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
                className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-surface-elevated border border-border flex items-center justify-center text-slate-200 font-bold uppercase text-xs shrink-0">
                    {member.name.slice(0, 2)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white text-sm">{member.name}</span>
                      <Badge variant={getRoleBadgeVariant(member.role.slug)}>
                        {member.role.name}
                      </Badge>
                    </div>
                    <span className="text-muted font-mono">{member.email}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-[11px]">
                  {member.isInviteAccepted === false ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      <Clock className="w-3 h-3" />
                      <span>Invite Pending</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      <CheckCircle className="w-3 h-3" />
                      <span>Active</span>
                    </span>
                  )}

                  <span className="text-subtle font-mono hidden sm:inline">
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
