import express from 'express';
import AIController from '../controllers/AIController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * POST /api/ai/chat
 * Endpoint principal pour l'assistant IA maison
 */
router.post('/chat', AIController.handleChat);

/**
 * GET /api/ai/suggestions
 * Récupère des suggestions de questions basées sur le contexte
 */
router.get('/suggestions', AIController.getSuggestions);

export default router;
