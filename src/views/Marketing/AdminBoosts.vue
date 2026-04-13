<template>
  <div class="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
    <!-- Page header -->
    <div class="sm:flex sm:justify-between sm:items-center mb-8">
      <!-- Left: Title -->
      <div class="mb-4 sm:mb-0">
        <h1 class="text-2xl md:text-3xl text-slate-800 font-bold">
          Gestion des Boosts ✨
        </h1>
        <p class="text-sm text-slate-500 mt-1">
          Suivez les achats de visibilité (boosts) effectués par les vendeurs.
        </p>
      </div>

      <!-- Right: Actions -->
      <div class="grid grid-flow-col sm:auto-cols-max justify-start sm:justify-end gap-2">
        <button class="btn bg-white border-slate-200 hover:border-slate-300 text-indigo-500" @click="fetchBoosts">
          <svg class="w-4 h-4 fill-current opacity-50 shrink-0" viewBox="0 0 16 16">
            <path d="M15 7H9V1c0-.6-.4-1-1-1S7 .4 7 1v6H1c-.6 0-1 .4-1 1s.4 1 1 1h6v6c0 .6.4 1 1 1s1-.4 1-1V9h6c.6 0 1-.4 1-1s-.4-1-1-1z" />
          </svg>
          <span class="hidden xs:block ml-2">Actualiser</span>
        </button>
      </div>
    </div>

    <!-- Table -->
    <div class="bg-white shadow-lg rounded-sm border border-slate-200">
      <header class="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <h2 class="font-semibold text-slate-800">
          Tous les Boosts <span class="text-slate-400 font-medium">{{ boosts.length }}</span>
        </h2>
      </header>
      
      <div v-if="loading" class="p-8 text-center">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
        <p class="mt-2 text-slate-500">Chargement des données...</p>
      </div>
      
      <div v-else-if="boosts.length === 0" class="p-8 text-center text-slate-500">
        Aucun boost n'a encore été acheté par les vendeurs.
      </div>
      
      <div v-else class="overflow-x-auto">
        <table class="table-auto w-full">
          <!-- Table header -->
          <thead class="text-xs font-semibold uppercase text-slate-500 bg-slate-50 border-t border-b border-slate-200">
            <tr>
              <th class="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                <div class="font-semibold text-left">Boutique</div>
              </th>
              <th class="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                <div class="font-semibold text-left">Produit</div>
              </th>
              <th class="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                <div class="font-semibold text-left">Pack</div>
              </th>
              <th class="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                <div class="font-semibold text-left">Montant (HTG)</div>
              </th>
              <th class="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                <div class="font-semibold text-left">Statut</div>
              </th>
              <th class="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                <div class="font-semibold text-left">Période</div>
              </th>
              <th class="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                <div class="font-semibold text-left">Transaction ID</div>
              </th>
            </tr>
          </thead>
          <!-- Table body -->
          <tbody class="text-sm divide-y divide-slate-200">
            <tr v-for="boost in boosts" :key="boost.id">
              <td class="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                <div class="font-medium text-slate-800">{{ boost.store?.name || 'Inconnue' }}</div>
              </td>
              <td class="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="w-10 h-10 shrink-0 mr-2 sm:mr-3">
                    <img class="rounded-full h-10 w-10 object-cover" :src="boost.product?.image_url || '/placeholder.png'" width="40" height="40" alt="Produit" />
                  </div>
                  <div class="font-medium text-slate-800">{{ boost.product?.name || 'Inconnu' }}</div>
                </div>
              </td>
              <td class="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                <div class="font-medium text-indigo-500">{{ boost.package_name }}</div>
              </td>
              <td class="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                <div class="font-medium text-emerald-500">{{ boost.amount }}</div>
              </td>
              <td class="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                <div :class="getStatusBadge(boost.status)">
                  {{ translateStatus(boost.status) }}
                </div>
              </td>
              <td class="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                <div v-if="boost.status === 'active'" class="text-slate-500">
                  Du: {{ boost.startsAt ? new Date(boost.startsAt).toLocaleDateString() : '-' }}<br />
                  Au: {{ boost.endsAt ? new Date(boost.endsAt).toLocaleDateString() : '-' }}
                </div>
                <div v-else class="text-slate-400 italic text-xs">
                  Cree le: {{ new Date(boost.created_at).toLocaleDateString() }}
                </div>
              </td>
              <td class="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                <div class="text-slate-500 font-mono text-xs">
                  {{ boost.transaction_id || (boost.payment_token ? 'Token: ' + boost.payment_token.substring(0, 8) + '...' : '-') }}
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
import { ref, onMounted } from 'vue';
import { api } from '@/services/api';

const boosts = ref<any[]>([]);
const loading = ref(true);

const fetchBoosts = async () => {
  loading.value = true;
  try {
    const response = await api.get('/admin/boosts');
    boosts.value = response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des boosts:', error);
  } finally {
    loading.value = false;
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'active':
      return 'inline-flex font-medium bg-emerald-100 text-emerald-600 rounded-full text-center px-2.5 py-0.5';
    case 'pending':
      return 'inline-flex font-medium bg-amber-100 text-amber-600 rounded-full text-center px-2.5 py-0.5';
    case 'expired':
      return 'inline-flex font-medium bg-slate-100 text-slate-500 rounded-full text-center px-2.5 py-0.5';
    case 'cancelled':
      return 'inline-flex font-medium bg-rose-100 text-rose-600 rounded-full text-center px-2.5 py-0.5';
    default:
      return 'inline-flex font-medium bg-slate-100 text-slate-500 rounded-full text-center px-2.5 py-0.5';
  }
};

const translateStatus = (status: string) => {
  switch (status) {
    case 'active': return 'Actif';
    case 'pending': return 'En attente';
    case 'expired': return 'Expiré';
    case 'cancelled': return 'Annulé';
    default: return status;
  }
};

onMounted(() => {
  fetchBoosts();
});
</script>
