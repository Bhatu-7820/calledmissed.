'use client';

import { useState, useEffect } from 'react';
import { useChat } from '@/hooks/useChat';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import ChatWindow from '@/components/ChatWindow';
import MessageInput from '@/components/MessageInput';
import SettingsModal from '@/components/SettingsModal';

export default function Page() {
  const {
    chats,
    currentChat,
    isGenerating,
    config,
    updateConfig,
    createNewChat,
    selectChat,
    deleteChat,
    renameChat,
    sendMessage,
    regenerateResponse,
    stopGeneration,
    clearAllChats
  } = useChat();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl + K -> Open New Chat
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        createNewChat();
      }
      
      // Ctrl + / -> Toggle Sidebar or Settings Cheatsheet
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        setSidebarOpen((prev) => !prev);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [createNewChat]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 dark:bg-slate-950 font-sans text-slate-800 dark:text-slate-100 transition-colors relative">
      
      {/* Decorative Ambient Glows */}
      <div className="absolute top-10 left-1/4 w-[400px] h-[400px] bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-3xl animate-glow-slow select-none pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[400px] h-[400px] bg-fuchsia-500/5 dark:bg-fuchsia-500/10 rounded-full blur-3xl animate-glow-slow select-none pointer-events-none" style={{ animationDelay: '-6s' }} />

      {/* Sidebar Panel */}
      <Sidebar
        chats={chats}
        currentChatId={currentChat?.id || null}
        onSelectChat={selectChat}
        onCreateChat={() => createNewChat('New Chat')}
        onDeleteChat={deleteChat}
        onRenameChat={renameChat}
        onOpenSettings={() => setSettingsOpen(true)}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Workspace Panel */}
      <div className="flex-grow flex flex-col h-full overflow-hidden z-10">
        {/* Navigation header */}
        <Navbar
          currentChat={currentChat}
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
          onOpenSettings={() => setSettingsOpen(true)}
        />

        {/* Messaging area */}
        <ChatWindow
          currentChat={currentChat}
          isGenerating={isGenerating}
          onSendPrompt={sendMessage}
          onRegenerateMessage={regenerateResponse}
        />

        {/* Input Bar */}
        <div className="py-4 border-t border-slate-200/50 dark:border-slate-800/80 bg-white/40 dark:bg-slate-950/40 backdrop-blur-md">
          <MessageInput
            onSend={sendMessage}
            isGenerating={isGenerating}
            onStop={stopGeneration}
          />
        </div>
      </div>

      {/* Modal configurations */}
      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        config={config}
        updateConfig={updateConfig}
        onClearChats={clearAllChats}
      />
    </div>
  );
}
