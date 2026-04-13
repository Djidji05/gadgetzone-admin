<template>
  <div class="px-2 py-4 sm:p-6 space-y-4 sm:space-y-6">
    <PageBreadcrumb :pageTitle="currentPageTitle" class="hidden sm:block" />

    <div class="max-w-7xl mx-auto">
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden sm:bg-white sm:dark:bg-gray-800 bg-transparent dark:bg-transparent border-none dark:border-none shadow-none sm:border sm:dark:border-gray-700 sm:shadow-sm">
        <!-- Header -->
        <div class="px-4 py-6 sm:px-6 sm:py-6 flex flex-row justify-between items-center gap-4 bg-white dark:bg-gray-800 rounded-t-xl sm:rounded-none">
          <div>
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              Liste des commandes
            </h2>
            <p class="text-sm text-gray-600 dark:text-gray-400 mt-1 hidden sm:block">
              Suivez et gérez les commandes clients
            </p>
          </div>
          <div class="flex items-center gap-2">
            <div class="relative">
              <button
                @click="showExportMenu = !showExportMenu"
                class="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors shadow-sm"
                title="Exporter en PDF"
              >
                <i class="fas fa-file-pdf"></i>
                <span class="hidden sm:inline">Exporter PDF</span>
                <i class="fas fa-chevron-down text-[10px] ml-1"></i>
              </button>

              <!-- Menu Déroulant Période -->
              <div v-if="showExportMenu" class="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 z-[70] overflow-hidden py-1 transform origin-top-right transition-all">
                <div class="px-3 py-2 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-50 dark:border-gray-700 mb-1">
                  Choisir la période
                </div>
                <button 
                  v-for="(label, period) in exportPeriods" :key="period"
                  @click="exportPDF(period)"
                  class="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-colors flex items-center justify-between group"
                >
                  {{ label }}
                  <i class="fas fa-check text-[10px] opacity-0 group-hover:opacity-100 transition-opacity"></i>
                </button>
              </div>

              <!-- Overlay invisible pour fermer au clic extérieur -->
              <div v-if="showExportMenu" @click="showExportMenu = false" class="fixed inset-0 z-[60] bg-transparent"></div>
            </div>
            <button
               @click="fetchOrders"
               class="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span class="hidden sm:inline">Actualiser</span>
            </button>
          </div>
        </div>

        <!-- Filtres et recherche -->
        <div class="p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
          <div class="grid grid-cols-1 gap-4 md:grid-cols-12">
            <div class="md:col-span-6">
              <div class="relative">
                <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  v-model="searchQuery"
                  placeholder="Rechercher une commande (ID, Client)..."
                  class="block w-full rounded-lg border-gray-300 py-2.5 pl-10 pr-3 text-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>
            <div class="md:col-span-6">
              <select
                v-model="statusFilter"
                class="block w-full rounded-lg border-gray-300 py-2.5 pl-3 pr-10 text-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="">Tous les statuts</option>
                <option value="pending">En attente</option>
                <option value="confirmed">Confirmée</option>
                <option value="processing">En traitement</option>
                <option value="shipped">Expédiée</option>
                <option value="delivered">Livrée</option>
                <option value="cancelled">Annulée</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Tableau des commandes -->
        <div class="hidden sm:block overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead class="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Commande
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Client
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Date
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Total
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
              <tr v-if="isLoading">
                <td colspan="6" class="px-6 py-12 text-center">
                  <div class="inline-flex items-center flex-col">
                    <svg class="animate-spin h-8 w-8 text-primary-600 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span class="text-sm text-gray-500">Chargement des commandes...</span>
                  </div>
                </td>
              </tr>

              <!-- Empty state -->
              <tr v-else-if="filteredOrders.length === 0">
                <td colspan="6" class="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                  <div class="flex flex-col items-center">
                    <svg class="w-12 h-12 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <p class="text-lg font-medium text-gray-900 dark:text-white">Aucune commande trouvée</p>
                    <p class="text-sm">Essayez de modifier vos filtres.</p>
                  </div>
                </td>
              </tr>

              <!-- Orders list -->
              <tr v-else v-for="order in paginatedOrders" :key="order.id" class="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <td class="whitespace-nowrap px-6 py-4">
                  <span class="font-mono text-sm font-medium text-blue-600 dark:text-blue-400">{{ formatOrderId(order.id) }}</span>
                </td>
                <td class="whitespace-nowrap px-6 py-4">
                  <div class="flex items-center">
                    <div class="h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 mr-2 uppercase text-xs font-bold">
                      {{ (order.user?.name || 'U').charAt(0) }}
                    </div>
                    <span class="text-sm text-gray-900 dark:text-white">{{ order.user?.name || 'Utilisateur inconnu' }}</span>
                  </div>
                </td>
                <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                  {{ formatDate(order.created_at) }}
                </td>
                <td class="whitespace-nowrap px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">
                  {{ formatCurrency(order.total_amount) }}
                </td>
                <td class="whitespace-nowrap px-6 py-4">
                  <span :class="getStatusClass(order.status)">
                    {{ getStatusText(order.status) }}
                  </span>
                </td>
                <td class="whitespace-nowrap px-6 py-4 text-center">
                  <button 
                    @click="viewOrder(order.id)" 
                    class="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 transition-colors p-1 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded"
                    title="Voir détails"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Version Mobile (Cartes) -->
        <div class="sm:hidden divide-y divide-gray-200 dark:divide-gray-700">
          <div v-if="isLoading" class="px-6 py-12 text-center text-gray-500">
             Chargement...
          </div>
          <div v-else-if="filteredOrders.length === 0" class="px-6 py-12 text-center text-gray-500">
             Aucune commande trouvée
          </div>
          <div v-else v-for="order in paginatedOrders" :key="order.id" class="p-4 bg-white dark:bg-gray-800 mb-2 rounded-xl shadow-sm sm:shadow-none sm:rounded-none sm:mb-0">
            <div class="flex items-center justify-between">
              <span class="font-mono text-sm font-bold text-blue-600 dark:text-blue-400">{{ formatOrderId(order.id) }}</span>
              <span :class="getStatusClass(order.status)" class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border">{{ getStatusText(order.status) }}</span>
            </div>
            
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-center gap-2">
                <div class="h-6 w-6 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 text-xs">
                  {{ (order.user?.name || 'U').charAt(0) }}
                </div>
                <span class="text-sm font-medium text-gray-900 dark:text-white">{{ order.user?.name || 'Inconnu' }}</span>
              </div>
              <span class="text-xs text-gray-500">{{ formatDate(order.created_at) }}</span>
            </div>
            
            <div class="flex items-center justify-between">
              <span class="text-sm font-bold text-gray-900 dark:text-white">{{ formatCurrency(order.total_amount) }}</span>
              <button 
                @click="viewOrder(order.id)"
                class="flex items-center gap-1 text-sm font-medium text-blue-600 dark:text-blue-400"
              >
                Détails
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="filteredOrders.length > 0" class="px-4 py-4 sm:px-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30 flex items-center justify-between">
          <div class="flex-1 flex justify-between sm:hidden">
            <button 
              @click="currentPage--" 
              :disabled="currentPage === 1"
              class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Précédent
            </button>
            <button 
              @click="currentPage++" 
              :disabled="currentPage >= totalPages"
              class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Suivant
            </button>
          </div>
          <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div class="text-sm text-gray-700 dark:text-gray-300">
              Affichage de <span class="font-medium text-gray-900 dark:text-white">{{ (currentPage - 1) * itemsPerPage + 1 }}</span> à 
              <span class="font-medium text-gray-900 dark:text-white">{{ Math.min(currentPage * itemsPerPage, filteredOrders.length) }}</span> sur 
              <span class="font-medium text-gray-900 dark:text-white">{{ filteredOrders.length }}</span> commandes
            </div>
            <nav class="relative z-0 inline-flex rounded-lg shadow-sm -space-x-px" aria-label="Pagination">
              <button 
                @click="currentPage--" 
                :disabled="currentPage === 1"
                class="relative inline-flex items-center px-2 py-2 rounded-l-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                  'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700': currentPage !== page
                }"
                class="relative inline-flex items-center px-4 py-2 border text-sm font-medium transition-colors"
                v-show="shouldShowPage(page)"
              >
                {{ page }}
              </button>
              
              <button 
                @click="currentPage++" 
                :disabled="currentPage >= totalPages"
                class="relative inline-flex items-center px-2 py-2 rounded-r-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { orderService } from '@/services/api'
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue'
import { formatOrderId } from '@/utils/formatters';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const router = useRouter()
const authStore = useAuthStore()
const currentPageTitle = ref('Liste des commandes')

