import BaseService from './BaseService.js';
import ProductRepository from '../repositories/ProductRepository.js';
import { applyPromotionsToProducts, applyPromotionsToProduct } from '../utils/promotionHelper.js';
import { getCache, setCache, delCache, delCacheByPattern } from '../config/redis.js';
import searchService from './SearchService.js';
import OfferRepository from '../repositories/OfferRepository.js';
import { Product, Offer } from '../models/index.js';
import LocalFileService from './LocalFileService.js';


export default class ProductService extends BaseService {
    constructor() {
        const repository = new ProductRepository();
        super(repository);
        this.offerRepository = new OfferRepository();
    }

    async getProductWithDetails(id, isAdmin = false) {
        const cacheKey = `product:${id}:${isAdmin ? 'admin' : 'public'}`;

        if (!isAdmin) {
            const cached = await getCache(cacheKey);
            if (cached) return cached;
        }

        const product = await this.repository.findWithDetails(id);
        if (!product) return null;

        // If not admin and product/store is not active, return null
        if (!isAdmin && (
            product.status !== 'active' ||
            product.moderation_status !== 'approved' ||
            (product.store && product.store.status !== 'active')
        )) {
            return null;
        }

        const processed = await applyPromotionsToProduct(product);

        // FETCH OFFERS & BUY BOX WINNER
        const offers = await this.offerRepository.findByProduct(id);
        const availableOffers = offers.filter(o => o.stock > 0 && o.is_active);

        const buyBoxWinner = availableOffers.length > 0 ? availableOffers[0] : null;

        const result = {
            ...processed.toJSON ? processed.toJSON() : processed,
            offers: availableOffers,
            buyBox: buyBoxWinner,
            // Override main price and stock with Buy Box winner if available
            price: buyBoxWinner ? buyBoxWinner.price : processed.price,
            stock: buyBoxWinner ? buyBoxWinner.stock : processed.stock
        };

        if (!isAdmin) {
            await setCache(cacheKey, result, 3600); // Cache for 1 hour
        }

        return result;
    }

    async searchProducts(filters = {}) {
        const isPublicSearch = !filters.isAdmin;
        const cacheKey = `products:search:${JSON.stringify(filters)}`;
        
        console.log(`[ProductService] Search called - Public: ${isPublicSearch}, Query: ${filters.q}`);

        if (isPublicSearch) {
            const cached = await getCache(cacheKey);
            if (cached) {
                console.log('📦 Returning cached search results');
                return cached;
            }
        }

        // Instant search with Meilisearch if 'q' is provided and no category filter (which requires recursive SQL)
        if (filters.q && !filters.isAdmin && !filters.storeId && !filters.category) {
            console.log('🔍 Using Meilisearch for query:', filters.q);
            const searchResults = await searchService.search(filters.q, 
                "status = 'active' AND moderation_status = 'approved'",
                { 
                    lat: filters.lat, 
                    lng: filters.lng,
                    limit: filters.limit || 12 
                }
            );
            
            if (searchResults && searchResults.hits) {
                const responseList = {
                    products: searchResults.hits,
                    pagination: {
                        total: searchResults.nbHits,
                        page: 1,
                        limit: searchResults.limit,
                        totalPages: 1
                    }
                };
                
                if (isPublicSearch) {
                    await setCache(cacheKey, responseList, 600);
                }
                
                return responseList;
            }
        }

        // Fallback to traditional DB search for advanced filters
        console.log('🏛️ Falling back to SQL search');
        const result = await this.repository.search(filters);

        // Convertir en objets simples immédiatement (Performance Rocket)
        const productsList = result.rows.map(p => p.toJSON ? p.toJSON() : p);

        // Appliquer les promotions en mémoire (Cache CPU ultra-rapide)
        const products = await applyPromotionsToProducts(productsList);

        // Les champs dénormalisés sont déjà présents
        const processedProducts = products.map(p => ({
            ...p,
            price: Number(p.buy_box_price || p.price || 0),
            totalSales: parseInt(p.sales_count || 0)
        }));

        const responseList = {
            products: processedProducts,
            pagination: {
                total: result.count,
                page: parseInt(filters.page || 1),
                limit: parseInt(filters.limit || 10),
                totalPages: Math.ceil(result.count / (filters.limit || 10))
            }
        };

        if (isPublicSearch) {
            await setCache(cacheKey, responseList, 600);
        }

        return responseList;
    }

    async getFeaturedProducts() {
        const cacheKey = 'products:featured';
        const cached = await getCache(cacheKey);
        if (cached) return cached;

        const result = await this.repository.search({
            is_featured: 'true',
            limit: 8
        });
        const processed = await applyPromotionsToProducts(result.rows);

        await setCache(cacheKey, processed, 3600);
        return processed;
    }

    async create(data, options = {}) {
        // Traiter les images Base64 avant création
        if (data.image_url) {
            data.image_url = await LocalFileService.saveBase64Image(data.image_url, 'products', 'prod_main');
        }
        if (Array.isArray(data.images)) {
            data.images = await Promise.all(
                data.images.map((img, i) => LocalFileService.saveBase64Image(img, 'products', `prod_gal_${i}`))
            );
        }

        const product = await super.create(data, options);

        // Create the initial offer for this product
        await Offer.create({
            productId: product.id,
            storeId: data.storeId,
            price: data.price,
            stock: data.stock || 0,
            condition: data.condition || 'new',
            shipping_days_min: data.shipping_days_min || 3,
            shipping_days_max: data.shipping_days_max || 5
        });


        // Refresh full object to get associations for indexing
        const detailedProduct = await this.repository.findWithDetails(product.id);
        if (detailedProduct) await searchService.indexProduct(detailedProduct);
        await this.invalidateProductCache();
        return product;
    }

    async update(id, data, options = {}) {
        // Traiter les images Base64 avant mise à jour
        if (data.image_url) {
            data.image_url = await LocalFileService.saveBase64Image(data.image_url, 'products', `prod_${id}_main`);
        }
        if (Array.isArray(data.images)) {
            data.images = await Promise.all(
                data.images.map((img, i) => LocalFileService.saveBase64Image(img, 'products', `prod_${id}_gal_${i}`))
            );
        }

        const product = await super.update(id, data, options);
        // Refresh full object to get associations for indexing
        const detailedProduct = await this.repository.findWithDetails(id);
        if (detailedProduct) await searchService.indexProduct(detailedProduct);
        await this.invalidateProductCache(id);
        return product;
    }


    async delete(id, options = {}) {
        const deleted = await super.delete(id, options);
        if (deleted) {
            await searchService.deleteProduct(id);
            await this.invalidateProductCache(id);
        }
        return deleted;
    }

    async invalidateProductCache(id = null) {
        if (id) {
            await delCache(`product:${id}:public`);
            await delCache(`product:${id}admin`);
        }
        await delCacheByPattern('products:search:*');
        await delCache('products:featured');
    }

    async updateStock(productId, quantityChange) {
        const product = await this.repository.findById(productId);
        if (!product) throw new Error('Product not found');

        const newStock = product.stock + quantityChange;
        if (newStock < 0) throw new Error('Insufficient stock');

        const updated = await this.repository.update(productId, { stock: newStock });

        // Re-index after stock change
        const detailedProduct = await this.repository.findWithDetails(productId);
        if (detailedProduct) await searchService.indexProduct(detailedProduct);

        await this.invalidateProductCache(productId);
        return updated;
    }

    async syncAllToSearch() {
        const { rows: products } = await this.repository.search({ limit: 1000 });
        await searchService.syncAll(products);
        return products.length;
    }
}
