const express = require('express');
const router = express.Router();
const db = require('../config/db');
const authMiddleware = require('../middleware/authMiddleware');
const { v4: uuidv4 } = require('uuid');

// GET /api/categories - Get all categories
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM categories ORDER BY display_order ASC, created_at DESC');
        res.json(rows);
    } catch (err) {
        console.error('Error fetching categories:', err);
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
});

// POST /api/categories - Create a new category
router.post('/', authMiddleware, async (req, res) => {
    const { name, description, slug, icon, show_on_homepage, display_order, is_active } = req.body;

    if (!name || !slug) {
        return res.status(400).json({ error: 'Name and slug are required' });
    }

    try {
        const id = uuidv4();
        await db.query(
            `INSERT INTO categories (
                id, name, description, slug, icon, show_on_homepage, display_order, is_active
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                id, name, description || null, slug, icon || 'Layout',
                show_on_homepage !== undefined ? show_on_homepage : true,
                display_order || 0, is_active !== undefined ? is_active : true
            ]
        );

        const [newCategory] = await db.query('SELECT * FROM categories WHERE id = ?', [id]);
        res.status(201).json(newCategory[0]);
    } catch (err) {
        console.error('Error creating category:', err);
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'Category slug already exists' });
        }
        res.status(500).json({ error: 'Failed to create category' });
    }
});

// PUT /api/categories/:id - Update a category
router.put('/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;
    const { name, description, slug, icon, show_on_homepage, display_order, is_active } = req.body;

    try {
        await db.query(
            `UPDATE categories SET 
                name = ?, description = ?, slug = ?, icon = ?, 
                show_on_homepage = ?, display_order = ?, is_active = ?
            WHERE id = ?`,
            [
                name, description, slug, icon,
                show_on_homepage, display_order, is_active, id
            ]
        );

        const [updatedCategory] = await db.query('SELECT * FROM categories WHERE id = ?', [id]);
        if (updatedCategory.length === 0) {
            return res.status(404).json({ error: 'Category not found' });
        }
        res.json(updatedCategory[0]);
    } catch (err) {
        console.error('Error updating category:', err);
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'Category slug already exists' });
        }
        res.status(500).json({ error: 'Failed to update category' });
    }
});

// DELETE /api/categories/:id - Delete a category
router.delete('/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;

    try {
        // Option: Check if services exist under this category
        const [services] = await db.query('SELECT id FROM services WHERE category_id = ?', [id]);
        if (services.length > 0) {
            return res.status(400).json({ error: 'Cannot delete category with associated services' });
        }

        const [result] = await db.query('DELETE FROM categories WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Category not found' });
        }
        res.json({ message: 'Category deleted successfully' });
    } catch (err) {
        console.error('Error deleting category:', err);
        res.status(500).json({ error: 'Failed to delete category' });
    }
});

module.exports = router;
