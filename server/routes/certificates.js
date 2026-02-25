const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');
const authMiddleware = require('../middleware/authMiddleware');
const Joi = require('joi');

const certificateSchema = Joi.object({
    name: Joi.string().required(),
    expiry_date: Joi.date().allow(null),
    image_url: Joi.string().uri().required(),
    active: Joi.boolean().default(true)
});

// GET /api/certificates/public (Public - Active Only)
router.get('/public', async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT * FROM certificates WHERE active = true ORDER BY created_at DESC'
        );
        res.json(rows);
    } catch (err) {
        console.error('Certificate fetch error:', err);
        res.status(500).json({ error: 'Failed to fetch certificates' });
    }
});

// GET /api/certificates (Admin - All)
router.get('/', authMiddleware, async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT * FROM certificates ORDER BY created_at DESC'
        );
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch certificates' });
    }
});

// POST /api/certificates (Admin)
router.post('/', authMiddleware, async (req, res) => {
    const { error, value } = certificateSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    try {
        const certId = uuidv4();
        await db.query(
            'INSERT INTO certificates (id, name, expiry_date, image_url, active) VALUES (?, ?, ?, ?, ?)',
            [certId, value.name, value.expiry_date, value.image_url, value.active]
        );

        res.status(201).json({ message: 'Certificate added', data: { id: certId, ...value } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// PUT /api/certificates/:id (Admin - Update)
router.put('/:id', authMiddleware, async (req, res) => {
    const { active, name, expiry_date, image_url } = req.body;

    // If it's just a status toggle (active/inactive)
    if (active !== undefined && !name) {
        try {
            const [result] = await db.query(
                'UPDATE certificates SET active = ? WHERE id = ?',
                [active, req.params.id]
            );
            if (result.affectedRows === 0) return res.status(404).json({ error: 'Certificate not found' });
            return res.json({ message: 'Certificate status updated' });
        } catch (err) {
            console.error('Certificate status update error:', err);
            return res.status(500).json({ error: 'Update failed' });
        }
    }

    // Full update validation
    const { error, value } = certificateSchema.validate({ name, expiry_date, image_url, active });
    if (error) return res.status(400).json({ error: error.details[0].message });

    try {
        const [result] = await db.query(
            'UPDATE certificates SET name = ?, expiry_date = ?, image_url = ?, active = ? WHERE id = ?',
            [value.name, value.expiry_date, value.image_url, value.active, req.params.id]
        );

        if (result.affectedRows === 0) return res.status(404).json({ error: 'Certificate not found' });

        res.json({ message: 'Certificate details updated' });
    } catch (err) {
        console.error('Certificate Edit Error:', err);
        res.status(500).json({ error: 'Update failed' });
    }
});

// DELETE /api/certificates/:id (Admin)
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const [result] = await db.query('DELETE FROM certificates WHERE id = ?', [req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Certificate not found' });

        res.json({ message: 'Certificate deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Delete failed' });
    }
});

module.exports = router;
