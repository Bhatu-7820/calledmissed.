'use client';

import { useState, useRef, useEffect } from 'react';
import { Chat } from '@/types/chat';
import {
  MessageSquare,
  Plus,
  Trash2,
  Edit2,
  Check,
  Settings,
  HelpCircle,
  ExternalLink,
  Bot,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SidebarProps {
  chats: Chat[];
  currentChatId: string | null;
  onSelectChat: (chatId: string) => void;
  onCreateChat: () => void;
  onDeleteChat: (chatId: string) => void;
  onRenameChat: (chatId: string, newTitle: string) => void;
  onOpenSettings: () => void;
  // Responsive sidebar states
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({
  chats,
  currentChatId,
  onSelectChat,
  onCreateChat,
  onDeleteChat,
  onRenameChat,
  onOpenSettings,
  isOpen,
  onClose
}: SidebarProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const editInputRef = useRef<HTMLInputElement>(null);

  // Focus input when editing starts
  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingId]);

  const handleStartEdit = (chat: Chat, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(chat.id);
    setEditTitle(chat.title);
  };

  const handleSaveRename = (chatId: string) => {
    if (editTitle.trim()) {
      onRenameChat(chatId, editTitle.trim());
    }
    setEditingId(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent, chatId: string) => {
    if (e.key === 'Enter') {
      handleSaveRename(chatId);
    } else if (e.key === 'Escape') {
      setEditingId(null);
    }
  };

  const handleChatSelect = (chatId: string) => {
    onSelectChat(chatId);
    onClose(); // Close mobile drawer
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 border-r border-slate-200/50 dark:border-slate-800/80 w-[260px] text-slate-800 dark:text-slate-100 p-4 gap-4 z-40 relative">
      {/* Sidebar Close Button for Mobile */}
      <button
        onClick={onClose}
        className="md:hidden absolute top-4 right-4 p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-900 transition-colors"
        aria-label="Close sidebar"
      >
        <X className="w-5 h-5 text-slate-500" />
      </button>

      {/* Header Logo */}
      <div className="flex items-center gap-2.5 px-1 py-2">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-650 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
          <Bot className="w-4.5 h-4.5" />
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-sm bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-500 bg-clip-text text-transparent tracking-tight leading-none">
            CallMissed
          </span>
          <span className="text-[10px] text-slate-400 font-medium tracking-wider uppercase mt-0.5">
            AI Assistant
          </span>
        </div>
      </div>

      {/* New Chat Trigger */}
      <button
        onClick={() => {
          onCreateChat();
          onClose();
        }}
        className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-650 hover:to-purple-750 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all hover:scale-[1.01] hover:shadow-lg shadow-indigo-500/10 active:scale-98"
      >
        <Plus className="w-4 h-4" />
        New Chat
      </button>

      {/* Chat History List */}
      <div className="flex-grow flex flex-col gap-1 overflow-y-auto pr-1">
        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 px-1 py-1.5 tracking-wider uppercase select-none">
          Conversations
        </span>

        <div className="flex flex-col gap-1">
          <AnimatePresence initial={false}>
            {chats.map((chat) => {
              const isActive = chat.id === currentChatId;
              const isEditing = chat.id === editingId;

              return (
                <motion.div
                  key={chat.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.15 }}
                  onClick={() => !isEditing && handleChatSelect(chat.id)}
                  className={cn(
                    "group relative flex items-center justify-between rounded-xl px-3.5 py-2.5 cursor-pointer text-xs transition-all border border-transparent select-none",
                    isActive
                      ? "bg-indigo-500/10 dark:bg-indigo-500/15 text-indigo-755 dark:text-indigo-300 font-semibold border-indigo-550/15"
                      : "hover:bg-slate-100 dark:hover:bg-slate-900/60 text-slate-650 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                  )}
                >
                  {/* Icon & Title */}
                  <div className="flex items-center gap-2.5 overflow-hidden flex-grow mr-2">
                    <MessageSquare className={cn("w-4 h-4 flex-shrink-0", isActive ? "text-indigo-500" : "text-slate-400")} />
                    
                    {isEditing ? (
                      <input
                        ref={editInputRef}
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onBlur={() => handleSaveRename(chat.id)}
                        onKeyDown={(e) => handleKeyDown(e, chat.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-transparent border-b border-indigo-555 focus:outline-none w-full text-slate-800 dark:text-slate-200 py-0.5 text-xs font-medium"
                      />
                    ) : (
                      <span className="truncate pr-1" title={chat.title}>
                        {chat.title}
                      </span>
                    )}
                  </div>

                  {/* Actions (Rename / Delete) */}
                  {!isEditing && (
                    <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-200 flex-shrink-0">
                      <button
                        onClick={(e) => handleStartEdit(chat, e)}
                        className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-650 dark:hover:text-slate-350"
                        title="Rename conversation"
                        aria-label={`Rename ${chat.title}`}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Delete conversation "${chat.title}"?`)) {
                            onDeleteChat(chat.id);
                          }
                        }}
                        className="p-1 rounded hover:bg-red-500/10 text-slate-400 hover:text-red-550 dark:hover:text-red-400"
                        title="Delete conversation"
                        aria-label={`Delete ${chat.title}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {isEditing && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSaveRename(chat.id);
                      }}
                      className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-emerald-500"
                      aria-label="Confirm rename"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Footer Controls */}
      <div className="flex flex-col gap-1 border-t border-slate-200/50 dark:border-slate-800/80 pt-4 flex-shrink-0 text-xs">
        {/* API Docs Link */}
        <a
          href="https://docs.callmissed.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between rounded-xl px-3 py-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 transition-all font-medium"
        >
          <div className="flex items-center gap-2.5">
            <HelpCircle className="w-4 h-4 text-slate-400" />
            <span>Documentation</span>
          </div>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>

        {/* Settings button */}
        <button
          onClick={onOpenSettings}
          className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 transition-all font-medium w-full text-left"
          aria-label="Open settings panel"
        >
          <Settings className="w-4 h-4 text-slate-400" />
          <span>Settings</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden md:block h-screen flex-shrink-0">
        {sidebarContent}
      </div>

      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-40 md:hidden flex">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs"
            />
            {/* Sliding Sidebar Panel */}
            <motion.div
              initial={{ x: -260 }}
              animate={{ x: 0 }}
              exit={{ x: -260 }}
              transition={{ type: 'tween', ease: 'easeInOut', duration: 0.3 }}
              className="relative h-full"
            >
              {sidebarContent}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
