      -- Seed data for Cameroonian Food Recipe API
-- Traditional and authentic Cameroonian delicacies

-- Insert meal categories
INSERT INTO categories (name, description) VALUES
('Breakfast', 'Traditional Cameroonian morning meals to start your day with energy'),
('Lunch', 'Hearty midday meals, the main meal in Cameroonian culture'),
('Dinner', 'Evening meals, often lighter or leftover from lunch'),
('Dessert', 'Sweet treats and traditional Cameroonian desserts'),
('Snacks', 'Street food and quick bites popular across Cameroon')
ON CONFLICT DO NOTHING;

-- Insert Cameroonian recipes
INSERT INTO recipes (title, description, image_path, category_id) VALUES
-- Breakfast dishes
('Puff Puff (Breakfast)', 'Sweet, fluffy deep-fried dough balls, a beloved Cameroonian breakfast treat often enjoyed with beans or alone', 'https://res.cloudinary.com/drs0ewxd1/image/upload/v1/cameroon-recipes/breakfast/puff-puff.jpg', 1),
('Accra Banana', 'Spicy banana fritters made from overripe plantains, commonly served with hot pepper sauce', 'https://res.cloudinary.com/drs0ewxd1/image/upload/v1/cameroon-recipes/breakfast/accra-banana.png', 1),
('Beans and Plantains', 'Boiled red beans served with fried ripe plantains, a nutritious and filling breakfast', 'https://res.cloudinary.com/drs0ewxd1/image/upload/v1/cameroon-recipes/breakfast/beans-ripe-plantain.png', 1),
('Boiled Yam with Eggs', 'Soft boiled yam served with scrambled eggs and vegetable sauce', 'https://res.cloudinary.com/drs0ewxd1/image/upload/v1/cameroon-recipes/breakfast/yam-egg.png', 1),

-- Lunch dishes
('Ndolé', 'The national dish of Cameroon - bitter leaves cooked in groundnut paste with meat or fish, served with plantains or rice', 'https://res.cloudinary.com/drs0ewxd1/image/upload/v1/cameroon-recipes/lunch/ndole.jpeg', 2),
('Eru', 'A traditional dish from the Southwest - finely shredded eru leaves cooked with waterleaf, crayfish, and palm oil', 'https://res.cloudinary.com/drs0ewxd1/image/upload/v1/cameroon-recipes/lunch/eru.jpeg', 2),
('Kati Kati', 'Grilled chicken marinated in spices and grilled over charcoal, served with fried plantains and a spicy tomato sauce', 'https://res.cloudinary.com/drs0ewxd1/image/upload/v1/cameroon-recipes/lunch/kati-kati.png', 2),
('Achu Soup', 'A yellow soup made with limestone and palm oil, served with pounded cocoyam, popular in the Northwest region', 'https://res.cloudinary.com/drs0ewxd1/image/upload/v1/cameroon-recipes/lunch/achu.jpg', 2),
('Jollof Rice', 'The famous one-pot rice dish cooked in a rich tomato and pepper sauce with meat or fish', 'https://res.cloudinary.com/drs0ewxd1/image/upload/v1/cameroon-recipes/lunch/jollof.jpg', 2),
('Fufu and Eru', 'Pounded cassava served with the traditional eru vegetable soup', 'https://res.cloudinary.com/drs0ewxd1/image/upload/v1/cameroon-recipes/lunch/eru.jpeg', 2),
('Egusi Soup', 'Ground melon seed soup with vegetables and meat, served with fufu or garri', 'https://res.cloudinary.com/drs0ewxd1/image/upload/v1/cameroon-recipes/lunch/egusi-soup.png', 2),

-- Dinner dishes
('Pepper Soup', 'A spicy, aromatic broth with fish or meat, perfect for cool evenings', 'https://res.cloudinary.com/drs0ewxd1/image/upload/v1/cameroon-recipes/dinner/pepper-soup.png', 3),
('Mbanga Soup', 'Palm nut soup with fish and vegetables, served with fufu or rice', 'https://res.cloudinary.com/drs0ewxd1/image/upload/v1/cameroon-recipes/dinner/banga-soup.png', 3),
('Okra Soup', 'Slimy okra soup with assorted meat or fish, served with garri or fufu', 'https://res.cloudinary.com/drs0ewxd1/image/upload/v1/cameroon-recipes/dinner/okra-soup.png', 3),

-- Desserts
('Banana Fritters', 'Sweet ripe banana fritters dusted with sugar, a popular dessert', 'https://res.cloudinary.com/drs0ewxd1/image/upload/v1/cameroon-recipes/dessert/accra-banana.png', 4),
('Puff Puff (Dessert)', 'Deep-fried sweet dough balls sold by street vendors', 'https://res.cloudinary.com/drs0ewxd1/image/upload/v1/cameroon-recipes/dessert/puff-puff.jpg', 4),
('Coconut Drops', 'Sweet coconut candy made with grated coconut and caramelized sugar', 'https://res.cloudinary.com/drs0ewxd1/image/upload/v1/cameroon-recipes/dessert/coconut-drops.png', 4),
('Chin Chin', 'Crunchy, slightly sweet fried dough snacks, perfect with tea', 'https://res.cloudinary.com/drs0ewxd1/image/upload/v1/cameroon-recipes/dessert/chin-chin.png', 4),

-- Snacks
('Soya (Suya)', 'Spicy grilled beef skewers seasoned with groundnut spice mix, a popular street food', 'https://res.cloudinary.com/drs0ewxd1/image/upload/v1/cameroon-recipes/snacks/suya.png', 5),
('Puff Puff (Snack)', 'Deep-fried sweet dough balls sold by street vendors', 'https://res.cloudinary.com/drs0ewxd1/image/upload/v1/cameroon-recipes/snacks/puff-puff.jpg', 5),
('Roasted Corn and Pears', 'Grilled corn served with roasted African pear (safou), a classic street food combination', 'https://res.cloudinary.com/drs0ewxd1/image/upload/v1/cameroon-recipes/snacks/roasted-corn.png', 5),
('Plantain Chips', 'Thinly sliced and fried plantain chips, a crunchy snack', 'https://res.cloudinary.com/drs0ewxd1/image/upload/v1/cameroon-recipes/snacks/chips.png', 5),
('Kilishi', 'Spicy dried meat similar to jerky, originating from Northern Cameroon', 'https://res.cloudinary.com/drs0ewxd1/image/upload/v1/cameroon-recipes/snacks/kilishi.png', 5);

