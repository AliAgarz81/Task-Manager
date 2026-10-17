const express = require('express');
const c = require('../controllers/apiController');

const router = express.Router();

router.get('/tasks', c.list);
router.get('/tasks/:id', c.get);
router.post('/tasks', c.create);
router.put('/tasks/:id', c.update);
router.delete('/tasks/:id', c.remove);

module.exports = router;
