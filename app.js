import createError from 'http-errors';
import express, { json, urlencoded} from 'express';
import cookieParser from 'cookie-parser';
import logger from 'morgan';


import indexRouter from './routes/index.js';
import usersRouter from './routes/users.js';
import recipeRouter from './routes/recipes.js';
import categoriesRouter from './routes/catergories.js';
import ingredientsRouter from './routes/ingredients.js';
// import instructionRouter from './routes/instruction.js';


const app = express();

app.use(logger('dev'));   //to loggin request in dev mode
app.use(json());
app.use(express.urlencoded({ extended: true }));  //parse incoming json and url-encoded requst bodies
app.use(cookieParser());


app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/recipes', recipeRouter);
app.use('/categories', categoriesRouter);
app.use('/ingredients', ingredientsRouter);
// app.use('/instruction', instructionRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});


// error handler
app.use(function(err, req, res, next) {
  // Set the response status to the error status or default to 500
  res.status(err.status || 500);
  
  // Send a JSON response with the error message
  res.send({ message: err.message });
});

export default app;
