<template>
  <div>
    <h2 class="text-lg font-semibold text-gray-800 mb-6">Promotions en Vedette</h2>

    <div v-if="loading" class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>

    <div v-else class="space-y-6">
      <div class="bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-start gap-3">
        <i class="fas fa-info-circle text-blue-600 mt-1"></i>
        <div>
          <h4 class="font-medium text-blue-800">Comment ça marche ?</h4>
          <p class="text-sm text-blue-600 mt-1">
            Sélectionnez les promotions à afficher sur la page d'accueil. 
            Seules les promotions actives peuvent être sélectionnées.
          </p>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div 
          v-for="promo in promotions" 
          :key="promo.id" 
          class="bg-white rounded-xl shadow-sm border overflow-hidden transition-all cursor-pointer relative group"
          :class="isFeatured(promo.id) ? 'border-blue-500 ring-2 ring-blue-500 ring-opacity-50' : 'border-gray-200 hover:border-blue-300'"
          @click="toggleFeatured(promo.id)"
        >
          <!-- Selection Badge -->
          <div v-if="isFeatured(promo.id)" class="absolute top-2 right-2 bg-blue-600 text-white p-1 rounded-full shadow-md z-10">
            <i class="fas fa-check text-xs block"></i>
          </div>

          <!-- Image -->
          <div class="h-32 bg-gray-100 relative">
            <img v-if="promo.image" :src="promo.image" :alt="promo.title" class="w-full h-full object-cover">
            <div v-else class="w-full h-full flex items-center justify-center text-gray-300">
              <i class="fas fa-percent text-3xl"></i>
            </div>
          </div>

          <!-- Content -->
          <div class="p-4">
            <h3 class="font-bold text-gray-900 truncate">{{ promo.title }}</h3>
            <div class="flex items-center gap-2 mt-1">
              <span class="px-2 py-0.5 rounded text-xs font-bold bg-red-100 text-red-700">-{{ promo.discount }}%</span>
              <span class="text-xs text-gray-500 font-mono">{{ promo.code }}</span>
            </div>
            <p class="text-xs text-gray-500 mt-3">Du {{ formatDate(promo.startDate) }} au {{ formatDate(promo.endDate) }}</p>
          </div>
        </div>
      </div>
      
      <!-- Save Button -->
      <div class="flex justify-end pt-6 border-t border-gray-100">
        <button 
          @click="saveConfig" 
          class="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg shadow-sm transition-colors flex items-center gap-2"
          :disabled="saving"
        >
          <div v-if="saving" class="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
          {{ saving ? 'Enregistrement...' : 'Enregistrer la sélection' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import PersonalizationService from '@/services/PersonalizationService';
import { useUIStore } from '@/stores/ui';

const uiStore = useUIStore();
const loading = ref(false);
const saving = ref(false);
const promotions = ref<any[]>([]);
const featuredIds = ref<number[]>([]);

const loadData = async () => {
  loading.value = true;
  try {
    // Parallel fetch: All Promotions and Homepage Config
    const promos = await PersonalizationService.getPromotions();
    const configResponse = await PersonalizationService.getSectionConfig('promotions');

    // Filter only active promotions
    promotions.value = promos.filter((p: any) => p.isActive);

    // Load saved config
    if (configResponse.data && configResponse.data.content && configResponse.data.content.featuredIds) {
      featuredIds.value = configResponse.data.content.featuredIds;
    }
  } catch (error) {
    console.error('Failed to load promotions data', error);
    uiStore.addToast('Erreur lors du chargement des promotions', 'error');
  } finally {
    loading.value = false;
  }
};

const isFeatured = (id: number) => featuredIds.value.includes(id);

const toggleFeatured = (id: number) => {
  const index = featuredIds.value.indexOf(id);
  if (index === -1) {
    featuredIds.value.push(id);
  } else {
    featuredIds.value.splice(index, 1);
  }
};

const saveConfig = async () => {
  saving.value = true;
  try {
    await PersonalizationService.updateSectionConfig('promotions', {
      content: { featuredIds: featuredIds.value },
      isActive: true
    });
    uiStore.addToast('Sélection enregistrée !', 'success');
  } catch (error) {
    console.error('Failed to save config', error);
    uiStore.addToast('Erreur lors de l\'enregistrement', 'error');
  } finally {
    saving.value = false;
  }
};

const formatDate = (dateString: string) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('fr-FR');
};

onMounted(() => {
  loadData();
});
</script>