-- BREAKFAST RECIPES - Ingredients & Instructions

-- Recipe 1: Puff Puff
INSERT INTO ingredients (recipe_id, name, quantity, unit) VALUES
(1, 'All-purpose flour', '3', 'cups'),
(1, 'Sugar', '1/2', 'cup'),
(1, 'Active dry yeast', '2', 'teaspoons'),
(1, 'Warm water', '1.5', 'cups'),
(1, 'Salt', '1/4', 'teaspoon'),
(1, 'Nutmeg', '1/4', 'teaspoon'),
(1, 'Vegetable oil', '4', 'cups (for frying)')
ON CONFLICT DO NOTHING;

INSERT INTO instructions (recipe_id, step_number, description) VALUES
(1, 1, 'In a large bowl, mix flour, sugar, yeast, salt, and nutmeg together'),
(1, 2, 'Gradually add warm water while stirring to form a smooth batter (similar to pancake batter consistency)'),
(1, 3, 'Cover the bowl with a clean cloth and let it rise in a warm place for 45-60 minutes until it doubles in size'),
(1, 4, 'Heat vegetable oil in a deep pot over medium heat (about 350°F/175°C)'),
(1, 5, 'Using your hand or a spoon, scoop small amounts of batter and drop into the hot oil'),
(1, 6, 'Fry until golden brown on all sides, turning occasionally (about 3-4 minutes)'),
(1, 7, 'Remove with a slotted spoon and drain on paper towels'),
(1, 8, 'Serve warm, optionally with beans or as a standalone snack. Cultural note: Puff puff is a staple at Cameroonian celebrations and is often sold by street vendors throughout the day')
ON CONFLICT DO NOTHING;

-- Recipe 2: Accra Banana
INSERT INTO ingredients (recipe_id, name, quantity, unit) VALUES
(2, 'Overripe plantains', '4', 'medium'),
(2, 'All-purpose flour', '1/2', 'cup'),
(2, 'Onion', '1', 'small, finely chopped'),
(2, 'Fresh pepper (scotch bonnet)', '1', 'small, minced'),
(2, 'Ginger', '1', 'teaspoon, grated'),
(2, 'Salt', '1', 'teaspoon'),
(2, 'Vegetable oil', '3', 'cups (for frying)')
ON CONFLICT DO NOTHING;

INSERT INTO instructions (recipe_id, step_number, description) VALUES
(2, 1, 'Peel the overripe plantains and mash them thoroughly in a large bowl'),
(2, 2, 'Add flour, chopped onion, pepper, ginger, and salt to the mashed plantains'),
(2, 3, 'Mix everything together until well combined and smooth'),
(2, 4, 'Heat oil in a deep frying pan over medium-high heat'),
(2, 5, 'Scoop tablespoon-sized portions of the mixture and carefully drop into the hot oil'),
(2, 6, 'Fry until golden brown and crispy on both sides (about 3-4 minutes per side)'),
(2, 7, 'Remove and drain on paper towels'),
(2, 8, 'Serve hot with pepper sauce or pap. Cultural note: Accra is a popular breakfast item in the Littoral region, especially in Douala, and is often enjoyed alongside boiled plantains')
ON CONFLICT DO NOTHING;

-- Recipe 3: Beans and Plantains
INSERT INTO ingredients (recipe_id, name, quantity, unit) VALUES
(3, 'Red beans', '2', 'cups'),
(3, 'Ripe plantains', '3', 'large'),
(3, 'Palm oil', '3', 'tablespoons'),
(3, 'Onion', '1', 'medium, chopped'),
(3, 'Salt', '2', 'teaspoons'),
(3, 'Crayfish', '2', 'tablespoons, ground'),
(3, 'Maggi cubes', '2', 'cubes'),
(3, 'Water', '6', 'cups')
ON CONFLICT DO NOTHING;

INSERT INTO instructions (recipe_id, step_number, description) VALUES
(3, 1, 'Rinse the beans thoroughly and place in a pot with 6 cups of water'),
(3, 2, 'Boil the beans until soft and tender (about 1-2 hours, adding water as needed)'),
(3, 3, 'Add salt, Maggi cubes, and ground crayfish to the beans and cook for 10 more minutes'),
(3, 4, 'While beans are cooking, peel and slice plantains diagonally into 1-inch thick pieces'),
(3, 5, 'Heat palm oil in a frying pan and fry the plantain slices until golden brown on both sides'),
(3, 6, 'Drain fried plantains on paper towels'),
(3, 7, 'Serve the boiled beans with fried plantains on the side'),
(3, 8, 'Cultural note: This combination is a beloved Cameroonian breakfast that provides sustained energy. It is especially popular among students and workers')
ON CONFLICT DO NOTHING;

-- Recipe 4: Boiled Yam with Eggs
INSERT INTO ingredients (recipe_id, name, quantity, unit) VALUES
(4, 'White yam', '1', 'medium (about 2 lbs)'),
(4, 'Eggs', '4', 'large'),
(4, 'Onion', '1', 'medium, chopped'),
(4, 'Tomatoes', '2', 'medium, diced'),
(4, 'Fresh pepper', '1', 'small, minced'),
(4, 'Vegetable oil', '3', 'tablespoons'),
(4, 'Salt', '1', 'teaspoon'),
(4, 'Maggi cube', '1', 'cube'),
(4, 'Water', '8', 'cups')
ON CONFLICT DO NOTHING;

