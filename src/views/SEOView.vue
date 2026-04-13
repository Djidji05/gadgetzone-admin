<template>
  <div class="p-4 mx-auto max-w-7xl">
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">SEO & Santé Système</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400">Optimisez votre référencement et surveillez la vitalité de votre plateforme.</p>
      </div>
      <div class="flex gap-2">
        <button
          v-if="activeTab === 'general' || activeTab === 'social' || activeTab === 'advanced'"
          @click="saveSEO"
          :disabled="isSaving"
          class="flex items-center gap-2 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          <svg v-if="isSaving" class="w-5 h-5 animate-spin" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {{ isSaving ? 'Enregistrement...' : 'Enregistrer les paramètres' }}
        </button>
        <button
          v-if="activeTab === 'health'"
          @click="fetchHealth"
          :disabled="isLoadingHealth"
          class="flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-200 dark:bg-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
        >
          <RefreshCwIcon :class="{ 'animate-spin': isLoadingHealth }" class="w-4 h-4" />
          Actualiser
        </button>
      </div>
    </div>

    <!-- Interface par Onglets -->
    <div class="mb-6 border-b border-gray-200 dark:border-gray-800">
      <ul class="flex flex-wrap -mb-px text-sm font-medium text-center">
        <li v-for="tab in tabs" :key="tab.id" class="mr-2">
          <button
            @click="activeTab = tab.id"
            :class="[
              'inline-block p-4 border-b-2 rounded-t-lg transition-colors flex items-center gap-2',
              activeTab === tab.id
                ? 'text-blue-600 border-blue-600 dark:text-blue-500 dark:border-blue-500'
                : 'border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300'
            ]"
          >
            <component :is="tab.icon" class="w-4 h-4" />
            {{ tab.label }}
            <span v-if="tab.id === 'health' && healthData.alerts?.length" class="flex h-2 w-2 rounded-full bg-red-500"></span>
          </button>
        </li>
      </ul>
    </div>

    <!-- Contenu des Onglets -->
    <div v-if="isLoading" class="flex items-center justify-center h-64">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>

    <div v-else>
      <!-- SEO General -->
      <div v-show="activeTab === 'general'" class="space-y-6 animate-fadeIn">
        <div class="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800">
          <h3 class="text-lg font-semibold mb-4 dark:text-white">Balises Meta Globales</h3>
          <div class="grid gap-6">
            <div class="space-y-2">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Titre du site (Meta Title)</label>
              <input
                v-model="seoData.metaTitle"
                type="text"
                class="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
                placeholder="Ex: HTFasil - La meilleure boutique de gadgets"
              />
              <p class="text-xs text-gray-500">Recommandé : 50-60 caractères. Actuel : {{ (seoData.metaTitle || '').length }}</p>
            </div>

            <div class="space-y-2">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Description du site (Meta Description)</label>
              <textarea
                v-model="seoData.metaDescription"
                rows="3"
                class="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
                placeholder="Décrivez votre boutique en quelques phrases..."
              ></textarea>
              <p class="text-xs text-gray-500">Recommandé : 150-160 caractères. Actuel : {{ (seoData.metaDescription || '').length }}</p>
            </div>

            <div class="space-y-2">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Mots-clés (Keywords)</label>
              <input
                v-model="seoData.keywords"
                type="text"
                class="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
                placeholder="gadget, tech, boutique, smartphone (séparés par des virgules)"
              />
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 mt-6">
          <h3 class="text-lg font-semibold mb-4 dark:text-white">Aperçu Google</h3>
          <div class="p-4 bg-gray-50 dark:bg-black rounded-lg border border-gray-200 dark:border-gray-800 max-w-xl">
            <div class="text-sm text-gray-600 dark:text-gray-400 mb-1">https://htfasil.com › ...</div>
            <div class="text-xl text-blue-700 dark:text-blue-400 hover:underline cursor-pointer mb-1">
              {{ seoData.metaTitle || 'Titre de votre site | Boutique HTFasil' }}
            </div>
            <div class="text-sm text-gray-700 dark:text-gray-300 leading-snug">
              {{ seoData.metaDescription || 'Veuillez saisir une description méta pour voir comment votre site apparaîtra dans les résultats de recherche Google.' }}
            </div>
          </div>
        </div>
      </div>

      <!-- Social Media -->
      <div v-show="activeTab === 'social'" class="space-y-6 animate-fadeIn">
        <div class="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800">
          <h3 class="text-lg font-semibold mb-4 dark:text-white">Réseaux Sociaux (Open Graph)</h3>
          <div class="grid gap-6">
            <div class="space-y-2">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Titre de partage Social</label>
              <input
                v-model="seoData.ogTitle"
                type="text"
                class="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
              />
            </div>
            <div class="space-y-2">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Image de partage (URL)</label>
              <input
                v-model="seoData.ogImage"
                type="text"
                class="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
                placeholder="https://..."
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Advanced Scripts -->
      <div v-show="activeTab === 'advanced'" class="space-y-6 animate-fadeIn">
        <div class="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800">
          <h3 class="text-lg font-semibold mb-4 dark:text-white">Scripts personnalisés</h3>
          <div class="space-y-4">
            <div class="space-y-2">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Google Search Console (ID)</label>
              <input v-model="seoData.googleConsoleId" type="text" class="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg dark:text-white" placeholder="G-XXXXXXXXXX" />
            </div>
            <div class="space-y-2">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Google Analytics (ID)</label>
              <input v-model="seoData.googleAnalyticsId" type="text" class="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg dark:text-white" placeholder="UA-XXXXXXXXX-X" />
            </div>
          </div>
        </div>
      </div>

      <!-- Santé Système -->
      <div v-show="activeTab === 'health'" class="space-y-6 animate-fadeIn">
        <!-- Alertes Dynamiques -->
        <div v-if="healthData.alerts?.length" class="space-y-3">
          <div v-for="(alert, index) in healthData.alerts" :key="index" 
            :class="[
              'p-4 rounded-lg flex items-start gap-3 border',
              alert.type === 'warning' ? 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-900/50 dark:text-yellow-400' :
              alert.type === 'maintenance' ? 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-900/50 dark:text-blue-400' :
              'bg-gray-50 border-gray-200 text-gray-800 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300'
            ]"
          >
            <AlertCircleIcon class="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <p class="text-sm font-medium">{{ alert.message }}</p>
              <button 
                v-if="alert.type === 'maintenance'" 
                @click="handleMaintenance"
                class="mt-2 text-xs font-bold underline uppercase hover:text-blue-600 transition-colors"
              >
                Lancer la maintenance maintenant
              </button>
            </div>
          </div>
        </div>

        <!-- Diagnostics & Prédictions de l'IA -->
        <div v-if="healthData.predictions?.length" class="bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-200 dark:border-indigo-800 rounded-xl p-6">
          <div class="flex items-center gap-3 mb-4">
            <span class="text-2xl">🧠</span>
            <h3 class="font-bold text-indigo-900 dark:text-indigo-300">Diagnostics & Prédictions de l'IA</h3>
          </div>
          <ul class="space-y-3">
            <li v-for="(pred, index) in healthData.predictions" :key="'pred-'+index" class="flex items-start gap-2 text-indigo-800 dark:text-indigo-400">
              <span class="mt-1 flex-shrink-0 text-indigo-500">•</span>
              <span class="font-medium text-sm">{{ pred }}</span>
            </li>
          </ul>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <!-- CPU & OS -->
          <div class="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800">
            <div class="flex items-center gap-3 mb-4">
              <div class="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                <CpuIcon class="w-5 h-5" />
              </div>
              <h3 class="font-semibold dark:text-white">Système & CPU</h3>
            </div>
            <div class="space-y-4">
              <div class="flex justify-between text-sm">
                <span class="text-gray-500">Plateforme</span>
                <span class="font-medium dark:text-gray-300">{{ healthData.health?.os.platform }} ({{ healthData.health?.os.release }})</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-gray-500">Processeurs</span>
                <span class="font-medium dark:text-gray-300">{{ healthData.health?.os.cpus }} Cores</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-gray-500">Uptime Serveur</span>
                <span class="font-medium dark:text-gray-300">{{ formatUptime(healthData.health?.uptime) }}</span>
              </div>
            </div>
            <div v-if="healthData.dictionary?.cpu" class="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
              <p class="text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg leading-relaxed">
                <span class="font-bold text-sm block mb-1">💡 Rôle :</span>
                {{ healthData.dictionary.cpu }}
              </p>
            </div>
          </div>

          <!-- Mémoire RAM -->
          <div class="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800">
            <div class="flex items-center gap-3 mb-4">
              <div class="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg text-green-600 dark:text-green-400">
                <DatabaseIcon class="w-5 h-5" />
              </div>
              <h3 class="font-semibold dark:text-white">Mémoire RAM</h3>
            </div>
            <div class="space-y-4">
              <div>
                <div class="flex justify-between text-sm mb-1">
                  <span class="text-gray-500">Utilisation Système</span>
                  <span class="font-medium dark:text-gray-300">{{ formatBytes(healthData.health?.os.totalMem - healthData.health?.os.freeMem) }} / {{ formatBytes(healthData.health?.os.totalMem) }}</span>
                </div>
                <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div class="bg-green-500 h-2 rounded-full" :style="{ width: ((healthData.health?.os.totalMem - healthData.health?.os.freeMem) / healthData.health?.os.totalMem * 100) + '%' }"></div>
                </div>
              </div>
              <div>
                <div class="flex justify-between text-sm mb-1">
                  <span class="text-gray-500">Processus Node (RSS)</span>
                  <span class="font-medium dark:text-gray-300">{{ formatBytes(healthData.health?.memory.rss) }}</span>
                </div>
              </div>
            </div>
            <div v-if="healthData.dictionary?.ram" class="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
              <p class="text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 p-3 rounded-lg leading-relaxed">
                <span class="font-bold text-sm block mb-1">💡 Rôle :</span>
                {{ healthData.dictionary.ram }}
              </p>
            </div>
          </div>

          <!-- Base de Données -->
          <div class="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800">
            <div class="flex items-center gap-3 mb-4">
              <div class="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-600 dark:text-purple-400">
                <ServerIcon class="w-5 h-5" />
              </div>
              <h3 class="font-semibold dark:text-white">Base de Données</h3>
            </div>
            <div class="space-y-4">
              <div class="flex justify-between text-sm">
                <span class="text-gray-500">Statut</span>
                <span class="flex items-center gap-2 font-medium text-green-600 dark:text-green-400">
                  <span class="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                  {{ healthData.health?.db.status }}
                </span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-gray-500">Dialecte</span>
                <span class="font-medium dark:text-gray-300">{{ healthData.health?.db.dialect }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-gray-500">Version Node</span>
                <span class="font-medium dark:text-gray-300">{{ healthData.health?.nodeVersion }}</span>
              </div>
            </div>
            <div v-if="healthData.dictionary?.db" class="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
              <p class="text-xs text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg leading-relaxed">
                <span class="font-bold text-sm block mb-1">💡 Rôle :</span>
                {{ healthData.dictionary.db }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { seoService, healthService } from '@/services/api'
import { 
  SettingsIcon, 
  ActivityIcon, 
  Share2Icon, 
  CodeIcon, 
  RefreshCwIcon, 
  CpuIcon, 
  DatabaseIcon, 
  ServerIcon,
  AlertCircleIcon,
  MonitorIcon
} from 'lucide-vue-next'

const isSaving = ref(false)
const isLoading = ref(true)
const isLoadingHealth = ref(false)
const activeTab = ref('general')

const tabs = [
  { id: 'general', label: 'Configuration SEO', icon: SettingsIcon },
  { id: 'social', label: 'Réseaux Sociaux', icon: Share2Icon },
  { id: 'advanced', label: 'Tracking & IDs', icon: CodeIcon },
  { id: 'health', label: 'Santé & Maintenance', icon: ActivityIcon }
]

const seoData = reactive({
  metaTitle: '',
  metaDescription: '',
  keywords: '',
  ogTitle: '',
  ogImage: '',
  googleConsoleId: '',
  googleAnalyticsId: ''
})

const healthData = ref<any>({
  health: null,
  alerts: []
})

const fetchSEO = async () => {
  try {
    const data = await seoService.getSettings()
    Object.assign(seoData, data)
  } catch (error) {
    console.error('Failed to fetch SEO settings:', error)
  }
}

const fetchHealth = async () => {
  isLoadingHealth.value = true
  try {
    const data = await healthService.getStats()
    healthData.value = data
  } catch (error) {
    console.error('Failed to fetch health stats:', error)
  } finally {
    isLoadingHealth.value = false
  }
}

const saveSEO = async () => {
  isSaving.value = true
  try {
    await seoService.updateSettings(seoData)
    alert('Paramètres SEO sauvegardés avec succès !')
  } catch (error) {
    alert('Erreur lors de la sauvegarde.')
  } finally {
    isSaving.value = false
  }
}

const handleMaintenance = async () => {
  if (!confirm('Voulez-vous vraiment lancer les tâches de maintenance ?')) return
  
  isLoadingHealth.value = true
  try {
    const response = await healthService.runMaintenance()
    alert(response.message || 'Maintenance effectuée')
    await fetchHealth() // Rafraîchir pour mettre à jour la date de dernière maintenance
  } catch (error) {
    console.error('Maintenance failed:', error)
    alert('Échec de la maintenance.')
  } finally {
    isLoadingHealth.value = false
  }
}

// Helpers
const formatRemainingTime = (seconds: number) => {
  if (!seconds) return 'Jamais'
  const days = Math.floor(seconds / (24 * 3600))
  return `Il y a ${days} j`
}

const formatUptime = (seconds: number) => {
  if (!seconds) return 'Calcul...'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  return `${h}h ${m}m`
}

const formatBytes = (bytes: number) => {
  if (!bytes) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

onMounted(async () => {
  await Promise.all([fetchSEO(), fetchHealth()])
  isLoading.value = false
})
</script>

<style scoped>
.animate-fadeIn {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
