'use client';

import { useState, useRef, useEffect, KeyboardEvent, ClipboardEvent, DragEvent } from 'react';
import { Send, Square, Loader2 } from 'lucide-react';
import UploadImageButton from './UploadImageButton';
import ImagePreview from './ImagePreview';
import { cn } from '@/lib/utils';

interface MessageInputProps {
  onSend: (content: string, image?: string) => void;
  isGenerating: boolean;
  onStop: () => void;
}

export default function MessageInput({ onSend, isGenerating, onStop }: MessageInputProps) {
  const [input, setInput] = useState('');
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea height
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
  }, [input]);

  // Handle message sending
  const handleSend = () => {
    const trimmedInput = input.trim();
    if (!trimmedInput && !attachedImage) return;

    onSend(trimmedInput, attachedImage || undefined);
    setInput('');
    setAttachedImage(null);

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.focus();
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Keyboard listener to global focus on input (Ctrl + K / Ctrl + / handles elsewhere)
  // Let's allow focus on standard typing or simple interactions
  
  // Clipboard paste listener
  const handlePaste = (e: ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.indexOf('image') !== -1) {
        const file = item.getAsFile();
        if (!file) continue;

        e.preventDefault();
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            setAttachedImage(reader.result);
          }
        };
        reader.readAsDataURL(file);
        break;
      }
    }
  };

  // Drag and Drop listeners
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            setAttachedImage(reader.result);
          }
        };
        reader.readAsDataURL(file);
      } else {
        alert('Only image files can be dragged here for visual input.');
      }
    }
  };

  const hasContent = input.trim().length > 0 || !!attachedImage;

  return (
    <div className="flex flex-col gap-2 w-full max-w-3xl mx-auto px-4 md:px-0">
      {/* File preview */}
      <ImagePreview src={attachedImage} onRemove={() => setAttachedImage(null)} />

      {/* Input container box */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "relative flex items-end gap-2 p-2 rounded-2xl border bg-white/50 dark:bg-slate-900/50 backdrop-blur-md transition-all shadow-sm focus-within:shadow-md focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary/50",
          isDragging ? "border-indigo-500 bg-indigo-500/5 dark:bg-indigo-500/10 scale-[1.01]" : "border-slate-200 dark:border-slate-800"
        )}
      >
        {/* Upload attachment button */}
        <UploadImageButton onImageSelected={setAttachedImage} disabled={isGenerating} />

        {/* Text Input area */}
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          placeholder="Ask a question, paste screenshots, or type 'draw a neon cat'..."
          rows={1}
          disabled={isGenerating && !textareaRef.current?.value} // Disable typing only if completely blocked, but allow typing ahead if preferred
          className="flex-grow bg-transparent border-0 outline-none text-slate-850 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm py-2 px-1 max-h-[200px] overflow-y-auto resize-none"
        />

        {/* Send / Stop Buttons */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {isGenerating ? (
            <button
              type="button"
              onClick={onStop}
              className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-red-500 text-white transition-all shadow-md active:scale-95 flex items-center justify-center border border-slate-700/50 dark:border-slate-800"
              title="Stop generating"
              aria-label="Stop generation"
            >
              <Square className="w-4 h-4 fill-white" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSend}
              disabled={!hasContent}
              className={cn(
                "p-2.5 rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center",
                hasContent
                  ? "bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-650 hover:to-purple-750 text-white shadow-indigo-500/10"
                  : "bg-slate-100 dark:bg-slate-900/60 text-slate-400 dark:text-slate-650 border border-slate-200/50 dark:border-slate-800/80 cursor-not-allowed"
              )}
              title="Send message"
              aria-label="Send message"
            >
              <Send className="w-4.5 h-4.5" />
            </button>
          )}
        </div>

        {/* Drag/Drop visual overlay notifier */}
        {isDragging && (
          <div className="absolute inset-0 rounded-2xl pointer-events-none border-2 border-dashed border-indigo-500 bg-indigo-500/5 flex items-center justify-center backdrop-blur-xs">
            <span className="text-xs font-bold text-indigo-500">Drop Image Here to Analyze</span>
          </div>
        )}
      </div>
      
      {/* Footer shortcut helper */}
      <span className="text-[10px] text-slate-400 dark:text-slate-500 text-center select-none hidden sm:block">
        Press <kbd className="px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-900 border dark:border-slate-800 font-mono text-[9px]">Enter</kbd> to Send, <kbd className="px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-900 border dark:border-slate-800 font-mono text-[9px]">Shift + Enter</kbd> for new line.
      </span>
    </div>
  );
}
