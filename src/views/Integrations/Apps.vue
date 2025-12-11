<template>
  <div class="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
      <h2 class="mb-6 text-title-md2 font-bold text-black dark:text-white">Intégrations</h2>
      
      <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div class="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
          <div class="mb-4 flex items-center justify-between">
            <h3 class="text-xl font-bold">Stripe</h3>
            <span class="rounded-full bg-success bg-opacity-10 px-3 py-1 text-sm text-success">Connecté</span>
          </div>
          <p class="mb-4 text-sm text-gray-600">Paiements en ligne</p>
          <button class="w-full rounded border px-4 py-2 hover:bg-gray-100">Configurer</button>
        </div>

        <div class="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
          <div class="mb-4 flex items-center justify-between">
            <h3 class="text-xl font-bold">Mailchimp</h3>
            <span class="rounded-full bg-gray-200 px-3 py-1 text-sm text-gray-600">Non connecté</span>
          </div>
          <p class="mb-4 text-sm text-gray-600">Email marketing</p>
          <button class="w-full rounded bg-primary px-4 py-2 text-white hover:bg-opacity-90">Connecter</button>
        </div>

        <div class="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
          <div class="mb-4 flex items-center justify-between">
            <h3 class="text-xl font-bold">Google Analytics</h3>
            <span class="rounded-full bg-success bg-opacity-10 px-3 py-1 text-sm text-success">Connecté</span>
          </div>
          <p class="mb-4 text-sm text-gray-600">Analyse de trafic</p>
          <button class="w-full rounded border px-4 py-2 hover:bg-gray-100">Configurer</button>
        </div>
      </div>
    </div>
</template>

<script setup lang="ts">
</script>
