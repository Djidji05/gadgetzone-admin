import express from 'express';
import { Category } from '../models/index.js';

const router = express.Router();

/**
 * GET /api/categories
 * Récupère toutes les catégories
 */
router.get('/', async (req, res) => {
  try {
    const categories = await Category.findAll({
      order: [['name', 'ASC']]
    });

    res.json(categories);
  } catch (error) {
    console.error('Erreur catégories:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des catégories' });
  }
});

/**
 * GET /api/categories/:id
 * Récupère une catégorie spécifique
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findByPk(id);

    if (!category) {
      return res.status(404).json({ error: 'Catégorie non trouvée' });
    }

    res.json(category);
  } catch (error) {
    console.error('Erreur catégorie:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération de la catégorie' });
  }
});

/**
 * POST /api/categories
 * Crée une nouvelle catégorie
 */
router.post('/', async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Le nom est obligatoire' });
    }

    const newCategory = await Category.create({
      name,
      description: description || null
    });

    res.status(201).json(newCategory);
  } catch (error) {
    console.error('Erreur création catégorie:', error);
    res.status(500).json({ error: 'Erreur lors de la création de la catégorie' });
  }
});

/**
 * PUT /api/categories/:id
 * Met à jour une catégorie
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const category = await Category.findByPk(id);

    if (!category) {
      return res.status(404).json({ error: 'Catégorie non trouvée' });
    }

    await category.update({
      name: name || category.name,
      description: description !== undefined ? description : category.description
    });

    res.json(category);
  } catch (error) {
    console.error('Erreur mise à jour catégorie:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour de la catégorie' });
  }
});

/**
 * DELETE /api/categories/:id
 * Supprime une catégorie
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findByPk(id);

    if (!category) {
      return res.status(404).json({ error: 'Catégorie non trouvée' });
    }

    await category.destroy();

    res.json({ message: 'Catégorie supprimée avec succès' });
  } catch (error) {
    console.error('Erreur suppression catégorie:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression de la catégorie' });
  }
});

export default router;
