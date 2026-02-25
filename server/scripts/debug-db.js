const db = require('../config/db');

async function debugAll() {
    const tables = ['testimonials', 'awards', 'certificates', 'settings', 'services'];
    for (const table of tables) {
        try {
            console.log(`\n=== Table: ${table} ===`);
            const [cols] = await db.query(`SHOW COLUMNS FROM ${table}`);
            console.log('Columns:', cols.map(c => c.Field).join(', '));

            const [rows] = await db.query(`SELECT COUNT(*) as count FROM ${table}`);
            console.log('Row count:', rows[0].count);
        } catch (err) {
            console.error(`❌ Error with ${table}:`, err.message);
        }
    }
    process.exit(0);
}

debugAll();
