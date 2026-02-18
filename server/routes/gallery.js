const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const authMiddleware = require('../middleware/authMiddleware');
const Joi = require('joi');

const gallerySchema = Joi.object({
    title: Joi.string().required(),
    image_url: Joi.string().uri().required(),
    category: Joi.string().valid('Events', 'Office', 'Clients', 'Awards', 'Other').default('Other'),
    active: Joi.boolean().default(true)
});

// GET /api/gallery/public (Public - Active Only)
router.get('/public', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('gallery')
            .select('*')
            .eq('active', true)
            .order('created_at', { ascending: false });

        if (error) throw error;

        res.json(data);
    } catch (err) {
        console.error('Gallery fetch error:', err);
        res.status(500).json({ error: 'Failed to fetch gallery' });
    }
});

// GET /api/gallery (Admin - All)
router.get('/', authMiddleware, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('gallery')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        res.json(data);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch gallery' });
    }
});

// POST /api/gallery (Admin)
router.post('/', authMiddleware, async (req, res) => {
    const { error, value } = gallerySchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    try {
        const { data, error: dbError } = await supabase
            .from('gallery')
            .insert([value])
            .select();

        if (dbError) throw dbError;

        res.status(201).json({ message: 'Gallery image added', data: data[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// PUT /api/gallery/:id (Admin - Toggle active)
router.put('/:id', authMiddleware, async (req, res) => {
    const { active } = req.body;

    try {
        const { data, error } = await supabase
            .from('gallery')
            .update({ active })
            .eq('id', req.params.id)
            .select();

        if (error) throw error;

        res.json({ message: 'Gallery updated', data: data[0] });
    } catch (err) {
        res.status(500).json({ error: 'Update failed' });
    }
});

// DELETE /api/gallery/:id (Admin)
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const { error } = await supabase
            .from('gallery')
            .delete()
            .eq('id', req.params.id);

        if (error) throw error;

        res.json({ message: 'Gallery image deleted' });
    } catch (err) {
        res.status(500).json({ error: 'Delete failed' });
    }
});

module.exports = router;