INSERT INTO instructions (recipe_id, step_number, description) VALUES
(4, 1, 'Peel the yam and cut into 2-inch chunks'),
(4, 2, 'Rinse the yam pieces and place in a pot with 8 cups of water and 1 teaspoon salt'),
(4, 3, 'Boil until tender when pierced with a fork (about 20-30 minutes)'),
(4, 4, 'While yam is boiling, prepare the egg sauce: heat oil in a pan and sauté onions until soft'),
(4, 5, 'Add tomatoes and pepper to the pan, cook until tomatoes break down (about 5 minutes)'),
(4, 6, 'Add Maggi cube and salt to taste, stir well'),
(4, 7, 'Beat eggs in a bowl and pour into the tomato mixture, stirring quickly to scramble'),
(4, 8, 'Cook eggs until just set but still moist'),
(4, 9, 'Drain the boiled yam and serve hot with the scrambled egg sauce on top'),
(4, 10, 'Cultural note: Yam is a staple food in Cameroon and is often served at celebrations. This breakfast is particularly popular in the Western and Northwest regions')
ON CONFLICT DO NOTHING;

-- LUNCH RECIPES - Ingredients & Instructions

-- Recipe 5: Ndolé (National Dish)
INSERT INTO ingredients (recipe_id, name, quantity, unit) VALUES
(5, 'Ndolé leaves (bitter leaves)', '2', 'lbs, washed and chopped'),
(5, 'Raw groundnuts (peanuts)', '2', 'cups'),
(5, 'Beef', '1', 'lb, cubed'),
(5, 'Smoked fish', '2', 'pieces'),
(5, 'Shrimp', '1', 'cup'),
(5, 'Crayfish', '1/2', 'cup, ground'),
(5, 'Palm oil', '1/2', 'cup'),
(5, 'Onions', '2', 'medium, chopped'),
(5, 'Garlic', '4', 'cloves, minced'),
(5, 'Maggi cubes', '3', 'cubes'),
(5, 'Salt', '2', 'teaspoons'),
(5, 'Water', '4', 'cups')
ON CONFLICT DO NOTHING;

INSERT INTO instructions (recipe_id, step_number, description) VALUES
(5, 1, 'Boil ndolé leaves in water for 15 minutes to reduce bitterness, then drain and squeeze out excess water. Repeat if needed'),
(5, 2, 'Roast groundnuts in a dry pan until fragrant, then grind or blend into a smooth paste with a little water'),
(5, 3, 'Season beef with salt, Maggi cubes, and onions, then boil until tender (about 30 minutes)'),
(5, 4, 'In a large pot, heat palm oil and sauté chopped onions and garlic until fragrant'),
(5, 5, 'Add the groundnut paste to the pot and stir continuously for 5 minutes to prevent burning'),
(5, 6, 'Add the boiled beef with its stock, smoked fish, shrimp, and ground crayfish'),
(5, 7, 'Add the prepared ndolé leaves and mix well with the groundnut sauce'),
(5, 8, 'Add water to achieve desired consistency (thick but not dry) and simmer for 20 minutes'),
(5, 9, 'Adjust seasoning with salt and Maggi cubes'),
(5, 10, 'Serve hot with boiled plantains, miondo (cassava sticks), rice, or fufu'),
(5, 11, 'Cultural note: Ndolé is Cameroon''s national dish and a symbol of Cameroonian identity. It is served at weddings, funerals, and major celebrations across all ten regions')
ON CONFLICT DO NOTHING;

-- Recipe 6: Eru
INSERT INTO ingredients (recipe_id, name, quantity, unit) VALUES
(6, 'Eru leaves (Okok)', '1', 'lb, finely shredded'),
(6, 'Waterleaf (or spinach)', '1', 'lb, chopped'),
(6, 'Smoked fish', '2', 'pieces'),
(6, 'Beef', '2', 'pieces'),
(6, 'Stockfish', '1', 'piece, soaked'),
(6, 'Crayfish', '1/2', 'cup, ground'),
(6, 'Palm oil', '1/2', 'cup'),
(6, 'Pepper', '2', 'teaspoons'),
(6, 'Maggi cubes', '2', 'cubes'),
(6, 'Salt', '1', 'teaspoon'),
(6, 'Water', '2', 'cups')
ON CONFLICT DO NOTHING;

INSERT INTO instructions (recipe_id, step_number, description) VALUES
(6, 1, 'Clean and finely shred the eru leaves (they should be hair-thin strips)'),
(6, 2, 'Wash and chop the waterleaf, set aside'),
(6, 3, 'In a pot, boil the waterleaf over medium heat'),
(6, 4, 'Add shredded eru leaves to the hot palm oil and stir for 5 minutes'),
(6, 5, 'Add ground crayfish, pepper, Maggi cubes, and salt, stir well'),
(6, 6, 'Add the smoked fish and soaked stockfish, boiled beef of desired quantity breaking them into smaller pieces'),
(6, 7, 'Add palm oil gradually while stirring to prevent the eru from clumping'),
(6, 8, 'Cover and simmer on low heat for 15-20 minutes, stirring occasionally'),
(6, 9, 'The dish is ready when the vegetables are soft and the sauce is thick'),
(6, 10, 'Serve hot with fufu, garri, or boiled plantains'),
(6, 11, 'Cultural note: Eru is a traditional dish of the Bayangi people in the Southwest region. It is a symbol of unity and is often prepared for communal gatherings'),
(6, 12, 'Add the chopped waterleaf and mix thoroughly')
ON CONFLICT DO NOTHING;

-- Recipe 7: Kati Kati (Grilled Chicken)
INSERT INTO ingredients (recipe_id, name, quantity, unit) VALUES
(7, 'Whole chicken', '1', 'medium, cut into pieces'),
(7, 'Onions', '2', 'large, sliced'),
(7, 'Garlic', '6', 'cloves, minced'),
(7, 'Ginger', '2', 'tablespoons, grated'),
(7, 'Fresh pepper', '3', 'pieces, blended'),
(7, 'Vegetable oil', '1/4', 'cup'),
(7, 'Maggi cubes', '3', 'cubes'),
(7, 'Paprika', '1', 'tablespoon'),
(7, 'Salt', '2', 'teaspoons'),
(7, 'Tomatoes', '4', 'large, diced (for sauce)'),
(7, 'Corn flour', '3', 'a few cups (for cooking)')
ON CONFLICT DO NOTHING;

