import PaymentService from '../services/PaymentService.js';

class PaymentController {
    constructor() {
        this.paymentService = new PaymentService();
    }

    initMonCash = async (req, res) => {
        try {
            const { orderId, amount, returnUrl } = req.body;
            if (!orderId || !amount) {
                return res.status(400).json({ error: 'OrderId and amount are required' });
            }

            const userId = req.user?.id; // Récupéré via authenticateToken
            const redirectUrl = await this.paymentService.initiateMonCashPayment(orderId, amount, userId, returnUrl);
            res.json({ redirectUrl });
        } catch (error) {
            console.error('❌ Controller Error [initMonCash]:', error);
            res.status(500).json({ error: error.message });
        }
    };

    handleMonCashWebhook = async (req, res) => {
        try {
            // 🛡️ SÉCURITÉ : Vérifier le secret dans l'URL (Filtre anti-spam / anti-forge)
            const webhookSecret = req.query.secret;
            const EXPECTED_SECRET = 'GADGET_X_MONCASH_SECURE'; // À déplacer dans .env en prod

            if (webhookSecret !== EXPECTED_SECRET) {
                console.warn(`🛑 Unauthorized Webhook Attempt from IP: ${req.ip}`);
                return res.status(403).json({ error: 'Forbidden: Invalid or missing webhook secret' });
            }

            // MonCash sends payload in body
            const success = await this.paymentService.processMonCashWebhook(req.body);
            if (success) {
                res.sendStatus(200);
            } else {
                res.status(400).send('Verification failed');
            }
        } catch (error) {
            console.error('❌ Controller Error [handleMonCashWebhook]:', error);
            res.status(500).json({ error: error.message });
        }
    };

    verifyPayment = async (req, res) => {
        try {
            const success = await this.paymentService.verifyPaymentStatic(req.params.orderId);
            res.json({ success });
        } catch (error) {
            console.error('❌ Controller Error [verifyPayment]:', error);
            res.status(500).json({ error: error.message });
        }
    };

    // Stats and List delegates (Mocked or using repository)
    getStats = async (req, res) => {
        // Rediriger vers un service de stats global ou implémenter ici
        res.status(501).json({ message: 'Use integrated Stats API' });
    };
}

export default new PaymentController();
