import pool from '../db_config/db.js';

/**
 * Sync image URLs in database with actual Cloudinary uploads
 * This updates the recipes table with the correct Cloudinary URLs
 */
async function syncImageUrls() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Syncing image URLs with Cloudinary...\n');

    await client.query('BEGIN');

    // Breakfast recipes
    await client.query(`UPDATE recipes SET image_path = 'https://res.cloudinary.com/drs0ewxd1/image/upload/v1/cameroon-recipes/breakfast/puff-puff.jpg' WHERE title = 'Puff Puff (Breakfast)'`);
    await client.query(`UPDATE recipes SET image_path = 'https://res.cloudinary.com/drs0ewxd1/image/upload/v1/cameroon-recipes/breakfast/accra.jpg' WHERE title = 'Accra Banana'`);
    await client.query(`UPDATE recipes SET image_path = 'https://res.cloudinary.com/drs0ewxd1/image/upload/v1/cameroon-recipes/breakfast/beans-ripe-plantain.png' WHERE title = 'Beans and Plantains'`);
    await client.query(`UPDATE recipes SET image_path = 'https://res.cloudinary.com/drs0ewxd1/image/upload/v1/cameroon-recipes/breakfast/yam-egg.png' WHERE title = 'Boiled Yam with Eggs'`);

    // Lunch recipes
    await client.query(`UPDATE recipes SET image_path = 'https://res.cloudinary.com/drs0ewxd1/image/upload/v1/cameroon-recipes/lunch/ndole.jpg' WHERE title = 'Ndolé'`);
    await client.query(`UPDATE recipes SET image_path = 'https://res.cloudinary.com/drs0ewxd1/image/upload/v1/cameroon-recipes/lunch/fufu-eru.jpg' WHERE title = 'Fufu and Eru'`);
    await client.query(`UPDATE recipes SET image_path = 'https://res.cloudinary.com/drs0ewxd1/image/upload/v1/cameroon-recipes/lunch/kati-kati.png' WHERE title = 'Kati Kati'`);
    await client.query(`UPDATE recipes SET image_path = 'https://res.cloudinary.com/drs0ewxd1/image/upload/v1/cameroon-recipes/lunch/achu.jpg' WHERE title = 'Achu Soup'`);
    await client.query(`UPDATE recipes SET image_path = 'https://res.cloudinary.com/drs0ewxd1/image/upload/v1/cameroon-recipes/lunch/jollof.jpg' WHERE title = 'Jollof Rice'`);
    await client.query(`UPDATE recipes SET image_path = 'https://res.cloudinary.com/drs0ewxd1/image/upload/v1/cameroon-recipes/lunch/egusi-soup.png' WHERE title = 'Egusi Soup'`);

    // Dinner recipes
    await client.query(`UPDATE recipes SET image_path = 'https://res.cloudinary.com/drs0ewxd1/image/upload/v1/cameroon-recipes/dinner/pepper-soup.png' WHERE title = 'Pepper Soup'`);
    await client.query(`UPDATE recipes SET image_path = 'https://res.cloudinary.com/drs0ewxd1/image/upload/v1/cameroon-recipes/dinner/banga-soup.png' WHERE title = 'Mbanga Soup'`);
    await client.query(`UPDATE recipes SET image_path = 'https://res.cloudinary.com/drs0ewxd1/image/upload/v1/cameroon-recipes/dinner/okra-soup.png' WHERE title = 'Okra Soup'`);

    // Dessert recipes
    await client.query(`UPDATE recipes SET image_path = 'https://res.cloudinary.com/drs0ewxd1/image/upload/v1/cameroon-recipes/dessert/accra-banana.png' WHERE title = 'Banana Fritters'`);
    await client.query(`UPDATE recipes SET image_path = 'https://res.cloudinary.com/drs0ewxd1/image/upload/v1/cameroon-recipes/dessert/puff-puff.jpg' WHERE title = 'Puff Puff (Dessert)'`);
    await client.query(`UPDATE recipes SET image_path = 'https://res.cloudinary.com/drs0ewxd1/image/upload/v1/cameroon-recipes/dessert/coconut-drops.png' WHERE title = 'Coconut Drops'`);
    await client.query(`UPDATE recipes SET image_path = 'https://res.cloudinary.com/drs0ewxd1/image/upload/v1/cameroon-recipes/dessert/chin-chin.png' WHERE title = 'Chin Chin'`);

    // Snack recipes
    await client.query(`UPDATE recipes SET image_path = 'https://res.cloudinary.com/drs0ewxd1/image/upload/v1/cameroon-recipes/snacks/suya.png' WHERE title = 'Soya (Suya)'`);
    await client.query(`UPDATE recipes SET image_path = 'https://res.cloudinary.com/drs0ewxd1/image/upload/v1/cameroon-recipes/snacks/puff-puff.jpg' WHERE title = 'Puff Puff (Snack)'`);
    await client.query(`UPDATE recipes SET image_path = 'https://res.cloudinary.com/drs0ewxd1/image/upload/v1/cameroon-recipes/snacks/roasted-corn.png' WHERE title = 'Roasted Corn and Pears'`);
    await client.query(`UPDATE recipes SET image_path = 'https://res.cloudinary.com/drs0ewxd1/image/upload/v1/cameroon-recipes/snacks/chips.png' WHERE title = 'Plantain Chips'`);
    await client.query(`UPDATE recipes SET image_path = 'https://res.cloudinary.com/drs0ewxd1/image/upload/v1/cameroon-recipes/snacks/kilishi.png' WHERE title = 'Kilishi'`);

    await client.query('COMMIT');

    // Verify updates
    console.log('📊 Updated recipes:\n');
    const { rows } = await client.query('SELECT id, title, image_path FROM recipes ORDER BY category_id, id');
    rows.forEach(row => {
      console.log(`  ✓ [${row.id}] ${row.title}`);
      console.log(`    ${row.image_path}\n`);
    });

    console.log('✅ Image URLs synced successfully! 🎉\n');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error syncing image URLs:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the script
syncImageUrls()
  .then(() => {
    console.log('Script finished successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });
