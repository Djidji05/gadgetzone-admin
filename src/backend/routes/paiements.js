import express from 'express';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Middleware d'authentification pour toutes les routes paiements
router.use(authenticateToken);

// Données simulées pour les paiements
const mockPayments = [
  {
    id: 1,
    customer: 'Jean Dupont',
    email: 'jean.dupont@email.com',
    amount: 299.99,
    method: 'Carte de crédit',
    status: 'completed',
    date: '2024-01-15T10:30:00Z',
    orderId: 1001,
    transactionId: 'txn_123456789'
  },
  {
    id: 2,
    customer: 'Marie Curie',
    email: 'marie.curie@email.com',
    amount: 599.99,
    method: 'Natcash',
    status: 'completed',
    date: '2024-01-15T09:15:00Z',
    orderId: 1002,
    transactionId: 'txn_123456790'
  },
  {
    id: 3,
    customer: 'Pierre Martin',
    email: 'pierre.martin@email.com',
    amount: 149.99,
    method: 'Mon Cash Wise',
    status: 'pending',
    date: '2024-01-15T08:45:00Z',
    orderId: 1003,
    transactionId: 'txn_123456791'
  },
  {
    id: 4,
    customer: 'Sophie Laurent',
    email: 'sophie.laurent@email.com',
    amount: 899.99,
    method: 'Carte de crédit',
    status: 'failed',
    date: '2024-01-14T16:20:00Z',
    orderId: 1004,
    transactionId: 'txn_123456792'
  },
  {
    id: 5,
    customer: 'Bernard Petit',
    email: 'bernard.petit@email.com',
    amount: 399.99,
    method: 'Zelle',
    status: 'completed',
    date: '2024-01-14T14:10:00Z',
    orderId: 1005,
    transactionId: 'txn_123456793'
  }
];

/**
 * GET /api/paiements/stats
 * Obtenir les statistiques des paiements
 */
router.get('/stats', async (req, res) => {
  try {
    const stats = {
      totalRevenue: 456789,
      revenueGrowth: 12.5,
      todayPayments: 23,
      todayGrowth: 8.3,
      successRate: 98.2,
      pendingPayments: 5
    };

    res.json(stats);
  } catch (error) {
    console.error('Get payments stats error:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des statistiques' });
  }
});

/**
 * GET /api/paiements
 * Obtenir la liste des paiements
 */
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;

    let filteredPayments = [...mockPayments];

    // Filtrer par statut
    if (status) {
      filteredPayments = filteredPayments.filter(p => p.status === status);
    }

    // Filtrer par recherche
    if (search) {
      const searchLower = search.toLowerCase();
      filteredPayments = filteredPayments.filter(p =>
        p.customer.toLowerCase().includes(searchLower) ||
        p.email.toLowerCase().includes(searchLower)
      );
    }

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedPayments = filteredPayments.slice(startIndex, endIndex);

    res.json({
      payments: paginatedPayments,
      total: filteredPayments.length
    });
  } catch (error) {
    console.error('Get payments error:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des paiements' });
  }
});

/**
 * GET /api/paiements/methods
 * Obtenir les méthodes de paiement
 */
router.get('/methods', async (req, res) => {
  try {
    const methods = [
      {
        name: 'Carte de crédit',
        count: 156,
        percentage: 65,
        amount: 289456
      },
      {
        name: 'Natcash',
        count: 45,
        percentage: 19,
        amount: 84789
      },
      {
        name: 'Mon Cash Wise',
        count: 28,
        percentage: 12,
        amount: 53456
      },
      {
        name: 'Zelle',
        count: 11,
        percentage: 4,
        amount: 29088
      }
    ];

    res.json(methods);
  } catch (error) {
    console.error('Get payment methods error:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des méthodes de paiement' });
  }
});

/**
 * GET /api/paiements/revenue
 * Obtenir les données de revenus
 */
router.get('/revenue', async (req, res) => {
  try {
    const { period = '30j' } = req.query;

    // Données simulées selon la période
    let revenueData = [];

    if (period === '7j') {
      revenueData = [
        { date: '2024-01-09', revenue: 12000, orders: 45 },
        { date: '2024-01-10', revenue: 15000, orders: 52 },
        { date: '2024-01-11', revenue: 13500, orders: 48 },
        { date: '2024-01-12', revenue: 18000, orders: 61 },
        { date: '2024-01-13', revenue: 16500, orders: 58 },
        { date: '2024-01-14', revenue: 19200, orders: 67 },
        { date: '2024-01-15', revenue: 21000, orders: 73 }
      ];
    } else if (period === '30j') {
      // Générer 30 jours de données
      for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        revenueData.push({
          date: date.toISOString().split('T')[0],
          revenue: Math.floor(Math.random() * 10000) + 10000,
          orders: Math.floor(Math.random() * 30) + 40
        });
      }
    } else {
      // 90 jours ou 1 an - données agrégées par semaine
      for (let i = 12; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - (i * 7));
        revenueData.push({
          date: date.toISOString().split('T')[0],
          revenue: Math.floor(Math.random() * 50000) + 70000,
          orders: Math.floor(Math.random() * 100) + 200
        });
      }
    }

    res.json(revenueData);
  } catch (error) {
    console.error('Get revenue data error:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des données de revenus' });
  }
});

/**
 * POST /api/paiements
 * Créer un nouveau paiement
 */
