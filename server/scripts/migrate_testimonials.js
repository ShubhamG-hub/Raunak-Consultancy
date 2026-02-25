const db = require('../config/db');

async function migrate() {
    try {
        console.log('--- Migrating Database ---');
        await db.query('ALTER TABLE testimonials ADD COLUMN testimonial_date DATETIME NULL;');
        console.log('✅ Column testimonial_date added to testimonials table.');
        process.exit(0);
    } catch (err) {
        if (err.code === 'ER_DUP_COLUMN_NAME') {
            console.log('ℹ️ Column testimonial_date already exists.');
            process.exit(0);
        }
        console.error('❌ Migration failed:', err);
        process.exit(1);
    }
}

migrate();
