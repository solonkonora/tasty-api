import express from 'express';
const router = express.Router();


// Import the recipe-related and user-related routes
import recipesRouter from './recipes.js';
import usersRouter from './users.js';
import categoriesRouter from './catergories.js';
import ingredientRouter from './ingredients.js';


// Mount the recipe-related and user-related routes
router.use('/recipes', recipesRouter);
router.use('/users', usersRouter);
router.use('/categories', categoriesRouter);
router.use('/ingredient', ingredientRouter);
//router.use('/instruction', instructionRouter);


/* GET home page. */
router.get('/', function(req, res, next) {  // serves as home page for the app
  res.render('index', { title: 'Express' });
});

export default router;
