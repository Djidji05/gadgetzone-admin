import express from 'express';
import Brand from '../models/Brand.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import multer from 'multer';
import path from 'path';

const router = express.Router();

// Configuration multer pour les logos de marques
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/brands/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

// GET /api/brands - Récupérer toutes les marques
router.get('/', async (req, res) => {
    try {
        const brands = await Brand.findAll({
            order: [['name', 'ASC']]
        });
        res.json(brands);
    } catch (error) {
        console.error('Error fetching brands:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des marques' });
    }
});

// POST /api/brands - Créer une marque (Admin)
router.post('/', authenticateToken, requireAdmin, upload.single('logo'), async (req, res) => {
    try {
        const { name, description } = req.body;
        const logo_url = req.file ? `/uploads/brands/${req.file.filename}` : null;

        const brand = await Brand.create({ name, description, logo_url });
        res.status(201).json(brand);
    } catch (error) {
        console.error('Error creating brand:', error);
        res.status(500).json({ error: 'Erreur lors de la création de la marque' });
    }
});

// PUT /api/brands/:id - Modifier une marque
router.put('/:id', authenticateToken, requireAdmin, upload.single('logo'), async (req, res) => {
    try {
        const brand = await Brand.findByPk(req.params.id);
        if (!brand) return res.status(404).json({ error: 'Marque non trouvée' });

        const { name, description } = req.body;
        if (name) brand.name = name;
        if (description) brand.description = description;
        if (req.file) {
            brand.logo_url = `/uploads/brands/${req.file.filename}`;
        }

        await brand.save();
        res.json(brand);
    } catch (error) {
        console.error('Error updating brand:', error);
        res.status(500).json({ error: 'Erreur lors de la mise à jour' });
    }
});

// DELETE /api/brands/:id - Supprimer une marque
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const brand = await Brand.findByPk(req.params.id);
        if (!brand) return res.status(404).json({ error: 'Marque non trouvée' });

        await brand.destroy();
        res.json({ message: 'Marque supprimée' });
    } catch (error) {
        console.error('Error deleting brand:', error);
        res.status(500).json({ error: 'Erreur lors de la suppression' });
    }
});

export default router;
