<template>
  <div class="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
    <h2 class="mb-6 text-title-md2 font-bold text-black dark:text-white">Paramètres Email</h2>
    
    <div class="space-y-6">
      <!-- Configuration SMTP -->
      <div class="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
        <h3 class="mb-4 text-xl font-bold">Configuration SMTP</h3>
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label class="mb-2 block text-sm font-medium">Serveur SMTP</label>
            <input type="text" placeholder="smtp.example.com" class="w-full rounded border border-stroke bg-gray px-4 py-2 dark:border-strokedark dark:bg-meta-4" />
          </div>
          <div>
            <label class="mb-2 block text-sm font-medium">Port</label>
            <input type="number" value="587" class="w-full rounded border border-stroke bg-gray px-4 py-2 dark:border-strokedark dark:bg-meta-4" />
          </div>
          <div>
            <label class="mb-2 block text-sm font-medium">Nom d'utilisateur</label>
            <input type="text" placeholder="user@example.com" class="w-full rounded border border-stroke bg-gray px-4 py-2 dark:border-strokedark dark:bg-meta-4" />
          </div>
          <div>
            <label class="mb-2 block text-sm font-medium">Mot de passe</label>
            <input type="password" class="w-full rounded border border-stroke bg-gray px-4 py-2 dark:border-strokedark dark:bg-meta-4" />
          </div>
        </div>
        <div class="mt-4">
          <button class="rounded border px-4 py-2 hover:bg-gray-100">Tester la connexion</button>
        </div>
      </div>

      <!-- Emails automatiques -->
      <div class="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
        <h3 class="mb-4 text-xl font-bold">Emails automatiques</h3>
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="font-medium">Email de confirmation de commande</p>
              <p class="text-sm text-gray-600">Envoyé automatiquement après chaque commande</p>
            </div>
            <label class="relative inline-flex cursor-pointer items-center">
              <input type="checkbox" class="peer sr-only" checked />
              <div class="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
            </label>
          </div>
          
          <div class="flex items-center justify-between">
            <div>
              <p class="font-medium">Email de suivi de livraison</p>
              <p class="text-sm text-gray-600">Envoyé quand le statut de livraison change</p>
            </div>
            <label class="relative inline-flex cursor-pointer items-center">
              <input type="checkbox" class="peer sr-only" checked />
              <div class="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
            </label>
          </div>

          <div class="flex items-center justify-between">
            <div>
              <p class="font-medium">Email de bienvenue</p>
              <p class="text-sm text-gray-600">Envoyé aux nouveaux clients</p>
            </div>
            <label class="relative inline-flex cursor-pointer items-center">
              <input type="checkbox" class="peer sr-only" checked />
              <div class="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
            </label>
          </div>
        </div>
      </div>

      <!-- Expéditeur -->
      <div class="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
        <h3 class="mb-4 text-xl font-bold">Informations de l'expéditeur</h3>
        <div class="space-y-4">
          <div>
            <label class="mb-2 block text-sm font-medium">Nom de l'expéditeur</label>
            <input type="text" value="GadgetZone" class="w-full rounded border border-stroke bg-gray px-4 py-2 dark:border-strokedark dark:bg-meta-4" />
          </div>
          <div>
            <label class="mb-2 block text-sm font-medium">Email de l'expéditeur</label>
            <input type="email" value="noreply@gadgetzone.com" class="w-full rounded border border-stroke bg-gray px-4 py-2 dark:border-strokedark dark:bg-meta-4" />
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
