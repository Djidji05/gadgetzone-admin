<template>
  <div class="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
      <!-- En-tête -->
      <div class="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 class="text-title-md2 font-bold text-black dark:text-white">
          Utilisateurs Système
        </h2>
      <button
          @click="router.push('/utilisateurs/ajouter')"
          class="inline-flex items-center justify-center gap-2 rounded-md bg-blue-600 px-6 py-3 text-center font-medium text-white hover:bg-blue-700 transition"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          Nouvel utilisateur
        </button>
      </div>

      <!-- Liste des utilisateurs -->
      <div class="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div class="px-4 py-6 md:px-6 xl:px-7.5 flex justify-between items-center">
          <h4 class="text-xl font-bold text-black dark:text-white">
            Liste des administrateurs et gestionnaires
          </h4>
          <div class="flex gap-3">
            <input
              v-model="searchQuery"
              type="search"
              placeholder="Rechercher..."
              class="rounded border border-stroke bg-gray px-4 py-2 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
            />
          </div>
        </div>

        <div class="overflow-x-auto">
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
              <tr v-if="isLoading" class="border-b border-stroke dark:border-strokedark">
                <td colspan="6" class="px-4 py-5 text-center">Chargement...</td>
              </tr>
              <tr v-else-if="filteredUsers.length === 0" class="border-b border-stroke dark:border-strokedark">
                <td colspan="6" class="px-4 py-5 text-center">Aucun utilisateur trouvé</td>
              </tr>
              <tr v-for="user in filteredUsers" :key="user.id" class="border-b border-stroke dark:border-strokedark">
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
                    user.role === 'admin' ? 'bg-danger bg-opacity-10 text-danger' : 
                    user.role === 'gestionnaire' ? 'bg-warning bg-opacity-10 text-warning' :
                    'bg-success bg-opacity-10 text-success'
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
      </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { authService } from '@/services/api';

const router = useRouter();

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

const loadUsers = async () => {
  try {
    isLoading.value = true;
    const data = await authService.getUsers();
    users.value = data;
  } catch (err) {
    console.error('Error loading users:', err);
  } finally {
    isLoading.value = false;
  }
};

const deleteUser = async (user: User) => {
  if (!confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur "${user.name}" ?`)) {
    return;
  }

  try {
    await authService.deleteUser(user.id);
    // Rafraîchir la liste
    await loadUsers();
  } catch (error: any) {
    console.error('Erreur suppression:', error);
    const message = error.response?.data?.error || error.response?.data?.message || 'Erreur lors de la suppression';
    alert(message);
  }
};

const editUser = (id: number) => {
  router.push(`/utilisateurs/modifier/${id}`);
};

const filteredUsers = computed(() => {
  if (!searchQuery.value) return users.value;
  const query = searchQuery.value.toLowerCase();
  return users.value.filter(user => 
    user.name.toLowerCase().includes(query) || 
    user.email.toLowerCase().includes(query) ||
    user.role.toLowerCase().includes(query)
  );
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
