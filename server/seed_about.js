const pool = require('./config/db');
const { v4: uuidv4 } = require('uuid');

const data = [
    { title: 'Hero Main Title', section_type: 'general', description: 'From 2008 to 2024: Building Trust, One Family at a Time', order_index: 0 },
    { title: 'Hero Highlight Text', section_type: 'general', description: 'Building Trust, One Family at a Time', order_index: 1 },
    { title: 'Bio Paragraph 1', section_type: 'general', description: "My journey in financial services began more than two decades ago with a simple observation: most families worked incredibly hard for their money, but their money didn't work for them. There was a massive gap between earning and strategic wealth creation.", order_index: 2 },
    { title: 'Bio Paragraph 2', section_type: 'general', description: "In 2008, I decided to bridge this gap. I set out with a mission to simplify finance and bring institutional-grade investment strategies to every household. Whether it's planning for a child's Ivy League education or building a comfortable retirement corpus, I believe every dream deserves a roadmap.", order_index: 3 },
    { title: 'Bio Paragraph 3', section_type: 'general', description: "Over the years, Raunak Consultancy has evolved into a trusted name for financial advisory. But beyond the numbers and portfolios, what drives me is the \"Peace of Mind\" I see on a parent's face when they know their family's future is secure.", order_index: 4 },
    { title: 'Advisor Name', section_type: 'general', description: 'Sudhir Mewalal Gupta', order_index: 5 },
    { title: 'Advisor Role', section_type: 'general', description: 'Financial Growth & Claims Expert', order_index: 6 },
    { title: 'Primary Focus', section_type: 'general', description: 'Wealth Creation', order_index: 7 },
    { title: 'Philosophy', section_type: 'general', description: 'Client Interest First', order_index: 8 },
];

(async () => {
    try {
        for (const item of data) {
            // Check if exists
            const [rows] = await pool.query('SELECT id FROM about_sections WHERE title = ? AND section_type = "general"', [item.title]);
            if (rows.length === 0) {
                await pool.query(
                    'INSERT INTO about_sections (id, section_type, title, description, order_index, active) VALUES (?, ?, ?, ?, ?, true)',
                    [uuidv4(), item.section_type, item.title, item.description, item.order_index]
                );
                console.log(`✅ Seeded: ${item.title}`);
            }
        }
        process.exit(0);
    } catch (err) {
        console.error('❌ Seeding failed:', err.message);
        process.exit(1);
    }
})();
