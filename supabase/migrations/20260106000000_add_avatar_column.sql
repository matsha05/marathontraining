-- Add avatar column to athletes table
-- Avatar ID references preset images in /public/avatars

ALTER TABLE athletes 
ADD COLUMN IF NOT EXISTS avatar TEXT DEFAULT 'marathon';

-- Add comment for documentation
COMMENT ON COLUMN athletes.avatar IS 'Avatar ID from preset list (marathon, runner_blue, runner_green, runner_purple, sprinter, trail)';
