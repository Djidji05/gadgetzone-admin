<template>
  <div class="mx-auto max-w-screen-xl p-4 md:p-6 2xl:p-10 pb-24">
    <!-- Header -->
    <div class="mb-8 flex flex-col gap-2">
      <h2 class="text-title-md2 font-bold text-black dark:text-white flex items-center gap-3">
        <Mail class="w-8 h-8 text-blue-600" />
        Configuration Email
      </h2>
      <p class="text-gray-600 dark:text-gray-400">Gérez vos serveurs d'expédition et les modèles de notifications automatiques.</p>
    </div>

    <div class="grid grid-cols-1 gap-8">
      <!-- Section: Serveur Mail (SMTP) -->
      <div class="rounded-xl border border-stroke bg-white shadow-sm dark:border-strokedark dark:bg-boxdark overflow-hidden">
        <div class="border-b border-stroke px-7 py-4 dark:border-strokedark bg-gray-50/50 dark:bg-white/5 flex items-center justify-between">
          <h3 class="font-semibold text-black dark:text-white flex items-center gap-2">
            <Server class="w-5 h-5 text-blue-600" />
            Serveur Sortant (SMTP)
          </h3>
          <button 
            @click="testConnection"
            class="flex items-center gap-2 px-4 py-1.5 rounded-lg border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white transition-all text-sm font-medium"
          >
            <Send class="w-4 h-4" />
            Tester la connexion
          </button>
        </div>
        <div class="p-7">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div class="lg:col-span-2">
              <label class="mb-2.5 block text-sm font-medium text-black dark:text-white">Hôte SMTP</label>
              <input type="text" v-model="settings.smtp_host" placeholder="smtp.gmail.com" class="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-5 outline-none transition focus:border-blue-600 dark:border-form-strokedark dark:bg-form-input" />
            </div>
            <div>
              <label class="mb-2.5 block text-sm font-medium text-black dark:text-white">Port</label>
              <input type="number" v-model="settings.smtp_port" placeholder="587" class="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-5 outline-none transition focus:border-blue-600 dark:border-form-strokedark dark:bg-form-input" />
            </div>
            <div>
              <label class="mb-2.5 block text-sm font-medium text-black dark:text-white">Utilisateur</label>
              <input type="text" v-model="settings.smtp_user" placeholder="user@domain.com" class="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-5 outline-none transition focus:border-blue-600 dark:border-form-strokedark dark:bg-form-input" />
            </div>
            <div>
              <label class="mb-2.5 block text-sm font-medium text-black dark:text-white">Mot de passe</label>
              <input type="password" v-model="settings.smtp_password" class="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-5 outline-none transition focus:border-blue-600 dark:border-form-strokedark dark:bg-form-input" />
            </div>
            <div>
              <label class="mb-2.5 block text-sm font-medium text-black dark:text-white">Sécurité (SSL/TLS)</label>
              <select v-model="settings.smtp_secure" class="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-5 outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input">
                <option value="false">STARTTLS (Recommandé)</option>
                <option value="true">SSL/TLS</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- Section: Identité de l'expéditeur -->
      <div class="rounded-xl border border-stroke bg-white shadow-sm dark:border-strokedark dark:bg-boxdark overflow-hidden">
        <div class="border-b border-stroke px-7 py-4 dark:border-strokedark bg-gray-50/50 dark:bg-white/5">
          <h3 class="font-semibold text-black dark:text-white flex items-center gap-2">
            <UserCircle class="w-5 h-5 text-blue-600" />
            Identité de l'expéditeur
          </h3>
        </div>
        <div class="p-7">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="mb-2.5 block text-sm font-medium text-black dark:text-white">Nom affiché</label>
              <input type="text" v-model="settings.from_name" placeholder="HTFasil Support" class="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-5 outline-none transition focus:border-blue-600 dark:border-form-strokedark dark:bg-form-input" />
            </div>
            <div>
              <label class="mb-2.5 block text-sm font-medium text-black dark:text-white">Email d'expédition</label>
              <input type="email" v-model="settings.from_email" placeholder="noreply@htfasil.ht" class="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-5 outline-none transition focus:border-blue-600 dark:border-form-strokedark dark:bg-form-input" />
            </div>
          </div>
        </div>
      </div>

      <!-- Section: Notifications Automatiques -->
      <div class="rounded-xl border border-stroke bg-white shadow-sm dark:border-strokedark dark:bg-boxdark overflow-hidden">
        <div class="border-b border-stroke px-7 py-4 dark:border-strokedark bg-gray-50/50 dark:bg-white/5">
          <h3 class="font-semibold text-black dark:text-white flex items-center gap-2">
            <BellRing class="w-5 h-5 text-blue-600" />
            Notifications Clients
          </h3>
        </div>
        <div class="p-7 space-y-4">
          <div class="flex items-center gap-4 p-4 rounded-lg bg-gray-50 dark:bg-white/5 border border-stroke dark:border-strokedark">
            <div class="flex-1">
              <p class="font-semibold text-black dark:text-white">Confirmations de commande</p>
              <p class="text-sm text-gray-500 line-clamp-2">Envoyer un résumé détaillé dès qu'une commande est validée.</p>
            </div>
            <label class="relative inline-flex cursor-pointer items-center shrink-0 mr-4">
              <input type="checkbox" class="peer sr-only" v-model="settings.order_confirmation_enabled" :true-value="'true'" :false-value="'false'" />
              <div class="h-6 w-6 rounded-full border-2 border-gray-300 dark:border-gray-600 transition-all peer-checked:bg-blue-600 peer-checked:border-blue-600 flex items-center justify-center">
                <div class="w-2 h-2 rounded-full bg-white opacity-0 transition-opacity peer-checked:opacity-100"></div>
              </div>
            </label>
          </div>

          <div class="flex items-center gap-4 p-4 rounded-lg bg-gray-50 dark:bg-white/5 border border-stroke dark:border-strokedark">
            <div class="flex-1">
              <p class="font-semibold text-black dark:text-white">Suivi de livraison</p>
              <p class="text-sm text-gray-500 line-clamp-2">Notifier le client à chaque étape du transit.</p>
            </div>
            <label class="relative inline-flex cursor-pointer items-center shrink-0 mr-4">
              <input type="checkbox" class="peer sr-only" v-model="settings.shipping_notification_enabled" :true-value="'true'" :false-value="'false'" />
              <div class="h-6 w-6 rounded-full border-2 border-gray-300 dark:border-gray-600 transition-all peer-checked:bg-blue-600 peer-checked:border-blue-600 flex items-center justify-center">
                <div class="w-2 h-2 rounded-full bg-white opacity-0 transition-opacity peer-checked:opacity-100"></div>
              </div>
            </label>
          </div>

          <div class="flex items-center gap-4 p-4 rounded-lg bg-gray-50 dark:bg-white/5 border border-stroke dark:border-strokedark">
            <div class="flex-1">
              <p class="font-semibold text-black dark:text-white">Accueil nouveaux venus</p>
              <p class="text-sm text-gray-500 line-clamp-2">Envoyer un email de bienvenue après inscription.</p>
            </div>
            <label class="relative inline-flex cursor-pointer items-center shrink-0 mr-4">
              <input type="checkbox" class="peer sr-only" v-model="settings.welcome_email_enabled" :true-value="'true'" :false-value="'false'" />
              <div class="h-6 w-6 rounded-full border-2 border-gray-300 dark:border-gray-600 transition-all peer-checked:bg-blue-600 peer-checked:border-blue-600 flex items-center justify-center">
                <div class="w-2 h-2 rounded-full bg-white opacity-0 transition-opacity peer-checked:opacity-100"></div>
              </div>
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
          <p class="text-sm text-gray-500">Modifiez avec prudence, une mauvaise configuration SMTP bloque l'envoi des emails.</p>
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
            {{ loading ? 'Enregistrement...' : 'Enregistrer la configuration' }}
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
import { Mail, Server, UserCircle, BellRing, Save, Send } from 'lucide-vue-next';

