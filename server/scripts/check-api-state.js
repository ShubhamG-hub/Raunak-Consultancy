const db = require('../config/db');

async function checkSettings() {
    try {
        console.log('--- Testing settings table ---');
        const [rows] = await db.query('SELECT * FROM settings WHERE setting_key = "active_theme"');
        console.log('Rows found:', rows);

        console.log('\n--- Testing testimonials table ---');
        const [trows] = await db.query('SELECT * FROM testimonials');
        console.log('Testimonials count:', trows.length);

        console.log('\n--- Checking notifications table ---');
        try {
            const [nrows] = await db.query('SELECT * FROM notifications LIMIT 1');
            console.log('Notifications table exists.');
        } catch (err) {
            console.log('❌ Notifications table missing:', err.message);
        }

    } catch (err) {
        console.error('❌ Critical Error:', err);
    }
    process.exit(0);
}

checkSettings();
