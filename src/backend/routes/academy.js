import express from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import AcademyCourse from '../models/AcademyCourse.js';

const router = express.Router();

// GET /api/academy - List all academy courses (Public for vendors)
router.get('/', authenticateToken, async (req, res) => {
    try {
        const { category, type } = req.query;
        let whereClause = { status: 'published' };

        if (category && category !== 'Toutes') {
            whereClause.category = category;
        }
        if (type) {
            whereClause.type = type;
        }

        const courses = await AcademyCourse.findAll({
            where: whereClause,
            order: [['created_at', 'DESC']]
        });

        res.json(courses);
    } catch (error) {
        console.error('Erreur listing academy:', error);
        res.status(500).json({ error: 'Erreur serveur', details: error.message });
    }
});

// GET /api/academy/all - List all for Admin (includes draft)
router.get('/all', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const courses = await AcademyCourse.findAll({
            order: [['created_at', 'DESC']]
        });
        res.json(courses);
    } catch (error) {
        console.error('Erreur listing admin academy:', error);
        res.status(500).json({ error: 'Erreur serveur', details: error.message });
    }
});

// POST /api/academy - Admin create course
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const newCourse = await AcademyCourse.create(req.body);
        res.status(201).json(newCourse);
    } catch (error) {
        console.error('Erreur création cours:', error);
        res.status(500).json({ error: 'Erreur création', details: error.message });
    }
});

// PUT /api/academy/:id - Admin update course
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const course = await AcademyCourse.findByPk(req.params.id);
        if (!course) {
            return res.status(404).json({ error: 'Cours non trouvé' });
        }
        await course.update(req.body);
        res.json(course);
    } catch (error) {
        console.error('Erreur modif cours:', error);
        res.status(500).json({ error: 'Erreur modification', details: error.message });
    }
});

// DELETE /api/academy/:id - Admin delete course
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const course = await AcademyCourse.findByPk(req.params.id);
        if (!course) {
            return res.status(404).json({ error: 'Cours non trouvé' });
        }
        await course.destroy();
        res.json({ message: 'Cours supprimé' });
    } catch (error) {
        console.error('Erreur suppr cours:', error);
        res.status(500).json({ error: 'Erreur suppression', details: error.message });
    }
});

export default router;
