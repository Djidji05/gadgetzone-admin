<template>
  <div class="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
    <div class="mb-6 flex items-center justify-between">
      <h2 class="text-title-md2 font-bold text-black dark:text-white">Webhooks</h2>
      <button class="rounded bg-primary px-6 py-3 text-white hover:bg-opacity-90">
        Nouveau webhook
      </button>
    </div>

    <div class="mb-6 rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
      <h3 class="mb-4 text-lg font-bold">Qu'est-ce qu'un webhook ?</h3>
      <p class="text-gray-600 dark:text-gray-400">Les webhooks vous permettent de recevoir des notifications HTTP en temps réel lorsque certains événements se produisent dans votre application.</p>
    </div>

    <div class="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
      <div class="px-4 py-6 md:px-6 xl:px-7.5">
        <h4 class="text-xl font-bold">Webhooks configurés</h4>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full table-auto">
          <thead>
            <tr class="bg-gray-2 text-left dark:bg-meta-4">
              <th class="px-4 py-4 font-medium">URL</th>
              <th class="px-4 py-4 font-medium">Événements</th>
              <th class="px-4 py-4 font-medium">Statut</th>
              <th class="px-4 py-4 font-medium">Dernière livraison</th>
              <th class="px-4 py-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="webhook in webhooks" :key="webhook.id" class="border-b">
              <td class="px-4 py-5">
                <code class="rounded bg-gray-100 px-2 py-1 text-sm font-mono dark:bg-gray-800">{{ webhook.url }}</code>
              </td>
              <td class="px-4 py-5">
                <div class="flex flex-wrap gap-1">
                  <span v-for="event in webhook.events" :key="event" class="inline-flex rounded bg-blue-100 px-2 py-1 text-xs dark:bg-blue-900">
                    {{ event }}
                  </span>
                </div>
              </td>
              <td class="px-4 py-5">
                <span :class="[
                  'inline-flex rounded-full px-3 py-1 text-sm',
                  webhook.status === 'active' ? 'bg-success bg-opacity-10 text-success' : 'bg-danger bg-opacity-10 text-danger'
                ]">
                  {{ webhook.status === 'active' ? 'Actif' : 'Inactif' }}
                </span>
              </td>
              <td class="px-4 py-5 text-sm">{{ webhook.lastDelivery }}</td>
              <td class="px-4 py-5">
                <div class="flex gap-2">
                  <button class="hover:text-primary">Tester</button>
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

const webhooks = ref([
  {
    id: 1,
    url: 'https://example.com/webhook/orders',
    events: ['order.created', 'order.updated'],
    status: 'active',
    lastDelivery: 'Il y a 5 minutes'
  },
  {
    id: 2,
    url: 'https://api.myapp.com/notifications',
    events: ['payment.success', 'payment.failed'],
    status: 'active',
    lastDelivery: 'Il y a 1 heure'
  },
  {
    id: 3,
    url: 'https://slack.com/webhook/abc123',
    events: ['product.low_stock'],
    status: 'inactive',
    lastDelivery: 'Il y a 2 jours'
  }
]);
</script>
