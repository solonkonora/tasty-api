# Food Recipe API

This is a backend API for a food recipe application. It provides endpoints for managing recipes and ingredients, and it uses a PostgreSQL database for data storage.
## Requirements

    Node.js (v12 or above)
    PostgreSQL database

## Installation

    Clone the repository:
    bash

git clone https://github.com/solonkonora/tasty-api.git
cd tasty-api

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