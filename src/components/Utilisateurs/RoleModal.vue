<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
    <div class="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl dark:bg-boxdark">
      <!-- Header -->
      <div class="mb-4 flex items-center justify-between">
        <h3 class="text-xl font-bold text-black dark:text-white">
          {{ isEdit ? 'Modifier le rôle' : 'Créer un nouveau rôle' }}
        </h3>
        <button @click="$emit('close')" class="text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white">
          <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleSubmit">
        <!-- Name -->
        <div class="mb-4">
          <label class="mb-2 block font-medium text-black dark:text-white">Nom du rôle</label>
          <input 
            v-model="form.name"
            type="text" 
            required
            placeholder="Ex: Éditeur"
            class="w-full rounded border border-stroke px-3 py-2 outline-none focus:border-primary dark:border-strokedark dark:bg-meta-4 dark:text-white"
            :disabled="isEdit && role?.isSystem"
          />
        </div>

        <!-- Description -->
        <div class="mb-4">
          <label class="mb-2 block font-medium text-black dark:text-white">Description</label>
          <textarea 
            v-model="form.description"
            rows="2"
            placeholder="Description du rôle..."
            class="w-full rounded border border-stroke px-3 py-2 outline-none focus:border-primary dark:border-strokedark dark:bg-meta-4 dark:text-white"
          ></textarea>
        </div>

        <!-- Permissions -->
        <div class="mb-6">
          <label class="mb-2 block font-medium text-black dark:text-white">Permissions</label>
          <div class="max-h-60 overflow-y-auto rounded border border-stroke p-3 dark:border-strokedark">
            <div 
              v-for="(label, key) in availablePermissions" 
              :key="key"
              class="mb-2 flex items-center"
            >
              <label class="flex cursor-pointer items-center">
                <input 
                  type="checkbox" 
                  :value="key"
                  v-model="form.permissions"
                  class="sr-only"
                />
                <div class="mr-2 flex h-5 w-5 items-center justify-center rounded border border-stroke dark:border-strokedark"
                     :class="form.permissions.includes(key) ? 'bg-primary border-primary' : 'bg-white dark:bg-boxdark'">
                  <span v-if="form.permissions.includes(key)" class="h-2.5 w-2.5 rounded-sm bg-white"></span>
                </div>
                <span class="text-black dark:text-white">{{ label }}</span>
              </label>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex justify-end gap-2">
          <button 
            type="button" 
            @click="$emit('close')"
            class="rounded border border-stroke px-6 py-2 text-black hover:bg-gray-100 dark:border-strokedark dark:text-white dark:hover:bg-meta-4"
          >
            Annuler
          </button>
          <button 
            type="submit" 
            class="rounded bg-primary px-6 py-2 text-white hover:bg-opacity-90 disabled:opacity-50"
            :disabled="isLoading"
          >
            {{ isLoading ? 'Enregistrement...' : 'Enregistrer' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import type { Role } from '@/services/roles';

const props = defineProps<{
  role?: Role | null;
  isLoading?: boolean;
}>();

const emit = defineEmits(['close', 'save']);

const isEdit = !!props.role;

const form = reactive({
  name: props.role?.name || '',
  description: props.role?.description || '',
  permissions: props.role?.permissions || [] as string[]
});

const availablePermissions: Record<string, string> = {
  'create': 'Créer',
  'read': 'Lire',
  'update': 'Modifier',
  'delete': 'Supprimer',
  'manage_users': 'Gérer les utilisateurs',
  'manage_settings': 'Gérer les paramètres',
  'manage_roles': 'Gérer les rôles',
  'manage_content': 'Gérer le contenu',
  'manage_products': 'Gérer les produits',
  'manage_orders': 'Gérer les commandes',
  'view_analytics': 'Voir les statistiques',
  'view_own_profile': 'Voir son profil'
};

const handleSubmit = () => {
  emit('save', {
    ...form,
    id: props.role?.id
  });
};
</script>
