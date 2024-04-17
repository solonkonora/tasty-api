import express from 'express';
const router = express.Router();
import pool from '../db_config/db.js';

// other parts of your application, you can import the pool instance and use it to execute queries:
// pool.query('SELECT * FROM users', (err, res) => {
//   if (err) {
//     console.error(err);
//     return;
//   }
//   console.log(res.rows);
// });

// GET /recipes
router.get('/', (req, res, next) => {
  // Logic to fetch all recipes
  res.json({ message: 'Fetched all recipes' });
});

// POST /recipes
router.post('/', (req, res, next) => {
  // Logic to create a new recipe
  res.status(201).json({ message: 'Created a new recipe' });
});

// PUT /recipes/:id
router.put('/:id', (req, res, next) => {
  // Logic to update an existing recipe
  res.json({ message: 'Updated the recipe' });
});

// DELETE /recipes/:id
router.delete('/:id', (req, res, next) => {
  // Logic to delete a recipe
  res.json({ message: 'Deleted the recipe' });
});

export default router;