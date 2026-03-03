const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');
const authMiddleware = require('../middleware/authMiddleware');
const notificationService = require('../services/notificationService');
const Joi = require('joi');
const { createNotification } = require('./notifications');
const { translateContent } = require('../services/translateService');

const testimonialSchema = Joi.object({
    name: Joi.string().pattern(/^[a-zA-Z\s]+$/).message('Name must contain only letters').required(),
    email: Joi.string().email().required(),
    content: Joi.string().min(10).message('Review must be at least 10 characters').required(),
    rating: Joi.number().min(1).max(5).default(5),
    testimonial_date: Joi.date().optional().allow(null, '')
});

const complianceFilter = require('../middleware/complianceFilter');

// POST /api/testimonials (Public)
router.post('/', complianceFilter, async (req, res) => {
    const { error, value } = testimonialSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    try {
        // Auto-translate translatable fields
        const translations = await translateContent({ content: value.content });

        const testimonialId = uuidv4();
        const tDate = value.testimonial_date || new Date();
        await db.query(
            `INSERT INTO testimonials (
                id, name, email, 
                content_en, content_hi, content_mr, 
                rating, status, testimonial_date
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                testimonialId, value.name, value.email,
                translations.en.content, translations.hi.content, translations.mr.content,
                value.rating, 'Pending', tDate
            ]
        );

        console.log('✅ Testimonial inserted successfully:', testimonialId);

        // Create admin notification (Internal UI)
        createNotification({
            type: 'new_testimonial',
            title: 'New Testimonial',
            message: `${value.name} submitted a ${value.rating}-star review`,
            reference_id: testimonialId
        });

        // Send Email Notifications (Admin & User)
        try {
            await notificationService.sendFormSubmissionEmails(value, 'Testimonial Submission Form');
        } catch (mailErr) {
            console.error('[MAILER ERROR] Testimonial notification failed:', mailErr.message);
        }

        res.status(201).json({ message: 'Testimonial submitted for approval.' });
    } catch (err) {
        console.error('❌ Server error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /api/testimonials (Public - Approved Only)
router.get('/public', async (req, res) => {
    const lang = req.headers['accept-language-code'] || req.query.lang || 'en';

    try {
        const [rows] = await db.query(
            `SELECT *, content_${lang} as content FROM testimonials WHERE status = "Approved" ORDER BY created_at DESC`
        );
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch testimonials' });
    }
});

// GET /api/testimonials (Admin - All)
router.get('/', authMiddleware, async (req, res) => {
    const lang = req.headers['accept-language-code'] || req.query.lang || 'en';

    try {
        const [rows] = await db.query(
            `SELECT *, content_${lang} as content FROM testimonials ORDER BY created_at DESC`
        );
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch testimonials' });
    }
});

// POST /api/testimonials/admin (Admin - Create Pre-approved)
router.post('/admin', authMiddleware, async (req, res) => {
    const { error, value } = testimonialSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    try {
        // Auto-translate translatable fields
        const translations = await translateContent({ content: value.content });

        const testimonialId = uuidv4();
        const tDate = value.testimonial_date || new Date();
        await db.query(
            `INSERT INTO testimonials (
                id, name, 
                content_en, content_hi, content_mr, 
                rating, status, testimonial_date
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                testimonialId, value.name,
                translations.en.content, translations.hi.content, translations.mr.content,
                value.rating, 'Approved', tDate
            ]
        );

        res.status(201).json({
            message: 'Testimonial created successfully.',
            data: { id: testimonialId, ...value, status: 'Approved', created_at: new Date(), testimonial_date: tDate }
        });
    } catch (err) {
        console.error('❌ Server error:', err);
        res.status(500).json({ error: 'Failed to create testimonial' });
    }
});

// PUT /api/testimonials/:id (Admin - Update)
router.put('/:id', authMiddleware, async (req, res) => {
    const { status, name, content, rating, email, testimonial_date } = req.body;

    // If only status is provided, update only status
    if (status && !name && !content) {
        try {
            const [result] = await db.query(
                'UPDATE testimonials SET status = ? WHERE id = ?',
                [status, req.params.id]
            );
            if (result.affectedRows === 0) return res.status(404).json({ error: 'Testimonial not found' });
            return res.json({ message: 'Status updated' });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ error: 'Status update failed' });
        }
    }

    // Full update validation
    const { error, value } = testimonialSchema.validate({ name, content, rating, email, testimonial_date });
    if (error) return res.status(400).json({ error: error.details[0].message });

    try {
        // Auto-translate translatable fields
        const translations = await translateContent({ content: value.content });

        const tDate = value.testimonial_date || new Date();
        const [result] = await db.query(
            `UPDATE testimonials SET 
                name = ?, email = ?, 
                content_en = ?, content_hi = ?, content_mr = ?, 
                rating = ?, status = ?, testimonial_date = ? 
            WHERE id = ?`,
            [
                value.name, value.email || null,
                translations.en.content, translations.hi.content, translations.mr.content,
                value.rating, status || 'Approved', tDate, req.params.id
            ]
        );

        if (result.affectedRows === 0) return res.status(404).json({ error: 'Testimonial not found' });

        res.json({
            message: 'Testimonial updated',
            data: { id: req.params.id, ...value, status: status || 'Approved', testimonial_date: tDate }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Update failed' });
    }
});

// DELETE /api/testimonials/:id (Admin)
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const [result] = await db.query('DELETE FROM testimonials WHERE id = ?', [req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Testimonial not found' });
        res.json({ message: 'Testimonial deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Delete failed' });
    }
});

module.exports = router;
