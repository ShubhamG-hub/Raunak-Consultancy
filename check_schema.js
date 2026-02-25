const mysql = require('mysql2/promise');
require('dotenv').config({ path: './server/.env' });

(async () => {
    try {
        const conn = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });

        const tables = ['leads', 'testimonials', 'claims', 'bookings'];
        for (const table of tables) {
            try {
                const [cols] = await conn.query(`DESCRIBE ${table}`);
                console.log(`${table.toUpperCase()}:`, cols.map(c => c.Field));
            } catch (err) {
                console.log(`${table.toUpperCase()}: Table not found or error: ${err.message}`);
            }
        }
        await conn.end();
    } catch (err) {
        console.error('Connection failed:', err.message);
    }
})();