INSERT INTO instructions (recipe_id, step_number, description) VALUES
(7, 1, 'Clean the chicken pieces thoroughly and pat dry'),
(7, 2, 'In a large bowl, mix onions, garlic, ginger, pepper, oil, Maggi cubes, black pepper, paprika, and salt to make marinade'),
(7, 3, 'Coat chicken pieces thoroughly with the marinade and let sit for at least 2 hours (overnight is best)'),
(7, 4, 'Prepare a charcoal grill or preheat your oven to 400°F (200°C)'),
(7, 5, 'Grill chicken over medium-hot charcoal, turning frequently and basting with marinade until fully cooked and charred (about 30-40 minutes)'),
(7, 6, 'While chicken is grilling, prepare the pepper sauce: sauté remaining onions in oil'),
(7, 7, 'Add diced tomatoes and fresh pepper to the pan, cook until sauce thickens (about 15 minutes)'),
(7, 8, 'Season sauce with salt and Maggi cube'),
(7, 9, 'Cook corn flour in a few cups of water until thickened'),
(7, 10, 'Serve grilled chicken with the cooked corn flour and spicy tomato sauce on the side'),
(7, 11, 'Cultural note: Kati Kati is a popular dish at Cameroonian restaurants and open-air grills (makolo) especially in urban areas. The name comes from the crackling sound of chicken on the grill')
ON CONFLICT DO NOTHING;

-- Recipe 8: Achu Soup (Yellow Soup)
INSERT INTO ingredients (recipe_id, name, quantity, unit) VALUES
(8, 'Palm oil', '1', 'cup'),
(8, 'Limestone (kanwa)', '1', 'tablespoon'),
(8, 'Water', '3', 'cups'),
(8, 'Beef', '1', 'lb, cut into chunks'),
(8, 'Tripe (cow leg)', '1/2', 'lb'),
(8, 'Smoked fish', '2', 'pieces'),
(8, 'Crayfish', '1/2', 'cup, ground'),
(8, 'achu soup spice mix', '3', 'tablespoons, ground'),
(8, 'Basil leaves', '1', 'cup, chopped'),
(8, 'Maggi cubes', '3', 'cubes'),
(8, 'Salt', '2', 'teaspoons'),
(8, 'Cocoyam', '6', 'medium (for pounding)')
ON CONFLICT DO NOTHING;

INSERT INTO instructions (recipe_id, step_number, description) VALUES
(8, 1, 'Boil beef and tripe with salt and Maggi cubes until very tender (about 1.5 hours)'),
(8, 2, 'Dissolve limestone in 1 cup of water, let it settle, then pour off the clear yellow liquid (discard sediment)'),
(8, 3, 'In a large pot, heat palm oil until very hot'),
(8, 4, 'Carefully add the limestone water to the hot palm oil (it will bubble vigorously), stirring constantly'),
(8, 5, 'The mixture will turn bright yellow - this is your achu soup base'),
(8, 6, 'Add ground crayfish, achu soup spice mix, and remaining water, stir well'),
(8, 7, 'Add the cooked meat, tripe, and smoked fish to the yellow soup'),
(8, 8, 'Season with Maggi cubes and salt to taste'),
(8, 9, 'Add chopped basil leaves and simmer for 10 minutes'),
(8, 10, 'For the cocoyam: Boil cocoyam until very soft, peel while hot, and pound in a mortar until smooth and stretchy'),
(8, 11, 'Form the pounded cocoyam into balls and serve with the hot achu soup'),
(8, 12, 'Cultural note: Achu is a royal dish from the Northwest region, particularly among the Ngemba people. It is traditionally served at important ceremonies and to honor special guests. The yellow color symbolizes wealth and prosperity')
ON CONFLICT DO NOTHING;

-- Recipe 9: Jollof Rice
INSERT INTO ingredients (recipe_id, name, quantity, unit) VALUES
(9, 'Long grain rice', '4', 'cups'),
(9, 'Tomato paste', '1', 'can (6 oz)'),
(9, 'Fresh tomatoes', '6', 'large, blended'),
(9, 'Red bell peppers', '3', 'large, blended'),
(9, 'Onions', '2', 'large, chopped'),
(9, 'Scotch bonnet peppers', '2', 'pieces, blended'),
(9, 'Chicken or beef', '2', 'lbs, cut into pieces'),
(9, 'Vegetable oil', '1/2', 'cup'),
(9, 'Chicken stock', '5', 'cups'),
(9, 'Garlic', '4', 'cloves, minced'),
(9, 'Ginger', '1', 'tablespoon, grated'),
(9, 'Thyme', '1', 'teaspoon'),
(9, 'Curry powder', '1', 'tablespoon'),
(9, 'Bay leaves', '3', 'pieces'),
(9, 'Maggi cubes', '4', 'cubes'),
(9, 'Salt', '2', 'teaspoons')
ON CONFLICT DO NOTHING;

INSERT INTO instructions (recipe_id, step_number, description) VALUES
(9, 1, 'Season meat with salt, Maggi cubes, garlic, ginger, and half of the chopped onions. Boil until tender'),
(9, 2, 'In a blender, combine fresh tomatoes, red bell peppers, scotch bonnet peppers, and blend until smooth'),
(9, 3, 'Heat oil in a large pot, add remaining onions and sauté until soft'),
(9, 4, 'Add tomato paste and fry for 3-4 minutes, stirring constantly to prevent burning'),
(9, 5, 'Add the blended tomato and pepper mixture to the pot'),
(9, 6, 'Fry the mixture on medium heat for 20-25 minutes until the oil floats to the top and the raw tomato taste is gone'),
(9, 7, 'Add curry powder, thyme, and bay leaves, stir well'),
(9, 8, 'Add the chicken stock and bring to a boil'),
(9, 9, 'Taste and adjust seasoning with salt and Maggi cubes'),
(9, 10, 'Add the cooked meat and wash the rice, then add rice to the pot'),
(9, 11, 'Stir gently to ensure rice is covered with sauce, then cover pot tightly with foil and lid'),
(9, 12, 'Cook on medium-low heat for 30-40 minutes until rice is tender and has absorbed all liquid'),
(9, 13, 'Reduce heat to low and let steam for 10 more minutes'),
(9, 14, 'Fluff with a fork and serve hot with fried plantains or coleslaw'),
(9, 15, 'Cultural note: While Jollof rice is enjoyed across West Africa, the Cameroonian version is known for its rich, smoky flavor and is a must-have at parties, weddings, and celebrations')
ON CONFLICT DO NOTHING;

