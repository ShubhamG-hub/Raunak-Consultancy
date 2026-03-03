require('dotenv').config();
const pool = require('../config/db');
const translateService = require('../services/translateService');

const tables = {
    categories: ['name', 'description'],
    services: ['title', 'short_description', 'full_description', 'features'],
    blogs: ['title', 'content', 'excerpt', 'meta_title', 'meta_description'],
    awards: ['title', 'description', 'organization'],
    testimonials: ['content'],
    certificates: ['title', 'issued_by'],
    gallery: ['title'],
    about_sections: ['content']
};

const bulkTranslate = async () => {
    console.log('🚀 Starting bulk translation...');

    for (const [table, columns] of Object.entries(tables)) {
        console.log(`\n📄 Processing table: ${table}`);

        try {
            const [rows] = await pool.query(`SELECT * FROM ${table}`);
            console.log(`Found ${rows.length} rows.`);

            for (const row of rows) {
                const updates = {};
                let needsUpdate = false;

                for (const col of columns) {
                    const enVal = row[`${col}_en`] || row[col];
                    const hiVal = row[`${col}_hi`];
                    const mrVal = row[`${col}_mr`];

                    if (enVal && (!hiVal || !mrVal)) {
                        console.log(`   Translating field "${col}" for ID ${row.id}...`);
                        const translations = await translateService.translateText(enVal, 'en');

                        if (!hiVal) {
                            updates[`${col}_hi`] = translations.hi;
                            needsUpdate = true;
                        }
                        if (!mrVal) {
                            updates[`${col}_mr`] = translations.mr;
                            needsUpdate = true;
                        }

                        // Also ensure _en is populated if it was empty
                        if (!row[`${col}_en`]) {
                            updates[`${col}_en`] = enVal;
                            needsUpdate = true;
                        }
                    }
                }

                if (needsUpdate) {
                    const setClause = Object.keys(updates).map(k => `${k} = ?`).join(', ');
                    const values = Object.values(updates);
                    await pool.query(`UPDATE ${table} SET ${setClause} WHERE id = ?`, [...values, row.id]);
                    console.log(`   ✅ Updated row ID ${row.id}`);
                }
            }
        } catch (err) {
            console.error(`❌ Error processing table ${table}:`, err.message);
        }
    }

    console.log('\n✨ Bulk translation completed!');
    process.exit(0);
};

bulkTranslate();
