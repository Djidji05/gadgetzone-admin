<template>
  <div>
    <div class="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
      <h2 class="text-lg font-semibold text-gray-800">Produits Vedettes</h2>
      
      <div class="flex flex-col sm:flex-row gap-3">
        <!-- Filter View -->
        <select 
          v-model="viewFilter" 
          class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
        >
          <option value="all">Tous les produits</option>
          <option value="featured">⭐ Produits Vedettes</option>
          <option value="bestsellers">🔥 Meilleures Ventes</option>
          <option value="lowstock">⚠️ Stock Faible</option>
        </select>

        <!-- Search -->
        <div class="relative">
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="Rechercher un produit..." 
            class="pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm w-full sm:w-64"
          >
          <i class="fas fa-search absolute left-3 top-2.5 text-gray-400"></i>
        </div>
      </div>
    </div>

    <!-- Stats / Summary -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div class="bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-center justify-between">
        <div>
          <p class="text-sm text-blue-600 font-medium">Produits Vedettes</p>
          <p class="text-2xl font-bold text-blue-800">{{ featuredCount }}</p>
        </div>
        <i class="fas fa-star text-blue-300 text-3xl"></i>
      </div>
      <!-- Add more stats if needed -->
    </div>

    <!-- Products Table -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-gray-50 border-b border-gray-100 text-xs uppercase text-gray-500 font-semibold">
              <th class="px-6 py-4">Produit</th>
              <th class="px-6 py-4">Catégorie</th>
              <th class="px-6 py-4">Prix</th>
              <th class="px-6 py-4">Stock</th>
              <th class="px-6 py-4 text-center">Vedette</th>
            </tr>
          </thead>
          <tbody class="text-sm">
            <tr v-if="loading" class="animate-pulse">
              <td colspan="5" class="px-6 py-8 text-center text-gray-400">Chargement des produits...</td>
            </tr>
            <tr v-else-if="filteredProducts.length === 0">
              <td colspan="5" class="px-6 py-8 text-center text-gray-500">Aucun produit trouvé.</td>
            </tr>
            <tr 
              v-for="product in filteredProducts" 
              :key="product.id" 
              class="border-b border-gray-50 hover:bg-gray-50/50 transition-colors group"
            >
              <td class="px-6 py-3">
                <div class="flex items-center gap-3">
                  <div class="h-10 w-10 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden border border-gray-200">
                    <img 
                      v-if="product.image_url" 
                      :src="product.image_url" 
                      :alt="product.name" 
                      class="h-full w-full object-cover"
                    >
                    <div v-else class="h-full w-full flex items-center justify-center text-gray-300">
                      <i class="fas fa-box"></i>
                    </div>
                  </div>
                  <div>
                    <p class="font-medium text-gray-900 truncate max-w-[200px]" :title="product.name">{{ product.name }}</p>
                    <p v-if="product.is_new" class="text-[10px] inline-block px-1.5 py-0.5 rounded bg-green-100 text-green-700 font-bold">NOUVEAU</p>
                  </div>
                </div>
              </td>
              <td class="px-6 py-3 text-gray-600">
                {{ product.category?.name || 'Non classé' }}
              </td>
              <td class="px-6 py-3 font-medium text-gray-900">
                {{ formatPrice(product.price) }}
              </td>
              <td class="px-6 py-3">
                <span 
                  class="px-2 py-1 rounded text-xs font-semibold"
                  :class="getStockClass(product.stock)"
                >
                  {{ product.stock }}
                </span>
              </td>
              <td class="px-6 py-3 text-center">
                <button 
                  @click="toggleFeatured(product)"
                  class="relative inline-flex items-center justify-center h-8 w-8 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  :class="product.is_featured ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'"
                  :title="product.is_featured ? 'Retirer des vedettes' : 'Ajouter aux vedettes'"
                  :disabled="togglingId === product.id"
                >
                  <i v-if="togglingId === product.id" class="fas fa-spinner fa-spin"></i>
                  <i v-else class="fas" :class="product.is_featured ? 'fa-star' : 'fa-star'"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- Simple Pagination (Client-side for now based on getAll limit) -->
      <div v-if="!loading && filteredProducts.length > 0" class="px-6 py-4 border-t border-gray-100 flex justify-between items-center text-sm text-gray-500">
        <span>Affichage de {{ filteredProducts.length }} produits</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { productService, statsService } from '@/services/api';
import { useUIStore } from '@/stores/ui';

const uiStore = useUIStore();
const products = ref<any[]>([]);
const bestSellerIds = ref<number[]>([]);
const loading = ref(false);
const togglingId = ref<number | null>(null);

const viewFilter = ref('all'); // all, featured, bestsellers, lowstock
const searchQuery = ref('');

const loadData = async () => {
  loading.value = true;
  try {
    // Parallel fetch: Products available and Best Sellers
    const [allProducts, topProducts] = await Promise.all([
      productService.getAll(),
      statsService.getTopProducts(50)
    ]);
    
    products.value = allProducts;
    bestSellerIds.value = topProducts.map((p: any) => p.id);
    
  } catch (error) {
    console.error('Failed to load products data', error);
  } finally {
    loading.value = false;
  }
};

const filteredProducts = computed(() => {
  let result = products.value;

  // 1. View Filtering
  if (viewFilter.value === 'featured') {
    result = result.filter(p => p.is_featured);
  } else if (viewFilter.value === 'bestsellers') {
    result = result.filter(p => bestSellerIds.value.includes(p.id));
    // Optional: Sort by bestseller rank (index in bestSellerIds)
    result.sort((a, b) => {
      return bestSellerIds.value.indexOf(a.id) - bestSellerIds.value.indexOf(b.id);
    });
  } else if (viewFilter.value === 'lowstock') {
    result = result.filter(p => p.stock < 10);
  }

  // 2. Search Filtering
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(p => 
      p.name.toLowerCase().includes(query) || 
      (p.category?.name && p.category.name.toLowerCase().includes(query))
    );
  }

  return result;
});

const featuredCount = computed(() => products.value.filter(p => p.is_featured).length);

const toggleFeatured = async (product: any) => {
  togglingId.value = product.id;
  const newValue = !product.is_featured;
  
  try {
    await productService.update(product.id, { is_featured: newValue });
    // Update local state
    product.is_featured = newValue;
  } catch (error) {
    console.error('Failed to toggle featured status', error);
    uiStore.addToast('Erreur lors de la mise à jour', 'error');
  } finally {
    togglingId.value = null;
  }
};

const formatPrice = (price: any) => {
  return new Intl.NumberFormat('fr-HT', { 
    style: 'currency', 
    currency: 'HTG' 
  }).format(Number(price));
};

const getStockClass = (stock: number) => {
  if (stock === 0) return 'bg-red-100 text-red-700';
  if (stock < 10) return 'bg-orange-100 text-orange-700';
  return 'bg-green-100 text-green-700';
};

onMounted(() => {
  loadData();
});
</script>
