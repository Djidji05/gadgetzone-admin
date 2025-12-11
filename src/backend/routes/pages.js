import express from 'express';
import Page from '../models/Page.js';

const router = express.Router();

// Get all pages
router.get('/', async (req, res) => {
    try {
        const pages = await Page.findAll({
            order: [['createdAt', 'DESC']]
        });

        res.json({ pages });
    } catch (error) {
        console.error('Get pages error:', error);
        res.status(500).json({ message: 'Erreur lors de la récupération des pages' });
    }
});

// Get single page by slug
router.get('/:slug', async (req, res) => {
    try {
        const page = await Page.findOne({
            where: { slug: req.params.slug }
        });

        if (!page) {
            return res.status(404).json({ message: 'Page non trouvée' });
        }

        res.json(page);
    } catch (error) {
        console.error('Get page error:', error);
        res.status(500).json({ message: 'Erreur lors de la récupération de la page' });
    }
});

// Create page
router.post('/', async (req, res) => {
    try {
        const page = await Page.create(req.body);
        res.status(201).json(page);
    } catch (error) {
        console.error('Create page error:', error);
        res.status(500).json({ message: 'Erreur lors de la création de la page' });
    }
});

// Update page
router.put('/:id', async (req, res) => {
    try {
        const page = await Page.findByPk(req.params.id);

        if (!page) {
            return res.status(404).json({ message: 'Page non trouvée' });
        }

        await page.update(req.body);
        res.json(page);
    } catch (error) {
        console.error('Update page error:', error);
        res.status(500).json({ message: 'Erreur lors de la mise à jour de la page' });
    }
});

// Delete page
router.delete('/:id', async (req, res) => {
    try {
        const page = await Page.findByPk(req.params.id);

        if (!page) {
            return res.status(404).json({ message: 'Page non trouvée' });
        }

        await page.destroy();
        res.json({ message: 'Page supprimée avec succès' });
    } catch (error) {
        console.error('Delete page error:', error);
        res.status(500).json({ message: 'Erreur lors de la suppression de la page' });
    }
});

export default router;
