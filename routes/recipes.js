

// recipe.js
//Here's an example of how the recipe.js router could interact with the populate_recipe.js module:
//createRecipe and updateRecipe bcs those are the two that have been defined in the ppopulate_recipe.js for now

import express from 'express';
import { createRecipe, updateRecipe } from '../db_population/populate_recipe.js';
import { config } from 'dotenv';
config();

const router = express.Router();

// Create a new recipe
router.post('/', async (req, res) => {
  try {
    const { name, description, image } = req.body;
    const newRecipe = await createRecipe(name, description, image);
    res.status(201).json(newRecipe);
  } catch (err) {
    res.status(400).json({ error: 'Error creating recipe' });
  }
});

// Update an existing recipe
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, image } = req.body;
    const updatedRecipe = await updateRecipe(id, name, description, image);
    res.json(updatedRecipe);
  } catch (err) {
    res.status(400).json({ error: 'Error updating recipe' });
  }
});








// import express from 'express';
// import db from '../db_config/db.js';

//const router = express.Router();

// Get all recipes
router.get('/', async (req, res) => {
  try {
    const recipes = await db.query('SELECT * FROM recipes');
    res.json(recipes);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching recipes' });
  }
});

// Get a single recipe by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [recipe] = await db.query('SELECT * FROM recipes WHERE id = ?', [id]);
    if (!recipe) {
      return res.status(404).json({ error: 'Recipe not found' });
    }
    res.json(recipe);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching recipe' });
  }
});

// Create a new recipe
router.post('/', async (req, res) => {
  try {
    const { name, description, image_path } = req.body;
    const result = await db.query('INSERT INTO recipes (name, description, image_path, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())', [name, description, image_path]);
    const newRecipe = {
      id: result.insertId,
      name,
      description,
      image_path,
      created_at: new Date(),
      updated_at: new Date()
    };
    res.status(201).json(newRecipe);
  } catch (err) {
    res.status(400).json({ error: 'Error creating recipe' });
  }
});

// Update an existing recipe
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, image_path } = req.body;
    await db.query('UPDATE recipes SET name = ?, description = ?, image_path = ?, updated_at = NOW() WHERE id = ?', [name, description, image_path, id]);
    const [updatedRecipe] = await db.query('SELECT * FROM recipes WHERE id = ?', [id]);
    res.json(updatedRecipe);
  } catch (err) {
    res.status(400).json({ error: 'Error updating recipe' });
  }
});

// Delete a recipe
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM recipes WHERE id = ?', [id]);
    res.json({ message: 'Recipe deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Error deleting recipe' });
  }
});

export default router;