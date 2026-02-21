const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const jwt = require('jsonwebtoken');
const { sendWelcomeEmail } = require('../config/mail');

// Register
router.post('/register', async (req, res) => {
    const { email, password, fullName, mobile } = req.body;

    try {
        console.log(`Registration attempt for: ${email}`);

        // 1. Create user in Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
        });

        if (authError) {
            return res.status(400).json({ error: authError.message });
        }

        if (authData.user) {
            // 2. Create profile in 'profiles' table
            const { error: profileError } = await supabase
                .from('profiles')
                .insert([
                    {
                        id: authData.user.id,
                        full_name: fullName,
                        mobile: mobile,
                        email: email
                    }
                ]);

            if (profileError) {
                console.error("Profile Creation Error:", profileError);
            } else {
                // Send welcome email upon successful registration
                await sendWelcomeEmail({ email, full_name: fullName }, password);
            }

            const token = jwt.sign(
                { id: authData.user.id, email, role: 'user' },
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
                    id: authData.user.id
                }
            });
        }

        return res.status(400).json({ error: 'Registration failed' });

    } catch (err) {
        console.error("Registration Error:", err);
        res.status(500).json({ error: 'Server error during registration' });
    }
});

// Admin/Client Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // 1. Check against Environment Variables
        const adminEmail = process.env.ADMIN_EMAIL || 'ms.sudhirgupta@rediffmail.com';
        const adminPassword = process.env.ADMIN_PASSWORD || 'admin@1277899';

        if (email === adminEmail && password === adminPassword) {
            const { data: admin } = await supabase
                .from('admins')
                .select('name, role, id')
                .eq('email', email)
                .single();

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

        // 2. Authenticate against Supabase Auth Users
        console.log(`Login attempt for: ${email}`);
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            console.log("Supabase Auth Error:", error.message);
            // Check against 'admins' table (legacy/manual)
            const { data: admin, error: dbError } = await supabase
                .from('admins')
                .select('*')
                .eq('email', email)
                .single();

            if (dbError || !admin) {
                console.log("Not an admin or DB error:", dbError?.message);
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            if (admin.password_hash) {
                const bcrypt = require('bcryptjs');
                const isValid = await bcrypt.compare(password, admin.password_hash);
                if (isValid) {
                    console.log("Login successful via legacy admin table");
                    const token = jwt.sign(
                        { id: admin.id, email: admin.email, role: admin.role },
                        process.env.JWT_SECRET || 'fallback_secret',
                        { expiresIn: '1d' }
                    );
                    return res.json({ success: true, token, user: { email: admin.email, name: admin.name, role: admin.role } });
                }
            }
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // 3. Login successful - Fetch profile or Admin record
        if (data.session) {
            console.log("Supabase Auth successful, checking role/profile...");
            // Check if Admin
            const { data: admin } = await supabase
                .from('admins')
                .select('name, role')
                .eq('email', data.user.email)
                .single();

            if (admin) {
                console.log("User is an admin (Supabase Auth)");
                const token = jwt.sign(
                    { id: data.user.id, email: data.user.email, role: admin.role },
                    process.env.JWT_SECRET || 'fallback_secret',
                    { expiresIn: '1d' }
                );
                return res.json({ token, user: { email: data.user.email, name: admin.name, role: admin.role } });
            }

            // Check if User Profile
            console.log("Checking user profile in 'profiles' table for ID:", data.user.id);
            const { data: profile, error: profileErr } = await supabase
                .from('profiles')
                .select('full_name, is_first_login')
                .eq('id', data.user.id)
                .single();

            if (profileErr) console.log("Profile fetch error:", profileErr.message);

            // Handle first login welcome email
            if (profile && profile.is_first_login) {
                console.log("First login detected for user:", data.user.email);
                await sendWelcomeEmail({ email: data.user.email, full_name: profile.full_name }, password);

                // Toggle is_first_login to false
                await supabase
                    .from('profiles')
                    .update({ is_first_login: false })
                    .eq('id', data.user.id);
            }

            const userRole = 'user';
            const token = jwt.sign(
                { id: data.user.id, email: data.user.email, role: userRole },
                process.env.JWT_SECRET || 'fallback_secret',
                { expiresIn: '1d' }
            );
            return res.json({ token, user: { email: data.user.email, name: profile?.full_name || data.user.email, role: userRole } });
        }

        console.log("Login failed: session not found");
        return res.status(401).json({ error: 'Invalid credentials' });

    } catch (err) {
        console.error("Login Error:", err);
        res.status(500).json({ error: 'Server error during login' });
    }
});

module.exports = router;
