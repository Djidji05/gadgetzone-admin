<template>
  <div class="p-4 sm:p-6 space-y-6">
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Campagnes Marketing</h1>
        <p class="text-sm text-gray-600 dark:text-gray-400">Gérez vos campagnes publicitaires et suivez leurs performances</p>
      </div>
      <button 
        @click="openModal()"
        class="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
      >
        <Megaphone class="w-5 h-5 mr-2" />
        Nouvelle campagne
      </button>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div class="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center text-xl">
            <Radio class="w-6 h-6" />
          </div>
          <div>
            <p class="text-sm text-gray-500">Actives</p>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ stats.activeCampaigns || 0 }}</p>
          </div>
        </div>
      </div>
      <div class="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 bg-green-100 text-green-600 rounded-lg flex items-center justify-center text-xl">
            <TrendingUp class="w-6 h-6" />
          </div>
          <div>
            <p class="text-sm text-gray-500">Conversions</p>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ stats.totalConversions || 0 }}</p>
          </div>
        </div>
      </div>
      <div class="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center text-xl">
            <DollarSign class="w-6 h-6" />
          </div>
          <div>
            <p class="text-sm text-gray-500">Revenus</p>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ formatCurrency(stats.totalRevenue || 0) }}</p>
          </div>
        </div>
      </div>
      <div class="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center text-xl">
            <BarChart3 class="w-6 h-6" />
          </div>
          <div>
            <p class="text-sm text-gray-500">ROI</p>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ stats.roi || 0 }}%</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters & Search -->
    <div class="flex flex-col md:flex-row gap-4 justify-between items-center bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <div class="relative w-full md:w-96">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              v-model="search"
              type="text" 
              placeholder="Rechercher une campagne..." 
              class="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg dark:bg-gray-900 outline-none focus:ring-2 focus:ring-blue-500"
            >
        </div>
        <div class="flex gap-2 w-full md:w-auto">
            <select v-model="filterStatus" class="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg dark:bg-gray-900 outline-none focus:ring-2 focus:ring-blue-500 text-sm">
                <option value="all">Tous les statuts</option>
                <option value="Active">Actives</option>
                <option value="Draft">Brouillons</option>
                <option value="Paused">En pause</option>
                <option value="Completed">Terminées</option>
            </select>
            <select v-model="filterType" class="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg dark:bg-gray-900 outline-none focus:ring-2 focus:ring-blue-500 text-sm">
                <option value="all">Tous les types</option>
                <option value="Email">Email</option>
                <option value="Social Media">Réseaux Sociaux</option>
                <option value="Newsletter">Newsletter</option>
                <option value="Display Ads">Publicités</option>
            </select>
        </div>
    </div>

    <!-- Campaigns Grid -->
    <div v-if="loading" class="flex justify-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
    </div>

    <div v-else-if="filteredCampaigns.length === 0" class="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center border border-gray-200 dark:border-gray-700">
        <Megaphone class="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 class="text-xl font-bold text-gray-900 dark:text-white">Aucune campagne trouvée</h3>
        <p class="text-gray-500 mt-2">Ajustez vos filtres ou créez une nouvelle campagne marketing.</p>
        <button @click="openModal()" class="mt-6 px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-medium">Lancer une campagne</button>
    </div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      <div v-for="campaign in filteredCampaigns" :key="campaign.id" class="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all group">
        <div class="flex justify-between items-start mb-4">
          <span 
            class="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
            :class="getStatusClass(campaign.status)"
          >
            {{ campaign.status }}
          </span>
          <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button @click="openModal(campaign)" class="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"><Edit2 class="w-4 h-4" /></button>
            <button @click="handleDelete(campaign.id)" class="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"><Trash2 class="w-4 h-4" /></button>
          </div>
        </div>

        <div class="mb-4">
            <h3 class="text-lg font-bold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">{{ campaign.name }}</h3>
            <p class="text-gray-500 text-sm line-clamp-2 mt-1">{{ campaign.description || 'Pas de description.' }}</p>
        </div>
        
        <div class="space-y-4 pt-4 border-t border-gray-50 dark:border-gray-700">
          <div class="flex justify-between text-sm">
            <span class="text-gray-500 flex items-center gap-1.5"><Tag class="w-3.5 h-3.5" /> Type</span>
            <span class="font-medium text-gray-900 dark:text-white">{{ campaign.type }}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-gray-500 flex items-center gap-1.5"><Wallet class="w-3.5 h-3.5" /> Budget</span>
            <span class="font-medium text-gray-900 dark:text-white">{{ formatCurrency(campaign.budget) }}</span>
          </div>
          
          <div class="space-y-1.5 pt-1">
              <div class="flex justify-between text-xs font-medium">
                <span class="text-gray-500">Utilisation du budget</span>
                <span :class="getSpendPercent(campaign) > 90 ? 'text-red-600' : 'text-blue-600'">{{ getSpendPercent(campaign) }}%</span>
              </div>
              <div class="w-full bg-gray-100 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden">
                <div 
                    class="h-full transition-all duration-500"
                    :class="getSpendPercent(campaign) > 90 ? 'bg-red-600' : 'bg-blue-600'"
                    :style="{ width: getSpendPercent(campaign) + '%' }"
                ></div>
              </div>
          </div>

          <div class="grid grid-cols-2 gap-4 pt-2">
              <div class="p-3 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-gray-700 flex flex-col items-center">
                  <span class="text-[10px] text-gray-500 uppercase font-bold tracking-tight">Leads</span>
                  <span class="text-base font-bold text-gray-900 dark:text-white">{{ campaign.leads || 0 }}</span>
              </div>
              <div class="p-3 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-gray-700 flex flex-col items-center">
                  <span class="text-[10px] text-gray-500 uppercase font-bold tracking-tight">Revenus</span>
                  <span class="text-base font-bold text-green-600">{{ formatCurrency(campaign.revenue) }}</span>
              </div>
          </div>

          <div class="flex justify-between text-[10px] text-gray-400 font-medium">
            <span class="flex items-center gap-1"><CalendarIcon class="w-3 h-3" /> {{ formatDate(campaign.startDate) }}</span>
            <span class="flex items-center gap-1">Au {{ formatDate(campaign.endDate) }} <CalendarIcon class="w-3 h-3" /></span>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Form -->
    <Teleport to="body">
        <div v-if="showModal" class="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-4 duration-300">
                <div class="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
                    <h3 class="text-xl font-bold text-gray-900 dark:text-white">
                        {{ isEditing ? 'Modifier la campagne' : 'Lancer une campagne' }}
                    </h3>
                    <button @click="showModal = false" class="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors">
                        <X class="w-6 h-6" />
                    </button>
                </div>

                <div class="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div class="md:col-span-2">
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Nom de la campagne *</label>
                            <input v-model="form.name" type="text" required class="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl dark:bg-gray-900 text-sm focus:ring-2 focus:ring-blue-500 outline-none shadow-sm" placeholder="Ex: Campagne Été 2026">
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Type de campagne</label>
                            <select v-model="form.type" class="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl dark:bg-gray-900 text-sm focus:ring-2 focus:ring-blue-500 outline-none shadow-sm">
                                <option value="Email">Email Marketing</option>
                                <option value="Social Media">Réseaux Sociaux</option>
                                <option value="Newsletter">Newsletter</option>
                                <option value="SMS">SMS Marketing</option>
                                <option value="Display Ads">Bannières Publicitaires</option>
                                <option value="Other">Autre</option>
                            </select>
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Statut actuel</label>
                            <select v-model="form.status" class="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl dark:bg-gray-900 text-sm focus:ring-2 focus:ring-blue-500 outline-none shadow-sm">
                                <option value="Draft">Brouillon</option>
                                <option value="Active">Active</option>
                                <option value="Paused">En pause</option>
                                <option value="Completed">Terminée</option>
                                <option value="Cancelled">Annulée</option>
                            </select>
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Date de début</label>
                            <input v-model="form.startDate" type="date" class="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl dark:bg-gray-900 text-sm focus:ring-2 focus:ring-blue-500 outline-none shadow-sm">
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Date de fin</label>
                            <input v-model="form.endDate" type="date" class="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl dark:bg-gray-900 text-sm focus:ring-2 focus:ring-blue-500 outline-none shadow-sm">
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Budget Total</label>
                            <div class="relative">
                                <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium text-sm">G</span>
                                <input v-model="form.budget" type="number" class="w-full pl-9 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl dark:bg-gray-900 text-sm focus:ring-2 focus:ring-blue-500 outline-none shadow-sm" placeholder="0.00">
                            </div>
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Dépenses actuelles</label>
                            <div class="relative">
                                <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium text-sm">G</span>
                                <input v-model="form.spent" type="number" class="w-full pl-9 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl dark:bg-gray-900 text-sm focus:ring-2 focus:ring-blue-500 outline-none shadow-sm" placeholder="0.00">
                            </div>
                        </div>

                        <div class="md:col-span-2">
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Description de la campagne</label>
                            <textarea v-model="form.description" rows="4" class="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl dark:bg-gray-900 text-sm focus:ring-2 focus:ring-blue-500 outline-none shadow-sm resize-none" placeholder="Objectifs, audience cible, etc."></textarea>
                        </div>
                    </div>
                </div>

                <div class="p-6 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex justify-end gap-3">
                    <button @click="showModal = false" class="px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 rounded-xl transition-all">Annuler</button>
                    <button @click="handleSubmit" :disabled="submitting" class="px-8 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2">
                        <span v-if="submitting" class="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                        {{ isEditing ? 'Mettre à jour' : 'Lancer la campagne' }}
                    </button>
                </div>
            </div>
        </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { campaignsService } from '@/services/campaigns';
