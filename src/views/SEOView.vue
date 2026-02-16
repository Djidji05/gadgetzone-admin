<template>
  <div class="p-4 mx-auto max-w-7xl">
    <div class="flex flex-row items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Gestion SEO</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400">Optimisez le référencement de votre boutique</p>
      </div>
      <button
        @click="saveSEO"
        :disabled="isSaving"
        class="flex items-center gap-2 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
      >
        <svg v-if="isSaving" class="w-5 h-5 animate-spin" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        {{ isSaving ? 'Enregistrement...' : 'Enregistrer les modifications' }}
      </button>
    </div>

    <!-- Interface par Onglets -->
    <div class="mb-6 border-b border-gray-200 dark:border-gray-800">
      <ul class="flex flex-wrap -mb-px text-sm font-medium text-center">
        <li v-for="tab in tabs" :key="tab.id" class="mr-2">
          <button
            @click="activeTab = tab.id"
            :class="[
              'inline-block p-4 border-b-2 rounded-t-lg transition-colors',
              activeTab === tab.id
                ? 'text-blue-600 border-blue-600 dark:text-blue-500 dark:border-blue-500'
                : 'border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300'
            ]"
          >
            {{ tab.label }}
          </button>
        </li>
      </ul>
    </div>

    <!-- Contenu des Onglets -->
    <div v-show="activeTab === 'general'" class="space-y-6">
      <div class="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800">
        <h3 class="text-lg font-semibold mb-4 dark:text-white">Balises Meta Globales</h3>
        <div class="grid gap-6">
          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Titre du site (Meta Title)</label>
            <input
              v-model="seoData.metaTitle"
              type="text"
              class="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
              placeholder="Ex: GadgetZone - La meilleure boutique de gadgets"
            />
            <p class="text-xs text-gray-500">Recommandé : 50-60 caractères. Actuel : {{ seoData.metaTitle.length }}</p>
          </div>

          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Description du site (Meta Description)</label>
            <textarea
              v-model="seoData.metaDescription"
              rows="3"
              class="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
              placeholder="Décrivez votre boutique en quelques phrases..."
            ></textarea>
            <p class="text-xs text-gray-500">Recommandé : 150-160 caractères. Actuel : {{ seoData.metaDescription.length }}</p>
          </div>

          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Mots-clés (Keywords)</label>
            <input
              v-model="seoData.keywords"
              type="text"
              class="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
              placeholder="gadget, tech, boutique, smartphone (séparés par des virgules)"
            />
          </div>
        </div>
      </div>

      <!-- Preview Google -->
      <div class="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 mt-6">
        <h3 class="text-lg font-semibold mb-4 dark:text-white">Aperçu Google</h3>
        <div class="p-4 bg-gray-50 dark:bg-black rounded-lg border border-gray-200 dark:border-gray-800 max-w-xl">
          <div class="text-sm text-gray-600 dark:text-gray-400 mb-1">https://gadgetzone.com › ...</div>
          <div class="text-xl text-blue-700 dark:text-blue-400 hover:underline cursor-pointer mb-1">
            {{ seoData.metaTitle || 'Titre de votre site | Boutique GadgetZone' }}
          </div>
          <div class="text-sm text-gray-700 dark:text-gray-300 leading-snug">
            {{ seoData.metaDescription || 'Veuillez saisir une description méta pour voir comment votre site apparaîtra dans les résultats de recherche Google.' }}
          </div>
        </div>
      </div>
    </div>

    <!-- Social Media -->
    <div v-show="activeTab === 'social'" class="space-y-6">
      <div class="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800">
        <h3 class="text-lg font-semibold mb-4 dark:text-white">Open Graph (Facebook, LinkedIn)</h3>
        <div class="grid gap-6">
          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Titre Social</label>
            <input
              v-model="seoData.ogTitle"
              type="text"
              class="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
            />
          </div>
          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Image de partage (URL)</label>
            <div class="flex gap-4">
              <input
                v-model="seoData.ogImage"
                type="text"
                class="flex-1 px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
                placeholder="https://..."
              />
              <button class="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600">
                Parcourir
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800">
        <h3 class="text-lg font-semibold mb-4 dark:text-white">Twitter Card</h3>
        <div class="space-y-4">
          <div class="flex items-center gap-4">
            <label class="flex items-center cursor-pointer">
              <input type="checkbox" v-model="seoData.twitterEnabled" class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500">
              <span class="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">Activer les Twitter Cards</span>
            </label>
          </div>
          <div v-if="seoData.twitterEnabled" class="grid gap-4 pl-8">
            <div class="space-y-2">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Nom d'utilisateur Twitter (@username)</label>
              <input v-model="seoData.twitterUser" type="text" class="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none dark:text-white" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Advanced / Tracking -->
    <div v-show="activeTab === 'advanced'" class="space-y-6">
      <div class="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800">
        <h3 class="text-lg font-semibold mb-4 dark:text-white">Scripts de Tracking</h3>
        <div class="space-y-6">
          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Code Head (Google Analytics, GTM, etc.)</label>
            <textarea
              v-model="seoData.headScripts"
              rows="6"
              class="w-full p-4 font-mono text-xs bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-700 rounded-lg outline-none dark:text-green-400"
              placeholder="&lt;script&gt;...&lt;/script&gt;"
            ></textarea>
            <p class="text-xs text-gray-500">Ce code sera inséré dans la balise &lt;head&gt; de chaque page.</p>
          </div>
          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Code Body (Pixels, Chat widgets, etc.)</label>
            <textarea
              v-model="seoData.bodyScripts"
              rows="6"
              class="w-full p-4 font-mono text-xs bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-700 rounded-lg outline-none dark:text-green-400"
              placeholder="&lt;script&gt;...&lt;/script&gt;"
            ></textarea>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'

const isSaving = ref(false)
const activeTab = ref('general')

const tabs = [
  { id: 'general', label: 'Configuration Générale' },
  { id: 'social', label: 'Réseaux Sociaux' },
  { id: 'advanced', label: 'Scripts & Tracking' }
]

const seoData = reactive({
  metaTitle: 'GadgetZone - Le paradis des High-Tech',
  metaDescription: 'Découvrez les meilleurs gadgets, smartphones et objets connectés au meilleur prix sur GadgetZone.',
  keywords: 'gadgets, tech, smartphones, drones, montres connectées',
  ogTitle: '',
  ogImage: '',
  twitterEnabled: true,
  twitterUser: '@gadgetzone',
  headScripts: '',
  bodyScripts: ''
})

const saveSEO = async () => {
  isSaving.value = true
  // Simulation d'appel API
  await new Promise(resolve => setTimeout(resolve, 1500))
  isSaving.value = false
  alert('Configurations SEO enregistrées avec succès !')
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 10px;
}
.dark .custom-scrollbar::-webkit-scrollbar-thumb {
  background: #1e293b;
}
</style>
