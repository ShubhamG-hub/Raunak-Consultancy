const db = require('../config/db');

async function run() {
    try {
        const sql = `CREATE TABLE IF NOT EXISTS about_sections (
            id VARCHAR(36) PRIMARY KEY,
            section_type ENUM('milestone', 'stat', 'commitment') NOT NULL,
            title VARCHAR(255) NOT NULL,
            description TEXT,
            icon VARCHAR(100) DEFAULT NULL,
            year VARCHAR(10) DEFAULT NULL,
            value VARCHAR(100) DEFAULT NULL,
            order_index INT DEFAULT 0,
            active BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )`;

        await db.query(sql);
        console.log('about_sections table created successfully');
        process.exit(0);
    } catch (e) {
        console.error('Error:', e.message);
        process.exit(1);
    }
}

run();
