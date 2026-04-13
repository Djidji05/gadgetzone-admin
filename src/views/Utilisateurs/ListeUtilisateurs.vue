<template>
  <div class="px-2 py-4 sm:p-6 space-y-4 sm:space-y-6">
      <!-- En-tête -->
      <div class="flex flex-row flex-wrap justify-between items-center gap-4">
        <div>
          <h2 class="text-3xl font-bold text-gray-900 dark:text-white">
            Utilisateurs Système
          </h2>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400 hidden sm:block">
            Gérez les administrateurs et les gestionnaires de la plateforme
          </p>
        </div>
        <div class="flex items-center gap-3">
          <button
            @click="loadUsers"
            class="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span class="hidden sm:inline">Actualiser</span>
          </button>
          <button
            @click="router.push('/utilisateurs/ajouter')"
            class="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            <span class="hidden sm:inline">Nouvel utilisateur</span>
          </button>
        </div>
      </div>

      <!-- Liste des utilisateurs -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden sm:bg-white sm:dark:bg-gray-800 bg-transparent dark:bg-transparent border-none dark:border-none shadow-none sm:border sm:dark:border-gray-700 sm:shadow-sm">
        <div class="px-2 py-4 sm:px-6 sm:py-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-t-xl sm:rounded-none">
          <h4 class="text-xl font-bold text-gray-900 dark:text-white">
            Liste des administrateurs
          </h4>
          <div class="w-full sm:w-auto">
            <div class="relative">
              <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input
                v-model="searchQuery"
                type="search"
                placeholder="Rechercher..."
                class="w-full sm:w-64 pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>
          </div>
        </div>

        <div class="hidden sm:block overflow-x-auto">
          <table class="w-full table-auto">
            <thead>
              <tr class="bg-gray-2 text-left dark:bg-meta-4">
                <th class="px-4 py-4 font-medium text-black dark:text-white xl:pl-11">
                  Utilisateur
                </th>
                <th class="px-4 py-4 font-medium text-black dark:text-white">
                  Email
                </th>
                <th class="px-4 py-4 font-medium text-black dark:text-white">
                  Rôle
                </th>
                <th class="px-4 py-4 font-medium text-black dark:text-white">
                  Téléphone
                </th>
                <th class="px-4 py-4 font-medium text-black dark:text-white">
                  Date de création
                </th>
                <th class="px-4 py-4 font-medium text-black dark:text-white">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="isLoading">
                <td colspan="6" class="px-6 py-12 text-center text-gray-500 dark:text-gray-400">Chargement...</td>
              </tr>
              <tr v-else-if="filteredUsers.length === 0">
                <td colspan="6" class="px-6 py-12 text-center text-gray-500 dark:text-gray-400">Aucun utilisateur trouvé</td>
              </tr>
              <tr v-for="user in paginatedUsers" :key="user.id" class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <td class="px-4 py-5 pl-9 xl:pl-11">
                  <div class="flex items-center gap-3">
                    <div class="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-primary font-bold">
                      {{ getUserInitials(user) }}
                    </div>
                    <div>
                      <h5 class="font-medium text-black dark:text-white">{{ user.name }}</h5>
                    </div>
                  </div>
                </td>
                <td class="px-4 py-5">
                  <p class="text-black dark:text-white">{{ user.email }}</p>
                </td>
                <td class="px-4 py-5">
                  <span :class="[
                    'inline-flex rounded-full px-3 py-1 text-sm font-medium',
                    user.role === 'admin' ? 'bg-danger/10 text-danger dark:bg-red-500/20 dark:text-red-400' : 
                    user.role === 'gestionnaire' ? 'bg-warning/10 text-warning dark:bg-yellow-500/20 dark:text-yellow-400' :
                    'bg-success/10 text-success dark:bg-green-500/20 dark:text-green-400'
                  ]">
                    {{ capitalize(user.role) }}
                  </span>
                </td>
                <td class="px-4 py-5">
                  <p class="text-black dark:text-white">{{ user.phone || '-' }}</p>
                </td>
                <td class="px-4 py-5">
                  <p class="text-sm text-black dark:text-white">{{ formatDate(user.created_at) }}</p>
                </td>
                <td class="px-4 py-5">
                  <div class="flex items-center gap-3">
                    <button 
                      @click="editUser(user.id)"
                      class="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                      title="Modifier"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button 
                      @click="deleteUser(user)"
                      class="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                      title="Supprimer"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Version Mobile (Cartes) -->
        <div class="sm:hidden divide-y divide-gray-200 dark:divide-gray-700">
          <div v-if="isLoading" class="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
            Chargement...
          </div>
          <div v-else-if="filteredUsers.length === 0" class="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
            Aucun utilisateur trouvé
          </div>
          <div v-else v-for="user in paginatedUsers" :key="user.id" class="p-4 bg-white dark:bg-gray-800 mb-2 rounded-xl shadow-sm sm:shadow-none sm:rounded-none sm:mb-0">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="h-10 w-10 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold">
                  {{ getUserInitials(user) }}
                </div>
                <div>
                  <h5 class="font-bold text-gray-900 dark:text-white">{{ user.name }}</h5>
                  <p class="text-xs text-gray-500 dark:text-gray-400">{{ user.role }}</p>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <button 
                  @click="editUser(user.id)"
                  class="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button 
                  @click="deleteUser(user)"
                  class="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Pagination Section -->
        <div v-if="filteredUsers.length > 0" class="bg-gray-50 dark:bg-gray-900/50 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 sm:px-6">
          <div class="flex-1 flex justify-between sm:hidden">
            <button 
              @click="currentPage--" 
              :disabled="currentPage === 1"
              class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Précédent
            </button>
            <button 
              @click="currentPage++" 
              :disabled="currentPage >= totalPages"
              class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Suivant
            </button>
          </div>
          <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p class="text-sm text-gray-700 dark:text-gray-300">
                Affichage de <span class="font-medium">{{ (currentPage - 1) * itemsPerPage + 1 }}</span> à 
                <span class="font-medium">{{ Math.min(currentPage * itemsPerPage, filteredUsers.length) }}</span> sur 
                <span class="font-medium">{{ filteredUsers.length }}</span> utilisateurs
              </p>
            </div>
            <div>
              <nav class="relative z-0 inline-flex rounded-lg shadow-sm -space-x-px" aria-label="Pagination">
                <button 
                  @click="currentPage--" 
                  :disabled="currentPage === 1"
                  :class="{
                    'opacity-50 cursor-not-allowed': currentPage === 1,
                    'hover:bg-gray-50 dark:hover:bg-gray-700': currentPage > 1
                  }"
                  class="relative inline-flex items-center px-2 py-2 rounded-l-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-300"
                >
                  <span class="sr-only">Précédent</span>
                  <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
                  </svg>
                </button>
                
                <button 
                  v-for="page in totalPages" 
                  :key="page"
                  @click="currentPage = page"
                  :class="{
                    'bg-blue-50 dark:bg-blue-900/30 border-blue-500 text-blue-600 dark:text-blue-400 z-10': currentPage === page,
                    'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700': currentPage !== page
                  }"
                  class="relative inline-flex items-center px-4 py-2 border text-sm font-medium"
                >
                  {{ page }}
                </button>
                
                <button 
                  @click="currentPage++" 
                  :disabled="currentPage >= totalPages"
                  :class="{
                    'opacity-50 cursor-not-allowed': currentPage >= totalPages,
                    'hover:bg-gray-50 dark:hover:bg-gray-700': currentPage < totalPages
                  }"
                  class="relative inline-flex items-center px-2 py-2 rounded-r-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-300"
                >
                  <span class="sr-only">Suivant</span>
                  <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { authService } from '@/services/api';
