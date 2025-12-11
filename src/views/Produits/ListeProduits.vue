<template>
  <div class="p-6">
    <PageBreadcrumb :pageTitle="currentPageTitle" />

    <div class="max-w-7xl mx-auto">
      <div class="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <!-- Header -->
        <div class="border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-primary-50 to-primary-100 dark:from-gray-800 dark:to-gray-900 p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <div class="p-2 bg-primary-600 rounded-lg">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </div>
              Liste des produits
            </h2>
            <p class="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Gérez votre catalogue de produits, stocks et prix
            </p>
          </div>
          <router-link
            to="/ajouter-produit"
            class="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-2.5 text-sm font-medium text-white shadow-lg hover:from-blue-700 hover:to-blue-800 hover:shadow-xl transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <svg class="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" />
            </svg>
            <span class="text-white font-bold">Ajouter un produit</span>
          </router-link>
        </div>

        <!-- Filtres et recherche -->
        <div class="p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
          <div class="grid grid-cols-1 gap-4 md:grid-cols-12">
            <div class="md:col-span-4">
              <div class="relative">
                <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  v-model="searchQuery"
                  placeholder="Rechercher un produit..."
                  class="block w-full rounded-lg border-gray-300 py-2.5 pl-10 pr-3 text-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>
            <div class="md:col-span-3">
              <select
                v-model="selectedCategory"
                class="block w-full rounded-lg border-gray-300 py-2.5 pl-3 pr-10 text-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="">Toutes les catégories</option>
                <option v-for="category in categories" :key="category" :value="category">
                  {{ category }}
                </option>
              </select>
            </div>
            <div class="md:col-span-5 flex items-center gap-4 flex-wrap">
              <div class="flex items-center p-2 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                <input
                  id="vedette"
                  v-model="filtreVedette"
                  type="checkbox"
                  class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                />
                <label for="vedette" class="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1 cursor-pointer">
                  <svg class="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                  Vedettes
                </label>
              </div>
              <div class="flex items-center p-2 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                <input
                  id="nouveau"
                  v-model="filtreNouveau"
                  type="checkbox"
                  class="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700"
                />
                <label for="nouveau" class="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1 cursor-pointer">
                  <svg class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  Nouveaux
                </label>
              </div>
            </div>
          </div>
        </div>

        <!-- Tableau des produits -->
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead class="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Produit
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Catégorie
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Prix
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Stock
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Statut
                </th>
                <th scope="col" class="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
              <!-- Loading state -->
              <tr v-if="loading">
                <td colspan="6" class="px-6 py-12 text-center">
                  <div class="inline-flex items-center flex-col">
                    <svg class="animate-spin h-8 w-8 text-primary-600 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span class="text-sm text-gray-500">Chargement des produits...</span>
                  </div>
                </td>
              </tr>

              <!-- Error state -->
              <tr v-else-if="error">
                <td colspan="6" class="px-6 py-8 text-center">
                  <div class="text-red-600 bg-red-50 p-4 rounded-lg inline-block">{{ error }}</div>
                </td>
              </tr>

              <!-- Products list -->
              <tr v-else v-for="produit in paginatedProduits" :key="produit.id" class="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <td class="whitespace-nowrap px-6 py-4">
                  <div class="flex items-center">
                    <div class="h-12 w-12 flex-shrink-0 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden bg-white">
                      <img class="h-full w-full object-cover" :src="produit.image_url || 'https://via.placeholder.com/48'" alt="" />
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
                        {{ produit.name }}
                        <span v-if="produit.is_featured" class="inline-flex items-center rounded-full bg-blue-100 px-1.5 py-0.5 text-xs font-medium text-blue-800" title="Produit vedette">
                          <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                        </span>
                        <span v-if="produit.is_new" class="inline-flex items-center rounded-full bg-green-100 px-1.5 py-0.5 text-xs font-medium text-green-800" title="Nouveau produit">
                          New
                        </span>
                      </div>
                      <div class="text-xs text-gray-500 dark:text-gray-400 truncate max-w-xs">{{ produit.description || 'Aucune description' }}</div>
                    </div>
                  </div>
                </td>
                <td class="whitespace-nowrap px-6 py-4">
                  <span class="inline-flex items-center rounded-full bg-gray-100 dark:bg-gray-700 px-2.5 py-0.5 text-xs font-medium text-gray-800 dark:text-gray-300">
                    {{ produit.category || 'Non catégorisé' }}
                  </span>
                </td>
                <td class="whitespace-nowrap px-6 py-4">
                  <div class="text-sm font-semibold text-gray-900 dark:text-white">{{ formatPrix(produit.price) }}</div>
                </td>
                <td class="whitespace-nowrap px-6 py-4">
                  <div class="flex items-center">
                    <div :class="[
                      'h-2.5 w-2.5 rounded-full mr-2',
                      produit.stock > 10 ? 'bg-green-500' : (produit.stock > 0 ? 'bg-yellow-500' : 'bg-red-500')
                    ]"></div>
                    <span class="text-sm text-gray-700 dark:text-gray-300">{{ produit.stock }} en stock</span>
                  </div>
                </td>
                <td class="whitespace-nowrap px-6 py-4">
                  <span v-if="produit.stock > 0" class="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                    Disponible
                  </span>
                  <span v-else class="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
                    Rupture
                  </span>
                </td>
                <td class="whitespace-nowrap px-6 py-4 text-center">
                  <div class="flex justify-center space-x-3">
                    <button 
                      @click="editProduit(produit.id)" 
                      class="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors p-1 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded"
                      title="Modifier"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button 
                      @click="deleteProduit(produit.id)" 
                      class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 transition-colors p-1 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"
                      title="Supprimer"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>

              <!-- Empty state -->
              <tr v-if="!loading && !error && filteredProduits.length === 0">
                <td colspan="6" class="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                  <div class="flex flex-col items-center">
                    <svg class="w-12 h-12 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                    <p class="text-lg font-medium text-gray-900 dark:text-white">Aucun produit trouvé</p>
                    <p class="text-sm">Essayez de modifier vos filtres ou ajoutez un nouveau produit.</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-b-xl flex items-center justify-between">
          <div class="text-sm text-gray-700 dark:text-gray-300">
            Affichage de <span class="font-medium">{{ paginatedProduits.length }}</span> sur <span class="font-medium">{{ filteredProduits.length }}</span> produits
          </div>
          <div class="flex space-x-2">
            <button
              @click="currentPage--"
              :disabled="currentPage === 1"
              class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600"
            >
              <svg class="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
              Précédent
            </button>
            <button
              @click="currentPage++"
              :disabled="currentPage >= totalPages"
              class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600"
            >
              Suivant
              <svg class="h-4 w-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue';
