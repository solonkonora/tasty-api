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



router.get('/:recipeId', (req, res, next) => {
  const { recipeId } = req.params;
  const query = 'SELECT * FROM ingredients WHERE recipe_id = $1 ORDER BY id ASC';
  const values = [recipeId];

  pool.query(query, values, (error, result) => {
    if (error) {
      next(error)
      return
        } else {
      res.json(result.rows);
    }
  });
});


router.post('/:recipeId', (req, res, next) => {
  const { recipeId } = req.params;
  const { name, quantity, unit } = req.body;

  const query = 'INSERT INTO ingredients (recipe_id, name, quantity, unit) VALUES ($1, $2, $3, $4) RETURNING *';
  const values = [recipeId, name, quantity, unit];

  pool.query(query, values, (error, result) => {
    if (error) {
      next(error)
      return
        } else {
      res.status(201).json(result.rows[0]);
    }
  });
});


router.put('/:id', (req, res, next) => {
  const { id } = req.params;
  const { name, quantity, unit } = req.body;

  const query = 'UPDATE ingredients SET name = $1, quantity = $2, unit = $3 WHERE id = $4 RETURNING *';
  const values = [name, quantity, unit, id];

  pool.query(query, values, (error, result) => {
    if (error) {
      next(error)
      return
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


router.delete('/:id', (req, res, next) => {
  const { id } = req.params;

  const query = 'DELETE FROM ingredients WHERE id = $1 RETURNING *';
  const values = [id];

  pool.query(query, values, (error, result) => {
    if (error) {
      next(error)
      return
        } else {
      const rows = result.rows;
      if (rows.length === 0) {
        return res.status(404).json({ error: 'Ingredient not found' });
      } else {
        res.status(200).json(rows[0]);
      }
    }
  });
});

export default router;