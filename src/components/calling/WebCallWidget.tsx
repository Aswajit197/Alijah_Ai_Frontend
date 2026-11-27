'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Phone,
  PhoneOff,
  Mic,
  MicOff,
  Volume2,
  Sparkles,
  AlertCircle,
  Clock,
  Radio,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { RetellWebClient } from 'retell-client-js-sdk';

interface WebCallWidgetProps {
  companySlug: string;
  companyName: string;
  tradeType?: string;
  onCallFinished?: (callSummary?: any) => void;
}

interface TranscriptTurn {
  role: 'agent' | 'user';
  content: string;
}

export default function WebCallWidget({
  companySlug,
  companyName,
  tradeType = 'HVAC',
  onCallFinished,
}: WebCallWidgetProps) {
  const [callState, setCallState] = useState<'idle' | 'connecting' | 'active' | 'ended'>('idle');
  const [statusMessage, setStatusMessage] = useState<string>('Ready to connect');
  const [isAgentTalking, setIsAgentTalking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [duration, setDuration] = useState(0);
  const [transcript, setTranscript] = useState<TranscriptTurn[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeCallId, setActiveCallId] = useState<string | null>(null);

  const clientRef = useRef<RetellWebClient | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const transcriptEndRef = useRef<HTMLDivElement | null>(null);

  // Auto scroll transcript
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (clientRef.current) {
        try {
          clientRef.current.stopCall();
        } catch {}
      }
    };
  }, []);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startVoiceCall = async () => {
    setErrorMessage(null);
    setCallState('connecting');
    setStatusMessage('Requesting voice session...');
    setTranscript([]);
    setDuration(0);

    try {
      // 1. Obtain public web-call token from backend
      // const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://elijahapi.pashupatashastra.in/api/v1';
      const res = await fetch(`${apiUrl}/jobs/public-web-call`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantSlug: companySlug }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Unable to initialize voice session');
      }

      const { accessToken, retellCallId, callId } = json.data;
      setActiveCallId(callId);
      setStatusMessage('Connecting microphone & audio...');

      // 2. Initialize RetellWebClient
      const client = new RetellWebClient();
      clientRef.current = client;

      client.on('call_started', () => {
        setCallState('active');
        setStatusMessage('Live · Elijah AI is listening');
        // Start duration timer
        timerRef.current = setInterval(() => {
          setDuration((prev) => prev + 1);
        }, 1000);
      });

      client.on('agent_start_talking', () => {
        setIsAgentTalking(true);
        setStatusMessage('Elijah is speaking...');
      });

      client.on('agent_stop_talking', () => {
        setIsAgentTalking(false);
        setStatusMessage('Listening to your voice...');
      });

      client.on('update', (update: any) => {
        if (update?.transcript && Array.isArray(update.transcript)) {
          const parsed = update.transcript.map((t: any) => ({
            role: t.role === 'agent' ? 'agent' : 'user',
            content: t.content,
          }));
          setTranscript(parsed);
        }
      });

      client.on('call_ended', () => {
        setCallState('ended');
        setIsAgentTalking(false);
        setStatusMessage('Call ended');
        if (timerRef.current) clearInterval(timerRef.current);
        if (onCallFinished) {
          onCallFinished({ callId, retellCallId });
        }
      });

      client.on('error', (err: any) => {
        console.error('Retell error:', err);
        setErrorMessage(err?.message || 'Voice connection lost.');
        setCallState('ended');
        if (timerRef.current) clearInterval(timerRef.current);
      });

      // 3. Connect to WebRTC gateway
      await client.startCall({
        accessToken,
        callId: retellCallId,
        transport: 'gateway',
      });
    } catch (err: any) {
      console.error('Failed to start call:', err);
      setErrorMessage(err.message || 'Could not connect. Please check microphone permissions.');
      setCallState('idle');
      setStatusMessage('Ready to connect');
    }
  };

  const endCall = () => {
    if (clientRef.current) {
      try {
        clientRef.current.stopCall();
      } catch (err) {
        console.error('Error stopping call:', err);
      }
    }
    setCallState('ended');
    setIsAgentTalking(false);
    setStatusMessage('Call ended');
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const toggleMute = () => {
    if (!clientRef.current || callState !== 'active') return;
    try {
      if (isMuted) {
        clientRef.current.unmute();
        setIsMuted(false);
      } else {
        clientRef.current.mute();
        setIsMuted(true);
      }
    } catch (err) {
      console.error('Failed to toggle mute:', err);
    }
  };

  return (
    <div className="w-full rounded-3xl bg-slate-900/80 border border-slate-800 p-6 sm:p-8 shadow-2xl relative overflow-hidden space-y-6">
      {/* Background ambient glow */}
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black transition-all ${
                callState === 'active'
                  ? isAgentTalking
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/40 ring-4 ring-blue-500/20 animate-pulse'
                    : 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/40 ring-4 ring-emerald-500/20'
                  : 'bg-slate-800 text-blue-400 border border-slate-700'
              }`}
            >
              {callState === 'active' && isAgentTalking ? (
                <Volume2 className="w-6 h-6 animate-pulse" />
              ) : (
                <Radio className="w-6 h-6" />
              )}
            </div>
            {callState === 'active' && (
              <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-slate-900 animate-ping" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-white text-base">Elijah AI Receptionist</h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30">
                24/7 Voice AI
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {companyName} · Real-time browser microphone call
            </p>
          </div>
        </div>

        {/* Live Call Duration */}
        {callState === 'active' && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 font-mono text-xs text-emerald-400 font-bold">
            <Clock className="w-3.5 h-3.5 animate-spin" />
            <span>{formatDuration(duration)}</span>
          </div>
        )}
      </div>

      {/* Error alert */}
      {errorMessage && (
        <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Call State Views */}
      {callState === 'idle' && (
        <div className="text-center py-6 space-y-6">
          <div className="space-y-2 max-w-md mx-auto">
            <h4 className="text-lg font-extrabold text-white">Speak Directly With Our AI Dispatcher</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              No need to fill out forms. Talk naturally via your browser microphone — explain your issue, pick a time, and get confirmed in under 90 seconds.
            </p>
          </div>

          {/* Big Start Call Button */}
          <button
            onClick={startVoiceCall}
            className="w-full max-w-sm mx-auto py-4 px-6 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm flex items-center justify-center gap-3 shadow-xl shadow-blue-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
          >
            <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
              <Phone className="w-4 h-4 text-white" />
            </div>
            <span>Start AI Voice Call Now</span>
          </button>

          {/* Prompt suggestions */}
          <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800 text-left space-y-2 max-w-lg mx-auto">
            <div className="text-[11px] font-bold text-blue-400 flex items-center gap-1.5 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" /> What you can say:
            </div>
            <div className="space-y-1.5 text-xs text-slate-300">
              <div className="p-2 rounded-xl bg-slate-800/80 border border-slate-700/60 hover:border-blue-500/40 transition-colors">
                🗣️ <em>&quot;My AC stopped cooling this morning. Can you send someone to 100 North Central Avenue, Phoenix?&quot;</em>
              </div>
              <div className="p-2 rounded-xl bg-slate-800/80 border border-slate-700/60 hover:border-blue-500/40 transition-colors">
                🗣️ <em>&quot;I have an electrical panel tripping every 10 minutes, need emergency service.&quot;</em>
              </div>
            </div>
          </div>
        </div>
      )}

      {callState === 'connecting' && (
        <div className="py-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-blue-600/20 border-2 border-blue-500 flex items-center justify-center mx-auto text-blue-400 animate-pulse">
            <Radio className="w-8 h-8 animate-spin" />
          </div>
          <div>
            <h4 className="font-bold text-white text-base">Connecting with Elijah AI...</h4>
            <p className="text-xs text-slate-400 mt-1">{statusMessage}</p>
          </div>
          <p className="text-[11px] text-slate-500">
            Please allow browser microphone access when prompted.
          </p>
        </div>
      )}

      {(callState === 'active' || callState === 'ended') && (
        <div className="space-y-5">
          {/* Audio Waveform / Pulsing visualization */}
          <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-3.5 h-3.5 rounded-full ${
                  callState === 'active'
                    ? isAgentTalking
                      ? 'bg-blue-400 animate-ping'
                      : 'bg-emerald-400'
                    : 'bg-slate-600'
                }`}
              />
              <span className="text-xs font-semibold text-slate-200">{statusMessage}</span>
            </div>

            {/* Simulated Animated Audio Waveform */}
            {callState === 'active' && (
              <div className="flex items-center gap-1 h-6">
                {[12, 20, 16, 24, 8, 22, 14, 18, 10, 24].map((height, i) => (
                  <span
                    key={i}
                    className={`w-1 rounded-full transition-all duration-200 ${
                      isAgentTalking
                        ? 'bg-blue-400 animate-pulse'
                        : 'bg-emerald-400'
                    }`}
                    style={{
                      height: `${isAgentTalking ? (height * (i % 2 === 0 ? 1.2 : 0.7)) : 8}px`,
                      animationDelay: `${i * 100}ms`,
                    }}
                  />
                ))}
              </div>
            )}

            {/* Action buttons */}
            <div className="flex items-center gap-2">
              {callState === 'active' && (
                <>
                  <button
                    onClick={toggleMute}
                    className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                      isMuted
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    <span>{isMuted ? 'Muted' : 'Mute'}</span>
                  </button>

                  <button
                    onClick={endCall}
                    className="py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-rose-600/30 transition-all cursor-pointer"
                  >
                    <PhoneOff className="w-4 h-4" />
                    <span>End Call</span>
                  </button>
                </>
              )}

              {callState === 'ended' && (
                <button
                  onClick={startVoiceCall}
                  className="py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
                >
                  <Phone className="w-4 h-4" />
                  <span>Call Again</span>
                </button>
              )}
            </div>
          </div>

          {/* Real-time transcript box */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <span>Live Conversation Transcript</span>
              {callState === 'active' && (
                <span className="flex items-center gap-1 text-emerald-400 lowercase text-[10px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  live streaming
                </span>
              )}
            </div>

            <div className="min-h-[160px] max-h-[280px] overflow-y-auto p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3 font-sans text-xs">
              {transcript.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs italic">
                  Conversation will appear here in real-time as you speak...
                </div>
              ) : (
                transcript.map((turn, idx) => (
                  <div
                    key={idx}
                    className={`flex flex-col ${
                      turn.role === 'agent' ? 'items-start' : 'items-end'
                    }`}
                  >
                    <span className="text-[10px] font-bold uppercase tracking-wider mb-1 text-slate-500">
                      {turn.role === 'agent' ? 'Elijah (AI Dispatcher)' : 'You'}
                    </span>
                    <div
                      className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl leading-relaxed ${
                        turn.role === 'agent'
                          ? 'bg-blue-600/15 border border-blue-500/30 text-blue-100 rounded-tl-sm'
                          : 'bg-slate-800 border border-slate-700 text-slate-100 rounded-tr-sm'
                      }`}
                    >
                      {turn.content}
                    </div>
                  </div>
                ))
              )}
              <div ref={transcriptEndRef} />
            </div>
          </div>

          {callState === 'ended' && (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-xs text-emerald-300">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>Call completed! If you booked a visit, our dispatch system is assigning your technician now.</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}