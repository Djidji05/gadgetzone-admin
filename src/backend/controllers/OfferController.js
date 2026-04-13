import OfferService from '../services/OfferService.js';

class OfferController {
    constructor() {
        this.offerService = new OfferService();
    }

    createOffer = async (req, res) => {
        try {
            const data = {
                ...req.body,
                storeId: req.store.id // Ensure it's the seller's store
            };

            const offer = await this.offerService.create(data);
            res.status(201).json(offer);
        } catch (error) {
            console.error('❌ Controller Error [createOffer]:', error);
            res.status(400).json({ error: 'Failed to create offer', message: error.message });
        }
    };

    getOffersByProduct = async (req, res) => {
        try {
            const { productId } = req.params;
            const offers = await this.offerService.getOffersByProduct(productId);
            res.json(offers);
        } catch (error) {
            console.error('❌ Controller Error [getOffersByProduct]:', error);
            res.status(500).json({ error: 'Failed to fetch offers' });
        }
    };
}

export default new OfferController();
