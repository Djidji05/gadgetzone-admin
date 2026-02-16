<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-lg font-semibold text-gray-800">Gestion des Bannières</h2>
      <button 
        @click="openModal()" 
        class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
      >
        <i class="fas fa-plus"></i> Nouvelle Bannière
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>

    <!-- Empty State -->
    <div v-else-if="banners.length === 0" class="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
      <i class="fas fa-images text-gray-400 text-4xl mb-3"></i>
      <p class="text-gray-500">Aucune bannière configurée.</p>
      <button @click="openModal()" class="mt-4 text-blue-600 font-medium hover:underline">Créer votre première bannière</button>
    </div>

    <!-- Banners List -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div 
        v-for="banner in banners" 
        :key="banner.id" 
        class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-md transition-shadow"
      >
        <!-- Image Preview -->
        <div class="relative h-40 bg-gray-100">
          <img :src="banner.image" :alt="banner.title" class="w-full h-full object-cover">
          
          <!-- Status Badge (Top Left) -->
          <div class="absolute top-2 left-2 flex gap-2">
            <span 
              class="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider shadow-sm"
              :class="banner.isActive ? 'bg-green-500 text-white' : 'bg-gray-400 text-white'"
            >
              {{ banner.isActive ? 'Actif' : 'Inactif' }}
            </span>
          </div>

          <!-- Action Overlay (Top Right) -->
          <div class="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 z-10 bg-white/90 backdrop-blur-sm rounded-lg shadow-md p-1 border border-white/50">
             <button 
                @click="openModal(banner)" 
                class="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                title="Modifier"
             >
                <i class="fas fa-edit text-sm"></i>
             </button>
             <button 
                @click="deleteBanner(banner.id)" 
                class="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                title="Supprimer"
             >
                <i class="fas fa-trash text-sm"></i>
             </button>
          </div>
        </div>

        <!-- Content -->
        <div class="p-4">
          <div class="flex justify-between items-start gap-2">
            <h3 class="font-bold text-gray-900 truncate flex-1">{{ banner.title }}</h3>
            <span class="text-[10px] font-bold text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100 uppercase">Ordre: {{ banner.order }}</span>
          </div>
          <p class="text-sm text-gray-500 truncate mt-1">{{ banner.subtitle }}</p>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <Teleport to="body">
      <div v-if="showModal" class="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-gray-100">
        <!-- Global Close Button -->
        <!-- Global Close Button (Plain Red X) -->
        <button 
          @click="closeModal" 
          class="fixed top-6 right-6 z-[1000000] text-red-600 hover:text-red-800 transition-all transform hover:scale-110 flex items-center justify-center p-2"
          title="Fermer"
        >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 drop-shadow-sm" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
        </button>
        <div class="bg-white rounded-xl shadow-xl w-full max-w-4xl overflow-hidden flex flex-col md:flex-row h-[85vh]">
          
          <!-- Preview Side (Left/Top) -->
          <div class="w-full md:w-1/2 bg-gray-100 p-6 flex flex-col justify-center border-r border-gray-200 overflow-y-auto">
            <h3 class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Aperçu du site (Hero Section)</h3>
            
            <!-- Banner Preview Container -->
            <div class="relative w-full aspect-[21/9] bg-gray-200 rounded-lg overflow-hidden shadow-lg group">
              <img 
                v-if="form.image" 
                :src="form.image" 
                class="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
              >
              <div v-else class="w-full h-full flex items-center justify-center text-gray-400">
                <i class="fas fa-image text-4xl"></i>
              </div>
              
              <!-- Text Overlay (mimics frontend) -->
              <div 
                class="absolute inset-0 bg-black/30 flex flex-col px-8 text-white transition-all duration-300"
                :class="[
                  form.verticalAlign === 'items-start' ? 'justify-start pt-12' : 
                  form.verticalAlign === 'items-end' ? 'justify-end pb-12' : 
                  'justify-center',
                  form.textAlign === 'text-left' ? 'items-start text-left' : 
                  form.textAlign === 'text-right' ? 'items-end text-right' : 
                  'items-center text-center'
                ]"
              >
                <div class="max-w-[80%]"> <!-- Container to constrain width like frontend -->
                  <h2 
                    class="mb-2 drop-shadow-md" 
                    :class="[form.titleSize || 'text-4xl', form.titleWeight || 'font-bold']"
                    :style="{ color: form.titleColor || '#ffffff' }"
                  >
                    {{ form.title || 'Votre Titre Ici' }}
                  </h2>
                  <p 
                    class="text-sm md:text-base font-medium mb-4 opacity-90 drop-shadow-sm"
                    :style="{ color: form.subtitleColor || '#ffffff' }"
                  >
                    {{ form.subtitle || 'Votre sous-titre description apparaît ici...' }}
                  </p>
                  
                  <div v-if="form.link" class="inline-block">
                    <span class="bg-white text-gray-900 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wide shadow-sm">
                      {{ form.buttonText || 'Découvrir' }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <p class="mt-4 text-xs text-gray-500 text-center">
              * L'aperçu est approximatif. Le rendu final dépend de l'écran de l'utilisateur.
            </p>
          </div>

          <!-- Form Side (Right/Bottom) -->
          <div class="w-full md:w-1/2 flex flex-col h-full min-h-0 bg-white">
            <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
              <h3 class="text-lg font-bold text-gray-900">{{ isEditing ? 'Modifier la bannière' : 'Nouvelle bannière' }}</h3>
              <button @click="closeModal" class="text-gray-400 hover:text-gray-600">
                <i class="fas fa-times"></i>
              </button>
            </div>

            <div class="p-6 overflow-y-scroll force-red-scrollbar flex-1 min-h-0">
              <form @submit.prevent="saveBanner" class="space-y-4">
                
                <!-- Active Switch (Moved to Top) -->
                <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <span class="text-sm font-medium text-gray-700">Statut de la bannière</span>
                  <label class="relative inline-flex items-center cursor-pointer gap-3">
                    <input v-model="form.isActive" type="checkbox" class="sr-only peer">
                    
                    <!-- Rectangular Track -->
                    <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-sm after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    
                    <!-- Status Text -->
                    <span class="text-sm font-medium w-16" :class="form.isActive ? 'text-green-600' : 'text-gray-500'">
                      {{ form.isActive ? 'ACTIVE' : 'INACTIVE' }}
                    </span>
                  </label>
                </div>

                <!-- Image URL -->
                <div>
                  <div class="flex justify-between">
                    <label class="block text-sm font-medium text-gray-700 mb-1">URL de l'image *</label>
                    <span class="text-xs text-gray-500">Recommandé : 1920x500 px</span>
                  </div>
                  <div class="flex gap-2">
                    <input 
                      v-model="form.image" 
                      type="url" 
                      required
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
                      placeholder="https://..."
                    >
                    <input type="file" id="banner-upload" class="hidden" @change="handleFileUpload" accept="image/*">
                    <button 
                      type="button" 
                      @click="triggerFileInput" 
                      class="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg border border-gray-300 transition-colors"
                      :disabled="isUploading"
                    >
                      <i v-if="isUploading" class="fas fa-spinner fa-spin"></i>
                      <span v-else class="flex items-center gap-2">
                        <i class="fas fa-upload"></i> Parcourir
                      </span>
                    </button>
                  </div>
                </div>

                <!-- Title & Subtitle -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Titre Principal</label>
                  <input 
                    v-model="form.title" 
                    type="text" 
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-lg font-medium"
                    placeholder="Ex: NOUVELLE COLLECTION"
                  >
                </div>
                
                <!-- Title Style Options -->
                  <div class="grid grid-cols-2 gap-2 mb-2">
                      <div>
                          <label class="block text-xs text-gray-500 mb-1">Taille Titre</label>
                          <select v-model="form.titleSize" class="w-full text-sm px-2 py-1 border border-gray-300 rounded focus:ring-blue-500">
                              <option value="text-2xl">Petit (2XL)</option>
                              <option value="text-3xl">Moyen (3XL)</option>
                              <option value="text-4xl">Grand (4XL)</option>
                              <option value="text-5xl">Très Grand (5XL)</option>
                              <option value="text-6xl">Géant (6XL)</option>
                          </select>
                      </div>
                      <div>
                          <label class="block text-xs text-gray-500 mb-1">Graisse</label>
                          <select v-model="form.titleWeight" class="w-full text-sm px-2 py-1 border border-gray-300 rounded focus:ring-blue-500">
                              <option value="font-normal">Normale</option>
                              <option value="font-medium">Moyenne</option>
                              <option value="font-bold">Gras</option>
                              <option value="font-extrabold">Extra Gras</option>
                          </select>
                      </div>
                  </div>
                  <div class="grid grid-cols-2 gap-2">
                      <div>
                          <label class="block text-xs text-gray-500 mb-1">Couleur Titre</label>
                          <div class="flex items-center gap-2">
                              <input v-model="form.titleColor" type="color" class="h-8 w-8 p-0 border border-gray-300 rounded cursor-pointer">
                              <span class="text-xs text-gray-500 truncate">{{ form.titleColor }}</span>
                          </div>
                      </div>
                      <div>
                          <label class="block text-xs text-gray-500 mb-1">Couleur Sous-titre</label>
                          <div class="flex items-center gap-2">
                              <input v-model="form.subtitleColor" type="color" class="h-8 w-8 p-0 border border-gray-300 rounded cursor-pointer">
                              <span class="text-xs text-gray-500 truncate">{{ form.subtitleColor }}</span>
                          </div>
                      </div>
                  </div>

                <!-- Alignment Controls -->
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Alignement Texte</label>
                    <div class="flex rounded-md shadow-sm" role="group">
                      <button 
                        type="button"
                        @click="form.textAlign = 'text-left'"
                        class="px-4 py-2 text-sm font-medium border border-gray-200 rounded-l-lg hover:bg-gray-100 focus:z-10 focus:ring-2 focus:ring-blue-700"
                        :class="form.textAlign === 'text-left' ? 'bg-blue-600 text-white' : 'bg-white text-gray-900'"
                      >
                        <i class="fas fa-align-left"></i>
                      </button>
                      <button 
                        type="button"
                        @click="form.textAlign = 'text-center'"
                        class="px-4 py-2 text-sm font-medium border-t border-b border-gray-200 hover:bg-gray-100 focus:z-10 focus:ring-2 focus:ring-blue-700"
                        :class="form.textAlign === 'text-center' ? 'bg-blue-600 text-white' : 'bg-white text-gray-900'"
                      >
                        <i class="fas fa-align-center"></i>
                      </button>
                      <button 
                        type="button"
                        @click="form.textAlign = 'text-right'"
                        class="px-4 py-2 text-sm font-medium border border-gray-200 rounded-r-lg hover:bg-gray-100 focus:z-10 focus:ring-2 focus:ring-blue-700"
                        :class="form.textAlign === 'text-right' ? 'bg-blue-600 text-white' : 'bg-white text-gray-900'"
                      >
                        <i class="fas fa-align-right"></i>
                      </button>
                    </div>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Position Verticale</label>
                    <div class="flex rounded-md shadow-sm" role="group">
                      <button 
                        type="button"
                        @click="form.verticalAlign = 'items-start'"
                        class="px-4 py-2 text-sm font-medium border border-gray-200 rounded-l-lg hover:bg-gray-100 focus:z-10 focus:ring-2 focus:ring-blue-700"
                        :class="form.verticalAlign === 'items-start' ? 'bg-blue-600 text-white' : 'bg-white text-gray-900'"
                      >
                        <i class="fas fa-arrow-up"></i>
                      </button>
                      <button 
                        type="button"
                        @click="form.verticalAlign = 'items-center'"
                        class="px-4 py-2 text-sm font-medium border-t border-b border-gray-200 hover:bg-gray-100 focus:z-10 focus:ring-2 focus:ring-blue-700"
                        :class="form.verticalAlign === 'items-center' ? 'bg-blue-600 text-white' : 'bg-white text-gray-900'"
                      >
                        <i class="fas fa-arrows-alt-v"></i>
                      </button>
                      <button 
                        type="button"
                        @click="form.verticalAlign = 'items-end'"
                        class="px-4 py-2 text-sm font-medium border border-gray-200 rounded-r-lg hover:bg-gray-100 focus:z-10 focus:ring-2 focus:ring-blue-700"
                        :class="form.verticalAlign === 'items-end' ? 'bg-blue-600 text-white' : 'bg-white text-gray-900'"
                      >
                        <i class="fas fa-arrow-down"></i>
                      </button>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Sous-titre / Description</label>
                  <textarea 
                    v-model="form.subtitle" 
                    rows="2"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
                    placeholder="Une description courte et accrocheuse..."
                  ></textarea>
                </div>

                  <!-- Link & Button Text -->
                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">Lien de redirection</label>
                      <input 
                        v-model="form.link" 
                        type="text" 
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
                        placeholder="/collections/summer"
                      >
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">Texte du Bouton</label>
                      <input 
                        v-model="form.buttonText" 
                        type="text" 
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
                        placeholder="Ex: DÉCOUVRIR"
                      >
                    </div>
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Ordre</label>
                    <input 
                      v-model.number="form.order" 
                      type="number" 
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
                    >
                  </div>


                <!-- Dates -->
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Début (Optionnel)</label>
                    <input 
                      v-model="form.startDate" 
                      type="date" 
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
                    >
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Fin (Optionnel)</label>
                    <input 
                      v-model="form.endDate" 
                      type="date" 
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
                    >
                  </div>
                </div>

                <!-- Hidden Submit for Enter Key -->
                <button type="submit" class="hidden"></button>
              </form>
            </div>

            <!-- Footer Actions -->
            <div class="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 rounded-br-xl">
              <button 
                type="button" 
                @click="closeModal"
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Annuler
              </button>
              <button 
                @click="saveBanner"
                class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center gap-2 shadow-sm transition-colors"
                :disabled="saving"
              >
                <div v-if="saving" class="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                <span>{{ isEditing ? 'Mettre à jour' : 'Enregistrer' }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, onUnmounted } from 'vue';
import PersonalizationService from '@/services/PersonalizationService';
import api from '@/services/api';
import { useUIStore } from '@/stores/ui';

const uiStore = useUIStore();
const banners = ref<any[]>([]);
const loading = ref(false);
const showModal = ref(false);
const saving = ref(false);
const isEditing = ref(false);
const isUploading = ref(false);

// ... (keep existing form ref) ...
const form = ref({
  id: null,
  title: '',
  subtitle: '',
  image: '',
  link: '',
  order: 0,
  isActive: true,
  startDate: '',
  endDate: '',
  titleSize: 'text-4xl',
  titleWeight: 'font-bold',
  titleColor: '#ffffff',
  subtitleColor: '#ffffff',
  textAlign: 'text-center',
  verticalAlign: 'items-center',
  buttonText: 'Découvrir'
});

// Watch showModal to lock/unlock body scroll
watch(showModal, (newVal) => {
  if (newVal) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
});

// Ensure cleanup if component is unmounted while modal is open
onUnmounted(() => {
  document.body.style.overflow = '';
});

const loadBanners = async () => {
// ... (rest of the code)
  loading.value = true;
  try {
    const response = await PersonalizationService.getBanners();
    banners.value = response.data;
  } catch (error) {
    console.error('Failed to load banners', error);
  } finally {
    loading.value = false;
  }
};

const openModal = (banner: any = null) => {
  if (banner) {
    isEditing.value = true;
    form.value = { ...banner };
    if (form.value.startDate) form.value.startDate = new Date(form.value.startDate).toISOString().split('T')[0];
    if (form.value.endDate) form.value.endDate = new Date(form.value.endDate).toISOString().split('T')[0];
  } else {
    isEditing.value = false;
    form.value = {
      id: null,
      title: '',
      subtitle: '',
      image: '',
      link: '',
      order: banners.value.length,
      isActive: true,
      startDate: '',
      endDate: '',
      titleSize: 'text-4xl',
      titleWeight: 'font-bold',
      titleColor: '#ffffff',
      subtitleColor: '#ffffff',
      textAlign: 'text-center',
      verticalAlign: 'items-center',
      buttonText: 'Découvrir'
    };
  }
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
};

const saveBanner = async () => {
  saving.value = true;
  try {
    // Sanitize payload
    const payload = { ...form.value };
    if (!payload.startDate) payload.startDate = null;
    if (!payload.endDate) payload.endDate = null;
    if (!payload.link) payload.link = null;

    if (isEditing.value) {
      await PersonalizationService.updateBanner(payload.id, payload);
    } else {
      await PersonalizationService.createBanner(payload);
    }
    await loadBanners();
    closeModal();
    uiStore.addToast(isEditing.value ? 'Bannière mise à jour' : 'Bannière créée', 'success');
  } catch (error) {
    console.error('Error saving banner', error);
    uiStore.addToast('Erreur lors de la sauvegarde : ' + (error.response?.data?.error || error.message), 'error');
  } finally {
    saving.value = false;
  }
};

const deleteBanner = async (id: number) => {
  const confirmed = await uiStore.confirm({
    title: 'Supprimer la bannière',
    message: 'Êtes-vous sûr de vouloir supprimer cette bannière ?',
    type: 'danger',
    confirmText: 'Supprimer'
  });

  if (!confirmed) return;
  
  try {
    await PersonalizationService.deleteBanner(id);
    await loadBanners();
    uiStore.addToast('Bannière supprimée', 'success');
  } catch (error) {
    console.error('Error deleting banner', error);
    uiStore.addToast('Erreur lors de la suppression', 'error');
  }
};

// File Upload Logic
const triggerFileInput = () => {
  document.getElementById('banner-upload')?.click();
};

const handleFileUpload = async (event: Event) => {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
        await uploadImage(input.files[0]);
    }
};

const uploadImage = async (file: File) => {
    isUploading.value = true;
    const formData = new FormData();
    formData.append('images', file);

    try {
        const response = await api.post('/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });

        if (response.data.urls && response.data.urls.length > 0) {
            const url = response.data.urls[0];
            if (url.startsWith('/')) {
                const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3003';
                form.value.image = `${baseUrl}${url}`;
            } else {
                form.value.image = url;
            }
        }
    } catch (error) {
        console.error('Upload failed', error);
        uiStore.addToast('Erreur lors du téléchargement de l\'image.', 'error');
    } finally {
        isUploading.value = false;
    }
};

onMounted(() => {
  loadBanners();
});
</script>
