<template>
  <div class="px-2 py-4 sm:p-6 space-y-4 sm:space-y-6">
    <PageBreadcrumb :pageTitle="currentPageTitle" class="hidden sm:block" />

    <div class="max-w-7xl mx-auto">
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden sm:bg-white sm:dark:bg-gray-800 bg-transparent dark:bg-transparent border-none dark:border-none shadow-none sm:border sm:dark:border-gray-700 sm:shadow-sm">
        <!-- Tabs (Admin Only) -->
        <div v-if="authStore.isAdmin" class="border-b border-gray-200 dark:border-gray-700">
          <nav class="flex space-x-8 px-6" aria-label="Tabs">
            <button
              @click="activeTab = 'all'"
              :class="[
                activeTab === 'all'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400',
                'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-all'
              ]"
            >
              Catalogue Complet
            </button>
            <button
              @click="activeTab = 'moderation'"
              :class="[
                activeTab === 'moderation'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400',
                'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-all flex items-center gap-2'
              ]"
            >
              Modération
              <span v-if="pendingCount > 0" class="bg-red-100 text-red-600 px-2 py-0.5 rounded-full text-[10px] font-bold">
                {{ pendingCount }}
              </span>
            </button>
          </nav>
        </div>

        <template v-if="activeTab === 'all'">
          <!-- Header -->
          <div class="px-4 py-6 sm:px-6 sm:py-6 flex flex-row justify-between items-center gap-4 bg-white dark:bg-gray-800 rounded-t-xl sm:rounded-none">
            <div>
              <h2 class="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                Liste des produits
              </h2>
              <p class="text-sm text-gray-600 dark:text-gray-400 mt-1 hidden sm:block">
                Gérez votre catalogue de produits, stocks et prix
              </p>
            </div>
            <div class="flex items-center gap-2">
              <button
                 @click="loadProduits"
                 class="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span class="hidden sm:inline">Actualiser</span>
              </button>
              <router-link
                to="/ajouter-produit"
                class="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700 transition-all"
              >
                <svg class="h-5 w-5 sm:mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" />
                </svg>
                <span class="hidden sm:inline">Ajouter</span>
              </router-link>
            </div>
          </div>

        <!-- Filtres et recherche -->
        <div class="p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
          <div class="grid grid-cols-1 gap-4 md:grid-cols-12">
            <div class="md:col-span-4">
              <div class="relative">
                <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  v-model="searchQuery"
                  placeholder="Rechercher un produit..."
                  class="block w-full rounded-lg border-gray-300 py-2.5 pl-10 pr-3 text-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>
            <div class="md:col-span-3">
              <select
                v-model="selectedCategory"
                class="block w-full rounded-lg border-gray-300 py-2.5 pl-3 pr-10 text-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="">Toutes les catégories</option>
                <option v-for="category in categories" :key="category" :value="category">
                  {{ category }}
                </option>
              </select>
            </div>
            <div class="md:col-span-5 flex items-center gap-4 flex-wrap">
              <div class="flex items-center p-2 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                <input
                  id="vedette"
                  v-model="filtreVedette"
                  type="checkbox"
                  class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                />
                <label for="vedette" class="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1 cursor-pointer">
                  <svg class="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                  Vedettes
                </label>
              </div>
              <div class="flex items-center p-2 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                <input
                  id="nouveau"
                  v-model="filtreNouveau"
                  type="checkbox"
                  class="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700"
                />
                <label for="nouveau" class="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1 cursor-pointer">
                  <svg class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  Nouveaux
                </label>
              </div>
            </div>
          </div>
        </div>
        <!-- Tableau des produits -->
        <div class="hidden sm:block overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead class="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Produit
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Prix
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Stock
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Vendeur
                </th>
                <th scope="col" class="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
              <!-- Loading state -->
              <tr v-if="loading">
                <td colspan="5" class="px-6 py-12 text-center">
                  <div class="inline-flex items-center flex-col">
                    <svg class="animate-spin h-8 w-8 text-primary-600 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span class="text-sm text-gray-500">Chargement des produits...</span>
                  </div>
                </td>
              </tr>

              <!-- Error state -->
              <tr v-else-if="error">
                <td colspan="5" class="px-6 py-8 text-center">
                  <div class="text-red-600 bg-red-50 p-4 rounded-lg inline-block">{{ error }}</div>
                </td>
              </tr>

              <!-- Products list -->
              <tr v-else v-for="produit in paginatedProduits" :key="produit.id" class="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <td class="whitespace-nowrap px-6 py-4">
                  <div class="flex items-center">
                    <div class="h-12 w-12 flex-shrink-0 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden bg-white">
                      <img class="h-full w-full object-cover" :src="produit.image_url || 'https://placehold.co/48x48/f1f5f9/64748b?text=P'" alt="" />
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
                        {{ produit.name }}
                        <span v-if="produit.is_featured" class="inline-flex items-center rounded-full bg-blue-100 px-1.5 py-0.5 text-xs font-medium text-blue-800" title="Produit vedette">
                          <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                        </span>
                        <span v-if="produit.is_new" class="inline-flex items-center rounded-full bg-green-100 px-1.5 py-0.5 text-xs font-medium text-green-800" title="Nouveau produit">
                          New
                        </span>
                      </div>
                      <div class="text-[10px] font-bold text-gray-400 mt-0.5 uppercase tracking-wide">{{ formatProductId(produit.id) }}</div>
                      <div class="text-xs text-gray-500 dark:text-gray-400 truncate max-w-xs">{{ produit.description || 'Aucune description' }}</div>
                    </div>
                  </div>
                </td>
                <td class="whitespace-nowrap px-6 py-4">
                  <div class="text-sm font-semibold text-gray-900 dark:text-white">{{ formatPrix(produit.price) }}</div>
                </td>
                <td class="whitespace-nowrap px-6 py-4">
                  <div class="flex items-center">
                    <div :class="[
                      'h-2.5 w-2.5 rounded-full mr-2',
                      produit.status === 'Supprimé' ? 'bg-gray-500' : (produit.stock > 10 ? 'bg-green-500' : (produit.stock > 0 ? 'bg-yellow-500' : 'bg-red-500'))
                    ]"></div>
                    <span class="text-sm text-gray-700 dark:text-gray-300">
                      <span v-if="produit.status === 'Supprimé'" class="font-bold text-gray-600 dark:text-gray-400">Supprimé</span>
                      <span v-else>{{ produit.stock }} en stock</span>
                    </span>
                  </div>
                </td>
                <td class="whitespace-nowrap px-6 py-4">
                  <div class="flex items-center">
                    <div class="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 mr-2">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <span class="text-sm text-gray-700 dark:text-gray-300">{{ produit.store_name }}</span>
                  </div>
                </td>
                <td class="whitespace-nowrap px-6 py-4 text-center">
                  <div class="flex justify-center space-x-3">
                    <button 
                      @click="editProduit(produit.id)" 
                      class="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors p-1 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded"
                      title="Modifier"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button 
                      @click="deleteProduit(produit)" 
                      class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 transition-colors p-1 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"
                      title="Supprimer"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>

              <!-- Empty state -->
              <tr v-if="!loading && !error && filteredProduits.length === 0">
                <td colspan="5" class="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                  <div class="flex flex-col items-center">
                    <svg class="w-12 h-12 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                    <p class="text-lg font-medium text-gray-900 dark:text-white">Aucun produit trouvé</p>
                    <p class="text-sm">Essayez de modifier vos filtres ou ajoutez un nouveau produit.</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Version Mobile (Cartes) -->
        <div class="sm:hidden divide-y divide-gray-200 dark:divide-gray-700">
          <div v-if="loading" class="px-6 py-12 text-center text-gray-500">
             Chargement...
          </div>
          <div v-else-if="filteredProduits.length === 0" class="px-6 py-12 text-center text-gray-500">
             Aucun produit trouvé
          </div>
          <div v-else v-for="produit in paginatedProduits" :key="produit.id" class="p-4 bg-white dark:bg-gray-800 mb-2 rounded-xl shadow-sm sm:shadow-none sm:rounded-none sm:mb-0">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="h-12 w-12 rounded-lg border border-gray-100 dark:border-gray-700 overflow-hidden bg-white">
                  <img :src="produit.image_url || 'https://placehold.co/48x48/f1f5f9/64748b?text=P'" alt="" class="h-full w-full object-cover" />
                </div>
                <div class="min-w-0">
                  <h5 class="font-bold text-gray-900 dark:text-white truncate flex items-center gap-2">
                    {{ produit.name }}
                    <span v-if="produit.status === 'Supprimé'" class="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-800 dark:bg-gray-800 dark:text-gray-200">
                      Supprimé
                    </span>
                  </h5>
                   <p class="text-xs text-gray-500 dark:text-gray-400">{{ formatPrix(produit.price) }}</p>
                  <p class="text-xs font-medium text-blue-600 dark:text-blue-400 mt-1 flex items-center gap-1">
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    {{ produit.store_name }}
                  </p>
                </div>
              </div>
              <div class="flex items-center gap-1">
                <button 
                  @click="editProduit(produit.id)"
                  class="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                >
                   <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                   </svg>
                </button>
                <button 
                  @click="deleteProduit(produit)"
                  class="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="filteredProduits.length > 0" class="px-4 py-4 sm:px-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30 flex items-center justify-between">
          <div class="flex-1 flex justify-between sm:hidden">
            <button 
              @click="currentPage--" 
              :disabled="currentPage === 1"
              class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Précédent
            </button>
            <button 
              @click="currentPage++" 
              :disabled="currentPage >= totalPages"
              class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Suivant
            </button>
          </div>
          <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div class="text-sm text-gray-700 dark:text-gray-300">
              Affichage de <span class="font-medium text-gray-900 dark:text-white">{{ (currentPage - 1) * itemsPerPage + 1 }}</span> à 
              <span class="font-medium text-gray-900 dark:text-white">{{ Math.min(currentPage * itemsPerPage, filteredProduits.length) }}</span> sur 
              <span class="font-medium text-gray-900 dark:text-white">{{ filteredProduits.length }}</span> produits
            </div>
            <nav class="relative z-0 inline-flex rounded-lg shadow-sm -space-x-px" aria-label="Pagination">
              <button 
                @click="currentPage--" 
                :disabled="currentPage === 1"
                class="relative inline-flex items-center px-2 py-2 rounded-l-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <span class="sr-only">Précédent</span>
                <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
              </button>
              
              <button 
                v-for="page in totalPages" 
                :key="page"
                @click="currentPage = page"
                :class="{
                  'bg-blue-50 dark:bg-blue-900/30 border-blue-500 text-blue-600 dark:text-blue-400 z-10': currentPage === page,
                  'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700': currentPage !== page
                }"
                class="relative inline-flex items-center px-4 py-2 border text-sm font-medium transition-colors"
              >
                {{ page }}
              </button>
              
              <button 
                @click="currentPage++" 
                :disabled="currentPage >= totalPages"
                class="relative inline-flex items-center px-2 py-2 rounded-r-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <span class="sr-only">Suivant</span>
                <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                </svg>
              </button>
            </nav>
          </div>
        </div>
      </template>

      <!-- Moderation Tab Content -->
      <div v-else-if="activeTab === 'moderation'" class="p-6">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl font-bold dark:text-white">Produits en attente de modération</h2>
          <button @click="loadProduits" class="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg">
            <i class="fas fa-sync-alt" :class="{ 'animate-spin': loading }"></i>
          </button>
        </div>

        <div v-if="loading" class="text-center py-20 text-gray-500">
          <i class="fas fa-spinner fa-spin text-3xl mb-4"></i>
          <p>Chargement des produits...</p>
        </div>

        <div v-else-if="pendingProducts.length === 0" class="text-center py-20 bg-gray-50 dark:bg-gray-900 rounded-xl">
          <i class="fas fa-check-circle text-green-500 text-5xl mb-4"></i>
          <h3 class="text-lg font-bold dark:text-white">Tout est à jour !</h3>
          <p class="text-gray-500">Il n'y a aucun produit en attente de modération.</p>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="product in pendingProducts" :key="product.id" class="bg-gray-50 dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-all border-t-4 border-t-orange-500">
            <img :src="product.image_url" class="w-full h-48 object-cover" />
            <div class="p-6 space-y-4">
              <div>
                <div class="flex items-center justify-between mb-1">
                  <span class="text-[10px] font-bold text-orange-600 uppercase tracking-widest bg-orange-50 px-2 py-0.5 rounded">En attente</span>
                  <span class="text-xs text-gray-500">{{ formatDateShort(product.created_at) }}</span>
                </div>
                <h4 class="font-bold text-gray-900 dark:text-white">{{ product.name }}</h4>
                <p class="text-xs text-gray-500 line-clamp-2 mt-1">{{ product.description }}</p>
              </div>

              <div class="flex items-center gap-2 py-2 border-y border-gray-100 dark:border-gray-700">
                <div class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                  {{ product.store?.name?.charAt(0) }}
                </div>
                <div>
                  <p class="text-[10px] text-gray-400 uppercase font-bold">Boutique</p>
                  <p class="text-xs font-bold dark:text-white">{{ product.store?.name }}</p>
                </div>
              </div>

              <div class="flex justify-between items-center">
                <span class="text-lg font-black text-gray-900 dark:text-white">{{ formatPrix(product.price) }}</span>
                <div class="flex gap-2">
                  <button @click="approveProduct(product.id)" class="w-10 h-10 rounded-xl bg-green-100 text-green-600 hover:bg-green-600 hover:text-white transition-all">
                    <i class="fas fa-check"></i>
                  </button>
                  <button @click="rejectProduct(product.id)" class="w-10 h-10 rounded-xl bg-red-100 text-red-600 hover:bg-red-600 hover:text-white transition-all">
                    <i class="fas fa-times"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  </div>

    <!-- Modal Motif de Suppression -->
    <div v-if="showDeleteReasonModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-300">
        <div class="flex items-center gap-3 mb-4 text-red-600">
          <div class="w-12 h-12 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 class="text-xl font-bold">Confirmer la suppression</h3>
        </div>

        <p class="text-gray-600 dark:text-gray-400 mb-4">
          Vous êtes sur le point de supprimer le produit <strong>{{ productToDelete?.name }}</strong>. 
          Veuillez indiquer le motif de suppression pour le vendeur.
        </p>

        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Motif de suppression</label>
          <textarea 
            v-model="deleteReason"
            placeholder="Ex: Image non conforme, description inappropriée, produit interdit..."
            rows="3"
            class="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-red-500 transition-all outline-none resize-none"
          ></textarea>
        </div>

        <div class="flex gap-3">
          <button 
            @click="showDeleteReasonModal = false"
            class="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
          >
            Annuler
          </button>
          <button 
            @click="confirmDelete"
            :disabled="isDeleting || !deleteReason.trim()"
            class="flex-1 px-4 py-3 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            <svg v-if="isDeleting" class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Supprimer
          </button>
        </div>
      </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue';
