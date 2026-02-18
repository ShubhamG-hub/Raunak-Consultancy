const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const authMiddleware = require('../middleware/authMiddleware');

// GET /api/notifications — Latest 50 notifications
router.get('/', authMiddleware, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(50);

        if (error) throw error;
        res.json(data);
    } catch (err) {
        console.error('Failed to fetch notifications:', err);
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
});

// GET /api/notifications/unread-count — Count of unread notifications
router.get('/unread-count', authMiddleware, async (req, res) => {
    try {
        const { count, error } = await supabase
            .from('notifications')
            .select('*', { count: 'exact', head: true })
            .eq('read', false);

        if (error) throw error;
        res.json({ count: count || 0 });
    } catch (err) {
        console.error('Failed to fetch unread count:', err);
        res.status(500).json({ error: 'Failed to fetch unread count' });
    }
});

// PATCH /api/notifications/read-all — Mark all as read
router.patch('/read-all', authMiddleware, async (req, res) => {
    try {
        const { error } = await supabase
            .from('notifications')
            .update({ read: true })
            .eq('read', false);

        if (error) throw error;
        res.json({ message: 'All notifications marked as read' });
    } catch (err) {
        console.error('Failed to mark all as read:', err);
        res.status(500).json({ error: 'Failed to mark all as read' });
    }
});

// PATCH /api/notifications/:id/read — Mark one as read
router.patch('/:id/read', authMiddleware, async (req, res) => {
    try {
        const { error } = await supabase
            .from('notifications')
            .update({ read: true })
            .eq('id', req.params.id);

        if (error) throw error;
        res.json({ message: 'Notification marked as read' });
    } catch (err) {
        console.error('Failed to mark notification as read:', err);
        res.status(500).json({ error: 'Failed to mark notification as read' });
    }
});

// Helper: Create a notification (exported for use in other routes)
const createNotification = async ({ type, title, message, reference_id }) => {
    try {
        const { error } = await supabase
            .from('notifications')
            .insert([{ type, title, message, reference_id }]);

        if (error) {
            console.error('Failed to create notification:', error);
        }
    } catch (err) {
        console.error('Error creating notification:', err);
    }
};

module.exports = router;
module.exports.createNotification = createNotification;
