
const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');

const app = require('../src/app');

test('returns JSON 404 for an unknown API route', async () => {
  const response = await request(app)
    .get('/api/this-route-does-not-exist');

  assert.equal(response.status, 404);
  assert.deepEqual(response.body, {
    error: 'Route not found.',
  });
});