import { productService, vendorService, adminService } from '@/services/api';
import { useAuthStore } from '@/stores/auth';
import { useUIStore } from '@/stores/ui';
import { formatProductId } from '@/utils/formatters';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const currentPageTitle = ref('Liste des produits');

// Interface locale étendue pour l'affichage (avec category string et status)
interface ProductDisplay {
  id: number;
  name: string;
  price: number;
  category: string; // Nom de la catégorie
  category_id?: number;
  stock: number;
  status: string; // Calculé
  image_url: string;
  description: string;
  is_featured?: boolean;
  is_new?: boolean;
  store_name: string;
}

const produits = ref<ProductDisplay[]>([]);
const loading = ref(false);
const error = ref('');

const activeTab = ref('all');
const searchQuery = ref('');
const selectedCategory = ref('');
const filtreVedette = ref(false);
const filtreNouveau = ref(false);
const currentPage = ref(1);

const pendingProducts = ref<any[]>([]);
const pendingCount = computed(() => pendingProducts.value.length);
const itemsPerPage = 10;

// Charger les produits depuis l'API
const loadProduits = async () => {
  loading.value = true;
  error.value = '';
  try {
    const role = authStore.user?.role?.toLowerCase();
    
    // Charger le catalogue normal
    let data;
    if (role === 'seller') {
      data = await vendorService.getProducts();
    } else {
      data = await productService.getAll();
    }
    
    // Mapper les données de l'API vers le format d'affichage
    const productsArray = Array.isArray(data) ? data : (data?.products || []);
    produits.value = productsArray.map((p: any) => ({
      id: p.id,
      name: p.name,
      price: parseFloat(p.price),
      category: p.category?.name || 'Non catégorisé',
      category_id: p.category_id,
      stock: p.stock,
      status: p.status === 'deleted' ? 'Supprimé' : (p.status === 'pending' ? 'En modération' : (p.stock > 0 ? 'Disponible' : 'Rupture')),
      image_url: p.image_url || '',
      description: p.description,
      is_featured: p.is_featured,
      is_new: p.is_new,
      store_name: p.store?.name || 'HTFasil'
    }));

    // Si admin, charger aussi les produits en attente
    if (authStore.isAdmin) {
      const moderationData = await adminService.getProductsToModerate();
      pendingProducts.value = moderationData.products || [];
    }
  } catch (e) {
    console.error('Erreur chargement produits', e);
    error.value = 'Impossible de charger les produits. Veuillez réessayer.';
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  if (route.query.tab === 'moderation' && authStore.isAdmin) {
    activeTab.value = 'moderation';
  }
  loadProduits();
});

