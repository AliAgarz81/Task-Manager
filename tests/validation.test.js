
const test = require('node:test');
const assert = require('node:assert/strict');

const { STATUSES, validateTask, parseId } = require('../src/utils/validation');

// validateTask tests

test('accepts a valid task', () => {
  const result = validateTask({
    title: 'Learn CI/CD',
    description: 'Build a GitHub Actions workflow',
    status: 'pending',
  });

  assert.deepEqual(result.errors, []);
  assert.deepEqual(result.values, {
    title: 'Learn CI/CD',
    description: 'Build a GitHub Actions workflow',
    status: 'pending',
  });
});

test('trims whitespace from title and description', () => {
  const result = validateTask({
    title: '  My task  ',
    description: '  Task details  ',
  });

  assert.deepEqual(result.errors, []);
  assert.equal(result.values.title, 'My task');
  assert.equal(result.values.description, 'Task details');
});

test('rejects a missing or empty title', () => {
  for (const title of ['', '   ', undefined, 123]) {
    const result = validateTask({ title });

    assert.ok(result.errors.includes('Title is required.'));
  }
});

test('rejects a title longer than 100 characters', () => {
  const result = validateTask({ title: 'a'.repeat(101) });

  assert.ok(
    result.errors.includes('Title must be at most 100 characters.')
  );
});

test('accepts title at the 100-character limit', () => {
  const result = validateTask({ title: 'a'.repeat(100) });

  assert.deepEqual(result.errors, []);
});

test('rejects a description longer than 1000 characters', () => {
  const result = validateTask({
    title: 'Valid title',
    description: 'a'.repeat(1001),
  });

  assert.ok(
    result.errors.includes('Description must be at most 1000 characters.')
  );
});

test('converts an empty description to null', () => {
  const result = validateTask({
    title: 'Valid title',
    description: '   ',
  });

  assert.equal(result.values.description, null);
});

test('defaults missing status to pending', () => {
  const result = validateTask({ title: 'Valid title' });

  assert.equal(result.values.status, 'pending');
  assert.deepEqual(result.errors, []);
});

test('accepts both allowed statuses', () => {
  for (const status of STATUSES) {
    const result = validateTask({ title: 'Valid title', status });

    assert.ok(!result.errors.some((error) => error.startsWith('Status must')));
  }
});

test('rejects an invalid status', () => {
  const result = validateTask({
    title: 'Valid title',
    status: 'in-progress',
  });

  assert.ok(
    result.errors.includes('Status must be "pending" or "completed".')
  );
});

test('reports multiple validation errors together', () => {
  const result = validateTask({
    title: ' ',
    description: 'a'.repeat(1001),
    status: 'invalid',
  });

  assert.equal(result.errors.length, 3);
});

// parseId tests

test('parses a positive integer ID', () => {
  assert.equal(parseId('42'), 42);
  assert.equal(parseId(7), 7);
});

test('rejects zero and negative IDs', () => {
  assert.equal(parseId('0'), null);
  assert.equal(parseId('-5'), null);
});

test('rejects decimals and non-numeric IDs', () => {
  assert.equal(parseId('1.5'), null);
  assert.equal(parseId('abc'), null);
  assert.equal(parseId(''), null);
});

test('rejects null and undefined IDs', () => {
  assert.equal(parseId(null), null);
  assert.equal(parseId(undefined), null);
});


test('uses the provided default status when status is missing', () => {
  const result = validateTask(
    { title: 'Test custom default' },
    'completed'
  );

  assert.deepEqual(result.errors, []);
  assert.equal(result.values.status, 'completed');
});
