<template>
  <div class="overflow-hidden sm:rounded-2xl sm:border border-transparent sm:border-gray-200 sm:bg-white bg-transparent dark:bg-transparent sm:dark:bg-white/[0.03] px-4 pb-3 pt-4 sm:dark:border-gray-800 sm:px-6 h-full flex flex-col">
    <div class="flex flex-row items-center justify-between gap-4 mb-6">
      <div>
        <h3 class="text-lg font-semibold text-gray-800 dark:text-white/90">Actions Vendeurs</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Activités récentes des vendeurs
        </p>
      </div>

      <div class="flex items-center gap-3">
        <button
          @click="loadActions"
          class="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 focus:outline-none transition-colors"
          :disabled="isLoading"
        >
          <i :class="['las la-sync-alt text-base', { 'animate-spin': isLoading }]"></i>
        </button>
      </div>
    </div>

    <div v-if="isLoading && actions.length === 0" class="flex flex-1 items-center justify-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>

    <div v-else-if="error" class="text-center py-12 flex-1">
      <p class="text-red-500 text-sm"><i class="las la-exclamation-circle mr-1"></i>{{ error }}</p>
      <button @click="loadActions" class="mt-4 text-sm text-blue-600 hover:underline">Réessayer</button>
    </div>

    <div v-else-if="actions.length === 0" class="text-center py-12 flex-1 flex flex-col items-center justify-center">
      <div class="w-16 h-16 bg-gray-50 dark:bg-gray-800/50 rounded-full flex items-center justify-center mb-4">
        <i class="las la-history text-3xl text-gray-400"></i>
      </div>
      <p class="text-gray-500 dark:text-gray-400">Aucune activité récente</p>
    </div>

    <!-- Timeline of Actions -->
    <div v-else class="flex-1 overflow-y-auto custom-scrollbar pr-2 relative">
      <!-- Continuous vertical line -->
      <div class="absolute left-4 top-2 bottom-2 w-px bg-gray-200 dark:bg-gray-800" style="left: 17px;"></div>

      <div class="space-y-6 relative">
        <div v-for="(action, index) in actions" :key="action.id" class="relative pl-10">
          
          <!-- Timeline Icon Indicator -->
          <div 
            class="absolute left-0 top-1 w-9 h-9 rounded-full flex items-center justify-center ring-4 ring-white dark:ring-[#111827]"
            :class="getIconWrapperClass(action.color)"
          >
            <i :class="getIcon(action.actionType)" class="text-lg"></i>
          </div>

          <!-- Content -->
          <div class="bg-gray-50/50 dark:bg-gray-800/20 rounded-xl p-3 border border-gray-100 dark:border-gray-800/50 hover:bg-white dark:hover:bg-gray-800/50 transition-colors group cursor-pointer" @click="goToAction(action)">
            <div class="flex items-center justify-between mb-1">
              <span class="font-medium text-sm text-gray-900 dark:text-white">{{ action.vendorName }}</span>
              <span class="text-xs text-gray-500 flex items-center">
                <i class="las la-clock mr-1"></i> {{ timeAgo(action.timestamp) }}
              </span>
            </div>
            <p class="text-sm text-gray-600 dark:text-gray-300">{{ action.description }}</p>
            
            <div class="mt-2 text-xs flex items-center text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
              Voir les détails <i class="las la-arrow-right ml-1"></i>
            </div>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { statsService } from '@/services/api';

const router = useRouter();
const actions = ref<any[]>([]);
const isLoading = ref(true);
const error = ref<string | null>(null);

const timeAgo = (dateStr: string) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return `Il y a quelques secondes`;
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `Il y a ${diffInMinutes} min`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `Il y a ${diffInHours} h`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) return `Hier à ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  if (diffInDays < 7) return `Il y a ${diffInDays} jours`;

  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
  }).format(date);
};

const getIcon = (type: string) => {
  switch (type) {
    case 'delivered': return 'las la-box-open text-emerald-600 dark:text-emerald-400';
    case 'accepted': return 'las la-check-circle text-blue-600 dark:text-blue-400';
    case 'cancelled': return 'las la-times-circle text-red-600 dark:text-red-400';
    case 'dispute': return 'las la-comment-dots text-orange-600 dark:text-orange-400';
    case 'product': return 'las la-plus-square text-purple-600 dark:text-purple-400';
    case 'status': return 'las la-exchange-alt text-gray-600 dark:text-gray-400';
    default: return 'las la-bell text-gray-600 dark:text-gray-400';
  }
};

const getIconWrapperClass = (color: string) => {
  switch (color) {
    case 'green': return 'bg-emerald-50 dark:bg-emerald-500/10';
    case 'blue': return 'bg-blue-50 dark:bg-blue-500/10';
    case 'red': return 'bg-red-50 dark:bg-red-500/10';
    case 'orange': return 'bg-orange-50 dark:bg-orange-500/10';
    case 'purple': return 'bg-purple-50 dark:bg-purple-500/10';
    default: return 'bg-gray-100 dark:bg-gray-800';
  }
};

const goToAction = (action: any) => {
  if (action.link) {
    router.push(action.link);
  }
};

const loadActions = async () => {
  isLoading.value = true;
  error.value = null;
  try {
    const data = await statsService.getVendorActions(20);
    actions.value = data.actions || [];
  } catch (err: any) {
    console.error('Failed to load vendor actions:', err);
    error.value = "Impossible de charger l'historique.";
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  loadActions();
  // Optionnel: rafraîchissement automatique toutes les 2 minutes
  setInterval(() => {
    if (document.visibilityState === 'visible') {
      loadActions();
    }
  }, 120000);
});
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #e5e7eb;
  border-radius: 4px;
}
:deep(.dark) .custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #374151;
}
.custom-scrollbar:hover::-webkit-scrollbar-thumb {
  background-color: #d1d5db;
}
:deep(.dark) .custom-scrollbar:hover::-webkit-scrollbar-thumb {
  background-color: #4b5563;
}
</style>
