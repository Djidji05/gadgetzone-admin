<template>
  <div class="p-6">
    <div class="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Personnalisation de l'Accueil</h1>
        <p class="text-gray-600 mt-1">Gérez les sections de la page d'accueil de votre site.</p>
      </div>
    </div>

    <!-- Tabs -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
      <div class="border-b border-gray-100 overflow-x-auto">
        <nav class="flex text-sm font-medium">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="currentTab = tab.id"
            class="px-5 py-4 whitespace-nowrap border-b-2 transition-colors duration-200"
            :class="[
              currentTab === tab.id
                ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            ]"
          >
            <i :class="[tab.icon, 'mr-2']"></i>
            {{ tab.name }}
          </button>
        </nav>
      </div>

      <div class="p-6">
        <KeepAlive>
          <component :is="currentTabComponent" />
        </KeepAlive>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, defineAsyncComponent } from 'vue';

// Async components to split code
const BannersManager = defineAsyncComponent(() => import('./components/BannersManager.vue'));
const TopDiscoveryManager = defineAsyncComponent(() => import('./components/TopDiscoveryManager.vue'));
const FeaturedProductsManager = defineAsyncComponent(() => import('./components/FeaturedProductsManager.vue'));
const WeatherPicksManager = defineAsyncComponent(() => import('./components/WeatherPicksManager.vue'));
const DealsManager = defineAsyncComponent(() => import('./components/DealsManager.vue'));
const PromotionsManager = defineAsyncComponent(() => import('./components/PromotionsManager.vue'));
const AnnouncementsManager = defineAsyncComponent(() => import('./components/AnnouncementsManager.vue'));
const AdsManager = defineAsyncComponent(() => import('./components/AdsManager.vue'));

const tabs = [
  { id: 'banners', name: 'Bannières', icon: 'fas fa-images' },
  { id: 'discovery', name: 'Top Découverte', icon: 'fas fa-compass' },
  { id: 'featured', name: 'Produits Vedettes', icon: 'fas fa-star' },
  { id: 'weather', name: 'Météo & Pratique', icon: 'fas fa-cloud-sun' },
  { id: 'deals', name: 'Offres', icon: 'fas fa-tags' },
  { id: 'ads', name: 'Annonces & Pubs', icon: 'fas fa-bullhorn' },
];

const currentTab = ref('banners');

const currentTabComponent = computed(() => {
  switch (currentTab.value) {
    case 'banners': return BannersManager;
    case 'discovery': return TopDiscoveryManager;
    case 'featured': return FeaturedProductsManager;
    case 'weather': return WeatherPicksManager;
    case 'deals': return DealsManager;
    case 'ads': return AdsManager;
    default: return null;
  }
});
</script>
