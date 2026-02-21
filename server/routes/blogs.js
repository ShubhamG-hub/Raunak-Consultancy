const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const authMiddleware = require('../middleware/authMiddleware');

// GET /api/blogs - Fetch all published blogs
router.get('/', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('blogs')
            .select('*')
            .eq('published', true)
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.json(data);
    } catch (err) {
        console.error('Failed to fetch blogs:', err);
        res.status(500).json({ error: 'Failed to fetch blogs' });
    }
});

// GET /api/blogs/:slug - Fetch single blog by slug
router.get('/:slug', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('blogs')
            .select('*')
            .eq('slug', req.params.slug)
            .eq('published', true)
            .single();

        if (error) throw error;
        res.json(data);
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

    try {
        const { title, slug, excerpt, content, image_url, category, published } = req.body;
        const { data, error } = await supabase
            .from('blogs')
            .insert([{ title, slug, excerpt, content, image_url, category, published }])
            .select()
            .single();

        if (error) throw error;
        res.json(data);
    } catch (err) {
        console.error('Failed to create blog:', err);
        res.status(500).json({ error: 'Failed to create blog' });
    }
});

// PUT /api/blogs/:id - Update blog (Admin only)
router.put('/:id', authMiddleware, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied' });
    }

    try {
        const { title, slug, excerpt, content, image_url, category, published } = req.body;
        const { data, error } = await supabase
            .from('blogs')
            .update({ title, slug, excerpt, content, image_url, category, published })
            .eq('id', req.params.id)
            .select()
            .single();

        if (error) throw error;
        res.json(data);
    } catch (err) {
        console.error('Failed to update blog:', err);
        res.status(500).json({ error: 'Failed to update blog' });
    }
});

// DELETE /api/blogs/:id - Delete blog (Admin only)
router.delete('/:id', authMiddleware, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied' });
    }

    try {
        const { error } = await supabase
            .from('blogs')
            .delete()
            .eq('id', req.params.id);

        if (error) throw error;
        res.json({ message: 'Blog deleted successfully' });
    } catch (err) {
        console.error('Failed to delete blog:', err);
        res.status(500).json({ error: 'Failed to delete blog' });
    }
});

module.exports = router;
