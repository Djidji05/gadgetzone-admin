<template>
  <div class="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
    <div class="mb-6 flex items-center justify-between">
      <h2 class="text-title-md2 font-bold text-black dark:text-white">Campagnes Marketing</h2>
      <button 
        @click="showCreateModal = true"
        class="rounded bg-primary px-6 py-3 text-white hover:bg-opacity-90"
      >
        Nouvelle campagne
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="text-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
      <p class="mt-4 text-gray-600">Chargement des campagnes...</p>
    </div>

    <!-- Stats Cards -->
    <div v-else class="grid grid-cols-1 gap-6 lg:grid-cols-4 mb-6">
      <div class="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
        <h4 class="text-title-md font-bold">{{ stats.activeCampaigns }}</h4>
        <span class="text-sm">Campagnes actives</span>
      </div>
      <div class="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
        <h4 class="text-title-md font-bold">{{ stats.conversionRate }}%</h4>
        <span class="text-sm">Taux de conversion</span>
      </div>
      <div class="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
        <h4 class="text-title-md font-bold">{{ stats.totalLeads.toLocaleString() }}</h4>
        <span class="text-sm">Leads générés</span>
      </div>
      <div class="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
        <h4 class="text-title-md font-bold">{{ formatCurrency(stats.totalRevenue) }}</h4>
        <span class="text-sm">Revenu total</span>
      </div>
    </div>

    <!-- Campaigns List -->
    <div v-if="!isLoading" class="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
      <div class="px-4 py-6 md:px-6 xl:px-7.5">
        <h4 class="text-xl font-bold">Liste des campagnes</h4>
      </div>
      <div class="p-6">
        <div v-if="campaigns.length === 0" class="text-center py-12">
          <p class="text-gray-600">Aucune campagne pour le moment</p>
          <button 
            @click="showCreateModal = true"
            class="mt-4 rounded bg-primary px-6 py-3 text-white hover:bg-opacity-90"
          >
            Créer votre première campagne
          </button>
        </div>
        <div v-else class="space-y-4">
          <div 
            v-for="campaign in campaigns" 
            :key="campaign.id" 
            class="flex items-center justify-between border-b pb-4 last:border-0"
          >
            <div>
              <h5 class="font-medium text-black dark:text-white">{{ campaign.name }}</h5>
              <p class="text-sm text-gray-600">
                {{ campaign.type }} • 
                <span :class="getStatusClass(campaign.status)">{{ campaign.status }}</span>
              </p>
              <p v-if="campaign.description" class="text-sm text-gray-500 mt-1">{{ campaign.description }}</p>
            </div>
            <div class="flex gap-2">
              <button 
                @click="editCampaign(campaign)"
                class="rounded border px-4 py-2 hover:bg-gray-100"
              >
                Modifier
              </button>
              <button 
                @click="deleteCampaign(campaign.id)"
                class="rounded border border-red-500 text-red-500 px-4 py-2 hover:bg-red-50"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { campaignsService, type Campaign, type CampaignStats } from '@/services/campaigns';

const campaigns = ref<Campaign[]>([]);
const stats = ref<CampaignStats>({
  activeCampaigns: 0,
  totalLeads: 0,
  totalConversions: 0,
  totalRevenue: 0,
  totalSpent: 0,
  conversionRate: '0',
  roi: '0'
});
const isLoading = ref(true);
const showCreateModal = ref(false);

const loadCampaigns = async () => {
  try {
    isLoading.value = true;
    const data = await campaignsService.getAll();
    campaigns.value = data.campaigns;
    stats.value = data.stats;
  } catch (error) {
    console.error('Error loading campaigns:', error);
    alert('Erreur lors du chargement des campagnes');
  } finally {
    isLoading.value = false;
  }
};

const editCampaign = (campaign: Campaign) => {
  // TODO: Implement edit modal
  console.log('Edit campaign:', campaign);
  alert('Fonctionnalité d\'édition à implémenter');
};

const deleteCampaign = async (id: number) => {
  if (!confirm('Êtes-vous sûr de vouloir supprimer cette campagne ?')) {
    return;
  }

  try {
    await campaignsService.delete(id);
    await loadCampaigns();
  } catch (error) {
    console.error('Error deleting campaign:', error);
    alert('Erreur lors de la suppression de la campagne');
  }
};

const getStatusClass = (status: string) => {
  const classes: Record<string, string> = {
    'Active': 'text-green-600 font-medium',
    'Draft': 'text-gray-600',
    'Paused': 'text-yellow-600',
    'Completed': 'text-blue-600',
    'Cancelled': 'text-red-600'
  };
  return classes[status] || 'text-gray-600';
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('fr-HT', {
    style: 'currency',
    currency: 'HTG',
    minimumFractionDigits: 0,
  }).format(value).replace('HTG', 'G');
};

onMounted(() => {
  loadCampaigns();
});
</script>
