const { Router } = require('express');
const Joi = require('joi');
const db = require('../db/database');
const validate = require('../middleware/validate');

const router = Router();

// ──────────────── Schemas ────────────────

const createMemberSchema = Joi.object({
    name: Joi.string().trim().min(1).max(100).required(),
    email: Joi.string().email().required(),
    phone: Joi.string().trim().max(20).allow('', null),
});

const updateMemberSchema = Joi.object({
    name: Joi.string().trim().min(1).max(100),
    email: Joi.string().email(),
    phone: Joi.string().trim().max(20).allow('', null),
}).min(1); // at least one field required

// ──────────────── Routes ────────────────

// POST /api/members — Create a new member
router.post('/', validate(createMemberSchema), (req, res) => {
    const { name, email, phone } = req.body;

    const existing = db.prepare('SELECT id FROM members WHERE email = ?').get(email);
    if (existing) {
        return res.status(409).json({ error: 'A member with this email already exists' });
    }

    const result = db.prepare(
        'INSERT INTO members (name, email, phone) VALUES (?, ?, ?)'
    ).run(name, email, phone || null);

    const member = db.prepare('SELECT * FROM members WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(member);
});

// GET /api/members — List all members
router.get('/', (req, res) => {
    const members = db.prepare('SELECT * FROM members ORDER BY name').all();
    res.json(members);
});

// GET /api/members/:id — Get a single member
router.get('/:id', (req, res) => {
    const member = db.prepare('SELECT * FROM members WHERE id = ?').get(req.params.id);
    if (!member) {
        return res.status(404).json({ error: 'Member not found' });
    }
    res.json(member);
});

// PUT /api/members/:id — Update a member
router.put('/:id', validate(updateMemberSchema), (req, res) => {
    const member = db.prepare('SELECT * FROM members WHERE id = ?').get(req.params.id);
    if (!member) {
        return res.status(404).json({ error: 'Member not found' });
    }

    const { name, email, phone } = req.body;

    // Check email uniqueness if changing email
    if (email && email !== member.email) {
        const dup = db.prepare('SELECT id FROM members WHERE email = ? AND id != ?').get(email, req.params.id);
        if (dup) {
            return res.status(409).json({ error: 'A member with this email already exists' });
        }
    }

    db.prepare(
        `UPDATE members SET
            name  = COALESCE(?, name),
            email = COALESCE(?, email),
            phone = COALESCE(?, phone)
         WHERE id = ?`
    ).run(
        name || null,
        email || null,
        phone !== undefined ? phone : null,
        req.params.id
    );

    const updated = db.prepare('SELECT * FROM members WHERE id = ?').get(req.params.id);
    res.json(updated);
});

// DELETE /api/members/:id — Remove a member
router.delete('/:id', (req, res) => {
    const member = db.prepare('SELECT * FROM members WHERE id = ?').get(req.params.id);
    if (!member) {
        return res.status(404).json({ error: 'Member not found' });
    }

    db.prepare('DELETE FROM members WHERE id = ?').run(req.params.id);
    res.json({ message: 'Member deleted', member });
});

// GET /api/members/:id/books — List a member's book collection
router.get('/:id/books', (req, res) => {
    const member = db.prepare('SELECT id FROM members WHERE id = ?').get(req.params.id);
    if (!member) {
        return res.status(404).json({ error: 'Member not found' });
    }

    const books = db.prepare(
        'SELECT * FROM books WHERE owner_id = ? ORDER BY title'
    ).all(req.params.id);

    res.json(books);
});

// GET /api/members/:id/groups — List groups a member belongs to
router.get('/:id/groups', (req, res) => {
    const member = db.prepare('SELECT id FROM members WHERE id = ?').get(req.params.id);
    if (!member) {
        return res.status(404).json({ error: 'Member not found' });
    }

    const groups = db.prepare(`
        SELECT g.*, gm.role, gm.joined_at
        FROM club_groups g
        JOIN group_members gm ON gm.group_id = g.id
        WHERE gm.member_id = ?
        ORDER BY g.name
    `).all(req.params.id);

    res.json(groups);
});

module.exports = router;
