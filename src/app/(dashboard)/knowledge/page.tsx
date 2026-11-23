'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Badge } from '@/components/ui/badge';
import {
  BookOpen,
  Search,
  Plus,
  HelpCircle,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Check,
  X,
  Edit3,
  RefreshCw,
  Clock,
  ShieldCheck,
  Building,
  Wrench,
  DollarSign,
  Shield,
  MapPin,
  Flame,
  Award,
  CreditCard,
  FileText,
  MessageSquare,
  Share2,
  Filter,
} from 'lucide-react';

export type KnowledgeCategory =
  | 'Company'
  | 'Services'
  | 'Pricing'
  | 'Policies'
  | 'Service Area'
  | 'Emergency Rules'
  | 'Memberships'
  | 'Financing'
  | 'Warranty'
  | 'FAQs'
  | 'Scripts';

export interface UnansweredQuestion {
  id: string;
  question: string;
  callerContext: string;
  frequency: number;
  detectedAt: string;
}

export interface KnowledgeItem {
  id: string;
  title: string;
  content: string;
  category: KnowledgeCategory;
  source: 'Website' | 'Owner' | 'FSM pricebook' | 'Pricebook' | 'Uploaded Document';
  owner: string;
  lastUpdated: string;
  confidence: 'High' | 'Medium';
  status: 'Active' | 'Draft';
}

const INITIAL_UNANSWERED: UnansweredQuestion[] = [
  {
    id: 'uq-1',
    question: 'Do you service mini-splits?',
    callerContext: 'Caller in Scottsdale asked about Mitsubishi ductless mini-split maintenance.',
    frequency: 3,
    detectedAt: 'Today, 11:20 AM',
  },
  {
    id: 'uq-2',
    question: 'Do you install water softeners?',
    callerContext: 'Homeowner in Gilbert inquiring about whole-home salt-free water softener installation.',
    frequency: 2,
    detectedAt: 'Yesterday, 3:45 PM',
  },
];

