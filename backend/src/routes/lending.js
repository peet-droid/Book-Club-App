const { Router } = require('express');
const Joi = require('joi');
const db = require('../db/database');
const validate = require('../middleware/validate');

const router = Router();

// ──────────────── Schemas ────────────────

const createLendRequestSchema = Joi.object({
    book_id: Joi.number().integer().positive().required(),
    borrower_id: Joi.number().integer().positive().required(),
});

// ──────────────── Routes ────────────────

// POST /api/lend-requests — Request to borrow a book
router.post('/', validate(createLendRequestSchema), (req, res) => {
    const { book_id, borrower_id } = req.body;

    // Verify the book exists
    const book = db.prepare('SELECT * FROM books WHERE id = ?').get(book_id);
    if (!book) {
        return res.status(404).json({ error: 'Book not found' });
    }

    // Can't borrow your own book
    if (book.owner_id === borrower_id) {
        return res.status(400).json({ error: 'You cannot borrow your own book' });
    }

    // Verify borrower exists
    const borrower = db.prepare('SELECT id FROM members WHERE id = ?').get(borrower_id);
    if (!borrower) {
        return res.status(404).json({ error: 'Borrower member not found' });
    }

    // Book must be available
    if (book.status !== 'available') {
        return res.status(400).json({ error: 'Book is currently not available for lending' });
    }

    // Check for existing pending request on same book by same borrower
    const existing = db.prepare(
        `SELECT id FROM lend_requests WHERE book_id = ? AND borrower_id = ? AND status = 'pending'`
    ).get(book_id, borrower_id);
    if (existing) {
        return res.status(409).json({ error: 'You already have a pending request for this book' });
    }

    const result = db.prepare(
        'INSERT INTO lend_requests (book_id, borrower_id) VALUES (?, ?)'
    ).run(book_id, borrower_id);

    const request = db.prepare('SELECT * FROM lend_requests WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(request);
});

// GET /api/lend-requests — List lend requests (filterable by status, borrower_id, owner)
router.get('/', (req, res) => {
    let sql = `
        SELECT lr.*, b.title AS book_title, b.owner_id,
               m_borrower.name AS borrower_name,
               m_owner.name AS owner_name
        FROM lend_requests lr
        JOIN books b ON b.id = lr.book_id
        JOIN members m_borrower ON m_borrower.id = lr.borrower_id
        JOIN members m_owner ON m_owner.id = b.owner_id
        WHERE 1=1
    `;
    const params = [];

    if (req.query.status) {
        sql += ' AND lr.status = ?';
        params.push(req.query.status);
    }
    if (req.query.borrower_id) {
        sql += ' AND lr.borrower_id = ?';
        params.push(req.query.borrower_id);
    }
    if (req.query.owner_id) {
        sql += ' AND b.owner_id = ?';
        params.push(req.query.owner_id);
    }

    sql += ' ORDER BY lr.requested_at DESC';

    const requests = db.prepare(sql).all(...params);
    res.json(requests);
});

// PATCH /api/lend-requests/:id/approve — Owner approves a request
router.patch('/:id/approve', (req, res) => {
    const request = db.prepare('SELECT * FROM lend_requests WHERE id = ?').get(req.params.id);
    if (!request) {
        return res.status(404).json({ error: 'Lend request not found' });
    }
    if (request.status !== 'pending') {
        return res.status(400).json({ error: `Cannot approve a request with status "${request.status}"` });
    }

    const approve = db.transaction(() => {
        // Update request status
        db.prepare(
            `UPDATE lend_requests SET status = 'approved', approved_at = CURRENT_TIMESTAMP WHERE id = ?`
        ).run(req.params.id);

        // Mark book as lent
        db.prepare(`UPDATE books SET status = 'lent' WHERE id = ?`).run(request.book_id);
    });
    approve();

    const updated = db.prepare('SELECT * FROM lend_requests WHERE id = ?').get(req.params.id);
    res.json(updated);
});

// PATCH /api/lend-requests/:id/reject — Owner rejects a request
router.patch('/:id/reject', (req, res) => {
    const request = db.prepare('SELECT * FROM lend_requests WHERE id = ?').get(req.params.id);
    if (!request) {
        return res.status(404).json({ error: 'Lend request not found' });
    }
    if (request.status !== 'pending') {
        return res.status(400).json({ error: `Cannot reject a request with status "${request.status}"` });
    }

    db.prepare(`UPDATE lend_requests SET status = 'rejected' WHERE id = ?`).run(req.params.id);

    const updated = db.prepare('SELECT * FROM lend_requests WHERE id = ?').get(req.params.id);
    res.json(updated);
});

// PATCH /api/lend-requests/:id/return — Borrower marks book as returned
router.patch('/:id/return', (req, res) => {
    const request = db.prepare('SELECT * FROM lend_requests WHERE id = ?').get(req.params.id);
    if (!request) {
        return res.status(404).json({ error: 'Lend request not found' });
    }
    if (request.status !== 'approved') {
        return res.status(400).json({ error: `Cannot return a book for a request with status "${request.status}"` });
    }

    const returnBook = db.transaction(() => {
        db.prepare(
            `UPDATE lend_requests SET status = 'returned', returned_at = CURRENT_TIMESTAMP WHERE id = ?`
        ).run(req.params.id);

        db.prepare(`UPDATE books SET status = 'available' WHERE id = ?`).run(request.book_id);
    });
    returnBook();

    const updated = db.prepare('SELECT * FROM lend_requests WHERE id = ?').get(req.params.id);
    res.json(updated);
});

module.exports = router;
