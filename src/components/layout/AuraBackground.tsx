'use client';

/**
 * AuraBackground - Dot pattern background with subtle gradient overlay
 * Creates a sophisticated, professional atmosphere for the portfolio
 */

import { motion } from 'framer-motion';

export function AuraBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-background">
      {/* Dot pattern */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(circle, rgba(255, 255, 255, 0.1) 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
      />

      {/* Subtle animated gradient overlay for depth */}
      <motion.div
        className="absolute inset-0 opacity-20"
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.15), transparent 50%)',
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.15, 0.25, 0.15],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Radial gradient vignette */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-background/60" />
    </div>
  );
}