import { useUIStore } from '@/stores/ui';
import { 
  Megaphone, 
  Radio, 
  TrendingUp, 
  DollarSign, 
  BarChart3, 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  X, 
  Tag, 
  Wallet, 
  Calendar as CalendarIcon 
} from 'lucide-vue-next';

defineOptions({ name: 'Campagnes' });

const uiStore = useUIStore();
const campaigns = ref<any[]>([]);
const stats = ref<any>({});
const loading = ref(false);
const submitting = ref(false);
const search = ref('');
const filterStatus = ref('all');
const filterType = ref('all');

const showModal = ref(false);
const isEditing = ref(false);

const form = ref({
  id: null as number | null,
  name: '',
  type: 'Email',
  status: 'Draft',
  description: '',
  startDate: '',
  endDate: '',
  budget: 0,
  spent: 0
});

const loadCampaigns = async () => {
  loading.value = true;
  try {
    const data = await campaignsService.getAll();
    campaigns.value = data.campaigns;
    stats.value = data.stats;
  } catch (error) {
    console.error('Error loading campaigns:', error);
    uiStore.addToast('Erreur lors du chargement des campagnes', 'error');
  } finally {
    loading.value = false;
  }
};

const filteredCampaigns = computed(() => {
  return campaigns.value.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(search.value.toLowerCase()) || 
                          c.description?.toLowerCase().includes(search.value.toLowerCase());
    const matchesStatus = filterStatus.value === 'all' || c.status === filterStatus.value;
    const matchesType = filterType.value === 'all' || c.type === filterType.value;
    return matchesSearch && matchesStatus && matchesType;
  });
});

