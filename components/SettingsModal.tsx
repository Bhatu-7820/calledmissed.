'use client';

import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Key, Settings, Trash2, Eye, EyeOff, Sliders, MessageSquare } from 'lucide-react';
import { AppConfig } from '@/types/chat';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: AppConfig;
  updateConfig: (config: Partial<AppConfig>) => void;
  onClearChats: () => void;
}

export default function SettingsModal({
  isOpen,
  onClose,
  config,
  updateConfig,
  onClearChats
}: SettingsModalProps) {
  const [mounted, setMounted] = useState(false);
  const [showKey, setShowKey] = useState(false);
  
  // Form states initialized from config
  const [apiKey, setApiKey] = useState(config.apiKey || '');
  const [temperature, setTemperature] = useState(config.temperature);
  const [systemPrompt, setSystemPrompt] = useState(config.systemPrompt);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync state with config changes when modal opens
  useEffect(() => {
    if (isOpen) {
      setApiKey(config.apiKey || '');
      setTemperature(config.temperature);
      setSystemPrompt(config.systemPrompt);
    }
  }, [isOpen, config]);

  // Handle ESC key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleSave = () => {
    updateConfig({
      apiKey: apiKey.trim() || undefined,
      temperature,
      systemPrompt: systemPrompt.trim()
    });
    onClose();
  };

  const handleClear = () => {
    if (confirm("Are you sure you want to delete all chats? This cannot be undone.")) {
      onClearChats();
      onClose();
    }
  };

  if (!mounted) return null;

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 15 }}
            transition={{ type: 'spring', duration: 0.3 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="settings-title"
            aria-describedby="settings-desc"
            className="glass-panel w-full max-w-lg rounded-2xl shadow-2xl relative overflow-hidden z-10 p-6 flex flex-col gap-6"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-slate-800/80 pb-4">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-indigo-500 animate-spin-slow" />
                <h2 id="settings-title" className="text-lg font-bold text-slate-850 dark:text-slate-100">
                  Settings
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors text-slate-500 hover:text-slate-700 dark:hover:text-slate-350"
                aria-label="Close settings"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p id="settings-desc" className="sr-only">
              Configure your API configurations, model settings, and conversation preferences.
            </p>

            {/* Scrollable Form Area */}
            <div className="flex flex-col gap-5 overflow-y-auto max-h-[60vh] pr-1">
              {/* API Key Override */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-350 flex items-center gap-1.5">
                  <Key className="w-4 h-4 text-indigo-500" />
                  CallMissed API Key
                </label>
                <div className="relative flex items-center">
                  <input
                    type={showKey ? 'text' : 'password'}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="cm_..."
                    className="glass-input w-full px-3 py-2 pr-10 rounded-xl text-sm font-mono text-slate-800 dark:text-slate-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-3 p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                    aria-label={showKey ? "Hide API key" : "Show API key"}
                  >
                    {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-450 leading-relaxed">
                  Overrides the server-side API Key configuration. Key is stored locally in your browser.
                </p>
              </div>

              {/* Temperature Selector */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-350 flex items-center gap-1.5">
                    <Sliders className="w-4 h-4 text-indigo-500" />
                    Temperature: {temperature}
                  </label>
                  <span className="text-[10px] text-slate-500 font-medium">
                    {temperature === 0 ? 'Deterministic' : temperature > 0.8 ? 'Creative' : 'Balanced'}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1.2"
                  step="0.1"
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 dark:bg-slate-850 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
                <p className="text-[10px] text-slate-500 dark:text-slate-450 leading-relaxed">
                  Controls the randomness of generated content. Lower values output strict, predictable text.
                </p>
              </div>

              {/* System Prompt */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-350 flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-indigo-500" />
                  System Instructions
                </label>
                <textarea
                  rows={3}
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  placeholder="Set base instructions for the assistant..."
                  className="glass-input w-full px-3 py-2 rounded-xl text-sm text-slate-800 dark:text-slate-200 leading-relaxed resize-none"
                />
              </div>

              {/* Clear History Panel */}
              <div className="flex items-center justify-between border-t border-slate-200/50 dark:border-slate-800/80 pt-4 mt-2">
                <div>
                  <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-200">Clear Workspace History</h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-450 mt-0.5">
                    Permanently delete all conversation threads.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleClear}
                  className="px-3.5 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/25 border border-red-500/20 text-red-650 dark:text-red-400 font-semibold text-xs flex items-center gap-1.5 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear Chats
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 border-t border-slate-200/50 dark:border-slate-800/80 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-750 shadow-md hover:shadow-lg rounded-xl transition-all hover:scale-[1.02]"
              >
                Save Preferences
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}
