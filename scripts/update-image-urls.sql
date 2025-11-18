-- this file does the following:
-- 1. Updates the image URLs in the recipes table to point to the newly uploaded images on Cloudinary
-- 2. Verifies the updates by selecting the id, title, and image_path from the recipes table

-- Update Breakfast Recipes
UPDATE recipes SET image_path = 'https://res.cloudinary.com/drs0ewxd1/image/upload/v1/cameroon-recipes/breakfast/puff-puff.jpg' WHERE title = 'Puff Puff (Breakfast)';
UPDATE recipes SET image_path = 'https://res.cloudinary.com/drs0ewxd1/image/upload/v1/cameroon-recipes/breakfast/accra-banana.png' WHERE title = 'Accra Banana';
UPDATE recipes SET image_path = 'https://res.cloudinary.com/drs0ewxd1/image/upload/v1/cameroon-recipes/breakfast/beans-ripe-plantain.png' WHERE title = 'Beans and Plantains';
UPDATE recipes SET image_path = 'https://res.cloudinary.com/drs0ewxd1/image/upload/v1/cameroon-recipes/breakfast/yam-egg.png' WHERE title = 'Boiled Yam with Eggs';

-- Update Lunch Recipes
UPDATE recipes SET image_path = 'https://res.cloudinary.com/drs0ewxd1/image/upload/v1/cameroon-recipes/lunch/ndole.jpeg' WHERE title = 'Ndolé';
UPDATE recipes SET image_path = 'https://res.cloudinary.com/drs0ewxd1/image/upload/v1/cameroon-recipes/lunch/eru.jpeg' WHERE title = 'Eru';
UPDATE recipes SET image_path = 'https://res.cloudinary.com/drs0ewxd1/image/upload/v1/cameroon-recipes/lunch/kati-kati.png' WHERE title = 'Kati Kati';
UPDATE recipes SET image_path = 'https://res.cloudinary.com/drs0ewxd1/image/upload/v1/cameroon-recipes/lunch/achu.jpg' WHERE title = 'Achu Soup';
UPDATE recipes SET image_path = 'https://res.cloudinary.com/drs0ewxd1/image/upload/v1/cameroon-recipes/lunch/jollof.jpg' WHERE title = 'Jollof Rice';
UPDATE recipes SET image_path = 'https://res.cloudinary.com/drs0ewxd1/image/upload/v1/cameroon-recipes/lunch/eru.jpeg' WHERE title = 'Fufu and Eru';
UPDATE recipes SET image_path = 'https://res.cloudinary.com/drs0ewxd1/image/upload/v1/cameroon-recipes/lunch/egusi-soup.png' WHERE title = 'Egusi Soup';

-- Update Dinner Recipes
UPDATE recipes SET image_path = 'https://res.cloudinary.com/drs0ewxd1/image/upload/v1/cameroon-recipes/dinner/pepper-soup.png' WHERE title = 'Pepper Soup';
UPDATE recipes SET image_path = 'https://res.cloudinary.com/drs0ewxd1/image/upload/v1/cameroon-recipes/dinner/banga-soup.png' WHERE title = 'Mbanga Soup';
UPDATE recipes SET image_path = 'https://res.cloudinary.com/drs0ewxd1/image/upload/v1/cameroon-recipes/dinner/okra-soup.png' WHERE title = 'Okra Soup';

-- Update Dessert Recipes
UPDATE recipes SET image_path = 'https://res.cloudinary.com/drs0ewxd1/image/upload/v1/cameroon-recipes/dessert/accra-banana.png' WHERE title = 'Banana Fritters';
UPDATE recipes SET image_path = 'https://res.cloudinary.com/drs0ewxd1/image/upload/v1/cameroon-recipes/dessert/puff-puff.jpg' WHERE title = 'Puff Puff (Dessert)';
UPDATE recipes SET image_path = 'https://res.cloudinary.com/drs0ewxd1/image/upload/v1/cameroon-recipes/dessert/coconut-drops.png' WHERE title = 'Coconut Drops';
UPDATE recipes SET image_path = 'https://res.cloudinary.com/drs0ewxd1/image/upload/v1/cameroon-recipes/dessert/chin-chin.png' WHERE title = 'Chin Chin';

-- Update Snack Recipes
UPDATE recipes SET image_path = 'https://res.cloudinary.com/drs0ewxd1/image/upload/v1/cameroon-recipes/snacks/suya.png' WHERE title = 'Soya (Suya)';
UPDATE recipes SET image_path = 'https://res.cloudinary.com/drs0ewxd1/image/upload/v1/cameroon-recipes/snacks/puff-puff.jpg' WHERE title = 'Puff Puff (Snack)';
UPDATE recipes SET image_path = 'https://res.cloudinary.com/drs0ewxd1/image/upload/v1/cameroon-recipes/snacks/roasted-corn.png' WHERE title = 'Roasted Corn and Pears';
UPDATE recipes SET image_path = 'https://res.cloudinary.com/drs0ewxd1/image/upload/v1/cameroon-recipes/snacks/chips.png' WHERE title = 'Plantain Chips';
UPDATE recipes SET image_path = 'https://res.cloudinary.com/drs0ewxd1/image/upload/v1/cameroon-recipes/snacks/kilishi.png' WHERE title = 'Kilishi';

-- Verify updates
SELECT id, title, image_path FROM recipes ORDER BY category_id, id;
