const STATUSES = ['pending', 'completed'];

// Returns { errors: [...], values: {...} }
function validateTask(body = {}, defaultStatus = 'pending') {
  const errors = [];
  const title = typeof body.title === 'string' ? body.title.trim() : '';
  const description =
    typeof body.description === 'string' ? body.description.trim() : '';
  const status = body.status === undefined || body.status === ''
    ? defaultStatus
    : body.status;

  if (!title) errors.push('Title is required.');
  else if (title.length > 100) errors.push('Title must be at most 100 characters.');

  if (description.length > 1000) {
    errors.push('Description must be at most 1000 characters.');
  }
  if (!STATUSES.includes(status)) {
    errors.push('Status must be "pending" or "completed".');
  }

  return { errors, values: { title, description: description || null, status } };
}

// Returns a positive integer or null
function parseId(value) {
  return /^\d+$/.test(String(value)) && Number(value) > 0 ? Number(value) : null;
}

module.exports = { STATUSES, validateTask, parseId };