// Extraire les catégories uniques des produits
const categories = computed(() => {
  const cats = new Set(produits.value.map(p => p.category).filter(Boolean));
  return Array.from(cats).sort();
});

// Produits filtrés
const filteredProduits = computed(() => {
  return produits.value.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.value.toLowerCase()) || 
                          (product.description && product.description.toLowerCase().includes(searchQuery.value.toLowerCase()));
    const matchesCategory = selectedCategory.value ? product.category === selectedCategory.value : true;
    const matchesVedette = filtreVedette.value ? product.is_featured : true;
    const matchesNouveau = filtreNouveau.value ? product.is_new : true;
    const isNotDeleted = product.status !== 'Supprimé';
    
    return matchesSearch && matchesCategory && matchesVedette && matchesNouveau && isNotDeleted;
  });
});

// Pagination
const paginatedProduits = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredProduits.value.slice(start, end);
});

const totalPages = computed(() => Math.ceil(filteredProduits.value.length / itemsPerPage));

const uiStore = useUIStore();
const showDeleteReasonModal = ref(false);
const productToDelete = ref<ProductDisplay | null>(null);
const deleteReason = ref('');
const isDeleting = ref(false);

const formatDateShort = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short'
  });
};

const approveProduct = async (id: number) => {
  const confirmed = await uiStore.confirm({
    title: 'Approuver le produit',
    message: 'Souhaitez-vous autoriser la vente de ce produit sur la plateforme ?',
    confirmText: 'Oui, Approuver'
  });

  if (!confirmed) return;

  try {
    await adminService.approveProduct(id);
    uiStore.addToast('Produit approuvé avec succès', 'success');
    await loadProduits();
  } catch (error) {
    console.error('Erreur approbation produit:', error);
    uiStore.addToast('Erreur lors de l\'approbation', 'error');
  }
};

