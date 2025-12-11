<template>
  <div class="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
    <h2 class="mb-6 text-title-md2 font-bold text-black dark:text-white">Documentation</h2>
    
    <div class="grid grid-cols-1 gap-6 lg:grid-cols-3 mb-6">
      <div class="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
        <div class="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary bg-opacity-10">
          <svg class="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
          </svg>
        </div>
        <h3 class="mb-2 text-xl font-bold">Guide de démarrage</h3>
        <p class="mb-4 text-sm text-gray-600 dark:text-gray-400">Apprenez les bases de l'administration</p>
        <button class="text-primary hover:underline">Lire le guide →</button>
      </div>

      <div class="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
        <div class="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-success bg-opacity-10">
          <svg class="w-6 h-6 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/>
          </svg>
        </div>
        <h3 class="mb-2 text-xl font-bold">API Documentation</h3>
        <p class="mb-4 text-sm text-gray-600 dark:text-gray-400">Intégrez votre application avec notre API</p>
        <button class="text-primary hover:underline">Voir la doc API →</button>
      </div>

      <div class="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
        <div class="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-warning bg-opacity-10">
          <svg class="w-6 h-6 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/>
          </svg>
        </div>
        <h3 class="mb-2 text-xl font-bold">Tutoriels vidéo</h3>
        <p class="mb-4 text-sm text-gray-600 dark:text-gray-400">Regardez nos tutoriels pas à pas</p>
        <button class="text-primary hover:underline">Voir les vidéos →</button>
      </div>
    </div>

    <div class="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
      <h3 class="mb-4 text-xl font-bold">Articles populaires</h3>
      <div class="space-y-4">
        <div v-for="article in articles" :key="article.id" class="border-b border-stroke pb-4 last:border-0 dark:border-strokedark">
          <h4 class="mb-2 font-medium text-black dark:text-white">{{ article.title }}</h4>
          <p class="text-sm text-gray-600 dark:text-gray-400">{{ article.description }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const articles = ref([
  { id: 1, title: 'Configuration initiale de votre boutique', description: 'Guide complet pour configurer votre boutique en ligne' },
  { id: 2, title: 'Gestion des stocks et inventaire', description: 'Comment gérer efficacement vos stocks' },
  { id: 3, title: 'Optimisation SEO de vos produits', description: 'Améliorez la visibilité de vos produits' },
  { id: 4, title: 'Analyse des performances', description: 'Comprendre vos statistiques et rapports' }
]);
</script>
