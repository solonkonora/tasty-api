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

router.get('/', (req, res, next) => {
  const query = 'SELECT * FROM categories ORDER BY id ASC';
  pool.query(query, (error, result) => {
    if (error) {
      next(error)
      return
    } else {
      res.json(result.rows);
    }
  });
});


router.post('/', (req, res, next) => {
  const { name, description } = req.body;

  const query = 'INSERT INTO categories (name, description) VALUES ($1, $2) RETURNING *';
  const values = [name, description];

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
  const { name, description } = req.body;

  const query = 'UPDATE categories SET name = $1, description = $2 WHERE id = $3 RETURNING *';
  const values = [name, description, id];

  pool.query(query, values, (error, result) => {
    if (error) {
      next(error)
      return
    } else {
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Category not found' });
      }

      res.json(result.rows[0]);
    }
  });
});


router.delete('/:id', (req, res, next) => {
  const { id } = req.params;

  const query = 'DELETE FROM categories WHERE id = $1 RETURNING *';
  const values = [id];

  pool.query(query, values, (error, result) => {
    if (error) {
      next(error)
      return
    } else {
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Category not found' });
      }

      res.json(result.rows[0]);
    }
  });
});


export default router;