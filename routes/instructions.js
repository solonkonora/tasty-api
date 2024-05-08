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

// Get a recipe
router.get('/:recipeId', (req, res) => {
  const { recipeId } = req.params;

  const query = 'SELECT * FROM instructions WHERE recipe_id = $1';
  const values = [recipeId];

  pool.query(query, values, (error, result) => {
    if (error) {
      res.status(500).json({ error: 'Failed to fetch instructions' });
    } else {
      res.status(200).json(result.rows);
    }
  });
});


// create a recipe
router.post('/:recipeId', (req, res) => {
  const { recipeId } = req.params;
  const instructions = req.body.instructions; // Assuming the request body contains an "instructions" array

  const query = 'INSERT INTO instructions (recipe_id, step, description) VALUES ($1, $2, $3) RETURNING *';

  let completedCount = 0;
  let results = [];

  instructions.forEach((instruction) => {
    const { step, description } = instruction;
    const values = [recipeId, step, description];

    pool.query(query, values, (error, result) => {
      completedCount++;

      if (error) {
        console.error('Error creating instruction:', error);
        return res.status(500).json({ error: 'Failed to create instructions' });
      }

      results.push(result.rows[0]);

      if (completedCount === instructions.length) {
        res.status(200).json(results);
      }
    });
  });
});

//update a recipe
router.put('/:id', (req, res) => {

  const { id } = req.params;
  const { step, description } = req.body;

  const query = 'UPDATE instructions SET steps = $1, description = $2 WHERE id = $3 RETURNING *';
  const values = [step, description, id];

  pool.query(query, values, (error, result) => {
    if (error) {
      res.status(500).json({ error: 'Failed to update instruction' });
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

// delete a recipe
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