const INITIAL_KNOWLEDGE: KnowledgeItem[] = [
  {
    id: 'kb-1',
    title: 'Who we are',
    content:
      'Desert Air HVAC & Vanguard Electric has proudly served the Phoenix metropolitan area since 2004 with licensed, background-checked, and bonded HVAC, plumbing, and electrical technicians.',
    category: 'Company',
    source: 'Website',
    owner: 'Michael Carter',
    lastUpdated: 'Thu, Oct 8',
    confidence: 'Medium',
    status: 'Active',
  },
  {
    id: 'kb-2',
    title: 'License numbers (ROC)',
    content:
      'Arizona Registrar of Contractors Dual Licenses: ROC 324911 (HVAC CR-39), ROC 324912 (Plumbing CR-37), ROC 324913 (Electrical CR-11). EPA 608 Universal Certified.',
    category: 'Company',
    source: 'Owner',
    owner: 'Michael Carter',
    lastUpdated: 'Mon, Oct 5',
    confidence: 'High',
    status: 'Active',
  },
  {
    id: 'kb-3',
    title: 'HVAC services',
    content:
      'AC and heat pump repair, gas furnace repair, 26-point seasonal precision tune-ups, replacement sizing consultations, ductwork inspection, Ecobee/Nest smart thermostats, and indoor air filtration.',
    category: 'Services',
    source: 'FSM pricebook',
    owner: 'Sarah Mitchell',
    lastUpdated: 'Fri, Oct 2',
    confidence: 'High',
    status: 'Active',
  },
  {
    id: 'kb-4',
    title: 'Plumbing services',
    content:
      'Water leak repair, main sewer lateral digital camera inspection, high-pressure hydrojetting, tank & tankless water heater replacements (Navien, Rheem), fixtures, and emergency drain clearing.',
    category: 'Services',
    source: 'FSM pricebook',
    owner: 'Sarah Mitchell',
    lastUpdated: 'Tue, Sep 29',
    confidence: 'High',
    status: 'Active',
  },
  {
    id: 'kb-5',
    title: 'Electrical services (expansion)',
    content:
      'Diagnostic safety assessments, circuit breakers and arc-fault/GFCI replacements, 200A service panel upgrades, whole-home surge protection, and Level 2 EV charger installations.',
    category: 'Services',
    source: 'FSM pricebook',
    owner: 'Sarah Mitchell',
    lastUpdated: 'Sat, Sep 26',
    confidence: 'High',
    status: 'Active',
  },
  {
    id: 'kb-6',
    title: 'Diagnostic fee',
    content:
      'Standard residential diagnostic visit is $129. Comfort Club members pay $89. We credit 50% of the diagnostic fee toward any repair exceeding $500 approved on the same day.',
    category: 'Pricing',
    source: 'FSM pricebook',
    owner: 'Michael Carter',
    lastUpdated: 'Wed, Sep 23',
    confidence: 'High',
    status: 'Active',
  },
  {
    id: 'kb-7',
    title: 'After-hours surcharge',
    content:
      'After-hours and weekend emergency dispatch adds a $60 fee ($189 total diagnostic). Comfort Club members receive 50% discount on after-hours surcharges.',
    category: 'Pricing',
    source: 'Owner',
    owner: 'Michael Carter',
    lastUpdated: 'Sun, Sep 20',
    confidence: 'High',
    status: 'Active',
  },
  {
    id: 'kb-8',
    title: 'Comfort Club Membership',
    content:
      '$19.99/month ($219/year) per system. Includes 2 precision seasonal tune-ups, 15% off all repair parts and labor, priority same-day dispatch queue, and reduced $89 diagnostic fees.',
    category: 'Memberships',
    source: 'FSM pricebook',
    owner: 'Sarah Mitchell',
    lastUpdated: 'Wed, Sep 16',
    confidence: 'High',
    status: 'Active',
  },
  {
    id: 'kb-9',
    title: 'Financing options',
    content:
      'Partnered with Synchrony Financial and GreenSky to offer 0% APR for 18 months on approved credit for installations > $4,500. Low monthly payment terms up to 84 months starting at $89/mo.',
    category: 'Financing',
    source: 'Website',
    owner: 'Michael Carter',
    lastUpdated: 'Fri, Sep 11',
    confidence: 'High',
    status: 'Active',
  },
  {
    id: 'kb-10',
    title: '10-Year Equipment Warranty Policy',
    content:
      'All new Carrier & Trane HVAC system installations include 10-year factory limited parts warranty and 2 full years of labor warranty covered by Vanguard at zero out-of-pocket cost. 1-year warranty on repair parts.',
    category: 'Warranty',
    source: 'Owner',
    owner: 'Michael Carter',
    lastUpdated: 'Tue, Sep 8',
    confidence: 'High',
    status: 'Active',
  },
  {
    id: 'kb-11',
    title: 'Service Area coverage',
    content:
      'Phoenix, Scottsdale, Paradise Valley, Tempe, Mesa, Chandler, Gilbert, Glendale, and Peoria. Out-of-zone areas (Anthem, Cave Creek, Fountain Hills) carry a $45 travel surcharge.',
    category: 'Service Area',
    source: 'Website',
    owner: 'Sarah Mitchell',
    lastUpdated: 'Sun, Sep 6',
    confidence: 'High',
    status: 'Active',
  },
  {
    id: 'kb-12',
    title: 'Life Safety Emergency Rules',
    content:
      'Immediately escalate to on-call manager and instruct caller to evacuate if carbon monoxide alarm sounds, gas smell is present, or electrical breaker panel is arcing/sparking. Temperatures >95°F trigger high-priority dispatch.',
    category: 'Emergency Rules',
    source: 'Owner',
    owner: 'Michael Carter',
    lastUpdated: 'Fri, Aug 28',
    confidence: 'High',
    status: 'Active',
  },
];

const CATEGORIES: Array<'All' | KnowledgeCategory> = [
  'All',
  'Company',
  'Services',
  'Pricing',
  'Policies',
  'Service Area',
  'Emergency Rules',
  'Memberships',
  'Financing',
  'Warranty',
  'FAQs',
  'Scripts',
];

