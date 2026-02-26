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
    // Add a connection timeout
    connectTimeout: 10000
};

// Add SSL for Aiven/Cloud DB
if (poolConfig.host.includes('aivencloud.com') || process.env.DB_SSL === 'true') {
    let caContent = null;

    // 1. Try environment variable first (most reliable on Render)
    if (process.env.DB_SSL_CA) {
        caContent = process.env.DB_SSL_CA;
        console.log('🔒 Using SSL CA from Environment Variable');
    } else {
        // 2. Try file-based CA
        const caPaths = [
            path.join(__dirname, '../ca.pem'),
            path.join(process.cwd(), 'ca.pem'),
            path.join(process.cwd(), 'server/ca.pem'),
            path.join(__dirname, '../../ca.pem')
        ];

        const caPath = caPaths.find(p => fs.existsSync(p));
        if (caPath) {
            caContent = fs.readFileSync(caPath);
            console.log('🔒 Using SSL CA from file:', caPath);
        }
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
console.log('📡 Attempting to connect to database at:', poolConfig.host, 'Port:', poolConfig.port);
console.log('🔑 DB User:', poolConfig.user);

const pool = mysql.createPool(poolConfig);

pool.getConnection()
    .then(conn => {
        console.log('🚀 Connected to Aiven MySQL Successfully!');
        conn.release();
    })
    .catch(err => {
        console.error('❌ Database Connection Error!');
        console.error('Error Name:', err.name);
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
