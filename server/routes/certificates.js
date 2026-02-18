const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
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
        const { data, error } = await supabase
            .from('certificates')
            .select('*')
            .eq('active', true)
            .order('created_at', { ascending: false });

        if (error) throw error;

        res.json(data);
    } catch (err) {
        console.error('Certificate fetch error:', err);
        res.status(500).json({ error: 'Failed to fetch certificates' });
    }
});

// GET /api/certificates (Admin - All)
router.get('/', authMiddleware, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('certificates')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        res.json(data);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch certificates' });
    }
});

// POST /api/certificates (Admin)
router.post('/', authMiddleware, async (req, res) => {
    const { error, value } = certificateSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    try {
        const { data, error: dbError } = await supabase
            .from('certificates')
            .insert([value])
            .select();

        if (dbError) throw dbError;

        res.status(201).json({ message: 'Certificate added', data: data[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// DELETE /api/certificates/:id (Admin)
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const { error } = await supabase
            .from('certificates')
            .delete()
            .eq('id', req.params.id);

        if (error) throw error;

        res.json({ message: 'Certificate deleted' });
    } catch (err) {
        res.status(500).json({ error: 'Delete failed' });
    }
});

module.exports = router;
