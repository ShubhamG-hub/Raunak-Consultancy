const db = require('../config/db');

async function updateSchema() {
    try {
        console.log('Adding new columns to services table...');

        // Add details column
        await db.query(`ALTER TABLE services ADD COLUMN IF NOT EXISTS details TEXT`);

        // Add features column (stored as JSON string or comma-separated)
        await db.query(`ALTER TABLE services ADD COLUMN IF NOT EXISTS features TEXT`);

        // Add color column
        await db.query(`ALTER TABLE services ADD COLUMN IF NOT EXISTS color VARCHAR(7) DEFAULT '#3b82f6'`);

        // Add calc_id column
        await db.query(`ALTER TABLE services ADD COLUMN IF NOT EXISTS calc_id VARCHAR(50)`);

        console.log('Schema update completed successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Schema update failed:', err);
        process.exit(1);
    }
}

updateSchema();
