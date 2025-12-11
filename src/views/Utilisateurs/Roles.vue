<template>
  <div class="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
    <div class="mb-6 flex items-center justify-between">
      <h2 class="text-title-md2 font-bold text-black dark:text-white">
        Rôles & Permissions
      </h2>
      <button 
        @click="showCreateModal = true"
        class="rounded bg-primary px-6 py-3 text-white hover:bg-opacity-90"
      >
        Nouveau rôle
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="text-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
      <p class="mt-4 text-gray-600">Chargement...</p>
    </div>

    <div v-else class="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div 
        v-for="role in roles" 
        :key="role.id" 
        class="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark"
      >
        <div class="mb-4 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <h3 class="text-xl font-bold text-black dark:text-white">{{ role.name }}</h3>
            <span 
              v-if="role.isSystem"
              class="rounded-full bg-warning bg-opacity-10 px-2 py-1 text-xs font-medium text-warning"
            >
              Système
            </span>
          </div>
          <span class="rounded-full bg-primary bg-opacity-10 px-3 py-1 text-sm font-medium text-primary">
            {{ role.usersCount }} utilisateur{{ role.usersCount > 1 ? 's' : '' }}
          </span>
        </div>
        <p class="mb-4 text-sm text-gray-600 dark:text-gray-400">{{ role.description }}</p>
        
        <div class="space-y-2">
          <h4 class="font-medium text-black dark:text-white">Permissions:</h4>
          <div class="flex flex-wrap gap-2">
            <span 
              v-for="perm in role.permissions" 
              :key="perm" 
              class="inline-flex rounded bg-gray-100 dark:bg-gray-800 px-2 py-1 text-xs"
            >
              {{ formatPermission(perm) }}
            </span>
          </div>
        </div>

        <div class="mt-4 flex gap-2">
          <button 
            @click="editRole(role)"
            :disabled="role.isSystem"
            :class="[
              'flex-1 rounded px-4 py-2 text-white transition',
              role.isSystem 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-primary hover:bg-opacity-90'
            ]"
          >
            Modifier
          </button>
          <button 
            @click="deleteRole(role.id)"
            :disabled="role.isSystem"
            :class="[
              'rounded border px-4 py-2 transition',
              role.isSystem
                ? 'border-gray-300 text-gray-400 cursor-not-allowed'
                : 'border-stroke hover:bg-gray-100 dark:border-strokedark dark:hover:bg-gray-800'
            ]"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="!isLoading && roles.length === 0" class="text-center py-12">
      <p class="text-gray-600">Aucun rôle pour le moment</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { rolesService, type Role } from '@/services/roles';

const roles = ref<Role[]>([]);
const isLoading = ref(true);
const showCreateModal = ref(false);

const loadRoles = async () => {
  try {
    isLoading.value = true;
    const data = await rolesService.getAll();
    roles.value = data.roles;
  } catch (error) {
    console.error('Error loading roles:', error);
    alert('Erreur lors du chargement des rôles');
  } finally {
    isLoading.value = false;
  }
};

const editRole = (role: Role) => {
  if (role.isSystem) return;
  // TODO: Implement edit modal
  console.log('Edit role:', role);
  alert('Fonctionnalité d\'édition à implémenter');
};

const deleteRole = async (id: number) => {
  const role = roles.value.find(r => r.id === id);
  if (!role || role.isSystem) return;

  if (!confirm(`Êtes-vous sûr de vouloir supprimer le rôle "${role.name}" ?`)) {
    return;
  }

  try {
    await rolesService.delete(id);
    await loadRoles();
  } catch (error: any) {
    console.error('Error deleting role:', error);
    const message = error.response?.data?.message || 'Erreur lors de la suppression du rôle';
    alert(message);
  }
};

const formatPermission = (perm: string) => {
  const labels: Record<string, string> = {
    'create': 'Créer',
    'read': 'Lire',
    'update': 'Modifier',
    'delete': 'Supprimer',
    'manage_users': 'Gérer utilisateurs',
    'manage_settings': 'Gérer paramètres',
    'manage_roles': 'Gérer rôles',
    'manage_content': 'Gérer contenu',
    'manage_products': 'Gérer produits',
    'manage_orders': 'Gérer commandes',
    'view_analytics': 'Voir analytics',
    'view_own_profile': 'Voir son profil'
  };
  return labels[perm] || perm;
};

onMounted(() => {
  loadRoles();
});
</script>
