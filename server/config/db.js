const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

const poolConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'portfolio_db',
    port: parseInt(process.env.DB_PORT) || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 10000
};

// Log missing critical env vars
const requiredVars = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME', 'DB_PORT'];
requiredVars.forEach(v => {
    if (!process.env[v]) console.warn(`⚠️  Missing Environment Variable: ${v}`);
});

// Add SSL for Cloud DB
if (poolConfig.host.includes('mysql.services.clever-cloud.com') || process.env.DB_SSL === 'true') {
    let caContent = null;

    // Try environment variable first (most reliable on Render/Vercel)
    if (process.env.DB_SSL_CA) {
        caContent = process.env.DB_SSL_CA;
        console.log('🔒 Using SSL CA from Environment Variable');
    }

    if (caContent) {
        poolConfig.ssl = {
            ca: caContent,
            rejectUnauthorized: true
        };
    } else {
        console.warn('⚠️  No SSL CA found. Connection might fail if database requires it.');
        // Last resort fallback for some cloud providers
        poolConfig.ssl = {
            rejectUnauthorized: false
        };
        console.log('⚠️  Falling back to rejectUnauthorized: false');
    }
}

// Test connection with detailed logging
console.log('📡 Attempting to connect to database:');
console.log(`   Host: ${poolConfig.host}`);
console.log(`   Port: ${poolConfig.port}`);
console.log(`   User: ${poolConfig.user}`);
console.log(`   Database: ${poolConfig.database}`);

const pool = mysql.createPool(poolConfig);

pool.getConnection()
    .then(conn => {
        console.log('🚀 Connected to Database Successfully!');
        conn.release();
    })
    .catch(err => {
        console.error('❌ Database Connection Error!');
        console.error('Error Code:', err.code);
        console.error('Error Message:', err.message);
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            console.error('Database connection was closed.');
        }
        if (err.code === 'ER_CON_COUNT_ERROR') {
            console.error('Database has too many connections.');
        }
        if (err.code === 'ECONNREFUSED') {
            console.error('Database connection was refused.');
        }
    });

module.exports = pool;
