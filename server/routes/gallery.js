const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');
const authMiddleware = require('../middleware/authMiddleware');
const Joi = require('joi');
const { translateContent } = require('../services/translateService');

const gallerySchema = Joi.object({
    title: Joi.string().required(),
    image_url: Joi.string().required(),
    category: Joi.string().valid('Events', 'Office', 'Clients', 'Awards', 'Other').default('Other'),
    active: Joi.boolean().default(true)
});

router.get('/public', async (req, res) => {
    const lang = req.headers['accept-language-code'] || req.query.lang || 'en';

    try {
        const [rows] = await db.query(
            `SELECT *, title_${lang} as title FROM gallery WHERE active = true ORDER BY created_at DESC`
        );
        res.json(rows);
    } catch (err) {
        console.error('Gallery fetch error:', err);
        res.status(500).json({ error: 'Failed to fetch gallery' });
    }
});

router.get('/', authMiddleware, async (req, res) => {
    const lang = req.headers['accept-language-code'] || req.query.lang || 'en';

    try {
        const [rows] = await db.query(
            `SELECT *, title_${lang} as title FROM gallery ORDER BY created_at DESC`
        );
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch gallery' });
    }
});

// POST /api/gallery (Admin)
router.post('/', authMiddleware, async (req, res) => {
    const { error, value } = gallerySchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    try {
        // Auto-translate translatable fields
        const translations = await translateContent({ title: value.title });

        const galleryId = uuidv4();
        await db.query(
            'INSERT INTO gallery (id, title_en, title_hi, title_mr, image_url, category, active) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [galleryId, translations.en.title, translations.hi.title, translations.mr.title, value.image_url, value.category, value.active]
        );

        res.status(201).json({ message: 'Gallery image added', data: { id: galleryId, ...value } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// PUT /api/gallery/:id (Admin - Update)
router.put('/:id', authMiddleware, async (req, res) => {
    const { active, title, image_url, category } = req.body;

    // If it's just a status toggle
    if (active !== undefined && !title) {
        try {
            const [result] = await db.query(
                'UPDATE gallery SET active = ? WHERE id = ?',
                [active, req.params.id]
            );
            if (result.affectedRows === 0) return res.status(404).json({ error: 'Gallery item not found' });
            return res.json({ message: 'Gallery status updated' });
        } catch (err) {
            console.error('Gallery status update error:', err);
            return res.status(500).json({ error: 'Update failed' });
        }
    }

    // Full update validation
    const { error, value } = gallerySchema.validate({ title, image_url, category, active });
    if (error) return res.status(400).json({ error: error.details[0].message });

    try {
        // Auto-translate translatable fields
        const translations = await translateContent({ title: value.title });

        const [result] = await db.query(
            'UPDATE gallery SET title_en = ?, title_hi = ?, title_mr = ?, image_url = ?, category = ?, active = ? WHERE id = ?',
            [translations.en.title, translations.hi.title, translations.mr.title, value.image_url, value.category, value.active, req.params.id]
        );

        if (result.affectedRows === 0) return res.status(404).json({ error: 'Gallery item not found' });

        res.json({ message: 'Gallery item updated' });
    } catch (err) {
        console.error('Gallery Edit Error:', err);
        res.status(500).json({ error: 'Update failed' });
    }
});

// DELETE /api/gallery/:id (Admin)
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const [result] = await db.query('DELETE FROM gallery WHERE id = ?', [req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Gallery item not found' });

        res.json({ message: 'Gallery image deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Delete failed' });
    }
});

module.exports = router;