import { productService } from '@/services/api';

const router = useRouter();
const currentPageTitle = ref('Liste des produits');

// Interface locale étendue pour l'affichage (avec category string et status)
interface ProductDisplay {
  id: number;
  name: string;
  price: number;
  category: string; // Nom de la catégorie
  category_id?: number;
  stock: number;
  status: string; // Calculé
  image_url: string;
  description: string;
  is_featured?: boolean;
  is_new?: boolean;
}

const produits = ref<ProductDisplay[]>([]);
const loading = ref(false);
const error = ref('');

// Filtres et recherche
const searchQuery = ref('');
const selectedCategory = ref('');
const filtreVedette = ref(false);
const filtreNouveau = ref(false);
const currentPage = ref(1);
const itemsPerPage = 10;

// Charger les produits depuis l'API
const loadProduits = async () => {
  loading.value = true;
  error.value = '';
  try {
    const data = await productService.getAll();
    
    // Mapper les données de l'API vers le format d'affichage
    produits.value = data.map((p: any) => ({
      id: p.id,
      name: p.name,
      price: parseFloat(p.price),
      category: p.category?.name || 'Non catégorisé',
      category_id: p.category_id,
      stock: p.stock,
      status: p.stock > 0 ? 'Disponible' : 'Rupture',
      image_url: p.image_url || '',
      description: p.description,
      is_featured: p.is_featured,
      is_new: p.is_new
    }));
  } catch (e) {
    console.error('Erreur chargement produits', e);
    error.value = 'Impossible de charger les produits. Veuillez réessayer.';
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadProduits();
});

// Extraire les catégories uniques des produits
const categories = computed(() => {
  const cats = new Set(produits.value.map(p => p.category).filter(Boolean));
  return Array.from(cats).sort();
});

// Produits filtrés
const filteredProduits = computed(() => {
  return produits.value.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.value.toLowerCase()) || 
                          (product.description && product.description.toLowerCase().includes(searchQuery.value.toLowerCase()));
    const matchesCategory = selectedCategory.value ? product.category === selectedCategory.value : true;
    const matchesVedette = filtreVedette.value ? product.is_featured : true;
    const matchesNouveau = filtreNouveau.value ? product.is_new : true;
    
    return matchesSearch && matchesCategory && matchesVedette && matchesNouveau;
  });
});

// Pagination
const paginatedProduits = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredProduits.value.slice(start, end);
});

const totalPages = computed(() => Math.ceil(filteredProduits.value.length / itemsPerPage));

// Formater le prix
const formatPrix = (prix: number) => {
  return `${new Intl.NumberFormat('fr-FR').format(prix)} HTG`;
};

// Actions
const editProduit = (id: number) => {
  router.push(`/modifier-produit/${id}`);
};

const deleteProduit = async (id: number) => {
  if (confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
    try {
      await productService.delete(id);
      // Recharger la liste après suppression
      await loadProduits();
    } catch (e) {
      console.error('Erreur suppression produit', e);
      alert('Erreur lors de la suppression du produit');
    }
  }
};
</script>

<style scoped>
/* Styles spécifiques au composant */
</style>
