-- Update Recipe Image URLs with Cloudinary Links
-- Run this after uploading images to Cloudinary
-- Replace 'YOUR_CLOUD_NAME' with your actual Cloudinary cloud name (drs0ewxd1)

-- Update Breakfast Recipes
UPDATE recipes SET image_path = 'https://res.cloudinary.com/drs0ewxd1/image/upload/v1/cameroon-recipes/breakfast/puff-puff.jpg' WHERE title = 'Puff Puff';
UPDATE recipes SET image_path = 'https://res.cloudinary.com/drs0ewxd1/image/upload/v1/cameroon-recipes/breakfast/accra-banana.jpg' WHERE title = 'Accra Banana';
UPDATE recipes SET image_path = 'https://res.cloudinary.com/drs0ewxd1/image/upload/v1/cameroon-recipes/breakfast/beans-plantains.jpg' WHERE title = 'Beans and Plantains';
UPDATE recipes SET image_path = 'https://res.cloudinary.com/drs0ewxd1/image/upload/v1/cameroon-recipes/breakfast/yam-eggs.jpg' WHERE title = 'Boiled Yam with Eggs';

-- Update Lunch Recipes
UPDATE recipes SET image_path = 'https://res.cloudinary.com/drs0ewxd1/image/upload/v1/cameroon-recipes/lunch/ndole.jpg' WHERE title = 'Ndolé';
UPDATE recipes SET image_path = 'https://res.cloudinary.com/drs0ewxd1/image/upload/v1/cameroon-recipes/lunch/eru.jpg' WHERE title = 'Eru';
UPDATE recipes SET image_path = 'https://res.cloudinary.com/drs0ewxd1/image/upload/v1/cameroon-recipes/lunch/kati-kati.jpg' WHERE title = 'Kati Kati';
UPDATE recipes SET image_path = 'https://res.cloudinary.com/drs0ewxd1/image/upload/v1/cameroon-recipes/lunch/achu-soup.jpg' WHERE title = 'Achu Soup';
UPDATE recipes SET image_path = 'https://res.cloudinary.com/drs0ewxd1/image/upload/v1/cameroon-recipes/lunch/jollof-rice.jpg' WHERE title = 'Jollof Rice';
UPDATE recipes SET image_path = 'https://res.cloudinary.com/drs0ewxd1/image/upload/v1/cameroon-recipes/lunch/fufu-eru.jpg' WHERE title = 'Fufu and Eru';
UPDATE recipes SET image_path = 'https://res.cloudinary.com/drs0ewxd1/image/upload/v1/cameroon-recipes/lunch/egusi-soup.jpg' WHERE title = 'Egusi Soup';

-- Update Dinner Recipes
UPDATE recipes SET image_path = 'https://res.cloudinary.com/drs0ewxd1/image/upload/v1/cameroon-recipes/dinner/pepper-soup.jpg' WHERE title = 'Pepper Soup';
UPDATE recipes SET image_path = 'https://res.cloudinary.com/drs0ewxd1/image/upload/v1/cameroon-recipes/dinner/mbanga-soup.jpg' WHERE title = 'Mbanga Soup';
UPDATE recipes SET image_path = 'https://res.cloudinary.com/drs0ewxd1/image/upload/v1/cameroon-recipes/dinner/okra-soup.jpg' WHERE title = 'Okra Soup';

-- Update Dessert Recipes
UPDATE recipes SET image_path = 'https://res.cloudinary.com/drs0ewxd1/image/upload/v1/cameroon-recipes/dessert/banana-fritters.jpg' WHERE title = 'Banana Fritters';
UPDATE recipes SET image_path = 'https://res.cloudinary.com/drs0ewxd1/image/upload/v1/cameroon-recipes/dessert/coconut-drops.jpg' WHERE title = 'Coconut Drops';
UPDATE recipes SET image_path = 'https://res.cloudinary.com/drs0ewxd1/image/upload/v1/cameroon-recipes/dessert/chin-chin.jpg' WHERE title = 'Chin Chin';

-- Update Snack Recipes
UPDATE recipes SET image_path = 'https://res.cloudinary.com/drs0ewxd1/image/upload/v1/cameroon-recipes/snacks/soya.jpg' WHERE title = 'Soya (Suya)';
UPDATE recipes SET image_path = 'https://res.cloudinary.com/drs0ewxd1/image/upload/v1/cameroon-recipes/snacks/beignets.jpg' WHERE title = 'Beignets (Puff Puff)';
UPDATE recipes SET image_path = 'https://res.cloudinary.com/drs0ewxd1/image/upload/v1/cameroon-recipes/snacks/corn-pears.jpg' WHERE title = 'Roasted Corn and Pears';
UPDATE recipes SET image_path = 'https://res.cloudinary.com/drs0ewxd1/image/upload/v1/cameroon-recipes/snacks/plantain-chips.jpg' WHERE title = 'Plantain Chips';
UPDATE recipes SET image_path = 'https://res.cloudinary.com/drs0ewxd1/image/upload/v1/cameroon-recipes/snacks/kilishi.jpg' WHERE title = 'Kilishi';

-- Verify updates
SELECT id, title, image_path FROM recipes ORDER BY category_id, id;
