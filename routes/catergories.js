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


// router.get('/', async (req, res) => {
//   try {
//     const query = 'SELECT * FROM categories';
//     const { rows } = await pool.query(query);

//     res.json(rows);
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to fetch categories' });
//   }
// });


// router.post('/', async (req, res) => {
//   try {
//     const { name, description } = req.body;

//     const query = 'INSERT INTO categories (name, description) VALUES ($1, $2) RETURNING *';
//     const values = [name, description];

//     const { rows } = await pool.query(query, values);

//     res.status(201).json(rows[0]);
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to create category' });
//   }
// });


// router.put('/:id', async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { name, description } = req.body;

//     const query = 'UPDATE categories SET name = $1, description = $2 WHERE id = $3 RETURNING *';
//     const values = [name, description, id];

//     const { rows } = await pool.query(query, values);

//     if (rows.length === 0) {
//       return res.status(404).json({ error: 'Category not found' });
//     }

//     res.json(rows[0]);
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to update category' });
//   }
// });


// router.delete('/:id', async (req, res) => {
//   try {
//     const { id } = req.params;

//     const query = 'DELETE FROM categories WHERE id = $1 RETURNING *';
//     const values = [id];

//     const { rows } = await pool.query(query, values);

//     if (rows.length === 0) {
//       return res.status(404).json({ error: 'Category not found' });
//     }

//     res.json(rows[0]);
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to delete category' });
//   }
// });

router.get('/', (req, res) => {
  const query = 'SELECT * FROM categories';
  pool.query(query, (error, result, next) => {
    if (error) {
      next(error)
      return
    } else {
      res.send({ data : result.rows});
    }
  });
});


router.post('/', (req, res) => {
  const { name, description } = req.body;

  const query = 'INSERT INTO categories (name, description) VALUES ($1, $2) RETURNING *';
  const values = [name, description];

  pool.query(query, values, (error, result) => {
    if (error) {
      res.status(500).json({ error: 'Failed to create category' });
    } else {
      res.status(201).json(result.rows[0]);
    }
  });
});


router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;

  const query = 'UPDATE categories SET name = $1, description = $2 WHERE id = $3 RETURNING *';
  const values = [name, description, id];

  pool.query(query, values, (error, result) => {
    if (error) {
      res.status(500).json({ error: 'Failed to update category' });
    } else {
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Category not found' });
      }

      res.json(result.rows[0]);
    }
  });
});


router.delete('/:id', (req, res) => {
  const { id } = req.params;

  const query = 'DELETE FROM categories WHERE id = $1 RETURNING *';
  const values = [id];

  pool.query(query, values, (error, result) => {
    if (error) {
      res.status(500).json({ error: 'Failed to delete category' });
    } else {
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Category not found' });
      }

      res.json(result.rows[0]);
    }
  });
});


export default router;