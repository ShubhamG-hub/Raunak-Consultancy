const db = require('../config/db');

async function syncSettings() {
    try {
        console.log('🔄 Syncing settings table...');

        await db.query(`
            CREATE TABLE IF NOT EXISTS settings (
                setting_key VARCHAR(50) PRIMARY KEY,
                setting_value TEXT NOT NULL,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);

        await db.query(`
            INSERT IGNORE INTO settings (setting_key, setting_value) 
            VALUES ('active_theme', 'professional-blue')
        `);

        console.log('✅ Settings table synced successfully.');
        process.exit(0);
    } catch (err) {
        console.error('❌ Failed to sync settings table:', err);
        process.exit(1);
    }
}

syncSettings();
