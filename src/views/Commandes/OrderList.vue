<template>
  <div class="p-6">
    <div class="mb-6 flex items-center justify-between">
      <h1 class="text-2xl font-semibold text-gray-900 dark:text-white">Commandes</h1>
    </div>
    
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div class="mb-4 flex space-x-4">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Rechercher une commande..."
          class="flex-1 px-4 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600"
        />
        <select
          v-model="statusFilter"
          class="px-4 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600"
        >
          <option value="">Tous les statuts</option>
          <option value="pending">En attente</option>
          <option value="confirmed">Confirmée</option>
          <option value="shipped">Expédiée</option>
          <option value="delivered">Livrée</option>
        </select>
      </div>
      
      <div v-if="isLoading" class="text-center py-8">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p class="mt-2 text-gray-600 dark:text-gray-400">Chargement...</p>
      </div>
      
      <div v-else-if="orders.length === 0" class="text-center py-8">
        <p class="text-gray-600 dark:text-gray-400">Aucune commande trouvée</p>
      </div>
      
      <div v-else class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b dark:border-gray-700">
              <th class="text-left p-2">#</th>
              <th class="text-left p-2">Client</th>
              <th class="text-left p-2">Date</th>
              <th class="text-left p-2">Total</th>
              <th class="text-left p-2">Statut</th>
              <th class="text-left p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="order in filteredOrders" :key="order.id" class="border-b dark:border-gray-700">
              <td class="p-2 font-mono text-sm">#{{ order.id }}</td>
              <td class="p-2">{{ order.user?.name || '-' }}</td>
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
                  class="text-blue-600 hover:text-blue-800 mr-2"
                >
                  Voir
                </button>
                <button
                  v-if="authStore.isAdmin"
                  @click="editOrder(order.id)"
                  class="text-green-600 hover:text-green-800"
                >
                  Modifier
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { orderService } from '@/services/api'

const router = useRouter()
const authStore = useAuthStore()

const orders = ref([])
const isLoading = ref(true)
const searchQuery = ref('')
const statusFilter = ref('')

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

const formatCurrency = (value) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(value)
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('fr-FR')
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

const fetchOrders = async () => {
  try {
    isLoading.value = true
    const response = await orderService.getOrders()
    orders.value = response.orders || []
  } catch (error) {
    console.error('Erreur lors du chargement des commandes:', error)
  } finally {
    isLoading.value = false
  }
}

const viewOrder = (id) => {
  router.push(`/admin/orders/${id}`)
}

const editOrder = (id) => {
  router.push(`/admin/orders/${id}/edit`)
}

onMounted(() => {
  fetchOrders()
})
</script>
