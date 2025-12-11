<template>
  <div class="p-6 space-y-6">
    <!-- En-tête de la page -->
    <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Gestion des Commandes</h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Suivez et gérez toutes vos commandes clients
        </p>
      </div>
      <div class="flex items-center gap-3">
        <button
          @click="loadOrders"
          class="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Actualiser
        </button>
        <router-link 
          to="/ajouter-commande" 
          class="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
          Nouvelle commande
        </router-link>
      </div>
    </div>

    <!-- Cartes de statistiques -->
    <OrderStatsCards :orders="orders" />

    <!-- Filtres -->
    <div class="bg-white dark:bg-gray-800 shadow-sm rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label for="search" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Rechercher</label>
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
              class="block w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm dark:bg-gray-700 dark:text-white transition-all"
              placeholder="N° commande, client, email..."
            >
          </div>
        </div>
        
        <div>
          <label for="status" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Statut</label>
          <select 
            id="status" 
            v-model="statusFilter"
            class="block w-full pl-3 pr-10 py-2.5 text-base border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm rounded-lg dark:bg-gray-700 dark:text-white transition-all"
          >
            <option value="">Tous les statuts</option>
            <option v-for="status in statuses" :key="status.value" :value="status.value">
              {{ status.label }}
            </option>
          </select>
        </div>
        
        <div>
          <label for="date" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Date de commande</label>
          <input 
            type="date" 
            id="date" 
            v-model="dateFilter"
            class="block w-full pl-3 pr-3 py-2.5 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm dark:bg-gray-700 dark:text-white transition-all"
          >
        </div>
        
        <div class="flex items-end">
          <button 
            @click="resetFilters"
            class="w-full inline-flex justify-center items-center gap-2 py-2.5 px-4 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-lg text-gray-700 dark:text-white bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-all"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Réinitialiser
          </button>
        </div>
      </div>
    </div>

    <!-- Tableau des commandes -->
    <div class="bg-white dark:bg-gray-800 shadow-sm overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-900/50">
            <tr>
              <th scope="col" class="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Commande
              </th>
              <th scope="col" class="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Client
              </th>
              <th scope="col" class="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Date
              </th>
              <th scope="col" class="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Montant
              </th>
              <th scope="col" class="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Statut
              </th>
              <th scope="col" class="relative px-6 py-4">
                <span class="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            <!-- Loading state -->
            <tr v-if="loading">
              <td colspan="6" class="px-6 py-12 text-center">
                <div class="inline-flex items-center gap-3">
                  <svg class="animate-spin h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span class="text-gray-600 dark:text-gray-400">Chargement des commandes...</span>
                </div>
              </td>
            </tr>
            
            <!-- Error state -->
            <tr v-else-if="error">
              <td colspan="6" class="px-6 py-12 text-center">
                <div class="text-red-600 dark:text-red-400">{{ error }}</div>
              </td>
            </tr>
            
            <!-- Orders list -->
            <tr v-else v-for="order in paginatedOrders" :key="order.id" class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center gap-3">
                  <div class="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/30">
                    <svg class="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </div>
                  <div>
                    <div class="text-sm font-mono font-semibold text-gray-900 dark:text-white">
                      #{{ order.id.toString().padStart(4, '0') }}
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center gap-3">
                  <div class="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-full ring-2 ring-white dark:ring-gray-800">
                    <span class="text-purple-700 dark:text-purple-300 font-semibold text-sm">{{ order.user?.name?.charAt(0) || 'U' }}</span>
                  </div>
                  <div>
                    <div class="text-sm font-medium text-gray-900 dark:text-white">
                      {{ order.user?.name || 'Client inconnu' }}
                    </div>
                    <div class="text-xs text-gray-500 dark:text-gray-400">
                      {{ order.user?.email || '' }}
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900 dark:text-white">
                  {{ formatDate(order.created_at) }}
                </div>
                <div class="text-xs text-gray-500 dark:text-gray-400">
                  {{ formatTime(order.created_at) }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-semibold text-gray-900 dark:text-white">
                  {{ formatPrix(order.total_amount) }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <OrderStatusBadge :status="order.status" />
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div class="flex justify-end items-center gap-2">
                  <!-- Actions de statut -->
                  <button 
                    v-if="order.status === 'pending'"
                    @click="updateOrderStatus(order.id, 'processing')" 
                    class="p-2 text-emerald-600 hover:text-emerald-900 dark:text-emerald-400 dark:hover:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-all"
                    title="Accepter la commande"
                  >
                    <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>
                  
                  <button 
                    v-if="order.status === 'processing'"
                    @click="updateOrderStatus(order.id, 'shipped')" 
                    class="p-2 text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
                    title="Expédier la commande"
                  >
                    <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </button>
                  
                  <button 
                    v-if="order.status === 'shipped'"
                    @click="updateOrderStatus(order.id, 'delivered')" 
                    class="p-2 text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-all"
                    title="Marquer comme livrée"
                  >
                    <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </button>
                  
                  <!-- Actions standards -->
                  <router-link 
                    :to="`/commandes/${order.id}`" 
                    class="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all"
                    title="Voir les détails"
                  >
                    <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </router-link>
                  
                  <button 
                    @click="deleteOrder(order.id)" 
                    class="p-2 text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                    title="Supprimer"
                  >
                    <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="!loading && !error && filteredOrders.length === 0">
              <td colspan="6" class="px-6 py-12 text-center">
                <div class="flex flex-col items-center gap-3">
                  <svg class="w-16 h-16 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  <p class="text-sm text-gray-500 dark:text-gray-400">Aucune commande trouvée</p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- Pagination -->
      <div class="bg-gray-50 dark:bg-gray-900/50 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 sm:px-6">
        <div class="flex-1 flex justify-between sm:hidden">
          <button 
            @click="currentPage--" 
            :disabled="currentPage === 1"
            class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Précédent
          </button>
          <button 
            @click="currentPage++" 
            :disabled="currentPage >= totalPages"
            class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
            <nav class="relative z-0 inline-flex rounded-lg shadow-sm -space-x-px" aria-label="Pagination">
              <button 
                @click="currentPage--" 
                :disabled="currentPage === 1"
                :class="{
                  'opacity-50 cursor-not-allowed': currentPage === 1,
                  'hover:bg-gray-50 dark:hover:bg-gray-700': currentPage > 1
                }"
                class="relative inline-flex items-center px-2 py-2 rounded-l-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-300"
              >
                <span class="sr-only">Précédent</span>
                <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
              </button>
              
              <button 
                v-for="page in totalPages" 
                :key="page"
                @click="currentPage = page"
                :class="{
                  'bg-blue-50 dark:bg-blue-900/30 border-blue-500 text-blue-600 dark:text-blue-400 z-10': currentPage === page,
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
                class="relative inline-flex items-center px-2 py-2 rounded-r-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-300"
              >
                <span class="sr-only">Suivant</span>
                <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                </svg>
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import OrderStatsCards from '@/components/orders/OrderStatsCards.vue';
import OrderStatusBadge from '@/components/orders/OrderStatusBadge.vue';
import { orderService, type Order } from '@/services/api';

const router = useRouter();
const orders = ref<Order[]>([]);
const loading = ref(true);
const error = ref('');

// Charger les commandes depuis l'API
const loadOrders = async () => {
  try {
    loading.value = true;
    const response = await orderService.getOrders();
    orders.value = response.orders || [];
  } catch (err) {
    error.value = 'Erreur lors du chargement des commandes';
    console.error('Error loading orders:', err);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadOrders();
});

// Filtres
const searchQuery = ref('');
const statusFilter = ref('');
const dateFilter = ref('');

// Pagination
const currentPage = ref(1);
const itemsPerPage = 10;

// Statuts disponibles
const statuses = [
  { value: 'pending', label: 'En attente' },
  { value: 'processing', label: 'En cours de traitement' },
  { value: 'shipped', label: 'Expédiée' },
  { value: 'delivered', label: 'Livrée' },
  { value: 'cancelled', label: 'Annulée' }
];

// Commandes filtrées
const filteredOrders = computed(() => {
  if (!Array.isArray(orders.value)) return [];
  return orders.value.filter(order => {
    const matchesSearch = !searchQuery.value || 
      order.id.toString().includes(searchQuery.value.toLowerCase()) ||
      (order.user?.name && order.user.name.toLowerCase().includes(searchQuery.value.toLowerCase())) ||
      (order.user?.email && order.user.email.toLowerCase().includes(searchQuery.value.toLowerCase()));
    const matchesStatus = !statusFilter.value || order.status === statusFilter.value;
    const matchesDate = !dateFilter.value || 
      new Date(order.created_at).toDateString() === new Date(dateFilter.value).toDateString();
    return matchesSearch && matchesStatus && matchesDate;
  });
});

// Commandes paginées
const paginatedOrders = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredOrders.value.slice(start, end);
});

// Total pages
const totalPages = computed(() => {
  return Math.ceil(filteredOrders.value.length / itemsPerPage);
});

// Méthodes
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

const formatTime = (dateString: string) => {
  return new Date(dateString).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatPrix = (prix: number) => {
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(prix) + ' G';
};

const deleteOrder = async (id: number) => {
  if (confirm(`Êtes-vous sûr de vouloir supprimer la commande #${id.toString().padStart(4, '0')} ?`)) {
    try {
      await orderService.deleteOrder(id);
      await loadOrders();
    } catch (err) {
      console.error('Error deleting order:', err);
      alert('Erreur lors de la suppression de la commande');
    }
  }
};

const updateOrderStatus = async (id: number, newStatus: string) => {
  try {
    await orderService.updateOrder(id, { status: newStatus as any });
    await loadOrders();
  } catch (err) {
    console.error('Error updating order status:', err);
    alert('Erreur lors de la mise à jour du statut');
  }
};

const resetFilters = () => {
  searchQuery.value = '';
  statusFilter.value = '';
  dateFilter.value = '';
  currentPage.value = 1;
};
</script>
