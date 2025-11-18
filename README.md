# Food Recipe API

This is a backend API for a food recipe application. It provides endpoints for managing recipes and ingredients, and it uses a PostgreSQL database for data storage.

## Features
- 🍳 Recipe management (CRUD operations)
- 👤 User authentication (email/password + Google OAuth)
- ❤️ Favorites system
- 📝 Ingredients and step-by-step instructions
- 🔐 JWT-based authentication with httpOnly cookies
- 🌐 Google Sign-In integration

## Requirements
- Node.js (v18 or above)
- PostgreSQL database
- Google OAuth credentials (for Google Sign-In)

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

## Google OAuth Setup (Optional)

To enable Google Sign-In functionality:

1. **Quick Setup**: See `QUICK_START_GOOGLE_AUTH.md` for a fast testing guide
2. **Full Setup**: See `GOOGLE_OAUTH_SETUP.md` for complete production-ready setup

**Quick steps:**
- Get OAuth credentials from [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
- Add to your `.env`:
  ```bash
  GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
  GOOGLE_CLIENT_SECRET=your-client-secret
  GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback
  ```
- Run database migration: `PGPASSWORD=api psql -h localhost -U apiuser -d foodie -f db_config/add-google-auth.sql`
- Restart server

Without these credentials, the app will still work with email/password authentication.

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
    Twitter: @SolonkoNora
    whatsapp: +237-652-161-749

## License
This project is licensed under the MIT License.