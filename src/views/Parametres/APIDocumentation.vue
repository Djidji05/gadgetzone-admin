<template>
  <div class="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
    <div class="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <h2 class="text-title-md2 font-bold text-black dark:text-white">
        Documentation API & État du Système
      </h2>
      <button 
        @click="refreshHealth"
        class="flex items-center gap-2 rounded bg-primary px-4 py-2 font-medium text-white hover:bg-opacity-90"
      >
        <component :is="RefreshCwIcon" :class="{'animate-spin': loading}" class="h-4 w-4" />
        Actualiser
      </button>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 md:gap-6 2xl:gap-7.5 mb-6">
      <div class="rounded-sm border border-stroke bg-white px-7.5 py-6 shadow-default dark:border-strokedark dark:bg-boxdark">
        <div class="flex items-center justify-between">
          <div class="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4">
            <component :is="ActivityIcon" class="fill-primary dark:fill-white h-6 w-6" />
          </div>
          <span :class="health?.status === 'OK' ? 'text-meta-3' : 'text-meta-1'" class="text-sm font-medium">
            {{ health?.status || 'Inconnu' }}
          </span>
        </div>
        <div class="mt-4 flex items-end justify-between">
          <div>
            <h4 class="text-title-md font-bold text-black dark:text-white">Statut API</h4>
            <p class="text-sm font-medium">Temps de réponse : {{ ping }}ms</p>
          </div>
        </div>
      </div>

      <div class="rounded-sm border border-stroke bg-white px-7.5 py-6 shadow-default dark:border-strokedark dark:bg-boxdark">
        <div class="flex items-center justify-between">
          <div class="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4">
            <component :is="CpuIcon" class="fill-primary dark:fill-white h-6 w-6" />
          </div>
        </div>
        <div class="mt-4 flex items-end justify-between">
          <div>
            <h4 class="text-title-md font-bold text-black dark:text-white">Uptime</h4>
            <p class="text-sm font-medium">{{ formatUptime(health?.uptime) }}</p>
          </div>
        </div>
      </div>

      <div class="rounded-sm border border-stroke bg-white px-7.5 py-6 shadow-default dark:border-strokedark dark:bg-boxdark">
        <div class="flex items-center justify-between">
          <div class="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4">
            <component :is="DatabaseIcon" class="fill-primary dark:fill-white h-6 w-6" />
          </div>
        </div>
        <div class="mt-4 flex items-end justify-between">
          <div>
            <h4 class="text-title-md font-bold text-black dark:text-white">Mémoire RSS</h4>
            <p class="text-sm font-medium">{{ formatBytes(health?.memory?.rss) }}</p>
          </div>
        </div>
      </div>

      <div class="rounded-sm border border-stroke bg-white px-7.5 py-6 shadow-default dark:border-strokedark dark:bg-boxdark">
        <div class="flex items-center justify-between">
          <div class="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4">
            <component :is="ServerIcon" class="fill-primary dark:fill-white h-6 w-6" />
          </div>
        </div>
        <div class="mt-4 flex items-end justify-between">
          <div>
            <h4 class="text-title-md font-bold text-black dark:text-white">Node Version</h4>
            <p class="text-sm font-medium">{{ health?.nodeVersion }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Technical Info -->
    <div class="flex flex-col gap-6 lg:flex-row lg:gap-8">
      <!-- endpoints info -->
      <div class="w-full lg:w-2/3">
        <div class="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <div class="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
            <h3 class="font-medium text-black dark:text-white font-bold">Points de terminaison API (Base URL: /api)</h3>
          </div>
          <div class="p-6">
            <div class="overflow-x-auto">
              <table class="w-full table-auto">
                <thead>
                  <tr class="bg-gray-2 text-left dark:bg-meta-4">
                    <th class="py-4 px-4 font-medium text-black dark:text-white">Module</th>
                    <th class="py-4 px-4 font-medium text-black dark:text-white">Endpoint</th>
                    <th class="py-4 px-4 font-medium text-black dark:text-white">Description</th>
                    <th class="py-4 px-4 font-medium text-black dark:text-white">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="endpoint in endpoints" :key="endpoint.path" class="border-b border-[#eee] dark:border-strokedark">
                    <td class="py-5 px-4"><p class="text-black dark:text-white">{{ endpoint.module }}</p></td>
                    <td class="py-5 px-4">
                      <code class="rounded bg-gray-100 px-2 py-1 text-xs text-primary dark:bg-gray-800">{{ endpoint.path }}</code>
                    </td>
                    <td class="py-5 px-4"><p class="text-sm">{{ endpoint.description }}</p></td>
                    <td class="py-5 px-4">
                      <span class="inline-flex rounded-full bg-success bg-opacity-10 py-1 px-3 text-sm font-medium text-success">
                        Actif
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- Config info -->
      <div class="w-full lg:w-1/3">
        <div class="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark h-full">
          <div class="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
            <h3 class="font-medium text-black dark:text-white font-bold">Configuration Serveur</h3>
          </div>
          <div class="p-6 space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-500">Plateforme</label>
              <p class="text-black dark:text-white">{{ health?.platform || 'windows' }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-500">Heure Serveur</label>
              <p class="text-black dark:text-white">{{ formatTimestamp(health?.timestamp) }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-500">Heap Total</label>
              <p class="text-black dark:text-white">{{ formatBytes(health?.memory?.heapTotal) }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-500">Heap Utilisé</label>
              <div class="mt-1 w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                <div class="bg-primary h-2.5 rounded-full" :style="{ width: heapPercentage + '%' }"></div>
              </div>
              <p class="mt-1 text-xs text-right">{{ heapPercentage }}%</p>
            </div>
            
            <div class="mt-8 border-t border-stroke pt-4 dark:border-strokedark">
              <h4 class="font-bold text-sm mb-2">Documentation Externe</h4>
              <a href="http://localhost:3003/api-docs" target="_blank" class="text-primary hover:underline flex items-center gap-2">
                Swagger UI <component :is="ExternalLinkIcon" class="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { healthService } from '@/services/api';
import { 
  Activity as ActivityIcon, 
  Cpu as CpuIcon, 
  Database as DatabaseIcon, 
  Server as ServerIcon,
  RefreshCw as RefreshCwIcon,
  ExternalLink as ExternalLinkIcon
} from 'lucide-vue-next';

const health = ref<any>(null);
const loading = ref(false);
const ping = ref(0);

const endpoints = [
  { module: 'Auth', path: '/auth', description: 'Login, Register, Profile' },
  { module: 'Produits', path: '/products', description: 'Gestion complète du catalogue' },
  { module: 'Commandes', path: '/orders', description: 'Suivi et mise à jour des ventes' },
  { module: 'Clients', path: '/clients', description: 'Gestion du fichier client' },
  { module: 'Vendeurs', path: '/vendors', description: 'Portail marketplace' },
  { module: 'Marketing', path: '/marketing', description: 'Campagnes et promos' },
  { module: 'Roles', path: '/roles', description: 'Gestion RBAC' }
];

const heapPercentage = computed(() => {
  if (!health.value?.memory) return 0;
  return Math.round((health.value.memory.heapUsed / health.value.memory.heapTotal) * 100);
});

const refreshHealth = async () => {
  loading.value = true;
  const start = Date.now();
  try {
    health.value = await healthService.checkHealth();
    ping.value = Date.now() - start;
  } catch (error) {
    console.error('Failed to fetch health data:', error);
  } finally {
    loading.value = false;
  }
};

const formatBytes = (bytes: number) => {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const formatUptime = (seconds: number) => {
  if (!seconds) return 'N/A';
  const d = Math.floor(seconds / (3600 * 24));
  const h = Math.floor(seconds % (3600 * 24) / 3600);
  const m = Math.floor(seconds % 3600 / 60);
  return `${d}d ${h}h ${m}m`;
};

const formatTimestamp = (ts: string) => {
  if (!ts) return 'N/A';
  return new Date(ts).toLocaleString();
};

onMounted(() => {
  refreshHealth();
});
</script>
