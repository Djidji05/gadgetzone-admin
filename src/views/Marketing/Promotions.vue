<template>
  <div class="p-4 sm:p-6 space-y-6">
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Promotions</h1>
        <p class="text-sm text-gray-600 dark:text-gray-400">Gérez les codes promo et les réductions pour vos clients</p>
      </div>
      <button 
        @click="openModal()"
        class="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
      >
        <Plus class="w-5 h-5 mr-2" />
        Nouvelle promotion
      </button>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 bg-green-100 text-green-600 rounded-lg flex items-center justify-center text-xl">
            <Percent class="w-6 h-6" />
          </div>
          <div>
            <p class="text-sm text-gray-500">Actives</p>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ stats.active }}</p>
          </div>
        </div>
      </div>
      <div class="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center text-xl">
            <Calendar class="w-6 h-6" />
          </div>
          <div>
            <p class="text-sm text-gray-500">À venir</p>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ stats.upcoming }}</p>
          </div>
        </div>
      </div>
      <div class="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 bg-red-100 text-red-600 rounded-lg flex items-center justify-center text-xl">
            <Clock class="w-6 h-6" />
          </div>
          <div>
            <p class="text-sm text-gray-500">Expirées</p>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ stats.expired }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Table -->
    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
      <div class="p-6 border-b border-gray-200 dark:border-gray-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h3 class="font-bold text-gray-900 dark:text-white">Liste des promotions</h3>
        <div class="relative">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              v-model="search"
              placeholder="Rechercher..."
              class="pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg dark:bg-gray-900 text-sm focus:ring-2 focus:ring-blue-500 outline-none w-full md:w-64"
            >
        </div>
      </div>
      
      <div v-if="loading" class="p-12 flex justify-center">
        <div class="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
      </div>

      <div v-else-if="filteredPromotions.length === 0" class="p-12 text-center">
        <Ticket class="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 class="text-lg font-medium text-gray-900 dark:text-white">Aucune promotion trouvée</h3>
        <p class="text-gray-500">Commencez par créer votre première promotion ou code promo.</p>
        <button @click="openModal()" class="mt-4 text-blue-600 font-medium hover:underline">Créer une promotion</button>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-left">
          <thead>
            <tr class="bg-gray-50 dark:bg-gray-900/50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <th class="px-6 py-4">Titre / Code</th>
              <th class="px-6 py-4">Réduction</th>
              <th class="px-6 py-4">Période</th>
              <th class="px-6 py-4">Statut</th>
              <th class="px-6 py-4">Utilisations</th>
              <th class="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
            <tr v-for="promo in filteredPromotions" :key="promo.id" class="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
              <td class="px-6 py-4">
                <div class="flex flex-col">
                  <span class="font-bold text-gray-900 dark:text-white">{{ promo.title }}</span>
                  <span v-if="promo.code" class="text-xs font-mono bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded w-fit mt-1 text-gray-600 dark:text-gray-300">
                    {{ promo.code }}
                  </span>
                </div>
              </td>
              <td class="px-6 py-4">
                <span class="font-medium text-blue-600 dark:text-blue-400">
                  {{ promo.discountType === 'percentage' ? promo.discount + '%' : promo.discount + ' G' }}
                </span>
              </td>
              <td class="px-6 py-4">
                <div class="text-xs flex flex-col gap-0.5">
                  <span class="text-gray-600 dark:text-gray-400">{{ formatDate(promo.startDate) }}</span>
                  <span class="text-gray-400">au</span>
                  <span class="text-gray-600 dark:text-gray-400">{{ formatDate(promo.endDate) }}</span>
                </div>
              </td>
              <td class="px-6 py-4">
                <span 
                  class="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
                  :class="getStatusBadgeClass(promo)"
                >
                  {{ getStatusLabel(promo) }}
                </span>
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center gap-2">
                    <span class="text-sm font-medium text-gray-900 dark:text-white">{{ promo.usageCount || 0 }}</span>
                    <span v-if="promo.usageLimit" class="text-xs text-gray-400">/ {{ promo.usageLimit }}</span>
                </div>
              </td>
              <td class="px-6 py-4 text-right">
                <div class="flex items-center justify-end gap-2">
                  <button 
                    @click="openModal(promo)"
                    class="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                  >
                    <Edit2 class="w-4 h-4" />
                  </button>
                  <button 
                    @click="deletePromotion(promo.id)"
                    class="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <Trash2 class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal -->
    <Teleport to="body">
      <div v-if="showModal" class="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
          <div class="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
            <h3 class="text-lg font-bold text-gray-900 dark:text-white">
              {{ isEditing ? 'Modifier la promotion' : 'Nouvelle promotion' }}
            </h3>
            <button @click="closeModal" class="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors">
              <X class="w-6 h-6" />
            </button>
          </div>

          <div class="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Titre de la promotion</label>
                <input 
                  v-model="form.title" 
                  type="text" 
                  required
                  class="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl dark:bg-gray-900 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Ex: Soldes d'Été 2026"
                >
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Code Promo (Optionnel)</label>
                <input 
                  v-model="form.code" 
                  type="text" 
                  class="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl dark:bg-gray-900 text-sm font-mono uppercase focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="EX: ETE2026"
                >
                <p class="text-[10px] text-gray-500 mt-1">Laissez vide pour une réduction automatique.</p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Type de réduction</label>
                <select 
                  v-model="form.discountType"
                  class="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl dark:bg-gray-900 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="percentage">Pourcentage (%)</option>
                  <option value="fixed">Montant fixe (G)</option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Valeur de la réduction</label>
                <div class="relative">
                    <input 
                      v-model="form.discount" 
                      type="number" 
                      required
                      class="w-full pl-4 pr-10 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl dark:bg-gray-900 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                    <span class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                        {{ form.discountType === 'percentage' ? '%' : 'G' }}
                    </span>
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Montant min. d'achat</label>
                <div class="relative">
                    <input 
                      v-model="form.minAmount" 
                      type="number" 
                      class="w-full pl-4 pr-10 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl dark:bg-gray-900 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="0"
                    >
                    <span class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">G</span>
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Date de début</label>
                <input 
                  v-model="form.startDate" 
                  type="date" 
                  required
                  class="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl dark:bg-gray-900 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                >
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Date de fin</label>
                <input 
                  v-model="form.endDate" 
                  type="date" 
                  required
                  class="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl dark:bg-gray-900 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                >
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Limite d'utilisation</label>
                <input 
                  v-model="form.usageLimit" 
                  type="number" 
                  class="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl dark:bg-gray-900 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Illimité"
                >
              </div>

              <div class="flex items-center gap-3 bg-gray-50 dark:bg-white/5 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                <input 
                   v-model="form.isActive" 
                   type="checkbox" 
                   id="isActive"
                   class="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                >
                <label for="isActive" class="text-sm font-medium text-gray-900 dark:text-white cursor-pointer">Promotion active immédiatement</label>
              </div>
            </div>

            <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Description (Interne)</label>
                <textarea 
                  v-model="form.description" 
                  rows="3"
                  class="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl dark:bg-gray-900 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Notes sur la promotion..."
                ></textarea>
              </div>
          </div>

          <div class="p-6 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex justify-end gap-3">
            <button 
              @click="closeModal"
              class="px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-colors"
            >
              Annuler
            </button>
            <button 
              @click="savePromotion"
              :disabled="saving"
              class="px-8 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2"
            >
              <span v-if="saving" class="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
              {{ isEditing ? 'Mettre à jour' : 'Créer la promotion' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { personalisationService } from '@/services/api';
import { useUIStore } from '@/stores/ui';
import { 
  Percent, 
  Calendar, 
  Clock, 
  Plus, 
  Search, 
  Ticket, 
  Edit2, 
  Trash2, 
  X 
} from 'lucide-vue-next';

defineOptions({ name: 'Promotions' });

const uiStore = useUIStore();
const promotions = ref<any[]>([]);
const loading = ref(false);
const saving = ref(false);
const search = ref('');
const showModal = ref(false);
const isEditing = ref(false);

const form = ref({
  id: null as number | null,
  title: '',
  description: '',
  code: '',
  discount: 0,
  discountType: 'percentage',
  minAmount: 0,
  startDate: '',
  endDate: '',
  isActive: true,
  usageLimit: null as number | null
});

const stats = computed(() => {
  const now = new Date();
  return {
    active: promotions.value.filter(p => p.isActive && new Date(p.startDate) <= now && new Date(p.endDate) >= now).length,
    upcoming: promotions.value.filter(p => p.isActive && new Date(p.startDate) > now).length,
    expired: promotions.value.filter(p => new Date(p.endDate) < now).length
  };
});

const filteredPromotions = computed(() => {
  if (!search.value) return promotions.value;
  const s = search.value.toLowerCase();
  return promotions.value.filter(p => 
    p.title.toLowerCase().includes(s) || 
    p.code?.toLowerCase().includes(s)
  );
});

const loadPromotions = async () => {
  loading.value = true;
  try {
    const data = await personalisationService.getPromotions(true); // Passer admin=true
    promotions.value = Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Failed to load promotions', error);
    uiStore.addToast('Erreur lors du chargement des promotions', 'error');
  } finally {
    loading.value = false;
  }
};

const openModal = (promo: any = null) => {
  if (promo) {
    isEditing.value = true;
    form.value = { 
        ...promo,
        startDate: promo.startDate ? new Date(promo.startDate).toISOString().split('T')[0] : '',
        endDate: promo.endDate ? new Date(promo.endDate).toISOString().split('T')[0] : ''
    };
  } else {
    isEditing.value = false;
    form.value = {
      id: null,
      title: '',
      description: '',
      code: '',
      discount: 0,
      discountType: 'percentage',
      minAmount: 0,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      isActive: true,
      usageLimit: null
    };
  }
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
};

const savePromotion = async () => {
  if (!form.value.title || !form.value.startDate || !form.value.endDate) {
    uiStore.addToast('Veuillez remplir tous les champs obligatoires', 'error');
    return;
  }

  saving.value = true;
  try {
    const payload = { ...form.value };
    if (payload.code) payload.code = payload.code.toUpperCase();
    
    if (isEditing.value && payload.id) {
      await personalisationService.updatePromotion(payload.id, payload);
      uiStore.addToast('Promotion mise à jour', 'success');
    } else {
      await personalisationService.createPromotion(payload);
      uiStore.addToast('Promotion créée avec succès', 'success');
    }
    await loadPromotions();
    closeModal();
  } catch (error) {
    console.error('Error saving promotion', error);
    uiStore.addToast('Erreur lors de la sauvegarde', 'error');
  } finally {
    saving.value = false;
  }
};

const deletePromotion = async (id: number) => {
  const confirmed = await uiStore.confirm({
    title: 'Supprimer la promotion',
    message: 'Êtes-vous sûr de vouloir supprimer cette promotion ? Cette action est irréversible.',
    type: 'danger',
    confirmText: 'Supprimer'
  });

  if (!confirmed) return;

  try {
    await personalisationService.deletePromotion(id);
    uiStore.addToast('Promotion supprimée', 'success');
    await loadPromotions();
  } catch (error) {
    console.error('Error deleting promotion', error);
    uiStore.addToast('Erreur lors de la suppression', 'error');
  }
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return '---';
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

const getStatusLabel = (promo: any) => {
  const now = new Date();
  const start = new Date(promo.startDate);
  const end = new Date(promo.endDate);

  if (!promo.isActive) return 'Inactif';
  if (now < start) return 'À venir';
  if (now > end) return 'Expiré';
  return 'Actif';
};

const getStatusBadgeClass = (promo: any) => {
  const status = getStatusLabel(promo);
  switch (status) {
    case 'Actif': return 'bg-green-100 text-green-600';
    case 'À venir': return 'bg-blue-100 text-blue-600';
    case 'Expiré': return 'bg-red-100 text-red-600';
    case 'Inactif': return 'bg-gray-100 text-gray-600';
    default: return 'bg-gray-100 text-gray-500';
  }
};

onMounted(loadPromotions);
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 10px;
}
.dark .custom-scrollbar::-webkit-scrollbar-thumb {
  background: #334155;
}
</style>
