import express from 'express';
import { createCloudinaryFolder, setupImageFolders, uploadImageToFolder } from '../db_config/cloudinary_config.js';
import pool from '../db_config/db.js'
import { config } from 'dotenv';
import { authenticateToken } from '../middleware/auth.js';
config();

 import swaggerUi from 'swagger-ui-express';
 import YAML from 'yamljs';

const router = express.Router();

const swaggerDocument = YAML.load('./documentary/swagger-specs.yaml');

// mounting the Swagger UI middleware:
router.use('/api-docs', swaggerUi.serve);
router.get('/api-docs', swaggerUi.setup(swaggerDocument));


// Get all recipes (all public recipes visible to everyone)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const query = 'SELECT * FROM recipes ORDER BY category_id ASC, id ASC';
    const { rows } = await pool.query(query);
    res.json(rows);
  } catch (error) {
    console.error('Fetch recipes error:', error);
    res.status(500).json({ error: 'Failed to fetch recipes' });
  }
});


// Get a recipe by ID (all recipes visible to everyone)
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = 'SELECT * FROM recipes WHERE id = $1';
    const { rows } = await pool.query(query, [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Recipe not found' });
    }
    
    res.json(rows[0]);
  } catch (err) {
    console.error('Error getting recipe:', err);
    res.status(500).json({ error: 'Error getting recipe' });
  }
});


// post 
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, description, image_path, category_id } = req.body;
    const userId = req.user.userId;

    let imageUrl = image_path;

    // Only upload to Cloudinary if image_path looks like a local file or data URL
    if (image_path && (image_path.startsWith('data:') || image_path.startsWith('file:'))) {
      const folderName = 'food-images'; 
      const uploadedImage = await uploadImageToFolder(image_path, folderName);
      imageUrl = uploadedImage.secure_url;
    }

    // Save the recipe details, including the image path and user_id, to the database
    const query = 'INSERT INTO recipes (title, description, image_path, category_id, user_id, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) RETURNING *';
    const values = [title, description, imageUrl, category_id, userId];
    const { rows } = await pool.query(query, values);

    res.status(201).json(rows[0]);
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: 'Failed to create recipe' });
  }
});

router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, image_path, category_id } = req.body;
    const userId = req.user.userId;

    // Verify ownership
    const checkQuery = 'SELECT id FROM recipes WHERE id = $1 AND user_id = $2';
    const checkResult = await pool.query(checkQuery, [id, userId]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Recipe not found or unauthorized' });
    }

    const query = 'UPDATE recipes SET title = $1, description = $2, image_path = $3, category_id = $4, updated_at = NOW() WHERE id = $5 AND user_id = $6 RETURNING *';
    const values = [title, description, image_path, category_id, id, userId];

    const { rows } = await pool.query(query, values);

    res.json(rows[0]);
  } catch (error) {
    console.error('Update recipe error:', error);
    res.status(500).json({ error: 'Failed to update recipe' });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const query = 'DELETE FROM recipes WHERE id = $1 AND user_id = $2 RETURNING *';
    const values = [id, userId];

    const { rows } = await pool.query(query, values);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Recipe not found or unauthorized' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Delete recipe error:', error);
    res.status(500).json({ error: 'Failed to delete recipe' });
  }
});

export default router;