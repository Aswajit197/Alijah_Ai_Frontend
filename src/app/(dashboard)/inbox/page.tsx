"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/api";
import {
  ArrowUpRight,
  Calendar,
  ChevronRight,
  ExternalLink,
  Flame,
  Globe,
  Inbox,
  Key,
  MapPin,
  MessageSquare,
  Pause,
  PhoneCall,
  PhoneIncoming,
  Play,
  RotateCcw,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  User,
  Volume2,
  Wrench,
  Zap
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export type ChannelType = "CALL" | "SMS" | "WEB";
export type UrgencyLevel = "EMERGENCY" | "HIGH" | "NORMAL" | "LOW";
export type AIStatus = "AUTO_BOOKED" | "NEEDS_APPROVAL" | "IN_PROGRESS" | "RESOLVED";

export interface TranscriptTurn {
	id: string;
	speaker: "ai" | "customer" | "system";
	speakerName: string;
	time: string;
	text: string;
	tag?: string;
	audioTimestamp?: number; // seconds
}

export interface Conversation {
	id: string;
	customerName: string;
	customerPhone: string;
	customerEmail?: string;
	companyName?: string;
	channel: ChannelType;
	urgency: UrgencyLevel;
	aiStatus: AIStatus;
	sentiment: string;
	timestamp: string;
	duration?: string;
	unread: boolean;
	reportedIssue: string;
	aiSummary: string;
	recordingUrl?: string;
	equipment?: {
		name: string;
		brand: string;
		model: string;
		serial: string;
		warranty: string;
		location: string;
	};
	serviceAddress?: string;
	gateCode?: string;
	jobId?: string;
	jobNumber?: string;
	transcript: TranscriptTurn[];
}

export function formatInboxTimestamp(dateInput: string | Date | number): string {
	if (!dateInput) return "";
	const date = new Date(dateInput);
	if (isNaN(date.getTime())) return "";

	const now = new Date();
	const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
	const startOfCallDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
	const diffMs = startOfToday.getTime() - startOfCallDate.getTime();
	const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

	if (diffDays <= 0) {
		return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
	} else if (diffDays === 1) {
		return "1d";
	} else if (diffDays < 7) {
		return `${diffDays}d`;
	} else if (diffDays < 30) {
		const weeks = Math.floor(diffDays / 7);
		return `${weeks}w`;
	} else {
		const months = Math.floor(diffDays / 30);
		return `${months}mo`;
	}
}

export function parseTranscriptTurns(rawTranscript: string, fallbackCustomerName: string): TranscriptTurn[] {
	if (!rawTranscript) return [];
	const lines = rawTranscript.split("\n").filter((l) => l.trim().length > 0);

	let currentSpeaker: "ai" | "customer" = "ai";
	let currentSpeakerName = "Elijah (AI Receptionist)";

	const turns: TranscriptTurn[] = [];

	for (let idx = 0; idx < lines.length; idx++) {
		const line = lines[idx].trim();
		if (line.startsWith("Agent:")) {
			currentSpeaker = "ai";
			currentSpeakerName = "Elijah (AI Receptionist)";
		} else if (line.startsWith("User:") || line.startsWith("Customer:") || line.startsWith("Caller:")) {
			currentSpeaker = "customer";
			currentSpeakerName = fallbackCustomerName || "Customer";
		}

		const cleanText = line.replace(/^(Agent|User|Customer|Caller):\s*/i, "").trim();
		if (cleanText.length > 0) {
			turns.push({
				id: `turn-${idx}`,
				speaker: currentSpeaker,
				speakerName: currentSpeakerName,
				time: "",
				text: cleanText,
			});
		}
	}

	return turns;
}

const INITIAL_CONVERSATIONS: Conversation[] = [];

export default function InboxPage() {
	const [conversations, setConversations] = useState<Conversation[]>([]);
	const [selectedId, setSelectedId] = useState<string>("");
	const [isLoading, setIsLoading] = useState(true);
	const [channelFilter, setChannelFilter] = useState<"ALL" | ChannelType>("ALL");
	const [urgencyFilter, setUrgencyFilter] = useState<"ALL" | "URGENT" | "UNREAD" | "NEEDS_APPROVAL">("ALL");
	const [searchQuery, setSearchQuery] = useState("");

	// Audio playback simulation states
	const [isPlaying, setIsPlaying] = useState(false);
	const [currentPlayTime, setCurrentPlayTime] = useState(0); // seconds
	const [totalPlayTime, setTotalPlayTime] = useState(215); // seconds
	const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);

	// Composer states
	const [replyText, setReplyText] = useState("");
	const [composerMode, setComposerMode] = useState<"SMS" | "NOTE">("SMS");
	const [showSummaryToast, setShowSummaryToast] = useState(false);

	// Auto-scroll & audio refs
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const audioRef = useRef<HTMLAudioElement | null>(null);

	const activeConv = conversations.find((c) => c.id === selectedId) || conversations[0];

	const handleTogglePlay = () => {
		if (audioRef.current) {
			if (isPlaying) {
				audioRef.current.pause();
			} else {
				audioRef.current.play().catch((err) => {
					console.warn("Audio playback error:", err);
				});
			}
		} else {
			setIsPlaying(!isPlaying);
		}
	};

	const handleRestartAudio = () => {
		if (audioRef.current) {
			audioRef.current.currentTime = 0;
			setCurrentPlayTime(0);
			audioRef.current.play().catch(() => {});
		} else {
			setCurrentPlayTime(0);
		}
	};

	const handleSpeedChange = (spd: number) => {
		setPlaybackSpeed(spd);
		if (audioRef.current) {
			audioRef.current.playbackRate = spd;
		}
	};

	const handleSeek = (idx: number) => {
		const targetSec = (idx / 36) * totalPlayTime;
		setCurrentPlayTime(Math.floor(targetSec));
		if (audioRef.current) {
			audioRef.current.currentTime = targetSec;
		}
	};

	const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
		messagesEndRef.current?.scrollIntoView({ behavior, block: "end" });
	};

	// Load live voice calls & match with real jobs
	const loadConversations = async () => {
		setIsLoading(true);
		try {
			const [callsData, jobsData] = await Promise.all([
				apiRequest<any[]>("/jobs/voice-calls").catch(() => []),
				apiRequest<any[]>("/jobs").catch(() => []),
			]);

			if (Array.isArray(callsData) && callsData.length > 0) {
				const mapped: Conversation[] = [];
				for (const call of callsData) {
					// Accept any call that is completed, ended, or has transcript/summary
					if (
						call.status === "ended" ||
						call.transcript ||
						(call.summary && call.summary.trim().length > 0)
					) {
						const durationSec = Math.round((call.durationMs || 0) / 1000);
						const m = Math.floor(durationSec / 60);
						const s = durationSec % 60;

						const jobMatch = call.summary?.match(/JOB-\d+/i);
						const jobNumber = jobMatch ? jobMatch[0] : undefined;

						// Match with live job in database for real customer and job info
						const matchedJob = jobNumber && Array.isArray(jobsData) ? jobsData.find((j: any) => j.jobNumber === jobNumber) : null;

						// Dynamically extract caller name from summary if not in matchedJob
						const callerMatch =
							call.summary?.match(/(?:Caller|The caller|Customer)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i) ||
							call.summary?.match(/under\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i);
						const extractedCallerName = callerMatch ? callerMatch[1] : null;

						// Dynamically extract phone number from call or summary
						const phoneMatch = call.summary?.match(/(\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
						const extractedPhone = phoneMatch ? phoneMatch[0] : null;

						const customerName =
							matchedJob?.customer?.name ||
							extractedCallerName ||
							(call.fromNumber ? `Caller (${call.fromNumber})` : "Web Caller");
						const customerPhone =
							matchedJob?.customer?.phone || call.fromNumber || extractedPhone || "Web Call";
						const customerEmail = matchedJob?.customer?.email || undefined;
						const serviceAddress =
							matchedJob?.serviceAddress ||
							matchedJob?.customer?.address ||
							(call.summary?.match(/at\s+([^,.]+(?:,\s*[^,.]+){1,2})/i)?.[1]
								? `${call.summary.match(/at\s+([^,.]+(?:,\s*[^,.]+){1,2})/i)?.[1]}, Phoenix, AZ`
								: "Phoenix, AZ (Pending Intake)");
						const reportedIssue =
							matchedJob?.reportedIssue ||
							matchedJob?.title ||
							(call.summary && call.summary.length > 50 ? `${call.summary.slice(0, 80)}...` : call.summary || "Inbound AI Call");
						const gateCode = matchedJob?.gateCode || undefined;

						const initialTurns = call.transcript
							? parseTranscriptTurns(call.transcript, customerName)
							: [];

						mapped.push({
							id: call.id,
							customerName,
							customerPhone,
							customerEmail,
							channel: "CALL",
							urgency:
								call.summary?.toLowerCase().includes("emergency") || matchedJob?.priority === "EMERGENCY" ? "EMERGENCY" : "NORMAL",
							aiStatus: call.isSuccessful ? "AUTO_BOOKED" : "NEEDS_APPROVAL",
							sentiment: call.userSentiment === "neutral" ? "Satisfied / Cooperative" : (call.userSentiment || "Relieved"),
							timestamp: formatInboxTimestamp(call.createdAt || call.startedAt || Date.now()),
							duration: `${m}m ${s < 10 ? "0" : ""}${s}s`,
							unread: false,
							reportedIssue,
							aiSummary: call.summary || "Call completed via Elijah AI Receptionist.",
							serviceAddress,
							gateCode,
							jobId: matchedJob?.id,
							jobNumber,
							recordingUrl: call.recordingUrl,
							equipment: matchedJob?.equipment
								? {
										name: matchedJob.equipment.name,
										brand: matchedJob.equipment.brand,
										model: matchedJob.equipment.modelNumber || "",
										serial: matchedJob.equipment.serialNumber || "",
										warranty: matchedJob.equipment.warrantyStatus || "",
										location: matchedJob.equipment.locationOnSite || "",
									}
								: undefined,
							transcript: initialTurns,
						});
					}
				}

				if (mapped.length > 0) {
					setConversations(mapped);
					setSelectedId(mapped[0].id);
					const dur = Math.round((callsData[0].durationMs || 0) / 1000);
					if (dur > 0) setTotalPlayTime(dur);
				}
			}
		} catch (err) {
			console.error("Failed to load conversations:", err);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		loadConversations();
	}, []);

	// Fetch full transcript turns for selected conversation if not already parsed
	useEffect(() => {
		if (!selectedId) return;
		const current = conversations.find((c) => c.id === selectedId);
		if (current && current.transcript.length === 0) {
			apiRequest<any>(`/jobs/voice-calls/${selectedId}`)
				.then((detail) => {
					if (detail && detail.transcript) {
						const turns = parseTranscriptTurns(detail.transcript, current.customerName);
						setConversations((prev) => prev.map((c) => (c.id === selectedId ? { ...c, transcript: turns } : c)));
					}
				})
				.catch(console.error);
		}
	}, [selectedId, conversations]);

	// Auto-scroll whenever transcript updates or user switches conversation
	useEffect(() => {
		scrollToBottom("smooth");
	}, [activeConv?.transcript?.length, selectedId]);

	// Fallback audio timer (when no audio element is loaded)
	useEffect(() => {
		let interval: NodeJS.Timeout;
		if (isPlaying && !audioRef.current) {
			interval = setInterval(() => {
				setCurrentPlayTime((prev) => {
					if (prev >= totalPlayTime) {
						setIsPlaying(false);
						return 0;
					}
					return prev + 1;
				});
			}, 1000 / playbackSpeed);
		}
		return () => clearInterval(interval);
	}, [isPlaying, totalPlayTime, playbackSpeed]);

	// When active conversation changes, sync player and pause audio
	useEffect(() => {
		if (audioRef.current) {
			audioRef.current.pause();
			audioRef.current.currentTime = 0;
		}
		setIsPlaying(false);
		setCurrentPlayTime(0);
	}, [selectedId]);

	// Filter conversations
	const filteredConversations = conversations.filter((c) => {
		if (channelFilter !== "ALL" && c.channel !== channelFilter) return false;
		if (urgencyFilter === "URGENT" && c.urgency !== "EMERGENCY" && c.urgency !== "HIGH") return false;
		if (urgencyFilter === "UNREAD" && !c.unread) return false;
		if (urgencyFilter === "NEEDS_APPROVAL" && c.aiStatus !== "NEEDS_APPROVAL") return false;
		if (searchQuery.trim()) {
			const q = searchQuery.toLowerCase();
			const matchName = c.customerName.toLowerCase().includes(q);
			const matchPhone = c.customerPhone.toLowerCase().includes(q);
			const matchIssue = c.reportedIssue.toLowerCase().includes(q);
			const matchEquipment = c.equipment?.brand.toLowerCase().includes(q);
			if (!matchName && !matchPhone && !matchIssue && !matchEquipment) return false;
		}
		return true;
	});

	const handleSelectConv = (id: string) => {
		setSelectedId(id);
		// Mark as read
		setConversations((prev) => prev.map((c) => (c.id === id ? { ...c, unread: false } : c)));
	};

	const handleSendMessage = () => {
		if (!replyText.trim()) return;
		const now = new Date();
		const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

		const newTurn: TranscriptTurn = {
			id: `turn-${Date.now()}`,
			speaker: composerMode === "SMS" ? "ai" : "system",
			speakerName: composerMode === "SMS" ? "Dispatcher (You)" : "Internal Staff Note",
			time: timeStr,
			text: replyText.trim(),
		};

		setConversations((prev) =>
			prev.map((c) => {
				if (c.id === selectedId) {
					return {
						...c,
						transcript: [...c.transcript, newTurn],
					};
				}
				return c;
			}),
		);
		setReplyText("");
		setTimeout(() => scrollToBottom("smooth"), 50);
	};

	const handleQuickReply = (text: string) => {
		setReplyText(text);
	};

	const formatSeconds = (sec: number) => {
		const m = Math.floor(sec / 60);
		const s = Math.floor(sec % 60);
		return `${m}:${s < 10 ? "0" : ""}${s}`;
	};

	return (
		<div className="space-y-4">
			{/* 1. Header Banner */}
			<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-1">
				<div>
					<div className="flex items-center gap-3">
						<h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
							<Inbox className="w-6 h-6 text-primary" />
							<span>Unified AI Inbox</span>
						</h1>
						<span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm">
							<span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
							<span>AI Receptionist Live</span>
						</span>
					</div>
					<p className="text-xs text-muted mt-1">
						Omnichannel triage for inbound VoIP phone calls, real-time voice transcripts, two-way SMS, and QR equipment scans.
					</p>
				</div>

				<div className="flex items-center gap-2.5">
					<Button
						variant="outline"
						size="sm"
						onClick={() => setShowSummaryToast(true)}
						className="gap-2 text-xs border-border bg-surface hover:bg-surface-elevated text-slate-200">
						<Sparkles className="w-3.5 h-3.5 text-primary animate-pulse" />
						<span>AI Summarize Inbox</span>
					</Button>
					<Link href="/schedule">
						<Button variant="primary" size="sm" className="gap-2 text-xs shadow-lg shadow-primary-glow/20">
							<Calendar className="w-3.5 h-3.5" />
							<span>Open Schedule Board</span>
						</Button>
					</Link>
				</div>
			</div>

			{/* AI Aggregated Summary Modal / Banner */}
			{showSummaryToast && (
				<div className="p-4 rounded-2xl bg-gradient-to-r from-primary/10 via-surface-elevated to-surface border border-primary/30 flex items-start justify-between gap-4 shadow-xl">
					<div className="flex items-start gap-3">
						<div className="w-8 h-8 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary mt-0.5">
							<Sparkles className="w-4 h-4" />
						</div>
						<div className="space-y-1">
							<h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
								<span>Elijah AI Morning Briefing</span>
								<Badge variant="info">3 Unread Leads</Badge>
							</h4>
							<p className="text-xs text-slate-300 leading-relaxed max-w-4xl">
								• <strong>1 Critical Emergency:</strong> Marcus Sterling (AC fan buzzing, 105°F heatwave) auto-dispatched to
								on-call field technician (12–4 PM).
								<br />• <strong>1 Commercial Attention:</strong> Desert Vista Dental breaker trip needs manager overtime signoff
								($185/hr).
								<br />• <strong>1 High-Value Lead:</strong> Elena Rostova requested Navien tankless quote ($2,800 - $3,900),
								consultation offered for Thursday.
							</p>
						</div>
					</div>
					<button
						onClick={() => setShowSummaryToast(false)}
						className="text-xs text-muted hover:text-white px-2 py-1 rounded bg-surface/80 border border-border">
						Dismiss
					</button>
				</div>
			)}

			{/* 2. Main 3-Column Omnichannel Workspace */}
			<div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[calc(100vh-175px)] min-h-[680px]">
				{/* ======================================================== */}
				{/* COLUMN 1: Conversations List & Filters (3.5 Cols)        */}
				{/* ======================================================== */}
				<div className="lg:col-span-4 xl:col-span-3 flex flex-col rounded-2xl bg-surface border border-border overflow-hidden">
					{/* Top Filter Chips */}
					<div className="p-3 border-b border-border space-y-2.5 bg-surface/50">
						{/* Search Input */}
						<div className="relative">
							<Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
							<input
								type="text"
								placeholder="Search name, phone, issue..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-background border border-border focus:outline-none focus:border-primary text-white placeholder:text-muted/60"
							/>
						</div>

						{/* Channel Tabs */}
						<div className="grid grid-cols-4 gap-1 p-0.5 rounded-lg bg-background border border-border text-[11px]">
							{(["ALL", "CALL", "SMS", "WEB"] as const).map((ch) => (
								<button
									key={ch}
									onClick={() => setChannelFilter(ch)}
									className={`py-1 text-center font-medium rounded-md transition-all ${
										channelFilter === ch ? "bg-primary text-white shadow-sm" : "text-muted hover:text-white"
									}`}>
									{ch === "ALL" && "All"}
									{ch === "CALL" && "📞 Voice"}
									{ch === "SMS" && "💬 SMS"}
									{ch === "WEB" && "🌐 QR"}
								</button>
							))}
						</div>

						{/* Urgency Filter Pills */}
						<div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar text-[10px]">
							<button
								onClick={() => setUrgencyFilter("ALL")}
								className={`px-2 py-0.5 rounded-full border transition-all ${
									urgencyFilter === "ALL"
										? "bg-slate-700 text-white border-slate-600"
										: "bg-surface-elevated text-muted border-border hover:text-white"
								}`}>
								All ({conversations.length})
							</button>
							<button
								onClick={() => setUrgencyFilter("URGENT")}
								className={`px-2 py-0.5 rounded-full border transition-all ${
									urgencyFilter === "URGENT"
										? "bg-red-500/20 text-red-400 border-red-500/40 font-semibold"
										: "bg-surface-elevated text-muted border-border hover:text-red-400"
								}`}>
								⚡ Urgent
							</button>
							<button
								onClick={() => setUrgencyFilter("NEEDS_APPROVAL")}
								className={`px-2 py-0.5 rounded-full border transition-all ${
									urgencyFilter === "NEEDS_APPROVAL"
										? "bg-amber-500/20 text-amber-400 border-amber-500/40 font-semibold"
										: "bg-surface-elevated text-muted border-border hover:text-amber-400"
								}`}>
								⚠️ Escalated
							</button>
							<button
								onClick={() => setUrgencyFilter("UNREAD")}
								className={`px-2 py-0.5 rounded-full border transition-all ${
									urgencyFilter === "UNREAD"
										? "bg-primary/20 text-primary border-primary/40 font-semibold"
										: "bg-surface-elevated text-muted border-border hover:text-primary"
								}`}>
								Unread
							</button>
						</div>
					</div>

					{/* Conversations Feed Scroll Area */}
					<div className="flex-1 overflow-y-auto divide-y divide-border/60">
						{filteredConversations.length === 0 ? (
							<div className="p-8 text-center text-muted space-y-2">
								<Inbox className="w-8 h-8 mx-auto opacity-40" />
								<p className="text-xs">No conversations match criteria.</p>
							</div>
						) : (
							filteredConversations.map((c) => {
								const isSelected = activeConv ? c.id === activeConv.id : false;
								return (
									<div
										key={c.id}
										onClick={() => handleSelectConv(c.id)}
										className={`p-3 cursor-pointer transition-all border-l-2 relative ${
											isSelected
												? "bg-primary/10 border-l-primary shadow-inner"
												: "hover:bg-surface-elevated/60 border-l-transparent"
										}`}>
										{/* Unread dot */}
										{c.unread && (
											<span className="w-2 h-2 rounded-full bg-primary absolute top-3 right-3 shadow-sm shadow-primary" />
										)}

										<div className="flex items-center justify-between gap-1 mb-1">
											<div className="flex items-center gap-1.5 min-w-0">
												{c.channel === "CALL" && (
													<div className="w-5 h-5 rounded-md bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
														<PhoneIncoming className="w-3 h-3" />
													</div>
												)}
												{c.channel === "SMS" && (
													<div className="w-5 h-5 rounded-md bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
														<MessageSquare className="w-3 h-3" />
													</div>
												)}
												{c.channel === "WEB" && (
													<div className="w-5 h-5 rounded-md bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
														<Globe className="w-3 h-3" />
													</div>
												)}
												<span className="text-xs font-bold text-white truncate">{c.companyName || c.customerName}</span>
											</div>
											<span className="text-[10px] text-muted shrink-0">{c.timestamp}</span>
										</div>

										{/* Reported Issue Snippet */}
										<p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed mb-2 font-normal">{c.reportedIssue}</p>

										{/* Status & Urgency Badges */}
										<div className="flex items-center gap-1.5 flex-wrap">
											{c.urgency === "EMERGENCY" && (
												<span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-red-500/20 text-red-400 border border-red-500/30 flex items-center gap-1">
													<Flame className="w-2.5 h-2.5" />
													EMERGENCY
												</span>
											)}
											{c.urgency === "HIGH" && (
												<span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
													HIGH
												</span>
											)}
											{c.urgency === "NORMAL" && (
												<span className="px-1.5 py-0.5 rounded text-[9px] bg-slate-800 text-slate-300 border border-slate-700">
													NORMAL
												</span>
											)}

											{c.aiStatus === "AUTO_BOOKED" && (
												<span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
													⚡ Auto-Booked
												</span>
											)}
											{c.aiStatus === "NEEDS_APPROVAL" && (
												<span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
													⚠️ Needs Review
												</span>
											)}
											{c.aiStatus === "IN_PROGRESS" && (
												<span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
													💬 Chatting
												</span>
											)}

											{c.equipment?.brand && (
												<span className="px-1.5 py-0.5 rounded text-[9px] bg-surface-elevated text-muted border border-border">
													{c.equipment.brand}
												</span>
											)}
										</div>
									</div>
								);
							})
						)}
					</div>
				</div>

				{/* ======================================================== */}
				{/* COLUMN 2: Active Conversation & Audio Stream (5.5 Cols)   */}
				{/* ======================================================== */}
				<div className="lg:col-span-8 xl:col-span-6 flex flex-col rounded-2xl bg-surface border border-border overflow-hidden">
					{!activeConv ? (
						<div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-slate-400">
							<Inbox className="w-12 h-12 text-slate-600 mb-3" />
							<h3 className="text-sm font-bold text-white">No Conversation Selected</h3>
							<p className="text-xs text-muted max-w-sm mt-1">
								Select an inbound call from the left, or test a call on /book to see real-time transcripts.
							</p>
						</div>
					) : (
						<>
							{/* Thread Header */}
							<div className="p-3.5 border-b border-border bg-surface/70 flex items-center justify-between gap-3">
								<div className="flex items-center gap-3 min-w-0">
									<div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-blue-600/20 border border-primary/30 flex items-center justify-center text-primary font-bold text-sm shrink-0">
										{activeConv.customerName
											.split(" ")
											.map((n) => n[0])
											.join("")
											.slice(0, 2)}
									</div>
									<div className="min-w-0">
										<div className="flex items-center gap-2">
											<h3 className="text-sm font-bold text-white truncate">{activeConv.customerName}</h3>
											{activeConv.jobNumber && (
												<Badge variant="primary" className="text-[10px] font-mono">
													{activeConv.jobNumber}
												</Badge>
											)}
										</div>
										<div className="flex items-center gap-2 text-[11px] text-muted">
											<span className="font-mono">{activeConv.customerPhone}</span>
											<span>•</span>
											<span>{activeConv.channel === "CALL" ? `VoIP Call (${activeConv.duration})` : activeConv.channel}</span>
											<span>•</span>
											<span className="text-emerald-400 font-medium">Sentiment: {activeConv.sentiment}</span>
										</div>
									</div>
								</div>

								{/* Header Action Buttons */}
								<div className="flex items-center gap-2 shrink-0">
									<a href={`tel:${activeConv.customerPhone}`}>
										<Button variant="outline" size="sm" className="gap-1.5 text-xs h-8">
											<PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
											<span className="hidden sm:inline">Call Back</span>
										</Button>
									</a>
									{activeConv.jobId && (
										<Link href={`/track/${activeConv.jobId}`}>
											<Button variant="primary" size="sm" className="gap-1.5 text-xs h-8">
												<ArrowUpRight className="w-3.5 h-3.5" />
												<span>Live Tracker</span>
											</Button>
										</Link>
									)}
								</div>
							</div>

							{/* AI Autonomous Summary Ribbon */}
							<div className="px-4 py-2.5 bg-gradient-to-r from-primary/10 via-surface-elevated/80 to-surface border-b border-border flex items-start gap-2.5">
								<Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5" />
								<div className="text-xs text-slate-300 leading-relaxed">
									<span className="font-bold text-white mr-1.5">AI Triage Summary:</span>
									{activeConv.aiSummary}
								</div>
							</div>

							{/* VoIP Audio Player (If Phone Call) */}
							{activeConv.channel === "CALL" && (
								<div className="p-3 bg-background/80 border-b border-border space-y-2">
									{activeConv.recordingUrl && (
										<audio
											ref={audioRef}
											src={activeConv.recordingUrl}
											preload="auto"
											onTimeUpdate={() => {
												if (audioRef.current) {
													setCurrentPlayTime(Math.floor(audioRef.current.currentTime));
												}
											}}
											onLoadedMetadata={() => {
												if (audioRef.current && audioRef.current.duration && !isNaN(audioRef.current.duration)) {
													setTotalPlayTime(Math.floor(audioRef.current.duration));
												}
											}}
											onPlay={() => setIsPlaying(true)}
											onPause={() => setIsPlaying(false)}
											onEnded={() => {
												setIsPlaying(false);
												setCurrentPlayTime(0);
											}}
										/>
									)}
									<div className="flex items-center justify-between gap-3 text-xs">
										<div className="flex items-center gap-2">
											<button
												type="button"
												onClick={handleTogglePlay}
												className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center hover:bg-primary-hover transition-all shadow-md shadow-primary-glow/30 cursor-pointer"
												title={isPlaying ? "Pause Audio" : "Play Real Call Recording"}>
												{isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
											</button>
											<button
												type="button"
												onClick={handleRestartAudio}
												className="w-7 h-7 rounded-lg bg-surface border border-border text-muted hover:text-white flex items-center justify-center cursor-pointer"
												title="Restart Audio">
												<RotateCcw className="w-3.5 h-3.5" />
											</button>
											<span className="font-mono text-[11px] text-slate-300">
												{formatSeconds(currentPlayTime)} / {formatSeconds(totalPlayTime)}
											</span>
										</div>

										{/* Interactive Audio Waveform with Seek */}
										<div
											className="flex-1 max-w-xs flex items-center gap-0.5 h-7 px-2 cursor-pointer"
											title="Click waveform to seek">
											{Array.from({ length: 36 }).map((_, idx) => {
												const isPassed = (idx / 36) * totalPlayTime <= currentPlayTime;
												const heightFactor = [
													40, 60, 30, 80, 95, 45, 70, 85, 30, 90, 100, 65, 40, 75, 85, 90, 35, 55, 75, 95, 60, 45, 85, 100, 70,
													50, 65, 80, 95, 40, 55, 70, 45, 80, 60, 30,
												][idx % 36];
												return (
													<div
														key={idx}
														onClick={() => handleSeek(idx)}
														className={`flex-1 rounded-full transition-all hover:scale-y-125 ${
															isPassed ? "bg-primary" : "bg-slate-700"
														} ${isPlaying && isPassed ? "opacity-100 shadow-sm shadow-primary" : "opacity-70"}`}
														style={{ height: `${heightFactor}%` }}
													/>
												);
											})}
										</div>

										{/* Speed Toggles & Direct Audio Link */}
										<div className="flex items-center gap-1.5 text-[10px] font-mono">
											{[1.0, 1.25, 1.5].map((spd) => (
												<button
													key={spd}
													type="button"
													onClick={() => handleSpeedChange(spd)}
													className={`px-1.5 py-0.5 rounded border transition-all cursor-pointer ${
														playbackSpeed === spd
															? "bg-primary/20 text-primary border-primary/40 font-bold"
															: "bg-surface text-muted border-border hover:text-white"
													}`}>
													{spd}x
												</button>
											))}
											{activeConv.recordingUrl && (
												<a
													href={activeConv.recordingUrl}
													target="_blank"
													rel="noopener noreferrer"
													className="p-1 rounded bg-surface border border-border text-muted hover:text-primary transition-colors"
													title="Open Audio in New Tab / Download">
													<Volume2 className="w-3.5 h-3.5" />
												</a>
											)}
										</div>
									</div>
								</div>
							)}

							{/* Transcript / Messages Scroll Stream */}
							<div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-background/40">
								{activeConv.transcript.length === 0 ? (
									<div className="flex flex-col items-center justify-center h-48 text-center text-slate-400">
										<MessageSquare className="w-8 h-8 text-slate-600 mb-2 opacity-60" />
										<p className="text-xs text-muted">No message transcript recorded for this call.</p>
									</div>
								) : (
									activeConv.transcript.map((turn) => {
										if (turn.speaker === "system") {
											return (
												<div key={turn.id} className="flex items-center justify-center my-2">
													<span className="px-3 py-1 rounded-full bg-surface-elevated/90 border border-border text-[10px] text-slate-300 font-mono shadow-sm flex items-center gap-1.5">
														<span>{turn.text}</span>
													</span>
												</div>
											);
										}

										// "isMine": Your messages (AI Receptionist, Dispatcher, Company) on the RIGHT
										// Client/Customer messages on the LEFT
										const isMine = turn.speaker === "ai";

										return (
											<div key={turn.id} className={`flex flex-col ${isMine ? "items-end" : "items-start"}`}>
												<div
													className={`flex items-center gap-1.5 mb-1 px-1 text-[11px] ${isMine ? "flex-row-reverse" : "flex-row"}`}>
													{isMine ? (
														<span className="font-bold text-primary flex items-center gap-1">
															<Sparkles className="w-3 h-3" />
															<span>{turn.speakerName}</span>
														</span>
													) : (
														<span className="font-semibold text-slate-300">{turn.speakerName}</span>
													)}
													<span className="text-[10px] text-muted">{turn.time}</span>
												</div>

												<div
													className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed shadow-sm ${
														isMine
															? "bg-primary text-white rounded-tr-sm shadow-md shadow-primary-glow/20"
															: "bg-surface-elevated border border-border text-slate-200 rounded-tl-sm"
													}`}>
													<p>{turn.text}</p>
													{turn.tag && (
														<div className="mt-2 pt-2 border-t border-white/20">
															<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-white/20 text-white border border-white/30">
																{turn.tag}
															</span>
														</div>
													)}
												</div>
											</div>
										);
									})
								)}
								{/* Auto-scroll target anchor */}
								<div ref={messagesEndRef} />
							</div>

							{/* Smart Reply Suggestions */}
							<div className="px-3 py-1.5 bg-surface/50 border-t border-border flex items-center gap-1.5 overflow-x-auto no-scrollbar">
								<span className="text-[10px] text-muted uppercase tracking-wider shrink-0 flex items-center gap-1">
									<Zap className="w-3 h-3 text-amber-400" />
									<span>Smart Replies:</span>
								</span>
								<button
									onClick={() => handleQuickReply("Our technician is currently en route to your location.")}
									className="px-2 py-0.5 rounded-lg bg-surface-elevated border border-border text-[11px] text-slate-300 hover:text-white hover:border-primary/40 whitespace-nowrap transition-all">
									🚗 Tech is en route
								</button>
								<button
									onClick={() => handleQuickReply("Gate code #7721 confirmed with technician.")}
									className="px-2 py-0.5 rounded-lg bg-surface-elevated border border-border text-[11px] text-slate-300 hover:text-white hover:border-primary/40 whitespace-nowrap transition-all">
									🔑 Gate code confirmed
								</button>
								<button
									onClick={() => handleQuickReply("Our standard diagnostic trip fee is $89, waived with repair.")}
									className="px-2 py-0.5 rounded-lg bg-surface-elevated border border-border text-[11px] text-slate-300 hover:text-white hover:border-primary/40 whitespace-nowrap transition-all">
									💵 $89 Trip fee
								</button>
							</div>

							{/* Composer Input Bar */}
							<div className="p-3 bg-surface border-t border-border space-y-2">
								<div className="flex items-center justify-between text-[11px]">
									<div className="flex items-center gap-2">
										<button
											onClick={() => setComposerMode("SMS")}
											className={`px-2 py-0.5 rounded font-medium transition-all ${
												composerMode === "SMS"
													? "bg-primary/20 text-primary border border-primary/30"
													: "text-muted hover:text-white"
											}`}>
											💬 Send SMS to Caller
										</button>
										<button
											onClick={() => setComposerMode("NOTE")}
											className={`px-2 py-0.5 rounded font-medium transition-all ${
												composerMode === "NOTE"
													? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
													: "text-muted hover:text-white"
											}`}>
											📝 Internal Staff Note
										</button>
									</div>
									<span className="text-muted text-[10px]">Press Enter to send</span>
								</div>

								<div className="flex items-center gap-2">
									<input
										type="text"
										placeholder={
											composerMode === "SMS"
												? `Message ${activeConv.customerName} via SMS...`
												: "Add private internal technician/dispatch note..."
										}
										value={replyText}
										onChange={(e) => setReplyText(e.target.value)}
										onKeyDown={(e) => {
											if (e.key === "Enter") handleSendMessage();
										}}
										className="flex-1 px-3 py-2 text-xs rounded-xl bg-background border border-border focus:outline-none focus:border-primary text-white placeholder:text-muted/60"
									/>
									<Button variant="primary" size="sm" onClick={handleSendMessage} className="gap-1 text-xs h-9 px-3 shrink-0">
										<Send className="w-3.5 h-3.5" />
										<span className="hidden sm:inline">Send</span>
									</Button>
								</div>
							</div>
						</>
					)}
				</div>

				{/* ======================================================== */}
				{/* COLUMN 3: Customer 360 & Equipment Dossier (3 Cols)      */}
				{/* ======================================================== */}
				<div className="hidden xl:flex xl:col-span-3 flex-col rounded-2xl bg-surface border border-border overflow-hidden p-3.5 space-y-4 overflow-y-auto">
					{!activeConv ? (
						<div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-slate-500">
							<User className="w-8 h-8 mb-2 opacity-40" />
							<p className="text-xs">No customer dossier</p>
						</div>
					) : (
						<>
							{/* Customer Profile Dossier */}
							<div>
								<h4 className="text-[11px] font-bold text-muted uppercase tracking-wider mb-2 flex items-center justify-between">
									<span>Customer 360</span>
									<Badge variant="neutral" className="text-[9px]">
										Verified
									</Badge>
								</h4>
								<div className="p-3 rounded-xl bg-surface-elevated border border-border space-y-2.5">
									<div className="flex items-center gap-2.5">
										<div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-bold text-xs">
											{activeConv.customerName.slice(0, 2).toUpperCase()}
										</div>
										<div>
											<h4 className="text-xs font-bold text-white">{activeConv.customerName}</h4>
											<p className="text-[11px] text-muted font-mono">{activeConv.customerPhone}</p>
										</div>
									</div>

									{activeConv.customerEmail && (
										<div className="text-[11px] text-slate-300 flex items-center gap-1.5 truncate">
											<span className="text-muted">Email:</span>
											<span className="truncate">{activeConv.customerEmail}</span>
										</div>
									)}

									{activeConv.serviceAddress && (
										<div className="pt-2 border-t border-border/60 space-y-1">
											<span className="text-[10px] text-muted uppercase tracking-wider flex items-center gap-1">
												<MapPin className="w-3 h-3 text-red-400" />
												<span>Service Address:</span>
											</span>
											<a
												href={`https://maps.google.com/?q=${encodeURIComponent(activeConv.serviceAddress)}`}
												target="_blank"
												rel="noreferrer"
												className="text-xs text-sky-400 hover:underline flex items-start gap-1">
												<span>{activeConv.serviceAddress}</span>
												<ExternalLink className="w-3 h-3 shrink-0 mt-0.5" />
											</a>
										</div>
									)}
								</div>
							</div>

							{/* Security Gate & Access Codes */}
							{activeConv.gateCode && (
								<div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 space-y-1">
									<span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
										<Key className="w-3 h-3" />
										<span>Security Gate Access:</span>
									</span>
									<p className="text-sm font-bold font-mono text-amber-300">{activeConv.gateCode}</p>
								</div>
							)}

							{/* Equipment Dossier (Vault) */}
							<div>
								<h4 className="text-[11px] font-bold text-muted uppercase tracking-wider mb-2 flex items-center justify-between">
									<span>Equipment On Site</span>
									<span className="text-[10px] text-sky-400 flex items-center gap-1">
										<Wrench className="w-3 h-3" />
										<span>Vault</span>
									</span>
								</h4>
								{activeConv.equipment ? (
									<div className="p-3 rounded-xl bg-surface-elevated border border-border space-y-2">
										<div className="flex items-center justify-between gap-1">
											<span className="text-xs font-bold text-white">{activeConv.equipment.name}</span>
											{activeConv.equipment.brand && (
												<Badge variant="accent" className="text-[9px]">
													{activeConv.equipment.brand}
												</Badge>
											)}
										</div>

										<div className="space-y-1 text-[11px]">
											{activeConv.equipment.model && (
												<div className="flex justify-between">
													<span className="text-muted">Model:</span>
													<span className="font-mono text-slate-200">{activeConv.equipment.model}</span>
												</div>
											)}
											{activeConv.equipment.serial && (
												<div className="flex justify-between">
													<span className="text-muted">Serial:</span>
													<span className="font-mono text-slate-200">{activeConv.equipment.serial}</span>
												</div>
											)}
											{activeConv.equipment.location && (
												<div className="flex justify-between">
													<span className="text-muted">Location:</span>
													<span className="text-slate-200">{activeConv.equipment.location}</span>
												</div>
											)}
										</div>

										{activeConv.equipment.warranty && (
											<div className="pt-2 border-t border-border/60">
												<span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400">
													<ShieldCheck className="w-3.5 h-3.5" />
													<span>{activeConv.equipment.warranty}</span>
												</span>
											</div>
										)}
									</div>
								) : (
									<div className="p-3 rounded-xl bg-surface-elevated/40 border border-dashed border-border/80 text-center py-4 space-y-1">
										<Wrench className="w-5 h-5 mx-auto text-slate-500 opacity-60 mb-1" />
										<p className="text-[11px] text-slate-300 font-medium">No Equipment Recorded</p>
										<p className="text-[10px] text-muted">Technician can scan or tag unit on site during diagnostic visit</p>
									</div>
								)}
							</div>

							{/* Quick Action Buttons */}
							<div className="space-y-2 pt-2 border-t border-border">
								<h4 className="text-[11px] font-bold text-muted uppercase tracking-wider">1-Click Operations</h4>

								<Link href="/schedule" className="block">
									<Button variant="outline" size="sm" className="w-full justify-between text-xs h-8">
										<span className="flex items-center gap-1.5">
											<Calendar className="w-3.5 h-3.5 text-primary" />
											<span>Dispatch Schedule</span>
										</span>
										<ChevronRight className="w-3 h-3 text-muted" />
									</Button>
								</Link>

								<Link href="/customers" className="block">
									<Button variant="outline" size="sm" className="w-full justify-between text-xs h-8">
										<span className="flex items-center gap-1.5">
											<User className="w-3.5 h-3.5 text-sky-400" />
											<span>Customer CRM Vault</span>
										</span>
										<ChevronRight className="w-3 h-3 text-muted" />
									</Button>
								</Link>

								{activeConv.jobId && (
									<Link href={`/track/${activeConv.jobId}`} className="block">
										<Button variant="primary" size="sm" className="w-full justify-between text-xs h-8">
											<span className="flex items-center gap-1.5">
												<Zap className="w-3.5 h-3.5" />
												<span>Customer Live SSE Tracker</span>
											</span>
											<ExternalLink className="w-3 h-3" />
										</Button>
									</Link>
								)}
							</div>
						</>
					)}
				</div>
			</div>
		</div>
	);
}
