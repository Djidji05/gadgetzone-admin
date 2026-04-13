import BaseRepository from './BaseRepository.js';
import { Promotion, Banner, Product } from '../models/index.js';
import { Op } from 'sequelize';

class PromotionRepository extends BaseRepository {
    constructor() {
        super(Promotion);
    }

    async findActiveBanners() {
        return await Banner.findAll({
            where: {
                isActive: true,
                [Op.or]: [
                    { startDate: { [Op.eq]: null } },
                    { startDate: { [Op.lte]: new Date() } }
                ],
                [Op.or]: [
                    { endDate: { [Op.eq]: null } },
                    { endDate: { [Op.gte]: new Date() } }
                ]
            },
            order: [['order', 'ASC'], ['createdAt', 'DESC']]
        });
    }

    async findPromotions(isAdmin = false) {
        const where = {};
        if (!isAdmin) {
            where.isActive = true;
            where.startDate = { [Op.lte]: new Date() };
            where.endDate = { [Op.gte]: new Date() };
        }

        return await this.findAll({
            where,
            order: [['createdAt', 'DESC']]
        });
    }

    async findByCode(code) {
        return await this.model.findOne({
            where: {
                code: code.toUpperCase(),
                isActive: true,
                startDate: { [Op.lte]: new Date() },
                endDate: { [Op.gte]: new Date() }
            }
        });
    }
}

export default new PromotionRepository();
