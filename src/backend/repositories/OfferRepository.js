import BaseRepository from './BaseRepository.js';
import { Offer, Store, Product } from '../models/index.js';

export default class OfferRepository extends BaseRepository {
    constructor() {
        super(Offer);
    }

    async findWithDetails(id) {
        return await this.model.findByPk(id, {
            include: [
                { model: Store, as: 'store', attributes: ['id', 'name', 'logoUrl'] },
                { model: Product, as: 'product' }
            ]
        });
    }

    async findByProduct(productId) {
        return await this.model.findAll({
            where: { productId },
            include: [
                { model: Store, as: 'store', attributes: ['id', 'name', 'logoUrl'] }
            ],
            order: [['sales_count', 'DESC'], ['price', 'ASC']]
        });
    }
}
