const { Pool } = require('pg');

const pool = new Pool({
  user: 'your_username',
  host: '127.0.0.1',
  database: 'movie_rental_db',
  password: 'your_password',
  port: 5432,
});

async function testConnection() {
  try {
    const res = await pool.query('SELECT NOW()');
    console.log('Connection successful:', res.rows[0]);
  } catch (err) {
    console.error('Connection failed:', err);
  } finally {
    pool.end();
  }
}

testConnection();
