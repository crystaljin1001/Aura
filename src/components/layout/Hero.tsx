'use client';

/**
 * Hero Section Component
 * Features typing animation that transforms code snippets into business impact metrics
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

interface TransformExample {
  code: {
    line1: string;
    line2: string;
    line3: string;
  };
  impact: {
    metric: string;
    value: string;
    description: string;
  };
  color: string;
}

const transformExamples: TransformExample[] = [
  {
    code: {
      line1: 'function optimizeQuery() {',
      line2: '  // Added database indexing',
      line3: '  // Implemented query caching',
    },
    impact: {
      metric: 'Reduced Latency',
      value: '40%',
      description: 'Faster query response time',
    },
    color: 'from-blue-500 to-cyan-500',
  },
  {
    code: {
      line1: 'export async function handleAuth() {',
      line2: '  // Implemented rate limiting',
      line3: '  // Added encryption layer',
    },
    impact: {
      metric: 'Security Score',
      value: '95/100',
      description: 'Enhanced protection against threats',
    },
    color: 'from-green-500 to-emerald-500',
  },
  {
    code: {
      line1: 'const refactorComponents = async () => {',
      line2: '  // Split into smaller modules',
      line3: '  // Reduced bundle size by 30%',
    },
    impact: {
      metric: 'Load Time',
      value: '-2.3s',
      description: 'Improved user experience',
    },
    color: 'from-purple-500 to-pink-500',
  },
  {
    code: {
      line1: 'function automateDeployment() {',
      line2: '  // Set up CI/CD pipeline',
      line3: '  // Automated testing & rollback',
    },
    impact: {
      metric: 'Deployment Speed',
      value: '10x',
      description: 'From hours to minutes',
    },
    color: 'from-orange-500 to-red-500',
  },
];

// Typing animation component
function TypingText({ text, delay = 0 }: { text: string; delay?: number }) {
  const [displayText, setDisplayText] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    setDisplayText('');
    setIsComplete(false);

    const timeout = setTimeout(() => {
      let currentIndex = 0;
      const interval = setInterval(() => {
        if (currentIndex <= text.length) {
          setDisplayText(text.slice(0, currentIndex));
          currentIndex++;
        } else {
          setIsComplete(true);
          clearInterval(interval);
        }
      }, 30);

      return () => clearInterval(interval);
    }, delay);

    return () => clearTimeout(timeout);
  }, [text, delay]);

  return (
    <span>
      {displayText}
      {!isComplete && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity }}
          className="inline-block w-2 h-4 bg-current ml-1"
        />
      )}
    </span>
  );
}

// Code snippet side
function CodeSnippet({ example }: { example: TransformExample }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.5 }}
      className="relative"
    >
      <div className="bg-gray-900 rounded-2xl shadow-2xl border border-gray-800 overflow-hidden grain">
        {/* Terminal header */}
        <div className="bg-gray-800 px-4 py-3 flex items-center gap-2 border-b border-gray-700">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
          </div>
          <span className="text-gray-400 text-sm ml-2 font-mono">impact.ts</span>
        </div>

        {/* Code content */}
        <div className="p-6 font-mono text-sm">
          <div className="space-y-2">
            <div className="text-gray-400">
              <span className="text-purple-400">1</span>
              <span className="ml-4">
                <TypingText text={example.code.line1} delay={0} />
              </span>
            </div>
            <div className="text-gray-400">
              <span className="text-purple-400">2</span>
              <span className="ml-4">
                <TypingText text={example.code.line2} delay={500} />
              </span>
            </div>
            <div className="text-gray-400">
              <span className="text-purple-400">3</span>
              <span className="ml-4">
                <TypingText text={example.code.line3} delay={1000} />
              </span>
            </div>
            <div className="text-gray-400">
              <span className="text-purple-400">4</span>
              <span className="ml-4 text-gray-600">{'}'}</span>
            </div>
          </div>
        </div>

        {/* Glow effect */}
        <div className={`absolute -inset-1 bg-gradient-to-r ${example.color} opacity-20 blur-xl -z-10`} />
      </div>
    </motion.div>
  );
}

