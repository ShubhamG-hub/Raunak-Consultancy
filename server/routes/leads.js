const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const authMiddleware = require('../middleware/authMiddleware');
const { createNotification } = require('./notifications');
const Joi = require('joi');

// Schema Validation
const leadSchema = Joi.object({
    name: Joi.string().pattern(/^[a-zA-Z\s]+$/).message('Name must contain only letters').required(),
    mobile: Joi.string().pattern(/^[0-9]{10}$/).message('Enter a valid 10-digit mobile number').required(),
    requirement: Joi.string().optional(),
    type: Joi.string().valid('consultation', 'contact', 'portfolio').default('contact'),
    notes: Joi.string().optional().allow('')
});

const complianceFilter = require('../middleware/complianceFilter');

// POST /api/leads (Public)
router.post('/', complianceFilter, async (req, res) => {
    const { error, value } = leadSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }

    try {
        const { data, error: dbError } = await supabase
            .from('leads')
            .insert([value])
            .select();

        if (dbError) {
            console.error('Supabase Error:', dbError);
            return res.status(500).json({ error: 'Failed to submit lead' });
        }

        // Create admin notification
        createNotification({
            type: 'new_lead',
            title: 'New Lead',
            message: `${value.name} submitted a ${value.type || 'contact'} request`,
            reference_id: data[0].id
        });

        res.status(201).json({ message: 'Lead submitted successfully', lead: data[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /api/leads (Admin Only)
router.get('/', authMiddleware, async (req, res) => {
    try {
        let query = supabase.from('leads').select('*').order('created_at', { ascending: false });

        // Filters could be added here

        const { data, error } = await query;

        if (error) throw error;

        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch leads' });
    }
});

module.exports = router;
