
const test = require('node:test');
const assert = require('node:assert/strict');

const pool = require('../src/config/database');

test('connects to MySQL and executes SELECT 1', async () => {
  const [rows] = await pool.query('SELECT 1 AS result');

  assert.equal(rows[0].result, 1);
});

test('can read the current database name', async () => {
  const [rows] = await pool.query('SELECT DATABASE() AS db');

  assert.equal(
    rows[0].db,
    process.env.DB_NAME
  );
});

const { after } = require('node:test');

after(async () => {
  await pool.end();
});