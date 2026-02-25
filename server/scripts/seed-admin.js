const db = require('../config/db');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

async function insertAdmin() {
    const email = 'ms.sudhirgupta@rediffmail.com';
    const password = 'admin@1277899';
    const name = 'Sudhir Gupta';

    console.log(`--- Seeding Admin (MySQL): ${email} ---`);

    try {
        const password_hash = await bcrypt.hash(password, 10);
        const adminId = uuidv4();

        // Check if exists
        const [rows] = await db.query('SELECT id FROM admins WHERE email = ?', [email]);

        if (rows.length > 0) {
            await db.query(
                'UPDATE admins SET password_hash = ?, name = ? WHERE email = ?',
                [password_hash, name, email]
            );
            console.log('Admin updated successfully!');
        } else {
            await db.query(
                'INSERT INTO admins (id, email, password_hash, name, role) VALUES (?, ?, ?, ?, ?)',
                [adminId, email, password_hash, name, 'Administrator']
            );
            console.log('Admin created successfully!');
        }
    } catch (err) {
        console.error('Fatal error:', err.message);
    }
    process.exit(0);
}

insertAdmin();
