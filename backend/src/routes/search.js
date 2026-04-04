const { Router } = require('express');
const db = require('../db/database');

const router = Router();

// GET /api/search/books — Search books by title, author, isbn, genre, owner_id, status
router.get('/books', (req, res) => {
    let sql = `
        SELECT b.*, m.name AS owner_name
        FROM books b
        JOIN members m ON m.id = b.owner_id
        WHERE 1=1
    `;
    const params = [];

    // Full-text search across title, author, isbn, genre
    if (req.query.q) {
        const q = `%${req.query.q}%`;
        sql += ` AND (b.title LIKE ? OR b.author LIKE ? OR b.isbn LIKE ? OR b.genre LIKE ?)`;
        params.push(q, q, q, q);
    }

    if (req.query.owner_id) {
        sql += ' AND b.owner_id = ?';
        params.push(req.query.owner_id);
    }

    if (req.query.status) {
        sql += ' AND b.status = ?';
        params.push(req.query.status);
    }

    if (req.query.genre) {
        sql += ' AND b.genre LIKE ?';
        params.push(`%${req.query.genre}%`);
    }

    sql += ' ORDER BY b.title';

    const books = db.prepare(sql).all(...params);
    res.json({ count: books.length, results: books });
});

// GET /api/search/who-has — Check which member currently has a specific book
router.get('/who-has', (req, res) => {
    const { title } = req.query;
    if (!title) {
        return res.status(400).json({ error: 'Query parameter "title" is required' });
    }

    // Find books matching the title
    const books = db.prepare(`
        SELECT b.id, b.title, b.author, b.status, b.owner_id,
               m_owner.name AS owner_name
        FROM books b
        JOIN members m_owner ON m_owner.id = b.owner_id
        WHERE b.title LIKE ?
        ORDER BY b.title
    `).all(`%${title}%`);

    if (books.length === 0) {
        return res.json({ message: 'No books found matching that title', results: [] });
    }

    // For each book, also check if it's currently lent to someone
    const results = books.map((book) => {
        const activeLoan = db.prepare(`
            SELECT lr.borrower_id, m.name AS borrower_name, lr.approved_at
            FROM lend_requests lr
            JOIN members m ON m.id = lr.borrower_id
            WHERE lr.book_id = ? AND lr.status = 'approved'
            ORDER BY lr.approved_at DESC
            LIMIT 1
        `).get(book.id);

        return {
            ...book,
            currently_with: activeLoan
                ? { member_id: activeLoan.borrower_id, name: activeLoan.borrower_name, since: activeLoan.approved_at }
                : { member_id: book.owner_id, name: book.owner_name, note: 'Owner has it' },
        };
    });

    res.json({ count: results.length, results });
});

module.exports = router;
