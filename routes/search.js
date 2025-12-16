import express from "express"
const router = express.Router();
import {authenticateToken} from '../middleware/auth.js';
import { query } from '../db_config/queryHelper.js';
import { generateEmbedding, prepareRecipeTextForEmbedding } from '../utils/embeddings.js';

/**
 * POST /search/semantic
 * Semantic search using natural language queries
 * Body: { query: "spicy rice dish with chicken", limit: 10 }
 */
router.post('/semantic', async (req, res) => {
  try {
    const { query: searchQuery, limit = 10, threshold = 0.7 } = req.body;

    if (!searchQuery || typeof searchQuery !== 'string') {
      return res.status(400).json({ error: 'Query string is required' });
    }

    // Generate embedding for search query
    const queryEmbedding = await generateEmbedding(searchQuery);

    // Convert embedding array to PostgreSQL vector format
    const embeddingString = `[${queryEmbedding.join(',').trim()}]`;

    // Search using vector similarity
    const result = await query(
      `SELECT 
        r.id,
        r.title,
        r.description,
        r.image_path,
        c.name as category_name,
        1 - (r.embedding <=> $1::vector) as similarity
      FROM recipes r
      LEFT JOIN categories c ON r.category_id = c.id
      WHERE r.embedding IS NOT NULL
        AND 1 - (r.embedding <=> $1::vector) > $2
      ORDER BY r.embedding <=> $1::vector
      LIMIT $3`,
      [embeddingString, threshold, limit]
    );

    res.json({
      query: searchQuery,
      results: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error('Semantic search error:', error);
    res.status(500).json({ error: 'Failed to perform semantic search' });
  }
});

/**
 * GET /search/similar/:recipeId
 * Find similar recipes based on a specific recipe
 */
router.get('/similar/:recipeId', async (req, res) => {
  try {
    const { recipeId } = req.params;
    const limit = parseInt(req.query.limit) || 5;

    const result = await query(
      `SELECT 
        r.id,
        r.title,
        r.description,
        r.image_path,
        c.name as category_name,
        1 - (r.embedding <=> ref.embedding) as similarity
      FROM recipes r
      CROSS JOIN (SELECT embedding FROM recipes WHERE id = $1) ref
      LEFT JOIN categories c ON r.category_id = c.id
      WHERE r.id != $1
        AND r.embedding IS NOT NULL
        AND ref.embedding IS NOT NULL
      ORDER BY r.embedding <=> ref.embedding
      LIMIT $2`,
      [recipeId, limit]
    );

    res.json({
      recipeId: parseInt(recipeId),
      similar: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error('Similar recipes error:', error);
    res.status(500).json({ error: 'Failed to find similar recipes' });
  }
});

/**
 * POST /search/hybrid
 * Hybrid search combining keyword and semantic search
 */
router.post('/hybrid', async (req, res) => {
  try {
    const { query: searchQuery, limit = 10 } = req.body;

    if (!searchQuery || typeof searchQuery !== 'string') {
      return res.status(400).json({ error: 'Query string is required' });
    }

    // Generate embedding for semantic search
    const queryEmbedding = await generateEmbedding(searchQuery);
    const embeddingString = `[${queryEmbedding.join(',').trim()}]`;

    // Hybrid search: combine keyword matching with semantic similarity
    const result = await query(
      `WITH keyword_matches AS (
        SELECT 
          r.id,
          r.title,
          r.description,
          r.image_path,
          c.name as category_name,
          1.0 as keyword_score,
          0.0 as semantic_score
        FROM recipes r
        LEFT JOIN categories c ON r.category_id = c.id
        WHERE 
          r.title ILIKE $1
          OR r.description ILIKE $1
          OR c.name ILIKE $1
      ),
      semantic_matches AS (
        SELECT 
          r.id,
          r.title,
          r.description,
          r.prep_time,
          r.cook_time,
          r.servings,
          r.image_path,
          c.name as category_name,
          0.0 as keyword_score,
          1 - (r.embedding <=> $2::vector) as semantic_score
        FROM recipes r
        LEFT JOIN categories c ON r.category_id = c.id
        WHERE r.embedding IS NOT NULL
          AND 1 - (r.embedding <=> $2::vector) > 0.6
      )
      SELECT DISTINCT
        COALESCE(k.id, s.id) as id,
        COALESCE(k.title, s.title) as title,
        COALESCE(k.description, s.description) as description,
        COALESCE(k.image_path, s.image_path) as image_path,
        COALESCE(k.category_name, s.category_name) as category_name,
        COALESCE(k.keyword_score, 0) as keyword_score,
        COALESCE(s.semantic_score, 0) as semantic_score,
        (COALESCE(k.keyword_score, 0) * 0.4 + COALESCE(s.semantic_score, 0) * 0.6) as combined_score
      FROM keyword_matches k
      FULL OUTER JOIN semantic_matches s ON k.id = s.id
      ORDER BY combined_score DESC
      LIMIT $3`,
      [`%${searchQuery}%`, embeddingString, limit]
    );

    res.json({
      query: searchQuery,
      results: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error('Hybrid search error:', error);
    res.status(500).json({ error: 'Failed to perform hybrid search' });
  }
});

/**
 * POST /search/chat-recommendations
 * Get recipe recommendations based on conversational context
 * Used by the AI chatbot
 */
router.post('/chat-recommendations', authenticateToken, async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Combine conversation context for better recommendations
    const contextMessages = conversationHistory
      .slice(-3) // Last 3 messages for context
      .map(msg => msg.content)
      .join(' ');
    
    const fullContext = `${contextMessages} ${message}`;

    // Generate embedding from conversation context
    const queryEmbedding = await generateEmbedding(fullContext);
    const embeddingString = `[${queryEmbedding.join(',').trim()}]`;

    // Find relevant recipes
    const result = await query(
      `SELECT 
        r.id,
        r.title,
        r.description,
        r.image_path,
        c.name as category_name,
        1 - (r.embedding <=> $1::vector) as relevance
      FROM recipes r
      LEFT JOIN categories c ON r.category_id = c.id
      WHERE r.embedding IS NOT NULL
        AND 1 - (r.embedding <=> $1::vector) > 0.65
      ORDER BY r.embedding <=> $1::vector
      LIMIT 5`,
      [embeddingString]
    );

    res.json({
      recommendations: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error('Chat recommendations error:', error);
    res.status(500).json({ error: 'Failed to get recommendations' });
  }
});

export default router;