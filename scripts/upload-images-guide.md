# Image Upload Guide for Cameroonian Recipe API

## Using Cloudinary (Recommended)

### Your Cloudinary Credentials (from .env):
- Cloud Name: `drs0ewxd1`
- API Key: `742365139446954`
- Dashboard: https://cloudinary.com/console

### Method 1: Upload via Cloudinary Dashboard
1. Login to https://cloudinary.com/console
2. Go to Media Library
3. Create folders: `cameroon-recipes/breakfast`, `cameroon-recipes/lunch`, etc.
4. Upload images to respective folders
5. Click on each image and copy the URL
6. Update the seed.sql file with real URLs

### Method 2: Upload via API (Programmatic)
Use the POST endpoint in your API:
```bash
curl -X POST http://localhost:3000/api/recipes \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Ndolé",
    "description": "National dish...",
    "image_path": "/path/to/local/image.jpg",
    "category_id": 2,
    "created_at": "2025-11-13T10:00:00Z",
    "updated_at": "2025-11-13T10:00:00Z"
  }'
```
The API will automatically upload to Cloudinary (see routes/recipes.js POST handler).

### Method 3: Bulk Upload Script
Run the Node.js script to upload all images at once:
```bash
node scripts/bulk-upload-images.js
```

## Image Naming Convention:
- Use lowercase, hyphens for spaces
- Format: `{dish-name}.jpg`
- Examples:
  - `puff-puff.jpg`
  - `ndole.jpg`
  - `kati-kati.jpg`
  - `beans-plantains.jpg`

## Where to Find Recipe Images:
1. Take your own photos of the dishes
2. Use royalty-free sources:
   - Unsplash.com (search "African food", "Cameroonian food")
   - Pexels.com
   - Pixabay.com
3. Commission a food photographer
4. Use AI-generated images (Midjourney, DALL-E) with prompts like:
   - "Traditional Cameroonian Ndolé dish with plantains"
   - "Cameroonian Puff Puff on a plate"

## Production URL Format:
Once uploaded to Cloudinary, your URLs will be:
```
https://res.cloudinary.com/drs0ewxd1/image/upload/v1/cameroon-recipes/{category}/{dish-name}.jpg
```

## Updating the Database:
After uploading images, update recipes with real URLs:
```sql
UPDATE recipes 
SET image_path = 'https://res.cloudinary.com/drs0ewxd1/image/upload/v1/cameroon-recipes/breakfast/puff-puff.jpg'
WHERE title = 'Puff Puff';
```

Or use the PUT endpoint:
```bash
curl -X PUT http://localhost:3000/api/recipes/1 \
  -H "Content-Type: application/json" \
  -d '{
    "image_path": "https://res.cloudinary.com/drs0ewxd1/image/upload/v1/cameroon-recipes/breakfast/puff-puff.jpg"
  }'
```
