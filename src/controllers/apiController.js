const tasks = require('../services/taskService');
const { validateTask, parseId } = require('../utils/validation');

exports.list = async (req, res) => {
  const list = await tasks.getAll({
    status: req.query.status,
    search: typeof req.query.search === 'string' ? req.query.search.trim() : ''
  });
  res.json(list);
};

exports.get = async (req, res) => {
  const id = parseId(req.params.id);
  const task = id ? await tasks.getById(id) : null;
  if (!task) return res.status(404).json({ error: 'Task not found.' });
  res.json(task);
};

exports.create = async (req, res) => {
  const { errors, values } = validateTask(req.body);
  if (errors.length) return res.status(400).json({ errors });
  const task = await tasks.create(values);
  res.status(201).json(task);
};

exports.update = async (req, res) => {
  const id = parseId(req.params.id);
  const existing = id ? await tasks.getById(id) : null;
  if (!existing) return res.status(404).json({ error: 'Task not found.' });

  const { errors, values } = validateTask(req.body, existing.status);
  if (errors.length) return res.status(400).json({ errors });
  res.json(await tasks.update(id, values));
};

exports.remove = async (req, res) => {
  const id = parseId(req.params.id);
  const deleted = id ? await tasks.remove(id) : false;
  if (!deleted) return res.status(404).json({ error: 'Task not found.' });
  res.status(204).end();
};
