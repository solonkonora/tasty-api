
// const recipes = [
// {
//     name: 'Grilled Chicken Salad',
//     description: 'A delicious and healthy salad with grilled chicken, mixed greens, and a zesty vinaigrette.',
//     imagePath: './images/grilled-chicken-salad.jpg',
//     created_at: new Date(),
//     updated_at: new Date()
// },
//     {
//         name: 'Ndolé',
//         description: 'A traditional Cameroonian dish made with bitter greens, peanut paste, and smoked fish or meat.',
//         imagePath: './images/ndole.jpeg',
//         created_at: new Date(),
//         updated_at: new Date()
//     },
//     {
//         name: 'Poulet DG',
//         description: 'A popular Cameroonian chicken dish cooked in a spicy, peanut-based sauce.',
//         imagePath: './images/poulet.jpg',
//         created_at: new Date(),
//         updated_at: new Date()
//     },
//     {
//         name: 'Eru',
//         description: 'A traditional Cameroonian dish made with a leafy green vegetable, palm oil, and smoked fish.',
//         imagePath: './images/eru.jpeg',
//         created_at: new Date(),
//         updated_at: new Date()
//     },
//     {
//         name: 'Bobolo',
//         description: 'A traditional Cameroonian cassava-based dish that is boiled, fermented, and then grilled or fried.',
//         imagePath: './images/bobolo-fish.jpeg',
//         created_at: new Date(),
//         updated_at: new Date()
//     },
//     {
//         name: 'Koki',
//         description: 'A traditional Cameroonian dish made with black-eyed peas, plantains, and palm oil.',
//         imagePath: './images/koki.jpeg',
//         created_at: new Date(),
//         updated_at: new Date()
//     }
// ];




import { createCloudinaryFolder, setupImageFolders, uploadImageToFolder } from '../db_config/cloudinary_config.js';
import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

// Example recipe data
const recipeData = {
    name: 'Ndolé',
    description: 'A traditional Cameroonian dish made with bitter greens, peanut paste, and smoked fish or meat.',
    imagePath: './images/ndole.jpeg',
    created_at: new Date(),
    updated_at: new Date()
}

async function populateRecipe() {
    try {
        const newRecipe = await createRecipe(
            recipeData.name,
            recipeData.description,
            recipeData.imagePath,
            recipeData.created_at,
            recipeData.updated_at
        );
        console.log('New recipe created:', newRecipe);
    } catch (err) {
        console.error('Error creating recipe:', err);
    }
}

export async function createRecipe(name, description, imagePath, createdAt, updatedAt) {
    // Upload the image to Cloudinary
    const folderName = 'food-images';
    const uploadResponse = await uploadImageToFolder(imagePath, folderName);
    const imageUrl = uploadResponse.secure_url;

    // Create the new recipe with the uploaded image URL
    const newRecipe = {
        name,
        description,
        image_path: imageUrl,
        created_at: createdAt || new Date(),
        updated_at: updatedAt || new Date()
    };

    // Save the new recipe to the database
    try {
        const client = new pg.Client({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_DATABASE
        });

        await client.connect();

        const result = await client.query(
            'INSERT INTO recipe (name, description, image_path, created_at, updated_at) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [newRecipe.name, newRecipe.description, newRecipe.image_path, newRecipe.created_at, newRecipe.updated_at]
        );

        await client.end();
        return result.rows[0];
    } catch (err) {
        console.error('Error saving recipe to the database:', err);
        throw err;
    }
}

populateRecipe();

export async function updateRecipe(id, name, description, imagePath) {
    // Upload the new image to Cloudinary
    const folderName = 'food-images';
    const uploadResponse = await uploadImageToFolder(imagePath, folderName);
    const imageUrl = uploadResponse.secure_url;

    // Update the recipe with the new image URL
    const updatedRecipe = {
        id,
        name,
        description,
        image_path: imageUrl,
        created_at: new Date(),
        updated_at: new Date()
    };

    // Update the recipe in the database
    // ...

    return updatedRecipe;
}