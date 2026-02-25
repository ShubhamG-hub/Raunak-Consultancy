const db = require('../config/db');

async function rebuildCoreTables() {
    try {
        console.log('🔄 Rebuilding core tables...');

        const queries = [
            'SET FOREIGN_KEY_CHECKS = 0',

            'DROP TABLE IF EXISTS testimonials',
            `CREATE TABLE testimonials (
                id VARCHAR(36) NOT NULL,
                name VARCHAR(255) NOT NULL,
                content TEXT NOT NULL,
                rating INT DEFAULT 5,
                status ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

            'DROP TABLE IF EXISTS awards',
            `CREATE TABLE awards (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                description TEXT DEFAULT NULL,
                year VARCHAR(10) DEFAULT NULL,
                image_url TEXT DEFAULT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

            'DROP TABLE IF EXISTS certificates',
            `CREATE TABLE certificates (
                id VARCHAR(36) NOT NULL,
                name VARCHAR(255) NOT NULL,
                expiry_date DATE DEFAULT NULL,
                image_url TEXT NOT NULL,
                active TINYINT(1) DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

            'SET FOREIGN_KEY_CHECKS = 1'
        ];

        for (const query of queries) {
            await db.query(query);
            console.log(`✅ Executed: ${query.substring(0, 50)}...`);
        }

        console.log('🚀 Core tables rebuilt successfully.');
        process.exit(0);
    } catch (err) {
        console.error('❌ Failed to rebuild core tables:', err);
        process.exit(1);
    }
}

rebuildCoreTables();
