import express from 'express';
import Setting from '../models/Setting.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Default settings per category
const DEFAULTS = {
    general: {
        site_name: 'htfasil Admin',
        site_logo: '',
        contact_email: 'info@htfasil.com',
        site_description: 'La meilleure marketplace de gadgets en Haïti',
        site_url: 'https://htfasil.com',
        currency: 'HTG',
        timezone: 'America/Port-au-Prince',
        language: 'fr',
        maintenance_mode: 'false',
        whatsapp_vip_link: 'https://chat.whatsapp.com/votre_code_ici'
    },
    security: {
        two_factor_enabled: 'false',
        session_timeout: '60',
        min_password_length: '8',
        require_uppercase: 'true',
        require_numbers: 'true',
        require_special_chars: 'false',
        max_login_attempts: '5'
    },
    email: {
        smtp_host: '',
        smtp_port: '587',
        smtp_user: '',
        smtp_password: '',
        smtp_secure: 'false',
        from_name: 'htfasil',
        from_email: 'noreply@htfasil.com',
        welcome_email_enabled: 'true',
        order_confirmation_enabled: 'true',
        shipping_notification_enabled: 'true'
    },
    payment: {
        moncash_client_id: '',
        moncash_client_secret: '',
        moncash_sandbox: 'true',
        natcash_enabled: 'false',
        bank_transfer_enabled: 'false',
        cod_enabled: 'true'
    }
};

/**
 * GET /api/settings/general (public - for website logo/name)
 */
router.get('/general', async (req, res) => {
    try {
        const rows = await Setting.findAll({ where: { category: 'general' } });
        const result = { ...DEFAULTS.general };
        rows.forEach(row => { result[row.key] = row.value; });
        res.json(result);
    } catch (error) {
        console.error('[Settings] Error fetching general settings:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

/**
 * GET /api/settings/:category
 * Récupère tous les paramètres d'une catégorie (admin only)
 */
router.get('/:category', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { category } = req.params;

        if (!DEFAULTS[category]) {
            return res.status(400).json({ error: `Catégorie invalide: ${category}` });
        }

        const rows = await Setting.findAll({ where: { category } });

        // Merge defaults with saved values
        const result = { ...DEFAULTS[category] };
        for (const row of rows) {
            result[row.key] = row.value;
        }

        res.json(result);
    } catch (error) {
        console.error('Erreur récupération paramètres:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des paramètres' });
    }
});

/**
 * PUT /api/settings/:category
 * Sauvegarde les paramètres d'une catégorie (upsert)
 */
router.put('/:category', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { category } = req.params;
        const data = req.body;

        if (!DEFAULTS[category]) {
            return res.status(400).json({ error: `Catégorie invalide: ${category}` });
        }

        // Upsert each key
        const upserts = Object.entries(data).map(([key, value]) =>
            Setting.upsert({
                category,
                key,
                value: String(value ?? ''),
                updated_at: new Date()
            })
        );

        await Promise.all(upserts);

        res.json({ message: 'Paramètres enregistrés avec succès' });
    } catch (error) {
        console.error('Erreur sauvegarde paramètres:', error);
        res.status(500).json({ error: 'Erreur lors de la sauvegarde des paramètres' });
    }
});

export default router;
