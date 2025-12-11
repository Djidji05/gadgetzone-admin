<template>
  <div class="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
    <!-- En-tête -->
    <div class="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <h2 class="text-title-md2 font-bold text-black dark:text-white">
        API Management
      </h2>
      <button
        @click="showCreateModal = true"
        class="inline-flex items-center justify-center gap-2 rounded-md bg-blue-600 px-6 py-3 text-center font-medium text-white hover:bg-blue-700 transition"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
        </svg>
        Nouvelle clé API
      </button>
    </div>

    <!-- Statistiques -->
    <div class="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-4 2xl:gap-7.5 mb-6">
      <div class="rounded-sm border border-stroke bg-white px-7.5 py-6 shadow-default dark:border-strokedark dark:bg-boxdark">
        <div class="flex items-center justify-between">
          <div>
            <h4 class="text-title-md font-bold text-black dark:text-white">24</h4>
            <span class="text-sm font-medium">Clés actives</span>
          </div>
          <div class="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4">
            <svg class="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/>
            </svg>
          </div>
        </div>
      </div>

      <div class="rounded-sm border border-stroke bg-white px-7.5 py-6 shadow-default dark:border-strokedark dark:bg-boxdark">
        <div class="flex items-center justify-between">
          <div>
            <h4 class="text-title-md font-bold text-black dark:text-white">1.2M</h4>
            <span class="text-sm font-medium">Requêtes (30j)</span>
          </div>
          <div class="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4">
            <svg class="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
            </svg>
          </div>
        </div>
      </div>

      <div class="rounded-sm border border-stroke bg-white px-7.5 py-6 shadow-default dark:border-strokedark dark:bg-boxdark">
        <div class="flex items-center justify-between">
          <div>
            <h4 class="text-title-md font-bold text-black dark:text-white">99.8%</h4>
            <span class="text-sm font-medium">Taux de succès</span>
          </div>
          <div class="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4">
            <svg class="w-6 h-6 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
        </div>
      </div>

      <div class="rounded-sm border border-stroke bg-white px-7.5 py-6 shadow-default dark:border-strokedark dark:bg-boxdark">
        <div class="flex items-center justify-between">
          <div>
            <h4 class="text-title-md font-bold text-black dark:text-white">45ms</h4>
            <span class="text-sm font-medium">Temps de réponse</span>
          </div>
          <div class="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4">
            <svg class="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Liste des clés API -->
    <div class="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
      <div class="px-4 py-6 md:px-6 xl:px-7.5">
        <h4 class="text-xl font-bold text-black dark:text-white">
          Clés API
        </h4>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full table-auto">
          <thead>
            <tr class="bg-gray-2 text-left dark:bg-meta-4">
              <th class="px-4 py-4 font-medium text-black dark:text-white xl:pl-11">
                Nom
              </th>
              <th class="px-4 py-4 font-medium text-black dark:text-white">
                Clé
              </th>
              <th class="px-4 py-4 font-medium text-black dark:text-white">
                Permissions
              </th>
              <th class="px-4 py-4 font-medium text-black dark:text-white">
                Dernière utilisation
              </th>
              <th class="px-4 py-4 font-medium text-black dark:text-white">
                Statut
              </th>
              <th class="px-4 py-4 font-medium text-black dark:text-white">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="apiKey in apiKeys" :key="apiKey.id" class="border-b border-stroke dark:border-strokedark">
              <td class="px-4 py-5 pl-9 xl:pl-11">
                <h5 class="font-medium text-black dark:text-white">{{ apiKey.name }}</h5>
                <p class="text-sm">{{ apiKey.description }}</p>
              </td>
              <td class="px-4 py-5">
                <code class="rounded bg-gray-100 dark:bg-gray-800 px-2 py-1 text-sm font-mono">
                  {{ apiKey.key }}
                </code>
              </td>
              <td class="px-4 py-5">
                <div class="flex flex-wrap gap-1">
                  <span v-for="perm in apiKey.permissions" :key="perm" class="inline-flex rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    {{ perm }}
                  </span>
                </div>
              </td>
              <td class="px-4 py-5">
                <p class="text-sm text-black dark:text-white">{{ apiKey.lastUsed }}</p>
              </td>
              <td class="px-4 py-5">
                <span :class="[
                  'inline-flex rounded-full px-3 py-1 text-sm font-medium',
                  apiKey.status === 'active' ? 'bg-success bg-opacity-10 text-success' : 'bg-danger bg-opacity-10 text-danger'
                ]">
                  {{ apiKey.status === 'active' ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td class="px-4 py-5">
                <div class="flex items-center space-x-3.5">
                  <button class="hover:text-primary" title="Voir">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                    </svg>
                  </button>
                  <button class="hover:text-primary" title="Modifier">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                    </svg>
                  </button>
                  <button class="hover:text-danger" title="Supprimer">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
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
import { ref } from 'vue';

const showCreateModal = ref(false);

const apiKeys = ref([
  {
    id: 1,
    name: 'Production API',
    description: 'Clé principale pour l\'environnement de production',
    key: 'pk_live_51H***************',
    permissions: ['read', 'write'],
    lastUsed: 'Il y a 2 heures',
    status: 'active'
  },
  {
    id: 2,
    name: 'Mobile App',
    description: 'Clé pour l\'application mobile',
    key: 'pk_live_52J***************',
    permissions: ['read'],
    lastUsed: 'Il y a 5 minutes',
    status: 'active'
  },
  {
    id: 3,
    name: 'Test Environment',
    description: 'Clé de test pour le développement',
    key: 'pk_test_53K***************',
    permissions: ['read', 'write', 'delete'],
    lastUsed: 'Il y a 1 jour',
    status: 'inactive'
  },
]);
</script>
