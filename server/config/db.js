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
    const caPaths = [
        path.join(__dirname, '../ca.pem'), // server/ca.pem
        path.join(process.cwd(), 'ca.pem'), // current directory
        path.join(process.cwd(), 'server/ca.pem'), // subdirectory
        path.join(__dirname, '../../ca.pem') // root if in server/config
    ];

    let caPath = caPaths.find(p => fs.existsSync(p));

    if (caPath) {
        poolConfig.ssl = {
            ca: fs.readFileSync(caPath),
            rejectUnauthorized: true
        };
        console.log('🔒 SSL Enabled for Aiven MySQL using:', caPath);
    } else {
        console.warn('⚠️  CA Certificate missing. Checked:', caPaths);
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
