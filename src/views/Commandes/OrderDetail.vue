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
      
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Colonne Gauche: Infos & Articles -->
        <div class="lg:col-span-2 space-y-6">
           <!-- Informations générales -->
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 class="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Informations générales</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p class="text-sm text-gray-600 dark:text-gray-400">Numéro de commande</p>
                <p class="font-medium">#{{ order.id }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-600 dark:text-gray-400">Date de création</p>
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
                <p class="text-sm text-gray-600 dark:text-gray-400">Statut Actuel</p>
                <span :class="getStatusClass(order.status)">
                  {{ getStatusText(order.status) }}
                </span>
              </div>
              <div>
                <p class="text-sm text-gray-600 dark:text-gray-400">Total</p>
                <p class="font-medium text-lg">{{ formatCurrency(order.total_amount) }}</p>
              </div>
              <div class="md:col-span-2">
                <p class="text-sm text-gray-600 dark:text-gray-400">Adresse de Livraison</p>
                <p class="font-medium">{{ formattedAddress }}</p>
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
                    <td class="p-2">
                      <div class="flex items-center gap-3">
                        <img v-if="item.product?.image_url" :src="item.product.image_url" class="w-10 h-10 object-cover rounded" />
                        <div class="flex flex-col">
                          <span class="font-medium text-gray-900 dark:text-white">{{ item.product?.name || '-' }}</span>
                          <span v-if="item.product?.store" class="text-xs text-gray-500">
                            Vendu par : <span class="font-semibold text-blue-600">{{ item.product.store.name }}</span>
                          </span>
                        </div>
                      </div>
                    </td>
                    <td class="p-2">{{ item.quantity }}</td>
                    <td class="p-2">{{ formatCurrency(item.price) }}</td>
                    <td class="p-2 font-medium">{{ formatCurrency(item.quantity * item.price) }}</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr class="border-t-2 dark:border-gray-700">
                    <td colspan="3" class="p-2 font-semibold text-right">Total</td>
                    <td class="p-2 font-semibold text-lg">{{ formatCurrency(order.total_amount) }}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>

        <!-- Colonne Droite: Historique & Actions -->
        <div class="space-y-6">
          <!-- Actions -->
          <div v-if="authStore.isAdmin" class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 class="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Mettre à jour le statut</h2>
            <div class="space-y-4">
              <select
                v-model="newStatus"
                class="w-full px-4 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600"
              >
                <option value="">Sélectionner un statut</option>
                <option value="pending">En attente</option>
                <option value="confirmed">Confirmée</option>
                <option value="shipped">Expédiée</option>
                <option value="delivered">Livrée</option>
                <option value="cancelled">Annulée</option>
              </select>
              <button
                @click="updateStatus"
                :disabled="!newStatus || isUpdating || newStatus === order.status"
                class="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors flex justify-center items-center gap-2"
              >
                <svg v-if="isUpdating" class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {{ isUpdating ? 'Mise à jour...' : 'Mettre à jour' }}
              </button>
            </div>
          </div>

          <!-- Historique de la commande (Timeline) -->
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 class="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Historique de la commande</h2>
            
            <div class="relative pl-4 border-l-2 border-gray-200 dark:border-gray-700 space-y-6">
              
              <!-- Timeline Items from Logs -->
              <div v-for="log in order.logs" :key="log.id" class="relative">
                <div class="absolute -left-[21px] top-1 h-3 w-3 rounded-full border-2 border-white dark:border-gray-800" 
                     :class="getLogColor(log.new_status)"></div>
                
                <div class="text-sm">
                  <p class="font-medium text-gray-900 dark:text-white">
                    {{ getStatusText(log.new_status) }}
                  </p>
                  <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    {{ formatDate(log.created_at) }}
                  </p>
                  <p class="text-xs text-gray-600 dark:text-gray-300">
                    Par: <span class="font-semibold">{{ log.actor?.name || 'Système' }}</span>
                  </p>
                </div>
              </div>

               <!-- Fallback if no logs (show current dates) -->
               <div v-if="(!order.logs || order.logs.length === 0)" class="space-y-6">
                  <div v-if="order.created_at" class="relative">
                    <div class="absolute -left-[21px] top-1 h-3 w-3 rounded-full bg-gray-400 border-2 border-white dark:border-gray-800"></div>
                    <div class="text-sm">
                      <p class="font-medium">Création</p>
                      <p class="text-xs text-gray-500">{{ formatDate(order.created_at) }}</p>
                    </div>
                  </div>
                  <div v-if="order.confirmed_at" class="relative">
                    <div class="absolute -left-[21px] top-1 h-3 w-3 rounded-full bg-blue-500 border-2 border-white dark:border-gray-800"></div>
                    <div class="text-sm">
                      <p class="font-medium">Confirmée</p>
                      <p class="text-xs text-gray-500">{{ formatDate(order.confirmed_at) }}</p>
                    </div>
                  </div>
                  <div v-if="order.shipped_at" class="relative">
                    <div class="absolute -left-[21px] top-1 h-3 w-3 rounded-full bg-purple-500 border-2 border-white dark:border-gray-800"></div>
                    <div class="text-sm">
                      <p class="font-medium">Expédiée</p>
                      <p class="text-xs text-gray-500">{{ formatDate(order.shipped_at) }}</p>
                    </div>
                  </div>
                  <div v-if="order.delivered_at" class="relative">
                    <div class="absolute -left-[21px] top-1 h-3 w-3 rounded-full bg-green-500 border-2 border-white dark:border-gray-800"></div>
                    <div class="text-sm">
                      <p class="font-medium">Livrée</p>
                      <p class="text-xs text-gray-500">{{ formatDate(order.delivered_at) }}</p>
                    </div>
                  </div>
               </div>

            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { orderService } from '@/services/api'

