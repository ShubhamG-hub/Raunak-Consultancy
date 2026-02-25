const db = require('../config/db');

async function listColumns() {
    const tables = ['testimonials', 'awards', 'certificates', 'settings'];
    for (const table of tables) {
        try {
            const [rows] = await db.query(`SHOW COLUMNS FROM ${table}`);
            const columns = rows.map(r => r.Field).join(', ');
            console.log(`${table}: [${columns}]`);
        } catch (err) {
            console.error(`${table}: ❌ Error - ${err.message}`);
        }
    }
    process.exit(0);
}

listColumns();
