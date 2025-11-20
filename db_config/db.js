import express from 'express';
import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

const { Pool } = pkg;

// Use DATABASE_URL if available (production), otherwise use individual variables (development)
const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    })
  : new Pool({
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      host: process.env.DB_HOST,
      dialect: 'postgres',
    });

//handle connection error
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});


export default pool;