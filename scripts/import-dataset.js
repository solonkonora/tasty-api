/**
 * RecipeNLG Dataset Import Script
 * 
 * Dataset: RecipeNLG (Recipe Natural Language Generation)
 * Source: https://recipenlg.cs.put.poznan.pl/
 * Size: 2.2M+ recipes
 * 
 * Dataset Format:
 * - title: Recipe name
 * - ingredients: Array of ingredient strings
 * - directions: Array of instruction strings
 * - link: Source URL
 * - source: Website name (e.g., "Gathered", "Epicurious")
 * - NER: Named entities (ingredients identified)
 * 
 * Usage:
 * 1. Download RecipeNLG dataset (full_dataset.csv or recipes_raw_nosource_*.json)
 * 2. Place in tasty-api/datasets/ folder
 * 3. Set AUTH_TOKEN environment variable
 * 4. Run: node scripts/import-dataset.js
 */

import fs from 'fs';
import fetch from 'node-fetch';
import path from 'path';
import process from 'process';
import readline from 'readline';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000/api';
const AUTH_TOKEN = process.env.AUTH_TOKEN; // Get this from login
const DATASET_PATH = process.env.DATASET_PATH || path.join(__dirname, './data/RecipeNLG_dataset.csv');
const BATCH_SIZE = parseInt(process.env.BATCH_SIZE) || 100; // Recipes per batch
const MAX_RECIPES = parseInt(process.env.MAX_RECIPES) || 1000; // Limit for testing
// Stop after this many African recipes have been approved/saved
const TARGET_AFRICAN = parseInt(process.env.TARGET_AFRICAN) || 50;

/**
 * Parse RecipeNLG JSON format
 */
function parseRecipeNLG(recipe) {
  // RecipeNLG format:
  // {
  //   "title": "Recipe Name",
  //   "ingredients": ["ingredient 1", "ingredient 2"],
  //   "directions": ["step 1", "step 2"],
  //   "link": "url",
  //   "source": "website"
  // }
  
  return {
    title: recipe.title,
    name: recipe.title, // For backwards compatibility
    description: recipe.title, // RecipeNLG doesn't have descriptions
    ingredients: Array.isArray(recipe.ingredients) 
      ? recipe.ingredients.join(', ') 
      : recipe.ingredients,
    instructions: Array.isArray(recipe.directions)
      ? recipe.directions.map((step, i) => `${i + 1}. ${step}`).join(' ')
      : recipe.directions,
    cuisine: recipe.source || 'Unknown', // Use source as initial cuisine hint
    image_path: null,
    source_url: recipe.link
  };
}

/**
 * Read RecipeNLG dataset from JSON file
 */
async function readRecipeNLGDataset(limit = MAX_RECIPES) {
  console.log(`📖 Reading RecipeNLG dataset from: ${DATASET_PATH}`);
  
  if (!fs.existsSync(DATASET_PATH)) {
    throw new Error(`Dataset file not found: ${DATASET_PATH}\n
    Download from: https://recipenlg.cs.put.poznan.pl/dataset
    Or: https://github.com/Glorf/recipenlg
    
    Place the file at: ${DATASET_PATH}`);
  }

  const recipes = [];
  
  // Check if it's a JSON array file or JSONL (one JSON per line)
  const fileContent = fs.readFileSync(DATASET_PATH, 'utf-8').trim();
  
  if (fileContent.startsWith('[')) {
    // JSON array format
    const data = JSON.parse(fileContent);
    const recipesToProcess = data.slice(0, limit);
    
    for (const recipe of recipesToProcess) {
      try {
        recipes.push(parseRecipeNLG(recipe));
      } catch (error) {
        console.error(`Error parsing recipe: ${recipe.title}`, error.message);
      }
    }
  } else {
    // JSONL format (one JSON object per line)
    const lines = fileContent.split('\n');
    
    for (let i = 0; i < Math.min(lines.length, limit); i++) {
      if (!lines[i].trim()) continue;
      
      try {
        const recipe = JSON.parse(lines[i]);
        recipes.push(parseRecipeNLG(recipe));
      } catch (error) {
        console.error(`Error parsing line ${i + 1}`, error.message);
      }
    }
  }

  console.log(`✅ Loaded ${recipes.length} recipes from RecipeNLG dataset`);
  return recipes;
}

/**
 * Read CSV format (if using full_dataset.csv)
 */
async function readRecipeNLGCSV(limit = MAX_RECIPES) {
  console.log(`📖 Reading RecipeNLG CSV from: ${DATASET_PATH}`);
  
  return new Promise((resolve, reject) => {
    const recipes = [];
    const fileStream = fs.createReadStream(DATASET_PATH);
    
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity
    });

    let isFirstLine = true;
    let headers = [];

    rl.on('line', (line) => {
      if (isFirstLine) {
        headers = line.split(',');
        isFirstLine = false;
        return;
      }

      if (recipes.length >= limit) {
        rl.close();
        return;
      }

      try {
        // Basic CSV parsing (may need adjustment for complex CSVs)
        const values = line.split(',');
        const recipe = {};
        
        headers.forEach((header, i) => {
          recipe[header.trim()] = values[i]?.trim();
        });

        recipes.push(parseRecipeNLG(recipe));
      } catch (error) {
        // Skip invalid rows
      }
    });

    rl.on('close', () => {
      console.log(`✅ Loaded ${recipes.length} recipes from CSV`);
      resolve(recipes);
    });

    rl.on('error', reject);
  });
}

