import { Op } from 'sequelize';
import BaseRepository from './BaseRepository.js';
import { Order, OrderItem, Product, User, OrderLog, Store } from '../models/index.js';

export default class OrderRepository extends BaseRepository {
    constructor() {
        super(Order);
    }

    async findByUser(userId, options = {}) {
        return await this.model.findAndCountAll({
            where: { 
                user_id: userId,
                status: { [Op.ne]: 'payment_pending' } // 🔒 Cacher les brouillons non payés
            },
            distinct: true,
            include: [
                {
                    model: OrderItem,
                    as: 'items',
                    include: [{ model: Product, as: 'product', attributes: ['id', 'name', 'price', 'image_url'] }]
                }
            ],
            order: [['created_at', 'DESC']],
            ...options
        });
    }

    async findDetailed(id) {
        return await this.model.findByPk(id, {
            include: [
                { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
                {
                    model: OrderItem,
                    as: 'items',
                    include: [
                        {
                            model: Product,
                            as: 'product',
                            attributes: ['id', 'name', 'price', 'image_url'],
                            include: [{ model: Store, as: 'store', attributes: ['id', 'name'] }]
                        }
                    ]
                },
                {
                    model: OrderLog,
                    as: 'logs',
                    include: [{ model: User, as: 'actor', attributes: ['id', 'name', 'email'] }]
                }
            ],
            order: [[{ model: OrderLog, as: 'logs' }, 'created_at', 'ASC']]
        });
    }

    async createWithItems(orderData, itemsData, options = {}) {
        const transaction = options.transaction || null;
        const order = await this.model.create(orderData, { transaction });

        const itemPromises = itemsData.map(item =>
            OrderItem.create({ ...item, order_id: order.id }, { transaction })
        );

        await Promise.all(itemPromises);
        return order;
    }
}
