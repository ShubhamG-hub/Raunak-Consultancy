const mysql = require('mysql2/promise');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config({ path: '../.env' });

const services = [
    {
        title: "Estate & Succession Planning",
        description: "Strategic legacy planning to ensure your wealth is preserved and transferred according to your wishes.",
        icon: "Briefcase",
        category: "Premium Advisory",
        order_index: 10
    },
    {
        title: "GST & Business Compliance",
        description: "End-to-end business compliance and GST advisory to keep your enterprise legally robust and efficient.",
        icon: "ShieldCheck",
        category: "Business",
        order_index: 11
    },
    {
        title: "NRI Financial Advisory",
        description: "Professional financial guidance for Non-Resident Indians focusing on NRE/NRO investments, taxation, and repatriation.",
        icon: "Globe",
        category: "NRI Services",
        order_index: 12
    }
];

async function addServices() {
    const pool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    try {
        console.log('Connecting to database...');
        for (const service of services) {
            const id = uuidv4();
            await pool.query(
                'INSERT INTO services (id, title, description, icon, category, order_index, active) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [id, service.title, service.description, service.icon, service.category, service.order_index, 1]
            );
            console.log(`Added service: ${service.title}`);
        }
        console.log('All services added successfully!');
    } catch (err) {
        console.error('Error adding services:', err);
    } finally {
        await pool.end();
    }
}

addServices();
