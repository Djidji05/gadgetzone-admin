import express from 'express';
import Campaign from '../models/Campaign.js';
import { Op } from 'sequelize';

const router = express.Router();

// Get all campaigns with stats
router.get('/', async (req, res) => {
    try {
        const campaigns = await Campaign.findAll({
            order: [['createdAt', 'DESC']]
        });

        // Calculate stats
        const stats = {
            activeCampaigns: campaigns.filter(c => c.status === 'Active').length,
            totalLeads: campaigns.reduce((sum, c) => sum + (c.leads || 0), 0),
            totalConversions: campaigns.reduce((sum, c) => sum + (c.conversions || 0), 0),
            totalRevenue: campaigns.reduce((sum, c) => sum + parseFloat(c.revenue || 0), 0),
            totalSpent: campaigns.reduce((sum, c) => sum + parseFloat(c.spent || 0), 0)
        };

        // Calculate conversion rate
        stats.conversionRate = stats.totalLeads > 0
            ? ((stats.totalConversions / stats.totalLeads) * 100).toFixed(2)
            : 0;

        // Calculate ROI
        stats.roi = stats.totalSpent > 0
            ? ((stats.totalRevenue - stats.totalSpent) / stats.totalSpent * 100).toFixed(2)
            : 0;

        res.json({
            campaigns,
            stats
        });
    } catch (error) {
        console.error('Get campaigns error:', error);
        res.status(500).json({ message: 'Erreur lors de la récupération des campagnes' });
    }
});

// Get single campaign
router.get('/:id', async (req, res) => {
    try {
        const campaign = await Campaign.findByPk(req.params.id);

        if (!campaign) {
            return res.status(404).json({ message: 'Campagne non trouvée' });
        }

        res.json(campaign);
    } catch (error) {
        console.error('Get campaign error:', error);
        res.status(500).json({ message: 'Erreur lors de la récupération de la campagne' });
    }
});

// Create campaign
router.post('/', async (req, res) => {
    try {
        const campaign = await Campaign.create(req.body);
        res.status(201).json(campaign);
    } catch (error) {
        console.error('Create campaign error:', error);
        res.status(500).json({ message: 'Erreur lors de la création de la campagne' });
    }
});

// Update campaign
router.put('/:id', async (req, res) => {
    try {
        const campaign = await Campaign.findByPk(req.params.id);

        if (!campaign) {
            return res.status(404).json({ message: 'Campagne non trouvée' });
        }

        await campaign.update(req.body);
        res.json(campaign);
    } catch (error) {
        console.error('Update campaign error:', error);
        res.status(500).json({ message: 'Erreur lors de la mise à jour de la campagne' });
    }
});

// Delete campaign
router.delete('/:id', async (req, res) => {
    try {
        const campaign = await Campaign.findByPk(req.params.id);

        if (!campaign) {
            return res.status(404).json({ message: 'Campagne non trouvée' });
        }

        await campaign.destroy();
        res.json({ message: 'Campagne supprimée avec succès' });
    } catch (error) {
        console.error('Delete campaign error:', error);
        res.status(500).json({ message: 'Erreur lors de la suppression de la campagne' });
    }
});

// Update campaign stats
router.patch('/:id/stats', async (req, res) => {
    try {
        const campaign = await Campaign.findByPk(req.params.id);

        if (!campaign) {
            return res.status(404).json({ message: 'Campagne non trouvée' });
        }

        const { leads, conversions, revenue, spent } = req.body;

        await campaign.update({
            leads: leads !== undefined ? leads : campaign.leads,
            conversions: conversions !== undefined ? conversions : campaign.conversions,
            revenue: revenue !== undefined ? revenue : campaign.revenue,
            spent: spent !== undefined ? spent : campaign.spent
        });

        res.json(campaign);
    } catch (error) {
        console.error('Update campaign stats error:', error);
        res.status(500).json({ message: 'Erreur lors de la mise à jour des statistiques' });
    }
});

export default router;
