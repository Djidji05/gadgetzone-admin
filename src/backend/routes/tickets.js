import express from 'express';
import { sequelize } from '../models/index.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// GET /api/tickets/stats - Statistiques des tickets
router.get('/stats', authenticateToken, async (req, res) => {
    try {
        const [results] = await sequelize.query(`
      SELECT
        COUNT(*) FILTER (WHERE status = 'open') AS open_count,
        COUNT(*) FILTER (WHERE status = 'in_progress') AS in_progress_count,
        COUNT(*) FILTER (WHERE status = 'closed') AS closed_count,
        COUNT(*) AS total_count,
        ROUND(
          AVG(EXTRACT(EPOCH FROM (COALESCE(resolved_at, NOW()) - created_at)) / 3600)::numeric,
          1
        ) AS avg_response_hours
      FROM tickets
    `);
        const row = results[0] || {};
        res.json({
            open: parseInt(row.open_count) || 0,
            inProgress: parseInt(row.in_progress_count) || 0,
            closed: parseInt(row.closed_count) || 0,
            total: parseInt(row.total_count) || 0,
            avgResponseHours: parseFloat(row.avg_response_hours) || 0
        });
    } catch (error) {
        console.error('Erreur stats tickets:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// GET /api/tickets - Liste des tickets avec pagination
router.get('/', authenticateToken, async (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);

        let whereClause = '';
        const params = [];

        if (status) {
            params.push(status);
            whereClause = `WHERE t.status = $${params.length}`;
        }

        params.push(parseInt(limit), offset);

        const [tickets] = await sequelize.query(`
      SELECT
        t.id,
        t.subject,
        t.status,
        t.priority,
        t.created_at,
        t.updated_at,
        COALESCE(u.name, t.customer_name) AS user_name,
        COALESCE(u.email, t.customer_email) AS user_email,
        COALESCE(u.phone, t.customer_phone) AS user_phone
      FROM tickets t
      LEFT JOIN users u ON t.user_id = u.id
      ${whereClause}
      ORDER BY t.created_at DESC
      LIMIT $${params.length - 1} OFFSET $${params.length}
    `, { bind: params });

        const [[{ count }]] = await sequelize.query(
            `SELECT COUNT(*) FROM tickets t ${whereClause}`,
            { bind: status ? [status] : [] }
        );

        res.json({
            tickets,
            total: parseInt(count),
            page: parseInt(page),
            totalPages: Math.ceil(parseInt(count) / parseInt(limit))
        });
    } catch (error) {
        console.error('Erreur liste tickets:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// PATCH /api/tickets/:id/status - Mettre à jour le statut d'un ticket
router.patch('/:id/status', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const validStatuses = ['open', 'in_progress', 'closed'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Statut invalide' });
        }

        const resolvedAt = status === 'closed' ? 'NOW()' : 'NULL';

        await sequelize.query(
            `UPDATE tickets SET status = $1, resolved_at = ${resolvedAt}, updated_at = NOW() WHERE id = $2`,
            { bind: [status, id] }
        );

        res.json({ success: true, message: 'Statut mis à jour' });
    } catch (error) {
        console.error('Erreur mise à jour ticket:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

export default router;
