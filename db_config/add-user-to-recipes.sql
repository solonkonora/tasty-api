-- Add user_id column to recipes table to track recipe ownership
-- NULL user_id means public/seeded recipes (not owned by any specific user)
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE SET NULL;

-- Create index for better performance on user queries
CREATE INDEX IF NOT EXISTS idx_recipes_user_id ON recipes(user_id);

-- All existing seeded recipes will have user_id = NULL (public recipes)
-- New recipes created by users will have their user_id set automatically

