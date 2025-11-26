<template>
  <admin-layout>
    <div class="p-6">
      <!-- En-tête de la page -->
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Commandes annulées</h1>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Historique des commandes annulées
          </p>
        </div>
      </div>

      <!-- Filtres -->
      <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-4 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div class="md:col-span-2">
            <label for="search" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rechercher</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </div>
              <input 
                type="text" 
                id="search" 
                v-model="searchQuery"
                class="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                placeholder="N° commande, client..."
              >
            </div>
          </div>
          
          <div>
            <label for="dateDebut" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Du</label>
            <input 
              type="date" 
              id="dateDebut" 
              v-model="dateDebut"
              class="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white"
            >
          </div>
          
          <div>
            <label for="dateFin" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Au</label>
            <div class="flex">
              <input 
                type="date" 
                id="dateFin" 
                v-model="dateFin"
                class="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-l-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white"
              >
              <button 
                @click="resetFilters"
                class="mt-1 inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 dark:border-gray-600 rounded-r-md text-gray-500 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 focus:outline-none"
                title="Réinitialiser les filtres"
              >
                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Statistiques -->
      <div class="grid grid-cols-1 gap-5 mb-6 sm:grid-cols-2 lg:grid-cols-4">
        <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <div class="flex items-center">
            <div class="p-3 rounded-full bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-200">
              <svg class="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <div class="ml-5">
              <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Total annulations</p>
              <p class="text-2xl font-semibold text-gray-900 dark:text-white">{{ stats.totalCommandes }}</p>
            </div>
          </div>
        </div>
        
        <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <div class="flex items-center">
            <div class="p-3 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-200">
              <svg class="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div class="ml-5">
              <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Délai moyen avant annulation</p>
              <p class="text-2xl font-semibold text-gray-900 dark:text-white">{{ stats.delaiMoyen }} jours</p>
            </div>
          </div>
        </div>
        
        <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <div class="flex items-center">
            <div class="p-3 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-200">
              <svg class="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div class="ml-5">
              <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Clients récurrents</p>
              <p class="text-2xl font-semibold text-gray-900 dark:text-white">{{ stats.clientsRecurrents }}%</p>
            </div>
          </div>
        </div>
        
        <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <div class="flex items-center">
            <div class="p-3 rounded-full bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-200">
              <svg class="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div class="ml-5">
              <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Taux de remboursement</p>
              <p class="text-2xl font-semibold text-gray-900 dark:text-white">{{ stats.tauxRemboursement }}%</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Tableau des commandes annulées -->
      <div class="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead class="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  N° Commande
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Client
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Date commande
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Date annulation
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Montant
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Motif
                </th>
                <th scope="col" class="relative px-6 py-3">
                  <span class="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              <!-- Loading state -->
              <tr v-if="loading">
                <td colspan="7" class="px-6 py-8 text-center">
                  <div class="inline-flex items-center">
                    <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Chargement des commandes...
                  </div>
                </td>
              </tr>
              
              <!-- Error state -->
              <tr v-else-if="error">
                <td colspan="7" class="px-6 py-8 text-center">
                  <div class="text-red-600">{{ error }}</div>
                </td>
              </tr>
              
              <!-- Orders list -->
              <tr v-else v-for="order in paginatedOrders" :key="order.id" class="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-blue-600 dark:text-blue-400">
                    #{{ order.id }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-red-100 dark:bg-red-900 rounded-full">
                      <span class="text-red-600 dark:text-red-300 font-medium">{{ order.user_name?.charAt(0) || 'A' }}</span>
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-medium text-gray-900 dark:text-white">
                        {{ order.user_name || 'Client inconnu' }}
                      </div>
                      <div class="text-sm text-gray-500 dark:text-gray-400">
                        {{ order.user_email || '' }}
                      </div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900 dark:text-white">
                    {{ formatDate(order.created_at) }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900 dark:text-white">
                    {{ formatDate(order.created_at) }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900 dark:text-white">
                    {{ formatPrix(order.total_amount) }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                    Annulée
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div class="flex justify-end space-x-2">
                    <button 
                      @click="viewOrder(order.id)" 
                      class="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                      title="Voir les détails"
                    >
                      <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="!loading && !error && filteredOrders.length === 0">
                <td colspan="7" class="px-6 py-4 text-center text-sm text-gray-500">
                  Aucune commande annulée
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <!-- Pagination -->
        <div class="bg-white dark:bg-gray-800 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 sm:px-6">
          <div class="flex-1 flex justify-between sm:hidden">
            <button 
              @click="currentPage--" 
              :disabled="currentPage === 1"
              class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white dark:bg-gray-800 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Précédent
            </button>
            <button 
              @click="currentPage++" 
              :disabled="currentPage >= totalPages"
              class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white dark:bg-gray-800 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Suivant
            </button>
          </div>
          <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p class="text-sm text-gray-700 dark:text-gray-300">
                Affichage de <span class="font-medium">{{ (currentPage - 1) * itemsPerPage + 1 }}</span> à 
                <span class="font-medium">{{ Math.min(currentPage * itemsPerPage, filteredOrders.length) }}</span> sur 
                <span class="font-medium">{{ filteredOrders.length }}</span> résultats
              </p>
            </div>
            <div>
              <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button 
                  @click="currentPage--" 
                  :disabled="currentPage === 1"
                  :class="{
                    'opacity-50 cursor-not-allowed': currentPage === 1,
                    'hover:bg-gray-50 dark:hover:bg-gray-700': currentPage > 1
                  }"
                  class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-300"
                >
                  <span class="sr-only">Précédent</span>
                  <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
                  </svg>
                </button>
                
                <button 
                  v-for="page in totalPages" 
                  :key="page"
                  @click="currentPage = page"
                  :class="{
                    'bg-blue-50 dark:bg-blue-900 border-blue-500 text-blue-600 dark:text-blue-100': currentPage === page,
                    'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700': currentPage !== page
                  }"
                  class="relative inline-flex items-center px-4 py-2 border text-sm font-medium"
                >
                  {{ page }}
                </button>
                
                <button 
                  @click="currentPage++" 
                  :disabled="currentPage >= totalPages"
                  :class="{
                    'opacity-50 cursor-not-allowed': currentPage >= totalPages,
                    'hover:bg-gray-50 dark:hover:bg-gray-700': currentPage < totalPages
                  }"
                  class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-300"
                >
                  <span class="sr-only">Suivant</span>
                  <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  </admin-layout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import AdminLayout from '@/components/layout/AdminLayout.vue';
