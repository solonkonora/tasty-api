import createError from 'http-errors';
import express, { json, urlencoded} from 'express';
import cookieParser from 'cookie-parser';
import logger from 'morgan';

import indexRouter from './routes/index.js';
import usersRouter from './routes/users.js';
import recipeRouter from './routes/recipes.js';

const app = express();


app.use(logger('dev'));   //to loggin request in dev mode
app.use(json());
app.use(express.urlencoded({ extended: true }));  //parse incoming json and url-encoded requst bodies
app.use(cookieParser());

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/recipes', recipeRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

export default app;
