<template>
  <div class="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
      <div class="mb-6">
        <h2 class="text-title-md2 font-bold text-black dark:text-white">
          Logs & Activité
        </h2>
      </div>

      <!-- Filtres -->
      <div class="mb-6 rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
        <div class="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div>
            <label class="mb-2 block text-sm font-medium text-black dark:text-white">Type</label>
            <select class="w-full rounded border border-stroke bg-gray px-4 py-2 text-black focus:border-primary dark:border-strokedark dark:bg-meta-4 dark:text-white">
              <option>Tous</option>
              <option>Connexion</option>
              <option>Création</option>
              <option>Modification</option>
              <option>Suppression</option>
            </select>
          </div>
          <div>
            <label class="mb-2 block text-sm font-medium text-black dark:text-white">Utilisateur</label>
            <input type="text" placeholder="Rechercher..." class="w-full rounded border border-stroke bg-gray px-4 py-2 text-black focus:border-primary dark:border-strokedark dark:bg-meta-4 dark:text-white" />
          </div>
          <div>
            <label class="mb-2 block text-sm font-medium text-black dark:text-white">Date début</label>
            <input type="date" class="w-full rounded border border-stroke bg-gray px-4 py-2 text-black focus:border-primary dark:border-strokedark dark:bg-meta-4 dark:text-white" />
          </div>
          <div>
            <label class="mb-2 block text-sm font-medium text-black dark:text-white">Date fin</label>
            <input type="date" class="w-full rounded border border-stroke bg-gray px-4 py-2 text-black focus:border-primary dark:border-strokedark dark:bg-meta-4 dark:text-white" />
          </div>
        </div>
      </div>

      <!-- Liste des logs -->
      <div class="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div class="px-4 py-6 md:px-6 xl:px-7.5">
          <h4 class="text-xl font-bold text-black dark:text-white">Historique des activités</h4>
        </div>

        <div class="p-6">
          <div class="space-y-4">
            <div v-for="log in logs" :key="log.id" class="flex items-start gap-4 border-b border-stroke pb-4 dark:border-strokedark">
              <div :class="[
                'flex h-10 w-10 items-center justify-center rounded-full',
                log.type === 'create' ? 'bg-success bg-opacity-10' :
                log.type === 'update' ? 'bg-warning bg-opacity-10' :
                log.type === 'delete' ? 'bg-danger bg-opacity-10' :
                'bg-primary bg-opacity-10'
              ]">
                <svg class="w-5 h-5" :class="[
                  log.type === 'create' ? 'text-success' :
                  log.type === 'update' ? 'text-warning' :
                  log.type === 'delete' ? 'text-danger' :
                  'text-primary'
                ]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                </svg>
              </div>
              <div class="flex-1">
                <p class="font-medium text-black dark:text-white">{{ log.action }}</p>
                <p class="text-sm text-gray-600 dark:text-gray-400">{{ log.user }} • {{ log.timestamp }}</p>
                <p class="mt-1 text-sm text-gray-500">{{ log.details }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
const logs = ref([
  {
    id: 1,
    type: 'create',
    action: 'Nouveau produit créé',
    user: 'Jean Dupont',
    timestamp: 'Il y a 5 minutes',
    details: 'Produit "Smartphone XYZ" ajouté au catalogue'
  },
  {
    id: 2,
    type: 'update',
    action: 'Commande mise à jour',
    user: 'Marie Martin',
    timestamp: 'Il y a 15 minutes',
    details: 'Commande #1234 passée en statut "Livrée"'
  },
  {
    id: 3,
    type: 'delete',
    action: 'Produit supprimé',
    user: 'Pierre Dubois',
    timestamp: 'Il y a 1 heure',
    details: 'Produit "Ancien modèle" retiré du catalogue'
  },
  {
    id: 4,
    type: 'login',
    action: 'Connexion utilisateur',
    user: 'Admin',
    timestamp: 'Il y a 2 heures',
    details: 'Connexion depuis IP 192.168.1.1'
  },
]);
</script>
