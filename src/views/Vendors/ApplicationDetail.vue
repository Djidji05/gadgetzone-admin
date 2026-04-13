<template>
  <div class="p-6 max-w-5xl mx-auto">
    <!-- Back Button & Header -->
    <div class="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div class="flex items-center gap-4">
        <button 
          @click="router.push('/vendors/applications')"
          class="w-10 h-10 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 flex items-center justify-center text-gray-500 hover:text-blue-600 hover:border-blue-100 transition-all shadow-sm"
        >
          <i class="fas fa-arrow-left"></i>
        </button>
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            Candidature : {{ application?.name || 'Chargement...' }}
          </h1>
          <div v-if="application" class="flex items-center gap-2 mt-1">
            <span class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">ID: {{ formatVendorId(application.id) }}</span>
            <span :class="getStatusClass(application.status)">{{ getStatusText(application.status) }}</span>
          </div>
        </div>
      </div>
      
      <div v-if="application" class="flex gap-3">
        <button 
          @click="contactVendeur(application.owner?.id)"
          class="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-xl font-bold text-sm hover:bg-blue-100 transition-all border border-blue-100 dark:border-blue-800/20"
        >
          <i class="fas fa-comment"></i>
          Contacter le Gérant
        </button>
      </div>
    </div>

    <!-- Error State -->
    <div v-if="error" class="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/30 p-6 rounded-2xl text-center">
      <i class="fas fa-exclamation-triangle text-red-500 text-3xl mb-4"></i>
      <h3 class="text-lg font-bold text-gray-900 dark:text-white">{{ error }}</h3>
      <button @click="fetchApplication" class="mt-4 text-blue-600 hover:underline font-bold text-sm">Réessayer</button>
    </div>

    <!-- Loading State -->
    <div v-else-if="isLoading" class="p-20 flex flex-col items-center justify-center bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
      <div class="relative w-16 h-16">
        <div class="absolute inset-0 border-4 border-blue-100 dark:border-blue-900 rounded-full"></div>
        <div class="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
      </div>
      <p class="mt-4 text-sm font-medium text-gray-500 dark:text-gray-400">Récupération des pièces du dossier...</p>
    </div>

    <!-- Main Content -->
    <div v-else-if="application" class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      <!-- Left Column: Dossier -->
      <div class="lg:col-span-2 space-y-8">
        <!-- Informations Generales -->
        <div class="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 space-y-8 text-sm">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <!-- Boutique Section -->
            <div class="space-y-4">
              <h3 class="text-xs font-bold text-blue-600 uppercase tracking-widest flex items-center gap-2">
                <span class="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                La Boutique
              </h3>
              <div class="grid gap-4">
                <div class="bg-gray-50 dark:bg-gray-900 p-4 rounded-2xl">
                  <div class="text-[10px] text-gray-400 uppercase font-bold mb-1 tracking-wider">Nom commercial</div>
                  <div class="text-sm font-bold text-gray-900 dark:text-white">{{ application.name }}</div>
                </div>
                <div class="bg-gray-50 dark:bg-gray-900 p-4 rounded-2xl">
                  <div class="text-[10px] text-gray-400 uppercase font-bold mb-1 tracking-wider">Description</div>
                  <div class="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{{ application.description || 'N/A' }}</div>
                </div>
              </div>
            </div>

            <!-- Gérant Section -->
            <div class="space-y-4">
              <h3 class="text-xs font-bold text-blue-600 uppercase tracking-widest flex items-center gap-2">
                <span class="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                Le Gérant
              </h3>
              <div class="grid gap-4">
                <div class="bg-gray-50 dark:bg-gray-900 p-4 rounded-2xl">
                  <div class="text-[10px] text-gray-400 uppercase font-bold mb-1 tracking-wider">Nom complet</div>
                  <div class="text-sm font-bold text-gray-900 dark:text-white">{{ application.owner?.name }}</div>
                </div>
                <div class="bg-gray-50 dark:bg-gray-900 p-4 rounded-2xl">
                  <div class="text-[10px] text-gray-400 uppercase font-bold mb-1 tracking-wider">Contact Email</div>
                  <div class="text-sm font-bold text-gray-900 dark:text-white">{{ application.owner?.email }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Raison du Statut (Rejet/Suspension) -->
          <div v-if="application.settings?.statusReason" class="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/30 p-6 rounded-3xl space-y-2">
            <h3 class="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-widest flex items-center gap-2">
              <i class="fas fa-exclamation-circle text-sm"></i>
              Motif du statut actuel ({{ getStatusText(application.status) }})
            </h3>
            <p class="text-sm text-red-700 dark:text-red-300 font-medium leading-relaxed">
              {{ application.settings.statusReason }}
            </p>
          </div>

          <!-- Business Profile -->
          <div v-if="application.settings" class="space-y-4 pt-4 border-t border-gray-50 dark:border-gray-700">
            <h3 class="text-xs font-bold text-blue-600 uppercase tracking-widest flex items-center gap-2">
              <span class="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
              Profil Professionnel
            </h3>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div class="bg-gray-50 dark:bg-gray-900 p-4 rounded-2xl">
                <div class="text-[10px] text-gray-400 uppercase font-bold mb-1 tracking-wider">Type Business</div>
                <div class="text-sm font-bold dark:text-white">{{ application.settings.businessType || 'N/A' }}</div>
              </div>
              <div class="bg-gray-50 dark:bg-gray-900 p-4 rounded-2xl">
                <div class="text-[10px] text-gray-400 uppercase font-bold mb-1 tracking-wider">WhatsApp</div>
                <div class="text-sm font-bold text-green-600">{{ application.settings.whatsapp || 'N/A' }}</div>
              </div>
              <div class="bg-gray-50 dark:bg-gray-900 p-4 rounded-2xl">
                <div class="text-[10px] text-gray-400 uppercase font-bold mb-1 tracking-wider">Style Produits</div>
                <div class="text-sm font-bold dark:text-white">{{ application.settings.productStyle || 'N/A' }}</div>
              </div>
            </div>

            <div class="bg-gray-50 dark:bg-gray-900 p-4 rounded-2xl flex items-center gap-4">
              <i class="fas fa-map-marker-alt text-red-500 text-lg"></i>
              <div>
                <div class="text-[10px] text-gray-400 uppercase font-bold mb-0.5 tracking-wider">Adresse complète</div>
                <div class="text-sm font-medium dark:text-white">{{ application.settings.address || 'N/A' }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Verification Document -->
        <div v-if="application.settings?.identityData" class="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 space-y-4">
          <h3 class="text-xs font-bold text-blue-600 uppercase tracking-widest flex items-center gap-2">
            <i class="fas fa-id-card"></i>
            Pièce d'Identité
          </h3>
          <div class="group relative bg-gray-50 dark:bg-gray-900 rounded-3xl p-6 overflow-hidden flex justify-center">
            <img 
              v-if="application.settings.identityData.startsWith('data:image')" 
              :src="application.settings.identityData" 
              alt="Identity Card" 
              class="max-w-full max-h-[500px] object-contain rounded-2xl shadow-lg shadow-black/5"
            />
            <div v-else class="flex flex-col items-center py-12">
              <i class="fas fa-file-pdf text-6xl text-red-500 mb-4"></i>
              <p class="font-bold text-gray-900 dark:text-white mb-2">Justificatif PDF</p>
              <a :href="application.settings.identityData" download class="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2">
                <i class="fas fa-download"></i>
                Télécharger le document
              </a>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column: Actions & Config -->
      <div class="space-y-8">
        <!-- Application Actions -->
        <div class="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 space-y-6">
          <h3 class="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Décision Admin</h3>
          
          <div class="grid gap-3">
            <template v-if="application.status === 'pending'">
              <button
                @click="approveApplication"
                class="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-2xl font-bold transition-all shadow-lg shadow-green-500/10 flex items-center justify-center gap-2"
              >
                <i class="fas fa-check"></i>
                Approuver l'accès
              </button>
              <button
                @click="rejectApplication"
                class="w-full bg-red-50 dark:bg-red-900/10 text-red-600 py-4 rounded-2xl font-bold transition-all hover:bg-red-100 dark:hover:bg-red-900/20 flex items-center justify-center gap-2"
              >
                <i class="fas fa-times"></i>
                Rejeter la demande
              </button>
            </template>
            
            <template v-else-if="application.status === 'active'">
              <button
                @click="suspendVendor"
                class="w-full bg-orange-600 hover:bg-orange-700 text-white py-4 rounded-2xl font-bold transition-all shadow-lg shadow-orange-500/10 flex items-center justify-center gap-2"
              >
                <i class="fas fa-pause"></i>
                Suspendre la boutique
              </button>
            </template>
            
            <template v-else-if="application.status === 'suspended'">
              <button
                @click="reactivateVendor"
                class="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-bold transition-all shadow-lg shadow-blue-500/10 flex items-center justify-center gap-2"
              >
                <i class="fas fa-play"></i>
                Réactiver le compte
              </button>
            </template>
          </div>
        </div>

        <!-- Financial Settings -->
        <div class="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 space-y-6">
          <h3 class="text-xs font-bold text-indigo-600 uppercase tracking-widest flex items-center gap-2">
            <i class="fas fa-percentage"></i>
            Paramètres Commerciaux
          </h3>
          
          <div class="space-y-4">
            <div>
              <label class="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider mb-2 block">Taux de Commission (%)</label>
              <div class="relative">
                <input 
                  v-model="commissionRate"
                  type="number"
                  min="0" max="100" step="0.5"
                  class="w-full bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-xl px-4 py-3 font-bold text-indigo-600 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
                <span class="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-indigo-300">%</span>
              </div>
            </div>
            
            <button 
              @click="updateCommission"
              :disabled="isUpdatingCommission || commissionRate === application.commission_rate"
              class="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-200 text-white rounded-xl font-bold text-sm transition-all shadow-md shadow-indigo-500/20"
            >
              <i v-if="isUpdatingCommission" class="fas fa-spinner fa-spin mr-1"></i>
              Enregistrer le taux
            </button>
            <p class="text-[10px] text-gray-400 dark:text-gray-500 italic leading-relaxed text-center">
              * Commission prélevée automatiquement sur chaque commande finalisée par ce vendeur.
            </p>
          </div>
        </div>

        <!-- System Stats -->
        <div class="bg-gray-900 dark:bg-black rounded-3xl p-8 space-y-6 text-white text-sm">
          <div class="flex items-center gap-3">
            <i class="far fa-calendar-alt text-blue-400"></i>
            <div>
              <div class="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Inscrit le</div>
              <div class="font-bold underline underline-offset-4 decoration-blue-500/30">{{ formatDate(application.created_at) }}</div>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <i class="far fa-clock text-orange-400"></i>
            <div>
              <div class="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Ancienneté</div>
              <div class="font-bold">{{ getTimeAgo(application.created_at) }}</div>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api, adminService } from '@/services/api'
import { useUIStore } from '@/stores/ui'
import { formatVendorId } from '@/utils/formatters'

const route = useRoute()
const router = useRouter()
const uiStore = useUIStore()

const application = ref<any>(null)
const isLoading = ref(true)
const error = ref<string | null>(null)
const commissionRate = ref(10)
const isUpdatingCommission = ref(false)

const fetchApplication = async () => {
  const id = route.params.id
  if (!id) return

  try {
    isLoading.value = true
    error.value = null
    const response = await adminService.getVendorApplication(id as string)
    application.value = response.application
    commissionRate.value = application.value.commission_rate || 10
  } catch (err: any) {
    console.error('Erreur chargement candidature:', err)
    error.value = "Impossible de charger les données de cette candidature."
  } finally {
    isLoading.value = false
  }
}

const getStatusClass = (status: string) => {
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

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getTimeAgo = (dateString: string) => {
  const diff = Date.now() - new Date(dateString).getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  if (days === 0) return "aujourd'hui"
  if (days === 1) return "hier"
  return `${days} jours`
}

const approveApplication = async () => {
  const id = application.value.id
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
    await fetchApplication()
  } catch (error) {
    console.error('Erreur lors de l\'approbation:', error)
    uiStore.addToast('Une erreur est survenue lors de l\'approbation', 'error')
  }
}

const rejectApplication = async () => {
  const id = application.value.id
  const reason = await uiStore.prompt({
    title: 'Raison du rejet',
    message: 'Indiquez pourquoi sa demande a été refusée (sera envoyé par email).',
    placeholder: 'Ex: Justificatifs illisibles, politique de vente non conforme...',
    confirmText: 'Confirmer le rejet'
  })

  if (reason === null) return 

  try {
    await api.put(`/admin/vendors/applications/${id}/reject`, { reason })
    uiStore.addToast('Candidature rejetée', 'info')
    await fetchApplication()
  } catch (error) {
    uiStore.addToast('Erreur lors du rejet', 'error')
  }
}

const suspendVendor = async () => {
  const id = application.value.id
  const reason = await uiStore.prompt({
    title: 'Suspension de boutique',
    message: 'Indiquez le motif de suspension pour ce partenaire.',
    placeholder: 'Ex: Non respect des conditions générales...',
    confirmText: 'Suspendre maintenant'
  })

  if (!reason) return

  try {
    await api.put(`/admin/vendors/applications/${id}/suspend`, { reason })
    uiStore.addToast('Partenaire suspendu', 'warning')
    await fetchApplication()
  } catch (error) {
    uiStore.addToast('Erreur lors de la suspension', 'error')
  }
}

const reactivateVendor = async () => {
  const id = application.value.id
  const confirmed = await uiStore.confirm({
    title: 'Réactivation de compte',
    message: 'Souhaitez-vous lever la suspension de ce vendeur ?',
    confirmText: 'Réactiver le compte'
  })

  if (!confirmed) return

  try {
    await api.put(`/admin/vendors/applications/${id}/reactivate`)
    uiStore.addToast('Boutique réactivée', 'success')
    await fetchApplication()
  } catch (error) {
    uiStore.addToast('Erreur lors de la réactivation', 'error')
  }
}

const updateCommission = async () => {
  try {
    isUpdatingCommission.value = true
    await api.put(`/admin/vendors/${application.value.id}/commission`, {
      commission_rate: commissionRate.value
    })
    application.value.commission_rate = commissionRate.value
    uiStore.addToast('Commission mise à jour avec succès', 'success')
  } catch (error) {
    uiStore.addToast('Erreur lors de la mise à jour de la commission', 'error')
  } finally {
    isUpdatingCommission.value = false
  }
}

const contactVendeur = (userId: any) => {
  if (!userId) return
  router.push({
    path: '/messages',
    query: { userId: userId.toString() }
  })
}

onMounted(() => {
  fetchApplication()
})
</script>

<style scoped>
/* Chrome, Safari, Edge, Opera */
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* Firefox */
input[type=number] {
  -moz-appearance: textfield;
}
</style>
