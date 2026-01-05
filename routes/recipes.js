import express from 'express';
import multer from 'multer';
import { createCloudinaryFolder, setupImageFolders, uploadImageToFolder } from '../db_config/cloudinary_config.js';
import pool from '../db_config/db.js'
import { config } from 'dotenv';
import { authenticateToken } from '../middleware/auth.js';
import { generateEmbedding, prepareRecipeTextForEmbedding } from '../utils/embeddings.js';
config();

 import swaggerUi from 'swagger-ui-express';
 import YAML from 'yamljs';

const router = express.Router();

// configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

const swaggerDocument = YAML.load('./documentary/swagger-specs.yaml');

// mounting the Swagger UI middleware:
router.use('/api-docs', swaggerUi.serve);
router.get('/api-docs', swaggerUi.setup(swaggerDocument));

// upload image endpoint
router.post('/upload-image', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    console.log('Received image upload request');
    console.log('User:', req.user?.userId);
    console.log('File:', req.file ? `${req.file.originalname} (${req.file.size} bytes)` : 'No file');
    
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    // Convert buffer to base64 data URL
    const b64 = Buffer.from(req.file.buffer).toString('base64');
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;

    // Upload to Cloudinary - user uploads go to main cameroon-recipes folder
    const folderName = 'cameroon-recipes';
    const uploadedImage = await uploadImageToFolder(dataURI, folderName);

    console.log('✅ Image upload successful');
    res.json({ 
      success: true, 
      imageUrl: uploadedImage.secure_url,
      url: uploadedImage.secure_url,
      publicId: uploadedImage.public_id
    });
  } catch (error) {
    console.error('Image upload error:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      error: 'Failed to upload image',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// get all recipes (all public recipes visible to everyone)
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

// get user's own recipes
router.get('/my-recipes', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const query = 'SELECT * FROM recipes WHERE user_id = $1 ORDER BY created_at DESC';
    const { rows } = await pool.query(query, [userId]);
    res.json(rows);
  } catch (error) {
    console.error('Fetch my recipes error:', error);
    res.status(500).json({ error: 'Failed to fetch your recipes' });
  }
});


// get a recipe by ID (all recipes visible to everyone)
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

    // only upload to Cloudinary if image_path looks like a local file or data URL
    if (image_path && (image_path.startsWith('data:') || image_path.startsWith('file:'))) {
      const folderName = 'cameroon-recipes'; 
      const uploadedImage = await uploadImageToFolder(image_path, folderName);
      imageUrl = uploadedImage.secure_url;
    }

    // save the recipe details, including the image path and user_id, to the database
    const query = 'INSERT INTO recipes (title, description, image_path, category_id, user_id, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) RETURNING *';
    const values = [title, description, imageUrl, category_id, userId];
    const { rows } = await pool.query(query, values);
    const recipe = rows[0];

    // Generate embedding for semantic search (non-blocking)
    try {
      // Get category name for better embedding
      const categoryQuery = 'SELECT name FROM categories WHERE id = $1';
      const categoryResult = await pool.query(categoryQuery, [category_id]);
      const category_name = categoryResult.rows[0]?.name;

      const recipeForEmbedding = {
        ...recipe,
        category_name,
        ingredients: [],
        instructions: []
      };

      const embeddingText = prepareRecipeTextForEmbedding(recipeForEmbedding);
      const embedding = await generateEmbedding(embeddingText);
      const embeddingString = `[${embedding.join(',')}]`;

      await pool.query(
        'UPDATE recipes SET embedding = $1 WHERE id = $2',
        [embeddingString, recipe.id]
      );

      console.log(`Embedding generated for recipe: ${recipe.title}`);
    } catch (embError) {
      console.error('Warning: Failed to generate embedding:', embError.message);
      // Don't fail the request if embedding generation fails
    }

    res.status(201).json(recipe);
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

    let imageUrl = image_path;

    // Only upload to Cloudinary if image_path is a new upload (data URL)
    if (image_path && image_path.startsWith('data:')) {
      const folderName = 'cameroon-recipes';
      const uploadedImage = await uploadImageToFolder(image_path, folderName);
      imageUrl = uploadedImage.secure_url;
      console.log('New image uploaded during update:', imageUrl);
    }

    const query = 'UPDATE recipes SET title = $1, description = $2, image_path = $3, category_id = $4, updated_at = NOW() WHERE id = $5 AND user_id = $6 RETURNING *';
    const values = [title, description, imageUrl, category_id, id, userId];

    const { rows } = await pool.query(query, values);
    const recipe = rows[0];

    // Regenerate embedding for updated recipe (non-blocking)
    try {
      const categoryQuery = 'SELECT name FROM categories WHERE id = $1';
      const categoryResult = await pool.query(categoryQuery, [category_id]);
      const category_name = categoryResult.rows[0]?.name;

      const recipeForEmbedding = {
        ...recipe,
        category_name,
        ingredients: [],
        instructions: []
      };

      const embeddingText = prepareRecipeTextForEmbedding(recipeForEmbedding);
      const embedding = await generateEmbedding(embeddingText);
      const embeddingString = `[${embedding.join(',')}]`;

      await pool.query(
        'UPDATE recipes SET embedding = $1 WHERE id = $2',
        [embeddingString, recipe.id]
      );

      console.log(`Embedding updated for recipe: ${recipe.title}`);
    } catch (embError) {
      console.error('Warning: Failed to update embedding:', embError.message);
      // Don't fail the request if embedding generation fails
    }

    res.json(recipe);
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