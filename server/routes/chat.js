const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const authMiddleware = require('../middleware/authMiddleware');
const { createNotification } = require('./notifications');
const Joi = require('joi');

// Create Session
router.post('/sessions', async (req, res) => {
    try {
        const { user_name } = req.body;
        const { data, error } = await supabase
            .from('chat_sessions')
            .insert([{ user_name, last_message: 'Started chat' }])
            .select();

        if (error) throw error;
        res.status(201).json(data[0]);
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
        const messageData = { session_id, sender, content };
        if (metadata) {
            messageData.metadata = metadata;
        }

        const { data, error } = await supabase
            .from('chat_messages')
            .insert([messageData])
            .select();

        if (error) throw error;

        // 2. Update session's last_message and updated_at
        const { error: updateError } = await supabase
            .from('chat_sessions')
            .update({ last_message: content, updated_at: new Date().toISOString() })
            .eq('id', session_id);

        if (updateError) console.error('Session Update Error:', updateError);

        // Create notification for user messages (not admin or bot)
        if (sender !== 'admin' && sender !== 'bot') {
            createNotification({
                type: 'new_chat',
                title: 'New Chat Message',
                message: `${sender === 'user' ? 'A visitor' : sender} sent a message`,
                reference_id: session_id
            });
        }

        res.status(201).json(data[0]);
    } catch (err) {
        console.error('Post Message Error:', err);
        res.status(500).json({ error: 'Failed to send message' });
    }
});

// Get Messages for Session
router.get('/messages/:sessionId', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('chat_messages')
            .select('*')
            .eq('session_id', req.params.sessionId)
            .order('created_at', { ascending: true });

        if (error) throw error;
        res.json(data);
    } catch (err) {
        console.error('Fetch Messages Error:', err);
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
});

// Admin: Get all sessions
router.get('/admin/sessions', authMiddleware, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('chat_sessions')
            .select('*')
            .order('updated_at', { ascending: false });

        if (error) throw error;
        console.log(`Admin fetched ${data.length} sessions`);
        res.json(data);
    } catch (err) {
        console.error('Admin Sessions Error:', err);
        res.status(500).json({ error: 'Failed to fetch chat sessions' });
    }
});

// Diagnostic: Get count
router.get('/debug/count', async (req, res) => {
    try {
        const { count, error } = await supabase
            .from('chat_sessions')
            .select('*', { count: 'exact', head: true });

        if (error) throw error;
        res.json({ count });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
