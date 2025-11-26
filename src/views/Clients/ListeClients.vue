<template>
  <AdminLayout>
    <div class="p-6">
      <h1 class="text-2xl font-bold mb-6">Liste des clients</h1>
      <div class="bg-white rounded-lg shadow overflow-hidden">
      <div class="p-4 border-b border-gray-200">
        <div class="flex justify-between items-center">
          <div class="relative">
            <input
              type="text"
              placeholder="Rechercher un client..."
              class="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64"
            >
            <div class="absolute left-3 top-2.5 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          <button class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Ajouter un client
          </button>
        </div>
      </div>
      
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rôle</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date d'inscription</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <!-- Loading state -->
            <tr v-if="loading">
              <td colspan="5" class="px-6 py-8 text-center">
                <div class="inline-flex items-center">
                  <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Chargement des utilisateurs...
                </div>
              </td>
            </tr>
            
            <!-- Error state -->
            <tr v-else-if="error">
              <td colspan="5" class="px-6 py-8 text-center">
                <div class="text-red-600">{{ error }}</div>
              </td>
            </tr>
            
            <!-- Users list -->
            <tr v-else v-for="(user, index) in users" :key="user?.id || index" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                    {{ user?.name ? user.name.charAt(0).toUpperCase() : '?' }}
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900">{{ user?.name || 'Nom inconnu' }}</div>
                    <div class="text-sm text-gray-500">{{ user?.role }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ user?.email }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                  {{ user?.role }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ user?.created_at ? new Date(user.created_at).toLocaleDateString('fr-FR') : 'Date inconnue' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button @click="editUser(user?.id)" class="text-indigo-600 hover:text-indigo-900 mr-4">Modifier</button>
                <button @click="deleteUser(user?.id)" class="text-red-600 hover:text-red-900">Supprimer</button>
              </td>
            </tr>
            <tr v-if="!loading && !error && users.length === 0">
              <td colspan="5" class="px-6 py-8 text-center text-sm text-gray-500">
                Aucun utilisateur trouvé.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div class="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
        <div class="flex-1 flex justify-between sm:hidden">
          <button class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
            Précédent
          </button>
          <button class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
            Suivant
          </button>
        </div>
      </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import AdminLayout from '@/components/layout/AdminLayout.vue';
import { userService, type User } from '@/services/api';

const router = useRouter();
const users = ref<User[]>([]);
const loading = ref(true);
const error = ref('');

// Charger les utilisateurs depuis l'API
const loadUsers = async () => {
  try {
    loading.value = true;
    console.log('🔍 Chargement des utilisateurs...');
    const usersData = await userService.getAll();
    console.log('📥 Données reçues:', usersData);
    console.log('🔍 Structure du premier utilisateur:', usersData[0]);
    users.value = usersData;
    console.log('✅ Utilisateurs chargés:', users.value.length);
  } catch (err) {
    error.value = 'Erreur lors du chargement des utilisateurs';
    console.error('❌ Error loading users:', err);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadUsers();
});

const editUser = (id: number) => {
  router.push(`/modifier-client/${id}`);
};

const deleteUser = async (id: number) => {
  if (confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
    try {
      await userService.delete(id);
      await loadUsers(); // Recharger la liste
    } catch (err) {
      console.error('Error deleting user:', err);
      alert('Erreur lors de la suppression de l\'utilisateur');
    }
  }
};
</script>

<style scoped>
/* Styles spécifiques au composant */
</style>
