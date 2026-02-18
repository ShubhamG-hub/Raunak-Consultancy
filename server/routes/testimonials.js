const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const authMiddleware = require('../middleware/authMiddleware');
const { createNotification } = require('./notifications');
const Joi = require('joi');

const testimonialSchema = Joi.object({
    name: Joi.string().pattern(/^[a-zA-Z\s]+$/).message('Name must contain only letters').required(),
    content: Joi.string().min(10).message('Review must be at least 10 characters').required(),
    rating: Joi.number().min(1).max(5).default(5)
});

const complianceFilter = require('../middleware/complianceFilter');

// POST /api/testimonials (Public)
router.post('/', complianceFilter, async (req, res) => {
    const { error, value } = testimonialSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    try {
        console.log('📝 Attempting to insert testimonial:', value);

        const { data, error: dbError } = await supabase
            .from('testimonials')
            .insert([{ ...value, status: 'Pending' }])
            .select();

        if (dbError) {
            console.error('❌ Database Error:', dbError);
            console.error('Error details:', JSON.stringify(dbError, null, 2));
            throw dbError;
        }

        console.log('✅ Testimonial inserted successfully:', data);

        // Create admin notification
        createNotification({
            type: 'new_testimonial',
            title: 'New Testimonial',
            message: `${value.name} submitted a ${value.rating}-star review`,
            reference_id: data[0]?.id
        });

        res.status(201).json({ message: 'Testimonial submitted for approval.' });
    } catch (err) {
        console.error('❌ Server error:', err);
        res.status(500).json({
            error: 'Server error',
            details: err.message || 'Unknown error'
        });
    }
});

// GET /api/testimonials (Public - Approved Only)
router.get('/public', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('testimonials')
            .select('*')
            .eq('status', 'Approved')
            .order('created_at', { ascending: false });

        if (error) throw error;

        res.json(data);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch testimonials' });
    }
});

// GET /api/testimonials (Admin - All)
router.get('/admin', authMiddleware, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('testimonials')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        res.json(data);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch testimonials' });
    }
});

// PUT /api/testimonials/:id (Admin - Approve/Reject)
router.put('/:id', authMiddleware, async (req, res) => {
    const { status } = req.body;
    if (!['Approved', 'Rejected', 'Pending'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
    }

    try {
        const { data, error } = await supabase
            .from('testimonials')
            .update({ status })
            .eq('id', req.params.id)
            .select();

        if (error) throw error;

        res.json({ message: 'Status updated', data: data[0] });
    } catch (err) {
        res.status(500).json({ error: 'Update failed' });
    }
});

module.exports = router;