-- Recipe 10: Fufu and Eru
INSERT INTO ingredients (recipe_id, name, quantity, unit) VALUES
(10, 'Cassava (for fufu)', '4', 'lbs'),
(10, 'Eru leaves', '1', 'lb, shredded'),
(10, 'Waterleaf', '1', 'lb'),
(10, 'Palm oil', '1/2', 'cup'),
(10, 'Smoked fish', '3', 'pieces'),
(10, 'Crayfish', '1/2', 'cup, ground'),
(10, 'Maggi cubes', '2', 'cubes'),
(10, 'Salt', '1', 'teaspoon')
ON CONFLICT DO NOTHING;

INSERT INTO instructions (recipe_id, step_number, description) VALUES
(10, 1, 'Peel cassava and cut into chunks, boil until very soft (about 30 minutes)'),
(10, 2, 'Drain cassava and pound in a mortar or use a food processor until smooth, stretchy, and sticky'),
(10, 3, 'Knead the pounded cassava with wet hands until elastic, form into balls'),
(10, 4, 'Clean and finely shred the eru leaves (they should be hair-thin strips)'),
(10, 5, 'Wash and chop the waterleaf, set aside'),
(10, 6, 'In a pot, boil the waterleaf over medium heat'),
(10, 7, 'Add shredded eru leaves to the hot palm oil and stir for 5 minutes'),
(10, 8, 'Add ground crayfish, pepper, Maggi cubes, and salt, stir well'),
(10, 9, 'Add the smoked fish and soaked stockfish, boiled beef of desired quantity breaking them into smaller pieces'),
(10, 10, 'Add palm oil gradually while stirring to prevent the eru from clumping'),
(10, 11, 'Cover and simmer on low heat for 15-20 minutes, stirring occasionally'),
(10, 12, 'The dish is ready when the vegetables are soft and the sauce is thick'),
(10, 13, 'Serve fufu balls with eru soup on the side'),
(10, 14, 'Cultural note: Fufu is typically eaten by pinching off a small portion, making an indentation with the thumb, and using it to scoop up the soup. It is considered disrespectful to chew fufu - it should be swallowed')
ON CONFLICT DO NOTHING;

-- Recipe 11: Egusi Soup
INSERT INTO ingredients (recipe_id, name, quantity, unit) VALUES
(11, 'Egusi (melon seeds)', '2', 'cups, ground'),
(11, 'Palm oil', '1/2', 'cup'),
(11, 'Beef', '1', 'lb, cubed'),
(11, 'Dried fish', '2', 'pieces'),
(11, 'Crayfish', '1/4', 'cup, ground'),
(11, 'Pumpkin leaves (ugu)', '4', 'cups, chopped'),
(11, 'Onion', '1', 'large, chopped'),
(11, 'Fresh pepper', '2', 'tablespoons, blended'),
(11, 'Maggi cubes', '3', 'cubes'),
(11, 'Salt', '2', 'teaspoons'),
(11, 'Water', '4', 'cups')
ON CONFLICT DO NOTHING;

INSERT INTO instructions (recipe_id, step_number, description) VALUES
(11, 1, 'Season and boil beef until tender with onions and Maggi cubes'),
(11, 2, 'In a separate bowl, mix ground egusi with a little water to form a paste'),
(11, 3, 'Heat palm oil in a large pot and fry the egusi paste for 5 minutes, stirring constantly'),
(11, 4, 'Add the meat stock gradually while stirring to prevent lumps'),
(11, 5, 'Add boiled meat, dried fish, ground crayfish, and pepper'),
(11, 6, 'Add more water to reach desired consistency and bring to a boil'),
(11, 7, 'Simmer for 15 minutes, then add chopped pumpkin leaves'),
(11, 8, 'Cook for 5 more minutes until vegetables are tender'),
(11, 9, 'Adjust seasoning with salt and Maggi cubes'),
(11, 10, 'Serve hot with fufu, garri, or pounded yam'),
(11, 11, 'Cultural note: Egusi soup is popular throughout Cameroon and is often served at gatherings. The melon seeds provide protein and a unique nutty flavor')
ON CONFLICT DO NOTHING;

-- DINNER RECIPES - Ingredients & Instructions

-- Recipe 12: Pepper Soup
INSERT INTO ingredients (recipe_id, name, quantity, unit) VALUES
(12, 'Catfish or tilapia', '2', 'lbs, cut into chunks'),
(12, 'Pepper soup spice mix', '3', 'tablespoons'),
(12, 'Fresh pepper', '3', 'pieces, chopped'),
(12, 'Onions', '1', 'large, sliced'),
(12, 'Garlic', '4', 'cloves, minced'),
(12, 'Ginger', '2', 'tablespoons, grated'),
(12, 'Scent leaves (basil)', '1', 'cup, chopped'),
(12, 'Maggi cubes', '3', 'cubes'),
(12, 'Salt', '1', 'teaspoon'),
(12, 'Water', '6', 'cups')
ON CONFLICT DO NOTHING;

