import createError from 'http-errors';
import express, { json, urlencoded} from 'express';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import cors from 'cors';

import YAML from 'yamljs';
import swaggerUi from 'swagger-ui-express';

import recipeRouter from './routes/recipes.js';
import categoriesRouter from './routes/catergories.js';
import ingredientsRouter from './routes/ingredients.js';
import instructionsRouter from './routes/instructions.js';
import authRouter from './routes/auth.js';
import favoritesRouter from './routes/favorites.js';
import indexRoute from "./routes/index.js";
import passport from './config/passport.js';


const app = express();

const swaggerDocument = YAML.load('./documentary/swagger-specs.yaml');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Enable CORS for all routes
app.use(cors({
  origin: 'http://localhost:5173', // Vite default port
  credentials: true // Allow cookies
}));

app.use(logger('dev'));   //to loggin request in dev mode
app.use(json());
app.use(express.urlencoded({ extended: true }));  //parse incoming json and url-encoded requst bodies
app.use(cookieParser());

// Initialize Passport
app.use(passport.initialize());


app.use("/", indexRoute)
app.use('/api/auth', authRouter);
app.use('/api/favorites', favoritesRouter);
app.use('/api/recipes', recipeRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/ingredients', ingredientsRouter);
app.use('/api/instructions', instructionsRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});


// error handler
app.use(function(err, req, res, next) {
  // Set the response status to the error status or default to 500
  res.status(err.status || 500);
  
   // Log the error
   console.error(err);

  // Send a JSON response with the error message
  res.send({ message: err.message });
});

export default app;
