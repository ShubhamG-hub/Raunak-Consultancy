const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
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

const { sendWhatsApp } = require('../config/sms');

// GET /api/bookings/booked-slots (Public) - Get booked slots for a date
router.get('/booked-slots', async (req, res) => {
    const { date } = req.query;
    if (!date) return res.status(400).json({ error: 'Date is required' });

    try {
        const { data, error } = await supabase
            .from('bookings')
            .select('time')
            .eq('date', date)
            .neq('status', 'Cancelled');

        if (error) throw error;
        const bookedSlots = data.map(b => b.time);
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
        const { data: existing, error: checkError } = await supabase
            .from('bookings')
            .select('id')
            .eq('date', value.date)
            .eq('time', value.time)
            .neq('status', 'Cancelled');

        if (checkError) throw checkError;

        if (existing && existing.length > 0) {
            return res.status(409).json({ error: 'This time slot is already booked. Please choose another one.' });
        }

        const { data, error: dbError } = await supabase
            .from('bookings')
            .insert([{ ...value, status: 'Pending' }])
            .select();

        if (dbError) throw dbError;

        const booking = data[0];

        // Send WhatsApp notification (non-blocking)
        const modeText = booking.meeting_mode === 'Online' ? '🖥️ Online (Zoom)' : '🏢 In-Person';
        const msg = `📩 *Booking Received*\n\nHello ${booking.name},\nWe've received your request for a *${booking.service_type}* consultation.\n\n📅 *Date:* ${booking.date}\n🕒 *Time:* ${booking.time}\n📍 *Mode:* ${modeText}\n\nOur team will review it and notify you once it's confirmed. Thank you!`;
        sendWhatsApp(booking.phone, msg).catch(e => console.warn('WhatsApp error:', e.message));

        res.status(201).json({ message: 'Booking created successfully', booking });
    } catch (err) {
        console.error('Booking Creation Error:', err);
        res.status(500).json({ error: 'Failed to create booking' });
    }
});

// GET /api/bookings (Admin Only) - Fetch all bookings with server-side filtering & pagination
router.get('/', authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== 'admin' && req.user.role !== 'Administrator') {
            return res.status(403).json({ error: 'Access denied. Admin only.' });
        }

        const { status, search, date, page = 1, limit = 10 } = req.query;
        const pageNum = Math.max(1, parseInt(page));
        const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
        const from = (pageNum - 1) * limitNum;
        const to = from + limitNum - 1;

        let query = supabase
            .from('bookings')
            .select('*', { count: 'exact' });

        if (status && status !== 'All') {
            query = query.eq('status', status);
        }

        if (date) {
            query = query.eq('date', date);
        }

        if (search) {
            query = query.or(`name.ilike.%${search}%,phone.ilike.%${search}%,email.ilike.%${search}%`);
        }

        const { data, error, count } = await query
            .order('created_at', { ascending: false })
            .range(from, to);

        if (error) throw error;

        res.json({ data, count, page: pageNum, limit: limitNum, totalPages: Math.ceil(count / limitNum) });
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
        if (req.user.role !== 'admin' && req.user.role !== 'Administrator') {
            return res.status(403).json({ error: 'Access denied. Admin only.' });
        }

        const { data, error } = await supabase
            .from('bookings')
            .update({ status, updated_at: new Date().toISOString() })
            .eq('id', req.params.id)
            .select();

        if (error) throw error;
        if (!data || data.length === 0) return res.status(404).json({ error: 'Booking not found' });

        const booking = data[0];

        // Trigger WhatsApp notification
        let msg = '';
        const modeText = booking.meeting_mode === 'Online' ? '🖥️ Online (Zoom)' : '🏢 In-Person';
        if (status === 'Pending') {
            msg = `⏳ *Booking on Hold*\n\nHello ${booking.name},\nYour *${booking.service_type}* consultation is currently under review.\n\n📅 *Date:* ${booking.date}\n🕒 *Time:* ${booking.time}\n📍 *Mode:* ${modeText}\n\nWe will notify you once it's confirmed.`;
        } else if (status === 'Confirmed') {
            const zoomNote = booking.meeting_mode === 'Online' ? '\n📹 *Zoom link will be shared with you shortly.*' : '';
            msg = `✅ *Booking Confirmed*\n\nHello ${booking.name},\nWe are pleased to confirm your *${booking.service_type}* consultation.\n\n📅 *Date:* ${booking.date}\n🕒 *Time:* ${booking.time}\n📍 *Mode:* ${modeText}${zoomNote}\n\nThank you for choosing Raunak Consultancy!`;
        } else if (status === 'Cancelled') {
            msg = `❌ *Booking Cancelled*\n\nHello ${booking.name},\nYour consultation on ${booking.date} at ${booking.time} has been cancelled.\n\nPlease contact us if you wish to reschedule.`;
        } else if (status === 'Completed') {
            msg = `🏁 *Consultation Completed*\n\nHello ${booking.name},\nThank you for attending your *${booking.service_type}* session today. We hope it was helpful!\n\nFeel free to reach out for further assistance.`;
        }

        if (msg) sendWhatsApp(booking.phone, msg).catch(e => console.warn('WhatsApp error:', e.message));

        res.json(booking);
    } catch (err) {
        console.error('Update Booking Error:', err);
        res.status(500).json({ error: 'Failed to update booking' });
    }
});

// DELETE /api/bookings/:id (Admin Only) - Delete booking
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== 'admin' && req.user.role !== 'Administrator') {
            return res.status(403).json({ error: 'Access denied. Admin only.' });
        }

        const { error } = await supabase
            .from('bookings')
            .delete()
            .eq('id', req.params.id);

        if (error) throw error;

        res.json({ message: 'Booking deleted successfully' });
    } catch (err) {
        console.error('Delete Booking Error:', err);
        res.status(500).json({ error: 'Failed to delete booking' });
    }
});

module.exports = router;