INSERT INTO instructions (recipe_id, step_number, description) VALUES
(12, 1, 'Clean fish thoroughly and set aside'),
(12, 2, 'In a pot, add water, onions, garlic, ginger, pepper, and pepper soup spice'),
(12, 3, 'Bring to a boil and simmer for 10 minutes to infuse flavors'),
(12, 4, 'Add Maggi cubes and salt, stir well'),
(12, 5, 'Add fish pieces carefully to avoid breaking them'),
(12, 6, 'Simmer for 10-15 minutes until fish is cooked through'),
(12, 7, 'Add chopped scent leaves and turn off heat'),
(12, 8, 'Let it sit covered for 5 minutes to allow flavors to meld'),
(12, 9, 'Serve hot in bowls, optionally with boiled plantains or yam on the side'),
(12, 10, 'Cultural note: Pepper soup is believed to have medicinal properties and is often given to nursing mothers. It is also a popular evening meal, especially during the rainy season')
ON CONFLICT DO NOTHING;

-- Recipe 13: Mbanga Soup (Palm Nut Soup)
INSERT INTO ingredients (recipe_id, name, quantity, unit) VALUES
(13, 'Palm nuts (banga)', '4', 'lbs, or 2 cups palm nut cream'),
(13, 'Smoked fish', '3', 'pieces'),
(13, 'Stockfish', '2', 'pieces, soaked'),
(13, 'Crayfish', '1/2', 'cup, ground'),
(13, 'Bitter leaf', '2', 'cups, washed and chopped'),
(13, 'Fresh pepper', '2', 'tablespoons, blended'),
(13, 'Onion', '1', 'large, chopped'),
(13, 'Maggi cubes', '3', 'cubes'),
(13, 'Salt', '2', 'teaspoons'),
(13, 'Water', '4', 'cups')
ON CONFLICT DO NOTHING;

INSERT INTO instructions (recipe_id, step_number, description) VALUES
(13, 1, 'If using fresh palm nuts: Boil palm nuts until soft, pound or blend, then extract the cream by adding water and straining'),
(13, 2, 'Pour palm nut cream into a pot and bring to a boil'),
(13, 3, 'Add onions, ground crayfish, and pepper, stir well'),
(13, 4, 'Add smoked fish and soaked stockfish to the pot'),
(13, 5, 'Season with Maggi cubes and salt'),
(13, 6, 'Simmer for 20 minutes, stirring occasionally to prevent sticking'),
(13, 7, 'Add bitter leaves and cook for 10 more minutes'),
(13, 8, 'The soup should be thick and oily on top'),
(13, 9, 'Serve hot with fufu, rice, or boiled plantains'),
(13, 10, 'Cultural note: Mbanga soup is a Littoral and Southwest specialty, particularly among the Sawa people. The palm nut gives it a distinctive red-orange color and rich flavor')
ON CONFLICT DO NOTHING;

-- Recipe 14: Okra Soup
INSERT INTO ingredients (recipe_id, name, quantity, unit) VALUES
(14, 'Fresh okra', '2', 'lbs, chopped or blended'),
(14, 'Beef', '1', 'lb, cut into chunks'),
(14, 'Smoked fish', '2', 'pieces'),
(14, 'Crayfish', '1/3', 'cup, ground'),
(14, 'Palm oil', '1/4', 'cup'),
(14, 'Onion', '1', 'medium, chopped'),
(14, 'Fresh pepper', '2', 'tablespoons'),
(14, 'Maggi cubes', '3', 'cubes'),
(14, 'Salt', '1', 'teaspoon'),
(14, 'Water', '4', 'cups')
ON CONFLICT DO NOTHING;

INSERT INTO instructions (recipe_id, step_number, description) VALUES
(14, 1, 'Season and boil beef until tender'),
(14, 2, 'In a pot, heat palm oil and sauté onions until soft'),
(14, 3, 'Add the boiled beef with some stock, smoked fish, ground crayfish, and pepper'),
(14, 4, 'Add water and bring to a boil'),
(14, 5, 'Add the chopped or blended okra and stir well'),
(14, 6, 'Season with Maggi cubes and salt'),
(14, 7, 'Simmer on low heat for 15 minutes, stirring occasionally'),
(14, 8, 'The soup will become slimy and thick - this is the desired texture'),
(14, 9, 'Serve hot with garri, fufu, or boiled yam'),
(14, 10, 'Cultural note: Okra soup is popular across Cameroon and is valued for its health benefits. The slimy texture aids digestion')
ON CONFLICT DO NOTHING;

-- DESSERT RECIPES - Ingredients & Instructions

-- Recipe 15: Banana Fritters
INSERT INTO ingredients (recipe_id, name, quantity, unit) VALUES
(15, 'Ripe bananas', '4', 'large'),
(15, 'All-purpose flour', '1', 'cup'),
(15, 'Sugar', '1/4', 'cup'),
(15, 'Egg', '1', 'large'),
(15, 'Vanilla extract', '1', 'teaspoon'),
(15, 'Cinnamon', '1/2', 'teaspoon'),
(15, 'Salt', '1/4', 'teaspoon'),
(15, 'Vegetable oil', '3', 'cups (for frying)'),
(15, 'Powdered sugar', '2', 'tablespoons (for dusting)')
ON CONFLICT DO NOTHING;

INSERT INTO instructions (recipe_id, step_number, description) VALUES
(15, 1, 'Mash the ripe bananas in a bowl until smooth'),
(15, 2, 'Add egg, sugar, vanilla extract, cinnamon, and salt to the mashed bananas, mix well'),
(15, 3, 'Gradually fold in the flour until you have a thick batter'),
(15, 4, 'Heat oil in a deep pan over medium-high heat'),
(15, 5, 'Drop spoonfuls of batter into the hot oil'),
(15, 6, 'Fry until golden brown on both sides (about 2-3 minutes per side)'),
(15, 7, 'Remove and drain on paper towels'),
(15, 8, 'While still warm, dust with powdered sugar'),
(15, 9, 'Serve warm as a dessert or afternoon snack'),
(15, 10, 'Cultural note: Banana fritters are a beloved sweet treat often sold by street vendors and enjoyed with tea or coffee')
ON CONFLICT DO NOTHING;

