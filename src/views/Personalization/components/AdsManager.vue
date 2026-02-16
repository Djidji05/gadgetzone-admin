<template>
  <div>
    <h2 class="text-lg font-semibold text-gray-800 mb-6">Gestion des Annonces & Publicités</h2>

    <div v-if="loading" class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>

    <div v-else class="space-y-8">
      
      <!-- Top Commitment Bar -->
      <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div class="flex justify-between items-start mb-6">
            <div>
                <h3 class="text-base font-bold text-gray-900">Barre d'Annonce (Haut de page)</h3>
                <p class="text-xs text-gray-500">Fine bande affichée tout en haut du site.</p>
            </div>
            <div class="flex items-center gap-3">
                <button 
                  @click="clearTopBar" 
                  class="text-xs text-red-600 hover:text-red-700 font-medium px-2 py-1 border border-red-200 rounded hover:bg-red-50 transition-colors"
                >
                  <i class="fas fa-trash-alt mr-1"></i> Supprimer
                </button>
                <div class="flex items-center h-4 ml-2 border-l border-gray-200 pl-3">
                    <input 
                      v-model="config.content.topBar.isActive" 
                      type="checkbox" 
                      id="activeTopBar"
                      class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    >
                    <label for="activeTopBar" class="ml-2 text-sm text-gray-700">Activer</label>
                </div>
            </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Message</label>
                    <input v-model="config.content.topBar.text" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="Ex: Livraison gratuite dès 50€ !">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Lien (Optionnel)</label>
                    <input v-model="config.content.topBar.link" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="Ex: /promotions">
                </div>
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-xs text-gray-500 mb-1">Date de début (Optionnel)</label>
                    <input v-model="config.content.topBar.startDate" type="date" class="w-full text-sm px-3 py-1.5 border border-gray-300 rounded-lg">
                  </div>
                  <div>
                    <label class="block text-xs text-gray-500 mb-1">Date de fin (Optionnel)</label>
                    <input v-model="config.content.topBar.endDate" type="date" class="w-full text-sm px-3 py-1.5 border border-gray-300 rounded-lg">
                  </div>
                </div>
            </div>
            <div class="space-y-4">
                 <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Couleur de fond</label>
                    <div class="flex items-center gap-3">
                        <input v-model="config.content.topBar.backgroundColor" type="color" class="h-10 w-20 p-1 rounded border border-gray-300 cursor-pointer">
                        <span class="text-sm text-gray-500">{{ config.content.topBar.backgroundColor }}</span>
                    </div>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Couleur du texte</label>
                    <div class="flex items-center gap-3">
                        <input v-model="config.content.topBar.textColor" type="color" class="h-10 w-20 p-1 rounded border border-gray-300 cursor-pointer">
                        <span class="text-sm text-gray-500">{{ config.content.topBar.textColor }}</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Preview Top Bar -->
        <div class="mt-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
            <p class="text-xs text-gray-500 mb-2 uppercase font-bold">Aperçu</p>
            <div 
                class="w-full py-2 px-4 text-center text-sm font-medium rounded transition-colors bg-blue-600"
                :style="{ backgroundColor: config.content.topBar.backgroundColor, color: config.content.topBar.textColor }"
            >
                {{ config.content.topBar.text || 'Votre message ici' }}
            </div>
        </div>
      </div>

       <!-- Inter-section Banners -->
      <div v-for="(banner, index) in config.content.interBanners" :key="index" class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 relative">
         <!-- Delete Section Button (Top Right) -->
         <button 
           @click="removeInterBanner(index)" 
           class="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors p-1"
           title="Supprimer cette bannière"
         >
           <i class="fas fa-times text-lg"></i>
         </button>

         <div class="flex justify-between items-start mb-6 pr-8">
            <div>
                <h3 class="text-base font-bold text-gray-900">Bannière Inter-section #{{ index + 1 }}</h3>
                <p class="text-xs text-gray-500">Grande bannière affichée entre les sections de la page d'accueil.</p>
            </div>
            <div class="flex items-center gap-3">
                <div class="flex items-center h-4 ml-2 border-l border-gray-200 pl-3">
                    <input 
                      v-model="banner.isActive" 
                      type="checkbox" 
                      :id="'activeInterBanner' + index"
                      class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    >
                    <label :for="'activeInterBanner' + index" class="ml-2 text-sm text-gray-700">Activer</label>
                </div>
            </div>
        </div>

        <div class="space-y-6">
            <!-- Slider Settings -->
            <div class="bg-blue-50/50 p-4 rounded-xl border border-blue-100 flex items-center justify-between">
                <div class="flex items-center gap-3">
                    <i class="fas fa-clock text-blue-500"></i>
                    <div>
                        <p class="text-sm font-semibold text-blue-900">Délai d'affichage</p>
                        <p class="text-xs text-blue-700">Temps entre chaque passage de bannière (en secondes).</p>
                    </div>
                </div>
                <div class="flex items-center gap-2">
                    <input 
                      v-model.number="config.content.sliderInterval" 
                      type="number" 
                      min="1" 
                      max="60"
                      class="w-16 px-2 py-1 border border-blue-200 rounded-lg text-center font-bold text-blue-600 focus:ring-blue-500"
                    >
                    <span class="text-sm font-medium text-blue-700">sec.</span>
                </div>
            </div>

            <!-- Image Upload -->
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Image de la bannière</label>
                
                <div class="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:bg-gray-50 transition-colors cursor-pointer relative" @dragover.prevent @drop.prevent="handleDrop($event, index)">
                    <input type="file" @change="handleFileUpload($event, index)" accept="image/*" class="absolute inset-0 opacity-0 cursor-pointer" :disabled="isUploading !== null">
                    
                    <div v-if="isUploading === index" class="py-4">
                        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                        <p class="text-xs text-gray-500 mt-2">Téléchargement...</p>
                    </div>
                    
                    <div v-else-if="banner.image" class="relative group">
                        <img :src="banner.image" class="max-h-60 mx-auto rounded-lg shadow-sm">
                        <div class="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                            <span class="text-white text-sm font-medium bg-black/50 px-3 py-1 rounded-full pointer-events-none">Changer l'image</span>
                        </div>
                    </div>
                    
                    <div v-else class="py-4 text-gray-500">
                        <i class="fas fa-image text-4xl mb-3 text-gray-300"></i>
                        <p class="font-medium">Cliquez ou glissez une image ici</p>
                        <p class="text-xs mt-1">Format recommandé : 1200x300px</p>
                    </div>
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Titre de la section (Optionnel)</label>
                    <input v-model="banner.title" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="Ex: Nos Marques Partenaires">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Lien de destination</label>
                    <input v-model="banner.link" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="Ex: /brands/sony">
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div>
                    <label class="block text-xs text-gray-500 mb-1">Afficher à partir du (Optionnel)</label>
                    <input v-model="banner.startDate" type="date" class="w-full text-sm px-3 py-1.5 border border-gray-300 rounded-lg">
                </div>
                <div>
                    <label class="block text-xs text-gray-500 mb-1">Afficher jusqu'au (Optionnel)</label>
                    <input v-model="banner.endDate" type="date" class="w-full text-sm px-3 py-1.5 border border-gray-300 rounded-lg">
                </div>
            </div>
        </div>
      </div>

      <!-- Add Banner Button -->
      <div class="flex justify-start">
        <button 
          @click="addInterBanner" 
          class="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 text-gray-500 hover:text-blue-600 hover:border-blue-400 rounded-xl transition-all font-medium text-sm"
        >
          <i class="fas fa-plus"></i>
          Ajouter une autre bannière publicitaire
        </button>
      </div>

      <!-- Save Button -->
      <div class="flex justify-end pt-4 border-t border-gray-100">
        <button 
          @click="saveConfig" 
          class="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg shadow-sm transition-colors flex items-center gap-2"
          :disabled="saving"
        >
          <div v-if="saving" class="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
          {{ saving ? 'Enregistrement...' : 'Enregistrer la configuration' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import PersonalizationService from '@/services/PersonalizationService';
import { api } from '@/services/api';
import { useUIStore } from '@/stores/ui';

const uiStore = useUIStore();
const loading = ref(false);
const saving = ref(false);
const isUploading = ref<number | null>(null);

const config = ref({
  section: 'ads',
  isActive: true,
  content: {
    topBar: {
        isActive: true,
        text: '',
        link: '',
        backgroundColor: '#2563eb',
        textColor: '#ffffff',
        startDate: '',
        endDate: ''
    },
    sliderInterval: 6,
    interBanners: [
        {
            isActive: false,
            title: '',
            image: '',
            link: '',
            startDate: '',
            endDate: ''
        }
    ]
  }
});

const clearTopBar = () => {
    config.value.content.topBar.text = '';
    config.value.content.topBar.link = '';
    config.value.content.topBar.startDate = '';
    config.value.content.topBar.endDate = '';
    config.value.content.topBar.backgroundColor = '#2563eb';
    config.value.content.topBar.isActive = false;
};

const addInterBanner = () => {
    config.value.content.interBanners.push({
        isActive: false,
        title: '',
        image: '',
        link: '',
        startDate: '',
        endDate: ''
    });
};

const removeInterBanner = async (index: number) => {
    if (config.value.content.interBanners.length <= 1) {
        // Reset the only one instead of deleting if it's the last one
        config.value.content.interBanners[0] = {
            isActive: false,
            title: '',
            image: '',
            link: '',
            startDate: '',
            endDate: ''
        };
        return;
    }
    const confirmed = await uiStore.confirm({
        title: 'Confirmer la suppression',
        message: 'Êtes-vous sûr de vouloir supprimer cette bannière ?',
        type: 'danger',
        confirmText: 'Supprimer'
    });
    
    if (confirmed) {
        config.value.content.interBanners.splice(index, 1);
    }
};

const loadConfig = async () => {
  loading.value = true;
  try {
    const response = await PersonalizationService.getSectionConfig('ads');
    if (response.data) {
      // Merge with default structure to ensure all fields exist
      config.value = {
        ...response.data,
        content: {
            topBar: { ...config.value.content.topBar, ...response.data.content?.topBar },
            sliderInterval: response.data.content?.sliderInterval || 6,
            interBanners: response.data.content?.interBanners || [config.value.content.interBanners[0]]
        }
      };

      // Sanitize dates for inputs
      if (config.value.content.topBar.startDate) config.value.content.topBar.startDate = new Date(config.value.content.topBar.startDate).toISOString().split('T')[0];
      if (config.value.content.topBar.endDate) config.value.content.topBar.endDate = new Date(config.value.content.topBar.endDate).toISOString().split('T')[0];
      
      config.value.content.interBanners.forEach((b: any) => {
        if (b.startDate) b.startDate = new Date(b.startDate).toISOString().split('T')[0];
        if (b.endDate) b.endDate = new Date(b.endDate).toISOString().split('T')[0];
      });
      
      // Backward compatibility: if interBanner exists but not interBanners
      if (response.data.content?.interBanner && !response.data.content?.interBanners) {
          const legacy = response.data.content.interBanner;
          if (legacy.startDate) legacy.startDate = new Date(legacy.startDate).toISOString().split('T')[0];
          if (legacy.endDate) legacy.endDate = new Date(legacy.endDate).toISOString().split('T')[0];
          config.value.content.interBanners = [legacy];
      }
    }
  } catch (error) {
    console.error('Failed to load ads config', error);
  } finally {
    loading.value = false;
  }
};

const saveConfig = async () => {
  saving.value = true;
  try {
    await PersonalizationService.updateSectionConfig('ads', config.value);
    uiStore.addToast('Configuration enregistrée avec succès', 'success');
  } catch (error: any) {
    console.error('Failed to save ads config', error);
    uiStore.addToast('Erreur lors de l\'enregistrement : ' + (error.response?.data?.error || error.message), 'error');
  } finally {
    saving.value = false;
  }
};

const handleFileUpload = async (event: Event, index: number) => {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) await uploadImage(input.files[0], index);
};

const handleDrop = async (event: DragEvent, index: number) => {
    if (event.dataTransfer?.files && event.dataTransfer.files[0]) await uploadImage(event.dataTransfer.files[0], index);
};

const uploadImage = async (file: File, index: number) => {
    isUploading.value = index;
    const formData = new FormData();
    formData.append('images', file);
    try {
        const response = await api.post('/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        if (response.data.urls?.length) {
            const url = response.data.urls[0];
            const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3003';
            config.value.content.interBanners[index].image = url.startsWith('/') ? `${baseUrl}${url}` : url;
        }
    } catch (e) {
        console.error(e);
        uiStore.addToast('Erreur lors du téléchargement de l\'image', 'error');
    } finally {
        isUploading.value = null;
    }
};

onMounted(() => {
  loadConfig();
});
</script>
