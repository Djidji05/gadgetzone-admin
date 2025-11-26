<template>
  <div class="p-6">
    <div class="mb-6 flex items-center justify-between">
      <h1 class="text-2xl font-semibold text-gray-900 dark:text-white">
        Détails du client - {{ client?.name }}
      </h1>
      <button
        @click="$router.back()"
        class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
      >
        Retour
      </button>
    </div>
    
    <div v-if="isLoading" class="text-center py-8">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      <p class="mt-2 text-gray-600 dark:text-gray-400">Chargement...</p>
    </div>
    
    <div v-else-if="client" class="space-y-6">
      <!-- Informations personnelles -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 class="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Informations personnelles</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p class="text-sm text-gray-600 dark:text-gray-400">Nom complet</p>
            <p class="font-medium">{{ client.name }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-600 dark:text-gray-400">Email</p>
            <p class="font-medium">{{ client.email }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-600 dark:text-gray-400">Téléphone</p>
            <p class="font-medium">{{ client.phone || 'Non renseigné' }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-600 dark:text-gray-400">Rôle</p>
            <span :class="getRoleClass(client.role)">
              {{ getRoleText(client.role) }}
            </span>
          </div>
          <div>
            <p class="text-sm text-gray-600 dark:text-gray-400">Date d'inscription</p>
            <p class="font-medium">{{ formatDate(client.created_at) }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-600 dark:text-gray-400">Dernière mise à jour</p>
            <p class="font-medium">{{ formatDate(client.updated_at) }}</p>
          </div>
        </div>
      </div>
      
      <!-- Statistiques -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 class="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Statistiques</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="text-center p-4 bg-blue-50 rounded-lg dark:bg-blue-900/20">
            <p class="text-2xl font-bold text-blue-600 dark:text-blue-400">{{ stats.totalOrders }}</p>
            <p class="text-sm text-gray-600 dark:text-gray-400">Commandes totales</p>
          </div>
          <div class="text-center p-4 bg-green-50 rounded-lg dark:bg-green-900/20">
            <p class="text-2xl font-bold text-green-600 dark:text-green-400">{{ formatCurrency(stats.totalSpent) }}</p>
            <p class="text-sm text-gray-600 dark:text-gray-400">Total dépensé</p>
          </div>
          <div class="text-center p-4 bg-purple-50 rounded-lg dark:bg-purple-900/20">
            <p class="text-2xl font-bold text-purple-600 dark:text-purple-400">{{ formatCurrency(stats.averageOrder) }}</p>
            <p class="text-sm text-gray-600 dark:text-gray-400">Panier moyen</p>
          </div>
        </div>
      </div>
      
      <!-- Commandes récentes -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 class="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Commandes récentes</h2>
        <div v-if="recentOrders.length === 0" class="text-center py-4">
          <p class="text-gray-600 dark:text-gray-400">Aucune commande</p>
        </div>
        <div v-else class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b dark:border-gray-700">
                <th class="text-left p-2">#</th>
                <th class="text-left p-2">Date</th>
                <th class="text-left p-2">Total</th>
                <th class="text-left p-2">Statut</th>
                <th class="text-left p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="order in recentOrders" :key="order.id" class="border-b dark:border-gray-700">
                <td class="p-2 font-mono text-sm">#{{ order.id }}</td>
                <td class="p-2">{{ formatDate(order.created_at) }}</td>
                <td class="p-2">{{ formatCurrency(order.total_amount) }}</td>
                <td class="p-2">
                  <span :class="getStatusClass(order.status)">
                    {{ getStatusText(order.status) }}
                  </span>
                </td>
                <td class="p-2">
                  <button
                    @click="viewOrder(order.id)"
                    class="text-blue-600 hover:text-blue-800"
                  >
                    Voir
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <!-- Actions -->
      <div v-if="authStore.isAdmin" class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 class="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Actions</h2>
        <div class="flex space-x-4">
          <button
            @click="editClient"
            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Modifier le client
          </button>
          <button
            v-if="client.role !== 'admin'"
            @click="deleteClient"
            class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Supprimer le client
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { clientService, orderService } from '@/services/api'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const client = ref(null)
const recentOrders = ref([])
const isLoading = ref(true)

const stats = computed(() => {
  if (!recentOrders.value.length) {
    return {
      totalOrders: 0,
      totalSpent: 0,
      averageOrder: 0
    }
  }
  
  const totalOrders = recentOrders.value.length
  const totalSpent = recentOrders.value.reduce((sum, order) => sum + order.total_amount, 0)
  const averageOrder = totalOrders > 0 ? totalSpent / totalOrders : 0
  
  return {
    totalOrders,
    totalSpent,
    averageOrder
  }
})

const formatCurrency = (value) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(value)
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getRoleClass = (role) => {
  const classes = {
    admin: 'bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs',
    user: 'bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs'
  }
  return classes[role] || 'bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs'
}

const getRoleText = (role) => {
  const texts = {
    admin: 'Admin',
    user: 'Client'
  }
  return texts[role] || role
}

const getStatusClass = (status) => {
  const classes = {
    pending: 'bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs',
    confirmed: 'bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs',
    shipped: 'bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs',
    delivered: 'bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs'
  }
  return classes[status] || 'bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs'
}

const getStatusText = (status) => {
  const texts = {
    pending: 'En attente',
    confirmed: 'Confirmée',
    shipped: 'Expédiée',
    delivered: 'Livrée'
  }
  return texts[status] || status
}

const fetchClient = async () => {
  try {
    isLoading.value = true
    const response = await clientService.getClient(route.params.id)
    client.value = response.client
  } catch (error) {
    console.error('Erreur lors du chargement du client:', error)
  } finally {
    isLoading.value = false
  }
}

const fetchRecentOrders = async () => {
  try {
    const response = await orderService.getOrders({ user_id: route.params.id, limit: 10 })
    recentOrders.value = response.orders || []
  } catch (error) {
    console.error('Erreur lors du chargement des commandes:', error)
  }
}

const editClient = () => {
  router.push(`/admin/clients/${route.params.id}/edit`)
}

const deleteClient = async () => {
  if (confirm('Êtes-vous sûr de vouloir supprimer ce client ? Cette action est irréversible.')) {
    try {
      await clientService.deleteClient(route.params.id)
      router.push('/admin/clients')
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
    }
  }
}

const viewOrder = (id) => {
  router.push(`/admin/orders/${id}`)
}

onMounted(async () => {
  await fetchClient()
  await fetchRecentOrders()
})
</script>
