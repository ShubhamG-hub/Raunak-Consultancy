const db = require('../config/db');

const tables = {
    categories: ['name', 'description'],
    services: ['title', 'short_description', 'full_description', 'benefits', 'features'],
    blogs: ['title', 'excerpt', 'content'],
    awards: ['title', 'description'],
    testimonials: ['content'],
    certificates: ['name'],
    gallery: ['title'],
    about_sections: ['title', 'description', 'value']
};

const migrate = async () => {
    console.log('🚀 Starting translation migration...');

    for (const [table, columns] of Object.entries(tables)) {
        console.log(`\n📄 Processing table: ${table}`);

        for (const col of columns) {
            try {
                // Add _en, _hi, _mr columns
                console.log(`Adding language columns for ${table}.${col}...`);

                // Get original column type
                const [info] = await db.query(`SHOW COLUMNS FROM ${table} LIKE ?`, [col]);
                if (info.length === 0) {
                    console.warn(`Column ${col} not found in ${table}, skipping...`);
                    continue;
                }
                const type = info[0].Type;
                const isNullable = info[0].Null === 'YES' ? 'NULL' : 'NOT NULL';

                // Add columns
                const queries = [
                    `ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS ${col}_en ${type} ${isNullable}`,
                    `ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS ${col}_hi ${type} ${isNullable}`,
                    `ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS ${col}_mr ${type} ${isNullable}`
                ];

                for (const q of queries) {
                    try {
                        await db.query(q);
                    } catch (e) {
                        // IF NOT EXISTS isn't supported in all MySQL versions for ADD COLUMN
                        if (e.code !== 'ER_DUP_FIELDNAME') throw e;
                    }
                }

                // Migrate data from original column to _en (initial seed)
                console.log(`Migrating data for ${table}.${col} to ${col}_en...`);
                await db.query(`UPDATE ${table} SET ${col}_en = ${col} WHERE ${col}_en IS NULL OR ${col}_en = ''`);

            } catch (err) {
                console.error(`Error migrating ${table}.${col}:`, err.message);
            }
        }
    }

    console.log('\n✅ Migration complete!');
    process.exit(0);
};

migrate().catch(err => {
    console.error('❌ Migration failed:', err);
    process.exit(1);
});