/**
 * Step 1: Import batch of recipes
 */
async function importBatch(recipes, source = 'dataset') {
  console.log(`\n📥 Importing ${recipes.length} recipes from ${source}...`);
  
  const response = await fetch(`${API_BASE_URL}/import/batch`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${AUTH_TOKEN}`
    },
    body: JSON.stringify({ recipes, source })
  });

  if (!response.ok) {
    throw new Error(`Import failed: ${response.statusText}`);
  }

  const result = await response.json();
  console.log(`✅ Imported successfully! Batch ID: ${result.batchId}`);
  return result.batchId;
}

/**
 * Step 2: Run AI classification on batch
 */
async function classifyBatch(batchId) {
  console.log(`\n🤖 Running AI classification on batch ${batchId}...`);
  
  let hasMore = true;
  let totalProcessed = 0;
  let totalAfrican = 0;

  while (hasMore) {
    const response = await fetch(`${API_BASE_URL}/import/classify/${batchId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`
      }
    });

    if (!response.ok) {
      throw new Error(`Classification failed: ${response.statusText}`);
    }

    const result = await response.json();
    totalProcessed += result.processed;
    totalAfrican += result.africanRecipes;

    console.log(`   Processed: ${result.processed}, African: ${result.africanRecipes}, Remaining: ${result.remaining}`);

    hasMore = result.remaining > 0;

    // Wait a bit to avoid rate limits
    if (hasMore) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  console.log(`✅ Classification complete! Total African recipes: ${totalAfrican}/${totalProcessed}`);
  return { totalProcessed, totalAfrican };
}

/**
 * Step 3: Get pending African recipes for review
 */
async function getPendingRecipes() {
  console.log(`\n📋 Fetching pending African recipes...`);
  
  const response = await fetch(`${API_BASE_URL}/import/pending`, {
    headers: {
      'Authorization': `Bearer ${AUTH_TOKEN}`
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch pending recipes: ${response.statusText}`);
  }

  const recipes = await response.json();
  console.log(`✅ Found ${recipes.length} pending African recipes`);
  
  // Display summary
  recipes.slice(0, 5).forEach(recipe => {
    console.log(`\n   ${recipe.name}`);
    console.log(`   Cuisine: ${recipe.normalized_cuisine}`);
    console.log(`   Category: ${recipe.suggested_category}`);
    console.log(`   Confidence: ${(recipe.ai_confidence_score * 100).toFixed(1)}%`);
    console.log(`   Ingredients: ${recipe.ingredient_count}, Instructions: ${recipe.instruction_count}`);
  });

  return recipes;
}

/**
 * Step 4: Normalize a recipe (ingredients & instructions)
 */
async function normalizeRecipe(recipeId) {
  console.log(`\n🔄 Normalizing recipe ${recipeId}...`);
  
  const response = await fetch(`${API_BASE_URL}/import/normalize/${recipeId}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${AUTH_TOKEN}`
    }
  });

  if (!response.ok) {
    throw new Error(`Normalization failed: ${response.statusText}`);
  }

  const result = await response.json();
  console.log(`✅ Normalized: ${result.ingredients} ingredients, ${result.instructions} instructions`);
  return result;
}

/**
 * Step 5: Approve and migrate recipe to main tables
 */
async function approveRecipe(recipeId) {
  console.log(`\n✅ Approving recipe ${recipeId}...`);
  
  const response = await fetch(`${API_BASE_URL}/import/approve/${recipeId}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${AUTH_TOKEN}`
    }
  });

  if (!response.ok) {
    throw new Error(`Approval failed: ${response.statusText}`);
  }

  const result = await response.json();
  console.log(`✅ Recipe approved! New recipe ID: ${result.recipeId}`);
  return result.recipeId;
}

/**
 * Main workflow for RecipeNLG dataset
 */
