const express = require('express');
const router = express.Router();
const db = require('../config/db');
const authMiddleware = require('../middleware/authMiddleware');
const { v4: uuidv4 } = require('uuid');

// Helper to generate slug
const generateSlug = (text) => {
    return text.toLowerCase()
        .replace(/&/g, 'and')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
};

// GET /api/services - Get all services
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT s.*, c.name as category_name, c.slug as category_slug 
            FROM services s 
            LEFT JOIN categories c ON s.category_id = c.id 
            ORDER BY s.display_order ASC, s.created_at DESC
        `);
        res.json(rows);
    } catch (err) {
        console.error('Error fetching services:', err);
        res.status(500).json({ error: 'Failed to fetch services' });
    }
});

// GET /api/services/category/:categorySlug - Get services by category
router.get('/category/:categorySlug', async (req, res) => {
    const { categorySlug } = req.params;
    try {
        const [rows] = await db.query(`
            SELECT s.*, c.name as category_name, c.slug as category_slug 
            FROM services s 
            JOIN categories c ON s.category_id = c.id 
            WHERE c.slug = ? AND s.is_active = 1
            ORDER BY s.display_order ASC
        `, [categorySlug]);
        res.json(rows);
    } catch (err) {
        console.error('Error fetching services by category:', err);
        res.status(500).json({ error: 'Failed to fetch services' });
    }
});

// GET /api/services/:categorySlug/:serviceSlug - Get specific service detail
router.get('/:categorySlug/:serviceSlug', async (req, res) => {
    const { categorySlug, serviceSlug } = req.params;
    try {
        const [rows] = await db.query(`
            SELECT s.*, c.name as category_name, c.slug as category_slug 
            FROM services s 
            JOIN categories c ON s.category_id = c.id 
            WHERE c.slug = ? AND s.slug = ? AND s.is_active = 1
        `, [categorySlug, serviceSlug]);

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Service not found' });
        }
        res.json(rows[0]);
    } catch (err) {
        console.error('Error fetching service detail:', err);
        res.status(500).json({ error: 'Failed to fetch service detail' });
    }
});

// POST /api/services - Create a new service
router.post('/', authMiddleware, async (req, res) => {
    const {
        title, slug, category_id, short_description, full_description,
        benefits, features, is_active, display_order
    } = req.body;

    if (!title || !category_id) {
        return res.status(400).json({ error: 'Title and Category are required' });
    }

    const finalSlug = slug || generateSlug(title);

    try {
        const id = uuidv4();
        await db.query(
            `INSERT INTO services (
                id, category_id, title, slug, short_description, full_description, 
                benefits, features, is_active, display_order
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                id, category_id, title, finalSlug, short_description || null, full_description || null,
                JSON.stringify(benefits || []), JSON.stringify(features || []),
                is_active !== undefined ? is_active : true, display_order || 0
            ]
        );

        const [newService] = await db.query('SELECT * FROM services WHERE id = ?', [id]);
        res.status(201).json(newService[0]);
    } catch (err) {
        console.error('Error creating service:', err);
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'Service slug already exists' });
        }
        res.status(500).json({ error: 'Failed to create service' });
    }
});

// PUT /api/services/:id - Update a service
router.put('/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;
    const {
        title, slug, category_id, short_description, full_description,
        benefits, features, is_active, display_order
    } = req.body;

    try {
        const finalSlug = slug || generateSlug(title);

        await db.query(
            `UPDATE services SET 
                category_id = ?, title = ?, slug = ?, short_description = ?, 
                full_description = ?, benefits = ?, features = ?, 
                is_active = ?, display_order = ?
            WHERE id = ?`,
            [
                category_id, title, finalSlug, short_description, full_description,
                JSON.stringify(benefits || []), JSON.stringify(features || []),
                is_active, display_order, id
            ]
        );

        const [updatedService] = await db.query('SELECT * FROM services WHERE id = ?', [id]);
        if (updatedService.length === 0) {
            return res.status(404).json({ error: 'Service not found' });
        }
        res.json(updatedService[0]);
    } catch (err) {
        console.error('Error updating service:', err);
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'Service slug already exists' });
        }
        res.status(500).json({ error: 'Failed to update service' });
    }
});

// DELETE /api/services/:id - Delete a service
router.delete('/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;

    try {
        const [result] = await db.query('DELETE FROM services WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Service not found' });
        }
        res.json({ message: 'Service deleted successfully' });
    } catch (err) {
        console.error('Error deleting service:', err);
        res.status(500).json({ error: 'Failed to delete service' });
    }
});

module.exports = router;

