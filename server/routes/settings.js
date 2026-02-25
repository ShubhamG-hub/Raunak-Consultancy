const express = require('express');
const router = express.Router();
const db = require('../config/db');
const authMiddleware = require('../middleware/authMiddleware');

// GET /api/settings - Public or Private (depending on key)
router.get('/:key', async (req, res) => {
    console.log(`🔍 Fetching setting: ${req.params.key}`);
    try {
        const [rows] = await db.query('SELECT setting_value FROM settings WHERE setting_key = ?', [req.params.key]);
        if (rows.length === 0) {
            console.log(`⚠️ Setting not found: ${req.params.key}`);
            return res.status(404).json({ error: 'Setting not found' });
        }
        console.log(`✅ Found setting ${req.params.key}: ${rows[0].setting_value}`);
        res.json({ value: rows[0].setting_value });
    } catch (err) {
        console.error(`❌ Failed to fetch setting ${req.params.key}:`, err);
        res.status(500).json({ error: 'Failed to fetch setting' });
    }
});

// POST /api/settings - Admin: Update setting
router.post('/', authMiddleware, async (req, res) => {
    const { key, value } = req.body;
    if (!key || value === undefined) return res.status(400).json({ error: 'Key and value are required' });

    try {
        await db.query(
            'INSERT INTO settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?',
            [key, value, value]
        );
        res.json({ message: 'Setting updated successfully' });
    } catch (err) {
        console.error('Failed to update setting:', err);
        res.status(500).json({ error: 'Failed to update setting' });
    }
});

module.exports = router;
