'use client';

import { useState } from 'react';
import { Download, Copy, ExternalLink, Check, Image as ImageIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface GeneratedImageCardProps {
  src: string; // Base64 data URI
  prompt: string;
}

export default function GeneratedImageCard({ src, prompt }: GeneratedImageCardProps) {
  const [copied, setCopied] = useState(false);
  const [loadingCopy, setLoadingCopy] = useState(false);

  const handleDownload = () => {
    try {
      const link = document.createElement('a');
      link.href = src;
      // Extract a nice name from prompt or use default
      const cleanPrompt = prompt.replace(/[^a-z0-9]/gi, '_').toLowerCase().substring(0, 30);
      link.download = `callmissed_flux_${cleanPrompt || 'generation'}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      alert("Failed to download image.");
    }
  };

  const handleCopy = async () => {
    if (loadingCopy) return;
    setLoadingCopy(true);
    try {
      // Decode base64 to blob
      const res = await fetch(src);
      const blob = await res.blob();
      
      // Clipboard write requires secure contexts or compatible formats
      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob
        })
      ]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      // Fallback: Copy base64 string to clipboard
      try {
        await navigator.clipboard.writeText(src);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        alert("Clipboard copy failed.");
      }
    } finally {
      setLoadingCopy(false);
    }
  };

  const handleOpenImage = () => {
    try {
      const newTab = window.open();
      if (newTab) {
        newTab.document.write(`
          <html>
            <head>
              <title>Generated Image - CallMissed</title>
              <style>
                body { margin: 0; background: #0a0f1e; display: flex; align-items: center; justify-content: center; height: 100vh; overflow: hidden; font-family: sans-serif; }
                img { max-width: 95%; max-height: 95%; border-radius: 12px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.05); }
              </style>
            </head>
            <body>
              <img src="${src}" alt="${prompt}" />
            </body>
          </html>
        `);
        newTab.document.close();
      }
    } catch (e) {
      alert("Popup blocker prevented opening the image.");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-card rounded-2xl overflow-hidden shadow-lg border border-slate-200/50 dark:border-slate-800/80 group max-w-lg mt-2 relative"
    >
      {/* Image Container with Hover Actions Overlay */}
      <div className="relative overflow-hidden aspect-square w-full sm:w-[400px] h-[400px] bg-slate-900/10 dark:bg-slate-950/20 flex items-center justify-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={prompt}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
        />

        {/* Hover Action controls */}
        <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3.5 backdrop-blur-xs">
          <button
            onClick={handleDownload}
            className="p-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white shadow-lg backdrop-blur-sm transition-all hover:scale-110 active:scale-90"
            title="Download Image"
            aria-label="Download Image"
          >
            <Download className="w-5 h-5" />
          </button>
          
          <button
            onClick={handleCopy}
            disabled={loadingCopy}
            className="p-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white shadow-lg backdrop-blur-sm transition-all hover:scale-110 active:scale-90"
            title={copied ? "Copied!" : "Copy Image"}
            aria-label="Copy Image"
          >
            {copied ? <Check className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
          </button>

          <button
            onClick={handleOpenImage}
            className="p-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white shadow-lg backdrop-blur-sm transition-all hover:scale-110 active:scale-90"
            title="Open Full Image"
            aria-label="Open Full Image"
          >
            <ExternalLink className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Info bar */}
      <div className="p-3 bg-white/30 dark:bg-slate-900/60 border-t border-slate-200/50 dark:border-slate-800/80 flex items-center gap-2">
        <ImageIcon className="w-4 h-4 text-indigo-500 flex-shrink-0" />
        <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[90%]" title={prompt}>
          {prompt}
        </span>
      </div>
    </motion.div>
  );
}
