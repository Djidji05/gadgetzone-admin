import express from 'express';
import Brand from '../models/Brand.js';

const router = express.Router();

// GET /api/brands
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

export default router;
