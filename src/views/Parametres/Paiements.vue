<template>
  <div class="mx-auto max-w-screen-xl p-4 md:p-6 2xl:p-10 pb-24">
    <!-- Header -->
    <div class="mb-8 flex flex-col gap-2">
      <h2 class="text-title-md2 font-bold text-black dark:text-white flex items-center gap-3">
        <CreditCard class="w-8 h-8 text-blue-600" />
        Configuration des Paiements
      </h2>
      <p class="text-gray-600 dark:text-gray-400">Gérez vos passerelles de paiement et les options de règlement disponibles pour vos clients.</p>
    </div>

    <div class="grid grid-cols-1 gap-8">
      <!-- Section: Méthodes Activées -->
      <div class="rounded-xl border border-stroke bg-white shadow-sm dark:border-strokedark dark:bg-boxdark overflow-hidden">
        <div class="border-b border-stroke px-7 py-4 dark:border-strokedark bg-gray-50/50 dark:bg-white/5">
          <h3 class="font-semibold text-black dark:text-white flex items-center gap-2">
            <LayoutList class="w-5 h-5 text-blue-600" />
            Méthodes de paiement actives
          </h3>
        </div>
        <div class="p-7">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div v-for="method in paymentMethods" :key="method.id" 
              class="flex items-center gap-4 p-4 rounded-xl border transition-all duration-200"
              :class="method.enabled ? 'border-blue-600/30 bg-blue-600/5 dark:bg-blue-600/10' : 'border-stroke bg-gray-50 dark:border-strokedark dark:bg-white/5 opacity-70'"
            >
              <div class="flex flex-1 items-center gap-4">
                <div class="w-12 h-12 flex items-center justify-center rounded-lg bg-white dark:bg-boxdark border border-stroke dark:border-strokedark shadow-sm shrink-0">
                  <component :is="method.icon" class="w-6 h-6 text-blue-600" />
                </div>
                <div class="min-w-0">
                  <h4 class="font-semibold text-black dark:text-white text-sm truncate">{{ method.name }}</h4>
                  <p class="text-xs text-gray-500 line-clamp-1 truncate">{{ method.description }}</p>
                </div>
              </div>
              <button 
                @click="method.enabled = !method.enabled"
                class="relative inline-flex h-6 w-6 items-center justify-center rounded-full border-2 transition-all focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 shrink-0 mr-4"
                :class="method.enabled ? 'bg-blue-600 border-blue-600' : 'bg-transparent border-gray-300 dark:border-gray-600'"
              >
                <div class="w-2 h-2 rounded-full bg-white transition-opacity" :class="method.enabled ? 'opacity-100' : 'opacity-0'" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Section: Configuration MonCash -->
        <div class="rounded-xl border border-stroke bg-white shadow-sm dark:border-strokedark dark:bg-boxdark overflow-hidden">
          <div class="border-b border-stroke px-7 py-4 dark:border-strokedark bg-gray-50/50 dark:bg-white/5">
            <h3 class="font-semibold text-black dark:text-white flex items-center gap-2">
              <Zap class="w-5 h-5 text-[#ff0000]" />
              Configuration MonCash
            </h3>
          </div>
          <div class="p-7 space-y-5">
            <div>
              <label class="mb-2 block text-sm font-medium text-black dark:text-white">Client ID</label>
              <input type="text" v-model="settings.moncash_client_id" placeholder="MC_..." class="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-5 outline-none transition focus:border-blue-600 dark:border-form-strokedark dark:bg-form-input" />
            </div>
            <div>
              <label class="mb-2 block text-sm font-medium text-black dark:text-white">Client Secret</label>
              <input type="password" v-model="settings.moncash_client_secret" placeholder="••••••••" class="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-5 outline-none transition focus:border-blue-600 dark:border-form-strokedark dark:bg-form-input" />
            </div>
            <div class="flex items-center gap-3 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-100 dark:border-yellow-900/30">
              <input type="checkbox" id="moncash-sandbox" v-model="settings.moncash_sandbox" :true-value="'true'" :false-value="'false'" class="w-4 h-4 rounded text-blue-600 focus:ring-blue-600" />
              <label for="moncash-sandbox" class="text-sm text-yellow-800 dark:text-yellow-200 font-medium">Activer le mode Sandbox (Tests uniquement)</label>
            </div>
          </div>
        </div>

        <!-- Section: Natcash & Devise -->
        <div class="space-y-8">
          <div class="rounded-xl border border-stroke bg-white shadow-sm dark:border-strokedark dark:bg-boxdark overflow-hidden">
            <div class="border-b border-stroke px-7 py-4 dark:border-strokedark bg-gray-50/50 dark:bg-white/5">
              <h3 class="font-semibold text-black dark:text-white flex items-center gap-2">
                <Coins class="w-5 h-5 text-blue-600" />
                Devise & Régionalisation
              </h3>
            </div>
            <div class="p-7 space-y-5">
              <div>
                <label class="mb-2 block text-sm font-medium text-black dark:text-white">Devise par défaut</label>
                <select v-model="settings.default_currency" class="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-5 outline-none transition focus:border-blue-600 dark:border-form-strokedark dark:bg-form-input">
                  <option value="HTG">HTG - Gourde Haïtienne</option>
                  <option value="USD">USD - Dollar Américain</option>
                </select>
              </div>
              <div class="flex items-center gap-3">
                <input type="checkbox" id="auto-convert" class="w-4 h-4 rounded text-blue-600 focus:ring-blue-600" checked />
                <label for="auto-convert" class="text-sm text-gray-600 dark:text-gray-400">Appliquer les taux de change automatiques (BNC/BRH)</label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Sticky Action Bar -->
    <div 
      :class="[
        'fixed bottom-0 left-0 right-0 z-40 bg-white/80 dark:bg-boxdark/80 backdrop-blur-md border-t border-stroke dark:border-strokedark p-4 transition-all duration-300',
        isSidebarExpanded || isSidebarHovered ? 'lg:left-[290px]' : 'lg:left-[90px]'
      ]"
    >
      <div class="mx-auto max-w-screen-xl flex items-center justify-between">
        <div class="hidden md:block">
          <p class="text-sm text-gray-500">Mettre à jour les passerelles de paiement affecte l'encaissement en temps réel.</p>
        </div>
        <div class="flex items-center gap-4 w-full md:w-auto">
          <button 
            @click="loadSettings"
            class="flex-1 md:flex-none justify-center rounded-lg border border-stroke py-2.5 px-6 font-medium text-black hover:bg-gray-50 dark:border-strokedark dark:text-white dark:hover:bg-white/5 transition-colors"
          >
            Réinitialiser
          </button>
          <button
            @click="saveSettings"
            :disabled="loading"
            class="flex-1 md:flex-none justify-center flex items-center gap-2 rounded-lg bg-blue-600 px-8 py-2.5 font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-all shadow-lg shadow-blue-500/20"
          >
            <Save v-if="!loading" class="w-4 h-4" />
            <span v-if="loading" class="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
            {{ loading ? 'Enregistrement...' : 'Enregistrer' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, markRaw, computed, type Component } from 'vue';
import { useUIStore } from '@/stores/ui';
import { useSidebar } from '@/composables/useSidebar';
import { settingsService } from '@/services/api';
import { 
  CreditCard, 
  LayoutList, 
  Zap, 
  Coins, 
  Save, 
  Smartphone, 
  Landmark, 
  Truck 
} from 'lucide-vue-next';

interface PaymentMethod {
  id: number;
  name: string;
  description: string;
  enabled: boolean;
  icon: Component;
}

interface PaymentSettings {
  moncash_client_id: string;
  moncash_client_secret: string;
  moncash_sandbox: string;
  natcash_enabled: string;
  bank_transfer_enabled: string;
  cod_enabled: string;
  default_currency: string;
}

const uiStore = useUIStore();
const sidebar = useSidebar();
const isSidebarExpanded = computed(() => sidebar.isExpanded.value);
const isSidebarHovered = computed(() => sidebar.isHovered.value);
const loading = ref(false);

const paymentMethods = ref<PaymentMethod[]>([
  { id: 1, name: 'MonCash', description: 'Paiement mobile Digicel', enabled: true, icon: markRaw(Smartphone) },
  { id: 2, name: 'Natcash', description: 'Paiement mobile Natcom', enabled: false, icon: markRaw(Smartphone) },
  { id: 3, name: 'Virement', description: 'Transfert bancaire Haïti', enabled: false, icon: markRaw(Landmark) },
  { id: 4, name: 'Livraison', description: 'Paiement à la réception', enabled: true, icon: markRaw(Truck) }
]);

const settings = ref<PaymentSettings>({
  moncash_client_id: '',
  moncash_client_secret: '',
  moncash_sandbox: 'true',
  natcash_enabled: 'false',
  bank_transfer_enabled: 'false',
  cod_enabled: 'true',
  default_currency: 'HTG'
});

const loadSettings = async () => {
  try {
    loading.value = true;
    const data = await settingsService.get('payment');
    settings.value = {
      moncash_client_id: data.moncash_client_id || '',
      moncash_client_secret: data.moncash_client_secret || '',
      moncash_sandbox: String(data.moncash_sandbox || 'true'),
      natcash_enabled: String(data.natcash_enabled || 'false'),
      bank_transfer_enabled: String(data.bank_transfer_enabled || 'false'),
      cod_enabled: String(data.cod_enabled || 'true'),
      default_currency: data.default_currency || 'HTG'
    };
    
    // Sync payment methods enabled state with settings
    paymentMethods.value[1].enabled = settings.value.natcash_enabled === 'true';
    paymentMethods.value[2].enabled = settings.value.bank_transfer_enabled === 'true';
    paymentMethods.value[3].enabled = settings.value.cod_enabled === 'true';
  } catch (error) {
    console.error('Error loading payment settings:', error);
    uiStore.addToast('Erreur lors du chargement des paramètres', 'error');
  } finally {
    loading.value = false;
  }
};

// Update settings when toggles are clicked
watch(() => paymentMethods.value, (newVal) => {
  settings.value.natcash_enabled = newVal[1].enabled ? 'true' : 'false';
  settings.value.bank_transfer_enabled = newVal[2].enabled ? 'true' : 'false';
  settings.value.cod_enabled = newVal[3].enabled ? 'true' : 'false';
}, { deep: true });

const saveSettings = async () => {
  try {
    loading.value = true;
    await settingsService.update('payment', settings.value);
    uiStore.addToast('Paramètres de paiement enregistrés', 'success');
  } catch (error) {
    console.error('Error saving payment settings:', error);
    uiStore.addToast('Erreur lors de la sauvegarde des paramètres', 'error');
  } finally {
    loading.value = false;
  }
};

onMounted(loadSettings);
</script>
