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
} from 'lucide-react';
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
    </div>
  );
}
