const tasks = require('../services/taskService');
const { validateTask, parseId } = require('../utils/validation');

const msg = (path, key, text) =>
  `${path}${path.includes('?') ? '&' : '?'}${key}=${encodeURIComponent(text)}`;

// Only allow redirects back to our own list or detail pages
function safeReturn(value) {
  return typeof value === 'string' && /^\/(\?[^#\s]*)?$|^\/tasks\/\d+$/.test(value)
    ? value
    : '/';
}

async function loadTask(req, res) {
  const id = parseId(req.params.id);
  const task = id ? await tasks.getById(id) : null;
  if (!task) {
    res.status(404).render('error', { title: 'Not found', message: 'Task not found.' });
    return null;
  }
  return task;
}

exports.index = async (req, res) => {
  const status = ['pending', 'completed'].includes(req.query.status)
    ? req.query.status
    : '';
  const search = typeof req.query.search === 'string'
    ? req.query.search.trim().slice(0, 100)
    : '';

  const [list, stats] = await Promise.all([
    tasks.getAll({ status, search }),
    tasks.getStats()
  ]);
  res.render('index', { title: 'Dashboard', tasks: list, stats, status, search });
};

exports.newForm = (req, res) => {
  res.render('form', {
    title: 'New task',
    heading: 'Create task',
    action: '/tasks',
    task: { title: '', description: '', status: 'pending' },
    errors: []
  });
};

exports.create = async (req, res) => {
  const { errors, values } = validateTask(req.body);
  if (errors.length) {
    return res.status(400).render('form', {
      title: 'New task',
      heading: 'Create task',
      action: '/tasks',
      task: values,
      errors
    });
  }
  await tasks.create(values);
  res.redirect(msg('/', 'success', 'Task created.'));
};

exports.show = async (req, res) => {
  const task = await loadTask(req, res);
  if (task) res.render('show', { title: task.title, task });
};

exports.editForm = async (req, res) => {
  const task = await loadTask(req, res);
  if (!task) return;
  res.render('form', {
    title: 'Edit task',
    heading: 'Edit task',
    action: `/tasks/${task.id}/edit`,
    task,
    errors: []
  });
};

exports.update = async (req, res) => {
  const existing = await loadTask(req, res);
  if (!existing) return;

  const { errors, values } = validateTask(req.body, existing.status);
  if (errors.length) {
    return res.status(400).render('form', {
      title: 'Edit task',
      heading: 'Edit task',
      action: `/tasks/${existing.id}/edit`,
      task: values,
      errors
    });
  }
  await tasks.update(existing.id, values);
  res.redirect(msg(`/tasks/${existing.id}`, 'success', 'Task updated.'));
};

exports.toggle = async (req, res) => {
  const existing = await loadTask(req, res);
  if (!existing) return;
  await tasks.toggle(existing.id);
  res.redirect(msg(safeReturn(req.body.returnTo), 'success', 'Task status changed.'));
};

exports.remove = async (req, res) => {
  const existing = await loadTask(req, res);
  if (!existing) return;
  await tasks.remove(existing.id);
  res.redirect(msg('/', 'success', 'Task deleted.'));
};
