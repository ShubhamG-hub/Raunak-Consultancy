const db = require('../config/db');

async function inspectTables() {
    const tables = ['testimonials', 'awards', 'certificates', 'settings'];
    for (const table of tables) {
        try {
            console.log(`\n--- Structure of table: ${table} ---`);
            const [rows] = await db.query(`DESCRIBE ${table}`);
            console.log(JSON.stringify(rows, null, 2));
        } catch (err) {
            console.error(`❌ Table ${table} does not exist or error:`, err.message);
        }
    }
    process.exit(0);
}

inspectTables();
