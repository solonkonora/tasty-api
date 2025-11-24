import express from 'express';
import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

const { Pool } = pkg;

// Log which connection method is being used
console.log('Database connection mode:', process.env.DATABASE_URL ? 'DATABASE_URL' : 'Individual variables');
if (process.env.DATABASE_URL) {
  // Log masked connection string (hide password)
  const masked = process.env.DATABASE_URL.replace(/:([^:@]+)@/, ':****@');
  console.log('Connection string:', masked);
}

// Use DATABASE_URL if available (production), otherwise use individual variables (development)
const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }, // Always require SSL for Render
      max: 20, // maximum pool size
      idleTimeoutMillis: 30000, // close idle clients after 30 seconds
      connectionTimeoutMillis: 10000, // timeout for new client connection
    })
  : new Pool({
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 5432,
      ssl: { rejectUnauthorized: false }, // Always use SSL in production
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });

//handle connection error
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  // Don't exit, just log the error
});

// Test connection on startup
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Database connection failed:', err.message);
    console.error('Error details:', {
      code: err.code,
      host: process.env.DB_HOST || 'from DATABASE_URL',
      database: process.env.DB_DATABASE || 'from DATABASE_URL'
    });
  } else {
    console.log('✅ Database connected successfully at', res.rows[0].now);
  }
});


export default pool;