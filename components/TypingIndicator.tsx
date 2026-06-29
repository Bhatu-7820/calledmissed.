'use client';

import { motion } from 'framer-motion';

export default function TypingIndicator() {
  const dotVariants = {
    animate: (i: number) => ({
      y: [0, -6, 0],
      transition: {
        duration: 0.8,
        repeat: Infinity,
        ease: "easeInOut",
        delay: i * 0.15,
      },
    }),
  };

  return (
    <div className="flex items-center gap-1 px-1 py-1" aria-label="Assistant is thinking">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          custom={i}
          variants={dotVariants}
          animate="animate"
          className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500"
        />
      ))}
    </div>
  );
}
