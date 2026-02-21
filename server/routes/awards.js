const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const authMiddleware = require('../middleware/authMiddleware');

// GET /api/awards - Fetch all awards
router.get('/', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('awards')
            .select('*')
            .order('year', { ascending: false });

        if (error) throw error;
        res.json(data);
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

    try {
        const { title, description, year, image_url } = req.body;
        const { data, error } = await supabase
            .from('awards')
            .insert([{ title, description, year, image_url }])
            .select()
            .single();

        if (error) throw error;
        res.json(data);
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

    try {
        const { title, description, year, image_url } = req.body;
        const { data, error } = await supabase
            .from('awards')
            .update({ title, description, year, image_url })
            .eq('id', req.params.id)
            .select()
            .single();

        if (error) throw error;
        res.json(data);
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
        const { error } = await supabase
            .from('awards')
            .delete()
            .eq('id', req.params.id);

        if (error) throw error;
        res.json({ message: 'Award deleted successfully' });
    } catch (err) {
        console.error('Failed to delete award:', err);
        res.status(500).json({ error: 'Failed to delete award' });
    }
});

module.exports = router;
