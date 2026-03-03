const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');
const { translateContent } = require('../services/translateService');
const authMiddleware = require('../middleware/authMiddleware');

// GET /api/about/public - Fetch active about sections for frontend
router.get('/public', async (req, res) => {
    const lang = req.headers['accept-language-code'] || req.query.lang || 'en';
    const fields = ['title', 'description', 'value'];
    const selectFields = fields.map(f => `${f}_${lang} as ${f}`).join(', ');

    try {
        const [rows] = await db.query(
            `SELECT *, ${selectFields} FROM about_sections WHERE active = true ORDER BY section_type, order_index ASC`
        );
        res.json(rows);
    } catch (err) {
        console.error('Failed to fetch about sections:', err);
        res.status(500).json({ error: 'Failed to fetch about sections' });
    }
});

// GET /api/about - Admin: Fetch all about sections
router.get('/', authMiddleware, async (req, res) => {
    const lang = req.headers['accept-language-code'] || req.query.lang || 'en';
    const fields = ['title', 'description', 'value'];
    const selectFields = fields.map(f => `${f}_${lang} as ${f}`).join(', ');

    try {
        const [rows] = await db.query(
            `SELECT *, ${selectFields} FROM about_sections ORDER BY section_type, order_index ASC`
        );
        res.json(rows);
    } catch (err) {
        console.error('Failed to fetch about sections:', err);
        res.status(500).json({ error: 'Failed to fetch about sections' });
    }
});

// POST /api/about - Admin: Add new about section
router.post('/', authMiddleware, async (req, res) => {
    const { section_type, title, description, icon, year, value, order_index, active } = req.body;

    if (!section_type || !title) {
        return res.status(400).json({ error: 'section_type and title are required' });
    }

    const validTypes = ['milestone', 'stat', 'commitment', 'general'];
    if (!validTypes.includes(section_type)) {
        return res.status(400).json({ error: 'Invalid section_type' });
    }

    try {
        // Auto-translate translatable fields
        const translations = await translateContent({ title, description, value });

        const id = uuidv4();
        await db.query(
            `INSERT INTO about_sections (
                id, section_type, 
                title_en, title_hi, title_mr,
                description_en, description_hi, description_mr,
                icon, year, 
                value_en, value_hi, value_mr,
                order_index, active
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                id, section_type,
                translations.en.title, translations.hi.title, translations.mr.title,
                translations.en.description, translations.hi.description, translations.mr.description,
                icon || null, year || null,
                translations.en.value, translations.hi.value, translations.mr.value,
                order_index || 0, active !== false
            ]
        );

        const [rows] = await db.query('SELECT * FROM about_sections WHERE id = ?', [id]);
        res.status(201).json({ message: 'About section created', data: rows[0] });
    } catch (err) {
        console.error('Failed to create about section:', err);
        res.status(500).json({ error: 'Failed to create about section' });
    }
});

// PUT /api/about/:id - Admin: Update about section
router.put('/:id', authMiddleware, async (req, res) => {
    const { section_type, title, description, icon, year, value, order_index, active } = req.body;

    try {
        // Auto-translate translatable fields
        const translations = await translateContent({ title, description, value });

        const [result] = await db.query(
            `UPDATE about_sections SET 
                section_type = ?, 
                title_en = ?, title_hi = ?, title_mr = ?,
                description_en = ?, description_hi = ?, description_mr = ?,
                icon = ?, year = ?, 
                value_en = ?, value_hi = ?, value_mr = ?,
                order_index = ?, active = ? 
            WHERE id = ?`,
            [
                section_type,
                translations.en.title, translations.hi.title, translations.mr.title,
                translations.en.description, translations.hi.description, translations.mr.description,
                icon || null, year || null,
                translations.en.value, translations.hi.value, translations.mr.value,
                order_index || 0, active !== false, req.params.id
            ]
        );

        if (result.affectedRows === 0) return res.status(404).json({ error: 'Section not found' });

        const [rows] = await db.query('SELECT * FROM about_sections WHERE id = ?', [req.params.id]);
        res.json({ message: 'About section updated', data: rows[0] });
    } catch (err) {
        console.error('Failed to update about section:', err);
        res.status(500).json({ error: 'Failed to update about section' });
    }
});

// DELETE /api/about/:id - Admin: Delete about section
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const [result] = await db.query('DELETE FROM about_sections WHERE id = ?', [req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Section not found' });
        res.json({ message: 'About section deleted' });
    } catch (err) {
        console.error('Failed to delete about section:', err);
        res.status(500).json({ error: 'Failed to delete about section' });
    }
});

module.exports = router;
