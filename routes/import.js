import express from 'express';
import fs from 'fs';
import { query } from '../db_config/queryHelper.js';
import { authenticateToken } from '../middleware/auth.js';
import { HfInference } from '@huggingface/inference';
import { generateEmbedding, prepareRecipeTextForEmbedding } from '../utils/embeddings.js';

const router = express.Router();

// Initialize Hugging Face
const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

// Helper to call Hugging Face safely and return a predictable object
async function safeTextGeneration(params) {
  try {
    const result = await hf.textGeneration(params);
    if (!result || typeof result.generated_text !== 'string') {
      console.warn('Hugging Face returned unexpected response for textGeneration', { model: params.model });
      return { generated_text: '' };
    }
    return result;
  } catch (err) {
    console.error('Hugging Face textGeneration error:', err && err.message ? err.message : err);
    // Return empty generated_text so caller can continue gracefully
    return { generated_text: '' };
  }
}

// African cuisine detection configuration
const AFRICAN_CONFIDENCE_THRESHOLD = parseFloat(process.env.AFRICAN_CONFIDENCE_THRESHOLD) || 0.7;
const AFRICAN_KEYWORD_THRESHOLD = parseInt(process.env.AFRICAN_KEYWORD_THRESHOLD) || 1;

// Starter curated keyword lists (expand as needed)
const AFRICAN_PROTEINS = [
  'goat meat', 'beef', 'ox', 'lamb', 'chicken', 'smoked fish', 'tilapia', 'mackerel', 'catfish', 'prawns', 'crayfish', 'yabby', 'beans', 'lentils', 'cowpeas', 'black-eyed peas', 'egusi', 'groundnut', 'peanut'
];
const AFRICAN_SPICES = [
  'berbere', 'harissa', 'Ginger', 'Garlic', 'Cumin', 'Coriander', 'Cloves', 'Cinnamon', 'Turmeric', 'piri piri', 'piri', 'suya', 'egusi', 'calabash nutmeg', 'dawadawa', 'iru', 'palm oil', 'alligator pepper'
];
const AFRICAN_CARBS = [
  'fufu', 'ugali', 'banku', 'couscous', 'injera', 'teff', 'cassava', 'yam', 'plantain', 'maize', 'pap', 'sadza', 'matoke', 'bananas', 'rice', 'millet', 'sorghum', 'garri', 'tapioca', 'legumes'
];
const AFRICAN_DISH_NAMES = [
  'jollof', 'egusi-soup', 'suya', 'yassa', 'tagine', 'ndole', 'ugali', 'matoke', 'injera', 'bobotie', 'piri-piri', 'banga', 'moambe', 'cornchaff', 'koki', 'fufu', 'chakalaka', 'bunny chow', 'achu', 'mbuzi', 'nyama choma', 'yams'
];

function findKeywordMatches(text) {
  if (!text || typeof text !== 'string') return [];
  const t = text.toLowerCase();
  const found = new Set();

  const lists = [AFRICAN_PROTEINS, AFRICAN_SPICES, AFRICAN_CARBS, AFRICAN_DISH_NAMES];
  for (const list of lists) {
    for (const kw of list) {
      const safeKw = kw.toLowerCase();
      // word boundary check
      const re = new RegExp('\\b' + safeKw.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\$&') + '\\b', 'i');
      if (re.test(t)) found.add(kw);
    }
  }

  return Array.from(found);
}

/**
 * POST /import/batch
 * Import a batch of recipes from dataset
 * Body: { recipes: [...], source: 'dataset_name' }
 */
router.post('/batch', authenticateToken, async (req, res) => {
  const { recipes, source } = req.body;

  if (!recipes || !Array.isArray(recipes) || recipes.length === 0) {
    return res.status(400).json({ error: 'Recipes array is required' });
  }

  const batchId = `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  try {
    // Create batch record
    await query(
      `INSERT INTO import_batches (id, source, total_recipes) 
       VALUES ($1, $2, $3)`,
      [batchId, source || 'unknown', recipes.length]
    );

    // Insert recipes into temp table
    for (const recipe of recipes) {
      await query(
        `INSERT INTO temp_recipes_import 
        (title, description, raw_ingredients, raw_instructions, image_path, cuisine, source, import_batch_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          recipe.title || recipe.name,
          recipe.description || null,
          recipe.ingredients || null,
          recipe.instructions || null,
          recipe.image_path || null,
          recipe.cuisine || null,
          source || 'dataset',
          batchId
        ]
      );
    }

    res.json({
      message: 'Batch imported successfully',
      batchId,
      totalRecipes: recipes.length
    });
  } catch (error) {
    console.error('Batch import error:', error);
    res.status(500).json({ error: 'Failed to import batch' });
  }
});

