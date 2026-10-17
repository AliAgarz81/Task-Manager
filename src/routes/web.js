const express = require('express');
const c = require('../controllers/taskController');

const router = express.Router();

router.get('/', c.index);
router.get('/tasks/new', c.newForm);
router.post('/tasks', c.create);
router.get('/tasks/:id', c.show);
router.get('/tasks/:id/edit', c.editForm);
router.post('/tasks/:id/edit', c.update);
router.post('/tasks/:id/toggle', c.toggle);
router.post('/tasks/:id/delete', c.remove);

module.exports = router;
