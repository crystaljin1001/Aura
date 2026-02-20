-- Migration: Enhance project_technical_journey for Evidence Engine
-- Description: Add architectural_tradeoffs column to support trade-off analysis
-- Date: 2026-02-19

-- Add architectural_tradeoffs column to store architectural decision analysis
ALTER TABLE public.project_technical_journey
ADD COLUMN IF NOT EXISTS architectural_tradeoffs JSONB DEFAULT '[]'::jsonb;

-- Add comment to explain the new column
COMMENT ON COLUMN public.project_technical_journey.architectural_tradeoffs IS
  'Stores architectural trade-off decisions with rationale and evidence links. Format: [{ decision: "Monolithic vs Microservices", chosen: "Monolithic", rationale: "...", evidenceLink: "..." }]';

-- Update existing tech_decisions comment to reflect enhanced structure
COMMENT ON COLUMN public.project_technical_journey.tech_decisions IS
  'Stores technology decisions with trade-off analysis. Format: [{ technology: "Redis", reason: "...", alternativesConsidered: ["Memcached"], tradeoffs: { benefits: [], drawbacks: [], rejectionReasons: {} }, evidenceLink: "https://github.com/..." }]';

-- The tech_decisions column is already JSONB, so it will automatically support
-- the new fields (alternativesConsidered, tradeoffs, evidenceLink) without schema changes
