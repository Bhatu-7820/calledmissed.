'use client';

import { useState } from 'react';
import { Message } from '@/types/chat';
import { User, Sparkles, Copy, Check, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn, formatTime } from '@/lib/utils';
import MarkdownRenderer from './MarkdownRenderer';
import GeneratedImageCard from './GeneratedImageCard';
import ErrorCard from './ErrorCard';

interface ChatBubbleProps {
  message: Message;
  onRegenerate?: (messageId: string) => void;
  isLast?: boolean;
}

export default function ChatBubble({ message, onRegenerate, isLast }: ChatBubbleProps) {
  const [copied, setCopied] = useState(false);

  const isUser = message.role === 'user';
  const hasImage = !!message.image;
  const isGeneratedImage = !isUser && hasImage && !message.error;
  const isError = !!message.error;

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (_) {}
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "group flex gap-4.5 py-4 w-full select-text",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          "flex-shrink-0 flex items-center justify-center w-8.5 h-8.5 rounded-xl shadow-md border text-white transition-transform hover:scale-105",
          isUser
            ? "bg-slate-700 border-slate-600 dark:bg-slate-800 dark:border-slate-700"
            : "bg-gradient-to-tr from-indigo-500 to-purple-600 border-indigo-400/25"
        )}
      >
        {isUser ? <User className="w-4.5 h-4.5" /> : <Sparkles className="w-4.5 h-4.5" />}
      </div>

      {/* Bubble Core */}
      <div className={cn("flex flex-col gap-1.5 max-w-[80%]", isUser ? "items-end" : "items-start")}>
        {/* Info row */}
        <div className="flex items-center gap-2.5 px-1">
          <span className="text-[10px] font-bold text-slate-500 tracking-wide uppercase">
            {isUser ? 'You' : 'Assistant'}
          </span>
          {message.modelUsed && (
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-900/60 text-indigo-550 dark:text-indigo-400 border border-slate-200/50 dark:border-slate-800/80">
              {message.modelUsed}
            </span>
          )}
          <span className="text-[9px] text-slate-400 font-mono">
            {formatTime(message.timestamp)}
          </span>
        </div>

        {/* Content Box */}
        {isError ? (
          <ErrorCard
            error={message.error || "Generation Error"}
            status={(message as any).status || 500}
            onRetry={() => onRegenerate?.(message.id)}
          />
        ) : isGeneratedImage ? (
          <div className="flex flex-col gap-2">
            <GeneratedImageCard src={message.image!} prompt={message.content} />
          </div>
        ) : (
          <div
            className={cn(
              "rounded-2xl px-4.5 py-3 shadow-md border leading-relaxed flex flex-col gap-2 w-full",
              isUser
                ? "bg-indigo-600/10 border-indigo-500/20 dark:bg-violet-600/10 dark:border-violet-500/20 text-slate-850 dark:text-slate-100"
                : "glass-card text-slate-800 dark:text-slate-200",
              message.isStreaming && "streaming-cursor"
            )}
          >
            {/* Visual Attachment Preview (User Image upload) */}
            {isUser && hasImage && (
              <div className="mb-2 max-w-sm rounded-xl overflow-hidden border border-slate-200/50 dark:border-slate-800/50 shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={message.image}
                  alt="User upload"
                  className="w-full max-h-56 object-cover"
                />
              </div>
            )}
            
            {message.content ? (
              <MarkdownRenderer content={message.content} />
            ) : (
              !message.isStreaming && <span className="text-slate-400 dark:text-slate-500 italic text-xs">No response content</span>
            )}
          </div>
        )}

        {/* Bottom Actions Row */}
        {!isError && !isGeneratedImage && !message.isStreaming && (
          <div className="flex items-center gap-2 mt-1 px-1 opacity-0 group-hover:opacity-100 hover:opacity-100 focus-within:opacity-100 transition-opacity duration-200">
            <button
              onClick={handleCopyText}
              className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-400 hover:text-slate-650 dark:hover:text-slate-300 transition-colors focus:outline-none"
              title="Copy message"
              aria-label="Copy message"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
            {!isUser && onRegenerate && (
              <button
                onClick={() => onRegenerate(message.id)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-400 hover:text-slate-650 dark:hover:text-slate-300 transition-colors focus:outline-none"
                title="Regenerate message"
                aria-label="Regenerate message"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