// Impact metric side
function ImpactMetric({ example }: { example: TransformExample }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 50, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 50, scale: 0.9 }}
      transition={{ duration: 0.6, delay: 1.5 }}
      className="relative"
    >
      <div className="glass rounded-2xl shadow-2xl p-8 grain">
        {/* Metric label */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.7 }}
          className="text-gray-600 dark:text-gray-400 text-sm font-semibold uppercase tracking-wider mb-4"
        >
          Business Impact
        </motion.div>

        {/* Main metric */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.9, type: 'spring', stiffness: 200 }}
          className="mb-2"
        >
          <div className={`text-6xl font-bold bg-gradient-to-r ${example.color} bg-clip-text text-transparent mb-2`}>
            {example.impact.value}
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {example.impact.metric}
          </div>
        </motion.div>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.1 }}
          className="text-gray-600 dark:text-gray-400 text-base"
        >
          {example.impact.description}
        </motion.p>

        {/* Animated checkmark */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 2.3, type: 'spring', stiffness: 200 }}
          className={`absolute -top-4 -right-4 w-12 h-12 rounded-full bg-gradient-to-r ${example.color} flex items-center justify-center shadow-lg`}
        >
          <svg
            className="w-6 h-6 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </motion.div>

        {/* Glow effect */}
        <div className={`absolute -inset-1 bg-gradient-to-r ${example.color} opacity-20 blur-xl -z-10`} />
      </div>
    </motion.div>
  );
}

// Transformation arrow
function TransformArrow({ color }: { color: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0 }}
      transition={{ delay: 1.2, duration: 0.4 }}
      className="hidden lg:flex items-center justify-center"
    >
      <motion.div
        animate={{ x: [0, 10, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        className="relative"
      >
        <svg
          className="w-16 h-16"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <defs>
            <linearGradient id={`gradient-${color}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="currentColor" stopOpacity="0.3" />
              <stop offset="100%" stopColor="currentColor" stopOpacity="1" />
            </linearGradient>
          </defs>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 7l5 5m0 0l-5 5m5-5H6"
            stroke={`url(#gradient-${color})`}
          />
        </svg>

        {/* Animated particles */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className={`absolute top-1/2 left-0 w-2 h-2 rounded-full bg-gradient-to-r ${color}`}
            animate={{
              x: [0, 60],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: i * 0.3,
              ease: 'easeInOut',
            }}
          />
        ))}
      </motion.div>
    </motion.div>
  );
}

export function Hero() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentExample = transformExamples[currentIndex];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % transformExamples.length);
    }, 6000); // Change example every 6 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative w-full min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{ duration: 20, repeat: Infinity }}
          className={`absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-r ${currentExample.color} blur-3xl`}
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [90, 0, 90],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{ duration: 20, repeat: Infinity }}
          className={`absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-l ${currentExample.color} blur-3xl`}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 py-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <motion.h1
            className="text-5xl md:text-7xl font-bold mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <span className="bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              From Code to
            </span>
            <br />
            <span className={`bg-gradient-to-r ${currentExample.color} bg-clip-text text-transparent`}>
              Business Impact
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto"
          >
            Watch your technical work transform into measurable business outcomes
          </motion.p>
        </motion.div>

        {/* Transformation Demo */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr,auto,1fr] gap-8 items-center">
          <AnimatePresence mode="wait">
            <CodeSnippet key={`code-${currentIndex}`} example={currentExample} />
          </AnimatePresence>

          <AnimatePresence mode="wait">
            <TransformArrow key={`arrow-${currentIndex}`} color={currentExample.color} />
          </AnimatePresence>

          <AnimatePresence mode="wait">
            <ImpactMetric key={`impact-${currentIndex}`} example={currentExample} />
          </AnimatePresence>
        </div>

        {/* Progress indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex justify-center gap-2 mt-12"
        >
          {transformExamples.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentIndex
                  ? `w-8 bg-gradient-to-r ${currentExample.color}`
                  : 'w-2 bg-gray-300 dark:bg-gray-700'
              }`}
              aria-label={`View example ${index + 1}`}
            />
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-12"
        >
          <button className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-full shadow-premium hover:shadow-2xl transform hover:scale-105 transition-all grain">
            Start Building Your Story
          </button>
        </motion.div>
      </div>
    </section>
  );
}