import { orderService, type Order } from '@/services/api';

const router = useRouter();
const orders = ref<Order[]>([]);
const loading = ref(true);
const error = ref('');

// Charger les commandes depuis l'API
const loadOrders = async () => {
  try {
    loading.value = true;
    const allOrders = await orderService.getAll();
    // Filtrer uniquement les commandes annulées
    orders.value = allOrders.filter(order => order.status === 'cancelled');
  } catch (err) {
    error.value = 'Erreur lors du chargement des commandes';
    console.error('Error loading orders:', err);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadOrders();
  // Définir la date de fin par défaut à aujourd'hui
  const today = new Date();
  dateFin.value = today.toISOString().split('T')[0];
  
  // Définir la date de début par défaut à il y a 30 jours
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(today.getDate() - 30);
  dateDebut.value = thirtyDaysAgo.toISOString().split('T')[0];
});

// Filtres
const searchQuery = ref('');
const dateDebut = ref('');
const dateFin = ref('');

// Pagination
const currentPage = ref(1);
const itemsPerPage = 10;

// Commandes filtrées
const filteredOrders = computed(() => {
  let result = orders.value.filter(order => {
    const matchesSearch = !searchQuery.value || 
      order.id.toString().includes(searchQuery.value.toLowerCase()) ||
      (order.user_name && order.user_name.toLowerCase().includes(searchQuery.value.toLowerCase()));
    
    // Appliquer le filtre de date
    if (dateDebut.value) {
      const debut = new Date(dateDebut.value);
      if (new Date(order.created_at) < debut) return false;
    }
    
    if (dateFin.value) {
      const fin = new Date(dateFin.value);
      fin.setHours(23, 59, 59, 999);
      if (new Date(order.created_at) > fin) return false;
    }
    
    return matchesSearch;
  });
  
  return result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
});

const totalPages = computed(() => {
  return Math.ceil(filteredOrders.value.length / itemsPerPage);
});

const paginatedOrders = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredOrders.value.slice(start, end);
});

// Statistiques
const stats = computed(() => {
  const filtered = filteredOrders.value;
  const totalCommandes = filtered.length;
  
  // Calcul du délai moyen avant annulation (simplifié)
  const delaiMoyen = 2.5; // Valeur par défaut
  
  // Taux de clients récurrents (exemple simplifié)
  const clientsRecurrents = 35; // Pourcentage fictif
  
  // Taux de remboursement (simplifié)
  const tauxRemboursement = 75; // Pourcentage fictif
  
  return {
    totalCommandes,
    delaiMoyen,
    clientsRecurrents,
    tauxRemboursement
  };
});

// Méthodes
const formatDate = (dateString: string) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('fr-FR', options);
};

const formatPrix = (prix: number) => {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(prix);
};

const viewOrder = (id: number) => {
  router.push(`/commandes/${id}`);
};

const resetFilters = () => {
  searchQuery.value = '';
  const today = new Date();
  dateFin.value = today.toISOString().split('T')[0];
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(today.getDate() - 30);
  dateDebut.value = thirtyDaysAgo.toISOString().split('T')[0];
  currentPage.value = 1;
};
</script>
