<template>
  <div class="p-6 space-y-6">
    <!-- En-tête -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-4">
        <button
          @click="$router.back()"
          class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white">{{ client?.name || 'Client' }}</h1>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Détails et historique du client</p>
        </div>
      </div>
      <button
        @click="editClient"
        class="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
        Modifier
      </button>
    </div>

    <div v-if="isLoading" class="flex justify-center items-center py-12">
      <svg class="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    </div>

    <div v-else-if="client" class="space-y-6">
      <!-- Cartes de statistiques -->
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div class="group rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] hover:shadow-lg transition-all">
          <div class="flex items-center justify-between">
            <div class="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl dark:from-blue-900/30 dark:to-blue-800/30">
              <svg class="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
          </div>
          <div class="mt-4">
            <p class="text-sm text-gray-500 dark:text-gray-400">Commandes</p>
            <p class="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{{ stats.totalOrders }}</p>
          </div>
        </div>

        <div class="group rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] hover:shadow-lg transition-all">
          <div class="flex items-center justify-between">
            <div class="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl dark:from-emerald-900/30 dark:to-emerald-800/30">
              <svg class="w-6 h-6 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div class="mt-4">
            <p class="text-sm text-gray-500 dark:text-gray-400">Total dépensé</p>
            <p class="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{{ formatCurrency(stats.totalSpent) }}</p>
          </div>
        </div>

        <div class="group rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] hover:shadow-lg transition-all">
          <div class="flex items-center justify-between">
            <div class="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl dark:from-purple-900/30 dark:to-purple-800/30">
              <svg class="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <div class="mt-4">
            <p class="text-sm text-gray-500 dark:text-gray-400">Panier moyen</p>
            <p class="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{{ formatCurrency(stats.averageOrder) }}</p>
          </div>
        </div>

        <div class="group rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] hover:shadow-lg transition-all">
          <div class="flex items-center justify-between">
            <div class="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl dark:from-amber-900/30 dark:to-amber-800/30">
              <svg class="w-6 h-6 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div class="mt-4">
            <p class="text-sm text-gray-500 dark:text-gray-400">Dernière commande</p>
            <p class="mt-1 text-sm font-medium text-gray-900 dark:text-white">{{ lastOrderDate }}</p>
          </div>
        </div>
      </div>

      <!-- Informations personnelles -->
      <div class="bg-white dark:bg-gray-800 shadow-sm rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
        <h2 class="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Informations personnelles</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400 mb-1">Nom complet</p>
            <p class="text-base font-medium text-gray-900 dark:text-white">{{ client.name }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400 mb-1">Email</p>
            <p class="text-base font-medium text-gray-900 dark:text-white">{{ client.email }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400 mb-1">Téléphone</p>
            <p class="text-base font-medium text-gray-900 dark:text-white">{{ client.phone || 'Non renseigné' }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400 mb-1">Rôle</p>
            <span :class="getRoleBadgeClass(client.role)" class="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold">
              {{ client.role || 'Client' }}
            </span>
          </div>
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400 mb-1">Date d'inscription</p>
            <p class="text-base font-medium text-gray-900 dark:text-white">{{ formatDate(client.created_at) }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400 mb-1">Statut</p>
            <span class="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400">
              Actif
            </span>
          </div>
        </div>
      </div>

      <!-- Commandes récentes -->
      <div class="bg-white dark:bg-gray-800 shadow-sm rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
        <h2 class="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Commandes récentes</h2>
        <div v-if="recentOrders.length === 0" class="text-center py-8">
          <svg class="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">Aucune commande</p>
        </div>
        <div v-else class="overflow-x-auto">
          <table class="min-w-full">
            <thead class="border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th class="text-left py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">N°</th>
                <th class="text-left py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Date</th>
                <th class="text-left py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Montant</th>
                <th class="text-left py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Statut</th>
                <th class="text-left py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
              <tr v-for="order in recentOrders" :key="order.id" class="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <td class="py-3 px-4 text-sm font-mono">#{{ order.id.toString().padStart(4, '0') }}</td>
                <td class="py-3 px-4 text-sm">{{ formatDate(order.created_at) }}</td>
                <td class="py-3 px-4 text-sm font-semibold">{{ formatCurrency(order.total_amount) }}</td>
                <td class="py-3 px-4 text-sm">
                  <span :class="getStatusBadgeClass(order.status)" class="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold">
                    {{ getStatusLabel(order.status) }}
                  </span>
                </td>
                <td class="py-3 px-4 text-sm">
                  <button
                    @click="viewOrder(order.id)"
                    class="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    Voir détails
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { userService, orderService } from '@/services/api'

const route = useRoute()
const router = useRouter()

const client = ref<any>(null)
const recentOrders = ref<any[]>([])
const isLoading = ref(true)

const stats = computed(() => {
  const totalOrders = recentOrders.value.length
  const totalSpent = recentOrders.value.reduce((sum, order) => sum + order.total_amount, 0)
  const averageOrder = totalOrders > 0 ? totalSpent / totalOrders : 0
  
  return {
    totalOrders,
    totalSpent,
    averageOrder
  }
})

const lastOrderDate = computed(() => {
  if (recentOrders.value.length === 0) return 'Aucune'
  const lastOrder = recentOrders.value[0]
  return formatDate(lastOrder.created_at)
})

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value) + ' G'
}

const formatDate = (dateString: string) => {
  if (!dateString) return 'Date inconnue'
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}

const getRoleBadgeClass = (role: string) => {
  const normalizedRole = role?.toLowerCase()
  if (normalizedRole === 'vip') {
    return 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400 ring-1 ring-amber-600/20'
  }
  return 'bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400 ring-1 ring-blue-600/20'
}

const getStatusBadgeClass = (status: string) => {
  const classes = {
    pending: 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400',
    processing: 'bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400',
    shipped: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-400',
    delivered: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400',
    cancelled: 'bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-400'
  }
  return classes[status as keyof typeof classes] || 'bg-gray-50 text-gray-700'
}

const getStatusLabel = (status: string) => {
  const labels = {
    pending: 'En attente',
    processing: 'En traitement',
    shipped: 'Expédiée',
    delivered: 'Livrée',
    cancelled: 'Annulée'
  }
  return labels[status as keyof typeof labels] || status
}

const fetchClient = async () => {
  try {
    isLoading.value = true
    const clientId = parseInt(route.params.id as string)
    
    console.log('📡 Chargement du client ID:', clientId)
    
    // Charger les données du client depuis l'API
    const userData = await userService.getById(clientId)
    client.value = userData
    
    console.log('✅ Client chargé:', userData)
    
    // Charger les commandes du client
    try {
      const ordersResponse = await orderService.getOrders()
      // Filtrer les commandes pour ce client
      recentOrders.value = (ordersResponse.orders || []).filter(
        (order: any) => order.user_id === clientId
      )
      console.log('✅ Commandes du client chargées:', recentOrders.value.length)
    } catch (err) {
      console.warn('⚠️ Impossible de charger les commandes:', err)
      recentOrders.value = []
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du chargement du client:', error)
    alert('Client non trouvé')
    router.push('/clients')
  } finally {
    isLoading.value = false
  }
}

const editClient = () => {
  router.push(`/modifier-client/${route.params.id}`)
}

const viewOrder = (id: number) => {
  router.push(`/commandes/${id}`)
}

onMounted(() => {
  fetchClient()
})
</script>
