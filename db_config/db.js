import express from 'express';
import dotenv from 'dotenv';
import pkg from 'pg';

dotenv.config();

const app = express();
const port = 3000;

const { Pool } = pkg;
const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  host: process.env.DB_HOST,
  dialect: 'postgres',
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

app.get('/', async (req, res) => {
  try {
    // Test the database connection
    await pool.query('SELECT 1');
    res.send('Database connection successful!');
  } catch (err) {
    console.error('Error connecting to the database:', err);
    res.status(500).send('Error connecting to the database: ' + err.message);
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

export default pool;