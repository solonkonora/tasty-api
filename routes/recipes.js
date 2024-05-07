import express from 'express';
import { createCloudinaryFolder, setupImageFolders, uploadImageToFolder } from '../db_config/cloudinary_config.js';
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
 * /recipes:
 *   get:
 *     summary: Get all recipes
 *     responses:
 *       200:
 *         description: Retrieve all recipes
 */
// Get all recipes
router.get('/', async (req, res) => {
  try {
    const query = 'SELECT * FROM recipes';
    const { rows } = await pool.query(query);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve recipes' });
  }
});

/**
 * @swagger
 * /recipes/{id}:
 *   get:
 *     summary: Get a recipe by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the recipe
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Retrieve a recipe by ID
 *       404:
 *         description: Recipe not found
 */
// Get a recipe by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const recipe = await getRecipeById(id);
    if (!recipe) {
      return res.status(404).json({ error: 'Recipe not found' });
    }
    res.json(recipe);
  } catch (err) {
    console.error('Error getting recipe:', err);
    res.status(500).json({ error: 'Error getting recipe' });
  }
});

/**
 * @swagger
 * /recipes:
 *   post:
 *     summary: Create a new recipe
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               image_path:
 *                 type: string
 *               created_at:
 *                 type: string
 *               updated_at:
 *                 type: string
 *               category_id:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Recipe created successfully
 *       500:
 *         description: Failed to create recipe
 */
// post 
router.post('/', async (req, res) => {
  try {
    const { title, description, image_path, created_at, updated_at, category_id } = req.body;

    // Upload the image to Cloudinary
    const folderName = 'food-images'; 
    const uploadedImage = await uploadImageToFolder(image_path, folderName);

    // Get the URL path of the uploaded image
    const imageUrl = uploadedImage.secure_url;

    // Save the recipe details, including the image path, to the database
    const query = 'INSERT INTO recipes (title, description, image_path, created_at, updated_at, category_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *';
    const values = [title, description, imageUrl, created_at, updated_at, category_id];
    const { rows } = await pool.query(query, values);

    res.status(201).json(rows[0]);
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: 'Failed to create recipe' });
  }
});


/**
 * @swagger
 * /recipes/{id}:
 *   put:
 *     summary: Update a recipe
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the recipe
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               image_path:
 *                 type: string
 *               created_at:
 *                 type: string
 *               updated_at:
 *                 type: string
 *               category_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Recipe updated successfully
 *       404:
 *         description: Recipe not found
 *       500:
 *         description: Failed to update recipe
 */
// Update a recipe
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, image_path, created_at, updated_at, category_id } = req.body;

    const query = 'UPDATE recipes SET title = $1, description = $2, image_path = $3, updated_at = $4, category_id = $5 WHERE id = $6 RETURNING *';
    const values = [title, description, image_path, created_at, updated_at, category_id];

    const { rows } = await pool.query(query, values);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Recipe not found' });
    }

    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update recipe' });
  }
});

/**
 * @swagger
 * /recipes/{id}:
 *   delete:
 *     summary: Delete a recipe
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the recipe
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Recipe deleted successfully
 *       404:
 *         description: Recipe not found
 *       500:
 *         description: Failed to delete recipe
 */
// Delete a recipe
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const query = 'DELETE FROM recipes WHERE id = $1 RETURNING *';
    const values = [id];

    const { rows } = await pool.query(query, values);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Recipe not found' });
    }

    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete recipe' });
  }
});

// Function to get a recipe by ID
async function getRecipeById(id) {
  const query = 'SELECT * FROM recipes WHERE id = $1';
  const values = [id];
  const { rows } = await pool.query(query, values);
  return rows[0];
}

export default router;