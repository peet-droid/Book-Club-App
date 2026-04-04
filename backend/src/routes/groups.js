const { Router } = require('express');
const Joi = require('joi');
const db = require('../db/database');
const validate = require('../middleware/validate');

const router = Router();

// ──────────────── Schemas ────────────────

const createGroupSchema = Joi.object({
    name: Joi.string().trim().min(1).max(100).required(),
    description: Joi.string().trim().max(500).allow('', null),
    created_by: Joi.number().integer().positive().required(),
});

const updateGroupSchema = Joi.object({
    name: Joi.string().trim().min(1).max(100),
    description: Joi.string().trim().max(500).allow('', null),
}).min(1);

const addGroupMemberSchema = Joi.object({
    member_id: Joi.number().integer().positive().required(),
});

// ──────────────── Helpers ────────────────

function isGroupAdmin(groupId, memberId) {
    const row = db.prepare(
        `SELECT role FROM group_members WHERE group_id = ? AND member_id = ?`
    ).get(groupId, memberId);
    return row?.role === 'admin';
}

// ──────────────── Routes ────────────────

// POST /api/groups — Create a new group
router.post('/', validate(createGroupSchema), (req, res) => {
    const { name, description, created_by } = req.body;

    const member = db.prepare('SELECT id FROM members WHERE id = ?').get(created_by);
    if (!member) {
        return res.status(404).json({ error: 'Creator member not found' });
    }

    const create = db.transaction(() => {
        const result = db.prepare(
            'INSERT INTO club_groups (name, description, created_by) VALUES (?, ?, ?)'
        ).run(name, description || null, created_by);

        // Creator becomes admin
        db.prepare(
            `INSERT INTO group_members (group_id, member_id, role) VALUES (?, ?, 'admin')`
        ).run(result.lastInsertRowid, created_by);

        return result.lastInsertRowid;
    });
    const groupId = create();

    const group = db.prepare('SELECT * FROM club_groups WHERE id = ?').get(groupId);
    res.status(201).json(group);
});

// GET /api/groups — List all groups
router.get('/', (req, res) => {
    const groups = db.prepare(`
        SELECT g.*, m.name AS created_by_name,
               (SELECT COUNT(*) FROM group_members gm WHERE gm.group_id = g.id) AS member_count
        FROM club_groups g
        JOIN members m ON m.id = g.created_by
        ORDER BY g.name
    `).all();
    res.json(groups);
});

// GET /api/groups/:id — Get group details + member list
router.get('/:id', (req, res) => {
    const group = db.prepare(`
        SELECT g.*, m.name AS created_by_name
        FROM club_groups g
        JOIN members m ON m.id = g.created_by
        WHERE g.id = ?
    `).get(req.params.id);

    if (!group) {
        return res.status(404).json({ error: 'Group not found' });
    }

    const members = db.prepare(`
        SELECT gm.role, gm.joined_at, m.id, m.name, m.email
        FROM group_members gm
        JOIN members m ON m.id = gm.member_id
        WHERE gm.group_id = ?
        ORDER BY gm.role DESC, m.name
    `).all(req.params.id);

    res.json({ ...group, members });
});

// PUT /api/groups/:id — Update group info (admin only)
router.put('/:id', validate(updateGroupSchema), (req, res) => {
    const group = db.prepare('SELECT * FROM club_groups WHERE id = ?').get(req.params.id);
    if (!group) {
        return res.status(404).json({ error: 'Group not found' });
    }

    // Require admin_id in query to verify permissions
    const adminId = req.query.admin_id;
    if (!adminId || !isGroupAdmin(req.params.id, adminId)) {
        return res.status(403).json({ error: 'Only group admins can update group info' });
    }

    const { name, description } = req.body;

    db.prepare(
        `UPDATE club_groups SET
            name = COALESCE(?, name),
            description = COALESCE(?, description)
         WHERE id = ?`
    ).run(name || null, description !== undefined ? description : null, req.params.id);

    const updated = db.prepare('SELECT * FROM club_groups WHERE id = ?').get(req.params.id);
    res.json(updated);
});

// DELETE /api/groups/:id — Delete a group (admin only)
router.delete('/:id', (req, res) => {
    const group = db.prepare('SELECT * FROM club_groups WHERE id = ?').get(req.params.id);
    if (!group) {
        return res.status(404).json({ error: 'Group not found' });
    }

    const adminId = req.query.admin_id;
    if (!adminId || !isGroupAdmin(req.params.id, adminId)) {
        return res.status(403).json({ error: 'Only group admins can delete a group' });
    }

    db.prepare('DELETE FROM club_groups WHERE id = ?').run(req.params.id);
    res.json({ message: 'Group deleted', group });
});

// POST /api/groups/:id/members — Add a member to the group
router.post('/:id/members', validate(addGroupMemberSchema), (req, res) => {
    const group = db.prepare('SELECT id FROM club_groups WHERE id = ?').get(req.params.id);
    if (!group) {
        return res.status(404).json({ error: 'Group not found' });
    }

    const { member_id } = req.body;
    const member = db.prepare('SELECT id, name FROM members WHERE id = ?').get(member_id);
    if (!member) {
        return res.status(404).json({ error: 'Member not found' });
    }

    // Check if already a member
    const existing = db.prepare(
        'SELECT id FROM group_members WHERE group_id = ? AND member_id = ?'
    ).get(req.params.id, member_id);
    if (existing) {
        return res.status(409).json({ error: 'Member is already in this group' });
    }

    db.prepare(
        `INSERT INTO group_members (group_id, member_id, role) VALUES (?, ?, 'member')`
    ).run(req.params.id, member_id);

    res.status(201).json({ message: `${member.name} added to the group` });
});

// DELETE /api/groups/:id/members/:memberId — Remove a member from the group
router.delete('/:id/members/:memberId', (req, res) => {
    const group = db.prepare('SELECT id FROM club_groups WHERE id = ?').get(req.params.id);
    if (!group) {
        return res.status(404).json({ error: 'Group not found' });
    }

    const membership = db.prepare(
        'SELECT * FROM group_members WHERE group_id = ? AND member_id = ?'
    ).get(req.params.id, req.params.memberId);
    if (!membership) {
        return res.status(404).json({ error: 'Member is not in this group' });
    }

    db.prepare(
        'DELETE FROM group_members WHERE group_id = ? AND member_id = ?'
    ).run(req.params.id, req.params.memberId);

    res.json({ message: 'Member removed from group' });
});

module.exports = router;
