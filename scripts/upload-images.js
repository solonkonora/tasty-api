import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import { readdir } from 'fs/promises';
import { join } from 'path';

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Upload a single image to Cloudinary
 * @param {string} imagePath - Local path to image
 * @param {string} folder - Cloudinary folder (e.g., 'cameroon-recipes/breakfast')
 * @param {string} publicId - Name for the image (without extension)
 */
async function uploadImage(imagePath, folder, publicId) {
  try {
    const result = await cloudinary.uploader.upload(imagePath, {
      folder: folder,
      public_id: publicId,
      overwrite: true,
      resource_type: 'image'
    });
    
    console.log(`✓ Uploaded: ${publicId}`);
    console.log(`  URL: ${result.secure_url}\n`);
    return result.secure_url;
  } catch (error) {
    console.error(`✗ Failed to upload ${publicId}:`, error.message);
    return null;
  }
}

/**
 * Upload all images from a local directory
 * @param {string} localDir - Local directory containing images
 * @param {string} cloudinaryFolder - Cloudinary folder path
 */
async function uploadDirectory(localDir, cloudinaryFolder) {
  try {
    const files = await readdir(localDir);
    const imageFiles = files.filter(file => 
      /\.(jpg|jpeg|png|gif|webp)$/i.test(file)
    );

    console.log(`\nUploading ${imageFiles.length} images from ${localDir}...`);
    
    for (const file of imageFiles) {
      const imagePath = join(localDir, file);
      const publicId = file.replace(/\.[^/.]+$/, ''); // Remove extension
      await uploadImage(imagePath, cloudinaryFolder, publicId);
    }
    
    console.log('✓ All uploads complete!\n');
  } catch (error) {
    console.error('Error reading directory:', error.message);
  }
}


// Example usage

async function main() {
  console.log('Cameroonian Recipe Images Uploader');

  // Upload images from local folders to Cloudinary
  console.log('Starting upload process...\n');
  
  await uploadDirectory('./images/breakfast', 'cameroon-recipes/breakfast');
  await uploadDirectory('./images/lunch', 'cameroon-recipes/lunch');
  await uploadDirectory('./images/dinner', 'cameroon-recipes/dinner');
  await uploadDirectory('./images/desserts', 'cameroon-recipes/dessert');
  await uploadDirectory('./images/snacks', 'cameroon-recipes/snacks');

  console.log('\n✓ All images uploaded successfully!');
  console.log('\nNext steps:');
  console.log('1. Check the URLs printed above');
  console.log('2. Run: PGPASSWORD=api psql -h localhost -U apiuser -d foodie -f scripts/update-image-urls.sql');
  console.log('3. Or manually update the database with the new URLs\n');
}

main();
