require('dotenv').config();

const app = require('./app');
const pool = require('./config/database');
const initDb = require('./config/initDb');

const PORT = Number(process.env.PORT) || 3000;

async function start() {
  try {
    await pool.query('SELECT 1');
    console.log('Connected to MySQL.');

    await initDb();
    console.log('Database schema is ready.');
  } catch (err) {
    console.error('Database startup failed:', err.message);
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

start();