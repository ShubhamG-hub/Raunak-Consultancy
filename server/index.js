require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const authRoutes = require('./routes/auth');
const leadRoutes = require('./routes/leads');
const testimonialRoutes = require('./routes/testimonials');
const certificateRoutes = require('./routes/certificates');
const galleryRoutes = require('./routes/gallery');
const claimRoutes = require('./routes/claims');
const uploadRoutes = require('./routes/upload');
const chatRoutes = require('./routes/chat');
const adminRoutes = require('./routes/admin');
const notificationRoutes = require('./routes/notifications');
const bookingRoutes = require('./routes/bookings');
const blogRoutes = require('./routes/blogs');
const awardRoutes = require('./routes/awards');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/testimonials', testimonialRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/claims', claimRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/awards', awardRoutes);

app.get('/', (req, res) => {
    res.json({ message: 'Financial Advisory API is running 🚀' });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
});
