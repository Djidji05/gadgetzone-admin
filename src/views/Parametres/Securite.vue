<template>
  <div class="mx-auto max-w-screen-xl p-4 md:p-6 2xl:p-10 pb-24">
    <!-- Header -->
    <div class="mb-8 flex flex-col gap-2">
      <h2 class="text-title-md2 font-bold text-black dark:text-white flex items-center gap-3">
        <ShieldCheck class="w-8 h-8 text-blue-600" />
        Sécurité & Accès
      </h2>
      <p class="text-gray-600 dark:text-gray-400">Configurez les protocoles de protection et les politiques d'accès de votre plateforme.</p>
    </div>

    <div class="grid grid-cols-1 gap-8">
      <!-- Section: Contrôle d'Accès -->
      <div class="rounded-xl border border-stroke bg-white shadow-sm dark:border-strokedark dark:bg-boxdark overflow-hidden">
        <div class="border-b border-stroke px-7 py-4 dark:border-strokedark bg-gray-50/50 dark:bg-white/5">
          <h3 class="font-semibold text-black dark:text-white flex items-center gap-2">
            <Fingerprint class="w-5 h-5 text-blue-600" />
            Contrôle d'Accès
          </h3>
        </div>
        <div class="p-7 space-y-6">
          <div class="flex items-center gap-4 p-4 rounded-lg bg-gray-50 dark:bg-white/5 border border-stroke dark:border-strokedark">
            <div class="flex-1">
              <p class="font-semibold text-black dark:text-white">Authentification à deux facteurs (2FA)</p>
              <p class="text-sm text-gray-500 line-clamp-2">Exiger une vérification supplémentaire pour tous les comptes administrateurs.</p>
            </div>
            <label class="relative inline-flex cursor-pointer items-center shrink-0 mr-4">
              <input 
                type="checkbox" 
                class="peer sr-only" 
                v-model="settings.two_factor_enabled"
                :true-value="'true'"
                :false-value="'false'"
              />
              <div class="h-6 w-6 rounded-full border-2 border-gray-300 dark:border-gray-600 transition-all peer-checked:bg-blue-600 peer-checked:border-blue-600 flex items-center justify-center">
                <div class="w-2 h-2 rounded-full bg-white opacity-0 transition-opacity peer-checked:opacity-100"></div>
              </div>
            </label>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="mb-2.5 block text-sm font-medium text-black dark:text-white">Expiration de session (minutes)</label>
              <div class="relative">
                <Clock class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="number"
                  v-model="settings.session_timeout"
                  class="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-3 pl-12 pr-5 font-medium outline-none transition focus:border-blue-600 active:border-blue-600 dark:border-form-strokedark dark:bg-form-input dark:focus:border-blue-600"
                />
              </div>
              <p class="mt-1.5 text-xs text-gray-500">Déconnexion automatique après cette durée d'inactivité.</p>
            </div>

            <div>
              <label class="mb-2.5 block text-sm font-medium text-black dark:text-white">Tentatives de connexion maximales</label>
              <div class="relative">
                <ShieldCheck class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="number"
                  v-model="settings.max_login_attempts"
                  class="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-3 pl-12 pr-5 font-medium outline-none transition focus:border-blue-600 active:border-blue-600 dark:border-form-strokedark dark:bg-form-input dark:focus:border-blue-600"
                />
              </div>
              <p class="mt-1.5 text-xs text-gray-500">Nombre d'échecs autorisés avant le blocage temporaire.</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Section: Politique de Mot de Passe -->
      <div class="rounded-xl border border-stroke bg-white shadow-sm dark:border-strokedark dark:bg-boxdark overflow-hidden">
        <div class="border-b border-stroke px-7 py-4 dark:border-strokedark bg-gray-50/50 dark:bg-white/5">
          <h3 class="font-semibold text-black dark:text-white flex items-center gap-2">
            <Key class="w-5 h-5 text-blue-600" />
            Politique de complexité
          </h3>
        </div>
        <div class="p-7">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label class="mb-2.5 block text-sm font-medium text-black dark:text-white">Longueur minimale</label>
              <input
                type="number"
                v-model="settings.min_password_length"
                class="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-blue-600 dark:border-form-strokedark dark:bg-form-input"
              />
            </div>
            
            <div class="space-y-4">
              <label class="block text-sm font-medium text-black dark:text-white mb-4">Exigences de caractères</label>
              <label class="flex items-center gap-3 cursor-pointer group">
                <input type="checkbox" v-model="settings.require_uppercase" :true-value="'true'" :false-value="'false'" class="w-5 h-5 rounded border-stroke text-blue-600 focus:ring-blue-600 transition-all cursor-pointer" />
                <span class="text-sm text-gray-600 dark:text-gray-400 group-hover:text-black dark:group-hover:text-white transition-colors">Au moins une majuscule</span>
              </label>
              <label class="flex items-center gap-3 cursor-pointer group">
                <input type="checkbox" v-model="settings.require_numbers" :true-value="'true'" :false-value="'false'" class="w-5 h-5 rounded border-stroke text-blue-600 focus:ring-blue-600 transition-all cursor-pointer" />
                <span class="text-sm text-gray-600 dark:text-gray-400 group-hover:text-black dark:group-hover:text-white transition-colors">Au moins un chiffre</span>
              </label>
              <label class="flex items-center gap-3 cursor-pointer group">
                <input type="checkbox" v-model="settings.require_special_chars" :true-value="'true'" :false-value="'false'" class="w-5 h-5 rounded border-stroke text-blue-600 focus:ring-blue-600 transition-all cursor-pointer" />
                <span class="text-sm text-gray-600 dark:text-gray-400 group-hover:text-black dark:group-hover:text-white transition-colors">Au moins un caractère spécial</span>
              </label>
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
          <p class="text-sm text-gray-500">Les politiques de sécurité s'appliquent lors de la prochaine connexion/création de compte.</p>
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
            {{ loading ? 'Mise à jour...' : 'Mettre à jour la sécurité' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useUIStore } from '@/stores/ui';
import { useSidebar } from '@/composables/useSidebar';
import { settingsService } from '@/services/api';
import { ShieldCheck, Fingerprint, Clock, Key, Save } from 'lucide-vue-next';

const uiStore = useUIStore();
const sidebar = useSidebar();
const isSidebarExpanded = computed(() => sidebar.isExpanded.value);
const isSidebarHovered = computed(() => sidebar.isHovered.value);
const loading = ref(false);

const settings = ref({
  two_factor_enabled: 'false',
  session_timeout: '60',
  min_password_length: '8',
  require_uppercase: 'true',
  require_numbers: 'true',
  require_special_chars: 'false',
  max_login_attempts: '5'
});

const loadSettings = async () => {
  try {
    loading.value = true;
    const data = await settingsService.get('security');
    settings.value = {
      two_factor_enabled: String(data.two_factor_enabled || 'false'),
      session_timeout: data.session_timeout || '60',
      min_password_length: data.min_password_length || '8',
      require_uppercase: String(data.require_uppercase || 'true'),
      require_numbers: String(data.require_numbers || 'true'),
      require_special_chars: String(data.require_special_chars || 'false'),
      max_login_attempts: data.max_login_attempts || '5'
    };
  } catch (error) {
    console.error('Error loading security settings:', error);
    uiStore.addToast('Erreur lors du chargement des paramètres', 'error');
  } finally {
    loading.value = false;
  }
};

const saveSettings = async () => {
  try {
    loading.value = true;
    await settingsService.update('security', settings.value);
    uiStore.addToast('Paramètres de sécurité enregistrés', 'success');
  } catch (error) {
    console.error('Error saving security settings:', error);
    uiStore.addToast('Erreur lors de la sauvegarde des paramètres', 'error');
  } finally {
    loading.value = false;
  }
};

onMounted(loadSettings);
</script>
