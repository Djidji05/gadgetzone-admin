<template>
  <div class="mx-auto max-w-screen-xl p-4 md:p-6 2xl:p-10 pb-24">
    <!-- Header -->
    <div class="mb-8 flex flex-col gap-2">
      <h2 class="text-title-md2 font-bold text-black dark:text-white flex items-center gap-3">
        <Globe class="w-8 h-8 text-blue-600" />
        Paramètres Généraux
      </h2>
      <p class="text-gray-600 dark:text-gray-400">Gérez les informations de base et les préférences régionales de votre plateforme.</p>
    </div>

    <div class="grid grid-cols-1 gap-8">
      <!-- Section: Informations du Site -->
      <div class="rounded-xl border border-stroke bg-white shadow-sm dark:border-strokedark dark:bg-boxdark overflow-hidden">
        <div class="border-b border-stroke px-7 py-4 dark:border-strokedark bg-gray-50/50 dark:bg-white/5">
          <h3 class="font-semibold text-black dark:text-white flex items-center gap-2">
            <Globe class="w-5 h-5 text-blue-600" />
            Identité du Site
          </h3>
        </div>
        <div class="p-7">
          <div class="flex flex-col md:flex-row gap-8 items-start mb-8 pb-8 border-b border-stroke dark:border-strokedark">
            <div class="w-20 h-20 rounded-xl border-2 border-dashed border-stroke dark:border-strokedark flex items-center justify-center overflow-hidden bg-gray-50 dark:bg-white/5 shrink-0">
              <img v-if="settings.site_logo" :src="getImageUrl(settings.site_logo)" class="w-full h-full object-contain" />
              <div v-else class="text-gray-400 flex flex-col items-center gap-1">
                <Image class="w-8 h-8" />
                <span class="text-[10px]">Logo</span>
              </div>
            </div>
            <div class="flex-1 w-full space-y-4">
              <div>
                <label class="mb-2.5 block text-sm font-medium text-black dark:text-white">Logo de la plateforme</label>
                <div class="flex items-center gap-4">
                  <input 
                    type="file" 
                    ref="fileInput"
                    class="hidden" 
                    accept="image/*"
                    @change="handleLogoUpload"
                  />
                  <button 
                    type="button"
                    @click="triggerFileUpload"
                    :disabled="uploading"
                    class="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-stroke dark:border-strokedark hover:bg-gray-50 dark:hover:bg-white/5 transition-all text-sm font-medium"
                  >
                    <Upload v-if="!uploading" class="w-4 h-4" />
                    <span v-else class="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></span>
                    {{ uploading ? 'Téléchargement...' : 'Choisir un fichier' }}
                  </button>
                  <button 
                    v-if="settings.site_logo"
                    type="button"
                    @click="settings.site_logo = ''"
                    class="text-sm text-red-500 hover:text-red-600 font-medium"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
              <p class="text-xs text-gray-500">Formats acceptés : PNG, SVG, JPG. Taille max : 2Mo. Arrière-plan transparent recommandé.</p>
            </div>
          </div>

          <div class="space-y-6">
            <div>
              <label class="mb-2.5 block text-sm font-medium text-black dark:text-white">Nom du site</label>
              <input 
                type="text" 
                v-model="settings.site_name" 
                placeholder="HTFasil" 
                class="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-5 outline-none transition focus:border-blue-600 dark:border-form-strokedark dark:bg-form-input" 
              />
            </div>

            <div>
              <label class="mb-2.5 block text-sm font-medium text-black dark:text-white">URL du site</label>
              <input 
                type="url" 
                v-model="settings.site_url" 
                placeholder="https://htfasil.ht" 
                class="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-5 outline-none transition focus:border-blue-600 dark:border-form-strokedark dark:bg-form-input" 
              />
            </div>

            <div>
              <label class="mb-2.5 block text-sm font-medium text-black dark:text-white">Description du site</label>
              <textarea 
                rows="3"
                v-model="settings.site_description" 
                placeholder="La meilleure plateforme de gadgets..." 
                class="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-5 outline-none transition focus:border-blue-600 dark:border-form-strokedark dark:bg-form-input"
              ></textarea>
            </div>

            <div>
              <label class="mb-2.5 block text-sm font-medium text-black dark:text-white">Email de contact</label>
              <input 
                type="email" 
                v-model="settings.contact_email" 
                placeholder="contact@htfasil.ht" 
                class="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-5 outline-none transition focus:border-blue-600 dark:border-form-strokedark dark:bg-form-input" 
              />
            </div>

            <div>
              <label class="mb-2.5 block text-sm font-medium text-black dark:text-white flex items-center gap-2">
                Lien du Groupe VIP WhatsApp
              </label>
              <input 
                type="url" 
                v-model="settings.whatsapp_vip_link" 
                placeholder="https://chat.whatsapp.com/votre_code_ici" 
                class="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-5 outline-none transition focus:border-blue-600 dark:border-form-strokedark dark:bg-form-input" 
              />
              <p class="text-[11px] text-gray-500 mt-1">Sera affiché aux vendeurs authentifiés dans l'onglet Communauté.</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Section: Préférences Régionales -->
      <div class="rounded-xl border border-stroke bg-white shadow-sm dark:border-strokedark dark:bg-boxdark overflow-hidden">
        <div class="border-b border-stroke px-7 py-4 dark:border-strokedark bg-gray-50/50 dark:bg-white/5">
          <h3 class="font-semibold text-black dark:text-white flex items-center gap-2">
            <Navigation class="w-5 h-5 text-blue-600" />
            Préférences Régionales
          </h3>
        </div>
        <div class="p-7">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label class="mb-2.5 block text-sm font-medium text-black dark:text-white">Fuseau horaire</label>
              <select v-model="settings.timezone" class="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-5 outline-none transition focus:border-blue-600 dark:border-form-strokedark dark:bg-form-input">
                <option value="America/Port-au-Prince">Port-au-Prince (EST)</option>
                <option value="Europe/Paris">Paris (CET)</option>
                <option value="UTC">UTC</option>
              </select>
            </div>

            <div>
              <label class="mb-2.5 block text-sm font-medium text-black dark:text-white">Devise par défaut</label>
              <select v-model="settings.currency" class="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-5 outline-none transition focus:border-blue-600 dark:border-form-strokedark dark:bg-form-input">
                <option value="HTG">Gourde (HTG)</option>
                <option value="USD">Dollar (USD)</option>
                <option value="EUR">Euro (EUR)</option>
              </select>
            </div>

            <div>
              <label class="mb-2.5 block text-sm font-medium text-black dark:text-white">Langue par défaut</label>
              <select v-model="settings.language" class="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-5 outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input">
                <option value="fr">Français</option>
                <option value="en">English</option>
                <option value="ht">Kreyòl</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- Section: Maintenance -->
      <div class="rounded-xl border border-stroke bg-white shadow-sm dark:border-strokedark dark:bg-boxdark overflow-hidden">
        <div class="border-b border-stroke px-7 py-4 dark:border-strokedark bg-gray-50/50 dark:bg-white/5 flex items-center justify-between">
          <h3 class="font-semibold text-black dark:text-white flex items-center gap-2">
            <Settings2 class="w-5 h-5 text-blue-600" />
            Mode Maintenance
          </h3>
          <span 
            class="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider"
            :class="settings.maintenance_mode === 'true' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'"
          >
            {{ settings.maintenance_mode === 'true' ? 'Actif' : 'Désactivé' }}
          </span>
        </div>
        <div class="p-7">
          <div class="flex items-center justify-between py-4 pl-4 pr-24 bg-gray-50 dark:bg-white/5 rounded-xl border border-stroke dark:border-strokedark">
            <div class="flex-1 min-w-0 mr-4">
              <h4 class="font-medium text-black dark:text-white mb-1">Activer le mode maintenance</h4>
              <p class="text-sm text-gray-500">Quand activé, seul les administrateurs peuvent accéder au site public. Les visiteurs verront une page de maintenance.</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer shrink-0">
              <input 
                type="checkbox" 
                class="sr-only peer"
                :checked="settings.maintenance_mode === 'true'"
                @change="settings.maintenance_mode = settings.maintenance_mode === 'true' ? 'false' : 'true'"
              >
              <div 
                class="w-14 h-7 peer-focus:outline-none rounded-full transition-all after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-gray-600 shadow-inner"
                :class="settings.maintenance_mode === 'true' ? 'bg-orange-600 after:translate-x-full after:border-white' : 'bg-gray-300 dark:bg-gray-700'"
              ></div>
            </label>
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
          <p class="text-sm text-gray-500">Ces paramètres affectent l'ensemble de la plateforme pour les clients et vendeurs.</p>
        </div>
        <div class="flex items-center gap-4 w-full md:w-auto">
          <button 
            @click="loadSettings"
            class="flex-1 md:flex-none justify-center rounded-lg border border-stroke py-2.5 px-6 font-medium text-black hover:bg-gray-50 dark:border-strokedark dark:text-white dark:hover:bg-white/5 transition-colors"
          >
            Annuler
          </button>
          <button
            @click="saveSettings"
            :disabled="loading"
            class="flex-1 md:flex-none justify-center flex items-center gap-2 rounded-lg bg-blue-600 px-8 py-2.5 font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-all shadow-lg shadow-blue-500/20"
          >
            <Save v-if="!loading" class="w-4 h-4" />
            <span v-if="loading" class="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
            {{ loading ? 'Enregistrement...' : 'Enregistrer les modifications' }}
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
import { useSettingsStore } from '@/stores/settings';
import { settingsService, uploadService } from '@/services/api';
import { useI18n } from 'vue-i18n';
import { Globe, Navigation, Save, Image, Upload, Settings2 } from 'lucide-vue-next';

