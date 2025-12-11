import express from 'express';
import BlogPost from '../models/BlogPost.js';

const router = express.Router();

// Get all blog posts with stats
router.get('/', async (req, res) => {
    try {
        const posts = await BlogPost.findAll({
            order: [['createdAt', 'DESC']]
        });

        const stats = {
            published: posts.filter(p => p.status === 'published').length,
            drafts: posts.filter(p => p.status === 'draft').length,
            totalViews: posts.reduce((sum, p) => sum + p.views, 0),
            total: posts.length
        };

        res.json({ posts, stats });
    } catch (error) {
        console.error('Get blog posts error:', error);
        res.status(500).json({ message: 'Erreur lors de la récupération des articles' });
    }
});

// Get single post
router.get('/:id', async (req, res) => {
    try {
        const post = await BlogPost.findByPk(req.params.id);

        if (!post) {
            return res.status(404).json({ message: 'Article non trouvé' });
        }

        res.json(post);
    } catch (error) {
        console.error('Get blog post error:', error);
        res.status(500).json({ message: 'Erreur lors de la récupération de l\'article' });
    }
});

// Create post
router.post('/', async (req, res) => {
    try {
        const post = await BlogPost.create(req.body);
        res.status(201).json(post);
    } catch (error) {
        console.error('Create blog post error:', error);
        res.status(500).json({ message: 'Erreur lors de la création de l\'article' });
    }
});

// Update post
router.put('/:id', async (req, res) => {
    try {
        const post = await BlogPost.findByPk(req.params.id);

        if (!post) {
            return res.status(404).json({ message: 'Article non trouvé' });
        }

        await post.update(req.body);
        res.json(post);
    } catch (error) {
        console.error('Update blog post error:', error);
        res.status(500).json({ message: 'Erreur lors de la mise à jour de l\'article' });
    }
});

// Delete post
router.delete('/:id', async (req, res) => {
    try {
        const post = await BlogPost.findByPk(req.params.id);

        if (!post) {
            return res.status(404).json({ message: 'Article non trouvé' });
        }

        await post.destroy();
        res.json({ message: 'Article supprimé avec succès' });
    } catch (error) {
        console.error('Delete blog post error:', error);
        res.status(500).json({ message: 'Erreur lors de la suppression de l\'article' });
    }
});

export default router;
