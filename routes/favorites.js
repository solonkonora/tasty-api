import express from 'express';
import pool from '../db_config/db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();


// GET /api/favorites
// Get all favorites for the authenticated user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const query = `
      SELECT f.id as favorite_id, f.created_at as favorited_at, 
             r.id, r.title, r.description, r.image_path, r.category_id
      FROM favorites f
      JOIN recipes r ON f.recipe_id = r.id
      WHERE f.user_id = $1
      ORDER BY f.created_at DESC
    `;
    
    const { rows } = await pool.query(query, [userId]);
    res.json(rows);
  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({ error: 'Failed to fetch favorites' });
  }
});


// POST /api/favorites/:recipeId
// Add a recipe to favorites
router.post('/:recipeId', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { recipeId } = req.params;

    // Check if recipe exists and belongs to user (or is accessible)
    const recipeCheck = await pool.query(
      'SELECT id FROM recipes WHERE id = $1',
      [recipeId]
    );

    if (recipeCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Recipe not found' });
    }

    // Add to favorites (UNIQUE constraint prevents duplicates)
    const query = 'INSERT INTO favorites (user_id, recipe_id) VALUES ($1, $2) RETURNING *';
    const { rows } = await pool.query(query, [userId, recipeId]);

    res.status(201).json(rows[0]);
  } catch (error) {
    if (error.code === '23505') { // Unique violation
      return res.status(409).json({ error: 'Recipe already in favorites' });
    }
    console.error('Add favorite error:', error);
    res.status(500).json({ error: 'Failed to add favorite' });
  }
});


 // DELETE /api/favorites/:recipeId
 // Remove a recipe from favorites
router.delete('/:recipeId', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { recipeId } = req.params;

    const query = 'DELETE FROM favorites WHERE user_id = $1 AND recipe_id = $2 RETURNING *';
    const { rows } = await pool.query(query, [userId, recipeId]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Favorite not found' });
    }

    res.json({ message: 'Removed from favorites' });
  } catch (error) {
    console.error('Remove favorite error:', error);
    res.status(500).json({ error: 'Failed to remove favorite' });
  }
});

// GET /api/favorites/check/:recipeId
// Check if a recipe is favorited
router.get('/check/:recipeId', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { recipeId } = req.params;

    const query = 'SELECT id FROM favorites WHERE user_id = $1 AND recipe_id = $2';
    const { rows } = await pool.query(query, [userId, recipeId]);

    res.json({ isFavorite: rows.length > 0 });
  } catch (error) {
    console.error('Check favorite error:', error);
    res.status(500).json({ error: 'Failed to check favorite status' });
  }
});

export default router;
