const express = require('express');
const router = express.Router();
const db = require('../config/db');
const jwt = require('jsonwebtoken');
const { sendWelcomeEmail } = require('../config/mail');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

/*
// Register
router.post('/register', async (req, res) => {
    const { email, password, fullName, mobile } = req.body;

    try {
        console.log(`Registration attempt for: ${email}`);

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);
        const userId = uuidv4();

        // 1. Create profile in 'profiles' table
        await db.query(
            'INSERT INTO profiles (id, full_name, mobile, email, is_first_login) VALUES (?, ?, ?, ?, ?)',
            [userId, fullName, mobile, email, true]
        );

        // Send welcome email upon successful registration
        await sendWelcomeEmail({ email, full_name: fullName }, password);

        const token = jwt.sign(
            { id: userId, email, role: 'user' },
            process.env.JWT_SECRET || 'fallback_secret',
            { expiresIn: '1d' }
        );

        return res.json({
            success: true,
            token,
            user: {
                email,
                name: fullName,
                role: 'user',
                id: userId
            }
        });

    } catch (err) {
        console.error("Registration Error:", err);
        res.status(500).json({ error: 'Server error during registration' });
    }
});
*/

// Admin/Client Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const adminEmail = process.env.ADMIN_EMAIL || 'ms.sudhirgupta@rediffmail.com';
        const adminPassword = process.env.ADMIN_PASSWORD || 'admin@1277899';

        // 1. Admin Login (Env based)
        if (email === adminEmail && password === adminPassword) {
            const [admins] = await db.query('SELECT * FROM admins WHERE email = ?', [email]);
            const admin = admins[0];

            const userPayload = {
                email,
                name: admin?.name || 'Admin User',
                role: admin?.role || 'admin',
                id: admin?.id || 'admin_env'
            };

            const token = jwt.sign(
                { id: userPayload.id, email, role: userPayload.role },
                process.env.JWT_SECRET || 'fallback_secret',
                { expiresIn: '1d' }
            );
            return res.json({ success: true, token, user: userPayload });
        }

        /*
        // 2. User Login (DB based)
        const [users] = await db.query('SELECT * FROM profiles WHERE email = ?', [email]);
        const user = users[0];

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Note: Profiles table in original schema didn't have password_hash. 
        // For a full migration, we either need a separate users table or add password_hash to profiles.
        // Given the requirement, I'll assume it's in a 'users' table or 'admins' table for now, 
        // but for public users we might need to adjust.
        // Let's assume the legacy 'admins' check covers manual accounts.

        const [manualAdmins] = await db.query('SELECT * FROM admins WHERE email = ?', [email]);
        const manualAdmin = manualAdmins[0];

        if (manualAdmin && manualAdmin.password_hash) {
            const isValid = await bcrypt.compare(password, manualAdmin.password_hash);
            if (isValid) {
                const token = jwt.sign(
                    { id: manualAdmin.id, email: manualAdmin.email, role: manualAdmin.role },
                    process.env.JWT_SECRET || 'fallback_secret',
                    { expiresIn: '1d' }
                );
                return res.json({ success: true, token, user: { email: manualAdmin.email, name: manualAdmin.name, role: manualAdmin.role } });
            }
        }

        // Handle profile first login logic if password was matched (adding password_hash to profiles for full MySQL migration)
        // Since I can't change the remote Supabase structure easily, I'll update my MySQL schema to include password_hash in profiles.
        */

        return res.status(401).json({ error: 'Invalid credentials' });

    } catch (err) {
        console.error("Login Error:", err);
        res.status(500).json({ error: 'Server error during login' });
    }
});

module.exports = router;
