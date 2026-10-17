require('dotenv').config({ path: '.env.test' });

const initDb = require('../src/config/initDb');

async function setupTestDatabase() {
  await initDb();
}

module.exports = { setupTestDatabase };