import express from 'express';
import { Op } from 'sequelize';
import { User, Order } from '../models/index.js';
import bcrypt from 'bcrypt';

const router = express.Router();

/**
 * GET /api/clients
 * Récupère tous les clients
 */
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const offset = (page - 1) * limit;
    
    const whereClause = {
      role: 'user' // Ne récupérer que les clients (pas les admins)
    };
    
    // Filtrer par recherche
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } }
      ];
    }
    
    const users = await User.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Order,
          as: 'orders',
          attributes: ['id', 'total_amount', 'status', 'created_at']
        }
      ],
      attributes: { exclude: ['password'] }, // Ne pas renvoyer le mot de passe
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    });
    
    // Ajouter le nombre de commandes pour chaque utilisateur
    const clients = users.rows.map(user => ({
      ...user.toJSON(),
      orders_count: user.orders ? user.orders.length : 0
    }));
    
    res.json({
      clients,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: users.count,
        totalPages: Math.ceil(users.count / limit)
      }
    });
  } catch (error) {
    console.error('Erreur clients:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des clients' });
  }
});

/**
 * GET /api/clients/:id
 * Récupère un client spécifique
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findByPk(id, {
      include: [
        {
          model: Order,
          as: 'orders',
          attributes: ['id', 'total_amount', 'status', 'created_at']
        }
      ],
      attributes: { exclude: ['password'] }
    });
    
    if (!user || user.role !== 'user') {
      return res.status(404).json({ error: 'Client non trouvé' });
    }
    
    res.json({
      ...user.toJSON(),
      orders_count: user.orders ? user.orders.length : 0
    });
  } catch (error) {
    console.error('Erreur client:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération du client' });
  }
});

/**
 * POST /api/clients
 * Crée un nouveau client
 */
router.post('/', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Le nom, email et mot de passe sont obligatoires' });
    }
    
    // Vérifier si l'email existe déjà
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Cet email est déjà utilisé' });
    }
    
    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'user'
    });
    
    // Retourner l'utilisateur sans le mot de passe
    const userResponse = await User.findByPk(newUser.id, {
      attributes: { exclude: ['password'] }
    });
    
    res.status(201).json(userResponse);
  } catch (error) {
    console.error('Erreur création client:', error);
    res.status(500).json({ error: 'Erreur lors de la création du client' });
  }
});

/**
 * PUT /api/clients/:id
 * Met à jour un client
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password, phone } = req.body;
    
    const user = await User.findByPk(id);
    
    if (!user || user.role !== 'user') {
      return res.status(404).json({ error: 'Client non trouvé' });
    }
    
    // Si email modifié, vérifier qu'il n'existe pas déjà
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ error: 'Cet email est déjà utilisé' });
      }
    }
    
    const updateData = {
      name: name || user.name,
      email: email || user.email
    };
    
    // Si mot de passe fourni, le hasher
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }
    
    await user.update(updateData);
    
    // Retourner l'utilisateur mis à jour sans le mot de passe
    const updatedUser = await User.findByPk(id, {
      attributes: { exclude: ['password'] }
    });
    
    res.json(updatedUser);
  } catch (error) {
    console.error('Erreur mise à jour client:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du client' });
  }
});

/**
 * DELETE /api/clients/:id
 * Supprime un client
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findByPk(id);
    
    if (!user || user.role !== 'user') {
      return res.status(404).json({ error: 'Client non trouvé' });
    }
    
    await user.destroy();
    
    res.json({ message: 'Client supprimé avec succès' });
  } catch (error) {
    console.error('Erreur suppression client:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression du client' });
  }
});

export default router;
