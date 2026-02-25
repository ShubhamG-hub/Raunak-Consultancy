const express = require('express');
const router = express.Router();
const db = require('../config/db');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

// Middleware to verify token and get user
const verifyToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(403).json({ error: 'No token provided' });

    jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret', (err, decoded) => {
        if (err) return res.status(401).json({ error: 'Unauthorized' });
        req.user = decoded;
        next();
    });
};

// GET /profile - Fetch admin profile
router.get('/profile', verifyToken, async (req, res) => {
    try {
        const { email } = req.user;

        // Fetch from 'admins' table
        const [rows] = await db.query(
            'SELECT name, phone, role, email FROM admins WHERE email = ?',
            [email]
        );
        const admin = rows[0];

        if (!admin) {
            // If not found in DB (e.g. using .env login only), return basic info from token/env
            return res.json({
                name: 'Admin User',
                email: email,
                phone: '',
                role: 'Administrator'
            });
        }

        res.json(admin);
    } catch (err) {
        console.error("Profile Fetch Error:", err);
        res.status(500).json({ error: 'Server error' });
    }
});

// PUT /profile - Update admin profile
router.put('/profile', verifyToken, async (req, res) => {
    const { name, phone, email } = req.body;
    const currentEmail = req.user.email;

    try {
        // First check if admin exists
        const [rows] = await db.query('SELECT id FROM admins WHERE email = ?', [currentEmail]);
        const existingAdmin = rows[0];

        if (existingAdmin) {
            // Update
            await db.query(
                'UPDATE admins SET name = ?, phone = ?, email = ? WHERE email = ?',
                [name, phone, email, currentEmail]
            );
        } else {
            // Insert
            const adminId = uuidv4();
            await db.query(
                'INSERT INTO admins (id, email, name, phone, role, password_hash) VALUES (?, ?, ?, ?, ?, ?)',
                [adminId, currentEmail, name, phone, 'Administrator', 'managed_in_env_or_separate_auth']
            );
        }

        res.json({ success: true, user: { name, phone, email } });

    } catch (err) {
        console.error("Profile Update Error:", err);
        res.status(500).json({ error: 'Failed to update profile', details: err.message || err });
    }
});

// PUT /password - Change Password & Email Notification
router.put('/password', verifyToken, async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const { email } = req.user;

    try {
        // 1. Hash new password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(newPassword, salt);

        // 2. Update DB
        await db.query(
            'UPDATE admins SET password_hash = ? WHERE email = ?',
            [passwordHash, email]
        );

        // 4. Send Email Notification with New Password
        const nodemailer = require('nodemailer');

        // Configure Transporter (using environment variables)
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        // Send Email
        await transporter.sendMail({
            from: process.env.MAIL_FROM,
            to: email, // Send to the admin's email
            subject: 'Admin Password Changed - Raunak Consultancy',
            html: `
                <h3>Your Admin Password has been changed.</h3>
                <p>Hello,</p>
                <p>This email confirms that your password for the Admin Panel was recently changed.</p>
                <p><strong>Your New Password:</strong> ${newPassword}</p>
                <p><em>Note: If you did not request this change, please contact support immediately.</em></p>
            `,
        });

        res.json({ success: true, message: 'Password updated and email sent.' });

    } catch (err) {
        console.error("Password Update Error:", err);
        res.status(500).json({ error: 'Failed to update password', details: err.message || err });
    }
});

module.exports = router;
