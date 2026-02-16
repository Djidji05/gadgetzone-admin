import express from 'express';
import { Address } from '../models/index.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Middleware d'auth pour toutes les routes
router.use(authenticateToken);

/**
 * GET /api/addresses
 * Get user addresses
 */
router.get('/', async (req, res) => {
    try {
        const addresses = await Address.findAll({
            where: { user_id: req.user.id },
            order: [['is_default', 'DESC'], ['created_at', 'DESC']]
        });
        res.json(addresses);
    } catch (error) {
        console.error('Error fetching addresses:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des adresses' });
    }
});

/**
 * POST /api/addresses
 * Add new address
 */
router.post('/', async (req, res) => {
    try {
        const { street, city, quartier, country, whatsapp, note, is_default } = req.body;

        if (!street || !city || !quartier) {
            return res.status(400).json({ error: 'Rue, Ville et Quartier sont requis' });
        }

        // Set default country if missing
        const countryValue = country || 'Haïti';

        // If new address is default, unset others first
        if (is_default) {
            await Address.update({ is_default: false }, { where: { user_id: req.user.id } });
        }

        const newAddress = await Address.create({
            user_id: req.user.id,
            street,
            quartier, // Added field
            city,
            country: countryValue,
            whatsapp, // Added field
            note,     // Added field
            is_default: !!is_default
        });

        res.status(201).json(newAddress);
    } catch (error) {
        console.error('Error adding address:', error);
        res.status(500).json({ error: "Erreur lors de l'ajout de l'adresse" });
    }
});

/**
 * PUT /api/addresses/:id
 * Update address
 */
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { street, city, quartier, country, whatsapp, note, is_default } = req.body;

        const address = await Address.findOne({ where: { id, user_id: req.user.id } });
        if (!address) {
            return res.status(404).json({ error: 'Adresse non trouvée' });
        }

        // If setting as default, unset others
        if (is_default && !address.is_default) {
            await Address.update({ is_default: false }, { where: { user_id: req.user.id } });
        }

        await address.update({
            street: street || address.street,
            quartier: quartier !== undefined ? quartier : address.quartier,
            city: city || address.city,
            country: country || address.country,
            whatsapp: whatsapp !== undefined ? whatsapp : address.whatsapp,
            note: note !== undefined ? note : address.note,
            is_default: is_default !== undefined ? is_default : address.is_default
        });

        res.json(address);
    } catch (error) {
        console.error('Error updating address:', error);
        res.status(500).json({ error: "Erreur lors de la mise à jour de l'adresse" });
    }
});

/**
 * DELETE /api/addresses/:id
 * Delete address
 */
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const address = await Address.findOne({ where: { id, user_id: req.user.id } });

        if (!address) {
            return res.status(404).json({ error: 'Adresse non trouvée' });
        }

        await address.destroy();
        res.json({ message: 'Adresse supprimée' });
    } catch (error) {
        console.error('Error deleting address:', error);
        res.status(500).json({ error: "Erreur lors de la suppression de l'adresse" });
    }
});

export default router;
