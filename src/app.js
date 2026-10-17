require('dotenv').config();
const path = require('path');
const express = require('express');
const helmet = require('helmet');

const webRoutes = require('./routes/web');
const apiRoutes = require('./routes/api');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '..', 'views'));

// Security headers. "upgrade-insecure-requests" is disabled so the app
// also works over plain http://localhost during local development.
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        'upgrade-insecure-requests': null
      }
    }
  })
);

app.use(express.urlencoded({ extended: false, limit: '20kb' }));
app.use(express.json({ limit: '20kb' }));
app.use(express.static(path.join(__dirname, '..', 'public')));

// Helpers available in every view (flash messages come from the query string;
// EJS escapes them, so they are safe to display).
app.locals.formatDate = (d) =>
  new Date(d).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' });

app.use((req, res, next) => {
  res.locals.success = typeof req.query.success === 'string' ? req.query.success.slice(0, 200) : '';
  res.locals.error = typeof req.query.error === 'string' ? req.query.error.slice(0, 200) : '';
  next();
});

app.use('/api', apiRoutes);
app.use('/', webRoutes);

// 404
app.use((req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'Route not found.' });
  }
  res.status(404).render('error', { title: 'Not found', message: 'Page not found.' });
});

// Error handler (Express 5 forwards async errors here automatically)
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  if (req.path.startsWith('/api')) {
    return res.status(500).json({ error: 'Internal server error.' });
  }
  res.status(500).render('error', {
    title: 'Error',
    message: 'Something went wrong. Please try again.'
  });
});

module.exports = app;