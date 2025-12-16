-- Temporary table for recipe dataset imports before AI classification
CREATE TABLE IF NOT EXISTS temp_recipes_import (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  raw_ingredients TEXT, -- Raw ingredients string from dataset
  raw_instructions TEXT, -- Raw instructions string from dataset
  image_path VARCHAR(500),
  cuisine VARCHAR(100),
  diet_type VARCHAR(50),
  difficulty_level VARCHAR(50),
  source VARCHAR(255), -- Dataset source (e.g., 'kaggle', 'api', 'user-submission')
  
  -- AI Classification fields
  ai_classified BOOLEAN DEFAULT FALSE,
  is_african BOOLEAN DEFAULT NULL,
  ai_confidence_score DECIMAL(3,2), -- 0.00 to 1.00
  suggested_category VARCHAR(50), -- AI suggested category
  normalized_cuisine VARCHAR(100), -- AI normalized cuisine name
  
  -- Metadata
  import_batch_id VARCHAR(100),
  imported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  processed_at TIMESTAMP,
  processing_status VARCHAR(50) DEFAULT 'pending', -- pending, processing, completed, failed
  processing_error TEXT,
  
  CONSTRAINT check_confidence CHECK (ai_confidence_score >= 0 AND ai_confidence_score <= 1)
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_temp_recipes_status ON temp_recipes_import(processing_status);
CREATE INDEX IF NOT EXISTS idx_temp_recipes_classified ON temp_recipes_import(ai_classified);
CREATE INDEX IF NOT EXISTS idx_temp_recipes_african ON temp_recipes_import(is_african);
CREATE INDEX IF NOT EXISTS idx_temp_recipes_batch ON temp_recipes_import(import_batch_id);

-- Normalized ingredients table for temp imports
CREATE TABLE IF NOT EXISTS temp_ingredients_normalized (
  id SERIAL PRIMARY KEY,
  temp_recipe_id INTEGER REFERENCES temp_recipes_import(id) ON DELETE CASCADE,
  ingredient_name VARCHAR(255) NOT NULL,
  quantity VARCHAR(100),
  unit VARCHAR(50),
  is_main BOOLEAN DEFAULT TRUE,
  ai_normalized BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Normalized instructions table for temp imports
CREATE TABLE IF NOT EXISTS temp_instructions_normalized (
  id SERIAL PRIMARY KEY,
  temp_recipe_id INTEGER REFERENCES temp_recipes_import(id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL,
  description TEXT NOT NULL,
  ai_enhanced BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Batch tracking table
CREATE TABLE IF NOT EXISTS import_batches (
  id VARCHAR(100) PRIMARY KEY,
  source VARCHAR(255) NOT NULL,
  total_recipes INTEGER DEFAULT 0,
  processed_recipes INTEGER DEFAULT 0,
  african_recipes_found INTEGER DEFAULT 0,
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,
  status VARCHAR(50) DEFAULT 'in_progress' -- in_progress, completed, failed
);

-- Comments
COMMENT ON TABLE temp_recipes_import IS 'Temporary staging table for recipe dataset imports before AI classification';
COMMENT ON COLUMN temp_recipes_import.ai_confidence_score IS 'AI confidence score for African cuisine classification (0-1)';
COMMENT ON COLUMN temp_recipes_import.processing_status IS 'Status: pending, processing, completed, failed';
