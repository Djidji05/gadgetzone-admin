<template>
  <div class="p-4 sm:p-6 space-y-6">
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Programme Ambassadeurs</h1>
        <p class="text-sm text-gray-600 dark:text-gray-400">Gérez les ambassadeurs et suivez leurs performances</p>
      </div>
    </div>

    <!-- Quick Stats -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <div class="flex items-center gap-4">
          <div class="p-3 bg-blue-100 rounded-lg text-blue-600">
            <i class="fas fa-users text-xl"></i>
          </div>
          <div>
            <p class="text-sm text-gray-500 font-medium uppercase">Total Ambassadeurs</p>
            <p class="text-2xl font-bold dark:text-white">{{ ambassadors.length }}</p>
          </div>
        </div>
      </div>
      <div class="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <div class="flex items-center gap-4">
          <div class="p-3 bg-green-100 rounded-lg text-green-600">
            <i class="fas fa-hand-holding-usd text-xl"></i>
          </div>
          <div>
            <p class="text-sm text-gray-500 font-medium uppercase">Total Commissions</p>
            <p class="text-2xl font-bold dark:text-white">{{ formatCurrency(totalCommissions) }}</p>
          </div>
        </div>
      </div>
      <div class="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <div class="flex items-center gap-4">
          <div class="p-3 bg-orange-100 rounded-lg text-orange-600">
            <i class="fas fa-user-clock text-xl"></i>
          </div>
          <div>
            <p class="text-sm text-gray-500 font-medium uppercase">En attente d’approbation</p>
            <p class="text-2xl font-bold dark:text-white">{{ pendingCount }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters & Table -->
    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
      <div class="p-4 border-b border-gray-100 dark:border-gray-700 flex flex-wrap gap-4 justify-between items-center">
        <div class="relative w-full sm:w-64">
          <i class="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
          <input 
            v-model="search" 
            type="text" 
            placeholder="Rechercher un ambassadeur..." 
            class="form-input w-full pl-10"
          />
        </div>
        <div class="flex gap-2">
          <button 
            v-for="status in ['all', 'active', 'pending', 'suspended']" 
            :key="status"
            @click="statusFilter = status"
            :class="[
              statusFilter === status 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200',
              'px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors'
            ]"
          >
            {{ translateStatus(status) }}
          </button>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50 dark:bg-gray-900/50 text-left">
            <tr>
              <th class="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Ambassadeur</th>
              <th class="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Code Promo</th>
              <th class="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Parrainages</th>
              <th class="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Gains Totaux</th>
              <th class="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Statut</th>
              <th class="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
            <tr v-if="loading">
              <td colspan="6" class="px-6 py-10 text-center text-gray-500">
                <i class="fas fa-spinner fa-spin mr-2"></i> Chargement...
              </td>
            </tr>
            <tr v-else-if="filteredAmbassadors.length === 0">
              <td colspan="6" class="px-6 py-10 text-center text-gray-500">Aucun ambassadeur trouvé</td>
            </tr>
            <tr v-for="amb in filteredAmbassadors" :key="amb.id" class="hover:bg-gray-50 dark:hover:bg-gray-900/20 transition-colors">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                    {{ amb.user?.name?.charAt(0) || 'A' }}
                  </div>
                  <div>
                    <p class="font-bold text-gray-900 dark:text-white">{{ amb.user?.name }}</p>
                    <p class="text-xs text-gray-500">{{ amb.user?.email }}</p>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded font-mono text-sm font-bold text-gray-700 dark:text-gray-300">
                  {{ amb.referral_code || '---' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400 font-medium">
                {{ amb.referral_count || 0 }} clics / {{ amb.success_referrals || 0 }} ventes
              </td>
              <td class="px-6 py-4 whitespace-nowrap font-bold text-green-600">
                {{ formatCurrency(amb.total_earnings || 0) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="getStatusBadgeClass(amb.status)">
                  {{ translateStatus(amb.status) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right">
                <div class="flex justify-end gap-2">
                  <button 
                    v-if="amb.status === 'pending'"
                    @click="updateStatus(amb.id, 'active')" 
                    class="p-2 bg-green-100 text-green-600 hover:bg-green-600 hover:text-white rounded-lg transition-all"
                    title="Approuver"
                  >
                    <i class="fas fa-check"></i>
                  </button>
                  <button 
                    v-if="amb.status === 'active'"
                    @click="updateStatus(amb.id, 'suspended')" 
                    class="p-2 bg-orange-100 text-orange-600 hover:bg-orange-600 hover:text-white rounded-lg transition-all"
                    title="Suspendre"
                  >
                    <i class="fas fa-pause"></i>
                  </button>
                  <button 
                    v-if="amb.status === 'suspended'"
                    @click="updateStatus(amb.id, 'active')" 
                    class="p-2 bg-blue-100 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg transition-all"
                    title="Réactiver"
                  >
                    <i class="fas fa-play"></i>
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
import { ref, computed, onMounted } from 'vue'
import { ambassadorService } from '@/services/api'
import { useUIStore } from '@/stores/ui'

const uiStore = useUIStore()
const ambassadors = ref<any[]>([])
const loading = ref(false)
const search = ref('')
const statusFilter = ref('all')

const loadAmbassadors = async () => {
  loading.value = true
  try {
    const data = await ambassadorService.getAll()
    ambassadors.value = Array.isArray(data) ? data : (data.ambassadors || [])
  } catch (error) {
    console.error('Error loading ambassadors:', error)
    uiStore.addToast('Erreur lors du chargement des ambassadeurs', 'error')
  } finally {
    loading.value = false
  }
}

const filteredAmbassadors = computed(() => {
  return ambassadors.value.filter(amb => {
    const matchesSearch = amb.user?.name?.toLowerCase().includes(search.value.toLowerCase()) || 
                          amb.referral_code?.toLowerCase().includes(search.value.toLowerCase())
    const matchesStatus = statusFilter.value === 'all' || amb.status === statusFilter.value
    return matchesSearch && matchesStatus
  })
})

const pendingCount = computed(() => ambassadors.value.filter(a => a.status === 'pending').length)
const totalCommissions = computed(() => ambassadors.value.reduce((sum, a) => sum + (a.total_earnings || 0), 0))

const translateStatus = (status: string) => {
  const map: any = {
    'all': 'Tout',
    'active': 'Actif',
    'pending': 'En attente',
    'suspended': 'Suspendu'
  }
  return map[status] || status
}

const getStatusBadgeClass = (status: string) => {
  switch (status) {
    case 'active': return 'bg-green-100 text-green-700 px-2 py-1 rounded-full text-[10px] font-bold uppercase'
    case 'pending': return 'bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-[10px] font-bold uppercase'
    case 'suspended': return 'bg-red-100 text-red-700 px-2 py-1 rounded-full text-[10px] font-bold uppercase'
    default: return 'bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-[10px] font-bold uppercase'
  }
}

const updateStatus = async (id: number, status: string) => {
  try {
    await ambassadorService.updateStatus(id, status)
    uiStore.addToast(`Statut mis à jour : ${translateStatus(status)}`, 'success')
    await loadAmbassadors()
  } catch (error) {
    uiStore.addToast('Erreur lors de la mise à jour', 'error')
  }
}

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'HTG' }).format(val)
}

onMounted(loadAmbassadors)

defineOptions({ name: 'AmbassadorList' })
</script>