-- Recipe 16: Coconut Drops
INSERT INTO ingredients (recipe_id, name, quantity, unit) VALUES
(16, 'Fresh coconut', '2', 'medium, grated'),
(16, 'Brown sugar', '2', 'cups'),
(16, 'Water', '1', 'cup'),
(16, 'Ginger', '1', 'teaspoon, grated'),
(16, 'Vanilla extract', '1', 'teaspoon')
ON CONFLICT DO NOTHING;

INSERT INTO instructions (recipe_id, step_number, description) VALUES
(16, 1, 'Grate fresh coconut into small pieces'),
(16, 2, 'In a heavy-bottomed pot, combine sugar and water'),
(16, 3, 'Heat over medium heat, stirring until sugar dissolves'),
(16, 4, 'Add grated ginger and bring to a boil'),
(16, 5, 'Add grated coconut to the syrup and stir constantly'),
(16, 6, 'Cook on medium heat, stirring frequently until the mixture caramelizes and becomes sticky (about 20-25 minutes)'),
(16, 7, 'Add vanilla extract and stir'),
(16, 8, 'Drop spoonfuls of the mixture onto a greased tray or parchment paper'),
(16, 9, 'Let cool and harden completely (about 30 minutes)'),
(16, 10, 'Store in an airtight container'),
(16, 11, 'Cultural note: Coconut drops are a traditional candy often made during holidays and celebrations, particularly popular with children')
ON CONFLICT DO NOTHING;

-- Recipe 17: Chin Chin
INSERT INTO ingredients (recipe_id, name, quantity, unit) VALUES
(17, 'All-purpose flour', '4', 'cups'),
(17, 'Sugar', '1/2', 'cup'),
(17, 'Butter', '1/2', 'cup, softened'),
(17, 'Eggs', '2', 'large'),
(17, 'Milk', '1/4', 'cup'),
(17, 'Baking powder', '1', 'teaspoon'),
(17, 'Nutmeg', '1/2', 'teaspoon'),
(17, 'Salt', '1/4', 'teaspoon'),
(17, 'Vegetable oil', '4', 'cups (for frying)')
ON CONFLICT DO NOTHING;

INSERT INTO instructions (recipe_id, step_number, description) VALUES
(17, 1, 'In a large bowl, mix flour, sugar, baking powder, nutmeg, and salt'),
(17, 2, 'Add softened butter and rub into the flour until it resembles breadcrumbs'),
(17, 3, 'Beat eggs and milk together, then add to the flour mixture'),
(17, 4, 'Knead to form a firm but smooth dough (add more flour if too sticky)'),
(17, 5, 'Roll out dough on a floured surface to about 1/4 inch thickness'),
(17, 6, 'Cut into small squares or desired shapes'),
(17, 7, 'Heat oil in a deep pot over medium heat'),
(17, 8, 'Fry chin chin in batches until golden brown (about 3-4 minutes)'),
(17, 9, 'Remove and drain on paper towels'),
(17, 10, 'Let cool completely before storing in an airtight container'),
(17, 11, 'Cultural note: Chin chin is a crunchy snack served at parties, weddings, and festive occasions. It pairs perfectly with soft drinks or tea and can last for weeks when properly stored')
ON CONFLICT DO NOTHING;

-- SNACK RECIPES - Ingredients & Instructions

-- Recipe 18: Soya (Suya)
INSERT INTO ingredients (recipe_id, name, quantity, unit) VALUES
(18, 'Beef (sirloin or flank)', '2', 'lbs, thinly sliced'),
(18, 'Groundnut (peanut) powder', '1', 'cup'),
(18, 'Ginger powder', '2', 'tablespoons'),
(18, 'Garlic powder', '2', 'tablespoons'),
(18, 'Cayenne pepper', '2', 'tablespoons'),
(18, 'Paprika', '1', 'tablespoon'),
(18, 'Onion powder', '1', 'tablespoon'),
(18, 'Maggi cubes', '2', 'cubes, crushed'),
(18, 'Salt', '1', 'teaspoon'),
(18, 'Vegetable oil', '2', 'tablespoons'),
(18, 'Fresh onions', '2', 'large, sliced (for serving)'),
(18, 'Fresh tomatoes', '3', 'medium, sliced (for serving)')
ON CONFLICT DO NOTHING;

INSERT INTO instructions (recipe_id, step_number, description) VALUES
(18, 1, 'Slice beef into thin strips against the grain'),
(18, 2, 'In a bowl, mix groundnut powder, ginger, garlic, cayenne pepper, paprika, onion powder, crushed Maggi, and salt to make suya spice'),
(18, 3, 'Rub the beef strips with oil, then coat generously with the suya spice mixture'),
(18, 4, 'Thread the beef onto skewers'),
(18, 5, 'Let marinate for at least 30 minutes (longer for more flavor)'),
(18, 6, 'Prepare a charcoal grill or use a grill pan on high heat'),
(18, 7, 'Grill the beef skewers for 3-4 minutes on each side, basting with oil as needed'),
(18, 8, 'The meat should be charred on the outside but juicy inside'),
(18, 9, 'Remove from skewers and place on a serving plate'),
(18, 10, 'Sprinkle with more suya spice if desired'),
(18, 11, 'Serve hot with sliced onions, tomatoes, and fresh pepper'),
(18, 12, 'Cultural note: Soya (Suya) is the king of Cameroonian street food, particularly popular in the evening. It originated from Northern Cameroon and has spread throughout the country. Suya spots called "makolo" are social gathering places')
ON CONFLICT DO NOTHING;

-- Recipe 19: Beignets (Another Puff Puff variant)
-- Using same ingredients and instructions as Recipe 1
INSERT INTO ingredients (recipe_id, name, quantity, unit) VALUES
(19, 'All-purpose flour', '3', 'cups'),
(19, 'Sugar', '1/2', 'cup'),
(19, 'Active dry yeast', '2', 'teaspoons'),
(19, 'Warm water', '1.5', 'cups'),
(19, 'Salt', '1/4', 'teaspoon'),
(19, 'Vanilla extract', '1', 'teaspoon'),
(19, 'Vegetable oil', '4', 'cups (for frying)')
ON CONFLICT DO NOTHING;

