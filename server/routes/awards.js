const express = require('express');
const router = express.Router();
const db = require('../config/db');
const authMiddleware = require('../middleware/authMiddleware');
const Joi = require('joi');
const { translateContent } = require('../services/translateService');

const awardSchema = Joi.object({
    title: Joi.string().required(),
    description: Joi.string().allow('', null),
    year: Joi.number().integer().required(),
    image_url: Joi.string().uri().required()
});

// GET /api/awards/public - Fetch all awards for public view
router.get('/public', async (req, res) => {
    const lang = req.headers['accept-language-code'] || req.query.lang || 'en';
    const fields = ['title', 'description'];
    const selectFields = fields.map(f => `${f}_${lang} as ${f}`).join(', ');

    try {
        const [rows] = await db.query(
            `SELECT *, ${selectFields} FROM awards ORDER BY year DESC`
        );
        res.json(rows);
    } catch (err) {
        console.error('Failed to fetch awards:', err);
        res.status(500).json({ error: 'Failed to fetch awards' });
    }
});

// GET /api/awards - Fetch all awards (Admin/Base)
router.get('/', async (req, res) => {
    const lang = req.headers['accept-language-code'] || req.query.lang || 'en';
    const fields = ['title', 'description'];
    const selectFields = fields.map(f => `${f}_${lang} as ${f}`).join(', ');

    try {
        const [rows] = await db.query(
            `SELECT *, ${selectFields} FROM awards ORDER BY year DESC`
        );
        res.json(rows);
    } catch (err) {
        console.error('Failed to fetch awards:', err);
        res.status(500).json({ error: 'Failed to fetch awards' });
    }
});

// POST /api/awards - Create award (Admin only)
router.post('/', authMiddleware, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied' });
    }

    const { error, value } = awardSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    try {
        const { title, description, year, image_url } = value;

        // Auto-translate translatable fields
        const translations = await translateContent({ title, description });

        const [result] = await db.query(
            `INSERT INTO awards (
                title_en, title_hi, title_mr,
                description_en, description_hi, description_mr,
                year, image_url
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                translations.en.title, translations.hi.title, translations.mr.title,
                translations.en.description, translations.hi.description, translations.mr.description,
                year, image_url
            ]
        );

        const [rows] = await db.query('SELECT * FROM awards WHERE id = ?', [result.insertId]);
        res.json(rows[0]);
    } catch (err) {
        console.error('Failed to create award:', err);
        res.status(500).json({ error: 'Failed to create award' });
    }
});

// PUT /api/awards/:id - Update award (Admin only)
router.put('/:id', authMiddleware, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied' });
    }

    const { error, value } = awardSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    try {
        const { title, description, year, image_url } = value;

        // Auto-translate translatable fields
        const translations = await translateContent({ title, description });

        await db.query(
            `UPDATE awards SET 
                title_en = ?, title_hi = ?, title_mr = ?,
                description_en = ?, description_hi = ?, description_mr = ?,
                year = ?, image_url = ? 
            WHERE id = ?`,
            [
                translations.en.title, translations.hi.title, translations.mr.title,
                translations.en.description, translations.hi.description, translations.mr.description,
                year, image_url, req.params.id
            ]
        );

        const [rows] = await db.query('SELECT * FROM awards WHERE id = ?', [req.params.id]);
        res.json(rows[0]);
    } catch (err) {
        console.error('Failed to update award:', err);
        res.status(500).json({ error: 'Failed to update award' });
    }
});

// DELETE /api/awards/:id - Delete award (Admin only)
router.delete('/:id', authMiddleware, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied' });
    }

    try {
        const [result] = await db.query('DELETE FROM awards WHERE id = ?', [req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Award not found' });
        res.json({ message: 'Award deleted successfully' });
    } catch (err) {
        console.error('Failed to delete award:', err);
        res.status(500).json({ error: 'Failed to delete award' });
    }
});

module.exports = router;
