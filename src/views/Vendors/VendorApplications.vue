<template>
  <div class="p-6 max-w-7xl mx-auto">
    <!-- Premium Header -->
    <div class="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <i class="fas fa-store-alt text-blue-600"></i>
          Candidatures Vendeur
        </h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Gérez et approuvez les nouveaux partenaires de la plateforme</p>
      </div>
      
      <div v-if="counts.pending > 0" class="flex items-center gap-2 bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-800/30 px-4 py-2 rounded-xl text-orange-700 dark:text-orange-400 animate-pulse">
        <i class="fas fa-clock"></i>
        <span class="text-sm font-bold uppercase tracking-wider">
          {{ counts.pending }} en attente
        </span>
      </div>
    </div>
    
    <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
      <!-- Premium Filter Tabs -->
      <div class="bg-gray-50/50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
        <nav class="flex overflow-x-auto no-scrollbar px-4 pt-1">
          <button
            v-for="status in statusFilters"
            :key="status.value"
            @click="currentFilter = status.value"
            :class="[
              'px-6 py-4 font-bold text-sm transition-all relative flex items-center gap-2 whitespace-nowrap',
              currentFilter === status.value
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-gray-800/50'
            ]"
          >
            {{ status.label }}
            <span v-if="counts[status.value] > 0" :class="[
              'px-2 py-0.5 rounded-full text-[10px] font-bold',
              currentFilter === status.value ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 dark:bg-gray-700 text-gray-600'
            ]">
              {{ counts[status.value] }}
            </span>
            <div v-if="currentFilter === status.value" class="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t-full"></div>
          </button>
        </nav>
      </div>

      <!-- Search & Refresh -->
      <div class="p-6 border-b border-gray-100 dark:border-gray-700 flex flex-col md:flex-row gap-4 items-center">
        <div class="relative flex-1 w-full">
          <i class="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Rechercher par boutique, nom ou email..."
            class="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-gray-400 text-sm"
          />
        </div>
        <button @click="fetchApplications" class="p-3 text-blue-600 hover:bg-blue-50 rounded-xl transition-all" title="Actualiser">
          <i class="fas fa-sync-alt" :class="{ 'animate-spin': isLoading }"></i>
        </button>
      </div>
      
      <!-- Loading State -->
      <div v-if="isLoading" class="p-20 flex flex-col items-center justify-center">
        <div class="relative w-16 h-16">
          <div class="absolute inset-0 border-4 border-blue-100 dark:border-blue-900 rounded-full"></div>
          <div class="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
        </div>
        <p class="mt-4 text-sm font-medium text-gray-500 dark:text-gray-400">Chargement des candidatures...</p>
      </div>
      
      <!-- Empty State -->
      <div v-else-if="filteredApplications.length === 0" class="p-20 text-center">
        <div class="bg-gray-50 dark:bg-gray-900 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
          <i class="fas fa-folder-open text-gray-300 text-3xl"></i>
        </div>
        <h3 class="text-lg font-bold text-gray-900 dark:text-white">Aucune candidature</h3>
        <p class="text-gray-500 dark:text-gray-400 mt-1 max-w-xs mx-auto text-sm">Nous n'avons trouvé aucune demande correspondant à vos critères.</p>
      </div>
      
      <!-- Applications Table -->
      <div v-else class="overflow-x-auto">
        <table class="w-full border-collapse">
          <thead>
            <tr class="bg-gray-50/50 dark:bg-gray-900/50">
              <th class="text-left py-4 px-6 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest border-b border-gray-100 dark:border-gray-700">Vendeur / Boutique</th>
              <th class="text-left py-4 px-6 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest border-b border-gray-100 dark:border-gray-700">Contact / Responsable</th>
              <th class="text-left py-4 px-6 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest border-b border-gray-100 dark:border-gray-700">Date Inscription</th>
              <th class="text-left py-4 px-6 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest border-b border-gray-100 dark:border-gray-700">Statut</th>
              <th class="text-right py-4 px-6 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest border-b border-gray-100 dark:border-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50 dark:divide-gray-700/50">
            <tr v-for="app in filteredApplications" :key="app.id" class="group hover:bg-blue-50/30 dark:hover:bg-blue-900/5 transition-all">
              <td class="py-5 px-6">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 flex-shrink-0 font-bold uppercase">
                    {{ app.name.charAt(0) }}
                  </div>
                  <div>
                    <div class="text-sm font-bold text-gray-900 dark:text-white leading-tight">{{ app.name }}</div>
                    <div class="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 truncate max-w-[200px]">{{ app.description || 'Aucune biographie' }}</div>
                  </div>
                </div>
              </td>
              <td class="py-5 px-6">
                <div class="text-sm font-medium text-gray-900 dark:text-white">{{ app.owner?.name }}</div>
                <div class="flex items-center gap-1.5 mt-0.5">
                  <i class="far fa-envelope text-[10px] text-gray-400"></i>
                  <span class="text-[11px] text-gray-500 dark:text-gray-400">{{ app.owner?.email }}</span>
                </div>
              </td>
              <td class="py-5 px-6">
                <div class="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{{ formatDate(app.created_at) }}</div>
                <div class="text-[10px] text-gray-400 mt-0.5 flex items-center gap-1">
                  <i class="far fa-clock"></i>
                  Il y a {{ getTimeAgo(app.created_at) }}
                </div>
              </td>
              <td class="py-5 px-6">
                <span :class="getStatusClass(app.status)">
                  {{ getStatusText(app.status) }}
                </span>
              </td>
              <td class="py-5 px-6 text-right">
                <div class="flex items-center justify-end gap-2 pr-2">
                  <button
                    @click="viewDetails(app)"
                    class="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-all"
                    title="Voir les détails"
                  >
                    <i class="far fa-eye"></i>
                  </button>
                  
                  <button
                    @click="app.owner && contactVendeur(app.owner.id)"
                    class="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-all"
                    title="Contacter le vendeur"
                  >
                    <i class="far fa-comment"></i>
                  </button>
                  
                  <template v-if="app.status === 'pending'">
                    <button
                      @click="approveApplication(app.id)"
                      class="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-all"
                      title="Approuver"
                    >
                      <i class="fas fa-check"></i>
                    </button>
                    <button
                      @click="rejectApplication(app.id)"
                      class="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-all"
                      title="Rejeter"
                    >
                      <i class="fas fa-times"></i>
                    </button>
                  </template>

                  <template v-else-if="app.status === 'active'">
                    <button
                      @click="suspendVendor(app.id)"
                      class="p-2 text-orange-600 hover:bg-orange-100 rounded-lg transition-all"
                      title="Suspendre"
                    >
                      <i class="fas fa-pause"></i>
                    </button>
                  </template>

                  <template v-else-if="app.status === 'suspended'">
                    <button
                      @click="reactivateVendor(app.id)"
                      class="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-all"
                      title="Réactiver"
                    >
                      <i class="fas fa-play"></i>
                    </button>
                  </template>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Removed - Replaced by ApplicationDetail.vue page -->
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '@/services/api'
import { useUIStore } from '@/stores/ui'
import { formatVendorId } from '@/utils/formatters'