/**
 * POST /import/classify/:batchId
 * Run AI classification on a batch
 */
router.post('/classify/:batchId', authenticateToken, async (req, res) => {
  const { batchId } = req.params;

  try {
    // Get unprocessed recipes from batch
    const result = await query(
      `SELECT id, title, description, raw_ingredients, cuisine 
       FROM temp_recipes_import 
       WHERE import_batch_id = $1 AND ai_classified = FALSE 
       LIMIT 50`, // Process in chunks of 50
      [batchId]
    );

    const recipes = result.rows;

    if (recipes.length === 0) {
      return res.json({ message: 'No recipes to classify' });
    }

    let processedCount = 0;
    let africanCount = 0;

    // Process each recipe with AI
    for (const recipe of recipes) {
      try {
        // Update status to processing
        await query(
          `UPDATE temp_recipes_import 
           SET processing_status = 'processing' 
           WHERE id = $1`,
          [recipe.id]
        );

        // Call Hugging Face for classification
        const prompt = `You are a culinary expert. Analyze this recipe and determine if it's African cuisine.

Recipe: ${recipe.title}
Ingredients: ${recipe.raw_ingredients || 'N/A'}
Original Cuisine: ${recipe.cuisine || 'Unknown'}

Respond with ONLY valid JSON:
{"isAfrican": true/false, "confidence": 0.0-1.0, "category": "category name", "cuisine": "cuisine type", "reasoning": "brief explanation"}`;

        // Use safe wrapper to avoid throwing errors from HF client
        const response = await safeTextGeneration({
          model: 'mistralai/Mistral-7B-Instruct-v0.2',
          inputs: prompt,
          parameters: {
            max_new_tokens: 200,
            temperature: 0.3,
            return_full_text: false
          }
        });

        let classification = {
          isAfrican: false,
          confidence: 0.5,
          category: 'Main Course',
          cuisine: 'Unknown',
          reasoning: 'Unable to classify'
        };

        try {
          const text = response.generated_text || '';
          const jsonMatch = text.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            // Validate parsed structure minimally
            classification.isAfrican = Boolean(parsed.isAfrican);
            classification.confidence = typeof parsed.confidence === 'number' ? parsed.confidence : classification.confidence;
            classification.category = parsed.category || classification.category;
            classification.cuisine = parsed.cuisine || classification.cuisine;
            classification.reasoning = parsed.reasoning || classification.reasoning;
          } else if (text.trim()) {
            // If HF returned text but no JSON, keep the fallback and add reasoning
            classification.reasoning = `Non-JSON response: ${text.substring(0, 200)}`;
          }
        } catch (parseErr) {
          console.error('Error parsing classification response:', parseErr && parseErr.message ? parseErr.message : parseErr);
          classification.reasoning = 'Parse error';
        }

        // Keyword-based fallback/boost: check ingredients/title for typical African indicators
        try {
          const combinedText = `${recipe.title || ''} ${recipe.raw_ingredients || ''}`;
          const matches = findKeywordMatches(combinedText);
          const matchCount = matches.length;

          // Decision rules:
          // - Accept model if it predicts African with confidence >= AFRICAN_CONFIDENCE_THRESHOLD
          // - Otherwise, if keyword matches >= AFRICAN_KEYWORD_THRESHOLD, mark as African
          // - Otherwise leave model decision as-is
          let finalIsAfrican = classification.isAfrican && (classification.confidence >= AFRICAN_CONFIDENCE_THRESHOLD);
          let decisionNote = `model:isAfrican=${classification.isAfrican},confidence=${classification.confidence}`;

          if (!finalIsAfrican && matchCount >= AFRICAN_KEYWORD_THRESHOLD) {
            finalIsAfrican = true;
            decisionNote += `; keyword_match=${matches.join(',')}`;
          }

          // If model said African but confidence low, and keywords present, boost confidence slightly
          if (classification.isAfrican && classification.confidence < AFRICAN_CONFIDENCE_THRESHOLD && matchCount > 0) {
            classification.confidence = Math.min(1, classification.confidence + 0.2);
            decisionNote += `; boosted_confidence=${classification.confidence}`;
          }

          // Attach a brief decision reason to classification.reasoning for logs
          classification.reasoning = (classification.reasoning || '') + ` [decision:${finalIsAfrican ? 'AFRICAN' : 'NOT_AFRICAN'}; ${decisionNote}]`;

          // Use the final decision
          classification.isAfrican = finalIsAfrican;

          if (matchCount > 0) console.log(`Keyword matches for recipe ${recipe.id}:`, matches);
        } catch (kwErr) {
          console.error('Keyword detection error:', kwErr && kwErr.message ? kwErr.message : kwErr);
        }

        // Update recipe with classification
        await query(
          `UPDATE temp_recipes_import 
           SET ai_classified = TRUE,
               is_african = $2,
               ai_confidence_score = $3,
               suggested_category = $4,
               normalized_cuisine = $5,
               processing_status = 'completed',
               processed_at = CURRENT_TIMESTAMP
           WHERE id = $1`,
          [
            recipe.id,
            classification.isAfrican,
            classification.confidence,
            classification.category,
            classification.cuisine
          ]
        );

        processedCount++;
        if (classification.isAfrican) africanCount++;

      } catch (error) {
        console.error(`Error processing recipe ${recipe.id}:`, error);
        
        // Mark as failed
        await query(
          `UPDATE temp_recipes_import 
           SET processing_status = 'failed',
               processing_error = $2
           WHERE id = $1`,
          [recipe.id, error.message]
        );
      }
    }

    // Update batch statistics
    await query(
      `UPDATE import_batches 
       SET processed_recipes = processed_recipes + $2,
           african_recipes_found = african_recipes_found + $3
       WHERE id = $1`,
      [batchId, processedCount, africanCount]
    );

    // Get remaining count
    const remainingResult = await query(
      `SELECT COUNT(*) as remaining 
       FROM temp_recipes_import 
       WHERE import_batch_id = $1 AND ai_classified = FALSE`,
      [batchId]
    );

    res.json({
      message: 'Classification completed',
      processed: processedCount,
      africanRecipes: africanCount,
      remaining: parseInt(remainingResult.rows[0].remaining)
    });

  } catch (error) {
    console.error('Classification error:', error);
    res.status(500).json({ error: 'Failed to classify recipes' });
  }
});

