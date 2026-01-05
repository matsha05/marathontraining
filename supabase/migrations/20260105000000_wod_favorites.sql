-- Add WOD favorites column to athletes table
-- This allows users to save their favorite WODs and sync across devices

ALTER TABLE athletes 
ADD COLUMN IF NOT EXISTS wod_favorites TEXT[] DEFAULT '{}';

-- Add comment for documentation
COMMENT ON COLUMN athletes.wod_favorites IS 'Array of WOD IDs that the user has favorited';
