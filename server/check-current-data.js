const db = require('./config/db');

async function checkData() {
    try {
        const [categories] = await db.query('SELECT * FROM categories');
        console.log('Categories:', JSON.stringify(categories, null, 2));

        const [services] = await db.query('SELECT * FROM services');
        console.log('Services Count:', services.length);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkData();
