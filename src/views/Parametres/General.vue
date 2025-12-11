<template>
  <div class="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
      <h2 class="mb-6 text-title-md2 font-bold text-black dark:text-white">Paramètres Système</h2>
      
      <div class="grid grid-cols-1 gap-6">
        <!-- Général -->
        <div class="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
          <h3 class="mb-4 text-xl font-bold">Paramètres généraux</h3>
          <div class="space-y-4">
            <div>
              <label class="mb-2 block text-sm font-medium">Nom du site</label>
              <input type="text" value="GadgetZone Admin" class="w-full rounded border border-stroke bg-gray px-4 py-2 dark:border-strokedark dark:bg-meta-4" />
            </div>
            <div>
              <label class="mb-2 block text-sm font-medium">Email de contact</label>
              <input type="email" value="contact@gadgetzone.com" class="w-full rounded border border-stroke bg-gray px-4 py-2 dark:border-strokedark dark:bg-meta-4" />
            </div>
          </div>
        </div>

        <!-- Sécurité -->
        <div class="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
          <h3 class="mb-4 text-xl font-bold">Sécurité</h3>
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <p class="font-medium">Authentification à deux facteurs</p>
                <p class="text-sm text-gray-600">Activer 2FA pour tous les utilisateurs</p>
              </div>
              <label class="relative inline-flex cursor-pointer items-center">
                <input type="checkbox" class="peer sr-only" checked />
                <div class="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:border-gray-600 dark:bg-gray-700 dark:peer-focus:ring-blue-800"></div>
              </label>
            </div>
          </div>
        </div>

        <button class="rounded bg-primary px-6 py-3 text-white hover:bg-opacity-90">
          Enregistrer les modifications
        </button>
      </div>
    </div>
</template>

<script setup lang="ts">
</script>
