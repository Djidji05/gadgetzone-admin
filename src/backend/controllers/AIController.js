import { Product, Category, Order, OrderItem, Setting } from '../models/index.js';
import { Op } from 'sequelize';

class AIController {
    /**
     * Gère les messages entrants du chat
     */
    static async handleChat(req, res) {
        try {
            const { message, history } = req.body;
            const userId = req.user?.id;

            if (!message) {
                return res.status(400).json({ error: 'Message requis' });
            }

            const cleanMessage = message.toLowerCase().trim();
            let response = "";
            let data = null;

            // 1. Détection d'intention (Intent Matching)

            // Intention : Recherche de produits
            if (cleanMessage.includes('cherche') || cleanMessage.includes('trouve') || cleanMessage.includes('prix') || cleanMessage.includes('combien')) {
                const searchTerms = cleanMessage.replace(/(cherche|trouve|les|des|un|une|le|la|prix|combien|coûte)/g, '').trim();

                const products = await Product.findAll({
                    where: {
                        [Op.or]: [
                            { name: { [Op.iLike]: `%${searchTerms}%` } },
                            { description: { [Op.iLike]: `%${searchTerms}%` } }
                        ],
                        status: 'active'
                    },
                    limit: 3
                });

                if (products.length > 0) {
                    response = `J'ai trouvé ${products.length} produit(s) qui pourraient vous intéresser :`;
                    data = { type: 'products', items: products };
                } else {
                    response = "Désolé, je n'ai pas trouvé de produits correspondant à votre recherche. Essayez avec d'autres mots-clés.";
                }
            }

            // Intention : Statut de commande
            else if (cleanMessage.includes('commande') || cleanMessage.includes('livraison') || cleanMessage.includes('où est')) {
                if (!userId) {
                    response = "Pour suivre vos commandes, veuillez vous connecter à votre compte.";
                } else {
                    const latestOrder = await Order.findOne({
                        where: { user_id: userId },
                        order: [['created_at', 'DESC']],
                        include: [{ model: OrderItem, as: 'items', include: ['product'] }]
                    });

                    if (latestOrder) {
                        response = `Votre dernière commande #${latestOrder.id} est actuellement au statut : **${latestOrder.status.toUpperCase()}**.`;
                        data = { type: 'order', item: latestOrder };
                    } else {
                        response = "Vous n'avez pas encore passé de commande sur HTFasil.";
                    }
                }
            }

            // Intention : Devenir vendeur
            else if (cleanMessage.includes('vendeur') || cleanMessage.includes('vendre') || cleanMessage.includes('boutique')) {
                response = "Pour devenir vendeur sur HTFasil, c'est très simple :\n\n1. Connectez-vous à votre compte.\n2. Allez dans votre profil.\n3. Cliquez sur **'Devenir Vendeur'**.\n4. Remplissez les informations de votre boutique.\n\nUne fois validé, vous pourrez commencer à publier vos gadgets !";
            }

            // Intention : Aide / FAQ
            else if (cleanMessage.includes('aide') || cleanMessage.includes('contact') || cleanMessage.includes('comment')) {
                response = "Je peux vous aider à trouver des gadgets, suivre vos commandes ou vous informer sur la procédure pour devenir vendeur. Que souhaitez-vous savoir ?";
            }

            // Réponse par défaut (Salutations ou Incompréhension)
            else {
                response = "Bonjour ! Je suis votre assistant HTFasil. Comment puis-je vous aider aujourd'hui ? Je peux rechercher des produits ou suivre vos commandes.";
            }

            res.json({
                message: response,
                data: data,
                timestamp: new Date()
            });

        } catch (error) {
            console.error('[AI Controller] Error:', error);
            res.status(500).json({ error: 'Erreur interne de l\'assistant' });
        }
    }

    /**
     * Fournit des suggestions de questions contextuelles
     */
    static async getSuggestions(req, res) {
        const suggestions = [
            "Quels sont les derniers ordinateurs ?",
            "Où est ma commande ?",
            "Comment devenir vendeur ?",
            "Quelles sont les promotions du moment ?"
        ];
        res.json(suggestions);
    }
}

export default AIController;
