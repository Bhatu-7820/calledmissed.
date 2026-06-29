'use client';

import { useRef, useEffect, useState, UIEvent } from 'react';
import { Chat, Message } from '@/types/chat';
import { ArrowDown, Code, Palette, Zap, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ChatBubble from './ChatBubble';
import LoadingBubble from './LoadingBubble';
import GuideCard from './GuideCard';

interface ChatWindowProps {
  currentChat: Chat | null;
  isGenerating: boolean;
  onSendPrompt: (content: string, image?: string) => void;
  onRegenerateMessage: (messageId: string) => void;
}

const QUICK_PROMPTS = [
  {
    icon: Code,
    title: "Write code",
    desc: "Create a React Hook for responsive media queries",
    prompt: "Write a complete custom React Hook in TypeScript to handle responsive media queries."
  },
  {
    icon: Palette,
    title: "Draw an image",
    desc: "Generate a futuristic cyberpunk city in neon glows",
    prompt: "Draw a futuristic cyberpunk city skyline illuminated by neon purple, cyan, and gold holograms, highly detailed digital art."
  },
  {
    icon: Zap,
    title: "Optimize script",
    desc: "Check a node script for memory leaks or bottlenecks",
    prompt: "Optimize this node.js streaming reader snippet for memory performance and prevent leaks."
  },
  {
    icon: Sparkles,
    title: "Explain math",
    desc: "Explain the Fourier Transform using LaTeX equations",
    prompt: "Explain the core concept of the Fourier Transform and show its formula using math block format."
  }
];

export default function ChatWindow({
  currentChat,
  isGenerating,
  onSendPrompt,
  onRegenerateMessage
}: ChatWindowProps) {
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const bottomAnchorRef = useRef<HTMLDivElement>(null);

  const messages = currentChat?.messages || [];
  const isThinking = isGenerating && messages.length > 0 && messages[messages.length - 1].isStreaming && !messages[messages.length - 1].content;

  // Auto-scroll to bottom on messages update
  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    bottomAnchorRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    scrollToBottom('smooth');
  }, [messages.length, isThinking]);

  // Handle scroll detection for the floating down button
  const handleScroll = (e: UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const isUp = container.scrollHeight - container.scrollTop - container.clientHeight > 300;
    setShowScrollBtn(isUp);
  };

  return (
    <div className="flex-grow flex flex-col h-full overflow-hidden relative bg-slate-50/50 dark:bg-slate-950/20">
      {/* Scrollable Area */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-grow overflow-y-auto px-4 py-6 md:px-8 space-y-6"
      >
        <div className="max-w-3xl mx-auto w-full flex flex-col">
          {messages.length === 0 ? (
            /* Empty State: Guide & Quick Prompts */
            <div className="flex flex-col gap-8 text-center pt-8 pb-12 w-full">
              <GuideCard />

              <div className="max-w-xl mx-auto w-full flex flex-col gap-3">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider select-none text-left">
                  Quick Prompts
                </span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {QUICK_PROMPTS.map((item, idx) => {
                    const IconComp = item.icon;
                    return (
                      <button
                        key={idx}
                        onClick={() => onSendPrompt(item.prompt)}
                        className="glass-card hover:bg-slate-100/50 dark:hover:bg-slate-900/50 p-4 rounded-2xl flex flex-col gap-1.5 text-left transition-all hover:scale-[1.01] hover:shadow-md border-indigo-500/5 hover:border-indigo-550/15 focus:outline-none focus:ring-1.5 focus:ring-indigo-500/20 group"
                      >
                        <div className="w-8 h-8 rounded-xl bg-indigo-500/5 dark:bg-indigo-500/10 text-indigo-550 dark:text-indigo-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                          <IconComp className="w-4 h-4" />
                        </div>
                        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1">
                          {item.title}
                        </h4>
                        <p className="text-[10px] text-slate-500 dark:text-slate-450 leading-relaxed font-medium">
                          {item.desc}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            /* Messages List */
            <div className="w-full flex flex-col">
              {messages.map((message, index) => (
                <ChatBubble
                  key={message.id}
                  message={message}
                  onRegenerate={onRegenerateMessage}
                  isLast={index === messages.length - 1}
                />
              ))}

              {/* Streaming loading skeleton */}
              {isThinking && <LoadingBubble />}
            </div>
          )}

          {/* Bottom anchoring target for scrolling */}
          <div ref={bottomAnchorRef} className="h-4 flex-shrink-0" />
        </div>
      </div>

      {/* Floating Scroll-to-Bottom trigger */}
      <AnimatePresence>
        {showScrollBtn && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            onClick={() => scrollToBottom('smooth')}
            className="absolute bottom-4 right-6 p-2.5 rounded-full bg-white/70 dark:bg-slate-900/70 border border-slate-250/50 dark:border-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-950 text-slate-500 hover:text-slate-800 dark:hover:text-slate-250 shadow-lg backdrop-blur-md transition-all hover:scale-110 active:scale-90 z-20 focus:outline-none focus:ring-2 focus:ring-primary/40"
            aria-label="Scroll to bottom"
          >
            <ArrowDown className="w-4 h-4" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
