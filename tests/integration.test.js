require('dotenv').config({
  path: '.env.test',
  override: true
});

const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');

const pool = require('../src/config/database');
const initDb = require('../src/config/initDb');
const app = require('../src/app');

test('POST creates a task and GET retrieves it', async (t) => {
  await initDb();

  const title = `Integration test ${Date.now()}`;

  const createResponse = await request(app)
    .post('/api/tasks')
    .send({
      title,
      description: 'Created by integration test',
      status: 'pending'
    });

  assert.ok(
    [200, 201].includes(createResponse.status),
    `Unexpected status: ${createResponse.status}; body: ${JSON.stringify(createResponse.body)}`
  );

  const task = createResponse.body.task ?? createResponse.body;

  assert.ok(task.id, 'API should return the created task ID');

  try {
    const getResponse = await request(app).get(`/api/tasks/${task.id}`);

    assert.equal(getResponse.status, 200);
    assert.equal(getResponse.body.task?.title ?? getResponse.body.title, title);
  } finally {
    await pool.execute('DELETE FROM tasks WHERE id = ?', [task.id]);
  }
});

test.after(async () => {
  await pool.end();
});