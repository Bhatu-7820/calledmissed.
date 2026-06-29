'use client';

import { Key, Bot, ShieldCheck, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

export default function GuideCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card max-w-xl mx-auto p-6 rounded-2xl shadow-xl flex flex-col gap-5 text-left border-indigo-500/10 hover:border-indigo-500/20 transition-all group overflow-hidden relative"
    >
      {/* Dynamic Glows */}
      <div className="absolute -top-10 -right-10 w-36 h-36 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/15 transition-all duration-500" />
      <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-fuchsia-500/10 rounded-full blur-3xl group-hover:bg-fuchsia-500/15 transition-all duration-500" />

      <div>
        <h2 className="text-xl font-bold bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-500 bg-clip-text text-transparent mb-1">
          CallMissed AI Assistant
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Your production-grade workspace powered by advanced streaming models.
        </p>
      </div>

      <div className="grid gap-4 z-10">
        <div className="flex gap-4">
          <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">1. Setup CallMissed API Key</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
              Retrieve your API key from the{' '}
              <a
                href="https://docs.callmissed.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-0.5"
              >
                CallMissed Docs <ExternalLink className="w-3 h-3" />
              </a>
              . Place it in your project&apos;s `.env.local` or enter it directly in the settings panel.
            </p>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-xl bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">2. Professional-Grade Models</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
              Powered by <code className="px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-purple-600 dark:text-purple-400 font-mono text-[10px]">kimi-k2.7-code</code> for all textual and visual responses, and <code className="px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-mono text-[10px]">flux-2-klein-9b</code> for stunning image generation when triggered by key phrases like <em className="text-slate-700 dark:text-slate-300">&quot;draw...&quot;</em> or <em className="text-slate-700 dark:text-slate-300">&quot;generate an image...&quot;</em>.
            </p>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">3. Secure Route Handlers</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
              Your API key stays safely server-side, locked in your serverless handler context. No client-side leaks.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
