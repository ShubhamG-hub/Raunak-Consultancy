const express = require('express');
const router = express.Router();
const db = require('../config/db');
const authMiddleware = require('../middleware/authMiddleware');
const fs = require('fs');
const path = require('path');

const logPath = process.env.VERCEL ? '/tmp/error.log' : path.join(__dirname, '../error.log');

const logToFile = (msg) => {
    try {
        fs.appendFileSync(logPath, `[${new Date().toISOString()}] ${msg}\n`);
    } catch (e) { }
};


console.log('📝 Settings route initialized');


// Default settings when DB is unavailable
const DEFAULT_SETTINGS = {
    active_theme: 'oceanBlue',
    is_dark: 'false',
};

// GET /api/settings/:key - Public or Private (depending on key)
router.get('/:key', async (req, res) => {
    const key = req.params.key;
    logToFile(`🔍 [GET /api/settings/${key}] Fetching setting...`);
    try {
        if (!db) {
            throw new Error('Database object is undefined');
        }
        const [rows] = await db.query('SELECT setting_value FROM settings WHERE setting_key = ?', [key]);
        if (rows.length === 0) {
            // Return default if we have one, otherwise 404
            if (DEFAULT_SETTINGS[key] !== undefined) {
                logToFile(`ℹ️ [GET /api/settings/${key}] Not found in DB, using default`);
                return res.json({ value: DEFAULT_SETTINGS[key] });
            }
            logToFile(`⚠️ [GET /api/settings/${key}] Not found`);
            return res.status(404).json({ error: 'Setting not found' });
        }
        logToFile(`✅ [GET /api/settings/${key}] Found: ${rows[0].setting_value}`);
        res.json({ value: rows[0].setting_value });
    } catch (err) {
        logToFile(`🔴 [GET /api/settings/${key}] Error: ${err.message}`);

        console.error(`🔴 [GET /api/settings/${key}] Error:`, {
            message: err.message,
            stack: err.stack,
            sql: err.sql
        });

        // Return a default instead of crashing with 500
        if (DEFAULT_SETTINGS[key] !== undefined) {
            console.log(`ℹ️ [GET /api/settings/${key}] Returning default value: ${DEFAULT_SETTINGS[key]}`);
            return res.json({ value: DEFAULT_SETTINGS[key] });
        }
        res.status(404).json({ error: 'Setting not found' });
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
        console.error('Failed to update setting (DB may be unavailable):', err.message);
        // Respond with success anyway since we store in localStorage client-side
        res.json({ message: 'Setting saved locally (DB unavailable)' });
    }
});

module.exports = router;
