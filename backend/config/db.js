// config/db.js
import pg from 'pg';
const { Pool } = pg;
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  ssl: {
    rejectUnauthorized: false, // or use CA certificate if you have it
  },
  max: 15,                      // Maximum clients in the pool (leave some room)
  idleTimeoutMillis: 50000,      // Close idle clients after 30 seconds
  connectionTimeoutMillis: 10000, // Fail if a connection is not established within 5 seconds
});

pool.on('error', (err) => {
  console.error('Unexpected database pool error:', err);
});

export default pool;