const rejectProduct = async (id: number) => {
  const reason = await uiStore.prompt({
    title: 'Motif du rejet',
    message: 'Pourquoi refusez-vous ce produit ?',
    placeholder: 'Ex: Qualité image insuffisante, description non conforme...'
  });

  if (!reason) return;

  try {
    await adminService.rejectProduct(id, { reason });
    uiStore.addToast('Produit rejeté', 'info');
    await loadProduits();
  } catch (error) {
    console.error('Erreur rejet produit:', error);
    uiStore.addToast('Erreur lors du rejet', 'error');
  }
};

// Formater le prix
const formatPrix = (prix: number) => {
  return `${new Intl.NumberFormat('fr-FR').format(prix)} HTG`;
};

// Actions
const editProduit = (id: number) => {
  router.push(`/modifier-produit/${id}`);
};

const deleteProduit = (product: ProductDisplay) => {
  productToDelete.value = product;
  deleteReason.value = '';
  showDeleteReasonModal.value = true;
};

const confirmDelete = async () => {
  if (!productToDelete.value) return;
  if (!deleteReason.value.trim()) {
    alert('Veuillez entrer un motif de suppression');
    return;
  }

  isDeleting.value = true;
  try {
    await productService.delete(productToDelete.value.id, deleteReason.value);
    showDeleteReasonModal.value = false;
    productToDelete.value = null;
    deleteReason.value = '';
    // Recharger la liste après suppression
    await loadProduits();
  } catch (e) {
    console.error('Erreur suppression produit', e);
    alert('Erreur lors de la suppression du produit');
  } finally {
    isDeleting.value = false;
  }
};
</script>

<style scoped>
/* Styles spécifiques au composant */
</style>
