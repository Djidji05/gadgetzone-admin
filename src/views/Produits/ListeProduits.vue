<template>
  <AdminLayout>
    <PageBreadcrumb :pageTitle="currentPageTitle" />

    <div class="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
      <div class="mb-6 flex flex-col justify-between sm:flex-row sm:items-center">
        <h2 class="text-2xl font-semibold text-gray-800 dark:text-white">Liste des produits</h2>
        <router-link
          to="/ajouter-produit"
          class="inline-flex items-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        >
          <svg class="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" />
          </svg>
          Ajouter un produit
        </router-link>
      </div>

      <!-- Filtres et recherche -->
      <div class="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
        <div class="md:col-span-2">
          <div class="relative">
            <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clip-rule="evenodd" />
              </svg>
            </div>
            <input
              v-model="searchQuery"
              type="text"
              class="block w-full rounded-md border-gray-300 pl-10 focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              placeholder="Rechercher un produit..."
            />
          </div>
        </div>
        <div>
          <select
            v-model="selectedCategory"
            class="block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm"
          >
            <option value="">Toutes les catégories</option>
            <option v-for="category in categories" :key="category" :value="category">
              {{ category }}
            </option>
          </select>
        </div>

        <div class="flex items-center space-x-2">
          <input
            id="vedette"
            v-model="filtreVedette"
            type="checkbox"
            class="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700"
          />
          <label for="vedette" class="text-sm font-medium text-gray-700 dark:text-gray-300">
            Produits vedettes uniquement
          </label>
        </div>
      </div>

      <!-- Tableau des produits -->
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                Produit
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                Référence
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                Catégorie
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                Prix (HTG)
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                Stock
              </th>
              <th scope="col" class="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                Vedette
              </th>
              <th scope="col" class="relative px-6 py-3">
                <span class="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
            <!-- Loading state -->
            <tr v-if="loading">
              <td colspan="7" class="px-6 py-8 text-center">
                <div class="inline-flex items-center">
                  <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Chargement des produits...
                </div>
              </td>
            </tr>

            <!-- Error state -->
            <tr v-else-if="error">
              <td colspan="7" class="px-6 py-8 text-center">
                <div class="text-red-600">{{ error }}</div>
              </td>
            </tr>

            <!-- Products list -->
            <tr v-else v-for="produit in filteredProduits" :key="produit.id" class="hover:bg-gray-50 dark:hover:bg-gray-800">
              <td class="whitespace-nowrap px-6 py-4">
                <div class="flex items-center">
                  <div class="h-10 w-10 flex-shrink-0">
                    <img class="h-10 w-10 rounded-full" :src="produit.image_url || 'https://via.placeholder.com/40'" alt="" />
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900 dark:text-white">{{ produit.name }}</div>
                    <div class="text-sm text-gray-500 dark:text-gray-400">{{ produit.description || 'Non catégorisé' }}</div>
                  </div>
                </div>
              </td>
              <td class="whitespace-nowrap px-6 py-4">
                <div class="text-sm text-gray-900 dark:text-white">{{ produit.id }}</div>
              </td>
              <td class="whitespace-nowrap px-6 py-4">
                <span class="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                  {{ produit.category_id || 'Non défini' }}
                </span>
              </td>
              <td class="whitespace-nowrap px-6 py-4">
                <div class="text-sm font-medium text-gray-900 dark:text-white">{{ formatPrix(produit.price) }}</div>
              </td>
              <td class="whitespace-nowrap px-6 py-4">
                <span
                  class="inline-flex rounded-full px-2 text-xs font-semibold leading-5"
                  :class="{
                    'bg-green-100 text-green-800': produit.stock > 10,
                    'bg-yellow-100 text-yellow-800': produit.stock > 0 && produit.stock <= 10,
                    'bg-red-100 text-red-800': produit.stock === 0
                  }"
                >
                  {{ produit.stock }} en stock
                </span>
              </td>
              <td class="whitespace-nowrap px-6 py-4 text-center">
                <!-- Pas de champ vedette dans l'API pour l'instant -->
              </td>
              <td class="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                <button @click="editProduit(produit.id)" class="mr-3 text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300">
                  Modifier
                </button>
                <button @click="confirmDelete(produit.id)" class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
                  Supprimer
                </button>
              </td>
            </tr>
            <tr v-if="!loading && !error && filteredProduits.length === 0">
              <td colspan="7" class="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                Aucun produit trouvé.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="mt-4 flex items-center justify-between">
        <div class="text-sm text-gray-700 dark:text-gray-300">
          Affichage de <span class="font-medium">{{ filteredProduits.length }}</span> produits
        </div>
        <div class="flex space-x-2">
          <button
            @click="currentPage--"
            :disabled="currentPage === 1"
            class="rounded-md border border-gray-300 bg-white px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Précédent
          </button>
          <button
            @click="currentPage++"
            :disabled="currentPage * itemsPerPage >= filteredProduits.length"
            class="rounded-md border border-gray-300 bg-white px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Suivant
          </button>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import AdminLayout from '@/components/layout/AdminLayout.vue';
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue';
import { productService, type Product } from '@/services/api';

const router = useRouter();
const currentPageTitle = ref('Liste des produits');

// Données réelles depuis l'API
const produits = ref<Product[]>([]);
const loading = ref(true);
const error = ref('');

// Charger les produits depuis l'API
const loadProduits = async () => {
  try {
    loading.value = true;
    produits.value = await productService.getAll();
  } catch (err) {
    error.value = 'Erreur lors du chargement des produits';
    console.error('Error loading products:', err);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadProduits();
});

const categories = ref([
  'Accessoire',
  'Casque',
  'Smartphone',
  'Laptop',
  'Autre'
]);

// Filtres et recherche
const searchQuery = ref('');
const selectedCategory = ref('');
const filtreVedette = ref(false);
const currentPage = ref(1);
const itemsPerPage = 10;

const filteredProduits = computed(() => {
  if (!Array.isArray(produits.value)) return [];
  return produits.value.filter(produit => {
    const matchesSearch = produit.name.toLowerCase().includes(searchQuery.value.toLowerCase());
    const matchesCategory = !selectedCategory.value || produit.category_id?.toString() === selectedCategory.value;
    return matchesSearch && matchesCategory;
  });
});

// Formater le prix
const formatPrix = (prix: number) => {
  return `${new Intl.NumberFormat('fr-FR').format(prix)} HTG`;
};

// Actions
const editProduit = (id: number) => {
  router.push(`/modifier-produit/${id}`);
};

const confirmDelete = async (id: number) => {
  if (confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
    try {
      await productService.delete(id);
      await loadProduits(); // Recharger la liste
    } catch (err) {
      console.error('Error deleting product:', err);
      alert('Erreur lors de la suppression du produit');
    }
  }
};
</script>
