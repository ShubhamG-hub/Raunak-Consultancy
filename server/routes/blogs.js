const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');
const authMiddleware = require('../middleware/authMiddleware');
const Joi = require('joi');

const blogSchema = Joi.object({
    title: Joi.string().required(),
    slug: Joi.string().required(),
    excerpt: Joi.string().allow('', null),
    content: Joi.string().required(),
    image_url: Joi.string().uri().allow('', null),
    category: Joi.string().allow('', null),
    published: Joi.boolean().default(false)
});

// GET /api/blogs - Fetch all published blogs
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT * FROM blogs WHERE published = true ORDER BY created_at DESC'
        );

        res.json(rows);
    } catch (err) {
        console.error('Failed to fetch blogs:', err);
        res.status(500).json({ error: 'Failed to fetch blogs' });
    }
});

// GET /api/blogs/:slug - Fetch single blog by slug
router.get('/:slug', async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT * FROM blogs WHERE slug = ? AND published = true',
            [req.params.slug]
        );

        if (rows.length === 0) return res.status(404).json({ error: 'Blog not found' });
        res.json(rows[0]);
    } catch (err) {
        console.error('Failed to fetch blog:', err);
        res.status(404).json({ error: 'Blog not found' });
    }
});

// POST /api/blogs - Create blog (Admin only)
router.post('/', authMiddleware, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied' });
    }

    const { error, value } = blogSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    try {
        const { title, slug, excerpt, content, image_url, category, published } = value;
        const blogId = uuidv4();
        await db.query(
            'INSERT INTO blogs (id, title, slug, excerpt, content, image_url, category, published) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [blogId, title, slug, excerpt, content, image_url, category, published]
        );

        res.json({ id: blogId, title, slug, excerpt, content, image_url, category, published });
    } catch (err) {
        console.error('Failed to create blog:', err);
        res.status(500).json({ error: 'Failed to create blog' });
    }
});

// PUT /api/blogs/:id (Admin - Update)
router.put('/:id', authMiddleware, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied' });
    }

    const { published, title, slug, excerpt, content, image_url, category } = req.body;

    // If it's just a status toggle (published/draft)
    if (published !== undefined && !title) {
        try {
            const [result] = await db.query(
                'UPDATE blogs SET published = ? WHERE id = ?',
                [published, req.params.id]
            );
            if (result.affectedRows === 0) return res.status(404).json({ error: 'Blog not found' });
            return res.json({ message: 'Blog status updated' });
        } catch (err) {
            console.error('Blog status update error:', err);
            return res.status(500).json({ error: 'Update failed' });
        }
    }

    // Full update validation
    const { error, value } = blogSchema.validate({ title, slug, excerpt, content, image_url, category, published });
    if (error) return res.status(400).json({ error: error.details[0].message });

    try {
        const { title, slug, excerpt, content, image_url, category, published } = value;
        const [result] = await db.query(
            'UPDATE blogs SET title = ?, slug = ?, excerpt = ?, content = ?, image_url = ?, category = ?, published = ? WHERE id = ?',
            [title, slug, excerpt, content, image_url, category, published, req.params.id]
        );

        if (result.affectedRows === 0) return res.status(404).json({ error: 'Blog not found' });

        res.json({ message: 'Blog updated successfully', id: req.params.id });
    } catch (err) {
        console.error('Blog Update Error:', err);
        res.status(500).json({ error: 'Update failed' });
    }
});

// DELETE /api/blogs/:id - Delete blog (Admin only)
router.delete('/:id', authMiddleware, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied' });
    }

    try {
        const [result] = await db.query('DELETE FROM blogs WHERE id = ?', [req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Blog not found' });
        res.json({ message: 'Blog deleted successfully' });
    } catch (err) {
        console.error('Failed to delete blog:', err);
        res.status(500).json({ error: 'Failed to delete blog' });
    }
});

module.exports = router;
