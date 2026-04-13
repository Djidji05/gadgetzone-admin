import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

// Configuration
const MODE = process.env.MONCASH_MODE || 'sandbox';
const CLIENT_ID = process.env.MONCASH_CLIENT_ID;
const CLIENT_SECRET = process.env.MONCASH_CLIENT_SECRET;
const API_URL = process.env.MONCASH_API_URL || 'https://sandbox.moncashbutton.digicelgroup.com/Api';

const monCashService = {
  /**
   * Obtient un token d'accès
   */
  getAccessToken: async () => {
    try {
      const auth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
      const params = new URLSearchParams();
      params.append('scope', 'read,write');
      params.append('grant_type', 'client_credentials');

      const response = await axios.post(`${API_URL}/oauth/token`, params, {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      return response.data.access_token;
    } catch (error) {
      const details = error.response?.data?.error_description || error.response?.data?.error || error.message;
      console.error('MonCash Auth Error:', error.response?.data || error.message);
      throw new Error(`Auth Fail: ${details}`);
    }
  },

  /**
   * @param {string|number} orderId - ID de la commande
   * @param {number} amount - Montant total
   * @param {string} returnUrl - URL de retour (optionnel)
   * @returns {Promise<string>} URL de redirection
   */
  createPayment: async (orderId, amount, returnUrl = null) => {
    try {
      const token = await monCashService.getAccessToken();

      const paymentData = {
        orderId: String(orderId),
        amount: Math.floor(Number(amount)), // MonCash requires integer amount
      };

      console.log('Sending MonCash Payment:', paymentData);
      console.log('Amount Type:', typeof paymentData.amount, 'Value:', paymentData.amount);

      if (isNaN(paymentData.amount) || paymentData.amount <= 0) {
        throw new Error(`Invalid amount: ${paymentData.amount}`);
      }

      const response = await axios.post(`${API_URL}/v1/CreatePayment`, paymentData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // Construction de l'URL de redirection
      // Le response.data.payment_token peut être utilisé ou redirect_uri s'il est renvoyé
      // Si l'API retourne un payment_token, on construit l'URL manuellement si nécessaire
      // Généralement response.data contient redirect_uri ou payment_token

      const paymentToken = response.data.payment_token?.token || response.data.payment_token;

      if (!paymentToken) {
        throw new Error('No payment token in response');
      }

      // URL de redirection standard pour Sandbox
      // Note: L'URL de paiement est différente de l'URL API
      // Sandbox Payload URL: https://sandbox.moncashbutton.digicelgroup.com/Moncash-middleware/Payment/Redirect?token=...

      // On déduit l'URL de redirection à partir de l'API_URL ou on utilise une constante
      const REDIRECT_BASE = API_URL.replace('/Api', '/Moncash-middleware/Payment/Redirect');
      return `${REDIRECT_BASE}?token=${paymentToken}`;

    } catch (error) {
      console.error('MonCash CreatePayment Error:', error.response?.data || error.message);
      let msg = error.response?.data?.message || error.response?.data?.error_description || error.message;
      throw new Error(`API Fail: ${msg}`);
    }
  },

  /**
   * Vérifie le statut d'un paiement
   * @param {string} orderId - ID de transaction ou ID de commande
   * @returns {Promise<object>} Détails du paiement
   */
  retrieveOrder: async (orderId) => {
    try {
      const token = await monCashService.getAccessToken();
      const response = await axios.post(`${API_URL}/v1/RetrieveOrder`, { orderId: String(orderId) }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data.payment;
    } catch (error) {
      console.error('MonCash RetrieveOrder Error:', error.response?.data || error.message);
      return null;
    }
  },

  /**
   * Vérifie le statut d'un paiement par token
   * @param {string} transactionToken - Token de transaction
   * @returns {Promise<object>} Détails du paiement
   */
  retrieveTransaction: async (transactionToken) => {
    try {
      const token = await monCashService.getAccessToken();
      const response = await axios.post(`${API_URL}/v1/RetrieveTransactionPayment`, { transactionId: transactionToken }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data.payment;
    } catch (error) {
      console.error('MonCash RetrieveTransaction Error:', error.response?.data || error.message);
      return null;
    }
  }
};

export default monCashService;
