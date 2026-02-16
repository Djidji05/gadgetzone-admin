<template>
  <div>
    <h2 class="text-lg font-semibold text-gray-800 mb-6">Annonces & Publicités</h2>

    <div v-if="loading" class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>

    <div v-else class="space-y-8">
      <!-- Type Selection -->
      <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 class="text-base font-medium text-gray-900 mb-4">Type d'annonce</h3>
        
        <div class="flex items-center gap-6">
          <label class="flex items-center cursor-pointer">
            <input 
              v-model="config.content.type" 
              type="radio" 
              value="text" 
              class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
            >
            <span class="ml-2 text-gray-700">Barre de texte (Annonce)</span>
          </label>
          <label class="flex items-center cursor-pointer">
            <input 
              v-model="config.content.type" 
              type="radio" 
              value="banner" 
              class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
            >
            <span class="ml-2 text-gray-700">Bannière Publicitaire</span>
          </label>
        </div>

        <div class="mt-6 flex items-center">
          <input 
            v-model="config.isActive" 
            type="checkbox" 
            id="isActiveAnnounce"
            class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          >
          <label for="isActiveAnnounce" class="ml-2 block text-sm text-gray-900">Activer l'annonce sur le site</label>
        </div>
      </div>

      <!-- Text Config -->
      <div v-if="config.content.type === 'text'" class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 class="text-base font-medium text-gray-900 mb-4">Configuration du message</h3>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Message</label>
            <input 
              v-model="config.content.text.message" 
              type="text" 
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ex: Livraison gratuite à partir de 5000 HTG !"
            >
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Couleur de fond</label>
              <div class="flex items-center gap-2">
                <input 
                  v-model="config.content.text.backgroundColor" 
                  type="color" 
                  class="h-10 w-14 p-0 border-0 rounded overflow-hidden cursor-pointer shadow-sm"
                >
                <input 
                  v-model="config.content.text.backgroundColor" 
                  type="text" 
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm"
                >
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Couleur du texte</label>
               <div class="flex items-center gap-2">
                <input 
                  v-model="config.content.text.color" 
                  type="color" 
                  class="h-10 w-14 p-0 border-0 rounded overflow-hidden cursor-pointer shadow-sm"
                >
                <input 
                  v-model="config.content.text.color" 
                  type="text" 
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm"
                >
              </div>
            </div>
          </div>
        </div>

        <!-- Preview -->
        <div class="mt-8">
          <p class="text-xs text-gray-500 mb-2 uppercase font-semibold">Aperçu :</p>
          <div 
            class="w-full py-3 px-4 text-center font-medium rounded-lg shadow-sm"
            :style="{ backgroundColor: config.content.text.backgroundColor, color: config.content.text.color }"
          >
            {{ config.content.text.message || 'Votre message ici' }}
          </div>
        </div>
      </div>

      <!-- Banner Config -->
      <div v-if="config.content.type === 'banner'" class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 class="text-base font-medium text-gray-900 mb-4">Configuration de la publicité</h3>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">URL de l'image</label>
            <input 
              v-model="config.content.banner.image" 
              type="url" 
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            >
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Lien de redirection</label>
            <input 
              v-model="config.content.banner.link" 
              type="text" 
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            >
          </div>
        </div>

        <!-- Preview -->
        <div v-if="config.content.banner.image" class="mt-8">
           <p class="text-xs text-gray-500 mb-2 uppercase font-semibold">Aperçu :</p>
           <img :src="config.content.banner.image" class="w-full max-h-60 object-cover rounded-lg shadow-md">
        </div>
      </div>

      <!-- Save Button -->
      <div class="flex justify-end">
        <button 
          @click="saveConfig" 
          class="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg shadow-sm transition-colors flex items-center gap-2"
          :disabled="saving"
        >
          <div v-if="saving" class="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
          {{ saving ? 'Enregistrement...' : 'Enregistrer' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import PersonalizationService from '@/services/PersonalizationService';
import { useUIStore } from '@/stores/ui';

const loading = ref(false);
const saving = ref(false);
const uiStore = useUIStore();

const config = ref({
  section: 'announcements',
  isActive: true,
  content: {
    type: 'text', // text, banner
    text: {
      message: '',
      backgroundColor: '#3b82f6',
      color: '#ffffff'
    },
    banner: {
      image: '',
      link: ''
    }
  }
});

const loadConfig = async () => {
  loading.value = true;
  try {
    const response = await PersonalizationService.getSectionConfig('announcements');
    if (response.data) {
      config.value = {
        ...response.data,
        content: {
          type: 'text',
          text: { message: '', backgroundColor: '#3b82f6', color: '#ffffff' },
          banner: { image: '', link: '' },
          ...response.data.content
        }
      };
      
      // Defaults deep merge safety
      if (!config.value.content.text) config.value.content.text = { message: '', backgroundColor: '#3b82f6', color: '#ffffff' };
      if (!config.value.content.banner) config.value.content.banner = { image: '', link: '' };
    }
  } catch (error) {
    console.error('Failed to load announcements config', error);
    uiStore.addToast('Erreur lors du chargement des annonces', 'error');
  } finally {
    loading.value = false;
  }
};

const saveConfig = async () => {
  saving.value = true;
  try {
    await PersonalizationService.updateSectionConfig('announcements', config.value);
    uiStore.addToast('Annonce enregistrée avec succès', 'success');
  } catch (error) {
    console.error('Error saving announcements', error);
    uiStore.addToast('Erreur lors de l’enregistrement', 'error');
  } finally {
    saving.value = false;
  }
};

onMounted(() => {
  loadConfig();
});
</script>
