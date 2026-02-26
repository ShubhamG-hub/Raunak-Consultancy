const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');

async function runMigration() {
    try {
        console.log('Starting Business Provisions migration...');

        const categoryData = {
            name: 'Business Provisions',
            slug: 'business-provisions',
            icon: 'Briefcase',
            description: 'Business provisions function as a valuable financial safeguard for businesses, offering protection against unforeseen losses and liabilities.',
            show_on_homepage: 1,
            display_order: 5 // Adding it as the 6th category
        };

        const services = [
            'Creating Non-Attachable Trust',
            'Retaining Key Person\'s Expertise',
            'Buy – Sell Agreement',
            'Employee Retention',
            'Smart Business Exit Plan',
            'Business Continuation',
            'Pension Planning for Directors & Employees',
            'Securing Business Liabilities',
            'Succession / Legacy (Wealth)',
            'Contingent / Professional Liabilities',
            'Risks Associated with EXIM Trade',
            'Disruption Risks',
            'Charitable Legacy Creation'
        ];

        // 1. Insert Category
        const catId = uuidv4();
        await db.query(
            `INSERT INTO categories (id, name, slug, icon, description, show_on_homepage, display_order) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [catId, categoryData.name, categoryData.slug, categoryData.icon, categoryData.description, categoryData.show_on_homepage, categoryData.display_order]
        );
        console.log(`Created category: ${categoryData.name}`);

        // 2. Insert Services
        for (const [index, title] of services.entries()) {
            const servId = uuidv4();
            const slug = title.toLowerCase()
                .replace(/ – /g, '-') // Handle en dash
                .replace(/&/g, 'and')
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '');

            await db.query(
                `INSERT INTO services (id, category_id, title, slug, short_description, full_description, benefits, features, display_order) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    servId, catId, title, slug,
                    `Comprehensive ${title} solutions for your business.`,
                    `Specialized support for ${title}. We help businesses protect their assets and ensure long-term stability with tailored provisions.`,
                    JSON.stringify(['Business Security', 'Strategic Planning', 'Expert Assistance']),
                    JSON.stringify(['Tailored Solutions', 'Risk Mitigation', 'Long-term Growth']),
                    index
                ]
            );
            console.log(`Created service: ${title}`);
        }

        console.log('Business Provisions Seeding successful!');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

runMigration();
