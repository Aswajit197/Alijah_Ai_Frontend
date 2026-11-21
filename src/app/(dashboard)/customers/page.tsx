'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users,
  UserPlus,
  Search,
  Building2,
  MapPin,
  Phone,
  Mail,
  Key,
  ShieldCheck,
  AlertCircle,
  Wrench,
  Plus,
  ExternalLink,
  X,
  ChevronRight,
  CheckCircle2,
  Trash2,
  Calendar,
  Layers,
  Sparkles,
  ShieldAlert,
  Clock,
  User,
  Flame,
  Pencil,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Modal } from '@/components/ui/modal';
import { apiRequest } from '@/lib/api';

interface Equipment {
  id: string;
  name: string;
  type: string;
  brand: string;
  modelNumber?: string;
  serialNumber?: string;
  installYear?: number;
  locationOnSite?: string;
  warrantyStatus: string;
  notes?: string;
}

interface Customer {
  id: string;
  name: string;
  customerType: 'RESIDENTIAL' | 'COMMERCIAL';
  companyName?: string;
  phone: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  gateCode?: string;
  accessNotes?: string;
  equipments: Equipment[];
  _count?: {
    jobs: number;
    equipments: number;
  };
  jobs?: any[];
  createdAt: string;
}

export default function CustomersPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'COMMERCIAL' | 'RESIDENTIAL'>('ALL');
  const [error, setError] = useState<string | null>(null);

  // Drawer & Modal states
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAddEquipmentModalOpen, setIsAddEquipmentModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Form states - Edit Customer
  const [editName, setEditName] = useState('');
  const [editType, setEditType] = useState<'RESIDENTIAL' | 'COMMERCIAL'>('RESIDENTIAL');
  const [editCompany, setEditCompany] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editCity, setEditCity] = useState('');
  const [editState, setEditState] = useState('');
  const [editZip, setEditZip] = useState('');
  const [editGate, setEditGate] = useState('');
  const [editAccessNotes, setEditAccessNotes] = useState('');

  // Form states - New Customer
  const [custType, setCustType] = useState<'RESIDENTIAL' | 'COMMERCIAL'>('RESIDENTIAL');
  const [custName, setCustName] = useState('');
  const [custCompany, setCustCompany] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [custEmail, setCustEmail] = useState('');
  const [custAddress, setCustAddress] = useState('');
  const [custCity, setCustCity] = useState('');
  const [custState, setCustState] = useState('');
  const [custZip, setCustZip] = useState('');
  const [custGate, setCustGate] = useState('');
  const [custAccessNotes, setCustAccessNotes] = useState('');

  // Initial Equipment fields
  const [includeEquip, setIncludeEquip] = useState(true);
  const [equipName, setEquipName] = useState('');
  const [equipBrand, setEquipBrand] = useState('Carrier');
  const [equipType, setEquipType] = useState('HVAC');
  const [equipModel, setEquipModel] = useState('');
  const [equipSerial, setEquipSerial] = useState('');
  const [equipYear, setEquipYear] = useState<number>(new Date().getFullYear());
  const [equipLocation, setEquipLocation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch customers
  const loadCustomers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams();
      if (search.trim()) queryParams.set('search', search.trim());
      if (typeFilter !== 'ALL') queryParams.set('type', typeFilter);

      const url = `/customers${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const data = await apiRequest<Customer[]>(url);
      setCustomers(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load customers');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadCustomers();
    }, 250);
    return () => clearTimeout(timer);
  }, [search, typeFilter]);

  // Load detailed single customer for drawer
  const openCustomerDetail = async (c: Customer) => {
    setSelectedCustomer(c);
    setIsDetailLoading(true);
    try {
      const detailed = await apiRequest<Customer>(`/customers/${c.id}`);
      setSelectedCustomer(detailed);
    } catch (err: any) {
      console.error('Failed to load customer details:', err);
    } finally {
      setIsDetailLoading(false);
    }
  };

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const payload: any = {
        name: custName,
        customerType: custType,
        companyName: custType === 'COMMERCIAL' ? custCompany : undefined,
        phone: custPhone,
        email: custEmail || undefined,
        address: custAddress,
        city: custCity,
        state: custState,
        zipCode: custZip,
        gateCode: custGate || undefined,
        accessNotes: custAccessNotes || undefined,
      };

      if (includeEquip && equipName && equipBrand) {
        payload.initialEquipment = {
          name: equipName,
          brand: equipBrand,
          type: equipType,
          modelNumber: equipModel || undefined,
          serialNumber: equipSerial || undefined,
          installYear: equipYear ? Number(equipYear) : undefined,
          locationOnSite: equipLocation || undefined,
          warrantyStatus: 'UNDER_WARRANTY',
        };
      }

      await apiRequest('/customers', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      setIsAddModalOpen(false);
      resetCustomerForm();
      loadCustomers();
    } catch (err: any) {
      alert(`Error creating customer: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddEquipment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;
    setIsSubmitting(true);

    try {
      await apiRequest(`/customers/${selectedCustomer.id}/equipment`, {
        method: 'POST',
        body: JSON.stringify({
          name: equipName,
          brand: equipBrand,
          type: equipType,
          modelNumber: equipModel || undefined,
          serialNumber: equipSerial || undefined,
          installYear: equipYear ? Number(equipYear) : undefined,
          locationOnSite: equipLocation || undefined,
          warrantyStatus: 'UNDER_WARRANTY',
        }),
      });

      setIsAddEquipmentModalOpen(false);
      resetEquipmentForm();
      openCustomerDetail(selectedCustomer);
      loadCustomers();
    } catch (err: any) {
      alert(`Error adding equipment: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetCustomerForm = () => {
    setCustName('');
    setCustCompany('');
    setCustPhone('');
    setCustEmail('');
    setCustAddress('');
    setCustCity('');
    setCustState('');
    setCustZip('');
    setCustGate('');
    setCustAccessNotes('');
    resetEquipmentForm();
  };

  const resetEquipmentForm = () => {
    setEquipName('');
    setEquipBrand('Carrier');
    setEquipType('HVAC');
    setEquipModel('');
    setEquipSerial('');
    setEquipYear(new Date().getFullYear());
    setEquipLocation('');
  };

  const openEditCustomerModal = (c: Customer) => {
    setEditName(c.name || '');
    setEditType(c.customerType || 'RESIDENTIAL');
    setEditCompany(c.companyName || '');
    setEditPhone(c.phone || '');
    setEditEmail(c.email || '');
    setEditAddress(c.address || '');
    setEditCity(c.city || '');
    setEditState(c.state || '');
    setEditZip(c.zipCode || '');
    setEditGate(c.gateCode || '');
    setEditAccessNotes(c.accessNotes || '');
    setIsEditModalOpen(true);
  };

  const handleUpdateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;
    setIsSubmitting(true);

    try {
      const updated = await apiRequest<Customer>(`/customers/${selectedCustomer.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          name: editName.trim(),
          customerType: editType,
          companyName: editType === 'COMMERCIAL' ? editCompany.trim() || undefined : undefined,
          phone: editPhone.trim(),
          email: editEmail.trim() || undefined,
          address: editAddress.trim() || undefined,
          city: editCity.trim() || undefined,
          state: editState.trim() || undefined,
          zipCode: editZip.trim() || undefined,
          gateCode: editGate.trim() || undefined,
          accessNotes: editAccessNotes.trim() || undefined,
        }),
      });

      setIsEditModalOpen(false);
      setSelectedCustomer((prev) => (prev ? { ...prev, ...updated } : updated));
      await loadCustomers();
    } catch (err: any) {
      alert(`Failed to update customer: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Counts
  const commercialCount = customers.filter((c) => c.customerType === 'COMMERCIAL').length;
  const residentialCount = customers.filter((c) => c.customerType === 'RESIDENTIAL').length;

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
            <Users className="w-6 h-6 text-primary" />
            <span>Customer & Property CRM</span>
          </h1>
          <p className="text-xs text-muted mt-1">
            Directory of commercial accounts, residential homeowners, installed equipment, and access codes.
          </p>
        </div>

        <Button
          onClick={() => {
            resetCustomerForm();
            setIsAddModalOpen(true);
          }}
          className="shadow-lg shadow-primary-glow"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Add Customer
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface/80 p-3 rounded-2xl border border-border">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, company, phone, address, or serial #..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-surface-elevated/70 border border-border rounded-xl text-xs text-slate-100 placeholder:text-muted focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-surface-elevated/50 rounded-xl border border-border/60">
          <button
            onClick={() => setTypeFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              typeFilter === 'ALL'
                ? 'bg-primary text-white shadow-sm'
                : 'text-muted hover:text-white'
            }`}
          >
            All ({customers.length})
          </button>
          <button
            onClick={() => setTypeFilter('COMMERCIAL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              typeFilter === 'COMMERCIAL'
                ? 'bg-primary text-white shadow-sm'
                : 'text-muted hover:text-white'
            }`}
          >
            Commercial ({commercialCount})
          </button>
          <button
            onClick={() => setTypeFilter('RESIDENTIAL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              typeFilter === 'RESIDENTIAL'
                ? 'bg-primary text-white shadow-sm'
                : 'text-muted hover:text-white'
            }`}
          >
            Residential ({residentialCount})
          </button>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 bg-danger/10 border border-danger/30 rounded-2xl flex items-center gap-3 text-red-400 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Customers List */}
      {isLoading ? (
        <div className="py-20 text-center text-muted text-xs">
          <div className="w-8 h-8 rounded-xl bg-primary/20 border border-primary/40 animate-pulse mx-auto mb-3" />
          Loading customers & equipment vaults...
        </div>
      ) : customers.length === 0 ? (
        <div className="py-16 rounded-3xl bg-surface/50 border border-border text-center max-w-md mx-auto p-8 space-y-3">
          <Building2 className="w-10 h-10 text-muted mx-auto" />
          <h3 className="text-sm font-bold text-white">No customers found</h3>
          <p className="text-xs text-muted">
            {search ? 'Try clearing your search query' : 'Get started by registering your first contractor account.'}
          </p>
          <Button size="sm" onClick={() => setIsAddModalOpen(true)} className="mt-2">
            <UserPlus className="w-3.5 h-3.5 mr-1.5" />
            Add Customer
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {customers.map((c) => (
            <Card
              key={c.id}
              onClick={() => openCustomerDetail(c)}
              className="cursor-pointer hover:border-border-hover transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Header row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="font-bold text-white text-sm truncate group-hover:text-primary transition-colors">
                      {c.name}
                    </h3>
                    {c.companyName && (
                      <p className="text-xs font-semibold text-ai truncate mt-0.5 flex items-center gap-1">
                        <Building2 className="w-3 h-3 shrink-0" />
                        <span>{c.companyName}</span>
                      </p>
                    )}
                  </div>
                  <Badge variant={c.customerType === 'COMMERCIAL' ? 'primary' : 'neutral'}>
                    {c.customerType}
                  </Badge>
                </div>

                {/* Contact & Location info */}
                <div className="mt-3 space-y-1.5 text-xs text-muted">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-subtle shrink-0" />
                    <span className="truncate">{c.phone}</span>
                  </div>

                  {c.address && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-subtle shrink-0" />
                      <span className="truncate">
                        {c.address}, {c.city || ''} {c.state || ''}
                      </span>
                    </div>
                  )}

                  {c.gateCode && (
                    <div className="flex items-center gap-2 text-[11px] text-amber-400/90 font-mono">
                      <Key className="w-3 h-3 shrink-0 text-amber-400" />
                      <span className="truncate">Access: {c.gateCode}</span>
                    </div>
                  )}
                </div>

                {/* Equipment chips */}
                {c.equipments && c.equipments.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-border/60">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-subtle block mb-1.5">
                      Installed Units ({c.equipments.length})
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {c.equipments.slice(0, 2).map((eq) => (
                        <span
                          key={eq.id}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-surface-elevated border border-border text-[11px] text-slate-200"
                        >
                          <Wrench className="w-2.5 h-2.5 text-primary" />
                          <span className="truncate max-w-[140px] font-medium">{eq.brand} {eq.name}</span>
                        </span>
                      ))}
                      {c.equipments.length > 2 && (
                        <span className="px-1.5 py-0.5 text-[10px] text-subtle self-center">
                          +{c.equipments.length - 2} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Card Footer */}
              <div className="flex items-center justify-between pt-3 mt-4 border-t border-border/60 text-xs text-subtle">
                <span>{c._count?.jobs || 0} Work Orders</span>
                <span className="text-primary group-hover:translate-x-0.5 transition-transform flex items-center font-medium">
                  View Vault <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Slide-over Customer Profile Drawer */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
            onClick={() => setSelectedCustomer(null)}
          />

          {/* Drawer Panel */}
          <div className="relative w-full max-w-xl lg:max-w-2xl bg-surface-elevated border-l border-border h-full shadow-2xl z-10 flex flex-col overflow-hidden animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="p-6 border-b border-border flex items-start justify-between bg-surface/60">
              <div className="min-w-0 pr-4">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant={selectedCustomer.customerType === 'COMMERCIAL' ? 'primary' : 'neutral'}>
                    {selectedCustomer.customerType}
                  </Badge>
                  {selectedCustomer.companyName && (
                    <span className="text-xs text-ai font-semibold truncate">
                      {selectedCustomer.companyName}
                    </span>
                  )}
                </div>
                <h2 className="text-xl font-bold text-white truncate">{selectedCustomer.name}</h2>
                <p className="text-xs text-muted mt-0.5 flex items-center gap-2">
                  <span>{selectedCustomer.phone}</span>
                  {selectedCustomer.email && (
                    <>
                      <span>·</span>
                      <span className="truncate">{selectedCustomer.email}</span>
                    </>
                  )}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openEditCustomerModal(selectedCustomer)}
                  className="gap-1.5 text-xs h-8 border-border hover:border-primary/50 text-slate-200"
                >
                  <Pencil className="w-3.5 h-3.5 text-primary" />
                  <span>Edit Profile</span>
                </Button>
                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="p-2 rounded-xl text-muted hover:text-white hover:bg-surface border border-transparent hover:border-border transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Drawer Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Service Location Card */}
              <div className="p-4 rounded-2xl bg-surface border border-border space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-primary" />
                    Service Location
                  </h4>
                  {selectedCustomer.address && (
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        `${selectedCustomer.address}, ${selectedCustomer.city || ''} ${selectedCustomer.state || ''} ${selectedCustomer.zipCode || ''}`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-accent hover:underline flex items-center gap-1 font-medium"
                    >
                      <span>Open in Maps</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>

                <p className="text-sm font-medium text-white">
                  {selectedCustomer.address || 'No address on file'}
                  {selectedCustomer.city && `, ${selectedCustomer.city}`}
                  {selectedCustomer.state && ` ${selectedCustomer.state}`}
                  {selectedCustomer.zipCode && ` ${selectedCustomer.zipCode}`}
                </p>

                {selectedCustomer.gateCode && (
                  <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-2.5 text-xs text-amber-300">
                    <Key className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                    <div>
                      <p className="font-bold">Access Gate / Lockbox Code</p>
                      <p className="text-slate-200 mt-0.5">{selectedCustomer.gateCode}</p>
                    </div>
                  </div>
                )}

                {selectedCustomer.accessNotes && (
                  <div className="p-2.5 rounded-xl bg-surface-elevated border border-border/80 text-xs text-muted">
                    <p className="text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-0.5">
                      On-Site Dispatch Instructions
                    </p>
                    <p className="text-slate-300 leading-relaxed">{selectedCustomer.accessNotes}</p>
                  </div>
                )}
              </div>

              {/* Equipment Vault Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                      <Wrench className="w-3.5 h-3.5 text-ai" />
                      Equipment Vault ({selectedCustomer.equipments?.length || 0})
                    </h4>
                    <p className="text-[11px] text-muted">Registered HVAC, plumbing, and electrical units.</p>
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      resetEquipmentForm();
                      setIsAddEquipmentModalOpen(true);
                    }}
                    className="text-xs h-8"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" />
                    Add Unit
                  </Button>
                </div>

                {selectedCustomer.equipments && selectedCustomer.equipments.length > 0 ? (
                  <div className="space-y-3">
                    {selectedCustomer.equipments.map((eq) => (
                      <div
                        key={eq.id}
                        className="p-4 rounded-2xl bg-surface border border-border hover:border-border-hover transition-colors space-y-2.5"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white text-sm">{eq.name}</span>
                              <Badge variant={eq.warrantyStatus === 'UNDER_WARRANTY' ? 'success' : 'neutral'}>
                                {eq.warrantyStatus === 'UNDER_WARRANTY' ? 'Under Warranty' : 'Warranty Expired'}
                              </Badge>
                            </div>
                            <p className="text-xs text-ai font-medium mt-0.5">
                              {eq.brand} · {eq.type}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-xs pt-2.5 border-t border-border/60">
                          <div className="p-2.5 rounded-xl bg-surface-elevated/60 border border-border/40">
                            <span className="text-[10px] text-muted block uppercase font-semibold">Model Specification</span>
                            <span className="font-mono text-slate-200 font-medium">
                              {eq.modelNumber || 'Standard Unit'}
                            </span>
                          </div>
                          <div className="p-2.5 rounded-xl bg-surface-elevated/60 border border-border/40">
                            <span className="text-[10px] text-muted block uppercase font-semibold">Serial Number</span>
                            <span className="font-mono text-accent font-semibold">
                              {eq.serialNumber || 'Pending Site Tag'}
                            </span>
                          </div>
                        </div>

                        {eq.locationOnSite && (
                          <div className="text-xs text-muted flex items-center gap-1.5 pt-1">
                            <span className="text-[10px] text-subtle uppercase">Physical Location:</span>
                            <span className="text-slate-300 font-medium">{eq.locationOnSite}</span>
                          </div>
                        )}

                        {eq.notes && (
                          <p className="text-xs text-subtle italic bg-surface-elevated/50 p-2 rounded-lg border border-border/40">
                            "{eq.notes}"
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 rounded-2xl bg-surface/50 border border-dashed border-border text-center space-y-2">
                    <p className="text-xs text-muted">No equipment registered for this property yet.</p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setIsAddEquipmentModalOpen(true)}
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" />
                      Add Equipment Unit
                    </Button>
                  </div>
                )}
              </div>

              {/* Work Order History Section */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-primary" />
                  Work Order History ({selectedCustomer.jobs?.length || 0})
                </h4>

                {selectedCustomer.jobs && selectedCustomer.jobs.length > 0 ? (
                  <div className="space-y-3">
                    {selectedCustomer.jobs.map((j: any) => {
                      const startTime = j.scheduledStart
                        ? new Date(j.scheduledStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : null;
                      const endTime = j.scheduledEnd
                        ? new Date(j.scheduledEnd).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : null;

                      const getJobStatusBadge = (status: string) => {
                        switch (status) {
                          case 'UNSCHEDULED':
                            return (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                                Unscheduled
                              </span>
                            );
                          case 'SCHEDULED':
                            return (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30">
                                Scheduled
                              </span>
                            );
                          case 'DISPATCHED':
                            return (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/15 text-sky-400 border border-sky-500/30">
                                Dispatched
                              </span>
                            );
                          case 'EN_ROUTE':
                            return (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                                En Route
                              </span>
                            );
                          case 'ON_SITE':
                            return (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/15 text-purple-300 border border-purple-500/30">
                                On Site
                              </span>
                            );
                          case 'COMPLETED':
                            return (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                                Completed
                              </span>
                            );
                          default:
                            return (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
                                {status}
                              </span>
                            );
                        }
                      };

                      const getJobPriorityBadge = (priority: string) => {
                        switch (priority) {
                          case 'EMERGENCY':
                            return (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center gap-1">
                                <Flame className="w-2.5 h-2.5" /> Emergency
                              </span>
                            );
                          case 'HIGH':
                            return (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                                High Priority
                              </span>
                            );
                          case 'NORMAL':
                          default:
                            return (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                                Normal
                              </span>
                            );
                        }
                      };

                      return (
                        <div
                          key={j.id}
                          className="p-4 rounded-2xl bg-surface border border-border hover:border-slate-600 transition-all space-y-3 shadow-md"
                        >
                          {/* Card Top: Job #, Priority, Status & Live Tracker Link */}
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-bold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-md border border-sky-500/20">
                                {j.jobNumber || 'WORK ORDER'}
                              </span>
                              {getJobPriorityBadge(j.priority)}
                              {getJobStatusBadge(j.status)}
                            </div>

                            <a
                              href={`/track/${j.id}`}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2.5 py-1 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border border-sky-500/30 transition-colors flex items-center gap-1.5 text-xs font-semibold"
                              title="Open Customer Live Tracking Screen"
                            >
                              <ExternalLink className="w-3.5 h-3.5 text-sky-400" />
                              <span>Live Tracker</span>
                            </a>
                          </div>

                          {/* Work Order Title */}
                          <h5 className="font-bold text-white text-sm leading-snug">
                            {j.title}
                          </h5>

                          {/* Full Reported Symptoms / Request Description (Fully visible, No Truncation!) */}
                          {j.reportedIssue && (
                            <div className="p-3.5 rounded-xl bg-surface-elevated/90 border border-border/80 text-xs text-slate-200 leading-relaxed space-y-1">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-muted block">
                                Reported Symptoms & Issue Details:
                              </span>
                              <p className="whitespace-pre-wrap font-normal text-slate-100">
                                {j.reportedIssue}
                              </p>
                            </div>
                          )}

                          {/* Details Metadata Grid */}
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs pt-1 border-t border-border/60">
                            <div>
                              <span className="text-[10px] text-muted block uppercase">Logged Date</span>
                              <span className="text-slate-300 font-medium">
                                {new Date(j.createdAt).toLocaleDateString()}
                              </span>
                            </div>

                            <div>
                              <span className="text-[10px] text-muted block uppercase">Arrival Window</span>
                              <span className="text-slate-300 font-medium truncate block">
                                {startTime && endTime ? `${startTime} – ${endTime}` : 'Triage Queue'}
                              </span>
                            </div>

                            <div className="col-span-2 sm:col-span-1">
                              <span className="text-[10px] text-muted block uppercase">Assigned Tech</span>
                              <span className="text-slate-300 font-medium flex items-center gap-1">
                                <User className="w-3 h-3 text-primary shrink-0" />
                                <span className="truncate">{j.technician?.name || 'Unassigned'}</span>
                              </span>
                            </div>
                          </div>

                          {/* Technician Field Diagnostic Notes (if logged) */}
                          {j.notes && (
                            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-200 flex items-start gap-2.5">
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                              <div className="space-y-0.5 min-w-0">
                                <span className="text-[10px] font-bold uppercase text-emerald-400 block">
                                  Technician Field Resolution Notes:
                                </span>
                                <p className="italic leading-relaxed text-slate-200">{j.notes}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-subtle italic">No past work orders logged for this client.</p>
                )}
              </div>
            </div>

            {/* Drawer Footer Actions */}
            <div className="p-4 border-t border-border bg-surface/80 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedCustomer(null)}
                >
                  Close
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openEditCustomerModal(selectedCustomer)}
                  className="gap-1.5 text-xs text-slate-200 border-border hover:border-primary/50"
                >
                  <Pencil className="w-3.5 h-3.5 text-primary" />
                  Edit Profile
                </Button>
              </div>

              <Button
                size="sm"
                className="bg-primary hover:bg-primary-hover shadow-lg shadow-primary-glow"
                onClick={() => router.push('/schedule')}
              >
                <Plus className="w-4 h-4 mr-1.5" />
                Book Work Order
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 1: Add New Customer */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Customer Profile"
        description="Register a residential homeowner or commercial client along with their installed units."
        maxWidth="xl"
      >
        <form onSubmit={handleCreateCustomer} className="space-y-5">
          {/* Customer Type Toggle */}
          <div className="flex items-center gap-2 p-1 bg-surface rounded-xl border border-border">
            <button
              type="button"
              onClick={() => setCustType('RESIDENTIAL')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                custType === 'RESIDENTIAL'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-muted hover:text-white'
              }`}
            >
              Residential Homeowner
            </button>
            <button
              type="button"
              onClick={() => setCustType('COMMERCIAL')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                custType === 'COMMERCIAL'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-muted hover:text-white'
              }`}
            >
              Commercial Account
            </button>
          </div>

          {/* Primary Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label={custType === 'COMMERCIAL' ? 'Primary Contact Name' : 'Customer Full Name'}
              required
              placeholder="e.g. Dr. Gregory Vance"
              value={custName}
              onChange={(e) => setCustName(e.target.value)}
            />

            {custType === 'COMMERCIAL' && (
              <Input
                label="Company / Facility Name"
                required
                placeholder="e.g. Henderson Medical Clinic"
                value={custCompany}
                onChange={(e) => setCustCompany(e.target.value)}
              />
            )}

            <Input
              label="Phone Number (SMS & Calls)"
              required
              placeholder="e.g. (702) 555-0144"
              value={custPhone}
              onChange={(e) => setCustPhone(e.target.value)}
            />

            <Input
              label="Email Address (Optional)"
              type="email"
              placeholder="e.g. contact@client.com"
              value={custEmail}
              onChange={(e) => setCustEmail(e.target.value)}
            />
          </div>

          {/* Service Location */}
          <div className="space-y-3 pt-2 border-t border-border/60">
            <h4 className="text-xs font-bold uppercase tracking-wider text-primary">
              Service Location & Property
            </h4>

            <Input
              label="Street Address"
              placeholder="e.g. 840 Sunridge Heights Pkwy"
              value={custAddress}
              onChange={(e) => setCustAddress(e.target.value)}
            />

            <div className="grid grid-cols-3 gap-3">
              <Input
                label="City"
                placeholder="Henderson"
                value={custCity}
                onChange={(e) => setCustCity(e.target.value)}
              />
              <Input
                label="State"
                placeholder="NV"
                value={custState}
                onChange={(e) => setCustState(e.target.value)}
              />
              <Input
                label="Zip Code"
                placeholder="89052"
                value={custZip}
                onChange={(e) => setCustZip(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Gate / Lockbox Code"
                placeholder="e.g. #3842 (Building C)"
                value={custGate}
                onChange={(e) => setCustGate(e.target.value)}
                helper="Visible to field technicians upon dispatch"
              />

              <Input
                label="Special Access Notes"
                placeholder="e.g. Roof hatch in Building C stairwell"
                value={custAccessNotes}
                onChange={(e) => setCustAccessNotes(e.target.value)}
              />
            </div>
          </div>

          {/* Initial Equipment Registration Accordion */}
          <div className="space-y-3 pt-2 border-t border-border/60">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-ai flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5" />
                Register Installed Unit (Optional)
              </h4>
              <label className="text-xs text-muted flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeEquip}
                  onChange={(e) => setIncludeEquip(e.target.checked)}
                  className="rounded border-border text-primary focus:ring-primary"
                />
                <span>Include initial equipment</span>
              </label>
            </div>

            {includeEquip && (
              <div className="p-4 rounded-2xl bg-surface border border-border space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    label="Equipment Name"
                    placeholder="e.g. Rooftop Packaged AC Unit 5-Ton"
                    value={equipName}
                    onChange={(e) => setEquipName(e.target.value)}
                  />

                  <Input
                    label="Brand / Manufacturer"
                    placeholder="e.g. Carrier, Trane, Lennox"
                    value={equipBrand}
                    onChange={(e) => setEquipBrand(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Input
                    label="Model Number"
                    placeholder="e.g. WeatherMaker 48TC"
                    value={equipModel}
                    onChange={(e) => setEquipModel(e.target.value)}
                  />

                  <Input
                    label="Serial Number"
                    placeholder="e.g. 2420U19284"
                    value={equipSerial}
                    onChange={(e) => setEquipSerial(e.target.value)}
                  />

                  <Input
                    label="Physical Location"
                    placeholder="e.g. Building C Rooftop"
                    value={equipLocation}
                    onChange={(e) => setEquipLocation(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <Button type="button" variant="ghost" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Save Customer & Equipment
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal 2: Add Extra Equipment to Existing Customer */}
      <Modal
        isOpen={isAddEquipmentModalOpen}
        onClose={() => setIsAddEquipmentModalOpen(false)}
        title={`Add Equipment Unit for ${selectedCustomer?.name}`}
        description="Register an additional HVAC, plumbing, or electrical unit to this property."
        maxWidth="lg"
      >
        <form onSubmit={handleAddEquipment} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Equipment Name"
              required
              placeholder="e.g. Commercial Tankless Water Heater"
              value={equipName}
              onChange={(e) => setEquipName(e.target.value)}
            />

            <Input
              label="Brand / Manufacturer"
              required
              placeholder="e.g. Rinnai, Carrier, Square D"
              value={equipBrand}
              onChange={(e) => setEquipBrand(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Model Number"
              placeholder="e.g. CU199iN"
              value={equipModel}
              onChange={(e) => setEquipModel(e.target.value)}
            />

            <Input
              label="Serial Number"
              placeholder="e.g. RIN-992104"
              value={equipSerial}
              onChange={(e) => setEquipSerial(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Physical Location on Site"
              placeholder="e.g. Building C - Utility Closet 102"
              value={equipLocation}
              onChange={(e) => setEquipLocation(e.target.value)}
            />

            <Input
              label="Installation Year"
              type="number"
              placeholder="2022"
              value={equipYear}
              onChange={(e) => setEquipYear(parseInt(e.target.value) || new Date().getFullYear())}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <Button type="button" variant="ghost" onClick={() => setIsAddEquipmentModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Save Equipment Unit
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal 3: Edit Customer Profile */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Edit Profile: ${selectedCustomer?.name || 'Customer'}`}
        description="Update customer contact details, address, gate code, or access notes if AI misspelled them."
        maxWidth="2xl"
      >
        <form onSubmit={handleUpdateCustomer} className="space-y-4">
          <div className="flex items-center gap-2 p-1 bg-surface rounded-xl border border-border w-fit">
            <button
              type="button"
              onClick={() => setEditType('RESIDENTIAL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                editType === 'RESIDENTIAL'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-muted hover:text-white'
              }`}
            >
              Residential Homeowner
            </button>
            <button
              type="button"
              onClick={() => setEditType('COMMERCIAL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                editType === 'COMMERCIAL'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-muted hover:text-white'
              }`}
            >
              Commercial Account
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Input
                label="Full Name *"
                placeholder="e.g. Jake Chan"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                required
              />
            </div>

            {editType === 'COMMERCIAL' ? (
              <div>
                <Input
                  label="Company Name"
                  placeholder="e.g. Chan Enterprises LLC"
                  value={editCompany}
                  onChange={(e) => setEditCompany(e.target.value)}
                />
              </div>
            ) : (
              <div>
                <Input
                  label="Phone Number *"
                  placeholder="e.g. +1 (500) 000-5421"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  required
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {editType === 'COMMERCIAL' && (
              <div>
                <Input
                  label="Phone Number *"
                  placeholder="e.g. +1 (500) 000-5421"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  required
                />
              </div>
            )}

            <div>
              <Input
                label="Email Address"
                type="email"
                placeholder="e.g. jake@example.com"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-3 pt-2 border-t border-border/60">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-primary" />
              Service Address & Location
            </h4>

            <div>
              <Input
                label="Street Address"
                placeholder="e.g. 482 Canyon Vista Dr"
                value={editAddress}
                onChange={(e) => setEditAddress(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <Input
                  label="City"
                  placeholder="Phoenix"
                  value={editCity}
                  onChange={(e) => setEditCity(e.target.value)}
                />
              </div>
              <div>
                <Input
                  label="State"
                  placeholder="AZ"
                  value={editState}
                  onChange={(e) => setEditState(e.target.value)}
                />
              </div>
              <div>
                <Input
                  label="ZIP"
                  placeholder="85004"
                  value={editZip}
                  onChange={(e) => setEditZip(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-border/60">
            <div>
              <Input
                label="Gate / Lockbox Code"
                placeholder="e.g. #3842 or Box 12"
                value={editGate}
                onChange={(e) => setEditGate(e.target.value)}
              />
            </div>

            <div>
              <Input
                label="Special Access Notes"
                placeholder="e.g. Dog in yard, ring side bell"
                value={editAccessNotes}
                onChange={(e) => setEditAccessNotes(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <Button type="button" variant="ghost" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting} className="bg-primary hover:bg-primary-hover shadow-lg shadow-primary-glow">
              <CheckCircle2 className="w-4 h-4 mr-1.5" />
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
