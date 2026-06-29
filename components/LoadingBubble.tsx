'use client';

import { Sparkles } from 'lucide-react';
import TypingIndicator from './TypingIndicator';

export default function LoadingBubble() {
  return (
    <div className="flex items-start gap-4.5 py-4 w-full">
      <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white shadow-md">
        <Sparkles className="w-4.5 h-4.5 animate-pulse-slow" />
      </div>
      <div className="flex flex-col gap-2 max-w-[80%]">
        <div className="glass-card rounded-2xl px-4.5 py-3 shadow-md border border-slate-200/40 dark:border-slate-800/40 flex flex-col gap-1.5 min-w-[120px]">
          <span className="text-[10px] text-indigo-500 font-mono font-bold tracking-wider uppercase">Thinking</span>
          <TypingIndicator />
        </div>
      </div>
    </div>
  );
}
