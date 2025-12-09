import pool from '../db_config/db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function seedData() {
  const client = await pool.connect();
  
  try {
    console.log('Starting database seeding process...\n');

    await client.query('BEGIN');

    // Read and execute seed.sql
    console.log('Reading seed.sql file...');
    const seedPath = path.join(__dirname, '../db_config/seed.sql');
    let seedSQL = fs.readFileSync(seedPath, 'utf8');
    
    // Remove SQL comments (lines starting with --)
    seedSQL = seedSQL
      .split('\n')
      .filter(line => !line.trim().startsWith('--'))
      .join('\n');
    
    console.log('Inserting seed data...');
    // Split by semicolons that are followed by newline or end of string
    const statements = seedSQL
      .split(/;\s*\n/)
      .map(s => s.trim())
      .filter(s => s.length > 0);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement && statement.length > 0) {
        // Add semicolon back if needed
        const finalStatement = statement.endsWith(';') ? statement : statement + ';';
        const preview = finalStatement.substring(0, 80).replace(/\n/g, ' ');
        console.log(`  [${i + 1}/${statements.length}] ${preview}...`);
        
        try {
          const result = await client.query(finalStatement);
          console.log(`    ✓ Affected rows: ${result.rowCount || 0}`);
        } catch (err) {
          console.log(`    ✗ Error: ${err.message}`);
          throw err;
        }
      }
    }
    console.log('Seed data inserted successfully\n');

    // Verify data
    console.log('Verification:');
    const { rows: [categories] } = await client.query('SELECT COUNT(*) FROM categories');
    const { rows: [recipes] } = await client.query('SELECT COUNT(*) FROM recipes');
    const { rows: [ingredients] } = await client.query('SELECT COUNT(*) FROM ingredients');
    const { rows: [instructions] } = await client.query('SELECT COUNT(*) FROM instructions');
    
    console.log(`   - Categories: ${categories.count}`);
    console.log(`   - Recipes: ${recipes.count}`);
    console.log(`   - Ingredients: ${ingredients.count}`);
    console.log(`   - Instructions: ${instructions.count}\n`);

    await client.query('COMMIT');
    console.log('Database seeding completed successfully!\n');
    console.log('Next step: Run the classification script to mark main/optional ingredients\n');
    console.log('   Command: node scripts/classify-ingredients.js\n');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error during seeding:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the script
seedData()
  .then(() => {
    console.log('Script finished successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });
