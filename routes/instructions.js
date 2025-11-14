import express from 'express';
import pool from '../db_config/db.js'
import { config } from 'dotenv';
config();

import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';

const router = express.Router();

const swaggerDocument = YAML.load('./documentary/swagger-specs.yaml');

// mounting the Swagger UI middleware:
router.use('/api-docs', swaggerUi.serve);
router.get('/api-docs', swaggerUi.setup(swaggerDocument));

// Get instructions for a recipe
router.get('/:recipeId', (req, res, next) => {
  const { recipeId } = req.params;

  const query = 'SELECT * FROM instructions WHERE recipe_id = $1 ORDER BY step_number ASC';
  const values = [recipeId];

  pool.query(query, values, (error, result) => {
    if (error) {
      next(error)
      return
        } else {
      res.status(200).json(result.rows);
    }
  });
});


// Create instructions for a recipe
router.post('/:recipeId', async (req, res) => {
  const { recipeId } = req.params;
  const instructions = req.body.instructions; // Assuming the request body contains an "instructions" array

  if (!instructions || !Array.isArray(instructions)) {
    return res.status(400).json({ error: 'Instructions array is required' });
  }

  const query = 'INSERT INTO instructions (recipe_id, step_number, description) VALUES ($1, $2, $3) RETURNING *';

  try {
    const results = await Promise.all(
      instructions.map(async (instruction) => {
        const { step_number, description } = instruction;
        const values = [recipeId, step_number, description];
        const result = await pool.query(query, values);
        return result.rows[0];
      })
    );
    
    res.status(201).json(results);
  } catch (error) {
    console.error('Error creating instructions:', error);
    res.status(500).json({ error: 'Failed to create instructions' });
  }
});

// Update an instruction
router.put('/:id', (req, res, next) => {

  const { id } = req.params;
  const { step_number, description } = req.body;

  const query = 'UPDATE instructions SET step_number = $1, description = $2 WHERE id = $3 RETURNING *';
  const values = [step_number, description, id];

  pool.query(query, values, (error, result) => {
    if (error) {
      next(error)
      return
        } else {
      const rows = result.rows;
      if (rows.length === 0) {
        return res.status(404).json({ error: 'Instruction not found' });
      } else {
        res.status(200).json(rows[0]);
      }
    }
  });
});

// Delete an instruction
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  const query = 'DELETE FROM instructions WHERE id = $1 RETURNING *';
  const values = [id];

  pool.query(query, values, (error, result) => {
    if (error) {
      res.status(500).json({ error: 'Failed to delete instruction' });
    } else {
      const rows = result.rows;
      if (rows.length === 0) {
        return res.status(404).json({ error: 'Instruction not found' });
      } else {
        res.status(200).json(rows[0]);
      }
    }
  });
});

export default router;