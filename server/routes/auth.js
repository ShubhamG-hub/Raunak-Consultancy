const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const jwt = require('jsonwebtoken');

// Admin Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // 1. Check against Environment Variables
        const adminEmail = process.env.ADMIN_EMAIL || 'admin@raunak.com';
        const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

        console.log(`Login attempt for: ${email}`);
        console.log(`Expected (Env): ${adminEmail}`);
        // Log password hiddenly
        console.log(`Password Match: ${password === adminPassword ? 'YES' : 'NO'}`);

        if (email === adminEmail && password === adminPassword) {
            console.log('Admin login successful via Hardcoded/Env credentials');

            // Try to fetch profile from DB to get Name/Role
            const { data: admin } = await supabase
                .from('admins')
                .select('name, role, id')
                .eq('email', email)
                .single();

            const userPayload = {
                email,
                name: admin?.name || 'Admin User',
                role: admin?.role || 'Administrator',
                id: admin?.id || 'admin_env'
            };

            const token = jwt.sign(
                { id: userPayload.id, email, role: userPayload.role },
                process.env.JWT_SECRET || 'fallback_secret',
                { expiresIn: '1d' }
            );
            return res.json({ success: true, token, user: userPayload });
        }

        // 2. Option: Authenticate against Supabase Auth Users (if not hardcoded admin)
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            // 3. Fallback: Check against 'admins' table
            const { data: admin, error: dbError } = await supabase
                .from('admins')
                .select('*')
                .eq('email', email)
                .single();

            if (dbError || !admin) {
                console.log('Login failed: Not in Env, Supabase Auth, or Admins table');
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            // Verify hash for table-based admin
            if (admin.password_hash) {
                const bcrypt = require('bcryptjs');
                const isValid = await bcrypt.compare(password, admin.password_hash);
                if (isValid) {
                    const token = jwt.sign(
                        { id: admin.id, email: admin.email, role: admin.role }, // Include role
                        process.env.JWT_SECRET || 'fallback_secret',
                        { expiresIn: '1d' }
                    );
                    return res.json({ success: true, token, user: { email: admin.email, name: admin.name, role: admin.role } });
                }
            }

            console.log('Login failed: Password mismatch for DB admin');
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // If Supabase Auth succeeded
        if (data.session) {
            const token = jwt.sign(
                { id: data.user.id, email: data.user.email },
                process.env.JWT_SECRET || 'fallback_secret',
                { expiresIn: '1d' }
            );
            return res.json({ token, user: { email: data.user.email } });
        }

        return res.status(401).json({ error: 'Invalid credentials' });

    } catch (err) {
        console.error("Login Error:", err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
