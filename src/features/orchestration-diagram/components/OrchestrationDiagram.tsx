/**
 * Orchestration Diagram
 * Interactive SVG-based visualization of Aura's backend architecture
 */

'use client'

import { motion } from 'framer-motion'
import { GitBranch, Map, Video, Brain, Shield, Gauge, Zap, Target, Sparkles, TrendingUp } from 'lucide-react'

interface Node {
  id: string
  label: string
  sublabel?: string
  x: number
  y: number
  icon: React.ComponentType<{ className?: string }>
  tier: 'input' | 'processing' | 'synthesis' | 'output'
}

interface Edge {
  from: string
  to: string
  color?: string
}

const nodes: Node[] = [
  // Input Tier (Left)
  {
    id: 'github',
    label: 'GitHub Activity',
    sublabel: 'Commits, PRs, Issues',
    x: 100,
    y: 200,
    icon: GitBranch,
    tier: 'input',
  },
  {
    id: 'logic-map',
    label: 'Logic Map',
    sublabel: 'Decision Trees',
    x: 100,
    y: 400,
    icon: Map,
    tier: 'input',
  },
  {
    id: 'video',
    label: '90s Video Demo',
    sublabel: 'Product Walkthrough',
    x: 100,
    y: 600,
    icon: Video,
    tier: 'input',
  },

  // Processing Tier (Center) - 5 Specialist Agents
  // Ordered by input source: GitHub (top 3), Logic Map (4th), Video (5th)
  {
    id: 'ai-fluency-agent',
    label: 'AI Fluency Agent',
    sublabel: 'Input: GitHub Code',
    x: 400,
    y: 100,
    icon: Sparkles,
    tier: 'processing',
  },
  {
    id: 'flow-agent',
    label: 'Flow Agent',
    sublabel: 'Input: GitHub Commits',
    x: 400,
    y: 250,
    icon: Zap,
    tier: 'processing',
  },
  {
    id: 'quality-agent',
    label: 'Quality Agent',
    sublabel: 'Input: GitHub Diffs',
    x: 400,
    y: 400,
    icon: Shield,
    tier: 'processing',
  },
  {
    id: 'logic-agent',
    label: 'Logic Agent',
    sublabel: 'Input: Logic Map',
    x: 400,
    y: 550,
    icon: Brain,
    tier: 'processing',
  },
  {
    id: 'video-agent',
    label: 'Video Agent',
    sublabel: 'Input: Video Demo',
    x: 400,
    y: 700,
    icon: Video,
    tier: 'processing',
  },

  // Synthesis Tier (Right)
  {
    id: 'math-engine',
    label: 'Scoring Engine',
    sublabel: 'Weighted Scoring & Aggregation',
    x: 700,
    y: 380,
    icon: Target,
    tier: 'synthesis',
  },

  // Output (Far Right)
  {
    id: 'builder-profile',
    label: 'Builder Profile',
    sublabel: 'Spider Map',
    x: 1000,
    y: 400,
    icon: Target,
    tier: 'output',
  },
]

const edges: Edge[] = [
  // Input → Agents (grouped by source)
  // GitHub → Top 3 agents
  { from: 'github', to: 'ai-fluency-agent', color: '#3b82f6' },
  { from: 'github', to: 'flow-agent', color: '#3b82f6' },
  { from: 'github', to: 'quality-agent', color: '#3b82f6' },
  // Logic Map → Logic Agent
  { from: 'logic-map', to: 'logic-agent', color: '#8b5cf6' },
  // Video → Video Agent
  { from: 'video', to: 'video-agent', color: '#ec4899' },

  // Agents → Scoring Engine
  { from: 'video-agent', to: 'math-engine', color: '#06b6d4' },
  { from: 'logic-agent', to: 'math-engine', color: '#06b6d4' },
  { from: 'quality-agent', to: 'math-engine', color: '#06b6d4' },
  { from: 'flow-agent', to: 'math-engine', color: '#06b6d4' },
  { from: 'ai-fluency-agent', to: 'math-engine', color: '#06b6d4' },

  // Scoring Engine → Output
  { from: 'math-engine', to: 'builder-profile', color: '#10b981' },
]

