import ProductService from '../services/ProductService.js';

class ProductController {
    constructor() {
        this.productService = new ProductService();
    }

    getAllProducts = async (req, res) => {
        try {
            const {
                page = 1,
                limit = 10,
                search,
                category,
                brand,
                is_new,
                promotions,
                vendor,
                storeId,
                ids,
                lat,
                lng
            } = req.query;

            const isAdmin = req.user?.role === 'admin' || req.user?.role === 'gestionnaire';

            const result = await this.productService.searchProducts({
                page,
                limit,
                q: search,
                category,
                brand,
                is_new,
                promotions,
                storeId: vendor || storeId,
                ids,
                lat,
                lng,
                isAdmin
            });

            res.json(result);
        } catch (error) {
            console.error('❌ Controller Error [getAllProducts]:', error);
            res.status(500).json({ error: 'Failed to fetch products', message: error.message, stack: error.stack });
        }
    };

    searchProducts = async (req, res) => {
        try {
            const { q, page = 1, limit = 10, ...filters } = req.query;
            const isAdmin = req.user?.role === 'admin' || req.user?.role === 'gestionnaire';
            const result = await this.productService.searchProducts({
                ...filters,
                q,
                page,
                limit,
                lat: filters.lat,
                lng: filters.lng,
                isAdmin
            });

            // The frontend website expects a flat array for search results
            res.json(result.products || result);
        } catch (error) {
            console.error('❌ Controller Error [searchProducts]:', error);
            res.status(500).json({ error: 'Search failed', message: error.message });
        }
    };

    getNewProducts = async (req, res) => {
        try {
            const { limit = 12 } = req.query;
            const isAdmin = req.user?.role === 'admin' || req.user?.role === 'gestionnaire';

            const result = await this.productService.searchProducts({
                page: 1,
                limit,
                is_new: 'true',
                isAdmin
            });

            res.json(result.products || result);
        } catch (error) {
            console.error('❌ Controller Error [getNewProducts]:', error);
            res.status(500).json({ error: 'Failed to fetch new products', message: error.message });
        }
    };

    getFeaturedProducts = async (req, res) => {
        try {
            const products = await this.productService.getFeaturedProducts();
            res.json(products);
        } catch (error) {
            console.error('❌ Controller Error [getFeaturedProducts]:', error);
            res.status(500).json({ error: 'Failed to fetch featured products', message: error.message });
        }
    };

    getProductById = async (req, res) => {
        try {
            const isAdmin = req.user?.role === 'admin' || req.user?.role === 'gestionnaire';
            const product = await this.productService.getProductWithDetails(req.params.id, isAdmin);

            if (!product) {
                return res.status(404).json({ error: 'Product not found or inactive' });
            }
            res.json(product);
        } catch (error) {
            console.error('❌ Controller Error [getProductById]:', error);
            res.status(500).json({ error: 'Failed to fetch product', message: error.message });
        }
    };

    createProduct = async (req, res) => {
        try {
            // 🛡️ SÉCURISATION MASS ASSIGNMENT : Filtrer et forcer les champs critiques
            let data = { ...req.body };
            if (req.user.role === 'seller') {
                // Forcer la boutique de l'utilisateur et le statut 'pending'
                data.storeId = req.store.id;
                data.moderation_status = 'pending';
                // Empêcher le sponsoring gratuit
                delete data.is_sponsored;
                delete data.is_featured;
            } else if (req.user.role === 'admin' || req.user.role === 'gestionnaire') {
                data.moderation_status = 'approved';
            }
            const product = await this.productService.create(data);
            res.status(201).json(product);
        } catch (error) {
            console.error('❌ Controller Error [createProduct]:', error);
            res.status(400).json({ error: 'Failed to create product', message: error.message });
        }
    };

    updateProduct = async (req, res) => {
        try {
            const product = await this.productService.getById(req.params.id);
            if (!product) return res.status(404).json({ error: 'Product not found' });

            // Check ownership if seller
            if (req.user.role === 'seller') {
                if (!req.store || product.storeId !== req.store.id) {
                    return res.status(403).json({ error: 'Access denied: this product does not belong to your store' });
                }

                // 🛡️ SÉCURISATION MASS ASSIGNMENT : Filtrer les champs autorisés pour les vendeurs
                const allowedFields = [
                    'name', 'description', 'price', 'stock', 'category_id', 
                    'image_url', 'images', 'condition', 'specifications', 'tags',
                    'brand_id', 'status'
                ];
                const filteredData = {};
                allowedFields.forEach(field => {
                    if (req.body[field] !== undefined) {
                        filteredData[field] = req.body[field];
                    }
                });
                updateData = filteredData;
            }

            const updatedProduct = await this.productService.update(req.params.id, updateData);
            res.json(updatedProduct);
        } catch (error) {
            console.error('❌ Controller Error [updateProduct]:', error);
            res.status(400).json({ error: 'Failed to update product', message: error.message });
        }
    };

    deleteProduct = async (req, res) => {
        try {
            const product = await this.productService.getById(req.params.id);
            if (!product) return res.status(404).json({ error: 'Product not found' });

            // Check ownership if seller
            if (req.user.role === 'seller' && product.storeId !== req.store.id) {
                return res.status(403).json({ error: 'Access denied' });
            }

            // Logical delete if reason provided (admin only)
            if ((req.user.role === 'admin' || req.user.role === 'gestionnaire') && req.body.reason) {
                const updated = await this.productService.update(req.params.id, {
                    status: 'deleted',
                    admin_note: req.body.reason
                });
                return res.json({ message: 'Product marked as deleted', product: updated });
            }

            await this.productService.delete(req.params.id);
            res.status(204).send();
        } catch (error) {
            console.error('❌ Controller Error [deleteProduct]:', error);
            res.status(500).json({ error: 'Failed to delete product', message: error.message });
        }
    };
}

export default new ProductController();
