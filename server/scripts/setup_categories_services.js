const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');

async function runMigration() {
    try {
        console.log('Starting migration...');

        // 1. Create categories table
        console.log('Creating categories table...');
        await db.query(`
            CREATE TABLE IF NOT EXISTS categories (
                id VARCHAR(36) PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                slug VARCHAR(255) UNIQUE NOT NULL,
                icon VARCHAR(100),
                show_on_homepage TINYINT(1) DEFAULT 0,
                display_order INT DEFAULT 0,
                is_active TINYINT(1) DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `);

        // 2. Drop existing services and recreate with new schema
        console.log('Updating services table...');
        await db.query('SET FOREIGN_KEY_CHECKS = 0');
        await db.query('DROP TABLE IF EXISTS services');
        await db.query(`
            CREATE TABLE services (
                id VARCHAR(36) PRIMARY KEY,
                category_id VARCHAR(36),
                title VARCHAR(255) NOT NULL,
                slug VARCHAR(255) UNIQUE NOT NULL,
                short_description TEXT,
                full_description TEXT,
                benefits JSON,
                features JSON,
                is_active TINYINT(1) DEFAULT 1,
                display_order INT DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `);
        await db.query('SET FOREIGN_KEY_CHECKS = 1');

        console.log('Tables created. Seeding data...');

        // Define Categories and Services from prompt
        const data = [
            {
                name: 'Insurance Plans',
                slug: 'insurance-plans',
                icon: 'Shield',
                services: [
                    'Retirement plan', 'Education plan', 'Marriage plan',
                    'Health Mediclaim Plan', 'Pension plan', 'Business Insurance',
                    'Term Insurance', 'Endowment Plans', 'Whole Life Plans'
                ]
            },
            {
                name: 'Investment & Wealth Building',
                slug: 'investment-wealth',
                icon: 'TrendingUp',
                services: [
                    'Mutual Fund / SIP Plan', 'Fixed Deposit Plan',
                    'Wealth Creation Planning', 'Tax Saving Investment Plans'
                ]
            },
            {
                name: 'Financial Planning Services',
                slug: 'financial-planning',
                icon: 'Calculator',
                services: [
                    'Complete Financial Planning', 'Scientific Financial Planning',
                    'Adequate Financial Planning', 'Goal-Based Financial Planning',
                    'Retirement Planning', 'Child Future Planning',
                    'Risk Management Planning', 'Tax Planning'
                ]
            },
            {
                name: 'Policy Support & Services',
                slug: 'policy-support',
                icon: 'FileText',
                services: [
                    'New Policy Registration', 'Policy Revival', 'Loan on Policy',
                    'Policy Maturity Claim', 'Policy Death Claim', 'Policy Branch Change',
                    'Policy Address Change', 'Change in Premium Mode', 'Change in Nomination',
                    'LIC Premium Reminder Service', 'LIC Policy Recent Status',
                    'LIC Policy Tax Certificate', 'Mediclaim Information Assistance'
                ]
            },
            {
                name: 'Business & Corporate Services',
                slug: 'business-corporate',
                icon: 'Briefcase',
                services: [
                    'Business Insurance Planning', 'Keyman Insurance',
                    'Partnership Insurance', 'Group Insurance Policies'
                ]
            }
        ];

        for (const [catIndex, cat] of data.entries()) {
            const catId = uuidv4();
            await db.query(
                `INSERT INTO categories (id, name, slug, icon, show_on_homepage, display_order) VALUES (?, ?, ?, ?, ?, ?)`,
                [catId, cat.name, cat.slug, cat.icon, 1, catIndex]
            );

            for (const [servIndex, servTitle] of cat.services.entries()) {
                const servId = uuidv4();
                // Simple slug generation
                let servSlug = servTitle.toLowerCase()
                    .replace(/&/g, 'and')
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/(^-|-$)/g, '');

                // Ensure uniqueness by appending part of UUID if needed, 
                // but for seeding we'll trust the names are unique enough per category

                await db.query(
                    `INSERT INTO services (id, category_id, title, slug, short_description, full_description, benefits, features, display_order) 
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        servId, catId, servTitle, servSlug,
                        `Expert ${servTitle} for your financial needs.`,
                        `Get comprehensive details and support for ${servTitle}. Our experts ensure you get the best advice and hassle-free processing.`,
                        JSON.stringify(['Expert Advice', 'Fast Processing', 'Dedicated Support']),
                        JSON.stringify(['Comprehensive Coverage', 'Transparent Process', 'Client-Centric Approach']),
                        servIndex
                    ]
                );
            }
        }

        console.log('Migration and Seeding successful!');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

runMigration();
