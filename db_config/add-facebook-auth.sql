-- Add facebook_id column to users table for Facebook OAuth
-- Run this migration to enable Facebook authentication

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS facebook_id VARCHAR(255) UNIQUE;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_facebook_id ON users(facebook_id);

-- Verify the column was added
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' 
  AND column_name IN ('google_id', 'facebook_id');
