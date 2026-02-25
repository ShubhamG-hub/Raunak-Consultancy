const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');
const authMiddleware = require('../middleware/authMiddleware');

// GET /api/notifications — Latest 50 notifications
router.get('/', authMiddleware, async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT * FROM notifications ORDER BY created_at DESC LIMIT 50'
        );
        res.json(rows);
    } catch (err) {
        console.error('Failed to fetch notifications:', err);
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
});

// GET /api/notifications/unread-count — Count of unread notifications
router.get('/unread-count', authMiddleware, async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT COUNT(*) as count FROM notifications WHERE is_read = false'
        );
        res.json({ count: rows[0].count || 0 });
    } catch (err) {
        console.error('Failed to fetch unread count:', err);
        res.status(500).json({ error: 'Failed to fetch unread count' });
    }
});

// PATCH /api/notifications/read-all — Mark all as read
router.patch('/read-all', authMiddleware, async (req, res) => {
    try {
        await db.query(
            'UPDATE notifications SET is_read = true WHERE is_read = false'
        );
        res.json({ message: 'All notifications marked as read' });
    } catch (err) {
        console.error('Failed to mark all as read:', err);
        res.status(500).json({ error: 'Failed to mark all as read' });
    }
});

// PATCH /api/notifications/:id/read — Mark one as read
router.patch('/:id/read', authMiddleware, async (req, res) => {
    try {
        await db.query(
            'UPDATE notifications SET is_read = true WHERE id = ?',
            [req.params.id]
        );
        res.json({ message: 'Notification marked as read' });
    } catch (err) {
        console.error('Failed to mark notification as read:', err);
        res.status(500).json({ error: 'Failed to mark notification as read' });
    }
});

// Helper: Create a notification (exported for use in other routes)
const createNotification = async ({ type, title, message, reference_id }) => {
    try {
        const notificationId = uuidv4();
        await db.query(
            'INSERT INTO notifications (id, type, title, message, reference_id) VALUES (?, ?, ?, ?, ?)',
            [notificationId, type, title, message, reference_id]
        );
    } catch (err) {
        console.error('Error creating notification:', err);
    }
};

module.exports = router;
module.exports.createNotification = createNotification;
