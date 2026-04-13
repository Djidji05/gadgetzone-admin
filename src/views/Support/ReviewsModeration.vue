<template>
  <div class="p-6">
    <div class="mb-6 flex items-center justify-between">
      <h1 class="text-2xl font-semibold text-gray-900 dark:text-white">Modération des Avis</h1>
      <div class="flex items-center gap-2">
        <span class="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
          {{ reviews.length }} en attente
        </span>
      </div>
    </div>
    
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
      <div v-if="isLoading" class="text-center py-20">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p class="mt-4 text-gray-600 dark:text-gray-400">Chargement des avis en attente...</p>
      </div>
      
      <div v-else-if="reviews.length === 0" class="text-center py-20">
        <div class="w-20 h-20 bg-gray-50 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
          <i class="las la-check-circle text-4xl text-green-500"></i>
        </div>
        <h3 class="text-lg font-medium text-gray-900 dark:text-white">Tout est à jour !</h3>
        <p class="text-gray-600 dark:text-gray-400">Aucun avis ne nécessite de modération pour le moment.</p>
      </div>
      
      <div v-else class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
              <th class="p-4 font-semibold text-gray-700 dark:text-gray-200">Produit & Client</th>
              <th class="p-4 font-semibold text-gray-700 dark:text-gray-200">Note & Commentaire</th>
              <th class="p-4 font-semibold text-gray-700 dark:text-gray-200 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50 dark:divide-gray-700">
            <tr v-for="review in reviews" :key="review.id" class="hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors">
              <td class="p-4">
                <div class="flex flex-col">
                  <span class="font-bold text-gray-900 dark:text-white">{{ review.product?.name }}</span>
                  <span class="text-sm text-gray-500 dark:text-gray-400">{{ review.user?.name }} ({{ review.user?.email }})</span>
                  <span class="text-[11px] text-gray-400 mt-1">{{ formatDate(review.createdAt || review.created_at) }}</span>
                </div>
              </td>
              <td class="p-4 max-w-md">
                <div class="flex items-center gap-1 mb-2">
                  <i v-for="i in 5" :key="i" 
                     class="las la-star text-sm"
                     :class="i <= review.rating ? 'text-yellow-400' : 'text-gray-300'">
                  </i>
                </div>
                <p class="text-sm text-gray-700 dark:text-gray-300 italic">"{{ review.comment || 'Sans commentaire' }}"</p>
              </td>
              <td class="p-4 text-right">
                <div class="flex justify-end gap-2">
                  <button
                    @click="moderateReview(review.id, 'approved')"
                    class="p-2 bg-green-50 text-green-600 hover:bg-green-100 rounded-lg transition-colors flex items-center gap-1"
                    title="Approuver"
                  >
                    <i class="las la-check"></i>
                    <span class="text-xs font-bold">Approuver</span>
                  </button>
                  <button
                    @click="moderateReview(review.id, 'rejected')"
                    class="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors flex items-center gap-1"
                    title="Rejeter"
                  >
                    <i class="las la-times"></i>
                    <span class="text-xs font-bold">Rejeter</span>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { reviewService } from '@/services/api'
import { useUIStore } from '@/stores/ui'

const uiStore = useUIStore()
const reviews = ref<any[]>([])
const isLoading = ref(true)

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const fetchPendingReviews = async () => {
  try {
    isLoading.value = true
    reviews.value = await reviewService.getPending()
  } catch (error) {
    console.error('Erreur lors du chargement des avis:', error)
    uiStore.addToast('Erreur lors du chargement des avis', 'error')
  } finally {
    isLoading.value = false
  }
}

const moderateReview = async (id: number, status: 'approved' | 'rejected') => {
  try {
    await reviewService.updateStatus(id, status)
    uiStore.addToast(status === 'approved' ? 'Avis approuvé' : 'Avis rejeté', 'success')
    // Remove from list
    reviews.value = reviews.value.filter(r => r.id !== id)
  } catch (error) {
    console.error('Erreur lors de la modération:', error)
    uiStore.addToast('Erreur lors de la modération', 'error')
  }
}

onMounted(() => {
  fetchPendingReviews()
})
</script>
