<template>
  <div class="px-4 py-6 mt-16 sm:px-6 lg:mt-0">
    <PageBreadcrumb pageTitle="Paramètres de ma Boutique" />

    <div class="max-w-4xl mx-auto mt-6">
      <div v-if="loading" class="flex items-center justify-center py-20">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>

      <div v-else-if="error" class="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg flex items-center gap-3">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {{ error }}
      </div>

      <div v-else class="space-y-6">
        <!-- Bannière de la boutique -->
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div class="h-48 w-full bg-gray-100 dark:bg-gray-700 relative">
            <img v-if="store.bannerUrl" :src="store.bannerUrl" class="w-full h-full object-cover" alt="Bannière" />
            <div v-else class="w-full h-full flex items-center justify-center text-gray-400">
              <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div class="absolute bottom-4 right-4">
              <button @click="triggerBannerUpload" class="px-4 py-2 bg-white/90 hover:bg-white text-gray-700 rounded-lg text-sm font-medium shadow-sm backdrop-blur-sm transition-all flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Modifier la bannière
              </button>
            </div>
          </div>
          
          <div class="px-6 pb-6 relative">
             <!-- Logo -->
            <div class="relative -mt-12 mb-4">
               <div class="h-24 w-24 rounded-2xl border-4 border-white dark:border-gray-800 bg-white dark:bg-gray-700 shadow-md overflow-hidden relative group">
                  <img v-if="store.logoUrl" :src="store.logoUrl" class="w-full h-full object-cover" alt="Logo" />
                   <div v-else class="w-full h-full flex items-center justify-center text-gray-300">
                    <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <button @click="triggerLogoUpload" class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    </svg>
                  </button>
               </div>
            </div>

            <div>
              <h3 class="text-xl font-bold text-gray-900 dark:text-white">{{ store.name }}</h3>
              <div class="mt-1 flex items-center gap-2">
                <span :class="[
                  'px-2 py-0.5 rounded text-xs font-medium uppercase',
                  store.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30' : 'bg-yellow-100 text-yellow-700'
                ]">
                  {{ store.status === 'active' ? 'Boutique Active' : 'En attente' }}
                </span>
                <span class="text-xs text-gray-500">Membre depuis {{ formatDate(store.created_at) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Formulaire de modification -->
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <form @submit.prevent="saveSettings" class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="space-y-1">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Nom de la Boutique</label>
                <input 
                  type="text" 
                  v-model="formData.name" 
                  class="block w-full px-4 py-2.5 rounded-lg border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>

              <div class="space-y-1">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Type d'activité</label>
                <input 
                  type="text" 
                  :value="store.settings?.businessType || 'N/A'" 
                  disabled
                  class="block w-full px-4 py-2.5 rounded-lg border-gray-100 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400 cursor-not-allowed"
                />
              </div>
            </div>

            <div class="space-y-1">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
              <textarea 
                v-model="formData.description" 
                rows="4"
                class="block w-full px-4 py-2.5 rounded-lg border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-primary-500 focus:border-primary-500"
                placeholder="Décrivez votre boutique et ce que vous vendez..."
              ></textarea>
            </div>

            <div class="border-t border-gray-100 dark:border-gray-700 pt-6">
               <h4 class="text-base font-semibold text-gray-900 dark:text-white mb-4">Informations de contact</h4>
               <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div class="space-y-1">
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">WhatsApp</label>
                    <input 
                      type="text" 
                      v-model="formData.settings.whatsapp" 
                      class="block w-full px-4 py-2.5 rounded-lg border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div class="space-y-1">
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Adresse</label>
                    <input 
                      type="text" 
                      v-model="formData.settings.address" 
                      class="block w-full px-4 py-2.5 rounded-lg border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
               </div>
            </div>

            <div class="flex justify-end pt-4">
              <button 
                type="submit" 
                :disabled="saving"
                class="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium shadow-sm hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span v-if="saving" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                {{ saving ? 'Enregistrement...' : 'Enregistrer les modifications' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Hidden Inputs for Uploads -->
    <input type="file" ref="logoInput" @change="handleLogoChange" class="hidden" accept="image/*" />
    <input type="file" ref="bannerInput" @change="handleBannerChange" class="hidden" accept="image/*" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue'
import { vendorService } from '@/services/api'
import type { Store } from '@/services/api'

const loading = ref(true)
const saving = ref(false)
const error = ref<string | null>(null)
const store = ref<Store | null>(null)

const formData = reactive({
  name: '',
  description: '',
  settings: {
    whatsapp: '',
    address: ''
  }
})

const logoInput = ref<HTMLInputElement | null>(null)
const bannerInput = ref<HTMLInputElement | null>(null)

const loadStoreData = async () => {
  try {
    loading.value = true
    const data = await vendorService.getMe()
    store.value = data
    
    // Sync form
    formData.name = data.name
    formData.description = data.description || ''
    formData.settings.whatsapp = data.settings?.whatsapp || ''
    formData.settings.address = data.settings?.address || ''
    
  } catch (err) {
    console.error('Error loading store:', err)
    error.value = 'Impossible de charger les informations de la boutique.'
  } finally {
    loading.value = false
  }
}

const saveSettings = async () => {
  try {
    saving.value = true
    const updateData = {
      name: formData.name,
      description: formData.description,
      settings: {
        ...store.value?.settings,
        whatsapp: formData.settings.whatsapp,
        address: formData.settings.address
      }
    }
    
    const updated = await vendorService.updateMe(updateData)
    store.value = updated
    alert('Boutique mise à jour avec succès !')
  } catch (err) {
    console.error('Error saving settings:', err)
    alert('Erreur lors de l\'enregistrement.')
  } finally {
    saving.value = false
  }
}

const triggerLogoUpload = () => logoInput.value?.click()
const triggerBannerUpload = () => bannerInput.value?.click()

const handleLogoChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (target.files?.length) {
    // Simuler un upload pour l'instant ou gestion réelle via service upload
    alert('Upload de logo sera implémenté avec le service de fichiers.')
  }
}

const handleBannerChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (target.files?.length) {
    alert('Upload de bannière sera implémenté avec le service de fichiers.')
  }
}

const formatDate = (dateString: string) => {
  return new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' }).format(new Date(dateString))
}

onMounted(() => {
  loadStoreData()
})
</script>
