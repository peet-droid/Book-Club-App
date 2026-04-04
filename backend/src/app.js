const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');

const app = express();

// --------------- Middleware ---------------
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

// --------------- Health check ---------------
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// --------------- Routes ---------------
app.use('/api/members', require('./routes/members'));
app.use('/api/books', require('./routes/books'));
app.use('/api/lend-requests', require('./routes/lending'));
app.use('/api/transfers', require('./routes/transfers'));
app.use('/api/search', require('./routes/search'));
app.use('/api/groups', require('./routes/groups'));
app.use('/api/groups', require('./routes/posts'));
app.use('/api/db', require('./routes/db-explorer'));

// --------------- Global error handler ---------------
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        error: err.message || 'Internal Server Error',
    });
});

module.exports = app;
