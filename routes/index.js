import express from 'express';
const router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {  // serves as home page for the app
  res.send({message: 'hello how  are you'})
});

export default router;
