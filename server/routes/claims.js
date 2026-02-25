const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');
const authMiddleware = require('../middleware/authMiddleware');
const Joi = require('joi');
const notificationService = require('../services/notificationService');

const claimSchema = Joi.object({
    client_name: Joi.string().required(),
    email: Joi.string().email().optional().allow(''),
    phone: Joi.string().pattern(/^[0-9]{10,12}$/).optional().allow(''),
    policy_no: Joi.string().optional().allow(''),
    type: Joi.string().required(),
    amount: Joi.number().optional().allow(''),
    description: Joi.string().optional().allow(''),
    documents: Joi.array().items(Joi.string().uri()).optional()
});

// POST /api/claims (Public & Admin Manual)
router.post('/', async (req, res) => {
    const { error, value } = claimSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    try {
        const claimId = uuidv4();
        const documents = value.documents ? JSON.stringify(value.documents) : null;

        await db.query(
            'INSERT INTO claims (id, client_name, email, phone, policy_no, type, amount, description, documents, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [claimId, value.client_name, value.email || null, value.phone || null, value.policy_no || null, value.type, value.amount || null, value.description || null, documents, value.status || 'Pending']
        );

        console.log('[DEBUG] Claim Stored Successfully:', claimId);

        // Send Email Notifications (Admin & User)
        try {
            await notificationService.sendFormSubmissionEmails(value, 'Insurance Claim Form');
        } catch (mailErr) {
            console.error('[MAILER ERROR] Claim notification failed:', mailErr.message);
        }

        res.status(201).json({
            message: 'Claim request submitted.',
            id: claimId,
            client_name: value.client_name,
            email: value.email,
            phone: value.phone,
            policy_no: value.policy_no,
            type: value.type,
            amount: value.amount,
            description: value.description,
            status: value.status || 'Pending',
            created_at: new Date()
        });
    } catch (err) {
        console.error('Claim Submission Error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /api/claims (Admin)
router.get('/', authMiddleware, async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT * FROM claims ORDER BY created_at DESC'
        );
        // Parse documents JSON
        const claims = rows.map(r => ({
            ...r,
            documents: r.documents ? JSON.parse(r.documents) : []
        }));
        res.json(claims);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Fetch failed' });
    }
});

// PUT /api/claims/:id (Admin - Update)
router.put('/:id', authMiddleware, async (req, res) => {
    const { status, admin_notes, client_name, email, phone, policy_no, type, amount, description, documents } = req.body;

    // If it's a status/notes update (from the view/process modal)
    if ((status || admin_notes) && !client_name) {
        try {
            const [result] = await db.query(
                'UPDATE claims SET status = COALESCE(?, status), admin_notes = COALESCE(?, admin_notes) WHERE id = ?',
                [status || null, admin_notes || null, req.params.id]
            );
            if (result.affectedRows === 0) return res.status(404).json({ error: 'Claim not found' });
            return res.json({ message: 'Claim updated successfully' });
        } catch (err) {
            console.error('Claim Update Error:', err);
            return res.status(500).json({ error: 'Update failed' });
        }
    }

    // Full update validation
    const { error, value } = claimSchema.validate({ client_name, email, phone, policy_no, type, amount, description, documents });
    if (error) return res.status(400).json({ error: error.details[0].message });

    try {
        const docsJson = value.documents ? JSON.stringify(value.documents) : null;
        const [result] = await db.query(
            'UPDATE claims SET client_name = ?, email = ?, phone = ?, policy_no = ?, type = ?, amount = ?, description = ?, documents = ?, status = ?, admin_notes = ? WHERE id = ?',
            [value.client_name, value.email || null, value.phone || null, value.policy_no || null, value.type, value.amount || null, value.description || null, docsJson, status || 'Pending', admin_notes || null, req.params.id]
        );

        if (result.affectedRows === 0) return res.status(404).json({ error: 'Claim not found' });

        res.json({ message: 'Claim details updated' });
    } catch (err) {
        console.error('Claim Edit Error:', err);
        res.status(500).json({ error: 'Update failed' });
    }
});

// DELETE /api/claims/:id (Admin)
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const [result] = await db.query('DELETE FROM claims WHERE id = ?', [req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Claim not found' });
        res.json({ message: 'Claim deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Delete failed' });
    }
});

module.exports = router;
