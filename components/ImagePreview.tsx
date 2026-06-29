'use client';

import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ImagePreviewProps {
  src: string | null;
  onRemove: () => void;
}

export default function ImagePreview({ src, onRemove }: ImagePreviewProps) {
  return (
    <AnimatePresence>
      {src && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 10 }}
          className="relative inline-block mt-2 group"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt="Upload preview"
            className="w-20 h-20 object-cover rounded-xl border border-slate-200 dark:border-slate-800 shadow-md backdrop-blur-sm"
          />
          <button
            type="button"
            onClick={onRemove}
            className="absolute -top-2 -right-2 p-1 rounded-full bg-slate-905 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-red-500 hover:border-red-500/30 transition-all shadow-md focus:outline-none hover:scale-110 active:scale-95"
            aria-label="Remove image"
          >
            <X className="w-3 h-3" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