const uiStore = useUIStore();
const sidebar = useSidebar();
const isSidebarExpanded = computed(() => sidebar.isExpanded.value);
const isSidebarHovered = computed(() => sidebar.isHovered.value);
const loading = ref(false);

const settings = ref({
  smtp_host: '',
  smtp_port: '587',
  smtp_user: '',
  smtp_password: '',
  smtp_secure: 'false',
  from_name: 'HTFasil',
  from_email: 'noreply@htfasil.ht',
  welcome_email_enabled: 'true',
  order_confirmation_enabled: 'true',
  shipping_notification_enabled: 'true'
});

const loadSettings = async () => {
  try {
    loading.value = true;
    const data = await settingsService.get('email');
    settings.value = {
      smtp_host: data.smtp_host || '',
      smtp_port: data.smtp_port || '587',
      smtp_user: data.smtp_user || '',
      smtp_password: data.smtp_password || '',
      smtp_secure: String(data.smtp_secure || 'false'),
      from_name: data.from_name || 'HTFasil',
      from_email: data.from_email || 'noreply@htfasil.ht',
      welcome_email_enabled: String(data.welcome_email_enabled || 'true'),
      order_confirmation_enabled: String(data.order_confirmation_enabled || 'true'),
      shipping_notification_enabled: String(data.shipping_notification_enabled || 'true')
    };
  } catch (error) {
    console.error('Error loading email settings:', error);
    uiStore.addToast('Erreur lors du chargement des paramètres', 'error');
  } finally {
    loading.value = false;
  }
};

const testConnection = () => {
  uiStore.addToast('Test de connexion SMTP en cours... (simulation)', 'info');
  setTimeout(() => {
    uiStore.addToast('Connexion SMTP réussie (simulation)', 'success');
  }, 1500);
};

const saveSettings = async () => {
  try {
    loading.value = true;
    await settingsService.update('email', settings.value);
    uiStore.addToast('Paramètres email enregistrés', 'success');
  } catch (error) {
    console.error('Error saving email settings:', error);
    uiStore.addToast('Erreur lors de la sauvegarde des paramètres', 'error');
  } finally {
    loading.value = false;
  }
};

onMounted(loadSettings);
</script>
