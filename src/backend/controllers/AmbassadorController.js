import ambassadorService from '../services/AmbassadorService.js';
import { apiLogger } from '../utils/logger.js';

class AmbassadorController {
    async apply(req, res) {
        try {
            const result = await ambassadorService.applyForAmbassador(req.user.id);

            if (result.already_ambassador) {
                return res.status(400).json({
                    message: 'Vous êtes déjà ambassadeur',
                    referral_code: result.referral_code
                });
            }

            res.json({
                message: 'Félicitations ! Vous êtes maintenant ambassadeur.',
                referral_code: result.referral_code
            });
        } catch (error) {
            apiLogger.error('Apply Ambassador Error', error);
            res.status(500).json({ message: error.message || 'Erreur lors de l\'application' });
        }
    }

    async getStats(req, res) {
        try {
            const result = await ambassadorService.getStats(req.user.id, req.user.role === 'admin');
            res.json(result);
        } catch (error) {
            apiLogger.error('Ambassador Stats Error', error);
            res.status(500).json({ message: 'Erreur lors de la récupération des stats' });
        }
    }
}

export default new AmbassadorController();