const orders = ref<any[]>([])
const isLoading = ref(true)
const searchQuery = ref('')
const statusFilter = ref('')
const showExportMenu = ref(false)

const exportPeriods = {
  today: "Aujourd'hui",
  week: "Cette semaine",
  month: "Ce mois-ci",
  year: "Cette année",
  all: "Toutes les commandes"
}

const currentPage = ref(1)
const itemsPerPage = 10

// Filter orders
const filteredOrders = computed(() => {
  let filtered = orders.value
  
  if (statusFilter.value) {
    filtered = filtered.filter(order => order.status === statusFilter.value)
  }
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(order =>
      order.id.toString().includes(query) ||
      (order.user?.name && order.user.name.toLowerCase().includes(query))
    )
  }
  
  return filtered
})

// Pagination
const paginatedOrders = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredOrders.value.slice(start, end)
})

const totalPages = computed(() => Math.ceil(filteredOrders.value.length / itemsPerPage))

// Smart pagination display (show start, end, and around current)
const shouldShowPage = (page: number) => {
  if (totalPages.value <= 7) return true
  if (page === 1 || page === totalPages.value) return true
  if (page >= currentPage.value - 1 && page <= currentPage.value + 1) return true
  return false
}

// Formatters
const formatCurrency = (value: any) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'HTG'
  }).format(value)
}

