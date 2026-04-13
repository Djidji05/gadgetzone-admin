import express from 'express';
import { Conversation, Message, User, Store } from '../models/index.js';
import { authenticateToken } from '../middleware/auth.js';
import { Op } from 'sequelize';

const router = express.Router();

/**
 * GET /api/messages/conversations
 * Get all conversations for the current user
 */
router.get('/conversations', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;

        const conversations = await Conversation.findAll({
            where: {
                [Op.or]: [
                    { participant1Id: userId },
                    { participant2Id: userId }
                ]
            },
            include: [
                {
                    model: User,
                    as: 'participant1',
                    attributes: ['id', 'name', 'email', 'role'],
                    include: [{ model: Store, as: 'store', attributes: ['name', 'logoUrl'] }]
                },
                {
                    model: User,
                    as: 'participant2',
                    attributes: ['id', 'name', 'email', 'role'],
                    include: [{ model: Store, as: 'store', attributes: ['name', 'logoUrl'] }]
                }
            ],
            order: [['lastMessageAt', 'DESC']]
        });

        // Format for frontend
        const formattedConversations = conversations.map(conv => {
            const otherParticipant = conv.participant1Id === userId ? conv.participant2 : conv.participant1;
            return {
                id: conv.id,
                otherParticipant: {
                    id: otherParticipant.id,
                    name: otherParticipant.store?.name || otherParticipant.name,
                    role: otherParticipant.role,
                    logoUrl: otherParticipant.store?.logoUrl
                },
                lastMessage: conv.lastMessage,
                lastMessageAt: conv.lastMessageAt
            };
        });

        res.json(formattedConversations);
    } catch (error) {
        console.error('Get conversations error:', error);
        res.status(500).json({ error: 'Server error', message: error.message });
    }
});

/**
 * GET /api/messages/conversations/:id/messages
 * Get message history for a conversation
 */
router.get('/conversations/:id/messages', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        // Verify participant
        const conversation = await Conversation.findByPk(id);
        if (!conversation || (conversation.participant1Id !== userId && conversation.participant2Id !== userId)) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        const { limit = 50, offset = 0 } = req.query;
        
        const messages = await Message.findAll({
            where: { conversationId: id },
            order: [['createdAt', 'DESC']], // Charger les plus récents en premier
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        // Remettre dans l'ordre chronologique pour le frontend
        messages.reverse();

        // Mark as read
        await Message.update(
            { isRead: true },
            {
                where: {
                    conversationId: id,
                    senderId: { [Op.ne]: userId },
                    isRead: false
                }
            }
        );

        res.json(messages);
    } catch (error) {
        console.error('Get messages error:', error);
        res.status(500).json({ error: 'Server error', message: error.message });
    }
});

/**
 * POST /api/messages/send
 * Send a message (creates conversation if not exists)
 */
router.post('/send', authenticateToken, async (req, res) => {
    try {
        const { receiverId, content } = req.body;
        const senderId = req.user.id;

        if (!receiverId || !content) {
            return res.status(400).json({ error: 'Receiver and content are required' });
        }

        // Find or create conversation
        let conversation = await Conversation.findOne({
            where: {
                [Op.or]: [
                    { [Op.and]: [{ participant1Id: senderId }, { participant2Id: receiverId }] },
                    { [Op.and]: [{ participant1Id: receiverId }, { participant2Id: senderId }] }
                ]
            }
        });

        if (!conversation) {
            conversation = await Conversation.create({
                participant1Id: senderId,
                participant2Id: receiverId,
                lastMessage: content,
                lastMessageAt: new Date()
            });
        } else {
            conversation.lastMessage = content;
            conversation.lastMessageAt = new Date();
            await conversation.save();
        }

        const message = await Message.create({
            conversationId: conversation.id,
            senderId,
            content
        });

        res.status(201).json(message);
    } catch (error) {
        console.error('Send message error:', error);
        res.status(500).json({ error: 'Server error', message: error.message });
    }
});

export default router;