const uiStore = useUIStore()
const router = useRouter()

interface VendorApplication {
  id: number
  name: string
  description: string
  status: 'pending' | 'active' | 'suspended' | 'closed'
  created_at: string
  owner?: {
    id: number
    name: string
    email: string
    phone?: string
    role: string
  }
  settings?: {
    businessType?: string
    taxId?: string
    address?: string
    whatsapp?: string
    productStyle?: string
    identityData?: string
    statusReason?: string
  }
  commission_rate?: number
}

const applications = ref<VendorApplication[]>([])
const isLoading = ref(true)
const searchQuery = ref('')
const currentFilter = ref('all')

const counts = ref({
  all: 0,
  pending: 0,
  active: 0,
  suspended: 0,
  closed: 0
} as Record<string, number>)

const statusFilters = [
  { value: 'all', label: 'Toutes' },
  { value: 'pending', label: 'En attente' },
  { value: 'active', label: 'Actives' },
  { value: 'suspended', label: 'Suspendues' },
  { value: 'closed', label: 'Fermées' }
]

const filteredApplications = computed(() => {
  let filtered = applications.value

  // Filter by status
  if (currentFilter.value !== 'all') {
    filtered = filtered.filter(app => app.status === currentFilter.value)
  }

  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(app =>
      app.name.toLowerCase().includes(query) ||
      (app.owner?.name.toLowerCase().includes(query) ?? false) ||
      (app.owner?.email.toLowerCase().includes(query) ?? false)
    )
  }

  return filtered
})

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}

const getTimeAgo = (dateString: string) => {
  const diff = Date.now() - new Date(dateString).getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  if (days === 0) return "aujourd'hui"
  if (days === 1) return "hier"
  return `${days} jours`
}

