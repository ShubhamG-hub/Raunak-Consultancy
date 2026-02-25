const db = require('../config/db');

async function testQueries() {
    console.log('--- Testing Testimonials Query ---');
    try {
        const [rows] = await db.query('SELECT * FROM testimonials WHERE status = "Approved" ORDER BY created_at DESC');
        console.log('✅ Testimonials query success, rows:', rows.length);
    } catch (err) {
        console.log('❌ Testimonials query failed!');
        console.log('Error Code:', err.code);
        console.log('SQL State:', err.sqlState);
        console.log('Message:', err.message);
        console.log('SQL:', err.sql);
    }

    console.log('\n--- Testing Awards Query ---');
    try {
        const [rows] = await db.query('SELECT * FROM awards ORDER BY year DESC');
        console.log('✅ Awards query success, rows:', rows.length);
    } catch (err) {
        console.log('❌ Awards query failed!');
        console.log('Message:', err.message);
    }

    console.log('\n--- Testing Settings Query ---');
    try {
        const [rows] = await db.query('SELECT setting_value FROM settings WHERE setting_key = "active_theme"');
        console.log('✅ Settings query success, rows:', rows.length);
    } catch (err) {
        console.log('❌ Settings query failed!');
        console.log('Message:', err.message);
    }

    process.exit(0);
}

testQueries();
