import ambassadorRepository from '../repositories/AmbassadorRepository.js';
import crypto from 'crypto';

class AmbassadorService {
    async applyForAmbassador(userId) {
        const user = await ambassadorRepository.findById(userId);

        if (!user) {
            throw new Error('Utilisateur non trouvé');
        }

        if (user.is_ambassador) {
            return {
                already_ambassador: true,
                referral_code: user.referral_code
            };
        }

        // Generate unique code (e.g., NAME1234)
        const baseCode = user.name.split(' ')[0].toUpperCase().replace(/[^A-Z]/g, '');
        const randomSuffix = crypto.randomBytes(2).toString('hex').toUpperCase();
        const referralCode = `${baseCode}${randomSuffix}`;

        await ambassadorRepository.updateAmbassadorStatus(userId, referralCode);

        return {
            already_ambassador: false,
            referral_code: referralCode
        };
    }

    async getStats(userId, isAdmin = false) {
        // If not admin, check if user is ambassador (logic mostly in controller/middleware)
        const referrals = await ambassadorRepository.findAmbassadorStats(userId);
        const user = await ambassadorRepository.findById(userId);

        const totalCommissions = referrals.reduce((sum, ref) => sum + parseFloat(ref.commission_amount || 0), 0);
        const pendingCommissions = referrals
            .filter(ref => ref.status === 'pending')
            .reduce((sum, ref) => sum + parseFloat(ref.commission_amount || 0), 0);

        const successfulReferrals = referrals.length;

        return {
            referral_code: user.referral_code,
            stats: {
                total_referrals: successfulReferrals,
                total_commissions: totalCommissions,
                pending_commissions: pendingCommissions,
                paid_commissions: totalCommissions - pendingCommissions
            },
            referrals: referrals.map(ref => ({
                id: ref.id,
                date: ref.created_at,
                amount: ref.commission_amount,
                status: ref.status,
                order_status: ref.Order?.status,
                referred_user: ref.referred_user?.name || 'Client invité'
            }))
        };
    }
}

export default new AmbassadorService();
