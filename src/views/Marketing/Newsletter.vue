<template>
  <div class="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
    <h2 class="mb-6 text-title-md2 font-bold text-black dark:text-white">Newsletter</h2>
    
    <!-- Loading State -->
    <div v-if="isLoading" class="text-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
      <p class="mt-4 text-gray-600">Chargement...</p>
    </div>

    <!-- Stats Cards -->
    <div v-else class="grid grid-cols-1 gap-6 lg:grid-cols-4 mb-6">
      <div class="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
        <h4 class="text-title-md font-bold">{{ stats.activeSubscribers.toLocaleString() }}</h4>
        <span class="text-sm">Abonnés actifs</span>
      </div>
      <div class="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
        <h4 class="text-title-md font-bold">{{ stats.totalSubscribers.toLocaleString() }}</h4>
        <span class="text-sm">Total abonnés</span>
      </div>
      <div class="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
        <h4 class="text-title-md font-bold">{{ stats.recentSubscribers }}</h4>
        <span class="text-sm">Nouveaux (30j)</span>
      </div>
      <div class="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
        <h4 class="text-title-md font-bold">{{ stats.inactiveSubscribers }}</h4>
        <span class="text-sm">Désabonnés</span>
      </div>
    </div>

    <!-- Subscribers List -->
    <div v-if="!isLoading" class="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
      <div class="px-4 py-6 md:px-6 xl:px-7.5 flex justify-between items-center">
        <h3 class="text-xl font-bold">Liste des abonnés ({{ subscribers.length }})</h3>
        <button 
          @click="exportSubscribers"
          class="rounded bg-primary px-6 py-3 text-white hover:bg-opacity-90"
        >
          <i class="las la-download mr-2"></i>
          Exporter
        </button>
      </div>
      
      <div class="p-6">
        <div v-if="subscribers.length === 0" class="text-center py-12">
          <p class="text-gray-600">Aucun abonné pour le moment</p>
        </div>
        <div v-else class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b">
                <th class="text-left py-3 px-4">ID</th>
                <th class="text-left py-3 px-4">Email</th>
                <th class="text-left py-3 px-4">Date d'inscription</th>
              </tr>
            </thead>
            <tbody>
              <tr 
                v-for="subscriber in subscribers" 
                :key="subscriber.id"
                class="border-b last:border-0 hover:bg-gray-50"
              >
                <td class="py-3 px-4">{{ subscriber.id }}</td>
                <td class="py-3 px-4">{{ subscriber.email }}</td>
                <td class="py-3 px-4">{{ formatDate(subscriber.subscribedAt) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { newsletterService, type NewsletterSubscriber, type NewsletterStats } from '@/services/newsletter';

const subscribers = ref<NewsletterSubscriber[]>([]);
const stats = ref<NewsletterStats>({
  totalSubscribers: 0,
  activeSubscribers: 0,
  inactiveSubscribers: 0,
  recentSubscribers: 0
});
const isLoading = ref(true);

const loadData = async () => {
  try {
    isLoading.value = true;
    
    const [subscribersData, statsData] = await Promise.all([
      newsletterService.getSubscribers(),
      newsletterService.getStats()
    ]);
    
    subscribers.value = subscribersData.subscribers;
    stats.value = statsData;
  } catch (error) {
    console.error('Error loading newsletter data:', error);
    alert('Erreur lors du chargement des données');
  } finally {
    isLoading.value = false;
  }
};

const exportSubscribers = () => {
  // Create CSV content
  const csv = [
    ['ID', 'Email', 'Date d\'inscription'],
    ...subscribers.value.map(s => [s.id, s.email, formatDate(s.subscribedAt)])
  ].map(row => row.join(',')).join('\n');
  
  // Download CSV
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `newsletter-subscribers-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

onMounted(() => {
  loadData();
});
</script>
