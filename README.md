# Food Recipe API

This is a backend API for a food recipe application. It provides endpoints for managing recipes and ingredients, and it uses a PostgreSQL database for data storage.

## Features
- 🍳 Recipe management (CRUD operations)
- 👤 User authentication (facebook + Google OAuth)
- ❤️ Favorites system
- 📝 Ingredients and step-by-step instructions
- 🔐 JWT-based authentication with httpOnly cookies
- 🌐 Google Sign-In integration

## Requirements
- Node.js (v18 or above)
- PostgreSQL database
- Google OAuth credentials (for Google Sign-In)
- Cloudinary account (for image uploads)

## Installation

Clone the repository:https://github.com/solonkonora/tasty-api.git

cd tasty-api

## Install the dependencies:

npm install

## Setting up the PostgreSQL database:

Create a new PostgreSQL database:

    Open your PostgreSQL client (e.g., pgAdmin, psql, or any other tool of your choice).
    Create a new database for your application. You can use a command like CREATE DATABASE your_database_name;.

Update the database connection credentials:

    In the root of your project, locate the env.example file.
    Open the env.example file and update the following environment variables with the appropriate values for your PostgreSQL database:

    DB_HOST=your_database_host
    DB_PORT=your_database_port
    DB_NAME=your_database_name
    DB_USER=your_database_username
    DB_PASSWORD=your_database_password

    Save the changes to the env.example file.

## Setting up Cloudinary for Image Uploads

1. Create a Cloudinary account:
   - Go to https://cloudinary.com and sign up for a free account
   - After signing up, you'll be taken to the dashboard

2. Get your Cloudinary credentials:
   - On the dashboard, you'll see your **Cloud Name**, **API Key**, and **API Secret**
   - Copy these values

3. Add Cloudinary credentials to your `.env` file:
   ```
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

4. **For Render deployment**:
   - Go to your Render dashboard
   - Select your backend service
   - Navigate to "Environment" tab
   - Add these environment variables:
     - `CLOUDINARY_CLOUD_NAME` = your cloud name
     - `CLOUDINARY_API_KEY` = your API key
     - `CLOUDINARY_API_SECRET` = your API secret
   - Click "Save Changes" and your service will redeploy

## Setting up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Configure consent screen if prompted
6. Set application type to "Web application"
7. Add authorized redirect URIs:
   - For local: `http://localhost:3000/api/auth/google/callback`
   - For production: `https://your-domain.com/api/auth/google/callback`
8. Copy the Client ID and Client Secret
9. Add to your `.env` file:
   ```
   GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your-client-secret
   GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback
   ```

Rename the env.example file:

    Rename the env.example file to .env. This file will be used to store your environment variables and should not be committed to your version control system.

Install the required dependencies:

    If you haven't already, install the necessary dependencies for your Express.js application, including the PostgreSQL client library (e.g. pg ).

Configure the database connection:

    In your application's main file (app.js ), import the necessary modules and set up the database connection using the environment variables from the .env file.
    Ensure that your application can successfully connect to the PostgreSQL database.

Start the server:

    Terminal: npm run dev

The API server will start running on http://localhost:3000.

## API Documentation using swagger(openAI)

The API documentation is available at /api-docs endpoint. It provides detailed information about the available endpoints, request/response structures, and example usage.

## Endpoints

### Authentication
- `POST /api/auth/signup`: Create a new user account
- `POST /api/auth/login`: Login with email and password
- `POST /api/auth/logout`: Logout current user
- `GET /api/auth/me`: Get current user info
- `GET /api/auth/google`: Initiate Google OAuth flow
- `GET /api/auth/google/callback`: Google OAuth callback (automatic)

### Recipes
- `GET /api/recipes`: Get all recipes
- `GET /api/recipes/:id`: Get a specific recipe by ID
- `POST /api/recipes`: Create a new recipe (authenticated)
- `POST /api/recipes/upload-image`: Upload recipe image to Cloudinary (authenticated)
- `PUT /api/recipes/:id`: Update a recipe (owner only)
- `DELETE /api/recipes/:id`: Delete a recipe (owner only)

### Categories
- `GET /api/categories`: Get all meal categories

### Ingredients & Instructions
- `GET /api/ingredients/:recipeId`: Get ingredients for a recipe
- `GET /api/instructions/:recipeId`: Get step-by-step instructions

### Favorites
- `GET /api/favorites`: Get user's favorite recipes
- `POST /api/favorites`: Add a recipe to favorites
- `DELETE /api/favorites/:recipeId`: Remove from favorites

## Commands to retrieve and see data in db
    localhost:3000/api/recipes; Get all recipes.
    localhost:3000/api/categories; to see the various categories of meals available
    localhost:3000/api/ingredients/recipe-id: Get ingredients for a specific recipe by ID.
    localhost:3000/api/instructions/recipe-id: Get instructions, step by step on how to make a specific recipe by ID.

## Screenshots

Here are some screenshots showcasing the documentation of the Food Recipe API:

![View of the API documented on the Swagger-UI](./images/first.png)
![View of the Schemas](./images/second.png)

## Contributing 
Contributions are welcome! If you find any issues or have suggestions for improvements, please open an issue or submit a pull request

## Social Media Handles

Connect with me on social media for the more:
    GitHub: @solonkonora
    LinkedIn: @nkwadanora
    Twitter: @SolonkoNora
    whatsapp: +237-652-161-749

## License
This project is licensed under the MIT License.