const openModal = (campaign: any = null) => {
  if (campaign) {
    isEditing.value = true;
    form.value = { 
        ...campaign,
        startDate: campaign.startDate ? new Date(campaign.startDate).toISOString().split('T')[0] : '',
        endDate: campaign.endDate ? new Date(campaign.endDate).toISOString().split('T')[0] : ''
    };
  } else {
    isEditing.value = false;
    form.value = {
      id: null,
      name: '',
      type: 'Email',
      status: 'Draft',
      description: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      budget: 0,
      spent: 0
    };
  }
  showModal.value = true;
};

const handleSubmit = async () => {
  if (!form.value.name) {
    uiStore.addToast('Le nom de la campagne est obligatoire', 'error');
    return;
  }

  submitting.value = true;
  try {
    if (isEditing.value && form.value.id) {
      await campaignsService.update(form.value.id, form.value);
      uiStore.addToast('Campagne mise à jour', 'success');
    } else {
      await campaignsService.create(form.value);
      uiStore.addToast('Campagne créée avec succès', 'success');
    }
    showModal.value = false;
    await loadCampaigns();
  } catch (error) {
    console.error('Error saving campaign:', error);
    uiStore.addToast('Erreur lors de l’enregistrement', 'error');
  } finally {
    submitting.value = false;
  }
};

const handleDelete = async (id: number) => {
  const confirmed = await uiStore.confirm({
    title: 'Supprimer la campagne',
    message: 'Êtes-vous sûr de vouloir supprimer cette campagne ? Toutes les statistiques associées seront perdues.',
    confirmText: 'Supprimer',
    type: 'danger'
  });

  if (!confirmed) return;

  try {
    await campaignsService.delete(id);
    uiStore.addToast('Campagne supprimée', 'info');
    await loadCampaigns();
  } catch (error) {
    uiStore.addToast('Erreur lors de la suppression', 'error');
  }
};

const getStatusClass = (status: string) => {
  switch (status) {
    case 'Active': return 'bg-green-100 text-green-700';
    case 'Draft': return 'bg-gray-100 text-gray-600';
    case 'Paused': return 'bg-yellow-100 text-yellow-700';
    case 'Completed': return 'bg-blue-100 text-blue-700';
    case 'Cancelled': return 'bg-red-100 text-red-700';
    default: return 'bg-gray-100 text-gray-500';
  }
};

const getSpendPercent = (campaign: any) => {
    if (!campaign.budget || campaign.budget <= 0) return 0;
    const percent = ((campaign.spent || 0) / campaign.budget) * 100;
    return Math.min(Math.round(percent), 100);
};

const formatCurrency = (val: any) => {
    return new Intl.NumberFormat('fr-HT', { style: 'currency', currency: 'HTG' }).format(val || 0).replace('HTG', 'G');
};

const formatDate = (date: any) => {
    if (!date) return '---';
    return new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
};

onMounted(loadCampaigns);
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
