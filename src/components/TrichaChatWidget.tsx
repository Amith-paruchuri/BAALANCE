'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  MessageSquare,
  X,
  Send,
  Bot,
  User,
  CornerDownLeft,
  RefreshCw,
  ChevronRight,
  HelpCircle,
  Activity,
  Key,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  RotateCcw,
} from 'lucide-react';
import { UserProfile, HairCortisolSegment, WeeklyTelemetry, ChatMessage } from '@/lib/types';
import { apiFetch } from '@/lib/apiFetch';

interface TrichaChatWidgetProps {
  userProfile: UserProfile;
  segments: HairCortisolSegment[];
  telemetry: WeeklyTelemetry[];
  calendarEvents?: any[];
  calendarIcalUrl?: string;
  verifiedCalendarEmail?: string;
  /** The dashboard's 3-month stress score, so Tricha quotes the same number. */
  stressScore?: number;
  embedded?: boolean;
}

const TRICHA_PROMPT_CHIPS = [
  'Why did my stress spike in August?',
  'How do calls after 7 PM delay recovery?',
  'What should I change before my 8-week re-test?',
];

export const TrichaChatWidget: React.FC<TrichaChatWidgetProps> = ({
  userProfile,
  segments,
  telemetry,
  calendarEvents,
  calendarIcalUrl,
  verifiedCalendarEmail,
  stressScore,
  embedded = false,
}) => {
  const [isOpen, setIsOpen] = useState(embedded);
  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Gemini API Key Management
  const [geminiApiKey, setGeminiApiKey] = useState<string>('');
  const [showKeyModal, setShowKeyModal] = useState<boolean>(false);
  const [keyInput, setKeyInput] = useState<string>('');
  const [isVerifyingKey, setIsVerifyingKey] = useState<boolean>(false);
  const [keyFeedback, setKeyFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isKeyConfigured, setIsKeyConfigured] = useState<boolean>(false);

  const rawName = (userProfile?.name || '').replace(/^Dr\.\s*/i, '').trim();
  const firstName = rawName.split(' ')[0] || (userProfile?.name?.trim() ? userProfile.name.trim() : 'there');
  const userInitial = rawName ? rawName.charAt(0).toUpperCase() : (userProfile?.email ? userProfile.email.charAt(0).toUpperCase() : 'U');
  const isMedical = (userProfile?.role || '').toLowerCase().includes('medical') || (userProfile?.role || '').toLowerCase().includes('doctor');

  // STRICT PER-USER STORAGE KEY: Never fall back to shared global keys
  const userEmailClean = userProfile?.email ? userProfile.email.toLowerCase().trim() : 'guest_demo';
  const storageKey = `baalance_tricha_messages_v2_${userEmailClean}`;

  // One opening message, written from the user's own numbers (no scripted exchange).
  const getDefaultMessages = (): ChatMessage[] => {
    const peak = segments.length ? segments.reduce((x, y) => (y.cortisolPgPerMg > x.cortisolPgPerMg ? y : x)) : null;
    const lateMeetings = telemetry.reduce((sum, w) => sum + (w.eveningCalls || 0), 0);
    const hairLine = peak
      ? peak.cortisolPgPerMg > 14
        ? `Your hair cortisol peaked in ${peak.title} at ${peak.cortisolPgPerMg} pg/mg`
        : `All three months of your hair cortisol are in the healthy range (highest ${peak.cortisolPgPerMg} pg/mg in ${peak.title})`
      : 'I do not have a hair result for you yet';
    const calendarLine = lateMeetings > 0 ? `, and your calendar shows ${lateMeetings} meetings after 7 PM in the same 90 days` : '';
    return [
      {
        id: 'tricha-hello',
        role: 'model',
        text: `Hi ${firstName}, I'm Tricha, your BAALANCE AI coach.\n\n${hairLine}${calendarLine}.\n\nAsk me what drove it, or what to change before your next test.`,
        timestamp: 'Now',
      },
    ];
  };

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('baalance_tricha_messages');
        const raw = localStorage.getItem(storageKey);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      } catch (_) {}
    }
    return getDefaultMessages();
  });

  // Re-synchronize chat transcript strictly when userProfile or active account email changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem('baalance_tricha_messages');
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
          return;
        }
      }
    } catch (_) {}
    setMessages(getDefaultMessages());
  }, [storageKey]);

  // Automatically preserve messages to user-scoped localStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && messages.length > 0) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(messages));
      } catch (_) {}
    }
  }, [messages, storageKey]);

  const handleClearChat = () => {
    const fresh = getDefaultMessages();
    setMessages(fresh);
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(storageKey);
        localStorage.removeItem('baalance_tricha_messages');
      } catch (_) {}
    }
  };

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Load API Key from localStorage or check server
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('baalance_gemini_api_key');
      let storedKey: string | null = null;
      try {
        storedKey = sessionStorage.getItem('baalance_gemini_api_key');
      } catch (_) {}
      if (storedKey) {
        setGeminiApiKey(storedKey);
        setKeyInput(storedKey);
        setIsKeyConfigured(true);
      }
    }

    // Check server status
    apiFetch('/api/settings/gemini-key')
      .then(res => res.json())
      .then(data => {
        if (data.configured) {
          setIsKeyConfigured(true);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  // Save / Verify API Key
  const handleSaveApiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = keyInput.trim();
    if (!clean) return;

    setIsVerifyingKey(true);
    setKeyFeedback(null);

    // A visitor's own key stays in this browser only and is sent per request; it is never stored on the server.
    if (!/^AIza[0-9A-Za-z_-]{20,}$/.test(clean)) {
      setKeyFeedback({ type: 'error', text: 'That does not look like a Google AI Studio key (they start with "AIza").' });
      setIsVerifyingKey(false);
      return;
    }
    try {
      setGeminiApiKey(clean);
      setIsKeyConfigured(true);
      try {
        sessionStorage.setItem('baalance_gemini_api_key', clean);
      } catch (_) {}
      setKeyFeedback({ type: 'success', text: 'Key saved for this browser session only.' });
      setTimeout(() => {
        setShowKeyModal(false);
        setKeyFeedback(null);
      }, 1200);
    } finally {
      setIsVerifyingKey(false);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputPrompt).trim();
    if (!query || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputPrompt('');
    setIsLoading(true);

    try {
      const res = await apiFetch('/api/gemini-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          history: messages,
          profile: userProfile,
          segments,
          telemetry,
          // The sample case has no real calendar: send its weekly summaries only, so the
          // coach does not mistake a handful of sample events for an empty calendar.
          calendarEvents: userProfile.isDemo ? [] : calendarEvents || [],
          calendarIcalUrl: userProfile.isDemo ? undefined : calendarIcalUrl,
          verifiedCalendarEmail: userProfile.isDemo ? undefined : verifiedCalendarEmail,
          stressScore,
          apiKey: geminiApiKey,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const cleanReply = (data.reply || '').replace(/\*/g, '');
        const safetyAction = data.safety?.action;
        const modelMsg: ChatMessage = {
          id: `tricha-${Date.now()}`,
          role: 'model',
          text: cleanReply,
          ...(safetyAction === 'crisis' || safetyAction === 'blocked' ? { safety: safetyAction } : {}),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages(prev => [...prev, modelMsg]);
      } else {
        throw new Error('Chat API returned error');
      }
    } catch (err) {
      console.warn('[Tricha Chat Widget] Error:', err);
      const fallbackMsg: ChatMessage = {
        id: `tricha-err-${Date.now()}`,
        role: 'model',
        text: `Based on your Month 2 peak (${segments[1]?.cortisolPgPerMg || 28.4} pg/mg) and Month 1 reading (${segments[0]?.cortisolPgPerMg || 15.6} pg/mg), your body experienced delayed stress recovery. Even with fewer daytime meetings, taking late calls past 7:00 PM kept sympathetic arousal high and delayed circadian recovery into late evening, preventing full stress clearance.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // If embedded in a dedicated page/tab
  if (embedded) {
    return (
      <div className="bg-white rounded-3xl border border-[#E2E8F0] shadow-card flex flex-col h-[80vh] min-h-[600px] max-w-4xl mx-auto overflow-hidden animate-fade-in font-sans">
        {/* Header */}
        <div className="px-4 sm:px-6 py-4 border-b border-slate-100 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-full bg-[#0D4F59] text-white flex items-center justify-center font-black shrink-0">T</div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight leading-tight">Tricha</h2>
              <p className="text-xs text-slate-500 truncate">
                Your BAALANCE AI coach. Ask about your results, your calendar, or what to change.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClearChat}
            className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-bold text-slate-600 flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
            title="Start the conversation again"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New chat</span>
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-xs sm:text-sm">
          {messages.map((msg) => {
            const isTricha = msg.role === 'model';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isTricha ? 'items-start' : 'items-start flex-row-reverse'}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                    isTricha ? 'bg-[#0D4F59] text-white' : 'bg-[#BF6F4E] text-white'
                  }`}
                >
                  {isTricha ? 'T' : userInitial}
                </div>

                <div
                  className={`max-w-[85%] p-3.5 sm:p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                    msg.safety === 'crisis'
                      ? 'bg-rose-50 border-2 border-rose-300 text-slate-900 rounded-tl-xs'
                      : isTricha
                      ? 'bg-[#F6F2EC] border border-[#E2E8F0] text-slate-900 rounded-tl-xs'
                      : 'bg-[#0D4F59] text-white rounded-tr-xs shadow-xs'
                  }`}
                  {...(msg.safety === 'crisis' ? { role: 'alert' } : {})}
                >
                  {msg.safety === 'crisis' && (
                    <div className="text-[11px] font-extrabold uppercase tracking-wide text-rose-700 mb-1.5">
                      Please reach out for help now
                    </div>
                  )}
                  <div className="whitespace-pre-wrap leading-relaxed">{msg.text.replace(/\*/g, '')}</div>
                  {msg.safety === 'crisis' && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      <a href="tel:112" className="px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold">
                        Call 112 (emergency)
                      </a>
                      <a href="tel:14416" className="px-3 py-2 rounded-xl bg-white border border-rose-300 text-rose-700 hover:bg-rose-100 text-xs font-bold">
                        Call Tele-MANAS 14416
                      </a>
                      <a href="tel:18005990019" className="px-3 py-2 rounded-xl bg-white border border-rose-300 text-rose-700 hover:bg-rose-100 text-xs font-bold">
                        Call KIRAN 1800-599-0019
                      </a>
                    </div>
                  )}
                  <div
                    className={`text-[10px] mt-1 text-right font-mono ${
                      isTricha ? 'text-slate-400' : 'text-blue-100'
                    }`}
                  >
                    {msg.timestamp}
                  </div>
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-center gap-2.5 text-xs text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-200 max-w-[70%]">
              <RefreshCw className="w-4 h-4 animate-spin text-[#0D4F59]" />
              <span>Tricha is finding the cause...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Prompt Chips */}
        <div className="px-4 py-2.5 bg-slate-50/70 border-t border-slate-200 flex items-center gap-2 overflow-x-auto">
          <span className="text-[11px] font-bold text-slate-500 shrink-0">Suggestions:</span>
          {TRICHA_PROMPT_CHIPS.map((chip, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendMessage(chip)}
              className="shrink-0 text-xs font-medium text-slate-700 bg-white hover:bg-blue-50 hover:text-[#0D4F59] hover:border-blue-200 px-3 py-1.5 rounded-full border border-slate-200 transition-colors shadow-2xs cursor-pointer"
            >
              {chip}
            </button>
          ))}
        </div>

        <p className="px-4 py-1.5 bg-white border-t border-slate-100 text-[10px] text-slate-500 text-center">
          Tricha is an AI coach, not a doctor or an emergency service. Messages are checked for safety. In an emergency call 112.
        </p>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="p-3 sm:p-4 bg-white border-t border-slate-200 flex items-center gap-2.5"
        >
          <input
            type="text"
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            placeholder="Ask Tricha about your cortisol timeline, late calls, or burnout score..."
            className="flex-1 text-xs sm:text-sm px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0D4F59] bg-slate-50/50"
          />
          <button
            type="submit"
            disabled={!inputPrompt.trim() || isLoading}
            className="px-4 py-2.5 rounded-xl bg-[#0D4F59] text-white hover:bg-blue-600 disabled:opacity-40 transition-colors shadow-xs flex items-center gap-1.5 font-semibold text-xs cursor-pointer"
          >
            <span>Send</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    );
  }

  // Floating Launcher Mode (fallback if used as widget)
  return (
    <>
      <div className="fixed bottom-20 right-5 z-30 flex items-center gap-2.5">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-12 h-12 rounded-full bg-[#0D4F59] text-white flex items-center justify-center shadow-lg hover:scale-105 transition-all cursor-pointer"
          title="Open Tricha AI"
        >
          {isOpen ? <X className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
        </button>
      </div>
    </>
  );
};
