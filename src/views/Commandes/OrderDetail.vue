<template>
  <div class="p-6">
    <div class="mb-6 flex items-center justify-between">
      <h1 class="text-2xl font-semibold text-gray-900 dark:text-white">
        Détails de la commande #{{ order?.id }}
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
    
    <div v-else-if="order" class="space-y-6">
      <!-- Informations générales -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 class="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Informations générales</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p class="text-sm text-gray-600 dark:text-gray-400">Numéro de commande</p>
            <p class="font-medium">#{{ order.id }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-600 dark:text-gray-400">Date</p>
            <p class="font-medium">{{ formatDate(order.created_at) }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-600 dark:text-gray-400">Client</p>
            <p class="font-medium">{{ order.user?.name || '-' }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-600 dark:text-gray-400">Email</p>
            <p class="font-medium">{{ order.user?.email || '-' }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-600 dark:text-gray-400">Statut</p>
            <span :class="getStatusClass(order.status)">
              {{ getStatusText(order.status) }}
            </span>
          </div>
          <div>
            <p class="text-sm text-gray-600 dark:text-gray-400">Total</p>
            <p class="font-medium text-lg">{{ formatCurrency(order.total_amount) }}</p>
          </div>
        </div>
      </div>
      
      <!-- Articles de la commande -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 class="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Articles</h2>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b dark:border-gray-700">
                <th class="text-left p-2">Produit</th>
                <th class="text-left p-2">Quantité</th>
                <th class="text-left p-2">Prix unitaire</th>
                <th class="text-left p-2">Total</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in order.items" :key="item.id" class="border-b dark:border-gray-700">
                <td class="p-2">{{ item.product?.name || '-' }}</td>
                <td class="p-2">{{ item.quantity }}</td>
                <td class="p-2">{{ formatCurrency(item.price) }}</td>
                <td class="p-2 font-medium">{{ formatCurrency(item.quantity * item.price) }}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr class="border-t-2 dark:border-gray-700">
                <td colspan="3" class="p-2 font-semibold">Total</td>
                <td class="p-2 font-semibold text-lg">{{ formatCurrency(order.total_amount) }}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
      
      <!-- Actions -->
      <div v-if="authStore.isAdmin" class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 class="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Actions</h2>
        <div class="flex space-x-4">
          <select
            v-model="newStatus"
            class="px-4 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600"
          >
            <option value="">Changer le statut</option>
            <option value="pending">En attente</option>
            <option value="confirmed">Confirmée</option>
            <option value="shipped">Expédiée</option>
            <option value="delivered">Livrée</option>
          </select>
          <button
            @click="updateStatus"
            :disabled="!newStatus || isUpdating"
            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {{ isUpdating ? 'Mise à jour...' : 'Mettre à jour' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { orderService } from '@/services/api'
import type { Order } from '@/types'

const route = useRoute()
const authStore = useAuthStore()

const order = ref<Order | null>(null)
const isLoading = ref(true)
const isUpdating = ref(false)
const newStatus = ref('')

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(value)
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getStatusClass = (status: string) => {
  const classes = {
    pending: 'bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs',
    confirmed: 'bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs',
    shipped: 'bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs',
    delivered: 'bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs'
  }
  return classes[status as keyof typeof classes] || 'bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs'
}

const getStatusText = (status: string) => {
  const texts = {
    pending: 'En attente',
    confirmed: 'Confirmée',
    shipped: 'Expédiée',
    delivered: 'Livrée'
  }
  return texts[status as keyof typeof texts] || status
}

const fetchOrder = async () => {
  try {
    isLoading.value = true
    const response = await orderService.getOrder(Number(route.params.id))
    order.value = response.data?.order || (response as any).order
    newStatus.value = response.data?.order?.status || (response as any).order?.status
  } catch (error) {
    console.error('Erreur lors du chargement de la commande:', error)
  } finally {
    isLoading.value = false
  }
}

const updateStatus = async () => {
  if (!newStatus.value) return
  
  try {
    isUpdating.value = true
    await orderService.updateOrder(Number(route.params.id), { 
      status: newStatus.value as 'pending' | 'confirmed' | 'shipped' | 'delivered' 
    })
    await fetchOrder()
  } catch (error) {
    console.error('Erreur lors de la mise à jour:', error)
  } finally {
    isUpdating.value = false
  }
}

onMounted(() => {
  fetchOrder()
})
</script>
