require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');


// Routes
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
const virtualOfficeRoutes = require('./routes/virtualOffice');
const zoomWebhookRoutes = require('./routes/zoomWebhook');
const settingsRoutes = require('./routes/settings');
const aboutRoutes = require('./routes/about');
const serviceRoutes = require('./routes/services');
const categoryRoutes = require('./routes/categories');


const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet({
    crossOriginResourcePolicy: false, // For local file access if needed
}));
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Serve Static Files (for uploads)
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Routes API
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
app.use('/api/virtual-office', virtualOfficeRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/about', aboutRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/zoom/webhook', express.raw({ type: 'application/json' }), zoomWebhookRoutes);


app.get('/', (req, res) => {
    res.json({ message: 'Financial Advisory API is running with MySQL 🚀' });
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.get('/api/test-db', async (req, res) => {
    const db = require('./config/db');
    try {
        const connection = await db.getConnection();
        connection.release();
        res.json({
            status: 'success',
            message: 'MySQL Database Connected Successfully',
            config: {
                host: process.env.DB_HOST || 'localhost',
                user: process.env.DB_USER || 'root',
                database: process.env.DB_NAME || 'portfolio_db'
            }
        });
    } catch (err) {
        res.status(500).json({
            status: 'error',
            message: 'MySQL Connection Failed',
            error: err.message,
            code: err.code,
            stack: err.stack
        });
    }
});



// Global Error Handler
app.use((err, req, res, next) => {
    const errorDetail = {
        timestamp: new Date().toISOString(),
        message: err.message,
        stack: err.stack,
        url: req.url,
        method: req.method,
        headers: req.headers,
        body: req.body
    };

    const logPath = process.env.VERCEL ? '/tmp/error.log' : path.join(__dirname, 'error.log');
    try {
        fs.appendFileSync(logPath, JSON.stringify(errorDetail, null, 2) + '\n');
    } catch (logErr) {
        console.error('Failed to write to error.log:', logErr.message);
    }

    console.error('🔴 Server Error:', errorDetail);

    res.status(500).json({
        error: 'Something went wrong!',
        message: err.message,
        sql: err.sql,
        stack: err.stack // Temporarily expose stack trace everywhere for deep debugging
    });
});

app.listen(PORT, () => {
    const logPath = process.env.VERCEL ? '/tmp/error.log' : path.join(__dirname, 'error.log');
    const startupMsg = `✅ Server started at ${new Date().toISOString()} on http://localhost:${PORT}\n`;
    try {
        fs.appendFileSync(logPath, startupMsg);
    } catch (e) { }
    console.log(`✅ Server running on http://localhost:${PORT}`);
});