import { useUIStore } from '@/stores/ui';

const router = useRouter();
const uiStore = useUIStore();

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  phone?: string;
  created_at: string;
}

const users = ref<User[]>([]);
const isLoading = ref(true);
const searchQuery = ref('');

// Pagination
const currentPage = ref(1);
const itemsPerPage = 10;

const loadUsers = async () => {
  try {
    isLoading.value = true;
    const data = await authService.getUsers();
    if (Array.isArray(data)) {
      users.value = data;
    } else {
      users.value = (data as any).data || (data as any).users || [];
    }
  } catch (err) {
    console.error('Error loading users:', err);
  } finally {
    isLoading.value = false;
  }
};

const deleteUser = async (user: User) => {
  const confirmed = await uiStore.confirm({
    title: 'Supprimer l\'utilisateur',
    message: `Êtes-vous sûr de vouloir supprimer l'utilisateur "${user.name}" ? Cette action est irréversible.`,
    confirmText: 'Supprimer',
    type: 'danger'
  });
  if (!confirmed) return;

  try {
    await authService.deleteUser(user.id);
    uiStore.addToast('Utilisateur supprimé avec succès', 'success');
    await loadUsers();
  } catch (error: any) {
    const message = error.response?.data?.error || error.response?.data?.message || 'Erreur lors de la suppression';
    uiStore.addToast(message, 'error');
  }
};

const editUser = (id: number) => {
  router.push(`/utilisateurs/modifier/${id}`);
};

// Reset pagination when searching
watch(searchQuery, () => {
  currentPage.value = 1;
});

const filteredUsers = computed(() => {
  if (!searchQuery.value) return users.value;
  const query = searchQuery.value.toLowerCase();
  return users.value.filter(user => 
    user.name.toLowerCase().includes(query) || 
    user.email.toLowerCase().includes(query) ||
    user.role.toLowerCase().includes(query)
  );
});

// Utilisateurs paginés
const paginatedUsers = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredUsers.value.slice(start, end);
});

// Total pages
const totalPages = computed(() => {
  return Math.ceil(filteredUsers.value.length / itemsPerPage);
});

const getUserInitials = (user: User) => {
  const parts = user.name.split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return user.name.substring(0, 2).toUpperCase();
};

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const formatDate = (dateString: string) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleString('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short'
  });
};

onMounted(() => {
  loadUsers();
});
</script>