const formatDate = (dateString: any) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Status helpers
const getStatusClass = (status: any) => {
  const colors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium',
    confirmed: 'bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium',
    processing: 'bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full text-xs font-medium',
    shipped: 'bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-medium',
    delivered: 'bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium',
    cancelled: 'bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium',
    refunded: 'bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-medium'
  }
  return colors[status] || 'bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-medium'
}

const getStatusText = (status: any) => {
  const texts: Record<string, string> = {
    pending: 'En attente',
    confirmed: 'Confirmée',
    processing: 'En traitement',
    shipped: 'Expédiée',
    delivered: 'Livrée',
    cancelled: 'Annulée',
    refunded: 'Remboursée'
  }
  return texts[status] || status
}

// API
const fetchOrders = async () => {
  try {
    isLoading.value = true
    const response = await orderService.getOrders()
    // Handle specific response structure
    if (response && response.orders) {
        orders.value = response.orders
    } else if (Array.isArray(response)) {
        orders.value = response
    } else {
        orders.value = []
        console.warn('Structure de réponse commandes inattendue:', response)
    }
  } catch (error) {
    console.error('Erreur lors du chargement des commandes:', error)
  } finally {
    isLoading.value = false
  }
}

const viewOrder = (id: any) => {
  router.push(`/commandes/${id}`)
}

const exportPDF = (period: string = 'all') => {
  showExportMenu.value = false;
  
  const doc = new jsPDF();
  const themeColor = [37, 99, 235]; // Blue-600
  
  // Filtrage par période
  const now = new Date();
  let filteredForExport = filteredOrders.value;

  if (period !== 'all') {
    const startDate = new Date();
    if (period === 'today') startDate.setHours(0, 0, 0, 0);
    else if (period === 'week') startDate.setDate(now.getDate() - 7);
    else if (period === 'month') startDate.setMonth(now.getMonth() - 1);
    else if (period === 'year') startDate.setFullYear(now.getFullYear() - 1);
    
    filteredForExport = filteredForExport.filter(o => new Date(o.created_at) >= startDate);
  }

  // Header
  doc.setFontSize(20);
  doc.setTextColor(themeColor[0], themeColor[1], themeColor[2]);
  doc.text('HTFASIL', 14, 20);
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text('LISTE DES COMMANDES', 14, 26);
  doc.text(`Exporté le : ${now.toLocaleString('fr-FR')}`, 14, 31);
  if (period !== 'all') {
    doc.text(`Période : ${exportPeriods[period as keyof typeof exportPeriods]}`, 14, 36);
  }

  // Table
  const tableData = filteredForExport.map(o => [
    formatOrderId(o.id),
    o.user?.name || 'Inconnu',
    formatDate(o.created_at),
    getStatusText(o.status),
    formatCurrency(o.total_amount)
  ]);

  autoTable(doc, {
    startY: period === 'all' ? 40 : 45,
    head: [['ID', 'Client', 'Date', 'Statut', 'Total']],
    body: tableData,
    headStyles: { fillColor: themeColor, textColor: 255 },
    alternateRowStyles: { fillColor: [245, 247, 251] },
    margin: { left: 14, right: 14 },
    theme: 'striped',
    styles: { fontSize: 9 },
    columnStyles: {
      0: { cellWidth: 30 },
      1: { cellWidth: 'auto' },
      2: { cellWidth: 40 },
      3: { cellWidth: 30 },
      4: { cellWidth: 35, halign: 'right' }
    },
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 3) {
        const status = data.cell.raw;
        const colors: Record<string, [number, number, number]> = {
          'En attente': [254, 249, 195], // Yellow-100
          'Confirmée': [219, 234, 254], // Blue-100
          'En traitement': [224, 231, 255], // Indigo-100
          'Expédiée': [243, 232, 255], // Purple-100
          'Livrée': [220, 252, 231], // Green-100
          'Annulée': [254, 226, 226], // Red-100
          'Remboursée': [243, 244, 246] // Gray-100
        };
        const textColor: Record<string, [number, number, number]> = {
          'En attente': [133, 77, 14], // Yellow-800
          'Confirmée': [30, 64, 175], // Blue-800
          'En traitement': [55, 48, 163], // Indigo-800
          'Expédiée': [107, 33, 168], // Purple-800
          'Livrée': [22, 101, 52], // Green-800
          'Annulée': [153, 27, 27], // Red-800
          'Remboursée': [31, 41, 55] // Gray-800
        };
        if (colors[status]) {
          data.cell.styles.fillColor = colors[status];
          data.cell.styles.textColor = textColor[status];
          data.cell.styles.fontStyle = 'bold';
        }
      }
    }
  });

  // Footer
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(`Page ${i} sur ${pageCount}`, 105, 285, { align: 'center' });
    doc.text('HTFasil Market - Système d\'Administration', 196, 285, { align: 'right' });
  }

  doc.save(`commandes_htfasil_${new Date().toISOString().slice(0,10)}.pdf`);
}

onMounted(() => {
  fetchOrders()
})
</script>
