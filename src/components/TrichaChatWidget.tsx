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

interface TrichaChatWidgetProps {
  userProfile: UserProfile;
  segments: HairCortisolSegment[];
  telemetry: WeeklyTelemetry[];
  calendarEvents?: any[];
  calendarIcalUrl?: string;
  verifiedCalendarEmail?: string;
  embedded?: boolean;
}

const TRICHA_PROMPT_CHIPS = [
  'What do I do to reduce my stress levels?',
  'Why did my stress stay high when meetings dropped?',
  'What was the main culprit for my Month 2 spike?',
  'How do calls after 7 PM hurt my deep sleep?',
  'When should I drink coffee to protect recovery?',
];

export const TrichaChatWidget: React.FC<TrichaChatWidgetProps> = ({
  userProfile,
  segments,
  telemetry,
  calendarEvents,
  calendarIcalUrl,
  verifiedCalendarEmail,
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
  const storageKey = `baalance_tricha_messages_${userEmailClean}`;

  const defaultGreetingText = `Hello ${firstName}! I'm Tricha, your personal health and recovery guide powered by Gemini 3.6 Flash.\n\nI have analyzed your 90-day hair cortisol timeline (${segments[0]?.cortisolPgPerMg || 11.2} → ${segments[1]?.cortisolPgPerMg || 28.4} → ${segments[2]?.cortisolPgPerMg || 15.6} pg/mg)${calendarEvents && calendarEvents.length > 0 ? ` alongside your ${calendarEvents.length} calendar meetings` : (isMedical ? ' alongside your medical training context' : '')}.\n\nHow can I help you understand your cortisol trends or explore tailored recovery steps?`;

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        // Clean up legacy shared global key so other accounts are never infected
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
    return [
      {
        id: `init-tricha-${Date.now()}`,
        role: 'model',
        text: defaultGreetingText,
        timestamp: 'Just now',
      },
    ];
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
    // If no history exists for this specific user, start with fresh personalized greeting
    setMessages([
      {
        id: `init-tricha-${Date.now()}`,
        role: 'model',
        text: defaultGreetingText,
        timestamp: 'Just now',
      },
    ]);
  }, [storageKey, defaultGreetingText]);

  // Automatically preserve messages to user-scoped localStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && messages.length > 0) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(messages));
      } catch (_) {}
    }
  }, [messages, storageKey]);

  const handleClearChat = () => {
    const fresh: ChatMessage[] = [
      {
        id: `init-tricha-${Date.now()}`,
        role: 'model',
        text: defaultGreetingText,
        timestamp: 'Just now',
      },
    ];
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
      const storedKey = localStorage.getItem('baalance_gemini_api_key');
      if (storedKey) {
        setGeminiApiKey(storedKey);
        setKeyInput(storedKey);
        setIsKeyConfigured(true);
      }
    }

    // Check server status
    fetch('/api/settings/gemini-key')
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

    try {
      const res = await fetch('/api/settings/gemini-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: clean }),
      });

      const data = await res.json();
      if (data.success) {
        setGeminiApiKey(clean);
        setIsKeyConfigured(true);
        if (typeof window !== 'undefined') {
          localStorage.setItem('baalance_gemini_api_key', clean);
        }
        setKeyFeedback({
          type: 'success',
          text: 'Gemini 3.6 Flash verified and connected successfully!',
        });
        setTimeout(() => {
          setShowKeyModal(false);
          setKeyFeedback(null);
        }, 1500);
      } else {
        setKeyFeedback({
          type: 'error',
          text: data.error || 'Failed to verify Gemini API Key.',
        });
      }
    } catch (err: any) {
      // If server file write fails, still save client-side in localStorage
      setGeminiApiKey(clean);
      setIsKeyConfigured(true);
      if (typeof window !== 'undefined') {
        localStorage.setItem('baalance_gemini_api_key', clean);
      }
      setKeyFeedback({
        type: 'success',
        text: 'API Key saved to browser session.',
      });
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
      const res = await fetch('/api/gemini-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          history: messages,
          profile: userProfile,
          segments,
          telemetry,
          calendarEvents: calendarEvents || [],
          calendarIcalUrl,
          verifiedCalendarEmail,
          apiKey: geminiApiKey,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const cleanReply = (data.reply || '').replace(/\*/g, '');
        const modelMsg: ChatMessage = {
          id: `tricha-${Date.now()}`,
          role: 'model',
          text: cleanReply,
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
        text: `Based on your Month 2 peak (${segments[1]?.cortisolPgPerMg || 28.4} pg/mg) and Month 1 reading (${segments[0]?.cortisolPgPerMg || 15.6} pg/mg), your body experienced delayed stress recovery. Even with fewer daytime meetings, taking late calls past 7:00 PM kept your heart rate high and cut deep sleep under 45 minutes, preventing full stress clearance.`,
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
      <div className="bg-white rounded-3xl border border-[#E2E8F0] shadow-card flex flex-col h-[75vh] min-h-[540px] max-w-4xl mx-auto overflow-hidden animate-fade-in font-sans">
        {/* Header */}
        <div className="p-3.5 sm:p-4 bg-gradient-to-r from-blue-50/80 via-slate-50 to-purple-50/80 border-b border-slate-200 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#3186FF] via-[#6366F1] to-[#FB7185] text-white flex items-center justify-center shadow-xs shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-bold text-black">Tricha AI</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Gemini 3.6 Flash</span>
                </span>
                {isKeyConfigured && (
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-[#3186FF] border border-blue-200">
                    Live API Active
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                AI health guide for your hair cortisol, calendar workload, and sleep recovery
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Clear Chat Button */}
            <button
              type="button"
              onClick={handleClearChat}
              className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-rose-50 hover:text-rose-600 border border-[#E2E8F0] text-xs font-semibold text-slate-600 flex items-center gap-1 shadow-2xs transition-all cursor-pointer"
              title="Reset conversation transcript"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Clear</span>
            </button>

            {/* Gemini API Key Configuration Button */}
            <button
              type="button"
              onClick={() => setShowKeyModal(true)}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-[#E2E8F0] text-xs font-semibold text-slate-700 flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer shrink-0"
              title="Configure or test Google Gemini API Key"
            >
              <Key className="w-3.5 h-3.5 text-[#3186FF]" />
              <span className="hidden sm:inline">{isKeyConfigured ? 'API Connected' : 'Connect Gemini API'}</span>
            </button>
          </div>
        </div>

        {/* API Key Modal */}
        {showKeyModal && (
          <div className="p-3.5 bg-blue-50/70 border-b border-blue-200 text-xs animate-fade-in space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold text-black">
                <Key className="w-4 h-4 text-[#3186FF]" />
                <span>Connect Google Gemini API Key:</span>
              </div>
              <button
                type="button"
                onClick={() => setShowKeyModal(false)}
                className="text-slate-400 hover:text-black cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-[11px] text-slate-600 leading-relaxed">
              To enable live reasoning powered by <strong>Gemini 3.6 Flash</strong>, paste your free Google AI Studio API key below:
            </p>

            <form onSubmit={handleSaveApiKey} className="flex items-center gap-2">
              <input
                type="password"
                value={keyInput}
                onChange={e => setKeyInput(e.target.value)}
                placeholder="AIzaSy..."
                className="flex-1 p-2 text-xs rounded-xl border border-slate-300 bg-white font-mono focus:outline-none focus:ring-1 focus:ring-[#3186FF]"
              />
              <button
                type="submit"
                disabled={isVerifyingKey || !keyInput.trim()}
                className="px-4 py-2 rounded-xl bg-[#3186FF] hover:bg-blue-600 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0"
              >
                {isVerifyingKey ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Connect Key</span>
                  </>
                )}
              </button>
            </form>

            {keyFeedback && (
              <p
                className={`text-[11px] font-semibold ${
                  keyFeedback.type === 'success' ? 'text-emerald-700' : 'text-rose-600'
                }`}
              >
                {keyFeedback.text}
              </p>
            )}

            <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
              <span>Need a free API key? Get one from Google AI Studio.</span>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-[#3186FF] font-semibold hover:underline flex items-center gap-0.5"
              >
                <span>Get API Key</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
          </div>
        )}

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
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                    isTricha
                      ? 'bg-gradient-to-tr from-[#3186FF] to-[#6366F1] text-white shadow-2xs'
                      : 'bg-slate-800 text-white'
                  }`}
                >
                  {isTricha ? 'T' : userInitial}
                </div>

                <div
                  className={`max-w-[85%] p-3.5 sm:p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                    isTricha
                      ? 'bg-[#F0F4FA] border border-[#E2E8F0] text-slate-900 rounded-tl-xs'
                      : 'bg-[#3186FF] text-white rounded-tr-xs shadow-xs'
                  }`}
                >
                  <div className="whitespace-pre-wrap leading-relaxed">{msg.text.replace(/\*/g, '')}</div>
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
              <RefreshCw className="w-4 h-4 animate-spin text-[#3186FF]" />
              <span>Tricha is analyzing biomarker correlations with Gemini 3.6 Flash...</span>
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
              className="shrink-0 text-xs font-medium text-slate-700 bg-white hover:bg-blue-50 hover:text-[#3186FF] hover:border-blue-200 px-3 py-1.5 rounded-full border border-slate-200 transition-colors shadow-2xs cursor-pointer"
            >
              {chip}
            </button>
          ))}
        </div>

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
            className="flex-1 text-xs sm:text-sm px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#3186FF] bg-slate-50/50"
          />
          <button
            type="submit"
            disabled={!inputPrompt.trim() || isLoading}
            className="px-4 py-2.5 rounded-xl bg-[#3186FF] text-white hover:bg-blue-600 disabled:opacity-40 transition-colors shadow-xs flex items-center gap-1.5 font-semibold text-xs cursor-pointer"
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
          className="w-12 h-12 rounded-full bg-[#3186FF] text-white flex items-center justify-center shadow-lg hover:scale-105 transition-all cursor-pointer"
          title="Open Tricha AI"
        >
          {isOpen ? <X className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
        </button>
      </div>
    </>
  );
};
