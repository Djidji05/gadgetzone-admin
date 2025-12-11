import express from 'express';
import Newsletter from '../models/Newsletter.js';
import { Op } from 'sequelize';

const router = express.Router();

// Subscribe to newsletter
router.post('/subscribe', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email || !email.includes('@')) {
            return res.status(400).json({ message: 'Email invalide' });
        }

        // Check if already subscribed
        const existing = await Newsletter.findOne({ where: { email } });

        if (existing) {
            if (existing.isActive) {
                return res.status(400).json({ message: 'Cet email est déjà inscrit à notre newsletter' });
            } else {
                // Reactivate subscription
                existing.isActive = true;
                existing.subscribedAt = new Date();
                existing.unsubscribedAt = null;
                await existing.save();
                return res.json({ message: 'Votre inscription a été réactivée avec succès !' });
            }
        }

        // Create new subscription
        await Newsletter.create({ email });

        res.status(201).json({
            message: 'Merci pour votre inscription ! Vous recevrez bientôt nos offres exclusives.'
        });
    } catch (error) {
        console.error('Newsletter subscription error:', error);
        res.status(500).json({ message: 'Erreur lors de l\'inscription' });
    }
});

// Unsubscribe from newsletter
router.post('/unsubscribe', async (req, res) => {
    try {
        const { email } = req.body;

        const subscription = await Newsletter.findOne({ where: { email } });

        if (!subscription) {
            return res.status(404).json({ message: 'Email non trouvé' });
        }

        subscription.isActive = false;
        subscription.unsubscribedAt = new Date();
        await subscription.save();

        res.json({ message: 'Vous avez été désinscrit avec succès' });
    } catch (error) {
        console.error('Newsletter unsubscribe error:', error);
        res.status(500).json({ message: 'Erreur lors de la désinscription' });
    }
});

// Get all subscribers (admin only - add auth middleware later)
router.get('/subscribers', async (req, res) => {
    try {
        const subscribers = await Newsletter.findAll({
            where: { isActive: true },
            order: [['subscribedAt', 'DESC']]
        });

        res.json({
            count: subscribers.length,
            subscribers: subscribers.map(s => ({
                id: s.id,
                email: s.email,
                subscribedAt: s.subscribedAt
            }))
        });
    } catch (error) {
        console.error('Get subscribers error:', error);
        res.status(500).json({ message: 'Erreur lors de la récupération des abonnés' });
    }
});

// Get newsletter stats (admin only)
router.get('/stats', async (req, res) => {
    try {
        const totalSubscribers = await Newsletter.count();
        const activeSubscribers = await Newsletter.count({ where: { isActive: true } });
        const inactiveSubscribers = await Newsletter.count({ where: { isActive: false } });

        // Get recent subscribers (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const recentSubscribers = await Newsletter.count({
            where: {
                subscribedAt: {
                    [Op.gte]: thirtyDaysAgo
                }
            }
        });

        res.json({
            totalSubscribers,
            activeSubscribers,
            inactiveSubscribers,
            recentSubscribers
        });
    } catch (error) {
        console.error('Get newsletter stats error:', error);
        res.status(500).json({ message: 'Erreur lors de la récupération des statistiques' });
    }
});

export default router;
