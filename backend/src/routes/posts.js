const { Router } = require('express');
const Joi = require('joi');
const db = require('../db/database');
const validate = require('../middleware/validate');

const router = Router();

// ──────────────── Schemas ────────────────

const createPostSchema = Joi.object({
    author_id: Joi.number().integer().positive().required(),
    title: Joi.string().trim().min(1).max(200).required(),
    body: Joi.string().trim().min(1).required(),
});

const updatePostSchema = Joi.object({
    title: Joi.string().trim().min(1).max(200),
    body: Joi.string().trim().min(1),
}).min(1);

// ──────────────── Helpers ────────────────

function isGroupMember(groupId, memberId) {
    return !!db.prepare(
        'SELECT id FROM group_members WHERE group_id = ? AND member_id = ?'
    ).get(groupId, memberId);
}

function isGroupAdmin(groupId, memberId) {
    const row = db.prepare(
        `SELECT role FROM group_members WHERE group_id = ? AND member_id = ?`
    ).get(groupId, memberId);
    return row?.role === 'admin';
}

// ──────────────── Routes ────────────────
// All routes are prefixed with /api/groups/:groupId/posts (mounted in app.js)

// POST /api/groups/:groupId/posts — Create a post
router.post('/:groupId/posts', validate(createPostSchema), (req, res) => {
    const { groupId } = req.params;
    const { author_id, title, body } = req.body;

    // Verify group exists
    const group = db.prepare('SELECT id FROM club_groups WHERE id = ?').get(groupId);
    if (!group) {
        return res.status(404).json({ error: 'Group not found' });
    }

    // Author must be a member of the group
    if (!isGroupMember(groupId, author_id)) {
        return res.status(403).json({ error: 'Only group members can post' });
    }

    const result = db.prepare(
        'INSERT INTO posts (group_id, author_id, title, body) VALUES (?, ?, ?, ?)'
    ).run(groupId, author_id, title, body);

    const post = db.prepare(`
        SELECT p.*, m.name AS author_name
        FROM posts p
        JOIN members m ON m.id = p.author_id
        WHERE p.id = ?
    `).get(result.lastInsertRowid);

    res.status(201).json(post);
});

// GET /api/groups/:groupId/posts — List all posts in a group
router.get('/:groupId/posts', (req, res) => {
    const { groupId } = req.params;

    const group = db.prepare('SELECT id FROM club_groups WHERE id = ?').get(groupId);
    if (!group) {
        return res.status(404).json({ error: 'Group not found' });
    }

    const posts = db.prepare(`
        SELECT p.*, m.name AS author_name
        FROM posts p
        JOIN members m ON m.id = p.author_id
        WHERE p.group_id = ?
        ORDER BY p.created_at DESC
    `).all(groupId);

    res.json(posts);
});

// GET /api/groups/:groupId/posts/:id — Get a single post
router.get('/:groupId/posts/:id', (req, res) => {
    const post = db.prepare(`
        SELECT p.*, m.name AS author_name
        FROM posts p
        JOIN members m ON m.id = p.author_id
        WHERE p.id = ? AND p.group_id = ?
    `).get(req.params.id, req.params.groupId);

    if (!post) {
        return res.status(404).json({ error: 'Post not found' });
    }
    res.json(post);
});

// PUT /api/groups/:groupId/posts/:id — Edit a post (author only)
router.put('/:groupId/posts/:id', validate(updatePostSchema), (req, res) => {
    const post = db.prepare(
        'SELECT * FROM posts WHERE id = ? AND group_id = ?'
    ).get(req.params.id, req.params.groupId);

    if (!post) {
        return res.status(404).json({ error: 'Post not found' });
    }

    // Only the author can edit
    const editorId = req.query.editor_id;
    if (!editorId || Number(editorId) !== post.author_id) {
        return res.status(403).json({ error: 'Only the author can edit this post' });
    }

    const { title, body } = req.body;

    db.prepare(
        `UPDATE posts SET
            title = COALESCE(?, title),
            body = COALESCE(?, body),
            updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`
    ).run(title || null, body || null, req.params.id);

    const updated = db.prepare(`
        SELECT p.*, m.name AS author_name
        FROM posts p
        JOIN members m ON m.id = p.author_id
        WHERE p.id = ?
    `).get(req.params.id);

    res.json(updated);
});

// DELETE /api/groups/:groupId/posts/:id — Delete a post (author or group admin)
router.delete('/:groupId/posts/:id', (req, res) => {
    const post = db.prepare(
        'SELECT * FROM posts WHERE id = ? AND group_id = ?'
    ).get(req.params.id, req.params.groupId);

    if (!post) {
        return res.status(404).json({ error: 'Post not found' });
    }

    const deleterId = Number(req.query.deleter_id);
    const isAuthor = deleterId === post.author_id;
    const isAdmin = isGroupAdmin(req.params.groupId, deleterId);

    if (!isAuthor && !isAdmin) {
        return res.status(403).json({ error: 'Only the author or a group admin can delete this post' });
    }

    db.prepare('DELETE FROM posts WHERE id = ?').run(req.params.id);
    res.json({ message: 'Post deleted', post });
});

module.exports = router;
