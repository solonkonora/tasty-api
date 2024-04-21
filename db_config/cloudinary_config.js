import 'dotenv/config';
import { v2 as cloudinary } from 'cloudinary';

// Configure the Cloudinary credentials
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Function to create a folder in Cloudinary
export async function createCloudinaryFolder(folderName) {
    try {
        const response = await cloudinary.api.create_folder(folderName);
        console.log(`Folder '${folderName}' created in Cloudinary.`);
        return response;
    } catch (error) {
        console.error(`Error creating folder '${folderName}' in Cloudinary:`, error);
        throw error;
    }
}

// Example usage: create separate folders for different types of images
export async function setupImageFolders() {
    await createCloudinaryFolder('food-images');
    // await createCloudinaryFolder('user-avatars');
    // await createCloudinaryFolder('other_images');
}

// Function to upload an image to a Cloudinary folder
export async function uploadImageToFolder(imagePath, folderName) {
    try {
        const uploadResponse = await cloudinary.uploader.upload(imagePath, {
            folder: folderName
        });
        console.log(`Image uploaded to Cloudinary folder '${folderName}': ${uploadResponse.secure_url}`);
        return uploadResponse;
    } catch (error) {
        console.error(`Error uploading image to Cloudinary folder '${folderName}':`, error);
        throw error;
    }
}