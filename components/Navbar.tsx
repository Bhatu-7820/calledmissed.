'use client';

import { Menu, Settings, Cpu, Sparkles } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import { Chat } from '@/types/chat';

interface NavbarProps {
  currentChat: Chat | null;
  onToggleSidebar: () => void;
  onOpenSettings: () => void;
}

export default function Navbar({
  currentChat,
  onToggleSidebar,
  onOpenSettings
}: NavbarProps) {
  return (
    <header className="glass-panel sticky top-0 z-30 w-full flex items-center justify-between px-4 py-3 border-b border-slate-200/50 dark:border-slate-800/80 backdrop-blur-md">
      {/* Left controls */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="md:hidden p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 focus:outline-none"
          aria-label="Open sidebar drawer"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Chat Title */}
        <div className="flex flex-col">
          <h1 className="text-sm font-bold text-slate-850 dark:text-slate-100 max-w-[180px] sm:max-w-[300px] truncate leading-tight select-none">
            {currentChat ? currentChat.title : 'No Active Conversation'}
          </h1>
          <span className="text-[9px] text-slate-450 font-medium select-none hidden sm:inline-block">
            CallMissed Workspace
          </span>
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2">
        {/* Model Indicator Badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900/60 border border-slate-250/50 dark:border-slate-800/80 text-xs font-medium text-slate-650 dark:text-slate-350 select-none">
          <Cpu className="w-3.5 h-3.5 text-indigo-500" />
          <span className="font-mono text-[10px]">kimi-k2.7-code</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        </div>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Mobile Settings Button */}
        <button
          onClick={onOpenSettings}
          className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 transition-all hover:scale-105 active:scale-95 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 border border-slate-200/50 dark:border-slate-800/80 bg-white/40 dark:bg-slate-900/40 shadow-sm focus:outline-none"
          aria-label="Open settings"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
