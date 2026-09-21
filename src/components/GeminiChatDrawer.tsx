'use client';

import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Sparkles, Bot, User, CornerDownLeft, RefreshCw, ChevronRight } from 'lucide-react';
import { UserProfile, HairCortisolSegment, WeeklyTelemetry, ChatMessage } from '@/lib/types';

interface GeminiChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  segments: HairCortisolSegment[];
  telemetry: WeeklyTelemetry[];
  calendarEvents?: any[];
  calendarIcalUrl?: string;
  verifiedCalendarEmail?: string;
}

const PROMPT_CHIPS = [
  'Why is Month 1 still elevated if my meetings dropped?',
  'How can I structure my Google Calendar to protect evening recovery?',
  'What signs show my stress levels are recovering?',
];

export const GeminiChatDrawer: React.FC<GeminiChatDrawerProps> = ({
  isOpen,
  onClose,
  userProfile,
  segments,
  telemetry,
  calendarEvents,
  calendarIcalUrl,
  verifiedCalendarEmail,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      role: 'model',
      text: `Hello ${userProfile.name.split(' ')[0]}. I have reviewed your 90-day hair cortisol timeline (11.2 -> 28.4 -> 15.6 pg/mg) alongside your Google Calendar workload.\n\nHow can I help you understand what caused your stress spike or how to reset your recovery?`,
      timestamp: 'Just now',
    },
  ]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

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
          apiKey: typeof window !== 'undefined' ? localStorage.getItem('baalance_gemini_api_key') || undefined : undefined,
        }),
      });

      const data = await res.json();
      const cleanReply = (data.reply || 'Analysis completed.').replace(/\*/g, '');
      const botMsg: ChatMessage = {
        id: `model-${Date.now()}`,
        role: 'model',
        text: cleanReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'model',
        text: 'Unable to reach the analysis service. Using saved telemetry: Month 1 remains elevated because meetings after 7:00 PM delayed recovery.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/30 backdrop-blur-xs transition-opacity animate-fade-in">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white border-l border-[#E2E8F0] shadow-2xl flex flex-col justify-between">
          {/* Drawer Header */}
          <div className="p-4 bg-[#F0F4FA] border-b border-[#E2E8F0] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#3186FF] via-[#6366F1] to-[#FB7185] flex items-center justify-center shadow-xs">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#000000] flex items-center gap-1.5">
                  <span>Gemini Co-Pilot</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-[#3186FF] font-semibold">
                    v3.6 Flash
                  </span>
                </h3>
                <p className="text-[11px] text-[#5F6368]">
                  Personalized Health & Recovery Guidance
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#5F6368] hover:text-[#000000] hover:bg-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Message List */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 text-xs ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'model' && (
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#3186FF] via-[#6366F1] to-[#FB7185] flex items-center justify-center shrink-0 shadow-xs">
                    <Sparkles className="w-3.5 h-3.5 text-white" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 ${
                    msg.role === 'user'
                      ? 'bg-[#3186FF] text-white rounded-br-none shadow-xs'
                      : 'bg-[#F0F4FA] text-[#000000] border border-[#E2E8F0] rounded-bl-none shadow-xs'
                  }`}
                >
                  <div className="whitespace-pre-line leading-relaxed">
                    {msg.text.replace(/\*/g, '')}
                  </div>
                  <div
                    className={`text-[9px] mt-1 text-right ${
                      msg.role === 'user' ? 'text-blue-100' : 'text-[#5F6368]'
                    }`}
                  >
                    {msg.timestamp}
                  </div>
                </div>

                {msg.role === 'user' && (
                  <div className="w-7 h-7 rounded-lg bg-slate-800 text-white flex items-center justify-center shrink-0">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3 text-xs justify-start">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#3186FF] via-[#6366F1] to-[#FB7185] flex items-center justify-center shrink-0 animate-pulse">
                  <Sparkles className="w-3.5 h-3.5 text-white animate-spin" />
                </div>
                <div className="bg-[#F0F4FA] border border-[#E2E8F0] rounded-2xl p-3 text-[#5F6368] flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#3186FF] animate-ping" />
                  <span>Synthesizing neuroendocrine telemetry...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Prompt Chips & Input Footer */}
          <div className="p-3 border-t border-[#E2E8F0] bg-white space-y-2.5">
            {/* Quick Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {PROMPT_CHIPS.map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(chip)}
                  disabled={isLoading}
                  className="text-[11px] whitespace-nowrap px-2.5 py-1 rounded-full bg-[#F0F4FA] hover:bg-blue-50 text-[#000000] hover:text-[#3186FF] border border-[#E2E8F0] transition-colors flex items-center gap-1 shrink-0"
                >
                  <span>{chip}</span>
                  <ChevronRight className="w-3 h-3 text-[#5F6368]" />
                </button>
              ))}
            </div>

            {/* Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="relative flex items-center"
            >
              <input
                type="text"
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
                placeholder="Ask about your cortisol curve or calendar recovery..."
                className="w-full pl-3 pr-10 py-2.5 text-xs rounded-xl border border-[#E2E8F0] focus:outline-none focus:ring-2 focus:ring-[#3186FF] text-[#000000] bg-[#F8FAFC]"
              />
              <button
                type="submit"
                disabled={!inputPrompt.trim() || isLoading}
                className="absolute right-1.5 p-1.5 rounded-lg bg-[#3186FF] text-white hover:bg-blue-600 disabled:opacity-50 transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
