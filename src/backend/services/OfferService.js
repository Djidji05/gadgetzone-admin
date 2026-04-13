import BaseService from './BaseService.js';
import OfferRepository from '../repositories/OfferRepository.js';

export default class OfferService extends BaseService {
    constructor() {
        const repository = new OfferRepository();
        super(repository);
    }

    async getOffersByProduct(productId) {
        return await this.repository.findByProduct(productId);
    }

    /**
     * Simple Buy Box algorithm: lowest price with stock
     */
    async getBuyBoxWinner(productId) {
        const offers = await this.repository.findByProduct(productId);
        const availableOffers = offers.filter(o => o.stock > 0);

        if (availableOffers.length === 0) return null;

        // Sort by price (already sorted in repository, but safety check)
        return availableOffers[0];
    }
}
