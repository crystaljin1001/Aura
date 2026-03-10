-- Add 'product_minded_engineer' to the script_type enum constraint
-- This migration updates the check constraint to support the new 5-chapter Master Demo framework

-- Drop the old constraint
ALTER TABLE narrative_scripts DROP CONSTRAINT IF EXISTS narrative_scripts_script_type_check;

-- Add the new constraint with 'product_minded_engineer' included
ALTER TABLE narrative_scripts ADD CONSTRAINT narrative_scripts_script_type_check
  CHECK (script_type IN ('user_journey', 'technical_architecture', 'product_minded_engineer'));
