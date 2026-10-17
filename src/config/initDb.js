const fs = require('fs');
const path = require('path');
const pool = require('./database');

// Runs database/init.sql on startup. The script uses CREATE TABLE IF NOT EXISTS,
// so it is safe to run every time and never touches existing data.
async function initDb() {
  const file = path.join(__dirname, '..', '..', 'database', 'init.sql');
  const sql = fs.readFileSync(file, 'utf8');
  await pool.query(sql);
}

module.exports = initDb;
