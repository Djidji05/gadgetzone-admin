<template>
  <div class="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
    <h2 class="mb-6 text-title-md2 font-bold text-black dark:text-white">Paramètres de sécurité</h2>
    
    <div class="space-y-6">
      <!-- Authentification -->
      <div class="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
        <h3 class="mb-4 text-xl font-bold">Authentification</h3>
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="font-medium">Authentification à deux facteurs (2FA)</p>
              <p class="text-sm text-gray-600">Ajoutez une couche de sécurité supplémentaire</p>
            </div>
            <label class="relative inline-flex cursor-pointer items-center">
              <input type="checkbox" class="peer sr-only" checked />
              <div class="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
            </label>
          </div>
          
          <div class="flex items-center justify-between">
            <div>
              <p class="font-medium">Connexion par email</p>
              <p class="text-sm text-gray-600">Recevoir un code par email à chaque connexion</p>
            </div>
            <label class="relative inline-flex cursor-pointer items-center">
              <input type="checkbox" class="peer sr-only" />
              <div class="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
            </label>
          </div>
        </div>
      </div>

      <!-- Mots de passe -->
      <div class="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
        <h3 class="mb-4 text-xl font-bold">Politique de mots de passe</h3>
        <div class="space-y-4">
          <div>
            <label class="mb-2 block text-sm font-medium">Longueur minimale</label>
            <input type="number" value="8" class="w-full rounded border border-stroke bg-gray px-4 py-2 dark:border-strokedark dark:bg-meta-4" />
          </div>
          <div class="flex items-center gap-2">
            <input type="checkbox" checked class="h-4 w-4" />
            <label class="text-sm">Exiger au moins une majuscule</label>
          </div>
          <div class="flex items-center gap-2">
            <input type="checkbox" checked class="h-4 w-4" />
            <label class="text-sm">Exiger au moins un chiffre</label>
          </div>
          <div class="flex items-center gap-2">
            <input type="checkbox" class="h-4 w-4" />
            <label class="text-sm">Exiger au moins un caractère spécial</label>
          </div>
        </div>
      </div>

      <!-- Sessions -->
      <div class="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
        <h3 class="mb-4 text-xl font-bold">Gestion des sessions</h3>
        <div class="space-y-4">
          <div>
            <label class="mb-2 block text-sm font-medium">Durée de session (minutes)</label>
            <input type="number" value="60" class="w-full rounded border border-stroke bg-gray px-4 py-2 dark:border-strokedark dark:bg-meta-4" />
          </div>
          <div class="flex items-center gap-2">
            <input type="checkbox" checked class="h-4 w-4" />
            <label class="text-sm">Déconnexion automatique après inactivité</label>
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
