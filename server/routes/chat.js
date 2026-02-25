const express = require('express');
const router = express.Router();
const db = require('../config/db');
const authMiddleware = require('../middleware/authMiddleware');
const { createNotification } = require('./notifications');

// Create Session
router.post('/sessions', async (req, res) => {
    try {
        const { user_name } = req.body;
        const [result] = await db.query(
            'INSERT INTO chat_sessions (user_name, last_message) VALUES (?, ?)',
            [user_name || 'Anonymous', 'Started chat']
        );

        const [rows] = await db.query('SELECT * FROM chat_sessions WHERE id = ?', [result.insertId]);
        res.status(201).json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to create chat session' });
    }
});

// Post Message
router.post('/messages', async (req, res) => {
    try {
        const { session_id, sender, content, metadata } = req.body;

        // 1. Insert message
        const metadataStr = metadata ? JSON.stringify(metadata) : null;
        await db.query(
            'INSERT INTO chat_messages (session_id, sender, content, metadata) VALUES (?, ?, ?, ?)',
            [session_id, sender, content, metadataStr]
        );

        // 2. Update session
        await db.query(
            'UPDATE chat_sessions SET last_message = ? WHERE id = ?',
            [content, session_id]
        );

        // Create notification for user messages (not admin or bot)
        if (sender !== 'admin' && sender !== 'bot') {
            createNotification({
                type: 'new_chat',
                title: 'New Chat Message',
                message: `${sender === 'user' ? 'A visitor' : sender} sent a message`,
                reference_id: String(session_id)
            });
        }

        res.status(201).json({ session_id, sender, content, metadata });
    } catch (err) {
        console.error('Post Message Error:', err);
        res.status(500).json({ error: 'Failed to send message' });
    }
});

// Get Messages for Session
router.get('/messages/:sessionId', async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT * FROM chat_messages WHERE session_id = ? ORDER BY created_at ASC',
            [req.params.sessionId]
        );

        const messages = rows.map(m => ({
            ...m,
            metadata: m.metadata ? JSON.parse(m.metadata) : null
        }));

        res.json(messages);
    } catch (err) {
        console.error('Fetch Messages Error:', err);
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
});

// Admin: Get all sessions
router.get('/admin/sessions', authMiddleware, async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT * FROM chat_sessions ORDER BY updated_at DESC'
        );
        res.json(rows);
    } catch (err) {
        console.error('Admin Sessions Error:', err);
        res.status(500).json({ error: 'Failed to fetch chat sessions' });
    }
});

module.exports = router;
