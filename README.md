//# tasty-api
# Food Recipe API

This is a backend API for a food recipe application. It provides endpoints for managing recipes and ingredients, and it uses a PostgreSQL database for data storage.
## Requirements

    Node.js (v12 or above)
    PostgreSQL database

## Installation

    Clone the repository:
    bash

git clone https://github.com/your-username/food-recipe-api.git
cd food-recipe-api

## Install the dependencies:

npm install

Set up the PostgreSQL database:

    Create a new PostgreSQL database.
    Update the database connection credentials in the .env file.


Start the server:

    Terminal
    npm run dev

The API server will start running on http://localhost:3000.

## API Documentation

The API documentation is available at /api-docs endpoint. It provides detailed information about the available endpoints, request/response structures, and example usage.
Endpoints
Recipes

    GET /recipes: Get a list of all recipes.
    GET /recipes/:id: Get a specific recipe by ID.
    POST /recipes: Create a new recipe.
    PUT /recipes/:id: Update a recipe by ID.
    DELETE /recipes/:id: Delete a recipe by ID.

Ingredients

    GET /ingredients: Get a list of all ingredients.
    GET /ingredients/:id: Get a specific ingredient by ID.
    POST /ingredients: Create a new ingredient.
    PUT /ingredients/:id: Update an ingredient by ID.
    DELETE /ingredients/:id: Delete an ingredient by ID.

## Screenshots

Here are some screenshots showcasing the functionality of the Food Recipe API:

![Screenshot 1][]Description of screenshot 1.
![Screenshot 2][]Description of screenshot 2.

## Contributing 
Contributions are welcome! If you find any issues or have suggestions for improvements, please open an issue or submit a pull request

## Social Media Handles

Connect with us on social media for the latest updates and announcements:

    Twitter: @your-twitter-handle
    Instagram: @your-instagram-handle
    Facebook: facebook.com/your-facebook-page

## License
This project is licensed under the MIT License.