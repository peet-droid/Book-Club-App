const { Router } = require('express');
const db = require('../db/database');

const router = Router();

// GET /api/db/tables — List all tables and their row counts
router.get('/tables', (req, res) => {
    const tables = db.prepare(`
        SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name
    `).all();

    const result = tables.map((t) => {
        const count = db.prepare(`SELECT COUNT(*) as count FROM ${t.name}`).get().count;
        const info = db.prepare(`PRAGMA table_info(${t.name})`).all();
        return {
            name: t.name,
            row_count: count,
            columns: info.map((c) => ({
                name: c.name,
                type: c.type,
                notnull: !!c.notnull,
                pk: !!c.pk,
            })),
        };
    });

    res.json(result);
});

// POST /api/db/query — Execute a read-only SQL query
router.post('/query', (req, res) => {
    const { sql } = req.body;

    if (!sql || typeof sql !== 'string') {
        return res.status(400).json({ error: 'SQL query is required' });
    }

    // Block write operations
    const trimmed = sql.trim().toUpperCase();
    const writeKeywords = ['INSERT', 'UPDATE', 'DELETE', 'DROP', 'ALTER', 'CREATE', 'REPLACE', 'TRUNCATE'];
    if (writeKeywords.some((kw) => trimmed.startsWith(kw))) {
        return res.status(403).json({ error: 'Only read-only (SELECT) queries are allowed' });
    }

    try {
        const start = performance.now();
        const stmt = db.prepare(sql);
        const rows = stmt.all();
        const elapsed = (performance.now() - start).toFixed(2);

        const columns = rows.length > 0 ? Object.keys(rows[0]) : [];

        res.json({
            columns,
            rows,
            row_count: rows.length,
            execution_time_ms: elapsed,
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// GET /api/db/table/:name — Get all rows from a table (paginated)
router.get('/table/:name', (req, res) => {
    const { name } = req.params;
    const limit = parseInt(req.query.limit) || 100;
    const offset = parseInt(req.query.offset) || 0;

    // Verify table exists
    const table = db.prepare(
        `SELECT name FROM sqlite_master WHERE type='table' AND name = ?`
    ).get(name);

    if (!table) {
        return res.status(404).json({ error: 'Table not found' });
    }

    try {
        const total = db.prepare(`SELECT COUNT(*) as count FROM ${name}`).get().count;
        const rows = db.prepare(`SELECT * FROM ${name} LIMIT ? OFFSET ?`).all(limit, offset);
        const columns = rows.length > 0 ? Object.keys(rows[0]) : [];

        res.json({ table: name, columns, rows, total, limit, offset });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;