export function OrchestrationDiagram() {
  return (
    <div className="w-full h-full bg-[#0a0a0a] rounded-2xl border border-white/10 overflow-hidden">
      <svg
        width="1200"
        height="850"
        viewBox="0 0 1200 850"
        className="w-full h-auto"
        style={{ maxHeight: '850px' }}
      >
        <defs>
          {/* Neon Glow Filter */}
          <filter id="neon-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Arrow Marker */}
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="10"
            refX="9"
            refY="3"
            orient="auto"
            fill="#06b6d4"
          >
            <polygon points="0 0, 10 3, 0 6" />
          </marker>
        </defs>

        {/* Background Grid Pattern */}
        <pattern
          id="grid"
          width="40"
          height="40"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M 40 0 L 0 0 0 40"
            fill="none"
            stroke="rgba(255,255,255,0.02)"
            strokeWidth="1"
          />
        </pattern>
        <rect width="1200" height="850" fill="url(#grid)" />

        {/* Edges (connections) */}
        {edges.map((edge, idx) => {
          const fromNode = nodes.find((n) => n.id === edge.from)
          const toNode = nodes.find((n) => n.id === edge.to)
          if (!fromNode || !toNode) return null

          // Calculate node dimensions
          const fromWidth = fromNode.id === 'math-engine' ? 240 : 160
          const fromHeight = fromNode.id === 'math-engine' ? 100 : 80
          const toWidth = toNode.id === 'math-engine' ? 240 : 160
          const toHeight = toNode.id === 'math-engine' ? 100 : 80

          const fromX = fromNode.x + fromWidth / 2 // Center of node
          const fromY = fromNode.y + fromHeight / 2
          const toX = toNode.x
          const toY = toNode.y + toHeight / 2

          // Calculate control points for curved path
          const midX = (fromX + toX) / 2
          const curve = `M ${fromX} ${fromY} Q ${midX} ${fromY}, ${midX} ${(fromY + toY) / 2} T ${toX} ${toY}`

          return (
            <g key={`edge-${idx}`}>
              {/* Edge line */}
              <motion.path
                d={curve}
                stroke={edge.color || '#06b6d4'}
                strokeWidth="2"
                fill="none"
                opacity="0.4"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1, delay: idx * 0.1 }}
              />

              {/* Animated pulse */}
              <motion.circle
                r="4"
                fill={edge.color || '#06b6d4'}
                filter="url(#neon-glow)"
              >
                <animateMotion
                  dur={`${3 + Math.random() * 2}s`}
                  repeatCount="indefinite"
                  path={curve}
                />
              </motion.circle>
            </g>
          )
        })}

        {/* Nodes */}
        {nodes.map((node, idx) => {
          const Icon = node.icon
          const getNodeColor = () => {
            switch (node.tier) {
              case 'input':
                return '#3b82f6' // Blue
              case 'processing':
                return '#06b6d4' // Cyan
              case 'synthesis':
                return '#8b5cf6' // Purple
              case 'output':
                return '#10b981' // Green
              default:
                return '#06b6d4'
            }
          }

          const color = getNodeColor()

          // Make Math Engine box larger to fit text
          const nodeWidth = node.id === 'math-engine' ? 240 : 160
          const nodeHeight = node.id === 'math-engine' ? 100 : 80

          return (
            <g key={node.id}>
              {/* Node background */}
              <motion.rect
                x={node.x}
                y={node.y}
                width={nodeWidth}
                height={nodeHeight}
                rx="12"
                fill="#1a1a1a"
                stroke={color}
                strokeWidth="2"
                filter="url(#neon-glow)"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                whileHover={{ scale: 1.05 }}
                style={{ cursor: 'pointer' }}
              />

              {/* Icon */}
              <foreignObject
                x={node.x + 10}
                y={node.y + 15}
                width="24"
                height="24"
              >
                <Icon className="w-6 h-6" style={{ color }} />
              </foreignObject>

              {/* Label */}
              <text
                x={node.x + 45}
                y={node.id === 'math-engine' ? node.y + 35 : node.y + 30}
                fill="white"
                fontSize={node.id === 'math-engine' ? '14' : '13'}
                fontWeight="600"
                fontFamily="system-ui"
              >
                {node.label}
              </text>

              {/* Sublabel */}
              {node.sublabel && (
                <text
                  x={node.x + 45}
                  y={node.id === 'math-engine' ? node.y + 58 : node.y + 50}
                  fill="rgba(255,255,255,0.5)"
                  fontSize={node.id === 'math-engine' ? '11' : '10'}
                  fontFamily="system-ui"
                >
                  {node.sublabel}
                </text>
              )}

              {/* Tier badge */}
              <rect
                x={node.x + 5}
                y={node.id === 'math-engine' ? node.y + 80 : node.y + 65}
                width="60"
                height="12"
                rx="6"
                fill={`${color}20`}
                stroke={color}
                strokeWidth="1"
              />
              <text
                x={node.x + 35}
                y={node.id === 'math-engine' ? node.y + 89 : node.y + 74}
                fill={color}
                fontSize="8"
                fontWeight="500"
                textAnchor="middle"
                fontFamily="system-ui"
              >
                {node.tier.toUpperCase()}
              </text>
            </g>
          )
        })}

        {/* Title */}
        <text
          x="600"
          y="40"
          fill="white"
          fontSize="24"
          fontWeight="700"
          textAnchor="middle"
          fontFamily="system-ui"
        >
          Aura Builder Profile Spider Map Orchestration
        </text>
        <text
          x="600"
          y="65"
          fill="rgba(255,255,255,0.5)"
          fontSize="12"
          textAnchor="middle"
          fontFamily="system-ui"
        >
          Multi-Agent Architecture for Builder Intelligence
        </text>
      </svg>

      {/* Legend */}
      <div className="px-8 pb-6 flex gap-6 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500" />
          <span className="text-white/70">Input Sources</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-cyan-500" />
          <span className="text-white/70">Specialist Agents</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-purple-500" />
          <span className="text-white/70">Math Engine</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span className="text-white/70">Output</span>
        </div>
      </div>
    </div>
  )
}
