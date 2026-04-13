<template>
  <div class="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
    <div class="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <h2 class="text-title-md2 font-bold text-black dark:text-white">
        Gestion des Litiges
      </h2>
      <nav>
        <ol class="flex items-center gap-2">
          <li>
            <router-link class="font-medium" to="/">Tableau de bord /</router-link>
          </li>
          <li class="font-medium text-primary">Litiges</li>
        </ol>
      </nav>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6 xl:grid-cols-3 mb-6">
      <div class="rounded-sm border border-stroke bg-white py-6 px-7.5 shadow-default dark:border-strokedark dark:bg-boxdark">
        <div class="flex items-center justify-between">
          <div>
            <h4 class="text-title-md font-bold text-black dark:text-white">{{ stats.pending }}</h4>
            <span class="text-sm font-medium text-gray-500">En attente</span>
          </div>
          <div class="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4">
            <svg class="fill-warning h-6 w-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z" fill="currentColor"/>
            </svg>
          </div>
        </div>
      </div>
      <div class="rounded-sm border border-stroke bg-white py-6 px-7.5 shadow-default dark:border-strokedark dark:bg-boxdark">
        <div class="flex items-center justify-between">
          <div>
            <h4 class="text-title-md font-bold text-black dark:text-white">{{ stats.under_review }}</h4>
            <span class="text-sm font-medium text-gray-500">En cours d'examen</span>
          </div>
          <div class="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4">
            <svg class="fill-primary h-6 w-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20ZM12.5 7H11V13L16.25 16.15L17 14.92L12.5 12.25V7Z" fill="currentColor"/>
            </svg>
          </div>
        </div>
      </div>
      <div class="rounded-sm border border-stroke bg-white py-6 px-7.5 shadow-default dark:border-strokedark dark:bg-boxdark">
        <div class="flex items-center justify-between">
          <div>
            <h4 class="text-title-md font-bold text-black dark:text-white">{{ stats.resolved }}</h4>
            <span class="text-sm font-medium text-gray-500">Résolus</span>
          </div>
          <div class="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4">
            <svg class="fill-success h-6 w-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z" fill="currentColor"/>
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters and Table -->
    <div class="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
      <div class="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div class="flex items-center gap-4">
            <button
              v-for="status in statusOptions"
              :key="status.value"
              @click="selectedStatus = status.value"
              :class="[
                'px-4 py-2 text-sm font-medium rounded-md transition-colors',
                selectedStatus === status.value
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-meta-4 dark:text-gray-300 dark:hover:bg-opacity-80'
              ]"
            >
              {{ status.label }}
            </button>
          </div>
          <div class="relative">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Rechercher..."
              class="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 pl-10 pr-5 font-medium outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
            />
            <span class="absolute left-4 top-1/2 -translate-y-1/2">
              <svg class="fill-body hover:fill-primary" width="18" height="18" viewBox="0 0 18 18">
                <path d="M15.7 14.3L12.5 11.1C13.4 10 14 8.6 14 7C14 3.1 10.9 0 7 0C3.1 0 0 3.1 0 7C0 10.9 3.1 14 7 14C8.6 14 10 13.4 11.1 12.5L14.3 15.7C14.5 15.9 14.8 16 15 16C15.2 16 15.5 15.9 15.7 15.7C16.1 15.3 16.1 14.7 15.7 14.3ZM2 7C2 4.2 4.2 2 7 2C9.8 2 12 4.2 12 7C12 9.8 9.8 12 7 12C4.2 12 2 9.8 2 7Z" />
              </svg>
            </span>
          </div>
        </div>
      </div>

      <div class="p-6.5">
        <div class="max-w-full overflow-x-auto">
          <table class="w-full table-auto">
            <thead>
              <tr class="bg-gray-2 text-left dark:bg-meta-4">
                <th class="min-w-[100px] py-4 px-4 font-medium text-black dark:text-white"># ID</th>
                <th class="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">Client</th>
                <th class="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">Raison</th>
                <th class="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">Commande</th>
                <th class="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">Statut</th>
                <th class="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">Date</th>
                <th class="py-4 px-4 font-medium text-black dark:text-white">Actions</th>
              </tr>
            </thead>
            <tbody>
              <template v-if="loading">
                <tr>
                  <td colspan="7" class="py-10 text-center">
                    <div class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
                  </td>
                </tr>
              </template>
              <template v-else-if="filteredDisputes.length === 0">
                <tr>
                  <td colspan="7" class="py-10 text-center text-gray-500">
                    Aucun litige trouvé.
                  </td>
                </tr>
              </template>
              <template v-else>
                <tr v-for="dispute in filteredDisputes" :key="dispute.id" class="border-b border-stroke dark:border-strokedark transition-colors hover:bg-gray-50 dark:hover:bg-meta-4/20 cursor-pointer" @click="$router.push(`/support/disputes/${dispute.id}`)">
                  <td class="py-5 px-4">
                    <p class="text-black dark:text-white">#{{ dispute.id }}</p>
                  </td>
                  <td class="py-5 px-4">
                    <p class="text-black dark:text-white font-medium">{{ dispute.customer?.name || 'Inconnu' }}</p>
                    <p class="text-xs text-gray-500">{{ dispute.customer?.email }}</p>
                  </td>
                  <td class="py-5 px-4">
                    <p class="text-black dark:text-white">{{ formatReason(dispute.reason) }}</p>
                    <p class="text-xs text-gray-500 line-clamp-1">{{ dispute.description }}</p>
                  </td>
                  <td class="py-5 px-4">
                    <p class="text-black dark:text-white">#{{ dispute.order_id }}</p>
                  </td>
                  <td class="py-5 px-4">
                    <p
                      :class="[
                        'inline-flex rounded-full py-1 px-3 text-xs font-medium bg-opacity-10',
                        statusClasses[dispute.status] || 'bg-gray-500 text-gray-500'
                      ]"
                    >
                      {{ formatStatus(dispute.status) }}
                    </p>
                  </td>
                  <td class="py-5 px-4">
                    <p class="text-black dark:text-white text-sm">{{ formatDate(dispute.created_at) }}</p>
                  </td>
                  <td class="py-5 px-4">
                    <div class="flex items-center space-x-3.5">
                      <button class="hover:text-primary">
                        <svg class="fill-current" width="18" height="18" viewBox="0 0 18 18">
                          <path d="M8.99981 14.8219C3.43106 14.8219 0.674805 9.50632 0.562305 9.28132C0.47793 9.11257 0.47793 8.88757 0.562305 8.71882C0.674805 8.49382 3.43106 3.17822 8.99981 3.17822C14.5686 3.17822 17.3248 8.49382 17.4373 8.71882C17.5217 8.88757 17.5217 9.11257 17.4373 9.28132C17.3248 9.50632 14.5686 14.8219 8.99981 14.8219ZM1.85605 9.00007C2.47481 9.9282 4.70605 13.0407 8.99981 13.0407C13.2936 13.0407 15.5248 9.9282 16.1436 9.00007C15.5248 8.07195 13.2936 4.95945 8.99981 4.95945C4.70605 4.95945 2.47481 8.07195 1.85605 9.00007Z" />
                          <path d="M9 11.3906C7.67812 11.3906 6.60938 10.3219 6.60938 9C6.60938 7.67812 7.67812 6.60938 9 6.60938C10.3219 6.60938 11.3906 7.67812 11.3906 9C11.3906 10.3219 10.3219 11.3906 9 11.3906ZM9 8.39062C8.6625 8.39062 8.39062 8.6625 8.39062 9C8.39062 9.3375 8.6625 9.60938 9 9.60938C9.3375 9.60938 9.60938 9.3375 9.60938 9C9.60938 8.6625 9.3375 8.39062 9 8.39062Z" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { disputeService } from '@/services/api'
