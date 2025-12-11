<template>
  <div class="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
    <div class="mb-6 flex items-center justify-between">
      <h2 class="text-title-md2 font-bold text-black dark:text-white">Clés API</h2>
      <button class="rounded bg-primary px-6 py-3 text-white hover:bg-opacity-90">
        Générer une clé
      </button>
    </div>

    <div class="mb-6 rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
      <div class="mb-4 flex items-start gap-3">
        <svg class="w-6 h-6 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
        </svg>
        <div>
          <h3 class="mb-2 font-bold">Sécurité des clés API</h3>
          <p class="text-sm text-gray-600 dark:text-gray-400">Ne partagez jamais vos clés API publiquement. Conservez-les en sécurité et régénérez-les si vous pensez qu'elles ont été compromises.</p>
        </div>
      </div>
    </div>

    <div class="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
      <div class="px-4 py-6 md:px-6 xl:px-7.5">
        <h4 class="text-xl font-bold">Vos clés API</h4>
      </div>
      <div class="p-6">
        <div class="space-y-4">
          <div v-for="key in apiKeys" :key="key.id" class="rounded border border-stroke p-4 dark:border-strokedark">
            <div class="mb-3 flex items-center justify-between">
              <h5 class="font-medium text-black dark:text-white">{{ key.name }}</h5>
              <span :class="[
                'rounded-full px-3 py-1 text-xs',
                key.status === 'active' ? 'bg-success bg-opacity-10 text-success' : 'bg-danger bg-opacity-10 text-danger'
              ]">
                {{ key.status === 'active' ? 'Active' : 'Révoquée' }}
              </span>
            </div>
            <div class="mb-3 flex items-center gap-2">
              <code class="flex-1 rounded bg-gray-100 px-3 py-2 font-mono text-sm dark:bg-gray-800">{{ key.key }}</code>
              <button class="rounded border px-3 py-2 hover:bg-gray-100">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                </svg>
              </button>
            </div>
            <div class="flex items-center justify-between text-sm text-gray-600">
              <span>Créée le {{ key.created }}</span>
              <div class="flex gap-2">
                <button class="text-primary hover:underline">Permissions</button>
                <button class="text-danger hover:underline">Révoquer</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const apiKeys = ref([
  {
    id: 1,
    name: 'Production API Key',
    key: 'sk_live_51H7xK2eZvKYlo2C9vK***************************',
    status: 'active',
    created: '15/11/2024'
  },
  {
    id: 2,
    name: 'Development Key',
    key: 'sk_test_51H7xK2eZvKYlo2C9vK***************************',
    status: 'active',
    created: '01/11/2024'
  },
  {
    id: 3,
    name: 'Old Production Key',
    key: 'sk_live_41G6xJ1dYuJXkn1B8uJ***************************',
    status: 'revoked',
    created: '10/10/2024'
  }
]);
</script>
