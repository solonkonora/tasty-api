/**
 * Generate embeddings for existing recipes in the database
 * 
 * This script:
 * 1. Fetches all recipes without embeddings
 * 2. Generates embeddings using OpenAI
 * 3. Updates recipes table with embeddings
 * 
 * Usage:
 * node scripts/generate-embeddings.js
 */

require('dotenv').config();
const { query } = require('../db_config/queryHelper');
const { generateEmbedding, prepareRecipeTextForEmbedding } = require('../utils/embeddings');

/**
 * Get recipes that need embeddings
 */
async function getRecipesNeedingEmbeddings() {
  const result = await query(
    `SELECT 
      r.id,
      r.title,
      r.description,
      c.name as category_name,
      COALESCE(
        json_agg(
          DISTINCT jsonb_build_object(
            'name', i.name,
            'ingredient_name', i.name,
            'quantity', i.quantity,
            'unit', i.unit,
            'is_main', i.is_main
          )
        ) FILTER (WHERE i.id IS NOT NULL),
        '[]'
      ) as ingredients,
      COALESCE(
        json_agg(
          DISTINCT jsonb_build_object(
            'step_number', ins.step_number,
            'description', ins.description
          ) ORDER BY ins.step_number
        ) FILTER (WHERE ins.id IS NOT NULL),
        '[]'
      ) as instructions
    FROM recipes r
    LEFT JOIN categories c ON r.category_id = c.id
    LEFT JOIN ingredients i ON r.id = i.recipe_id
    LEFT JOIN instructions ins ON r.id = ins.recipe_id
    WHERE r.embedding IS NULL
    GROUP BY r.id, c.name
    ORDER BY r.id`
  );

  return result.rows;
}

/**
 * Generate and save embedding for a recipe
 */
async function generateRecipeEmbedding(recipe) {
  try {
    // Prepare text for embedding
    const embeddingText = prepareRecipeTextForEmbedding(recipe);
    
    console.log(`  Generating embedding for: ${recipe.title}`);
    
    // Generate embedding
    const embedding = await generateEmbedding(embeddingText);
    
    // Convert to PostgreSQL vector format
    const embeddingString = `[${embedding.join(',')}]`;
    
    // Update recipe
    await query(
      `UPDATE recipes SET embedding = $1::vector WHERE id = $2`,
      [embeddingString, recipe.id]
    );
    
    return true;
  } catch (error) {
    console.error(`  ❌ Error for recipe ${recipe.id}:`, error.message);
    return false;
  }
}

/**
 * Process recipes in batches
 */
async function processRecipesInBatches(recipes, batchSize = 10) {
  let successCount = 0;
  let errorCount = 0;
  
  for (let i = 0; i < recipes.length; i += batchSize) {
    const batch = recipes.slice(i, i + batchSize);
    const batchNumber = Math.floor(i / batchSize) + 1;
    const totalBatches = Math.ceil(recipes.length / batchSize);
    
    console.log(`\n📦 Processing batch ${batchNumber}/${totalBatches} (${batch.length} recipes)`);
    
    // Process batch in parallel
    const results = await Promise.allSettled(
      batch.map(recipe => generateRecipeEmbedding(recipe))
    );
    
    // Count results
    results.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value) {
        successCount++;
      } else {
        errorCount++;
        console.error(`  ❌ Failed: ${batch[index].title}`);
      }
    });
    
    console.log(`  ✅ Batch complete: ${successCount} successful, ${errorCount} errors`);
    
    // Rate limiting delay (OpenAI has ~3500 RPM limit)
    if (i + batchSize < recipes.length) {
      console.log('  ⏳ Waiting 2 seconds before next batch...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  return { successCount, errorCount };
}

/**
 * Main function
 */
async function main() {
  try {
    console.log('🚀 Starting embedding generation for existing recipes...\n');
    
    // Check OpenAI API key
    if (!process.env.OPENAI_API_KEY) {
      console.error('❌ ERROR: OPENAI_API_KEY environment variable is required');
      process.exit(1);
    }
    
    // Get recipes needing embeddings
    console.log('📋 Fetching recipes without embeddings...');
    const recipes = await getRecipesNeedingEmbeddings();
    
    if (recipes.length === 0) {
      console.log('✅ All recipes already have embeddings!');
      return;
    }
    
    console.log(`\n📊 Found ${recipes.length} recipes needing embeddings`);
    console.log(`💰 Estimated cost: $${(recipes.length * 0.00002).toFixed(4)} (~$0.02 per 1000 recipes)\n`);
    
    // Process recipes
    const { successCount, errorCount } = await processRecipesInBatches(recipes, 10);
    
    console.log('\n' + '='.repeat(60));
    console.log('🎉 Embedding generation completed!');
    console.log('='.repeat(60));
    console.log(`✅ Successful: ${successCount} recipes`);
    console.log(`❌ Errors: ${errorCount} recipes`);
    console.log(`📊 Success rate: ${((successCount / recipes.length) * 100).toFixed(1)}%`);
    
    if (successCount > 0) {
      console.log('\n✨ Your recipes now support semantic search!');
      console.log('   - POST /api/search/semantic - Natural language search');
      console.log('   - GET /api/search/similar/:id - Find similar recipes');
      console.log('   - POST /api/search/hybrid - Combined keyword + semantic');
    }
    
  } catch (error) {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main().then(() => {
    console.log('\n✅ Script completed successfully\n');
    process.exit(0);
  }).catch(error => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
}

module.exports = { getRecipesNeedingEmbeddings, generateRecipeEmbedding };
