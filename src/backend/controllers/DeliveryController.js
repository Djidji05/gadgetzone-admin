import OrderService from '../services/OrderService.js';

/**
 * DeliveryController (Phase 13)
 * Gère les interactions liées à la logistique et au Scan-to-Confirm.
 */
class DeliveryController {
    constructor() {
        this.orderService = new OrderService();
    }

    /**
     * Valide la livraison d'une commande via le jeton client (Scan)
     */
    verifyScan = async (req, res) => {
        try {
            const { orderId, deliveryToken } = req.body;
            
            if (!orderId || !deliveryToken) {
                return res.status(400).json({ error: 'Order ID and Delivery Token are required.' });
            }

            const result = await this.orderService.verifyDeliveryScan(
                orderId, 
                deliveryToken, 
                req.user.id
            );

            res.json(result);
        } catch (error) {
            console.error('❌ Controller Error [verifyScan]:', error.message);
            res.status(400).json({ error: error.message });
        }
    };
}

export default new DeliveryController();