import { useAuthStore } from '@/stores/auth'
import { useUIStore } from '@/stores/ui'

const authStore = useAuthStore()
const uiStore = useUIStore()

const disputes = ref<any[]>([])
const loading = ref(true)
const selectedStatus = ref('all')
const searchQuery = ref('')

const statusOptions = [
  { value: 'all', label: 'Tous' },
  { value: 'pending', label: 'En attente' },
  { value: 'under_review', label: 'En examen' },
  { value: 'resolved', label: 'Résolus' },
  { value: 'closed', label: 'Fermés' }
]

const statusClasses: Record<string, string> = {
  pending: 'bg-warning text-warning',
  under_review: 'bg-primary text-primary',
  resolved: 'bg-success text-success',
  closed: 'bg-gray-500 text-gray-500'
}

const loadDisputes = async () => {
  try {
    loading.value = true
    let data
    if (authStore.isAdmin) {
      data = await disputeService.getAll()
    } else {
      data = await disputeService.getSellerDisputes()
    }
    disputes.value = Array.isArray(data) ? data : []
  } catch (error) {
    console.error('Erreur chargement litiges:', error)
    uiStore.addToast('Erreur lors du chargement des litiges', 'error')
  } finally {
    loading.value = false
  }
}

const filteredDisputes = computed(() => {
  if (!Array.isArray(disputes.value)) return []
  
  return disputes.value.filter((d) => {
    const statusMatch = selectedStatus.value === 'all' || d.status === selectedStatus.value
    const searchMatch = !searchQuery.value || 
      d.id.toString().includes(searchQuery.value) ||
      d.customer?.name?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      d.reason?.toLowerCase().includes(searchQuery.value.toLowerCase())
    return statusMatch && searchMatch
  })
})

const stats = computed(() => {
  return {
    pending: disputes.value.filter(d => d.status === 'pending').length,
    under_review: disputes.value.filter(d => d.status === 'under_review').length,
    resolved: disputes.value.filter(d => d.status === 'resolved').length
  }
})

const formatReason = (reason: string) => {
  const reasons: Record<string, string> = {
    not_received: 'Non reçu',
    damaged: 'Endommagé',
    wrong_item: 'Mauvais article',
    other: 'Autre'
  }
  return reasons[reason] || reason
}

const formatStatus = (status: string) => {
  const statuses: Record<string, string> = {
    pending: 'En attente',
    under_review: 'En examen',
    resolved: 'Résolu',
    closed: 'Fermé'
  }
  return statuses[status] || status
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

onMounted(() => {
  loadDisputes()
})
</script>