async function main() {
  try {
    console.log('🚀 Starting RecipeNLG import workflow...');
    console.log(`API: ${API_BASE_URL}`);
    console.log(`Max recipes: ${MAX_RECIPES}`);
    console.log(`Batch size: ${BATCH_SIZE}`);
    console.log(`Target African recipes to save: ${TARGET_AFRICAN}`);

    if (!AUTH_TOKEN) {
      console.error('❌ ERROR: AUTH_TOKEN environment variable is required');
      console.log('   Get your token by logging in and copy it from browser DevTools');
      console.log('   Then run: export AUTH_TOKEN="your_token_here"');
      process.exit(1);
    }

    // Read RecipeNLG dataset
    const allRecipes = DATASET_PATH.endsWith('.csv')
      ? await readRecipeNLGCSV(MAX_RECIPES)
      : await readRecipeNLGDataset(MAX_RECIPES);

    if (allRecipes.length === 0) {
      console.error('❌ No recipes loaded from dataset');
      process.exit(1);
    }

    // Process in batches
    const batches = [];
    for (let i = 0; i < allRecipes.length; i += BATCH_SIZE) {
      batches.push(allRecipes.slice(i, i + BATCH_SIZE));
    }

    console.log(`\n📦 Processing ${allRecipes.length} recipes in ${batches.length} batches\n`);

    let totalAfrican = 0;
    let totalProcessed = 0;
    const batchIds = [];

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      console.log(`\n${'='.repeat(60)}`);
      console.log(`Batch ${i + 1}/${batches.length} (${batch.length} recipes)`);
      console.log('='.repeat(60));

      // Step 1: Import batch
      const batchId = await importBatch(batch, 'RecipeNLG');
      batchIds.push(batchId);

      // Step 2: Classify with AI
      const { totalProcessed: processed, totalAfrican: african } = await classifyBatch(batchId);
      totalProcessed += processed;
      totalAfrican += african;

      console.log(`\n✅ Batch ${i + 1} complete: ${african} African recipes found out of ${processed}`);

      // After classification, fetch pending African recipes and auto-normalize/approve
      // until we reach TARGET_AFRICAN. This helps stop early when enough recipes saved.
      if (totalAfrican < TARGET_AFRICAN) {
        const pending = await getPendingRecipes();
        // Sort by AI confidence descending
        pending.sort((a, b) => (b.ai_confidence_score || 0) - (a.ai_confidence_score || 0));

        for (const rec of pending) {
          if (totalAfrican >= TARGET_AFRICAN) break;

          // Determine recipe id field (varies by backend response)
          const recipeId = rec.id || rec.temp_recipe_id || rec.temp_id || rec.tempId || rec.recipe_id;
          if (!recipeId) {
            console.warn('Skipping pending recipe with no identifiable id:', rec.name || rec);
            continue;
          }

          try {
            await normalizeRecipe(recipeId);
            await approveRecipe(recipeId);
            totalAfrican += 1;
            console.log(`   ➕ Approved and saved recipe (id: ${recipeId}). Total saved: ${totalAfrican}/${TARGET_AFRICAN}`);
            // Short delay to avoid hammering the API
            await new Promise(resolve => setTimeout(resolve, 500));
          } catch (err) {
            console.error('Error normalizing/approving recipe id', recipeId, err.message || err);
          }
        }
      }

      // If target reached, break out of batch processing early
      if (totalAfrican >= TARGET_AFRICAN) {
        console.log(`Target of ${TARGET_AFRICAN} African recipes reached, stopping import.`);
        break;
      }

      // Small delay between batches
      if (i < batches.length - 1) {
        console.log('   ⏳ Waiting 3 seconds before next batch...');
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }

    // Step 3: Get all pending African recipes
    console.log('\n' + '='.repeat(60));
    const pendingRecipes = await getPendingRecipes();

    if (pendingRecipes.length > 0) {
      console.log('\n📋 Top 10 African Recipes by Confidence:\n');
      
      pendingRecipes.slice(0, 10).forEach((recipe, i) => {
        console.log(`${i + 1}. ${recipe.name}`);
        console.log(`   Cuisine: ${recipe.normalized_cuisine}`);
        console.log(`   Category: ${recipe.suggested_category}`);
        console.log(`   Confidence: ${(recipe.ai_confidence_score * 100).toFixed(1)}%\n`);
      });

      // Ask if user wants to auto-approve high-confidence recipes
      console.log('\n💡 Next Steps:');
      console.log('   1. Review pending recipes at /api/import/pending');
      console.log('   2. Normalize ingredients/instructions: POST /api/import/normalize/:id');
      console.log('   3. Approve recipes: POST /api/import/approve/:id');
      console.log('\n   Or use the admin dashboard (coming soon!)');
    }

    console.log('\n' + '='.repeat(60));
    console.log('🎉 Import workflow completed successfully!');
    console.log('='.repeat(60));
    console.log('\n📊 Final Summary:');
    console.log(`   - Total recipes processed: ${totalProcessed}`);
    console.log(`   - African recipes found: ${totalAfrican} (${(totalAfrican/totalProcessed*100).toFixed(1)}%)`);
    console.log(`   - Pending review: ${pendingRecipes.length}`);
    console.log(`   - Batches created: ${batchIds.length}`);
    console.log('\n💰 Estimated Cost:');
    console.log(`   - Classification: ~$${(totalProcessed * 0.003).toFixed(2)}`);
    console.log(`   - Total recipes to normalize: ${pendingRecipes.length}`);
    console.log(`   - Estimated normalization cost: ~$${(pendingRecipes.length * 0.005).toFixed(2)}`);
    console.log(`   - Grand total: ~$${(totalProcessed * 0.003 + pendingRecipes.length * 0.005).toFixed(2)}\n`);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.stack) {
      console.error('\nStack trace:', error.stack);
    }
    process.exit(1);
  }
}

// Run if executed directly (ES module check)
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { 
  importBatch, 
  classifyBatch, 
  getPendingRecipes, 
  normalizeRecipe, 
  approveRecipe,
  readRecipeNLGDataset,
  readRecipeNLGCSV
};
