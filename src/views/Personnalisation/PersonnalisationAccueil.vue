<template>
  <div class="p-6">
    <!-- En-tête de la page -->
    <div class="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          <i class="las la-sliders-h mr-2"></i>Personnalisation
        </h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Gérez les bannières et promotions de votre site
        </p>
      </div>
    </div>

    <!-- Section Bannières -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Gestion des bannières</h3>
        <button @click="showBannerModal = true" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
          <i class="las la-plus-circle mr-2"></i> Ajouter une bannière
        </button>
      </div>

      <div v-if="loading" class="text-center py-8">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p class="mt-2 text-gray-500 dark:text-gray-400">Chargement...</p>
      </div>

      <div v-else-if="error" class="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
        <p class="text-red-600 dark:text-red-400">{{ error }}</p>
      </div>

      <div v-else class="space-y-4">
        <div v-if="banners.length === 0" class="text-center py-8 text-gray-500 dark:text-gray-400">
          <i class="las la-image text-4xl mb-2"></i>
          <p>Aucune bannière trouvée</p>
          <p class="text-sm">Cliquez sur "Ajouter une bannière" pour commencer</p>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div v-for="banner in banners" :key="banner.id" class="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <div class="aspect-w-16 aspect-h-9 bg-gray-100 dark:bg-gray-700">
              <img v-if="banner.image" :src="banner.image" :alt="banner.title" class="w-full h-48 object-cover" />
              <div v-else class="w-full h-48 flex items-center justify-center text-gray-400">
                <i class="las la-image text-3xl"></i>
              </div>
            </div>
            <div class="p-4">
              <h4 class="font-medium text-gray-900 dark:text-white">{{ banner.title || 'Bannière sans titre' }}</h4>
              <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">{{ banner.subtitle || 'Pas de sous-titre' }}</p>
              <div class="mt-3 flex items-center justify-between">
                <span class="text-xs px-2 py-1 rounded-full" :class="banner.isActive ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'">
                  {{ banner.isActive ? 'Active' : 'Inactive' }}
                </span>
                <div class="flex space-x-2">
                  <button @click="editBanner(banner)" class="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                    <i class="las la-edit"></i>
                  </button>
                  <button @click="deleteBanner(banner.id)" class="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300">
                    <i class="las la-trash"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Section Promotions -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Gestion des promotions</h3>
        <div class="flex space-x-2">
          <button @click="showArchivedPromotions = !showArchivedPromotions" class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
            <i class="las la-archive mr-2"></i> {{ showArchivedPromotions ? 'Masquer' : 'Voir' }} archivées
          </button>
          <button @click="showPromoModal = true" class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500">
            <i class="las la-plus-circle mr-2"></i> Ajouter une promotion
          </button>
        </div>
      </div>

      <div v-if="loadingPromotions" class="text-center py-8">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
        <p class="mt-2 text-gray-500 dark:text-gray-400">Chargement...</p>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div v-for="promo in currentPromotions" :key="promo.id" class="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden relative">
          <div v-if="promo.isActive" class="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold px-3 py-1 transform translate-x-1 -translate-y-1">PROMO</div>
          <div class="p-4">
            <h4 class="font-medium text-gray-900 dark:text-white">{{ promo.title }}</h4>
            <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">{{ promo.description }}</p>
            <div class="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-2">
              <i class="las la-tag mr-1"></i>
              <span class="font-bold text-green-600">{{ promo.discount }}%</span>
            </div>
            <div class="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <i class="las la-calendar mr-1"></i>
              <span>{{ formatDate(promo.startDate) }} - {{ formatDate(promo.endDate) }}</span>
            </div>
            <div class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div class="flex justify-between">
                <span class="text-xs px-2 py-1 rounded-full" :class="promo.isActive ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'">
                  {{ promo.isActive ? 'Active' : 'Inactive' }}
                </span>
                <div class="flex space-x-2">
                  <button @click="editPromotion(promo)" class="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                    <i class="las la-edit"></i>
                  </button>
                  <button @click="togglePromoStatus(promo)" class="text-yellow-600 hover:text-yellow-800 dark:text-yellow-400 dark:hover:text-yellow-300">
                    <i :class="promo.isActive ? 'las la-pause' : 'las la-play'"></i>
                  </button>
                  <button @click="deletePromotion(promo.id)" class="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300">
                    <i class="las la-trash"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Promotions archivées -->
      <div v-if="showArchivedPromotions && archivedPromotions.length > 0" class="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
        <h4 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Promotions archivées</h4>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div v-for="promo in archivedPromotions" :key="promo.id" class="border border-gray-200 dark:border-gray-700 rounded-lg p-4 opacity-60">
            <h4 class="font-medium text-gray-900 dark:text-white">{{ promo.title }}</h4>
            <p class="text-sm text-gray-600 dark:text-gray-400">{{ promo.description }}</p>
            <div class="flex justify-between mt-3">
              <span class="text-xs px-2 py-1 bg-gray-100 text-gray-800 rounded-full">Archivée</span>
              <button @click="restorePromotion(promo)" class="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300">
                <i class="las la-undo"></i> Restaurer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Bannière -->
    <div v-if="showBannerModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[95vh] overflow-y-auto">
        <div class="p-6">
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-xl font-semibold text-gray-900 dark:text-white">
              {{ editingBanner ? 'Modifier la bannière' : 'Nouvelle bannière' }}
            </h3>
            <button @click="closeBannerModal" class="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
              <i class="las la-times text-2xl"></i>
            </button>
          </div>

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Titre</label>
              <input
                v-model="bannerForm.title"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Titre de la bannière"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sous-titre</label>
              <textarea
                v-model="bannerForm.subtitle"
                rows="3"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Sous-titre de la bannière"
              ></textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Image</label>
              <input
                type="file"
                @change="handleBannerImage"
                accept="image/*"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
              <p class="mt-1 text-xs text-gray-500">Taille recommandée : 1920x600px</p>
            </div>

            <div class="flex items-center">
              <input
                v-model="bannerForm.isActive"
                type="checkbox"
                id="bannerActive"
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label for="bannerActive" class="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                Bannière active
              </label>
            </div>
          </div>

          <div class="flex justify-end space-x-3 mt-6">
            <button @click="closeBannerModal" class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
              Annuler
            </button>
            <button @click="saveBanner" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
              {{ editingBanner ? 'Mettre à jour' : 'Ajouter' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Promotion -->
    <div v-if="showPromoModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[95vh] overflow-y-auto">
        <div class="p-6">
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-xl font-semibold text-gray-900 dark:text-white">
              {{ editingPromotion ? 'Modifier la promotion' : 'Nouvelle promotion' }}
            </h3>
            <button @click="closePromoModal" class="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
              <i class="las la-times text-2xl"></i>
            </button>
          </div>

          <div class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Titre *</label>
                <input
                  v-model="promoForm.title"
                  type="text"
                  required
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Titre de la promotion"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Code promotionnel *</label>
                <input
                  v-model="promoForm.code"
                  type="text"
                  required
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                  placeholder="CODE123"
                />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description *</label>
              <textarea
                v-model="promoForm.description"
                required
                rows="3"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                placeholder="Description de la promotion"
              ></textarea>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Réduction (%) *</label>
                <input
                  v-model.number="promoForm.discount"
                  type="number"
                  min="1"
                  max="100"
                  required
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                  placeholder="15"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date de début *</label>
                <input
                  v-model="promoForm.startDate"
                  type="date"
                  required
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date de fin *</label>
                <input
                  v-model="promoForm.endDate"
                  type="date"
                  required
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            <div class="flex items-center">
              <input
                v-model="promoForm.isActive"
                type="checkbox"
                id="promoActive"
                class="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
              <label for="promoActive" class="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                Promotion active
              </label>
            </div>
          </div>

          <div class="flex justify-end space-x-3 mt-6">
            <button @click="closePromoModal" class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
              Annuler
            </button>
            <button @click="savePromotion" :disabled="!promoForm.title || !promoForm.description || !promoForm.discount || !promoForm.startDate || !promoForm.endDate" class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-400 disabled:cursor-not-allowed">
              {{ editingPromotion ? 'Mettre à jour' : 'Créer' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

// Types
interface Banner {
  id: number
  title: string
  subtitle: string
  image: string | null
  isActive: boolean
}

interface Promotion {
  id: number
  title: string
  description: string
  code: string
  discount: number
  startDate: string
  endDate: string
  isActive: boolean
  archived: boolean
}

// État de chargement
const loading = ref(true)
const loadingPromotions = ref(false)
const error = ref('')

// Données des bannières
const banners = ref<Banner[]>([])
const showBannerModal = ref(false)
const editingBanner = ref<Banner | null>(null)
const bannerForm = ref({
  id: 0,
  title: '',
  subtitle: '',
  image: null as File | null,
  isActive: true
})

// Données des promotions
const promotions = ref<Promotion[]>([])
const showPromoModal = ref(false)
const editingPromotion = ref<Promotion | null>(null)
const promoForm = ref({
  id: 0,
  title: '',
  code: '',
  description: '',
  discount: 0,
  startDate: '',
  endDate: '',
  isActive: true,
  archived: false
})
const showArchivedPromotions = ref(false)

// Computed properties
const currentPromotions = computed(() => {
  return promotions.value.filter(p => !p.archived)
})

const archivedPromotions = computed(() => {
  return promotions.value.filter(p => p.archived)
})

// Méthodes
const loadBanners = async () => {
  try {
    loading.value = true
    // Données mock pour le développement
    banners.value = [
      {
        id: 1,
        title: 'Bienvenue sur notre site',
        subtitle: 'Découvrez nos dernières collections',
        image: 'https://via.placeholder.com/800x400?text=Bannière+1',
        isActive: true
      },
      {
        id: 2,
        title: 'Promotion spéciale',
        subtitle: '-20% sur tous les produits',
        image: 'https://via.placeholder.com/800x400?text=Bannière+2',
        isActive: false
      }
    ]
  } catch (err) {
    console.error('Error loading banners:', err)
    error.value = 'Erreur lors du chargement des bannières'
  } finally {
    loading.value = false
  }
}

const loadPromotions = async () => {
  try {
    loadingPromotions.value = true
    // Données mock pour le développement
    promotions.value = [
      {
        id: 1,
        title: 'Été 2024',
        description: 'Profitez de nos offres spéciales pour l\'été',
        code: 'ETE2024',
        discount: 15,
        startDate: '2024-06-01',
        endDate: '2024-08-31',
        isActive: true,
        archived: false
      },
      {
        id: 2,
        title: 'Black Friday',
        description: 'Les meilleures offres de l\'année',
        code: 'BLACK2024',
        discount: 30,
        startDate: '2024-11-01',
        endDate: '2024-11-30',
        isActive: false,
        archived: false
      }
    ]
  } catch (err) {
    console.error('Error loading promotions:', err)
  } finally {
    loadingPromotions.value = false
  }
}

const editBanner = (banner: Banner) => {
  editingBanner.value = banner
  bannerForm.value = {
    id: banner.id,
    title: banner.title,
    subtitle: banner.subtitle,
    image: null, // Reset image to null for editing
    isActive: banner.isActive
  }
  showBannerModal.value = true
}

const editPromotion = (promotion: Promotion) => {
  editingPromotion.value = promotion
  promoForm.value = { ...promotion }
  showPromoModal.value = true
}

const deleteBanner = async (id: number) => {
  if (confirm('Êtes-vous sûr de vouloir supprimer cette bannière ?')) {
    try {
      // Mock: supprimer la bannière localement
      banners.value = banners.value.filter(b => b.id !== id)
    } catch (err) {
      console.error('Error deleting banner:', err)
    }
  }
}

const deletePromotion = async (id: number) => {
  if (confirm('Êtes-vous sûr de vouloir supprimer cette promotion ?')) {
    try {
      // Mock: supprimer la promotion localement
      promotions.value = promotions.value.filter(p => p.id !== id)
    } catch (err) {
      console.error('Error deleting promotion:', err)
    }
  }
}

const togglePromoStatus = async (promotion: Promotion) => {
  try {
    // Mock: mettre à jour le statut localement
    promotion.isActive = !promotion.isActive
  } catch (err) {
    console.error('Error toggling promotion status:', err)
  }
}

const restorePromotion = async (promotion: Promotion) => {
  try {
    // Mock: restaurer la promotion localement
    promotion.archived = false
    await loadPromotions()
  } catch (err) {
    console.error('Error restoring promotion:', err)
  }
}

const closeBannerModal = () => {
  showBannerModal.value = false
  editingBanner.value = null
  bannerForm.value = {
    id: 0,
    title: '',
    subtitle: '',
    image: null,
    isActive: true
  }
}

const closePromoModal = () => {
  showPromoModal.value = false
  editingPromotion.value = null
  promoForm.value = {
    id: 0,
    title: '',
    code: '',
    description: '',
    discount: 0,
    startDate: '',
    endDate: '',
    isActive: true,
    archived: false
  }
}

const handleBannerImage = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    bannerForm.value.image = file
  }
}

const saveBanner = async () => {
  try {
    if (editingBanner.value) {
      // Mock: mettre à jour la bannière localement
      const index = banners.value.findIndex(b => b.id === editingBanner.value!.id)
      if (index !== -1) {
        banners.value[index] = { 
          id: bannerForm.value.id,
          title: bannerForm.value.title,
          subtitle: bannerForm.value.subtitle,
          image: bannerForm.value.image ? 'https://via.placeholder.com/800x400?text=Updated+Bannière' : null,
          isActive: bannerForm.value.isActive
        }
      }
    } else {
      // Mock: ajouter une nouvelle bannière
      const newBanner: Banner = {
        id: Date.now(),
        title: bannerForm.value.title,
        subtitle: bannerForm.value.subtitle,
        image: bannerForm.value.image ? 'https://via.placeholder.com/800x400?text=Nouvelle+Bannière' : null,
        isActive: bannerForm.value.isActive
      }
      banners.value.push(newBanner)
    }
    await loadBanners()
    closeBannerModal()
  } catch (err) {
    console.error('Error saving banner:', err)
  }
}

const savePromotion = async () => {
  try {
    if (editingPromotion.value) {
      // Mock: mettre à jour la promotion localement
      const index = promotions.value.findIndex(p => p.id === editingPromotion.value!.id)
      if (index !== -1) {
        promotions.value[index] = { 
          id: promoForm.value.id,
          title: promoForm.value.title,
          code: promoForm.value.code,
          description: promoForm.value.description,
          discount: promoForm.value.discount,
          startDate: promoForm.value.startDate,
          endDate: promoForm.value.endDate,
          isActive: promoForm.value.isActive,
          archived: promoForm.value.archived
        }
      }
    } else {
      // Mock: ajouter une nouvelle promotion
      const newPromotion: Promotion = {
        id: Date.now(),
        title: promoForm.value.title,
        code: promoForm.value.code,
        description: promoForm.value.description,
        discount: promoForm.value.discount,
        startDate: promoForm.value.startDate,
        endDate: promoForm.value.endDate,
        isActive: promoForm.value.isActive,
        archived: false
      }
      promotions.value.push(newPromotion)
    }
    await loadPromotions()
    closePromoModal()
  } catch (err) {
    console.error('Error saving promotion:', err)
  }
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('fr-FR')
}

// Lifecycle
onMounted(() => {
  loadBanners()
  loadPromotions()
})
</script>
