import express from 'express';
import upload from '../middleware/upload.js';
import { authenticateToken } from '../middleware/auth.js';
import s3Service from '../services/S3Service.js';
import cloudinaryService from '../services/CloudinaryService.js';
import fs from 'fs';

const router = express.Router();


/**
 * Helper to check if Cloudinary is properly configured
 */
const isCloudinaryConfigured = () => {
    return process.env.CLOUDINARY_CLOUD_NAME &&
        process.env.CLOUDINARY_API_KEY &&
        process.env.CLOUDINARY_API_SECRET;
};

/**
 * POST /api/upload
 * Upload multiple files (max 5)
 * Strategy: Cloudinary (if configured) > Supabase (if configured) > S3 (if configured) > Local
 */
router.post('/', authenticateToken, (req, res, next) => {
    // We always use local multer storage as a staging area
    upload.array('images', 5)(req, res, (err) => {
        if (err) {
            console.error('[Upload Route] Multer Error:', err);
            return res.status(500).json({ error: err.message });
        }
        next();
    });
}, async (req, res) => {
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: 'Aucun fichier fourni ou format invalide.' });
    }

    try {
        const hybridResults = [];
        const useCloudinary = isCloudinaryConfigured();

        // Base backend URL for local fallback
        const backendUrl = process.env.BACKEND_URL || `http://localhost:${process.env.BACKEND_PORT || 3003}`;

        for (const file of req.files) {
            let cloudinaryUrl = null;

            // 1. Attempt Cloudinary (Primary)
            if (useCloudinary) {
                try {
                    cloudinaryUrl = await cloudinaryService.uploadFile(file.path, 'products');
                    if (cloudinaryUrl) console.log('✅ Hybrid: Uploaded to Cloudinary:', cloudinaryUrl);
                } catch (e) {
                    console.error('❌ Hybrid: Cloudinary failed:', e.message);
                }
            }

            // 2. Local Fallback URL (File is already in public/uploads/products thanks to Multer)
            // The file name is preserved in the destination folder
            const localPath = `/uploads/products/${file.filename}`;
            const localUrl = `${backendUrl}${localPath}`;
            console.log('✅ Hybrid: Local fallback ready:', localUrl);

            // Important: We DO NOT delete the local file anymore, as it serves as the fallback.
            // (Previously we were unlinking file.path here)

            // Store result
            hybridResults.push({
                url: cloudinaryUrl || localUrl, // Use Cloudinary if available, otherwise local
                fallback: localUrl              // Always local as the ultra-reliable backup
            });
        }

        res.json({
            message: `${req.files.length} image(s) téléversée(s) avec succès (Stratégie Hybride Cloudinary + Local)`,
            urls: hybridResults.map(r => r.url),
            hybrid: hybridResults
        });
    } catch (error) {
        console.error('[Upload Route] Hybrid Local Error:', error.message);
        res.status(500).json({ error: 'Erreur lors du traitement hybride local des fichiers.' });
    }
});

export default router;
