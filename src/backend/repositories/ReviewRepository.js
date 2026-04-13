import BaseRepository from './BaseRepository.js';
import { Review, User, Product } from '../models/index.js';

class ReviewRepository extends BaseRepository {
    constructor() {
        super(Review);
    }

    async findByProduct(productId) {
        return await this.model.findAll({
            where: {
                product_id: productId,
                status: 'approved'
            },
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'name', 'email']
                }
            ],
            order: [['created_at', 'DESC']]
        });
    }

    async findPending() {
        return await this.model.findAll({
            where: { status: 'pending' },
            include: [
                { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
                { model: Product, as: 'product', attributes: ['id', 'name'] }
            ],
            order: [['created_at', 'ASC']]
        });
    }

    async findFullReview(id) {
        return await this.findById(id, {
            include: [{ model: User, as: 'user', attributes: ['id', 'name'] }]
        });
    }
}

export default new ReviewRepository();
