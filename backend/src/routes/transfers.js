const { Router } = require('express');
const Joi = require('joi');
const db = require('../db/database');
const validate = require('../middleware/validate');

const router = Router();

// ──────────────── Schemas ────────────────

const createTransferSchema = Joi.object({
    book_id: Joi.number().integer().positive().required(),
    from_member_id: Joi.number().integer().positive().required(),
    to_member_id: Joi.number().integer().positive().required(),
});

// ──────────────── Routes ────────────────

// POST /api/transfers — Transfer ownership of a book to another member
router.post('/', validate(createTransferSchema), (req, res) => {
    const { book_id, from_member_id, to_member_id } = req.body;

    if (from_member_id === to_member_id) {
        return res.status(400).json({ error: 'Cannot transfer a book to yourself' });
    }

    // Verify book exists and belongs to from_member
    const book = db.prepare('SELECT * FROM books WHERE id = ?').get(book_id);
    if (!book) {
        return res.status(404).json({ error: 'Book not found' });
    }
    if (book.owner_id !== from_member_id) {
        return res.status(403).json({ error: 'Only the current owner can transfer this book' });
    }

    // Book must not be currently lent out
    if (book.status === 'lent') {
        return res.status(400).json({ error: 'Cannot transfer a book that is currently lent out. It must be returned first.' });
    }

    // Verify receiver exists
    const toMember = db.prepare('SELECT id FROM members WHERE id = ?').get(to_member_id);
    if (!toMember) {
        return res.status(404).json({ error: 'Receiving member not found' });
    }

    const transfer = db.transaction(() => {
        // Record the transfer
        const result = db.prepare(
            'INSERT INTO transfers (book_id, from_member_id, to_member_id) VALUES (?, ?, ?)'
        ).run(book_id, from_member_id, to_member_id);

        // Update book ownership
        db.prepare('UPDATE books SET owner_id = ? WHERE id = ?').run(to_member_id, book_id);

        return result.lastInsertRowid;
    });
    const transferId = transfer();

    const record = db.prepare(`
        SELECT t.*, b.title AS book_title,
               m_from.name AS from_member_name,
               m_to.name AS to_member_name
        FROM transfers t
        JOIN books b ON b.id = t.book_id
        JOIN members m_from ON m_from.id = t.from_member_id
        JOIN members m_to ON m_to.id = t.to_member_id
        WHERE t.id = ?
    `).get(transferId);

    res.status(201).json(record);
});

// GET /api/transfers — List transfer history
router.get('/', (req, res) => {
    let sql = `
        SELECT t.*, b.title AS book_title,
               m_from.name AS from_member_name,
               m_to.name AS to_member_name
        FROM transfers t
        JOIN books b ON b.id = t.book_id
        JOIN members m_from ON m_from.id = t.from_member_id
        JOIN members m_to ON m_to.id = t.to_member_id
    `;
    const params = [];

    if (req.query.member_id) {
        sql += ' WHERE (t.from_member_id = ? OR t.to_member_id = ?)';
        params.push(req.query.member_id, req.query.member_id);
    }

    sql += ' ORDER BY t.transferred_at DESC';

    const transfers = db.prepare(sql).all(...params);
    res.json(transfers);
});

module.exports = router;
