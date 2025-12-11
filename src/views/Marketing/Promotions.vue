<template>
  <div class="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
    <div class="mb-6 flex items-center justify-between">
      <h2 class="text-title-md2 font-bold text-black dark:text-white">Promotions</h2>
      <button class="rounded bg-primary px-6 py-3 text-white hover:bg-opacity-90">
        Nouvelle promotion
      </button>
    </div>

    <div class="grid grid-cols-1 gap-6 lg:grid-cols-3 mb-6">
      <div class="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
        <h4 class="text-title-md font-bold">12</h4>
        <span class="text-sm">Promotions actives</span>
      </div>
      <div class="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
        <h4 class="text-title-md font-bold">€15,240</h4>
        <span class="text-sm">Économies clients</span>
      </div>
      <div class="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
        <h4 class="text-title-md font-bold">1,543</h4>
        <span class="text-sm">Codes utilisés</span>
      </div>
    </div>

    <div class="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
      <div class="px-4 py-6 md:px-6 xl:px-7.5">
        <h4 class="text-xl font-bold">Codes promo actifs</h4>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full table-auto">
          <thead>
            <tr class="bg-gray-2 text-left dark:bg-meta-4">
              <th class="px-4 py-4 font-medium">Code</th>
              <th class="px-4 py-4 font-medium">Réduction</th>
              <th class="px-4 py-4 font-medium">Utilisations</th>
              <th class="px-4 py-4 font-medium">Expiration</th>
              <th class="px-4 py-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="promo in promos" :key="promo.id" class="border-b">
              <td class="px-4 py-5"><code class="rounded bg-gray-100 px-2 py-1 font-mono text-sm dark:bg-gray-800">{{ promo.code }}</code></td>
              <td class="px-4 py-5">{{ promo.discount }}</td>
              <td class="px-4 py-5">{{ promo.uses }}</td>
              <td class="px-4 py-5">{{ promo.expires }}</td>
              <td class="px-4 py-5">
                <div class="flex gap-2">
                  <button class="hover:text-primary">Modifier</button>
                  <button class="hover:text-danger">Supprimer</button>
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

const promos = ref([
  { id: 1, code: 'SUMMER2024', discount: '-20%', uses: '543/1000', expires: '31/08/2024' },
  { id: 2, code: 'WELCOME10', discount: '-10%', uses: '234/∞', expires: 'Jamais' },
  { id: 3, code: 'BLACKFRIDAY', discount: '-50%', uses: '0/500', expires: '29/11/2024' }
]);
</script>
