<template>
  <div class="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
    <h2 class="mb-6 text-title-md2 font-bold text-black dark:text-white">Paramètres de paiement</h2>
    
    <div class="space-y-6">
      <!-- Méthodes de paiement -->
      <div class="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
        <h3 class="mb-4 text-xl font-bold">Méthodes de paiement acceptées</h3>
        <div class="space-y-4">
          <div v-for="method in paymentMethods" :key="method.id" class="flex items-center justify-between border-b pb-4 last:border-0">
            <div class="flex items-center gap-4">
              <div class="flex h-12 w-12 items-center justify-center rounded bg-gray-100 dark:bg-gray-800">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
                </svg>
              </div>
              <div>
                <h4 class="font-medium">{{ method.name }}</h4>
                <p class="text-sm text-gray-600">{{ method.description }}</p>
              </div>
            </div>
            <div class="flex items-center gap-4">
              <span :class="[
                'rounded-full px-3 py-1 text-xs',
                method.enabled ? 'bg-success bg-opacity-10 text-success' : 'bg-gray-200 text-gray-600'
              ]">
                {{ method.enabled ? 'Activé' : 'Désactivé' }}
              </span>
              <button class="text-primary hover:underline">Configurer</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Configuration Stripe -->
      <div class="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
        <h3 class="mb-4 text-xl font-bold">Configuration Stripe</h3>
        <div class="space-y-4">
          <div>
            <label class="mb-2 block text-sm font-medium">Clé publique</label>
            <input type="text" placeholder="pk_live_..." class="w-full rounded border border-stroke bg-gray px-4 py-2 dark:border-strokedark dark:bg-meta-4" />
          </div>
          <div>
            <label class="mb-2 block text-sm font-medium">Clé secrète</label>
            <input type="password" placeholder="sk_live_..." class="w-full rounded border border-stroke bg-gray px-4 py-2 dark:border-strokedark dark:bg-meta-4" />
          </div>
          <div>
            <label class="mb-2 block text-sm font-medium">Webhook secret</label>
            <input type="password" placeholder="whsec_..." class="w-full rounded border border-stroke bg-gray px-4 py-2 dark:border-strokedark dark:bg-meta-4" />
          </div>
        </div>
      </div>

      <!-- Devise -->
      <div class="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
        <h3 class="mb-4 text-xl font-bold">Devise</h3>
        <div>
          <label class="mb-2 block text-sm font-medium">Devise par défaut</label>
          <select class="w-full rounded border border-stroke bg-gray px-4 py-2 dark:border-strokedark dark:bg-meta-4">
            <option>HTG - Gourde haïtienne</option>
            <option>USD - Dollar américain</option>
            <option>EUR - Euro</option>
          </select>
        </div>
      </div>

      <button class="rounded bg-primary px-6 py-3 text-white hover:bg-opacity-90">
        Enregistrer les modifications
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const paymentMethods = ref([
  { id: 1, name: 'Stripe', description: 'Cartes de crédit et débit', enabled: true },
  { id: 2, name: 'PayPal', description: 'Paiements PayPal', enabled: true },
  { id: 3, name: 'Virement bancaire', description: 'Transfert bancaire direct', enabled: false },
  { id: 4, name: 'Paiement à la livraison', description: 'Cash on delivery', enabled: true }
]);
</script>
