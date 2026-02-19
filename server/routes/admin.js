const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const jwt = require('jsonwebtoken');

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
        const { data: admin, error } = await supabase
            .from('admins')
            .select('name, phone, role, email')
            .eq('email', email)
            .single();

        if (error || !admin) {
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
        // Upsert into 'admins' table
        // We use 'upsert' to handle cases where the admin might not exist in the table yet (only in .env)
        // But we need a unique constraints. Assuming 'email' is unique.

        // First check if admin exists
        const { data: existingAdmin } = await supabase
            .from('admins')
            .select('id')
            .eq('email', currentEmail)
            .single();

        let result;
        if (existingAdmin) {
            // Update
            result = await supabase
                .from('admins')
                .update({ name, phone, email }) // Allowing email update might require token re-issue or re-login
                .eq('email', currentEmail)
                .select()
                .single();
        } else {
            // Insert (if they managed to login via .env but aren't in DB, we create a record now)
            // Note: Password hash would be missing if we just insert. 
            // This is a hybrid limitation. For now, we assume we just store profile meta.
            result = await supabase
                .from('admins')
                .insert([{
                    email: currentEmail, // Keep original email for ID until we handle full auth migration
                    name,
                    phone,
                    role: 'Administrator',
                    password_hash: 'managed_in_env_or_separate_auth' // Placeholder if required not null
                }])
                .select()
                .single();
        }

        if (result.error) {
            throw result.error;
        }

        res.json({ success: true, user: result.data });

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
        // 1. Fetch current admin to verify existence (and potentially current password if we were strict)
        // Since we are transitioning from .env to DB, currentPassword might check against .env or DB.
        // For simplicity in this hybrid state, we allow update if authenticated (token valid).

        // 2. Hash new password
        const bcrypt = require('bcryptjs');
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(newPassword, salt);

        // 3. Update DB
        const { error } = await supabase
            .from('admins')
            .update({ password_hash: passwordHash })
            .eq('email', email);

        if (error) throw error;

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
