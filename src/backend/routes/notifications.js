import express from 'express';
import { Notification, User } from '../models/index.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * GET /api/notifications
 * Récupérer les notifications de l'utilisateur connecté
 */
router.get('/', authenticateToken, async (req, res) => {
    const startTime = Date.now();
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

        // Parallelize queries to improve performance
        const [notifications, unreadCount] = await Promise.all([
            Notification.findAll({
                where: whereClause,
                attributes: ['id', 'type', 'title', 'message', 'status', 'created_at', 'related_id', 'related_type'],
                order: [['created_at', 'DESC']],
                limit: Math.min(parseInt(limit || '50'), 100),
                logging: false
            }),
            Notification.count({
                where: { userId, status: 'unread' },
                logging: false
            })
        ]);

        const duration = Date.now() - startTime;
        if (duration > 1000) {
            console.warn(`[Performance] GET /api/notifications took ${duration}ms for user ${userId}`);
        }

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

/**
 * DELETE /api/notifications
 * Supprimer toutes les notifications de l'utilisateur
 */
router.delete('/', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;

        await Notification.destroy({
            where: { userId }
        });

        res.json({
            message: 'Toutes les notifications ont été supprimées avec succès'
        });
    } catch (error) {
        console.error('Erreur suppression de toutes les notifications:', error);
        res.status(500).json({
            error: 'Erreur serveur',
            message: 'Erreur lors de la suppression des notifications'
        });
    }
});

export default router;
