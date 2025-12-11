import express from 'express';
import { Notification, User } from '../models/index.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * GET /api/notifications
 * Récupérer les notifications de l'utilisateur connecté
 */
router.get('/', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { limit = 50, status, type } = req.query;

        const whereClause = { userId };

        if (status) {
            whereClause.status = status;
        }

        if (type) {
            whereClause.type = type;
        }

        const notifications = await Notification.findAll({
            where: whereClause,
            order: [['created_at', 'DESC']],
            limit: parseInt(limit),
            include: [{
                model: User,
                as: 'user',
                attributes: ['id', 'name', 'email']
            }]
        });

        // Compter les non lues
        const unreadCount = await Notification.count({
            where: { userId, status: 'unread' }
        });

        res.json({
            notifications,
            unreadCount,
            total: notifications.length
        });
    } catch (error) {
        console.error('Erreur récupération notifications:', error);
        res.status(500).json({
            error: 'Erreur serveur',
            message: 'Erreur lors de la récupération des notifications'
        });
    }
});

/**
 * POST /api/notifications/:id/read
 * Marquer une notification comme lue
 */
router.post('/:id/read', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const notification = await Notification.findOne({
            where: { id, userId }
        });

        if (!notification) {
            return res.status(404).json({
                error: 'Notification non trouvée'
            });
        }

        await notification.update({ status: 'read' });

        res.json({
            message: 'Notification marquée comme lue',
            notification
        });
    } catch (error) {
        console.error('Erreur marquage notification:', error);
        res.status(500).json({
            error: 'Erreur serveur',
            message: 'Erreur lors du marquage de la notification'
        });
    }
});

/**
 * POST /api/notifications/mark-all-read
 * Marquer toutes les notifications comme lues
 */
router.post('/mark-all-read', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;

        await Notification.update(
            { status: 'read' },
            { where: { userId, status: 'unread' } }
        );

        res.json({
            message: 'Toutes les notifications ont été marquées comme lues'
        });
    } catch (error) {
        console.error('Erreur marquage toutes notifications:', error);
        res.status(500).json({
            error: 'Erreur serveur',
            message: 'Erreur lors du marquage des notifications'
        });
    }
});

/**
 * DELETE /api/notifications/:id
 * Supprimer une notification
 */
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const notification = await Notification.findOne({
            where: { id, userId }
        });

        if (!notification) {
            return res.status(404).json({
                error: 'Notification non trouvée'
            });
        }

        await notification.destroy();

        res.json({
            message: 'Notification supprimée avec succès'
        });
    } catch (error) {
        console.error('Erreur suppression notification:', error);
        res.status(500).json({
            error: 'Erreur serveur',
            message: 'Erreur lors de la suppression de la notification'
        });
    }
});

export default router;
