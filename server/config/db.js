const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

const poolConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'portfolio_db',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

// Add SSL for Aiven/Cloud DB
if (poolConfig.host.includes('aivencloud.com')) {
    const caPath = path.join(__dirname, '../ca.pem');
    if (fs.existsSync(caPath)) {
        poolConfig.ssl = {
            ca: fs.readFileSync(caPath),
            rejectUnauthorized: true
        };
        console.log('🔒 SSL Enabled for Aiven MySQL');
    } else {
        console.warn('⚠️  CA Certificate missing at', caPath);
    }
}

const pool = mysql.createPool(poolConfig);

// Test connection
pool.getConnection()
    .then(conn => {
        console.log('🚀 Connected to Aiven MySQL Successfully!');
        conn.release();
    })
    .catch(err => {
        console.error('❌ Database Connection Error:', err.message);
    });

module.exports = pool;
