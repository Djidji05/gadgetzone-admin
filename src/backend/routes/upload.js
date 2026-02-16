import express from 'express';
import upload from '../middleware/upload.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * POST /api/upload
 * Upload multiple files (max 5)
 */
router.post('/', authenticateToken, (req, res, next) => {
    console.log('[Upload Route] Request received');
    // Wrap upload.array in a try-catch block or handle errors? 
    // Multer middleware should be called directly.
    // Let's log before calling multer.
    upload.array('images', 5)(req, res, (err) => {
        if (err) {
            console.error('[Upload Route] Multer Error:', err);
            return res.status(500).json({ error: err.message });
        }
        console.log('[Upload Route] Files processed:', req.files);
        next();
    });
}, (req, res) => {
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: 'Aucun fichier fourni ou format invalide.' });
    }

    const urls = req.files.map(file => `/uploads/products/${file.filename}`);

    res.json({
        message: `${req.files.length} image(s) téléversée(s) avec succès`,
        urls: urls
    });
});

export default router;
