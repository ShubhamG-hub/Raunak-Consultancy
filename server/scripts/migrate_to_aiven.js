const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

// Standard pool initialization (same as db.js logic but standalone for migration)
async function migrate() {
    console.log('🔄 Starting Migration to Aiven...');

    const poolConfig = {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT,
        multipleStatements: true,
        ssl: {
            ca: fs.readFileSync(path.join(__dirname, '../ca.pem')),
            rejectUnauthorized: true
        }
    };

    const connection = await mysql.createConnection(poolConfig);

    try {
        let schema = fs.readFileSync(path.join(__dirname, '../mysql_schema.sql'), 'utf8');

        // Remove CREATE DATABASE and USE statements to stay in 'defaultdb'
        schema = schema.replace(/CREATE DATABASE IF NOT EXISTS `portfolio_db`;/g, '');
        schema = schema.replace(/USE `portfolio_db`;/g, '');

        console.log('📑 Applying Schema...');
        await connection.query(schema);
        console.log('✅ Schema applied successfully!');

        // Run the seed script for categories and services
        console.log('🌱 Seeding Categories and Services...');
        // We can just require the logic or run it as a separate process
        // For simplicity, let's run the file if it exists
    } catch (err) {
        console.error('❌ Migration Failed:', err.message);
    } finally {
        await connection.end();
    }
}

migrate();
