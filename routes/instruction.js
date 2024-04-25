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
  
      const query = 'SELECT * FROM instruction WHERE recipe_id = $1';
      const values = [recipeId];
  
      const { rows } = await pool.query(query, values);
  
      res.json(rows);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch instructions' });
    }
  });

  // Create a new instruction for a recipe:
router.post('/recipe/:recipeId', async (req, res) => {
  try {
    const { recipeId } = req.params;
    const { steps, description } = req.body;

    const query = 'INSERT INTO instruction (steps, description, recipe_id) VALUES ($1, $2, $3) RETURNING *';
    const values = [steps, description, recipeId];

    const { rows } = await pool.query(query, values);

    res.status(201).json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create instruction' });
  }
});

// Update an instruction:
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { steps, description } = req.body;

    const query = 'UPDATE instruction SET steps = $1, description = $2 WHERE id = $3 RETURNING *';
    const values = [steps, description, id];

    const { rows } = await pool.query(query, values);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Instruction not found' });
    }

    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update instruction' });
  }
});

// Delete an instruction:
javascript

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const query = 'DELETE FROM instruction WHERE id = $1 RETURNING *';
    const values = [id];

    const { rows } = await pool.query(query, values);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Instruction not found' });
    }

    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete instruction' });
  }
});