const pool = require('../config/database');

const escapeLike = (s) => s.replace(/[\\%_]/g, '\\$&');

async function getAll({ status, search } = {}) {
  const where = [];
  const params = [];

  if (status === 'pending' || status === 'completed') {
    where.push('status = ?');
    params.push(status);
  }
  if (search) {
    where.push('title LIKE ?');
    params.push(`%${escapeLike(search)}%`);
  }

  const sql =
    'SELECT id, title, description, status, created_at FROM tasks' +
    (where.length ? ' WHERE ' + where.join(' AND ') : '') +
    ' ORDER BY created_at DESC, id DESC';

  const [rows] = await pool.execute(sql, params);
  return rows;
}

async function getById(id) {
  const [rows] = await pool.execute(
    'SELECT id, title, description, status, created_at FROM tasks WHERE id = ?',
    [id]
  );
  return rows[0] || null;
}

async function create({ title, description, status }) {
  const [result] = await pool.execute(
    'INSERT INTO tasks (title, description, status) VALUES (?, ?, ?)',
    [title, description, status]
  );
  return getById(result.insertId);
}

async function update(id, { title, description, status }) {
  await pool.execute(
    'UPDATE tasks SET title = ?, description = ?, status = ? WHERE id = ?',
    [title, description, status, id]
  );
  return getById(id);
}

async function toggle(id) {
  await pool.execute(
    `UPDATE tasks
     SET status = IF(status = 'pending', 'completed', 'pending')
     WHERE id = ?`,
    [id]
  );
  return getById(id);
}

async function remove(id) {
  const [result] = await pool.execute('DELETE FROM tasks WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

async function getStats() {
  const [rows] = await pool.execute(
    `SELECT COUNT(*) AS total,
            COALESCE(SUM(status = 'pending'), 0) AS pending,
            COALESCE(SUM(status = 'completed'), 0) AS completed
     FROM tasks`
  );
  const r = rows[0];
  return {
    total: Number(r.total),
    pending: Number(r.pending),
    completed: Number(r.completed)
  };
}

module.exports = { getAll, getById, create, update, toggle, remove, getStats };
