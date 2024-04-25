import express from 'express';
import pool from '../db_config/db.js'
import { config } from 'dotenv';
config();


const router = express.Router();

// Middleware to parse JSON request bodies
router.use(express.json())

router.get('/recipe/:recipeId', async (req, res) => {
    try {
      const { recipeId } = req.params;
  
      const query = 'SELECT * FROM ingredient WHERE recipe_id = $1';
      const values = [recipeId];
  
      const { rows } = await pool.query(query, values);
  
      res.json(rows);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch ingredients' });
    }
  });

  // Create a new ingredient for a recipe:

router.post('/recipe/:recipeId', async (req, res) => {
  try {
    const { recipeId } = req.params;
    const { name, amount } = req.body;

    const query = 'INSERT INTO ingredient (name, amount, recipe_id) VALUES ($1, $2, $3) RETURNING *';
    const values = [name, amount, recipeId];

    const { rows } = await pool.query(query, values);

    res.status(201).json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create ingredient' });
  }
});

// Update an ingredient:
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, amount } = req.body;

    const query = 'UPDATE ingredient SET name = $1, amount = $2 WHERE id = $3 RETURNING *';
    const values = [name, amount, id];

    const { rows } = await pool.query(query, values);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Ingredient not found' });
    }

    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update ingredient' });
  }
});

// Delete an ingredient
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const query = 'DELETE FROM ingredient WHERE id = $1 RETURNING *';
    const values = [id];

    const { rows } = await pool.query(query, values);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Ingredient not found' });
    }

    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete ingredient' });
  }
});