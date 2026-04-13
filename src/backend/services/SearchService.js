import client from '../config/meilisearch.js';

class SearchService {
    constructor() {
        this.client = client;
        this.indexName = 'products';
    }

    /**
     * Index a product in Meilisearch
     */
    async indexProduct(product) {
        if (!this.client) return;
        try {
            const index = this.client.index(this.indexName);
            await index.addDocuments([{
                id: product.id,
                name: product.name,
                description: product.description,
                price: parseFloat(product.price),
                category: product.category?.name,
                brand: product.brand?.name,
                store: product.store?.name,
                status: product.status,
                moderation_status: product.moderation_status,
                image_url: product.image_url,
                is_sponsored: product.is_sponsored || false,
                average_rating: parseFloat(product.average_rating || 0),
                sales_count: parseInt(product.sales_count || 0),
                created_at: product.created_at,
                _geo: product.store?.latitude && product.store?.longitude ? {
                    lat: parseFloat(product.store.latitude),
                    lng: parseFloat(product.store.longitude)
                } : null
            }]);
        } catch (error) {
            console.error(`❌ Search Indexing Error [id:${product.id}]:`, error.message);
        }
    }

    /**
     * Remove a product from index
     */
    async deleteProduct(productId) {
        if (!this.client) return;
        try {
            await this.client.index(this.indexName).deleteDocument(productId);
        } catch (error) {
            console.error(`❌ Search Deletion Error [id:${productId}]:`, error.message);
        }
    }

    /**
     * Search products with typo tolerance and speed
     */
    async search(query, filters = {}, options = {}) {
        if (!this.client) return null;
        try {
            const searchOptions = {
                filter: filters,
                limit: options.limit || 10
            };

            if (options?.lat && options?.lng) {
                // Meilisearch geo-sort: prioritize distance
                searchOptions.sort = [`_geoPoint(${options.lat}, ${options.lng}):asc`];
            }

            const results = await this.client.index(this.indexName).search(query, searchOptions);
            return results;
        } catch (error) {
            console.error('❌ Meilisearch Query Error:', error.message);
            return null;
        }
    }

    /**
     * Full synchronization (Initial seed)
     */
    async syncAll(products) {
        if (!this.client) return;
        try {
            const documents = products.map(p => ({
                id: p.id,
                name: p.name,
                description: p.description,
                price: parseFloat(p.price),
                category: p.category?.name,
                brand: p.brand?.name,
                store: p.store?.name,
                status: p.status,
                moderation_status: p.moderation_status,
                image_url: p.image_url,
                is_sponsored: p.is_sponsored || false,
                average_rating: parseFloat(p.average_rating || 0),
                sales_count: parseInt(p.sales_count || 0),
                created_at: p.created_at,
                _geo: p.store?.latitude && p.store?.longitude ? {
                    lat: parseFloat(p.store.latitude),
                    lng: parseFloat(p.store.longitude)
                } : null
            }));
            await this.client.index(this.indexName).addDocuments(documents);
            console.log(`✅ Indexed ${documents.length} products in Meilisearch`);
        } catch (error) {
            console.error('❌ Meilisearch Sync Error:', error.message);
        }
    }

    /**
     * Configure index settings (Filterable, Sortable, etc.)
     */
    async setupIndex() {
        if (!this.client) return;
        try {
            const index = this.client.index(this.indexName);
            await index.updateSettings({
                filterableAttributes: ['status', 'moderation_status', 'category', 'brand', 'store', 'is_sponsored'],
                sortableAttributes: ['price', 'created_at', 'average_rating', 'sales_count', '_geo']
            });
            console.log('✅ Meilisearch Index Settings Updated (Geo-Sorting Enabled)');
        } catch (error) {
            console.error('❌ Meilisearch Setup Error:', error.message);
        }
    }
}

export default new SearchService();