INSERT INTO instructions (recipe_id, step_number, description) VALUES
(19, 1, 'Mix flour, sugar, yeast, and salt in a bowl'),
(19, 2, 'Add warm water and vanilla, stir until smooth batter forms'),
(19, 3, 'Cover and let rise for 45-60 minutes'),
(19, 4, 'Heat oil to 350°F (175°C)'),
(19, 5, 'Drop spoonfuls of batter into hot oil'),
(19, 6, 'Fry until golden brown, turning occasionally'),
(19, 7, 'Drain on paper towels and serve warm'),
(19, 8, 'Cultural note: Beignets are sold by street vendors throughout Cameroon, especially popular as an afternoon snack with a cold drink')
ON CONFLICT DO NOTHING;

-- Recipe 20: Roasted Corn and Pears
INSERT INTO ingredients (recipe_id, name, quantity, unit) VALUES
(20, 'Fresh corn', '6', 'ears, with husks'),
(20, 'African pear (safou)', '6', 'pieces'),
(20, 'Salt', '1', 'teaspoon (optional)')
ON CONFLICT DO NOTHING;

INSERT INTO instructions (recipe_id, step_number, description) VALUES
(20, 1, 'Prepare a charcoal grill or open fire'),
(20, 2, 'Place whole corn ears (with husks) directly on the grill'),
(20, 3, 'Roast corn, turning frequently until husks are charred and kernels are tender (about 15-20 minutes)'),
(20, 4, 'While corn is roasting, place African pears near the heat (not directly on flames) to warm them'),
(20, 5, 'Turn pears occasionally until the skin is slightly charred and the flesh is soft (about 10 minutes)'),
(20, 6, 'Remove corn from grill and peel back husks'),
(20, 7, 'Optionally sprinkle corn with salt'),
(20, 8, 'Peel the softened pear skin and serve alongside the roasted corn'),
(20, 9, 'Eat by alternating bites of corn and pear - the buttery pear complements the sweet corn perfectly'),
(20, 10, 'Cultural note: This combination is a beloved street food during safou season (July-September). The African pear has a buttery texture and is rich in healthy fats. This snack is enjoyed by people of all ages, especially in the evenings')
ON CONFLICT DO NOTHING;

-- Recipe 21: Plantain Chips
INSERT INTO ingredients (recipe_id, name, quantity, unit) VALUES
(21, 'Green plantains', '4', 'large'),
(21, 'Vegetable oil', '4', 'cups (for frying)'),
(21, 'Salt', '2', 'teaspoons'),
(21, 'Cayenne pepper', '1', 'teaspoon (optional)')
ON CONFLICT DO NOTHING;

INSERT INTO instructions (recipe_id, step_number, description) VALUES
(21, 1, 'Peel green plantains (tip: cut off ends and make lengthwise slits to remove peel easily)'),
(21, 2, 'Using a mandoline or sharp knife, slice plantains very thinly (about 1/8 inch thick)'),
(21, 3, 'Soak plantain slices in salted cold water for 15 minutes to remove excess starch'),
(21, 4, 'Drain and pat dry thoroughly with paper towels (moisture will cause splattering)'),
(21, 5, 'Heat oil in a deep pot to 350°F (175°C)'),
(21, 6, 'Fry plantain slices in small batches until golden and crispy (about 3-4 minutes)'),
(21, 7, 'Remove with a slotted spoon and drain on paper towels'),
(21, 8, 'While still hot, season with salt and cayenne pepper if desired'),
(21, 9, 'Let cool completely - chips will become crispier as they cool'),
(21, 10, 'Store in an airtight container for up to 2 weeks'),
(21, 11, 'Cultural note: Plantain chips are a popular snack sold in markets and shops across Cameroon. They are often enjoyed while watching football matches or as a quick snack with drinks')
ON CONFLICT DO NOTHING;

-- Recipe 22: Kilishi
INSERT INTO ingredients (recipe_id, name, quantity, unit) VALUES
(22, 'Lean beef', '2', 'lbs'),
(22, 'Groundnut (peanut) powder', '1/2', 'cup'),
(22, 'Ginger powder', '2', 'tablespoons'),
(22, 'Garlic powder', '2', 'tablespoons'),
(22, 'Cayenne pepper', '2', 'tablespoons'),
(22, 'Onion powder', '1', 'tablespoon'),
(22, 'Maggi cubes', '2', 'cubes, crushed'),
(22, 'Salt', '1', 'tablespoon'),
(22, 'Vegetable oil', '1/4', 'cup')
ON CONFLICT DO NOTHING;

INSERT INTO instructions (recipe_id, step_number, description) VALUES
(22, 1, 'Slice beef into very thin sheets (about 1/4 inch thick) - partially freezing the meat makes this easier'),
(22, 2, 'Using a meat mallet, pound each slice until paper-thin'),
(22, 3, 'Mix groundnut powder, ginger, garlic, cayenne pepper, onion powder, crushed Maggi, and salt'),
(22, 4, 'Rub each meat slice with oil, then coat thoroughly with the spice mixture'),
(22, 5, 'Lay meat slices on drying racks or hang on a line in direct sunlight for 4-6 hours until partially dried'),
(22, 6, 'Prepare a low charcoal fire or preheat oven to 200°F (95°C)'),
(22, 7, 'Grill or bake the dried meat slowly until completely dehydrated and crispy (about 2-3 hours), turning occasionally'),
(22, 8, 'The meat should be dry, dark, and crispy but not burnt'),
(22, 9, 'Let cool completely before storing in an airtight container'),
(22, 10, 'Can be stored for several weeks at room temperature'),
(22, 11, 'Cultural note: Kilishi is a traditional delicacy from Northern Cameroon, particularly among the Fulani people. It is often taken as a travel snack or gift due to its long shelf life. The drying and smoking process preserves the meat without refrigeration')
ON CONFLICT DO NOTHING;
