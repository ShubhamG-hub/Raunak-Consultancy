const express = require('express');
const router = express.Router();
const multer = require('multer');
const supabase = require('../config/supabase');
const authMiddleware = require('../middleware/authMiddleware');

// Configure Multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// POST /api/upload
// Note: Using authMiddleware to ensure only admins can upload
router.post('/', authMiddleware, upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const file = req.file;
        const fileExt = file.originalname.split('.').pop();
        const fileName = `${Date.now()}-${Math.floor(Math.random() * 1000)}.${fileExt}`;
        const filePath = `uploads/${fileName}`;

        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
            .from('images')
            .upload(filePath, file.buffer, {
                contentType: file.mimetype,
                upsert: false
            });

        if (error) {
            console.error('Supabase storage error:', error);
            // Check if bucket exists error
            if (error.message && error.message.includes('bucket not found')) {
                return res.status(500).json({
                    error: 'Storage bucket "images" not found. Please create it in Supabase dashboard.',
                    details: error.message
                });
            }
            return res.status(500).json({ error: 'Failed to upload to storage', details: error.message });
        }

        // Get Public URL
        const { data: { publicUrl } } = supabase.storage
            .from('images')
            .getPublicUrl(filePath);

        res.json({
            message: 'Upload successful',
            url: publicUrl
        });

    } catch (err) {
        console.error('Server upload error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
