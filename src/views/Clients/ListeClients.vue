<template>
  <div class="p-6 space-y-6">
    <!-- En-tête de la page -->
    <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Gestion des Clients</h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Gérez votre base de clients et leurs informations
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
          Actualiser
        </button>
        <button 
          class="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
          Ajouter un client
        </button>
      </div>
    </div>

    <!-- Cartes de statistiques -->
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <!-- Total Clients -->
      <div class="group rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] hover:shadow-lg transition-all duration-300 hover:border-blue-300 dark:hover:border-blue-700">
        <div class="flex items-center justify-between">
          <div class="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl dark:from-blue-900/30 dark:to-blue-800/30 group-hover:scale-110 transition-transform duration-300">
            <svg class="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
        </div>
        <div class="mt-4">
          <p class="text-sm text-gray-500 dark:text-gray-400">Total Clients</p>
          <p class="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{{ users.length }}</p>
        </div>
      </div>

      <!-- Clients Actifs -->
      <div class="group rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] hover:shadow-lg transition-all duration-300 hover:border-emerald-300 dark:hover:border-emerald-700">
        <div class="flex items-center justify-between">
          <div class="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl dark:from-emerald-900/30 dark:to-emerald-800/30 group-hover:scale-110 transition-transform duration-300">
            <svg class="w-6 h-6 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
        <div class="mt-4">
          <p class="text-sm text-gray-500 dark:text-gray-400">Clients Actifs</p>
          <p class="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{{ activeUsers }}</p>
        </div>
      </div>

      <!-- Nouveaux ce mois -->
      <div class="group rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] hover:shadow-lg transition-all duration-300 hover:border-purple-300 dark:hover:border-purple-700">
        <div class="flex items-center justify-between">
          <div class="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl dark:from-purple-900/30 dark:to-purple-800/30 group-hover:scale-110 transition-transform duration-300">
            <svg class="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
        </div>
        <div class="mt-4">
          <p class="text-sm text-gray-500 dark:text-gray-400">Nouveaux ce mois</p>
          <p class="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{{ newUsersThisMonth }}</p>
        </div>
      </div>

      <!-- Clients VIP -->
      <div class="group rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] hover:shadow-lg transition-all duration-300 hover:border-amber-300 dark:hover:border-amber-700">
        <div class="flex items-center justify-between">
          <div class="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl dark:from-amber-900/30 dark:to-amber-800/30 group-hover:scale-110 transition-transform duration-300">
            <svg class="w-6 h-6 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          </div>
        </div>
        <div class="mt-4">
          <p class="text-sm text-gray-500 dark:text-gray-400">Clients VIP</p>
          <p class="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{{ vipUsers }}</p>
        </div>
      </div>
    </div>

    <!-- Filtres -->
    <div class="bg-white dark:bg-gray-800 shadow-sm rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="md:col-span-2">
          <label for="search" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Rechercher</label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
            <input 
              type="text" 
              id="search" 
              v-model="searchQuery"
              class="block w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm dark:bg-gray-700 dark:text-white transition-all"
              placeholder="Nom, email, téléphone..."
            >
          </div>
        </div>
        
        <div class="flex items-end">
          <button 
            @click="resetFilters"
            class="w-full inline-flex justify-center items-center gap-2 py-2.5 px-4 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-lg text-gray-700 dark:text-white bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-all"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Réinitialiser
          </button>
        </div>
      </div>
    </div>

    <!-- Tableau des clients -->
    <div class="bg-white dark:bg-gray-800 shadow-sm overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-900/50">
            <tr>
              <th scope="col" class="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Client</th>
              <th scope="col" class="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Contact</th>
              <th scope="col" class="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Rôle</th>
              <th scope="col" class="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Inscription</th>
              <th scope="col" class="relative px-6 py-4"><span class="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-if="loading">
              <td colspan="5" class="px-6 py-12 text-center">
                <div class="inline-flex items-center gap-3">
                  <svg class="animate-spin h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span class="text-gray-600 dark:text-gray-400">Chargement...</span>
                </div>
              </td>
            </tr>
            <tr v-else-if="error">
              <td colspan="5" class="px-6 py-12 text-center"><div class="text-red-600 dark:text-red-400">{{ error }}</div></td>
            </tr>
            <tr v-else v-for="(user, index) in filteredUsers" :key="user?.id || index" class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center gap-3">
                  <div class="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-full ring-2 ring-white dark:ring-gray-800">
                    <span class="text-indigo-700 dark:text-indigo-300 font-semibold text-sm">{{ user?.name ? user.name.charAt(0).toUpperCase() : '?' }}</span>
                  </div>
                  <div>
                    <div class="text-sm font-medium text-gray-900 dark:text-white">{{ user?.name || 'Nom inconnu' }}</div>
                    <div class="text-xs text-gray-500 dark:text-gray-400">ID: #{{ user?.id }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900 dark:text-white">{{ user?.email }}</div>
                <div class="text-xs text-gray-500 dark:text-gray-400">{{ user?.phone || 'Non renseigné' }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="getRoleBadgeClass(user?.role)" class="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold">
                  <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                  </svg>
                  {{ user?.role || 'Client' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900 dark:text-white">{{ formatDate(user?.created_at) }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div class="flex justify-end items-center gap-2">
                  <button 
                    @click="viewUser(user?.id)"
                    class="p-2 text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
                    title="Voir les détails"
                  >
                    <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                  <button 
                    @click="editUser(user?.id)" 
                    class="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all"
                    title="Modifier"
                  >
                    <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button 
                    @click="deleteUser(user?.id)" 
                    class="p-2 text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                    title="Supprimer"
                  >
                    <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="!loading && !error && filteredUsers.length === 0">
              <td colspan="5" class="px-6 py-12 text-center">
                <div class="flex flex-col items-center gap-3">
                  <svg class="w-16 h-16 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <p class="text-sm text-gray-500 dark:text-gray-400">Aucun client trouvé</p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { userService } from '@/services/api';

const router = useRouter();
const users = ref<any[]>([]);
const loading = ref(false);
const error = ref('');
const searchQuery = ref('');

const loadUsers = async () => {
  try {
    loading.value = true;
    error.value = '';
    console.log('📡 Chargement des clients depuis l\'API...');
    
    const data = await userService.getAll();
    users.value = data;
    
    console.log('✅ Clients chargés depuis la base de données:', data.length, 'clients');
    console.log('Données:', data);
  } catch (err: any) {
    console.error('❌ Erreur lors du chargement des clients:', err);
    error.value = err.message || 'Erreur lors du chargement des clients. Vérifiez que le serveur backend est démarré.';
    users.value = [];
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadUsers();
});

const filteredUsers = computed(() => {
  if (!searchQuery.value) return users.value;
  const query = searchQuery.value.toLowerCase();
  return users.value.filter(user => 
    user.name?.toLowerCase().includes(query) ||
    user.email?.toLowerCase().includes(query) ||
    (user.phone && user.phone.includes(query))
  );
});

const activeUsers = computed(() => users.value.filter(u => u.status === 'Actif' || !u.status).length);
const vipUsers = computed(() => users.value.filter(u => u.role === 'VIP' || u.role === 'vip').length);
const newUsersThisMonth = computed(() => {
  const now = new Date();
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();
  return users.value.filter(u => {
    if (!u.created_at) return false;
    const date = new Date(u.created_at);
    return date.getMonth() === thisMonth && date.getFullYear() === thisYear;
  }).length;
});

const formatDate = (dateString: string) => {
  if (!dateString) return 'Date inconnue';
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

const getRoleBadgeClass = (role: string) => {
  const normalizedRole = role?.toLowerCase();
  if (normalizedRole === 'vip') {
    return 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400 ring-1 ring-amber-600/20';
  }
  return 'bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400 ring-1 ring-blue-600/20';
};

const viewUser = (id: number) => {
  router.push(`/clients/${id}`);
};

const editUser = (id: number) => {
  router.push(`/modifier-client/${id}`);
};

const deleteUser = async (id: number) => {
  if (confirm('Êtes-vous sûr de vouloir supprimer ce client ?')) {
    try {
      await userService.delete(id);
      console.log('✅ Client supprimé');
      await loadUsers(); // Recharger la liste
    } catch (err) {
      console.error('❌ Erreur lors de la suppression:', err);
      alert('Erreur lors de la suppression du client');
    }
  }
};

const resetFilters = () => {
  searchQuery.value = '';
};
</script>
