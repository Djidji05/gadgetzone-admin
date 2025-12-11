<template>
  <div class="p-6">
    <PageBreadcrumb :pageTitle="currentPageTitle" />

    <div class="max-w-4xl mx-auto">
      <div class="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <!-- Header -->
        <div class="border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-gray-800 dark:to-gray-900 p-6">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <div class="p-2 bg-blue-600 rounded-lg">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            {{ isEditing ? 'Modifier l\'utilisateur' : 'Ajouter un nouvel utilisateur' }}
          </h2>
          <p class="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Remplissez les informations ci-dessous pour {{ isEditing ? 'modifier' : 'créer' }} un compte administrateur ou gestionnaire.
          </p>
        </div>

        <form @submit.prevent="submitForm" class="p-6 space-y-8">
          <!-- Section 1: Informations Personnelles -->
          <div class="space-y-6">
            <div class="flex items-center gap-3 pb-3 border-b border-gray-200 dark:border-gray-700">
              <div class="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <svg class="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Informations Personnelles</h3>
            </div>

            <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300" for="firstName">
                  Prénom <span class="text-red-500">*</span>
                </label>
                <input
                  id="firstName"
                  v-model="formData.firstName"
                  type="text"
                  required
                  class="form-input w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Ex: Jean"
                />
              </div>

              <div>
                <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300" for="lastName">
                  Nom <span class="text-red-500">*</span>
                </label>
                <input
                  id="lastName"
                  v-model="formData.lastName"
                  type="text"
                  required
                  class="form-input w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Ex: Dupont"
                />
              </div>

              <div>
                <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300" for="email">
                  Email <span class="text-red-500">*</span>
                </label>
                <input
                  id="email"
                  v-model="formData.email"
                  type="email"
                  required
                  class="form-input w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-blue-500 focus:ring-blue-500"
                  placeholder="jean.dupont@example.com"
                />
              </div>

              <div>
                <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300" for="phone">
                  Téléphone
                </label>
                <input
                  id="phone"
                  v-model="formData.phone"
                  type="tel"
                  class="form-input w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-blue-500 focus:ring-blue-500"
                  placeholder="+509 3000 0000"
                />
              </div>
            </div>
          </div>

          <!-- Section 2: Sécurité et Rôle -->
          <div class="space-y-6">
            <div class="flex items-center gap-3 pb-3 border-b border-gray-200 dark:border-gray-700">
              <div class="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <svg class="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Sécurité et Rôle</h3>
            </div>

            <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div class="md:col-span-2">
                <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300" for="role">
                  Rôle Système <span class="text-red-500">*</span>
                </label>
                <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div 
                    @click="formData.role = 'gestionnaire'"
                    class="cursor-pointer rounded-lg border p-4 transition-all hover:shadow-md"
                    :class="formData.role === 'gestionnaire' ? 'border-primary-500 bg-primary-50 ring-1 ring-primary-500 dark:bg-primary-900/20' : 'border-gray-200 hover:border-primary-300 dark:border-gray-600'"
                  >
                    <div class="flex items-center gap-3">
                      <div class="flex-shrink-0">
                        <span class="inline-block h-6 w-6 rounded-full border-2" :class="formData.role === 'gestionnaire' ? 'border-primary-600 bg-primary-600' : 'border-gray-300'"></span>
                      </div>
                      <div>
                        <span class="block text-sm font-medium text-black dark:text-white">Gestionnaire</span>
                        <span class="block text-xs text-gray-500">Accès limité (Produits, Commandes, Clients)</span>
                      </div>
                    </div>
                  </div>

                  <div 
                    @click="formData.role = 'admin'"
                    class="cursor-pointer rounded-lg border p-4 transition-all hover:shadow-md"
                    :class="formData.role === 'admin' ? 'border-red-500 bg-red-50 ring-1 ring-red-500 dark:bg-red-900/20' : 'border-gray-200 hover:border-red-300 dark:border-gray-600'"
                  >
                    <div class="flex items-center gap-3">
                      <div class="flex-shrink-0">
                        <span class="inline-block h-6 w-6 rounded-full border-2" :class="formData.role === 'admin' ? 'border-red-600 bg-red-600' : 'border-gray-300'"></span>
                      </div>
                      <div>
                        <span class="block text-sm font-medium text-black dark:text-white">Administrateur</span>
                        <span class="block text-xs text-gray-500">Accès complet à tout le système</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="md:col-span-2">
                <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300" for="password">
                  Mot de passe <span class="text-red-500">*</span>
                </label>
                <input
                  id="password"
                  v-model="formData.password"
                  type="password"
                  required
                  minlength="6"
                  class="form-input w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Minimum 6 caractères"
                />
                <p class="mt-1 text-xs text-gray-500">Le mot de passe doit contenir au moins 6 caractères.</p>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex items-center justify-end gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              @click="$router.push('/utilisateurs/liste')"
              class="rounded-lg border border-gray-300 bg-white px-6 py-2.5 text-center font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50 focus:ring-2 focus:ring-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
            >
              Annuler
            </button>
            <button
              type="submit"
              :disabled="loading"
              class="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-center font-medium text-white shadow-md transition-all hover:bg-blue-700 hover:shadow-lg focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <svg v-if="loading" class="h-5 w-5 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>{{ loading ? 'Création en cours...' : 'Créer l\'utilisateur' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue';
import { authService } from '@/services/api';

const router = useRouter();
const route = useRoute();
const currentPageTitle = ref('Ajouter Utilisateur');
const isEditing = ref(false);
const loading = ref(false);
const userId = ref<number | null>(null);

const formData = ref({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  role: 'gestionnaire',
  password: ''
});

onMounted(async () => {
  // Vérifier si un ID est présent dans l'URL (Mode Édition)
  if (route.params.id) {
    isEditing.value = true;
    userId.value = Number(route.params.id);
    currentPageTitle.value = 'Modifier Utilisateur';
    await loadUser(userId.value);
  }
});

const loadUser = async (id: number) => {
  try {
    loading.value = true;
    const user = await authService.getUserById(id);
    
    // Séparer le nom complet en Prénom/Nom
    const nameParts = user.name.split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    formData.value = {
      firstName,
      lastName,
      email: user.email,
      phone: user.phone || '',
      role: user.role,
      password: '' // Ne pas remplir le mot de passe
    };
  } catch (error) {
    console.error('Erreur chargement utilisateur:', error);
    alert('Impossible de charger les informations de l\'utilisateur');
    router.push('/utilisateurs/liste');
  } finally {
    loading.value = false;
  }
};

const submitForm = async () => {
  try {
    loading.value = true;
    
    // Validation basique
    if (!formData.value.firstName || !formData.value.lastName || !formData.value.email) {
      alert('Veuillez remplir les champs obligatoires (Prénom, Nom, Email)');
      return;
    }

    if (!isEditing.value && !formData.value.password) {
      alert('Le mot de passe est obligatoire pour la création');
      return;
    }

    if (isEditing.value && userId.value) {
      // Mode Mise à jour
      await authService.updateUser(userId.value, formData.value);
      alert('Utilisateur modifié avec succès !');
      router.push('/utilisateurs/liste');
    } else {
      // Mode Création
      await authService.createUser(formData.value);
      alert('Utilisateur créé avec succès !');
      router.push('/utilisateurs/liste');
    }
    
  } catch (error: any) {
    console.error('Erreur sauvegarde utilisateur:', error);
    const message = error.response?.data?.error || error.response?.data?.message || 'Une erreur est survenue';
    alert(message);
  } finally {
    loading.value = false;
  }
};
</script>