const uiStore = useUIStore();
const sidebar = useSidebar();
const settingsStore = useSettingsStore();
const isSidebarExpanded = computed(() => sidebar.isExpanded.value);
const isSidebarHovered = computed(() => sidebar.isHovered.value);
const loading = ref(false);
const uploading = ref(false);
const fileInput = ref<HTMLInputElement | null>(null);

const getImageUrl = (path: string) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3003/api').replace('/api', '');
  return `${baseUrl}${path}`;
};

const settings = ref({
  site_name: '',
  site_logo: '',
  site_url: '',
  contact_email: '',
  site_description: '',
  timezone: 'America/Port-au-Prince',
  currency: 'HTG',
  language: 'fr',
  maintenance_mode: 'false'
});

const loadSettings = async () => {
  try {
    loading.value = true;
    const data = await settingsService.get('general');
    settings.value = {
      site_name: data.site_name || '',
      site_logo: data.site_logo || '',
      site_url: data.site_url || '',
      contact_email: data.contact_email || '',
      site_description: data.site_description || '',
      timezone: data.timezone || 'America/Port-au-Prince',
      currency: data.currency || 'HTG',
      language: data.language || 'fr',
      maintenance_mode: data.maintenance_mode || 'false'
    };
  } catch (error) {
    console.error('Error loading general settings:', error);
    uiStore.addToast('Erreur lors du chargement des paramètres', 'error');
  } finally {
    loading.value = false;
  }
};