const getStatusClass = (status: string, dark = false) => {
  const base = 'px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest border '
  const classes: Record<string, string> = {
    pending: base + 'bg-orange-50 border-orange-100 text-orange-600 dark:bg-orange-900/10 dark:border-orange-800/20',
    active: base + 'bg-green-50 border-green-100 text-green-600 dark:bg-green-900/10 dark:border-green-800/20',
    suspended: base + 'bg-red-50 border-red-100 text-red-600 dark:bg-red-900/10 dark:border-red-800/20',
    closed: base + 'bg-gray-100 border-gray-200 text-gray-400 dark:bg-gray-700/50 dark:border-gray-600/30'
  }
  return classes[status] || classes.closed
}

const getStatusText = (status: string) => {
  const texts: Record<string, string> = {
    pending: 'En attente',
    active: 'Active',
    suspended: 'Suspendue',
    closed: 'Fermée'
  }
  return texts[status] || status
}

const fetchApplications = async () => {
  try {
    isLoading.value = true
    const response = await api.get('/admin/vendors/applications')
    applications.value = response.data.applications || []
    counts.value = {
      all: response.data.total || 0,
      ...(response.data.counts || {})
    }
  } catch (error) {
    console.error('Erreur lors du chargement des candidatures:', error)
    uiStore.addToast('Impossible de charger les candidatures', 'error')
  } finally {
    isLoading.value = false
  }
}

const viewDetails = (application: VendorApplication) => {
  router.push(`/vendors/applications/${application.id}`)
}

const approveApplication = async (id: number) => {
  const confirmed = await uiStore.confirm({
    title: 'Approbation Vendeur',
    message: 'Êtes-vous sûr de vouloir autoriser ce vendeur à vendre sur HTFasil ? Un compte vendeur sera automatiquement créé.',
    confirmText: 'Oui, Approuver',
    type: 'info'
  })

  if (!confirmed) return

  try {
    await api.put(`/admin/vendors/applications/${id}/approve`)
    uiStore.addToast('Vendeur approuvé avec succès', 'success')
    selectedApplication.value = null
    await fetchApplications()
  } catch (error) {
    console.error('Erreur lors de l\'approbation:', error)
    uiStore.addToast('Une erreur est survenue lors de l\'approbation', 'error')
  }
}

const rejectApplication = async (id: number) => {
  const reason = await uiStore.prompt({
    title: 'Raison du rejet',
    message: 'Veuillez indiquer au candidat pourquoi sa demande a été refusée (sera envoyé par email).',
    placeholder: 'Ex: Justificatifs illisibles, politique de vente non conforme...',
    confirmText: 'Confirmer le rejet'
  })

  if (reason === null) return 

  try {
    await api.put(`/admin/vendors/applications/${id}/reject`, { reason })
    uiStore.addToast('Candidature rejetée', 'info')
    selectedApplication.value = null
    await fetchApplications()
  } catch (error) {
    console.error('Erreur lors du rejet:', error)
    uiStore.addToast('Erreur lors du rejet', 'error')
  }
}

const suspendVendor = async (id: number) => {
  const reason = await uiStore.prompt({
    title: 'Suspension de boutique',
    message: 'Indiquez le motif de suspension pour ce partenaire.',
    placeholder: 'Ex: Non respect des conditions générales, signalements récurrents...',
    confirmText: 'Suspendre maintenant'
  })

  if (!reason) return

  try {
    await api.put(`/admin/vendors/applications/${id}/suspend`, { reason })
    uiStore.addToast('Partenaire suspendu', 'warning')
    selectedApplication.value = null
    await fetchApplications()
  } catch (error) {
    console.error('Erreur lors de la suspension:', error)
    uiStore.addToast('Erreur lors de la suspension', 'error')
  }
}

const reactivateVendor = async (id: number) => {
  const confirmed = await uiStore.confirm({
    title: 'Réactivation de compte',
    message: 'Souhaitez-vous lever la suspension de ce vendeur ?',
    confirmText: 'Réactiver le compte'
  })

  if (!confirmed) return

  try {
    await api.put(`/admin/vendors/applications/${id}/reactivate`)
    uiStore.addToast('Boutique réactivée', 'success')
    selectedApplication.value = null
    await fetchApplications()
  } catch (error) {
    console.error('Erreur lors de la réactivation:', error)
    uiStore.addToast('Erreur lors de la réactivation', 'error')
  }
}

const contactVendeur = (userId: number) => {
  router.push({
    path: '/messages',
    query: { userId: userId.toString() }
  })
}

onMounted(() => {
  fetchApplications()
})
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 10px;
}
.dark .custom-scrollbar::-webkit-scrollbar-thumb {
  background: #475569;
}
</style>
