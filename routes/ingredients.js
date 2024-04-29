import express from 'express';
import pool from '../db_config/db.js'
import { config } from 'dotenv';
config();


const router = express.Router();


// GET /ingredients/:recipeId
router.get('/:recipeId', (req, res) => {
    
      const { recipeId } = req.params;
      const query = 'SELECT * FROM ingredients WHERE recipe_id = $1';
      const values = [recipeId];
  
      pool.query(query, values, (error, result) => {
        if (error) {
          console.error('failed to fetch ingredients:', error)
          res.status(500).json({error: 'Failed to fetch ingredients'});
        } else {
          res.json(result.rows);
        }
      });
  });

// POST /ingredients/:recipeId
router.post('/:recipeId', (req, res) => {
 
    const { recipeId } = req.params;
    const { name, amount } = req.body;

    const query = 'INSERT INTO ingredients (recipe_id, name, amount) VALUES ($1, $2, $3) RETURNING *';
    const values = [recipeId, name, amount];

console.log('Request recieved:', {recipeId, name, amount});

   pool.query(query, values, (error, result) => {
    if (error) {
      res.status(500).json({ error: 'Failed to create ingredient' });
    } else {
      res.status(201).json(result.rows[0])
    }
  })
});

/// PUT /ingredients/:id
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { name, amount } = req.body;

  const query = 'UPDATE ingredients SET name = $1, amount = $2 WHERE id = $3 RETURNING *';
  const values = [name, amount, id];

  pool.query(query, values, (error, result) => {
    if (error) {
      res.status(500).json({ error: 'Failed to update ingredient' });
    } else {
      const rows = result.rows;
      if (rows.length === 0) {
        return res.status(404).json({ error: 'Ingredient not found' });
      } else {
        res.json(rows[0]);
      }
    }
  });
});

// Delete an ingredient
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  const query = 'DELETE FROM ingredients WHERE id = $1 RETURNING *';
  const values = [id];

  pool.query(query, values, (error, result) => {
    if (error) {
      res.status(500).json({ error: 'Failed to delete ingredient' });
    } else {
      const rows = result.rows;
      if (rows.length === 0) {
        return res.status(404).json({ error: 'Ingredient not found' });
      } else {
        res.json(rows[0]);
      }
    }
  });
});

export default router;