const triggerFileUpload = () => {
  fileInput.value?.click();
};

const handleLogoUpload = async (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (!input.files || input.files.length === 0) return;

  try {
    uploading.value = true;
    const response = await uploadService.upload([input.files[0]]);
    if (response.urls && response.urls.length > 0) {
      settings.value.site_logo = response.urls[0];
      uiStore.addToast('Logo téléversé avec succès', 'success');
    }
  } catch (error) {
    console.error('Error uploading logo:', error);
    uiStore.addToast('Erreur lors du téléversement du logo', 'error');
  } finally {
    uploading.value = false;
    if (fileInput.value) fileInput.value.value = '';
  }
};

const saveSettings = async () => {
  try {
    loading.value = true;
    await settingsService.update('general', settings.value);
    await settingsStore.fetchGeneralSettings();
    
    // Sync i18n locale
    const { locale } = useI18n();
    locale.value = settings.value.language;
    localStorage.setItem('userLanguage', settings.value.language);
    
    uiStore.addToast('Paramètres enregistrés avec succès', 'success');
  } catch (error) {
    console.error('Error saving general settings:', error);
    uiStore.addToast('Erreur lors de la sauvegarde des paramètres', 'error');
  } finally {
    loading.value = false;
  }
};

onMounted(loadSettings);
</script>
