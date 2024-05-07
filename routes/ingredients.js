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


/**
 * @swagger
 * /ingredients/{recipeId}:
 *   get:
 *     summary: Get ingredients for a recipe
 *     parameters:
 *       - in: path
 *         name: recipeId
 *         required: true
 *         description: ID of the recipe
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Returns an array of ingredients for the recipe
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Ingredient'
 *       500:
 *         description: Failed to fetch ingredients
 */
router.get('/:recipeId', (req, res) => {
  const { recipeId } = req.params;
  const query = 'SELECT * FROM ingredients WHERE recipe_id = $1';
  const values = [recipeId];

  pool.query(query, values, (error, result) => {
    if (error) {
      res.status(500).json({ error: 'Failed to fetch ingredients' });
    } else {
      res.json(result.rows);
    }
  });
});

/**
 * @swagger
 * /ingredients/{recipeId}:
 *   post:
 *     summary: Create an ingredient for a recipe
 *     parameters:
 *       - in: path
 *         name: recipeId
 *         required: true
 *         description: ID of the recipe
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NewIngredient'
 *     responses:
 *       201:
 *         description: Returns the created ingredient
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Ingredient'
 *       500:
 *         description: Failed to create ingredient
 */
router.post('/:recipeId', (req, res) => {
  const { recipeId } = req.params;
  const { name, amount } = req.body;

  const query = 'INSERT INTO ingredients (recipe_id, name, amount) VALUES ($1, $2, $3) RETURNING *';
  const values = [recipeId, name, amount];

  pool.query(query, values, (error, result) => {
    if (error) {
      res.status(500).json({ error: 'Failed to create ingredient' });
    } else {
      res.status(201).json(result.rows[0]);
    }
  });
});

/**
 * @swagger
 * /ingredients/{id}:
 *   put:
 *     summary: Update an ingredient
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the ingredient
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Ingredient'
 *     responses:
 *       200:
 *         description: Returns the updated ingredient
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Ingredient'
 *       404:
 *         description: Ingredient not found
 *       500:
 *         description: Failed to update ingredient
 */
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

/**
 * @swagger
 * /ingredients/{id}:
 *   delete:
 *     summary: Delete an ingredient
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the ingredient
 *         schema:
 *           type: integer
 *     responses:
 *       201:
 *         description: Returns the deleted ingredient
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Ingredient'
 *       404:
 *         description: Ingredient not found
 *       500:
 *         description: Failed to delete ingredient
 */
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
        res.status(201).json(rows[0]);
      }
    }
  });
});

export default router;