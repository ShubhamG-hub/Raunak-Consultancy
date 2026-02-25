const express = require('express');
const router = express.Router();

const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');
const authMiddleware = require('../middleware/authMiddleware');
const Joi = require('joi');

// Joi validation schema for bookings
const bookingSchema = Joi.object({
    name: Joi.string().required(),
    phone: Joi.string().pattern(/^[0-9]{10,12}$/).required(),
    email: Joi.string().email().optional().allow(''),
    date: Joi.string().required(),
    time: Joi.string().required(),
    service_type: Joi.string().required(),
    meeting_mode: Joi.string().valid('In-Person', 'Online').default('In-Person'),
    message: Joi.string().optional().allow('')
});

const notificationService = require('../services/notificationService');

// GET /api/bookings/booked-slots (Public) - Get booked slots for a date
router.get('/booked-slots', async (req, res) => {
    const { date } = req.query;
    if (!date) return res.status(400).json({ error: 'Date is required' });

    try {
        const [rows] = await db.query(
            'SELECT time FROM bookings WHERE date = ? AND status != "Cancelled"',
            [date]
        );

        const bookedSlots = rows.map(b => b.time);
        res.json(bookedSlots);
    } catch (err) {
        console.error('Fetch Booked Slots Error:', err);
        res.status(500).json({ error: 'Failed to fetch slots' });
    }
});

// POST /api/bookings (Public) - Create a new booking
router.post('/', async (req, res) => {
    const { error, value } = bookingSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }

    try {
        // Check if slot already booked
        const [existing] = await db.query(
            'SELECT id FROM bookings WHERE date = ? AND time = ? AND status != "Cancelled"',
            [value.date, value.time]
        );


        if (existing && existing.length > 0) {
            return res.status(409).json({ error: 'This time slot is already booked. Please choose another one.' });
        }

        const bookingId = uuidv4();
        await db.query(
            'INSERT INTO bookings (id, name, phone, email, date, time, service_type, meeting_mode, message, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [bookingId, value.name, value.phone, value.email || null, value.date, value.time, value.service_type, value.meeting_mode, value.message || null, req.body.status || 'Pending']
        );

        const booking = {
            id: bookingId,
            ...value,
            status: req.body.status || 'Pending',
            created_at: new Date()
        };

        // Send Email notifications (Admin & User)
        try {
            await notificationService.sendFormSubmissionEmails(booking, 'Meeting Booking Form');
        } catch (mailErr) {
            console.error('[MAILER ERROR] Booking notification failed:', mailErr.message);
        }

        res.status(201).json({ message: 'Booking created successfully', booking });
    } catch (err) {
        console.error('Booking Creation Error:', err);
        res.status(500).json({ error: 'Failed to create booking' });
    }
});

// GET /api/bookings (Admin Only) - Fetch all bookings with server-side filtering & pagination
router.get('/', authMiddleware, async (req, res) => {
    try {
        const { status, search, date, page = 1, limit = 10 } = req.query;
        const pageNum = Math.max(1, parseInt(page));
        const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
        const offset = (pageNum - 1) * limitNum;

        let sql = 'SELECT * FROM bookings WHERE 1=1';
        let countSql = 'SELECT COUNT(*) as count FROM bookings WHERE 1=1';
        const params = [];

        if (status && status !== 'All') {
            sql += ' AND status = ?';
            countSql += ' AND status = ?';
            params.push(status);
        }

        if (date) {
            sql += ' AND date = ?';
            countSql += ' AND date = ?';
            params.push(date);
        }

        if (search) {
            sql += ' AND (name LIKE ? OR phone LIKE ? OR email LIKE ?)';
            countSql += ' AND (name LIKE ? OR phone LIKE ? OR email LIKE ?)';
            const searchPattern = `%${search}%`;
            params.push(searchPattern, searchPattern, searchPattern);
        }

        const [countResult] = await db.query(countSql, params);
        const totalCount = countResult[0].count;

        sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
        const [rows] = await db.query(sql, [...params, limitNum, offset]);

        res.json({ data: rows, count: totalCount, page: pageNum, limit: limitNum, totalPages: Math.ceil(totalCount / limitNum) });
    } catch (err) {
        console.error('Fetch Bookings Error:', err);
        res.status(500).json({ error: 'Failed to fetch bookings' });
    }
});

// PATCH /api/bookings/:id (Admin Only) - Update status
router.patch('/:id', authMiddleware, async (req, res) => {
    const { status } = req.body;

    const validStatuses = ['Pending', 'Confirmed', 'Cancelled', 'Completed'];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    try {
        await db.query(
            'UPDATE bookings SET status = ? WHERE id = ?',
            [status, req.params.id]
        );

        const [rows] = await db.query('SELECT * FROM bookings WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Booking not found' });

        const booking = rows[0];

        // Trigger Email notification
        if (status !== 'Pending') {
            notificationService.sendBookingStatusUpdateEmail(booking, status, null).catch(e => console.warn('Email notification error:', e.message));
        }

        res.json(booking);
    } catch (err) {
        console.error('Update Booking Error:', err);
        res.status(500).json({ error: 'Failed to update booking' });
    }
});

// PUT /api/bookings/:id (Admin Only) - Full update
router.put('/:id', authMiddleware, async (req, res) => {
    const { error, value } = bookingSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    try {
        const [result] = await db.query(
            'UPDATE bookings SET name = ?, phone = ?, email = ?, date = ?, time = ?, service_type = ?, meeting_mode = ?, message = ?, status = ? WHERE id = ?',
            [value.name, value.phone, value.email || null, value.date, value.time, value.service_type, value.meeting_mode, value.message || null, req.body.status || 'Pending', req.params.id]
        );

        if (result.affectedRows === 0) return res.status(404).json({ error: 'Booking not found' });

        const [rows] = await db.query('SELECT * FROM bookings WHERE id = ?', [req.params.id]);
        res.json(rows[0]);
    } catch (err) {
        console.error('Update Booking Error:', err);
        res.status(500).json({ error: 'Failed to update booking' });
    }
});

// DELETE /api/bookings/:id (Admin Only) - Delete booking
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const [result] = await db.query('DELETE FROM bookings WHERE id = ?', [req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Booking not found' });

        res.json({ message: 'Booking deleted successfully' });
    } catch (err) {
        console.error('Delete Booking Error:', err);
        res.status(500).json({ error: 'Failed to delete booking' });
    }
});

module.exports = router;
