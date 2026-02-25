const pool = require('./config/db');
(async () => {
    try {
        await pool.query("ALTER TABLE about_sections MODIFY COLUMN section_type ENUM('milestone', 'stat', 'commitment', 'general') NOT NULL");
        console.log('✅ Updated about_sections type successfully');
        process.exit(0);
    } catch (err) {
        console.error('❌ Migration failed:', err.message);
        process.exit(1);
    }
})();
