'use client';

import { AlertTriangle, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';

interface ErrorCardProps {
  error: string;
  status?: number;
  onRetry: () => void;
}

export default function ErrorCard({ error, status, onRetry }: ErrorCardProps) {
  // Map standard error code headers
  const getErrorMessage = () => {
    if (status === 401) {
      return {
        title: "Authentication Failed (401)",
        desc: "Your CallMissed API key is invalid, missing, or inactive. Please verify it in your project's .env.local file or update it in the Settings panel."
      };
    }
    if (status === 402) {
      return {
        title: "Payment Required (402)",
        desc: "Your CallMissed account balance is insufficient. Please recharge your credits to proceed."
      };
    }
    if (status === 403) {
      return {
        title: "Access Forbidden (403)",
        desc: "You don't have access to this resource. Please make sure you are using the correct endpoint or model configurations."
      };
    }
    if (status === 404) {
      return {
        title: "Endpoint Not Found (404)",
        desc: "The requested model URL or configuration could not be located on the CallMissed servers."
      };
    }
    if (status === 429) {
      return {
        title: "Rate Limit Exceeded (429)",
        desc: "You have sent too many requests in a short period. Please wait a few seconds before trying again."
      };
    }
    if (status === 500) {
      return {
        title: "Server Error (500)",
        desc: "CallMissed backend returned an internal server error. The service might be temporarily offline."
      };
    }
    if (error.includes("unsupported_image_input")) {
      return {
        title: "Unsupported Image Input",
        desc: "The uploaded image format or dimensions are not supported by the Kimi vision model."
      };
    }

    return {
      title: `Error Occurred${status ? ` (${status})` : ''}`,
      desc: error || "An unexpected network error occurred while communicating with CallMissed."
    };
  };

  const message = getErrorMessage();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-card max-w-lg rounded-2xl border-red-500/20 bg-red-500/5 dark:bg-red-950/10 p-5 flex flex-col gap-4 shadow-lg text-left"
    >
      <div className="flex gap-4.5">
        <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-xl bg-red-500/10 text-red-650 dark:text-red-400">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div className="flex flex-col gap-1">
          <h3 className="text-sm font-bold text-slate-800 dark:text-red-400">
            {message.title}
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-450 leading-relaxed">
            {message.desc}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-end border-t border-red-500/10 pt-3">
        <button
          type="button"
          onClick={onRetry}
          className="px-3.5 py-1.5 rounded-xl bg-red-500/10 dark:bg-red-500/20 hover:bg-red-500/20 dark:hover:bg-red-500/30 text-red-650 dark:text-red-300 hover:text-red-750 font-semibold text-xs flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Retry Request
        </button>
      </div>
    </motion.div>
  );
}
