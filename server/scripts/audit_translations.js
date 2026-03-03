require('dotenv').config();
const pool = require('../config/db');

const tables = {
    categories: ['name', 'description'],
    services: ['title', 'short_description', 'full_description'],
    awards: ['title', 'description', 'organization'],
    testimonials: ['content'],
    certificates: ['title', 'issued_by'],
    gallery: ['title'],
    about_sections: ['content'],
    blogs: ['title', 'excerpt']
};

const audit = async () => {
    const missing = {};
    let totalMissing = 0;

    for (const [table, columns] of Object.entries(tables)) {
        try {
            const [rows] = await pool.query(`SELECT * FROM ${table}`);
            const tableIssues = [];

            for (const row of rows) {
                const rowIssues = [];
                for (const col of columns) {
                    const enVal = row[`${col}_en`] || row[col] || '';
                    const hiVal = row[`${col}_hi`] || '';
                    const mrVal = row[`${col}_mr`] || '';

                    if (enVal) {
                        if (!hiVal) rowIssues.push(`${col}_hi MISSING`);
                        if (!mrVal) rowIssues.push(`${col}_mr MISSING`);
                    }
                }
                if (rowIssues.length > 0) {
                    tableIssues.push({ id: row.id, name: row.name || row.title || row.id, issues: rowIssues });
                    totalMissing++;
                }
            }

            if (tableIssues.length > 0) {
                missing[table] = tableIssues;
                console.log(`\n❌ TABLE: ${table.toUpperCase()} — ${tableIssues.length} rows with missing translations`);
                tableIssues.forEach(r => {
                    console.log(`   Row ID ${r.id} (${r.name}): ${r.issues.join(', ')}`);
                });
            } else {
                console.log(`\n✅ TABLE: ${table.toUpperCase()} — All rows have Hindi & Marathi`);
            }
        } catch (err) {
            console.log(`\n⚠️  TABLE: ${table.toUpperCase()} — Error: ${err.message}`);
        }
    }

    console.log('\n' + '='.repeat(60));
    if (totalMissing === 0) {
        console.log('✅ ALL TRANSLATIONS ARE COMPLETE — No missing Hindi/Marathi data!');
    } else {
        console.log(`⚠️  TOTAL ROWS WITH MISSING TRANSLATIONS: ${totalMissing}`);
    }

    process.exit(0);
};

audit();
