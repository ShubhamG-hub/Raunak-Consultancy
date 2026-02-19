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
    date: Joi.string().required(), // Changed to string for easier comparison
    time: Joi.string().required(),
    service_type: Joi.string().required(),
    message: Joi.string().optional().allow('')
});

const { sendWhatsApp } = require('../config/sms');


// GET /api/bookings/available-slots (Public) - Get booked slots for a date
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
        console.error('Fetch Booked Slots Error Details:', err);
        res.status(500).json({ error: 'Failed' });
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

        if (existing && existing.length > 0) {
            return res.status(409).json({ error: 'This time slot is already booked. Please choose another one.' });
        }

        const { data, error: dbError } = await supabase

            .from('bookings')
            .insert([value])
            .select();

        if (dbError) throw dbError;

        res.status(201).json({ message: 'Booking created successfully', booking: data[0] });
    } catch (err) {
        console.error('Booking Creation Error:', err);
        res.status(500).json({ error: 'Failed to create booking' });
    }
});

// GET /api/bookings (Admin Only) - Fetch all bookings with filtering
router.get('/', authMiddleware, async (req, res) => {
    try {
        // Only allow admins
        if (req.user.role !== 'admin' && req.user.role !== 'Administrator') {
            return res.status(403).json({ error: 'Access denied. Admin only.' });
        }

        const { status, search, date } = req.query;
        let query = supabase.from('bookings').select('*', { count: 'exact' });

        if (status && status !== 'All') {
            query = query.eq('status', status);
        }

        if (date) {
            query = query.eq('date', date);
        }

        if (search) {
            query = query.or(`name.ilike.%${search}%,phone.ilike.%${search}%`);
        }

        const { data, error, count } = await query.order('created_at', { ascending: false });

        if (error) throw error;

        res.json({ data, count });
    } catch (err) {
        console.error('Fetch Bookings Error:', err);
        res.status(500).json({ error: 'Failed to fetch bookings' });
    }
});

// PATCH /api/bookings/:id (Admin Only) - Update status
router.patch('/:id', authMiddleware, async (req, res) => {
    const { status } = req.body;
    try {
        if (req.user.role !== 'admin' && req.user.role !== 'Administrator') {
            return res.status(403).json({ error: 'Access denied. Admin only.' });
        }

        const { data, error } = await supabase
            .from('bookings')
            .update({ status })
            .eq('id', req.params.id)
            .select();

        if (error) {
            throw error;
        }

        if (data.length === 0) return res.status(404).json({ error: 'Booking not found' });

        const booking = data[0];

        // Trigger WhatsApp notification on relevant status changes
        if (['Pending', 'Confirmed', 'Cancelled', 'Completed'].includes(status)) {
            let msg = '';
            if (status === 'Pending') {
                msg = `⏳ *Booking on Hold*\n\nHello ${booking.name},\nYour ${booking.service_type} consultation is currently under review.\n\n📅 *Date:* ${booking.date}\n🕒 *Time:* ${booking.time}\n\nWe will notify you once it's confirmed. Thank you for your patience!`;
            } else if (status === 'Confirmed') {
                msg = `✅ *Booking Confirmed*\n\nHello ${booking.name},\nWe are pleased to confirm your ${booking.service_type} consultation.\n\n📅 *Date:* ${booking.date}\n🕒 *Time:* ${booking.time}\n\nThank you for choosing Raunak Consultancy!`;
            } else if (status === 'Cancelled') {
                msg = `❌ *Booking Cancelled*\n\nHello ${booking.name},\nWe regret to inform you that your consultation on ${booking.date} at ${booking.time} has been cancelled.\n\nPlease contact us if you wish to reschedule.`;
            } else if (status === 'Completed') {
                msg = `🏁 *Consultation Completed*\n\nHello ${booking.name},\nThank you for attending your ${booking.service_type} session today. We hope it was helpful!\n\nFeel free to reach out for further assistance.`;
            }

            if (msg) sendWhatsApp(booking.phone, msg);
        }


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
