-- Add vector extension for embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- Add embedding column to recipes table
ALTER TABLE recipes 
ADD COLUMN IF NOT EXISTS embedding vector(1536); -- OpenAI text-embedding-3-small dimension

-- Add embedding columns to temp import table
ALTER TABLE temp_recipes_import
ADD COLUMN IF NOT EXISTS embedding vector(1536);

-- Create index for vector similarity search (HNSW - fast approximate search)
CREATE INDEX IF NOT EXISTS recipes_embedding_idx ON recipes 
USING hnsw (embedding vector_cosine_ops);

-- Create index for temp recipes
CREATE INDEX IF NOT EXISTS temp_recipes_embedding_idx ON temp_recipes_import 
USING hnsw (embedding vector_cosine_ops);

-- Function to search recipes by similarity
CREATE OR REPLACE FUNCTION search_recipes_by_embedding(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 10
)
RETURNS TABLE (
  id integer,
  title varchar(255),
  description text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.id,
    r.title,
    r.description,
    1 - (r.embedding <=> query_embedding) as similarity
  FROM recipes r
  WHERE r.embedding IS NOT NULL
    AND 1 - (r.embedding <=> query_embedding) > match_threshold
  ORDER BY r.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Function to find similar recipes (for recommendations)
CREATE OR REPLACE FUNCTION find_similar_recipes(
  recipe_id integer,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  id integer,
  title varchar(255),
  description text,
  similarity float
)
LANGUAGE plpgsql
AS $$
DECLARE
  recipe_embedding vector(1536);
BEGIN
  -- Get the embedding of the reference recipe
  SELECT embedding INTO recipe_embedding
  FROM recipes
  WHERE recipes.id = recipe_id;

  IF recipe_embedding IS NULL THEN
    RAISE EXCEPTION 'Recipe % does not have an embedding', recipe_id;
  END IF;

  RETURN QUERY
  SELECT 
    r.id,
    r.title,
    r.description,
    1 - (r.embedding <=> recipe_embedding) as similarity
  FROM recipes r
  WHERE r.id != recipe_id
    AND r.embedding IS NOT NULL
  ORDER BY r.embedding <=> recipe_embedding
  LIMIT match_count;
END;
$$;

-- Comments
COMMENT ON COLUMN recipes.embedding IS 'OpenAI text-embedding-3-small vector for semantic search';
COMMENT ON FUNCTION search_recipes_by_embedding IS 'Search recipes using semantic similarity with embeddings';
COMMENT ON FUNCTION find_similar_recipes IS 'Find similar recipes based on embedding similarity';