// Définition locale de l'interface Order pour inclure les logs
interface OrderLog {
  id: number;
  action: string;
  old_status: string;
  new_status: string;
  details: string;
  created_at: string;
  actor?: {
    id: number;
    name: string;
    email: string;
  };
}

interface Order {
  id: number;
  user?: { name: string; email: string };
  total_amount: number;
  status: string;
  created_at: string;
  confirmed_at?: string;
  shipped_at?: string;
  delivered_at?: string;
  shipping_address?: string;
  items: any[];
  logs?: OrderLog[];
}

const route = useRoute()
const authStore = useAuthStore()

const order = ref<Order | null>(null)
const isLoading = ref(true)
const isUpdating = ref(false)
const newStatus = ref('')

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'HTG'
  }).format(value)
}

const formatDate = (dateString: string) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getStatusClass = (status: string) => {
  const classes: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium',
    confirmed: 'bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium',
    shipped: 'bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-medium',
    delivered: 'bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium',
    cancelled: 'bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium'
  }
  return classes[status] || 'bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-medium'
}

const getStatusText = (status: string) => {
  const texts: Record<string, string> = {
    pending: 'En attente',
    confirmed: 'Confirmée',
    shipped: 'Expédiée',
    delivered: 'Livrée',
    cancelled: 'Annulée'
  }
  return texts[status] || status
}

const getLogColor = (status: string) => {
    switch(status) {
        case 'pending': return 'bg-yellow-500';
        case 'confirmed': return 'bg-blue-500';
        case 'shipped': return 'bg-purple-500';
        case 'delivered': return 'bg-green-500';
        case 'cancelled': return 'bg-red-500';
        default: return 'bg-gray-500';
    }
}

const fetchOrder = async () => {
  try {
    isLoading.value = true
    const fetchedOrder = await orderService.getById(Number(route.params.id))
    order.value = fetchedOrder
    newStatus.value = fetchedOrder.status
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
      status: newStatus.value
    })
    await fetchOrder() // Recharger pour avoir les nouveaux logs
  } catch (error) {
    console.error('Erreur lors de la mise à jour:', error)
  } finally {
    isUpdating.value = false
  }
}



const formattedAddress = computed(() => {
    if (!order.value || !order.value.shipping_address) return 'Non spécifiée';
    try {
        if (order.value.shipping_address.startsWith('{')) {
            const addr = JSON.parse(order.value.shipping_address);
            return `${addr.street || ''}, ${addr.city || ''}, ${addr.country || ''}`;
        }
        return order.value.shipping_address;
    } catch (e) {
        return order.value.shipping_address;
    }
});

onMounted(() => {
  fetchOrder()
})
</script>
