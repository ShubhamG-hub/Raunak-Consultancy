const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');
const authMiddleware = require('../middleware/authMiddleware');
const { createNotification } = require('./notifications');
const Joi = require('joi');
const notificationService = require('../services/notificationService');

// Schema Validation
const leadSchema = Joi.object({
    name: Joi.string().required(),
    mobile: Joi.string().pattern(/^[0-9]{10,12}$/).required(),
    email: Joi.string().email().optional().allow(''),
    requirement: Joi.string().optional().allow(''),
    type: Joi.string().required(),
    status: Joi.string().valid('New', 'Contacted', 'Qualified', 'Lost', 'Closed').default('New'),
    notes: Joi.string().optional().allow('')
});

const complianceFilter = require('../middleware/complianceFilter');

// POST /api/leads (Public & Admin Manual)
router.post('/', complianceFilter, async (req, res) => {
    const { error, value } = leadSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }

    try {
        const leadId = uuidv4();
        await db.query(
            'INSERT INTO leads (id, name, mobile, email, requirement, type, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [leadId, value.name, value.mobile, value.email || null, value.requirement || null, value.type, value.status || 'New', value.notes || null]
        );

        // Create admin notification (Internal UI)
        createNotification({
            type: 'new_lead',
            title: 'New Lead',
            message: `${value.name} submitted a ${value.type} request`,
            reference_id: leadId
        });

        // Send Email Notifications (Admin & User)
        try {
            const formType = value.type === 'contact' ? 'Contact Form' : 'Service Consultation Form';
            await notificationService.sendFormSubmissionEmails(value, formType);
        } catch (mailErr) {
            console.error('[MAILER ERROR] Lead notification failed:', mailErr.message);
        }

        res.status(201).json({
            message: 'Lead submitted successfully',
            id: leadId,
            name: value.name,
            mobile: value.mobile,
            email: value.email,
            type: value.type,
            status: value.status || 'New',
            requirement: value.requirement,
            created_at: new Date()
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /api/leads (Admin Only)
router.get('/', authMiddleware, async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM leads ORDER BY created_at DESC');
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch leads' });
    }
});

// PATCH /api/leads/:id (Admin Only)
router.patch('/:id', authMiddleware, async (req, res) => {
    const { status, notes } = req.body;
    try {
        const [result] = await db.query(
            'UPDATE leads SET status = ?, notes = ? WHERE id = ?',
            [status, notes, req.params.id]
        );

        if (result.affectedRows === 0) return res.status(404).json({ error: 'Lead not found' });

        res.json({ message: 'Lead updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to update lead' });
    }
});

// PUT /api/leads/:id (Admin Only)
router.put('/:id', authMiddleware, async (req, res) => {
    const { error, value } = leadSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    try {
        const [result] = await db.query(
            'UPDATE leads SET name = ?, mobile = ?, email = ?, requirement = ?, type = ?, status = ?, notes = ? WHERE id = ?',
            [value.name, value.mobile, value.email || null, value.requirement || null, value.type, value.status || 'New', value.notes || null, req.params.id]
        );

        if (result.affectedRows === 0) return res.status(404).json({ error: 'Lead not found' });

        const [rows] = await db.query('SELECT * FROM leads WHERE id = ?', [req.params.id]);
        res.json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to update lead' });
    }
});

// DELETE /api/leads/:id (Admin Only)
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const [result] = await db.query('DELETE FROM leads WHERE id = ?', [req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Lead not found' });
        res.json({ message: 'Lead deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to delete lead' });
    }
});

module.exports = router;