export default function KnowledgePage() {
  const [knowledgeItems, setKnowledgeItems] = useState<KnowledgeItem[]>(INITIAL_KNOWLEDGE);
  const [unanswered, setUnanswered] = useState<UnansweredQuestion[]>(INITIAL_UNANSWERED);
  const [answerDrafts, setAnswerDrafts] = useState<Record<string, string>>({});
  const [selectedCategory, setSelectedCategory] = useState<'All' | KnowledgeCategory>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingItem, setEditingItem] = useState<KnowledgeItem | null>(null);
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<KnowledgeCategory>('Services');
  const [newItemSource, setNewItemSource] = useState<'Website' | 'Owner' | 'FSM pricebook' | 'Pricebook'>('Owner');
  const [newItemContent, setNewItemContent] = useState('');
  const [actionToast, setActionToast] = useState<string | null>(null);

  // Filter items
  const filteredItems = knowledgeItems.filter((item) => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.owner.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.source.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Handle saving an answer to an unanswered customer question (Active Learning)
  const handleSaveAnswerOnce = (questionId: string) => {
    const draft = answerDrafts[questionId]?.trim();
    if (!draft) return;

    const questionObj = unanswered.find((q) => q.id === questionId);
    if (!questionObj) return;

    const newItem: KnowledgeItem = {
      id: `kb-${Date.now()}`,
      title: questionObj.question,
      content: draft,
      category: questionObj.question.toLowerCase().includes('water') ? 'Services' : 'Services',
      source: 'Owner',
      owner: 'Michael Carter',
      lastUpdated: 'Just now',
      confidence: 'High',
      status: 'Active',
    };

    setKnowledgeItems((prev) => [newItem, ...prev]);
    setUnanswered((prev) => prev.filter((q) => q.id !== questionId));
    setAnswerDrafts((prev) => {
      const copy = { ...prev };
      delete copy[questionId];
      return copy;
    });

    setActionToast(`Answer saved! Elijah embedded into pgvector and will remember for all callers.`);
    setTimeout(() => setActionToast(null), 4000);
  };

  // Handle saving edits on existing item
  const handleSaveEdit = () => {
    if (!editingItem) return;
    setKnowledgeItems((prev) =>
      prev.map((item) => (item.id === editingItem.id ? { ...editingItem, lastUpdated: 'Just now' } : item))
    );
    setEditingItem(null);
    setActionToast(`"${editingItem.title}" updated and re-indexed into pgvector!`);
    setTimeout(() => setActionToast(null), 3500);
  };

  // Handle adding new custom knowledge item
  const handleAddNewItem = () => {
    if (!newItemTitle.trim() || !newItemContent.trim()) return;

    const item: KnowledgeItem = {
      id: `kb-${Date.now()}`,
      title: newItemTitle.trim(),
      content: newItemContent.trim(),
      category: newItemCategory,
      source: newItemSource,
      owner: 'Michael Carter',
      lastUpdated: 'Just now',
      confidence: 'High',
      status: 'Active',
    };

    setKnowledgeItems((prev) => [item, ...prev]);
    setIsAddItemOpen(false);
    setNewItemTitle('');
    setNewItemContent('');
    setActionToast(`Added "${item.title}" to Knowledge Base!`);
    setTimeout(() => setActionToast(null), 3500);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Toast Notification */}
      {actionToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-surface-elevated/95 backdrop-blur-md border border-primary/40 text-white px-5 py-3 rounded-2xl shadow-xl shadow-black/40 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0">
            <Check className="w-3.5 h-3.5 stroke-[3]" />
          </div>
          <span className="text-sm font-medium">{actionToast}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-white">Knowledge Base</h1>
            <Badge variant="outline" className="border-purple-500/30 text-purple-400 bg-purple-500/10 text-xs">
              Elijah Shared Memory
            </Badge>
          </div>
          <p className="text-xs text-muted mt-0.5">
            Facts, pricing rules, warranties, and policies Elijah references during phone calls and text conversations.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            size="sm"
            onClick={() => setIsAddItemOpen(true)}
            className="bg-primary hover:bg-primary-hover text-white text-xs h-9 px-4 rounded-xl shadow-md shadow-primary-glow/20"
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            Add Knowledge Item
          </Button>
        </div>
      </div>

      {/* Top "Answer Once — Elijah Remembers It" Queue (When Elijah needs input from real calls) */}
      {unanswered.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Questions Elijah Needs You to Answer (Encountered on Recent Inbound Calls)</span>
            </div>
            <span className="text-[11px] text-amber-400/90 font-mono">
              {unanswered.length} pending clarification
            </span>
          </div>

          <div className="space-y-3">
            {unanswered.map((uq) => (
              <div
                key={uq.id}
                className="p-4 rounded-2xl bg-surface-card border border-amber-500/30 shadow-sm space-y-2.5 hover:border-amber-500/50 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                  <div className="font-bold text-white text-sm">{uq.question}</div>
                  <div className="text-[11px] text-slate-400 flex items-center gap-2">
                    <span>Asked {uq.frequency}x this week</span>
                    <span>·</span>
                    <span className="text-slate-500 font-mono">{uq.detectedAt}</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                  <input
                    type="text"
                    placeholder="Answer once — Elijah remembers it"
                    value={answerDrafts[uq.id] || ''}
                    onChange={(e) =>
                      setAnswerDrafts((prev) => ({
                        ...prev,
                        [uq.id]: e.target.value,
                      }))
                    }
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveAnswerOnce(uq.id)}
                    className="flex-1 px-4 py-2 bg-surface-elevated/90 border border-border rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-primary transition-colors"
                  />
                  <Button
                    size="sm"
                    onClick={() => handleSaveAnswerOnce(uq.id)}
                    disabled={!answerDrafts[uq.id]?.trim()}
                    className="bg-surface-elevated hover:bg-primary text-slate-200 hover:text-white border border-border/80 text-xs px-5 h-9 rounded-xl shrink-0 transition-all font-medium"
                  >
                    Save answer
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Category Filter Pills (Matching Demo Screenshot) */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                isSelected
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30 font-semibold'
                  : 'bg-surface-elevated/70 text-slate-300 hover:text-white hover:bg-surface-elevated border border-border/60'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Main Knowledge Base Table Card */}
      <div className="p-4 sm:p-5 rounded-2xl bg-surface-card border border-border/80 space-y-4">
        {/* Search Bar & Counter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs text-slate-400">
            Showing <strong className="text-white font-mono">{filteredItems.length}</strong> verified knowledge items
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search facts, rules, pricing..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 bg-surface-elevated/80 border border-border rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-primary"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Knowledge Table */}
        <div className="rounded-xl border border-border/70 overflow-hidden overflow-x-auto text-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface/70 border-b border-border/70 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4 min-w-[280px]">Item</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Source</th>
                <th className="py-3 px-3">Owner</th>
                <th className="py-3 px-3">Last updated</th>
                <th className="py-3 px-3 text-center">Confidence</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-muted">
                    <BookOpen className="w-8 h-8 mx-auto text-slate-600 mb-2 opacity-50" />
                    <p className="font-medium text-slate-300">No knowledge items match your criteria</p>
                    <p className="text-[11px] text-slate-500 mt-1">Try resetting the category filter or search query.</p>
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-surface-elevated/40 transition-colors group">
                    {/* Item (Title & Content Snippet) */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-white text-xs group-hover:text-primary transition-colors">
                        {item.title}
                      </div>
                      <div className="text-[11px] text-slate-300 mt-0.5 leading-relaxed line-clamp-2 max-w-xl">
                        {item.content}
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="text-[11px] text-slate-300">{item.category}</span>
                    </td>

                    {/* Source */}
                    <td className="py-3 px-3 text-slate-400 whitespace-nowrap">
                      <span className="text-[11px]">{item.source}</span>
                    </td>

                    {/* Owner */}
                    <td className="py-3 px-3 text-slate-300 whitespace-nowrap font-medium">
                      <span className="text-[11px]">{item.owner}</span>
                    </td>

                    {/* Last Updated */}
                    <td className="py-3 px-3 text-slate-400 whitespace-nowrap font-mono text-[11px]">
                      {item.lastUpdated}
                    </td>

                    {/* Confidence */}
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                          item.confidence === 'High'
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {item.confidence}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                        {item.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => setEditingItem(item)}
                        className="px-2.5 py-1 rounded-lg border border-border bg-surface text-slate-300 hover:text-white hover:border-primary/60 hover:bg-surface-elevated text-xs font-medium transition-all"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Knowledge Item Modal */}
      {editingItem && (
        <Modal
          isOpen={!!editingItem}
          onClose={() => setEditingItem(null)}
          title={`Edit Knowledge Item · ${editingItem.title}`}
          className="max-w-2xl"
        >
          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-400 mb-1 text-[11px] font-medium">Title</label>
              <input
                type="text"
                value={editingItem.title}
                onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                className="w-full px-3 py-2 bg-surface border border-border rounded-xl text-white text-xs focus:outline-none focus:border-primary"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1 text-[11px] font-medium">Category</label>
                <select
                  value={editingItem.category}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, category: e.target.value as KnowledgeCategory })
                  }
                  className="w-full px-3 py-2 bg-surface border border-border rounded-xl text-white text-xs focus:outline-none focus:border-primary"
                >
                  {CATEGORIES.filter((c) => c !== 'All').map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 text-[11px] font-medium">Confidence Level</label>
                <select
                  value={editingItem.confidence}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, confidence: e.target.value as 'High' | 'Medium' })
                  }
                  className="w-full px-3 py-2 bg-surface border border-border rounded-xl text-white text-xs focus:outline-none focus:border-primary"
                >
                  <option value="High">High (Direct Rule)</option>
                  <option value="Medium">Medium (General Policy)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-1 text-[11px] font-medium">
                Content (What Elijah speaks & references)
              </label>
              <textarea
                rows={5}
                value={editingItem.content}
                onChange={(e) => setEditingItem({ ...editingItem, content: e.target.value })}
                className="w-full p-3 bg-surface border border-border rounded-xl text-white text-xs leading-relaxed focus:outline-none focus:border-primary resize-none"
              />
            </div>

            <div className="p-3 rounded-xl bg-surface-elevated/70 border border-border/80 text-[11px] text-slate-400 flex items-center justify-between">
              <span>pgvector Embedding Sync:</span>
              <span className="text-emerald-400 font-mono font-semibold">AUTOMATIC ON SAVE</span>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-border/80">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditingItem(null)}
                className="text-xs h-9"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSaveEdit}
                className="bg-primary hover:bg-primary-hover text-white text-xs h-9 shadow-md shadow-primary-glow/20"
              >
                Save Changes
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Add New Knowledge Item Modal */}
      {isAddItemOpen && (
        <Modal
          isOpen={isAddItemOpen}
          onClose={() => setIsAddItemOpen(false)}
          title="Add New Knowledge Item"
          className="max-w-2xl"
        >
          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-400 mb-1 text-[11px] font-medium">Title</label>
              <input
                type="text"
                placeholder="e.g. Tankless Water Heater Descaling Service"
                value={newItemTitle}
                onChange={(e) => setNewItemTitle(e.target.value)}
                className="w-full px-3 py-2 bg-surface border border-border rounded-xl text-white text-xs focus:outline-none focus:border-primary"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1 text-[11px] font-medium">Category</label>
                <select
                  value={newItemCategory}
                  onChange={(e) => setNewItemCategory(e.target.value as KnowledgeCategory)}
                  className="w-full px-3 py-2 bg-surface border border-border rounded-xl text-white text-xs focus:outline-none focus:border-primary"
                >
                  {CATEGORIES.filter((c) => c !== 'All').map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 text-[11px] font-medium">Source</label>
                <select
                  value={newItemSource}
                  onChange={(e) =>
                    setNewItemSource(
                      e.target.value as 'Website' | 'Owner' | 'FSM pricebook' | 'Pricebook'
                    )
                  }
                  className="w-full px-3 py-2 bg-surface border border-border rounded-xl text-white text-xs focus:outline-none focus:border-primary"
                >
                  <option value="Owner">Owner</option>
                  <option value="Website">Website</option>
                  <option value="FSM pricebook">FSM pricebook</option>
                  <option value="Pricebook">Pricebook</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-1 text-[11px] font-medium">
                Answer / Rule Content (Clear, grounded explanation for Elijah)
              </label>
              <textarea
                rows={5}
                placeholder="Describe the service, pricing, or rule in plain terms..."
                value={newItemContent}
                onChange={(e) => setNewItemContent(e.target.value)}
                className="w-full p-3 bg-surface border border-border rounded-xl text-white text-xs leading-relaxed focus:outline-none focus:border-primary resize-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-border/80">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAddItemOpen(false)}
                className="text-xs h-9"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleAddNewItem}
                disabled={!newItemTitle.trim() || !newItemContent.trim()}
                className="bg-primary hover:bg-primary-hover text-white text-xs h-9 shadow-md shadow-primary-glow/20"
              >
                Save & Ingest
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