router.post('/', async (req, res) => {
  try {
    const { customer, email, amount, method, orderId } = req.body;

    // Validation
    if (!customer || !email || !amount || !method) {
      return res.status(400).json({ message: 'Champs requis manquants' });
    }

    const newPayment = {
      id: mockPayments.length + 1,
      customer,
      email,
      amount: parseFloat(amount),
      method,
      status: 'pending',
      date: new Date().toISOString(),
      orderId: orderId || null,
      transactionId: `txn_${Date.now()}`
    };

    mockPayments.push(newPayment);

    res.status(201).json(newPayment);
  } catch (error) {
    console.error('Create payment error:', error);
    res.status(500).json({ message: 'Erreur lors de la création du paiement' });
  }
});

/**
 * PUT /api/paiements/:id
 * Mettre à jour un paiement
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const paymentIndex = mockPayments.findIndex(p => p.id === parseInt(id));
    if (paymentIndex === -1) {
      return res.status(404).json({ message: 'Paiement non trouvé' });
    }

    mockPayments[paymentIndex].status = status;
    mockPayments[paymentIndex].date = new Date().toISOString();

    res.json(mockPayments[paymentIndex]);
  } catch (error) {
    console.error('Update payment error:', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour du paiement' });
  }
});

/**
 * POST /api/paiements/:id/refund
 * Rembourser un paiement
 */
router.post('/:id/refund', async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const paymentIndex = mockPayments.findIndex(p => p.id === parseInt(id));
    if (paymentIndex === -1) {
      return res.status(404).json({ message: 'Paiement non trouvé' });
    }

    if (mockPayments[paymentIndex].status !== 'completed') {
      return res.status(400).json({ message: 'Seuls les paiements complétés peuvent être remboursés' });
    }

    mockPayments[paymentIndex].status = 'refunded';
    mockPayments[paymentIndex].date = new Date().toISOString();

    res.json({
      ...mockPayments[paymentIndex],
      refundReason: reason || 'Remboursement demandé'
    });
  } catch (error) {
    console.error('Refund payment error:', error);
    res.status(500).json({ message: 'Erreur lors du remboursement' });
  }
});

/**
 * GET /api/paiements/:id
 * Obtenir les détails d'un paiement
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const payment = mockPayments.find(p => p.id === parseInt(id));
    if (!payment) {
      return res.status(404).json({ message: 'Paiement non trouvé' });
    }

    res.json(payment);
  } catch (error) {
    console.error('Get payment details error:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des détails du paiement' });
  }
});

/**
 * GET /api/paiements/export
 * Exporter les paiements
 */
router.get('/export', async (req, res) => {
  try {
    const { format = 'csv', startDate, endDate, status } = req.query;

    let filteredPayments = [...mockPayments];

    // Filtrer par statut
    if (status) {
      filteredPayments = filteredPayments.filter(p => p.status === status);
    }

    // Filtrer par dates si fournies
    if (startDate) {
      const start = new Date(startDate);
      filteredPayments = filteredPayments.filter(p => new Date(p.date) >= start);
    }

    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999); // Inclure toute la journée
      filteredPayments = filteredPayments.filter(p => new Date(p.date) <= end);
    }

    // Générer le contenu selon le format demandé
    let content;
    let contentType;
    let filename;

    if (format === 'csv') {
      content = [
        'ID,Customer,Email,Amount,Method,Status,Date,Order ID,Transaction ID',
        ...filteredPayments.map(p =>
          `${p.id},"${p.customer}","${p.email}",${p.amount},"${p.method}","${p.status}","${p.date}",${p.orderId || ''},"${p.transactionId || ''}"`
        )
      ].join('\n');
      contentType = 'text/csv';
      filename = `paiements_${new Date().toISOString().split('T')[0]}.csv`;
    } else if (format === 'excel') {
      // Pour Excel, on utilise le même format CSV pour l'instant
      content = [
        'ID\tCustomer\tEmail\tAmount\tMethod\tStatus\tDate\tOrder ID\tTransaction ID',
        ...filteredPayments.map(p =>
          `${p.id}\t${p.customer}\t${p.email}\t${p.amount}\t${p.method}\t${p.status}\t${p.date}\t${p.orderId || ''}\t${p.transactionId || ''}`
        )
      ].join('\n');
      contentType = 'application/vnd.ms-excel';
      filename = `paiements_${new Date().toISOString().split('T')[0]}.xls`;
    } else if (format === 'pdf') {
      // Pour PDF, on retourne du texte simple pour l'instant
      content = `Rapport de Paiements\n\n` +
        `Période: ${startDate || 'Début'} - ${endDate || 'Aujourd\'hui'}\n` +
        `Statut: ${status || 'Tous'}\n` +
        `Total: ${filteredPayments.length} paiements\n\n` +
        filteredPayments.map(p =>
          `ID: ${p.id}\nClient: ${p.customer} (${p.email})\nMontant: ${p.amount}\nMéthode: ${p.method}\nStatut: ${p.status}\nDate: ${p.date}\n---`
        ).join('\n');
      contentType = 'text/plain';
      filename = `paiements_${new Date().toISOString().split('T')[0]}.txt`;
    } else {
      return res.status(400).json({ message: 'Format non supporté. Utilisez csv, excel ou pdf.' });
    }

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(content);
  } catch (error) {
    console.error('Export payments error:', error);
    res.status(500).json({ message: 'Erreur lors de l\'export des paiements' });
  }
});

export default router;