/**
 * POST /import/normalize/:recipeId
 * Normalize ingredients and instructions for a specific recipe
 */
router.post('/normalize/:recipeId', authenticateToken, async (req, res) => {
  const { recipeId } = req.params;

  try {
    // Get recipe
    const result = await query(
      `SELECT * FROM temp_recipes_import WHERE id = $1`,
      [recipeId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Recipe not found' });
    }

    const recipe = result.rows[0];

    // AI-powered ingredient normalization using Hugging Face
    const ingredientPrompt = `You are a culinary expert. Parse recipe ingredients into structured format.\n\nClassify each ingredient as:\n- is_main: true → Essential/required ingredient (main protein, base starch, primary vegetables)\n- is_main: false → Optional/garnish ingredient (garnishes, optional toppings, "to taste" items)\n\nExamples:\n- "2 cups rice" → is_main: true (base ingredient)\n- "1 lb chicken" → is_main: true (main protein)\n- "Fresh parsley for garnish" → is_main: false (garnish)\n- "Salt to taste" → is_main: false (seasoning to taste)\n- "Optional cheese topping" → is_main: false (explicitly optional)\n\nReturn ONLY valid JSON array:\n[{"name": "ingredient name", "quantity": "amount", "unit": "unit", "is_main": boolean}]\n\nRules:\n- Normalize units (tbsp, tablespoon → tablespoon)\n- Separate quantity from ingredient name\n- Mark garnishes, "to taste", and "optional" items as is_main: false\n- All essential cooking ingredients are is_main: true\n\nParse these ingredients:\n${recipe.raw_ingredients}`;
    const ingredientCompletion = await safeTextGeneration({
      model: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
      inputs: ingredientPrompt,
      parameters: { max_new_tokens: 800, temperature: 0.2 }
    });
    // Extract JSON from the response (Hugging Face returns a string)
    let ingredients = [];
    try {
      const text = ingredientCompletion.generated_text || '';
      fs.appendFileSync('hf_logs.txt', `Recipe ${recipeId} ingredient response: ${text}\n`);
      const match = text.match(/\[.*\]/s);
      if (match) {
        ingredients = JSON.parse(match[0]);
      } else if (text.trim()) {
        console.warn('Ingredient normalization returned non-JSON text; skipping:', text.substring(0, 200));
      }
    } catch (e) {
      console.error('Error parsing ingredient normalization response:', e && e.message ? e.message : e);
      ingredients = [];
    }

    // AI-powered instruction normalization using Hugging Face
    const instructionPrompt = `You are a culinary expert. Break recipe instructions into clear, numbered steps.\n\nGuidelines:\n- Each step should be concise and actionable\n- Number steps sequentially starting from 1\n- Combine very short steps if logical\n- Keep cooking times and temperatures with their steps\n- Use clear cooking terminology\n\nReturn ONLY valid JSON array:\n[{"step": number, "description": "clear step text"}]\n\nInput: ${recipe.raw_instructions}`;
    const instructionCompletion = await safeTextGeneration({
      model: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
      inputs: instructionPrompt,
      parameters: { max_new_tokens: 1000, temperature: 0.2 }
    });
    // Extract JSON from the response
    let instructions = [];
    try {
      const text = instructionCompletion.generated_text || '';
      fs.appendFileSync('hf_logs.txt', `Recipe ${recipeId} instruction response: ${text}\n`);
      const match = text.match(/\[.*\]/s);
      if (match) {
        instructions = JSON.parse(match[0]);
      } else if (text.trim()) {
        console.warn('Instruction normalization returned non-JSON text; skipping:', text.substring(0, 200));
      }
    } catch (e) {
      console.error('Error parsing instruction normalization response:', e && e.message ? e.message : e);
      instructions = [];
    }

    // Store normalized ingredients
    for (const ing of ingredients) {
      await query(
        `INSERT INTO temp_ingredients_normalized 
         (temp_recipe_id, ingredient_name, quantity, unit, is_main, ai_normalized)
         VALUES ($1, $2, $3, $4, $5, TRUE)`,
        [
          recipeId, 
          ing.name, 
          ing.quantity || null, 
          ing.unit || null, 
          ing.is_main !== undefined ? ing.is_main : true  // Default to main if not specified
        ]
      );
    }

    // Store normalized instructions
    for (const inst of instructions) {
      await query(
        `INSERT INTO temp_instructions_normalized 
         (temp_recipe_id, step_number, description, ai_enhanced)
         VALUES ($1, $2, $3, TRUE)`,
        [recipeId, inst.step, inst.description]
      );
    }

    res.json({
      message: 'Recipe normalized successfully',
      ingredients: ingredients.length,
      instructions: instructions.length
    });

  } catch (error) {
    console.error('Normalization error:', error);
    res.status(500).json({ error: 'Failed to normalize recipe' });
  }
});

/**
 * POST /import/approve/:recipeId
 * Approve and migrate recipe from temp to main tables
 */
router.post('/approve/:recipeId', authenticateToken, async (req, res) => {
  const { recipeId } = req.params;
  const userId = req.user.id;

  try {
    // Get recipe with normalized data
    const recipeResult = await query(
      `SELECT * FROM temp_recipes_import WHERE id = $1 AND is_african = TRUE`,
      [recipeId]
    );

    if (recipeResult.rows.length === 0) {
      return res.status(404).json({ error: 'African recipe not found' });
    }

    const tempRecipe = recipeResult.rows[0];

    // Get category ID
    const categoryResult = await query(
      `SELECT id FROM categories WHERE name ILIKE $1 LIMIT 1`,
      [tempRecipe.suggested_category]
    );

    const categoryId = categoryResult.rows[0]?.id || 1; // Default to first category

    // Insert into main recipes table
    const newRecipeResult = await query(
      `INSERT INTO recipes 
       (title, description, image_path, category_id, user_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      [
        tempRecipe.title,
        tempRecipe.description,
        tempRecipe.image_path,
        categoryId,
        userId
      ]
    );

    const newRecipeId = newRecipeResult.rows[0].id;

    // Get ingredients for embedding
    const ingredientsResult = await query(
      `SELECT * FROM temp_ingredients_normalized WHERE temp_recipe_id = $1`,
      [recipeId]
    );

    // Migrate ingredients
    for (const ing of ingredientsResult.rows) {
      await query(
        `INSERT INTO ingredients (recipe_id, name, quantity, unit, is_main)
         VALUES ($1, $2, $3, $4, $5)`,
        [newRecipeId, ing.ingredient_name, ing.quantity, ing.unit, ing.is_main]
      );
    }

    // Get instructions for embedding
    const instructionsResult = await query(
      `SELECT * FROM temp_instructions_normalized WHERE temp_recipe_id = $1 ORDER BY step_number`,
      [recipeId]
    );

    // Migrate instructions
    for (const inst of instructionsResult.rows) {
      await query(
        `INSERT INTO instructions (recipe_id, step_number, description)
         VALUES ($1, $2, $3)`,
        [newRecipeId, inst.step_number, inst.description]
      );
    }

    // Generate and store embedding for semantic search
    try {
      const recipeData = {
        title: tempRecipe.title,
        description: tempRecipe.description,
        category_name: tempRecipe.suggested_category,
        cuisine: tempRecipe.normalized_cuisine,
        ingredients: ingredientsResult.rows,
        instructions: instructionsResult.rows
      };

      const embeddingText = prepareRecipeTextForEmbedding(recipeData);
      const embedding = await generateEmbedding(embeddingText);
      const embeddingString = `[${embedding.join(',')}]`;

      // Update recipe with embedding
      await query(
        `UPDATE recipes SET embedding = $1::vector WHERE id = $2`,
        [embeddingString, newRecipeId]
      );

      console.log(`✅ Generated embedding for recipe ${newRecipeId}`);
    } catch (embeddingError) {
      console.error(`Warning: Failed to generate embedding for recipe ${newRecipeId}:`, embeddingError);
      // Don't fail the whole operation if embedding fails
    }

    // Clean up temp data
    await query(`DELETE FROM temp_recipes_import WHERE id = $1`, [recipeId]);

    res.json({
      message: 'Recipe approved and migrated successfully',
      recipeId: newRecipeId
    });

  } catch (error) {
    console.error('Approval error:', error);
    res.status(500).json({ error: 'Failed to approve recipe' });
  }
});

/**
 * GET /import/batches
 * Get all import batches with statistics
 */
router.get('/batches', authenticateToken, async (req, res) => {
  try {
    const result = await query(
      `SELECT * FROM import_batches ORDER BY started_at DESC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching batches:', error);
    res.status(500).json({ error: 'Failed to fetch batches' });
  }
});

/**
 * GET /import/pending
 * Get pending African recipes ready for review
 */
router.get('/pending', authenticateToken, async (req, res) => {
  try {
    const result = await query(
      `SELECT t.*, 
              (SELECT COUNT(*) FROM temp_ingredients_normalized WHERE temp_recipe_id = t.id) as ingredient_count,
              (SELECT COUNT(*) FROM temp_instructions_normalized WHERE temp_recipe_id = t.id) as instruction_count
       FROM temp_recipes_import t
       WHERE t.is_african = TRUE 
         AND t.ai_classified = TRUE
         AND t.processing_status = 'completed'
       ORDER BY t.ai_confidence_score DESC
       LIMIT 50`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching pending recipes:', error);
    res.status(500).json({ error: 'Failed to fetch pending recipes' });
  }
});

export default router;
