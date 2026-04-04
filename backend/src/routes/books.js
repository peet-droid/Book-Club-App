const { Router } = require('express');
const Joi = require('joi');
const db = require('../db/database');
const validate = require('../middleware/validate');

const router = Router();

// ──────────────── Schemas ────────────────

const createBookSchema = Joi.object({
    title: Joi.string().trim().min(1).max(200).required(),
    author: Joi.string().trim().min(1).max(200).required(),
    isbn: Joi.string().trim().max(30).allow('', null),
    genre: Joi.string().trim().max(50).allow('', null),
    owner_id: Joi.number().integer().positive().required(),
});

const updateBookSchema = Joi.object({
    title: Joi.string().trim().min(1).max(200),
    author: Joi.string().trim().min(1).max(200),
    isbn: Joi.string().trim().max(30).allow('', null),
    genre: Joi.string().trim().max(50).allow('', null),
}).min(1);

// ──────────────── Routes ────────────────

// POST /api/books — Add a book (assigned to an owner)
router.post('/', validate(createBookSchema), (req, res) => {
    const { title, author, isbn, genre, owner_id } = req.body;

    // Verify the owner exists
    const owner = db.prepare('SELECT id FROM members WHERE id = ?').get(owner_id);
    if (!owner) {
        return res.status(404).json({ error: 'Owner member not found' });
    }

    const result = db.prepare(
        `INSERT INTO books (title, author, isbn, genre, owner_id)
         VALUES (?, ?, ?, ?, ?)`
    ).run(title, author, isbn || null, genre || null, owner_id);

    const book = db.prepare('SELECT * FROM books WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(book);
});

// GET /api/books — List all books in the club
router.get('/', (req, res) => {
    const books = db.prepare(`
        SELECT b.*, m.name AS owner_name
        FROM books b
        JOIN members m ON m.id = b.owner_id
        ORDER BY b.title
    `).all();
    res.json(books);
});

// GET /api/books/:id — Get book details
router.get('/:id', (req, res) => {
    const book = db.prepare(`
        SELECT b.*, m.name AS owner_name
        FROM books b
        JOIN members m ON m.id = b.owner_id
        WHERE b.id = ?
    `).get(req.params.id);

    if (!book) {
        return res.status(404).json({ error: 'Book not found' });
    }
    res.json(book);
});

// PUT /api/books/:id — Update book info
router.put('/:id', validate(updateBookSchema), (req, res) => {
    const book = db.prepare('SELECT * FROM books WHERE id = ?').get(req.params.id);
    if (!book) {
        return res.status(404).json({ error: 'Book not found' });
    }

    const { title, author, isbn, genre } = req.body;

    db.prepare(
        `UPDATE books SET
            title  = COALESCE(?, title),
            author = COALESCE(?, author),
            isbn   = COALESCE(?, isbn),
            genre  = COALESCE(?, genre)
         WHERE id = ?`
    ).run(
        title || null,
        author || null,
        isbn !== undefined ? isbn : null,
        genre !== undefined ? genre : null,
        req.params.id
    );

    const updated = db.prepare(`
        SELECT b.*, m.name AS owner_name
        FROM books b
        JOIN members m ON m.id = b.owner_id
        WHERE b.id = ?
    `).get(req.params.id);

    res.json(updated);
});

// DELETE /api/books/:id — Remove a book
router.delete('/:id', (req, res) => {
    const book = db.prepare('SELECT * FROM books WHERE id = ?').get(req.params.id);
    if (!book) {
        return res.status(404).json({ error: 'Book not found' });
    }

    db.prepare('DELETE FROM books WHERE id = ?').run(req.params.id);
    res.json({ message: 'Book deleted', book });
});

module.exports = router;
