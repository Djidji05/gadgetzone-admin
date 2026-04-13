import BaseRepository from './BaseRepository.js';
import { User, Referral, Order } from '../models/index.js';

class AmbassadorRepository extends BaseRepository {
    constructor() {
        super(User);
    }

    async findAmbassadorStats(ambassadorId) {
        return await Referral.findAll({
            where: { ambassador_id: ambassadorId },
            include: [
                { model: Order, attributes: ['id', 'total_amount', 'status', 'created_at'] },
                { model: User, as: 'referred_user', attributes: ['id', 'name'] }
            ]
        });
    }

    async updateAmbassadorStatus(userId, referralCode) {
        return await this.update(userId, {
            is_ambassador: true,
            referral_code: referralCode
        });
    }
}

export default new AmbassadorRepository();
