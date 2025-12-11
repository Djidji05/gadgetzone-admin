<template>
  <div
    class="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6"
  >
    <div class="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h3 class="text-lg font-semibold text-gray-800 dark:text-white/90">Commandes Récentes</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Dernières commandes passées sur la plateforme
        </p>
      </div>

      <div class="flex items-center gap-3">
        <button
          @click="loadOrders"
          class="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 transition-colors"
        >
          <svg
            class="stroke-current fill-white dark:fill-gray-800"
            width="18"
            height="18"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M17.7 8.5C17.1 5.2 14.3 2.7 11 2.7C7.7 2.7 4.9 5.2 4.3 8.5M2.3 11.5C2.9 14.8 5.7 17.3 9 17.3C12.3 17.3 15.1 14.8 15.7 11.5"
              stroke=""
              stroke-width="1.5"
              stroke-linecap="round"
            />
          </svg>
          Actualiser
        </button>

        <router-link
          to="/commandes"
          class="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors"
        >
          Voir tout
        </router-link>
      </div>
    </div>

    <div v-if="isLoading" class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>

    <div v-else-if="error" class="text-center py-12">
      <p class="text-red-600 dark:text-red-400">{{ error }}</p>
    </div>

    <div v-else-if="orders.length === 0" class="text-center py-12">
      <p class="text-gray-500 dark:text-gray-400">Aucune commande récente</p>
    </div>

    <div v-else class="max-w-full overflow-x-auto custom-scrollbar">
      <table class="min-w-full">
        <thead>
          <tr class="border-t border-gray-100 dark:border-gray-800">
            <th class="py-3 text-left">
              <p class="font-medium text-gray-500 text-xs uppercase tracking-wider dark:text-gray-400">
                ID
              </p>
            </th>
            <th class="py-3 text-left">
              <p class="font-medium text-gray-500 text-xs uppercase tracking-wider dark:text-gray-400">
                Client
              </p>
            </th>
            <th class="py-3 text-left">
              <p class="font-medium text-gray-500 text-xs uppercase tracking-wider dark:text-gray-400">
                Montant
              </p>
            </th>
            <th class="py-3 text-left">
              <p class="font-medium text-gray-500 text-xs uppercase tracking-wider dark:text-gray-400">
                Date
              </p>
            </th>
            <th class="py-3 text-left">
              <p class="font-medium text-gray-500 text-xs uppercase tracking-wider dark:text-gray-400">
                Statut
              </p>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="order in orders"
            :key="order.id"
            class="border-t border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors cursor-pointer"
            @click="goToOrder(order.id)"
          >
            <td class="py-3 whitespace-nowrap">
              <p class="font-mono text-sm font-medium text-gray-800 dark:text-white/90">
                #{{ order.id.toString().padStart(4, '0') }}
              </p>
            </td>
            <td class="py-3 whitespace-nowrap">
              <div>
                <p class="font-medium text-sm text-gray-800 dark:text-white/90">
                  {{ order.user_name || 'Client inconnu' }}
                </p>
                <span class="text-xs text-gray-500 dark:text-gray-400">{{
                  order.user_email
                }}</span>
              </div>
            </td>
            <td class="py-3 whitespace-nowrap">
              <p class="text-sm font-semibold text-gray-800 dark:text-white/90">
                {{ formatCurrency(order.total_amount) }}
              </p>
            </td>
            <td class="py-3 whitespace-nowrap">
              <p class="text-sm text-gray-500 dark:text-gray-400">{{ formatDate(order.created_at) }}</p>
            </td>
            <td class="py-3 whitespace-nowrap">
              <span
                :class="{
                  'rounded-full px-3 py-1 text-xs font-semibold': true,
                  'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400':
                    order.status === 'delivered',
                  'bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400':
                    order.status === 'shipped',
                  'bg-yellow-50 text-yellow-700 dark:bg-yellow-500/15 dark:text-yellow-400':
                    order.status === 'processing',
                  'bg-orange-50 text-orange-700 dark:bg-orange-500/15 dark:text-orange-400':
                    order.status === 'pending',
                  'bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-400':
                    order.status === 'cancelled'
                }"
              >
                {{ getStatusLabel(order.status) }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { orderService } from '@/services/api'

const router = useRouter()
const orders = ref([])
const isLoading = ref(true)
const error = ref(null)

const formatCurrency = (value) => {
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value) + ' HTG'
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(date)
}

const getStatusLabel = (status) => {
  const labels = {
    pending: 'En attente',
    processing: 'En cours',
    shipped: 'Expédiée',
    delivered: 'Livrée',
    cancelled: 'Annulée'
  }
  return labels[status] || status
}

const loadOrders = async () => {
  try {
    isLoading.value = true
    error.value = null

    const allOrders = await orderService.getAll()
    // Get only the 5 most recent orders
    orders.value = allOrders.slice(0, 5)
  } catch (err) {
    console.error('Erreur lors du chargement des commandes:', err)
    error.value = 'Impossible de charger les commandes'
  } finally {
    isLoading.value = false
  }
}

const goToOrder = (orderId) => {
  router.push(`/commandes/${orderId}`)
}

onMounted(() => {
  loadOrders()
})
</script>
