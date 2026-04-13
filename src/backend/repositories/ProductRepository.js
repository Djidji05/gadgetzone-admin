import BaseRepository from './BaseRepository.js';
import { Product, Category, Brand, Review, Store, Offer } from '../models/index.js';
import { Op, Sequelize } from 'sequelize';

export default class ProductRepository extends BaseRepository {
    constructor() {
        super(Product);
    }

    async findWithDetails(id) {
        return await this.model.findByPk(id, {
            include: [
                { model: Category, as: 'category' },
                { model: Brand, as: 'brand' },
                { model: Store, as: 'store' },
                { model: Review, as: 'reviews' }
            ]
        });
    }

    async search(filters = {}, options = {}) {
        const {
            q,
            category,
            brand,
            is_new,
            is_featured,
            promotions,
            storeId,
            isAdmin,
            ids,
            lat,
            lng,
            sortBy = 'relevance',
            limit = 10,
            offset = 0
        } = filters;

        const conditions = [];

        if (is_featured === 'true' || is_featured === true) {
            conditions.push({ is_featured: true });
        }

        if (q) {
            conditions.push({
                [Op.or]: [
                    { name: { [Op.iLike]: `%${q}%` } },
                    { description: { [Op.iLike]: `%${q}%` } }
                ]
            });
        }

        if (category) {
            const categoryId = parseInt(category);
            if (!isNaN(categoryId)) {
                // Optimisé: Récupère toutes les catégories en une fois pour construire l'arbre en mémoire
                const allCategories = await Category.findAll({
                    attributes: ['id', 'parentId'],
                    raw: true
                });

                const getDescendants = (parentId, list) => {
                    const children = list.filter(c => c.parentId === parentId);
                    let ids = children.map(c => c.id);
                    for (const id of ids) {
                        ids = ids.concat(getDescendants(id, list));
                    }
                    return ids;
                };

                const allCategoryIds = [categoryId, ...getDescendants(categoryId, allCategories)];
                conditions.push({ category_id: { [Op.in]: allCategoryIds } });
            }
        }

        if (brand) conditions.push({ brand_id: brand });

        let storeNameCondition = null;
        if (storeId && storeId !== 'undefined') {
            if (storeId === 'null') {
                conditions.push({ storeId: null });
            } else {
                const sid = parseInt(storeId);
                if (!isNaN(sid)) {
                    conditions.push({ storeId: sid });
                } else {
                    storeNameCondition = storeId;
                }
            }
        }

        if (is_new === 'true') conditions.push({ is_new: true });

        if (ids) {
            const idArray = ids.split(',').map(id => parseInt(id));
            if (idArray.length > 0) conditions.push({ id: { [Op.in]: idArray } });
        }

        if (!isAdmin) {
            conditions.push({ status: 'active' });
            conditions.push({ moderation_status: 'approved' });
            // The store status check would normally be done via a join/literal or in-memory
        }

        const whereClause = conditions.length > 0 ? { [Op.and]: conditions } : {};

        // 🚀 ARCHITECTURE TWO-STEP SEARCH (Performance Extrême - V2)
        // Étape 1.1 : Récupérer uniquement le count (Ultra-rapide)
        const totalCount = await this.model.count({
            where: whereClause,
            include: storeNameCondition ? [{
                model: Store,
                as: 'store',
                attributes: [],
                where: { name: storeNameCondition },
                required: true
            }] : [],
            distinct: true
        });

        if (totalCount === 0) {
            return { count: 0, rows: [] };
        }

        // Étape 1.2 : Récupérer uniquement les IDs (Ultra-rapide grâce à l'index super-sort)
        const productsIds = await this.model.findAll({
            where: whereClause,
            attributes: [
                'id',
                ...(lat && lng ? [
                    [
                        Sequelize.literal(`
                        6371 * acos(
                            cos(radians(${lat})) * cos(radians("store".latitude)) * 
                            cos(radians("store".longitude) - radians(${lng})) + 
                            sin(radians(${lat})) * sin(radians("store".latitude))
                        )
                        `),
                        'distance'
                    ]
                ] : [])
            ],
            include: [
                ...(storeNameCondition || (lat && lng) ? [{
                    model: Store,
                    as: 'store',
                    attributes: [],
                    where: storeNameCondition ? { name: storeNameCondition } : {},
                    required: storeNameCondition ? true : false
                }] : [])
            ],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: this._getOrderClause(sortBy, lat && lng),
            raw: true,
            subQuery: false
        });

        const idsToFetch = productsIds.map(p => p.id);

        // Étape 2 : Récupérer les détails complets UNIQUEMENT pour les IDs de la page actuelle
        const rows = await this.model.findAll({
            where: { id: { [Op.in]: idsToFetch } },
            include: [
                { model: Category, as: 'category', attributes: ['id', 'name'] },
                { model: Brand, as: 'brand', attributes: ['id', 'name', 'logo_url'] },
                {
                    model: Store,
                    as: 'store',
                    attributes: ['id', 'name', 'status']
                },
                {
                    model: Offer,
                    as: 'offers',
                    attributes: ['id', 'price', 'stock', 'condition', 'sales_count'],
                    where: { is_active: true, stock: { [Op.gt]: 0 } },
                    required: false,
                    limit: 1,
                    order: [['sales_count', 'DESC'], ['price', 'ASC']]
                }
            ],
            attributes: {
                exclude: ['description', 'specifications', 'features', 'images', 'variants', 'admin_note']
            },
            order: this._getOrderClause(sortBy),
            raw: true,
            nest: true
        });

        return {
            count: totalCount,
            rows: rows
        };
    }

    _getOrderClause(sortBy, hasLocation = false) {
        let order = [];
        
        // Priority 1: Sponsored products
        order.push(['is_sponsored', 'DESC']);

        // Priority 2: Proximity if location available
        if (hasLocation) {
            order.push([Sequelize.literal('distance'), 'ASC']);
        }

        switch (sortBy) {
            case 'price_asc':
                order.push(['buy_box_price', 'ASC NULLS LAST']);
                break;
            case 'price_desc':
                order.push(['buy_box_price', 'DESC NULLS LAST']);
                break;
            case 'newest':
                order.push(['created_at', 'DESC']);
                break;
            case 'relevance':
            default:
                // Formula: average_rating * 10 + sales_count * 2
                order.push(['average_rating', 'DESC']);
                order.push(['sales_count', 'DESC']);
                order.push(['created_at', 'DESC']);
                break;
        }
        return order;
    }
}
