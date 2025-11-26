<template>
  <admin-layout>
  <div class="p-6">
    <!-- En-tête de la page -->
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Liste des commandes</h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Gestion des commandes clients
        </p>
      </div>
      <router-link 
        to="/ajouter-commande" 
        class="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
        </svg>
        Nouvelle commande
      </router-link>
    </div>

    <!-- Filtres -->
    <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-4 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
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
          <label for="status" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Statut</label>
          <select 
            id="status" 
            v-model="statusFilter"
            class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-700 dark:text-white"
          >
            <option value="">Tous les statuts</option>
            <option v-for="status in statuses" :key="status.value" :value="status.value">
              {{ status.label }}
            </option>
          </select>
        </div>
        
        <div>
          <label for="date" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date de commande</label>
          <input 
            type="date" 
            id="date" 
            v-model="dateFilter"
            class="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white"
          >
        </div>
        
        <div class="flex items-end">
          <button 
            @click="resetFilters"
            class="w-full inline-flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-white bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Réinitialiser
          </button>
        </div>
      </div>
    </div>

    <!-- Tableau des commandes -->
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
                Date
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Montant
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Statut
              </th>
              <th scope="col" class="relative px-6 py-3">
                <span class="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            <!-- Loading state -->
            <tr v-if="loading">
              <td colspan="6" class="px-6 py-8 text-center">
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
              <td colspan="6" class="px-6 py-8 text-center">
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
                  <div class="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-blue-100 dark:bg-blue-900 rounded-full">
                    <span class="text-blue-600 dark:text-blue-300 font-medium">{{ order.user_name?.charAt(0) || 'U' }}</span>
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
                <div class="text-sm font-medium text-gray-900 dark:text-white">
                  {{ formatPrix(order.total_amount) }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="getStatusBadgeClasses(order.status)" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                  {{ getStatusLabel(order.status) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div class="flex justify-end space-x-2">
                  <!-- Actions de statut -->
                  <button 
                    v-if="order.status === 'pending'"
                    @click="updateOrderStatus(order.id, 'processing')" 
                    class="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                    title="Accepter la commande"
                  >
                    <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>
                  
                  <button 
                    v-if="order.status === 'processing'"
                    @click="updateOrderStatus(order.id, 'shipped')" 
                    class="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                    title="Expédier la commande"
                  >
                    <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </button>
                  
                  <button 
                    v-if="order.status === 'shipped'"
                    @click="updateOrderStatus(order.id, 'delivered')" 
                    class="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                    title="Marquer comme livrée"
                  >
                    <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </button>
                  
                  <!-- Actions standards -->
                  <router-link 
                    :to="`/commandes/${order.id}`" 
                    class="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                    title="Voir les détails"
                  >
                    <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </router-link>
                  
                  <button 
                    @click="editOrder(order.id)" 
                    class="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                    title="Modifier"
                  >
                    <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  
                  <button 
                    @click="deleteOrder(order.id)" 
                    class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
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
              <td colspan="6" class="px-6 py-4 text-center text-sm text-gray-500">
                Aucune commande trouvée
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
    console.log('Loading orders...');
    const data = await orderService.getAll();
    console.log('Orders loaded:', data);
    console.log('Type of data:', typeof data);
    console.log('Is array?', Array.isArray(data));
    orders.value = data;
    console.log('Orders value after assignment:', orders.value);
    console.log('Is orders.value array?', Array.isArray(orders.value));
  } catch (err) {
    error.value = 'Erreur lors du chargement des commandes';
    console.error('Error loading orders:', err);
  } finally {
    loading.value = false;
    console.log('Loading finished, orders count:', orders.value?.length);
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
const itemsPerPage = 5;

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
      (order.user_name && order.user_name.toLowerCase().includes(searchQuery.value.toLowerCase()));
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
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('fr-FR', options);
};

const formatPrix = (prix: number) => {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(prix);
};

const getStatusLabel = (status: string) => {
  const statusObj = statuses.find(s => s.value === status);
  return statusObj ? statusObj.label : status;
};

const getStatusBadgeClasses = (status: string) => {
  const classes = {
    'pending': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100',
    'processing': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
    'shipped': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-100',
    'delivered': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
    'cancelled': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
  };
  return classes[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100';
};

const editOrder = (id: number) => {
  router.push(`/modifier-commande/${id}`);
};

const deleteOrder = async (id: number) => {
  if (confirm(`Êtes-vous sûr de vouloir supprimer la commande ${id} ?`)) {
    try {
      await orderService.delete(id);
      await loadOrders(); // Recharger la liste
    } catch (err) {
      console.error('Error deleting order:', err);
      alert('Erreur lors de la suppression de la commande');
    }
  }
};

const updateOrderStatus = async (id: number, newStatus: string) => {
  try {
    await orderService.update(id, { status: newStatus });
    await loadOrders(); // Recharger la liste
    alert(`Commande ${id} mise à jour avec succès`);
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
