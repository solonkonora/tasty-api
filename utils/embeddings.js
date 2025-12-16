import { HfInference } from '@huggingface/inference';

// Initialize Hugging Face client
const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

/**
 * Generate embedding for text using Hugging Face
 * @param {string} text - Text to embed
 * @returns {Promise<number[]>} - Embedding vector
 */
async function generateEmbedding(text) {
  if (!text || typeof text !== 'string') {
    throw new Error('Text must be a non-empty string');
  }

  try {
    // Use sentence-transformers model for embeddings (384 dimensions, free)
    const response = await hf.featureExtraction({
      model: 'sentence-transformers/all-MiniLM-L6-v2',
      inputs: text.trim()
    });

    // The response is already an array of numbers (embedding vector)
    return Array.isArray(response[0]) ? response[0] : response;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw error;
  }
}

/**
 * Generate embedding text from recipe data
 * Combines name, description, ingredients, and category for better semantic search
 * @param {Object} recipe - Recipe object
 * @returns {string} - Combined text for embedding
 */
function prepareRecipeTextForEmbedding(recipe) {
  const parts = [];

  // Handle both 'title' (production) and 'name' (legacy/import)
  const recipeName = recipe.title || recipe.name;
  if (recipeName) {
    parts.push(`Recipe: ${recipeName}`);
  }

  if (recipe.description) {
    parts.push(`Description: ${recipe.description}`);
  }

  if (recipe.category_name) {
    parts.push(`Category: ${recipe.category_name}`);
  }

  if (recipe.cuisine) {
    parts.push(`Cuisine: ${recipe.cuisine}`);
  }

  // Add ingredients if available
  if (recipe.ingredients && Array.isArray(recipe.ingredients)) {
    const ingredientList = recipe.ingredients
      .map(ing => ing.ingredient_name || ing.name)
      .filter(Boolean)
      .join(', ');
    if (ingredientList) {
      parts.push(`Ingredients: ${ingredientList}`);
    }
  }

  // Add instruction preview if available
  if (recipe.instructions && Array.isArray(recipe.instructions)) {
    const firstSteps = recipe.instructions
      .slice(0, 3)
      .map(inst => inst.description || inst.instruction)
      .filter(Boolean)
      .join(' ');
    if (firstSteps) {
      parts.push(`Steps: ${firstSteps}`);
    }
  }

  return parts.join('. ');
}

/**
 * Batch generate embeddings for multiple texts
 * More efficient than individual calls
 * @param {string[]} texts - Array of texts to embed
 * @returns {Promise<number[][]>} - Array of embedding vectors
 */
async function generateBatchEmbeddings(texts) {
  if (!Array.isArray(texts) || texts.length === 0) {
    throw new Error('Texts must be a non-empty array');
  }

  // Hugging Face feature extraction (batch)
  const batchSize = 32; // Hugging Face models may have lower batch limits
  const allEmbeddings = [];

  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);
    try {
      const response = await hf.featureExtraction({
        model: 'sentence-transformers/all-MiniLM-L6-v2',
        inputs: batch.map(text => text.trim())
      });
      // Response is an array of arrays
      if (Array.isArray(response) && Array.isArray(response[0])) {
        allEmbeddings.push(...response);
      } else if (Array.isArray(response)) {
        allEmbeddings.push(response);
      }
    } catch (error) {
      console.error(`Error generating batch embeddings (batch ${i / batchSize + 1}):`, error);
      throw error;
    }
  }

  return allEmbeddings;
}

/**
 * Calculate cosine similarity between two vectors
 * @param {number[]} vecA - First vector
 * @param {number[]} vecB - Second vector
 * @returns {number} - Similarity score (0-1)
 */
function cosineSimilarity(vecA, vecB) {
  if (vecA.length !== vecB.length) {
    throw new Error('Vectors must have the same length');
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

export {
  generateEmbedding,
  generateBatchEmbeddings,
  prepareRecipeTextForEmbedding,
  cosineSimilarity,
};
