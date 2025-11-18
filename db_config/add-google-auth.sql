-- Add google_id column to users table for Google OAuth
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS google_id VARCHAR(255) UNIQUE;

-- Allow password_hash to be NULL for Google-only accounts
ALTER TABLE users 
ALTER COLUMN password_hash DROP NOT NULL;

-- Create index for google_id lookups
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);

-- Update existing users to allow NULL password_hash
-- (This is safe - we check password existence in login route)
