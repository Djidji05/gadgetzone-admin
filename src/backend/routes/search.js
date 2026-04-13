import express from 'express';
import { Op } from 'sequelize';
import { User, Order, Product, Store, Dispute, Category, sequelize } from '../models/index.js';

const router = express.Router();

router.get('/global', async (req, res) => {
    try {
        const { q } = req.query;
        if (!q || q.length < 2) {
            return res.json({
                users: [],
                orders: [],
                products: [],
                stores: [],
                disputes: [],
                categories: []
            });
        }

        const searchQuery = `%${q}%`;

        // 1. Search Users (Clients & Sellers)
        const users = await User.findAll({
            where: {
                [Op.or]: [
                    { name: { [Op.like]: searchQuery } },
                    { email: { [Op.like]: searchQuery } },
                    { phone: { [Op.like]: searchQuery } }
                ]
            },
            limit: 5,
            attributes: ['id', 'name', 'email', 'role'],
            raw: true
        });

        // 2. Search Orders
        const orders = await Order.findAll({
            where: {
                [Op.or]: [
                    { id: q.match(/^\d+$/) ? parseInt(q) : null },
                    { transaction_id: { [Op.like]: searchQuery } }
                ].filter(condition => (condition.id !== undefined && condition.id !== null) || condition.transaction_id)
            },
            include: [
                { model: User, as: 'user', attributes: ['name'] }
            ],
            limit: 5,
            raw: true,
            nest: true
        });

        // 3. Search Products
        const products = await Product.findAll({
            where: {
                [Op.or]: [
                    { name: { [Op.like]: searchQuery } },
                    { description: { [Op.like]: searchQuery } }
                ],
                status: { [Op.not]: 'deleted' }
            },
            limit: 5,
            attributes: ['id', 'name', 'price', 'image_url'],
            raw: true
        });

        // 4. Search Stores
        const stores = await Store.findAll({
            where: {
                [Op.or]: [
                    { name: { [Op.like]: searchQuery } },
                    { description: { [Op.like]: searchQuery } }
                ]
            },
            limit: 5,
            attributes: ['id', 'name', 'logoUrl', 'userId'],
            raw: true
        });

        // 5. Search Disputes
        const disputes = await Dispute.findAll({
            where: {
                [Op.or]: [
                    { id: q.match(/^\d+$/) ? parseInt(q) : null },
                    // Use cast for ENUM column to allow LIKE search in Postgres
                    sequelize.where(
                        sequelize.cast(sequelize.col('reason'), 'TEXT'),
                        { [Op.like]: searchQuery }
                    )
                ].filter(condition => (condition.id !== undefined && condition.id !== null) || condition.where)
            },
            limit: 5,
            attributes: ['id', 'reason', 'status'],
            raw: true
        });

        // 6. Search Categories
        const categories = await Category.findAll({
            where: {
                name: { [Op.like]: searchQuery }
            },
            limit: 5,
            attributes: ['id', 'name'],
            raw: true
        });

        res.json({
            users,
            orders,
            products,
            stores,
            disputes,
            categories
        });
    } catch (error) {
        console.error('Error in global search:', error);
        res.status(500).json({
            error: 'Internal server error during search',
            message: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

export default router;
