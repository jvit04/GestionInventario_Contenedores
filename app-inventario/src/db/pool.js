const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER || 'user_inventario',
  password: process.env.DB_PASS || 'password_seguro',
  database: process.env.DB_NAME || 'inventario_db',
  connectionTimeoutMillis: 5000
});

module.exports = pool;