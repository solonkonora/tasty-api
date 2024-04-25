import express from 'express';
import { createCloudinaryFolder, setupImageFolders, uploadImageToFolder } from '../db_config/cloudinary_config.js';
import pool from '../db_config/db.js'
import { config } from 'dotenv';
config();


const router = express.Router();

// Middleware to parse JSON request bodies
//router.use(express.json()) // allows you to access the request body data using req.body in the route handlers.

// Get all recipes
router.get('/', async (req, res) => {
  try {
    const query = 'SELECT * FROM recipe';
    const { rows } = await pool.query(query);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve recipes' });
  }
});

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


router.post('/', async (req, res) => {
  try {
    const { title, description, image_path, created_at, updated_at, categories_id } = req.body;

    // Upload the image to Cloudinary
    const folderName = 'food-images'; 
    const uploadedImage = await uploadImageToFolder(image_path, folderName);

    // Get the URL path of the uploaded image
    const imageUrl = uploadedImage.secure_url;

    // Save the recipe details, including the image path, to the database
    const query = 'INSERT INTO recipe (title, description, image_path, created_at, updated_at, categories_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *';
    const values = [title, description, imageUrl, created_at, updated_at, categories_id];
    const { rows } = await pool.query(query, values);

    res.status(201).json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create recipe' });
  }
});

// Update a recipe
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, image_path, created_at, updated_at, categories_id } = req.body;

    const query = 'UPDATE recipe SET title = $1, description = $2, image_path = $3, updated_at = $4, categories_id = $5 WHERE id = $6 RETURNING *';
    const values = [title, description, image_path, created_at, updated_at, categories_id];

    const { rows } = await pool.query(query, values);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Recipe not found' });
    }

    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update recipe' });
  }
});

// Delete a recipe
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const query = 'DELETE FROM recipe WHERE id = $1 RETURNING *';
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
  const query = 'SELECT * FROM recipe WHERE id = $1';
  const values = [id];
  const { rows } = await pool.query(query, values);
  return rows[0];
}

export default router;