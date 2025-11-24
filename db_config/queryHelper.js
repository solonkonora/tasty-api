import pool from './db.js';

/**
 * Execute a database query with automatic retry on connection failure
 * @param {string} queryText - The SQL query
 * @param {Array} params - Query parameters
 * @param {number} retries - Number of retries (default: 3)
 * @returns {Promise<Object>} Query result
 */
export async function queryWithRetry(queryText, params = [], retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const result = await pool.query(queryText, params);
      return result;
    } catch (error) {
      console.error(`Query attempt ${attempt} failed:`, error.message);
      
      // If it's a connection error and we have retries left, try again
      if (
        (error.message.includes('Connection terminated') || 
         error.message.includes('ECONNREFUSED') ||
         error.code === 'ENOTFOUND') && 
        attempt < retries
      ) {
        console.log(`Retrying query (attempt ${attempt + 1}/${retries})...`);
        // Wait a bit before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        continue;
      }
      
      // If it's not a connection error or we're out of retries, throw
      throw error;
    }
  }
}

export default queryWithRetry;
