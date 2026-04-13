<template>
  <div class="px-2 py-4 sm:p-6 space-y-4 sm:space-y-6">
    <!-- En-tête de la page -->
    <div class="flex flex-row justify-between items-center gap-4">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Gestion des Clients</h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Gérez votre base de clients et leurs informations
        </p>
      </div>
      <div class="flex items-center gap-3">
        <button
          @click="loadUsers"
          class="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span class="hidden sm:inline">Actualiser</span>
        </button>
      </div>
    </div>

    <!-- Cartes de statistiques -->
    <div class="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <!-- Total Clients -->
      <div class="group sm:rounded-2xl sm:border border-transparent sm:border-gray-200 sm:bg-white p-5 sm:dark:border-gray-800 bg-transparent dark:bg-transparent sm:dark:bg-white/[0.03] hover:shadow-lg transition-all duration-300 hover:border-blue-300 dark:hover:border-blue-700">
        <div class="flex items-center justify-between">
          <div class="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl dark:from-blue-900/30 dark:to-blue-800/30 group-hover:scale-110 transition-transform duration-300">
            <svg class="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
        </div>
        <div class="mt-4">
          <p class="text-sm text-gray-500 dark:text-gray-400">Total Clients</p>
          <p class="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{{ users.length }}</p>
        </div>
      </div>

      <!-- Clients Actifs -->
      <div class="group sm:rounded-2xl sm:border border-transparent sm:border-gray-200 sm:bg-white p-5 sm:dark:border-gray-800 bg-transparent dark:bg-transparent sm:dark:bg-white/[0.03] hover:shadow-lg transition-all duration-300 hover:border-emerald-300 dark:hover:border-emerald-700">
        <div class="flex items-center justify-between">
          <div class="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl dark:from-emerald-900/30 dark:to-emerald-800/30 group-hover:scale-110 transition-transform duration-300">
            <svg class="w-6 h-6 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
        <div class="mt-4">
          <p class="text-sm text-gray-500 dark:text-gray-400">Clients Actifs</p>
          <p class="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{{ activeUsers }}</p>
        </div>
      </div>

      <!-- Nouveaux ce mois -->
      <div class="group sm:rounded-2xl sm:border border-transparent sm:border-gray-200 sm:bg-white p-5 sm:dark:border-gray-800 bg-transparent dark:bg-transparent sm:dark:bg-white/[0.03] hover:shadow-lg transition-all duration-300 hover:border-purple-300 dark:hover:border-purple-700">
        <div class="flex items-center justify-between">
          <div class="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl dark:from-purple-900/30 dark:to-purple-800/30 group-hover:scale-110 transition-transform duration-300">
            <svg class="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
        </div>
        <div class="mt-4">
          <p class="text-sm text-gray-500 dark:text-gray-400">Nouveaux ce mois</p>
          <p class="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{{ newUsersThisMonth }}</p>
        </div>
      </div>

      <!-- Vendeurs -->
      <div class="group sm:rounded-2xl sm:border border-transparent sm:border-gray-200 sm:bg-white p-5 sm:dark:border-gray-800 bg-transparent dark:bg-transparent sm:dark:bg-white/[0.03] hover:shadow-lg transition-all duration-300 hover:border-amber-300 dark:hover:border-amber-700">
        <div class="flex items-center justify-between">
          <div class="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl dark:from-amber-900/30 dark:to-amber-800/30 group-hover:scale-110 transition-transform duration-300">
            <svg class="w-6 h-6 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
        </div>
        <div class="mt-4">
          <p class="text-sm text-gray-500 dark:text-gray-400">Vendeurs</p>
          <p class="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{{ sellerUsers }}</p>
        </div>
      </div>
    </div>

    <!-- Filtres -->
    <div class="sm:bg-white sm:dark:bg-gray-800 sm:shadow-sm sm:rounded-2xl sm:border border-transparent sm:border-gray-200 sm:dark:border-gray-800 p-5">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="md:col-span-2">
          <label for="search" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Rechercher</label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
            <input 
              type="text" 
              id="search" 
              v-model="searchQuery"
              class="block w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm dark:bg-gray-700 dark:text-white transition-all"
              placeholder="Nom, email, téléphone..."
            >
          </div>
        </div>
        
        <div class="flex items-end">
          <button 
            @click="resetFilters"
            class="w-full inline-flex justify-center items-center gap-2 py-2.5 px-4 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-lg text-gray-700 dark:text-white bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-all"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Réinitialiser
          </button>
        </div>
      </div>
    </div>

    <!-- Tableau des clients -->
    <div class="sm:bg-white sm:dark:bg-gray-800 sm:shadow-sm overflow-hidden sm:rounded-2xl sm:border border-transparent sm:border-gray-200 sm:dark:border-gray-800">
      <!-- Vue Desktop (Tableau) -->
      <div class="hidden sm:block overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-900/50">
            <tr>
              <th scope="col" class="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Client</th>
              <th scope="col" class="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Contact</th>
              <th scope="col" class="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Rôle</th>
              <th scope="col" class="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Inscription</th>
              <th scope="col" class="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Statut</th>
              <th scope="col" class="relative px-6 py-4"><span class="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            <!-- State components -->
            <tr v-if="loading">
              <td colspan="5" class="px-6 py-12 text-center">
                <div class="inline-flex items-center gap-3">
                  <svg class="animate-spin h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span class="text-gray-600 dark:text-gray-400">Chargement...</span>
                </div>
              </td>
            </tr>
            <tr v-else-if="error">
              <td colspan="5" class="px-6 py-12 text-center"><div class="text-red-600 dark:text-red-400">{{ error }}</div></td>
            </tr>
            <tr v-else v-for="(user, index) in paginatedUsers" :key="user?.id || index" class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center gap-3">
                  <div class="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-full ring-2 ring-white dark:ring-gray-800">
                    <span class="text-indigo-700 dark:text-indigo-300 font-semibold text-sm">{{ user?.name ? user.name.charAt(0).toUpperCase() : '?' }}</span>
                  </div>
                  <div>
                    <div class="text-sm font-medium text-gray-900 dark:text-white">{{ user?.name || 'Nom inconnu' }}</div>
                    <div class="text-xs text-gray-500 dark:text-gray-400">ID: {{ formatClientId(user?.id) }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900 dark:text-white">{{ user?.email }}</div>
                <div class="text-xs text-gray-500 dark:text-gray-400">{{ user?.phone || 'Non renseigné' }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="getRoleBadgeClass(user?.role)" class="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold">
                  <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                  </svg>
                  {{ user?.role || 'Client' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900 dark:text-white">{{ formatDate(user?.created_at) }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span 
                  :class="[
                    'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold',
                    (user?.status === 'Inactif') 
                      ? 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 ring-1 ring-gray-600/20'
                      : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400 ring-1 ring-emerald-600/20'
                  ]"
                >
                  <span :class="['w-1.5 h-1.5 rounded-full', (user?.status === 'Inactif') ? 'bg-gray-400' : 'bg-emerald-500']"></span>
                  {{ user?.status || 'Actif' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div class="flex justify-end items-center gap-2">
                  <button 
                    @click="viewUser(user?.id)"
                    class="p-2 text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
                    title="Voir les détails"
                  >
                    <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                  <button 
                    @click="contactUser(user?.id)"
                    class="p-2 text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-all"
                    title="Contacter"
                  >
                    <i class="far fa-comment text-lg"></i>
                  </button>

                  <button 
                    @click="deleteUser(user?.id)" 
                    class="p-2 text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                    title="Supprimer"
                  >
                    <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="!loading && !error && filteredUsers.length === 0">
              <td colspan="5" class="px-6 py-12 text-center">
                <div class="flex flex-col items-center gap-3">
                  <svg class="w-16 h-16 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <p class="text-sm text-gray-500 dark:text-gray-400">Aucun client trouvé</p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Vue Mobile (Liste de cartes) -->
      <div class="sm:hidden divide-y divide-gray-200 dark:divide-gray-700">
        <div v-if="loading" class="px-6 py-12 text-center">
          <div class="inline-flex items-center gap-3">
            <svg class="animate-spin h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span class="text-gray-600 dark:text-gray-400">Chargement...</span>
          </div>
        </div>
        <div v-else-if="error" class="px-6 py-12 text-center text-red-600 dark:text-red-400">
          {{ error }}
        </div>
        <div v-else-if="filteredUsers.length === 0" class="px-6 py-12 text-center">
          <p class="text-sm text-gray-500 dark:text-gray-400">Aucun client trouvé</p>
        </div>
        <div v-else v-for="(user, index) in paginatedUsers" :key="user?.id || index" class="p-3">
          <div class="flex items-center justify-between gap-4">
            <div class="flex items-center gap-2 min-w-0">
              <div class="flex-shrink-0 h-8 w-8 flex items-center justify-center bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-full">
                <span class="text-indigo-700 dark:text-indigo-300 font-semibold text-xs">{{ user?.name ? user.name.charAt(0).toUpperCase() : '?' }}</span>
              </div>
              <div class="truncate">
                <div class="text-sm font-medium text-gray-900 dark:text-white truncate">{{ user?.name || 'Nom inconnu' }}</div>
                <div class="flex items-center gap-1.5 mt-0.5">
                   <span :class="['w-1.5 h-1.5 rounded-full', (user?.status === 'Inactif') ? 'bg-gray-400' : 'bg-emerald-500']"></span>
                   <span class="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{{ user?.status || 'Actif' }}</span>
                </div>
              </div>
            </div>
            
            <div class="flex items-center gap-1 flex-shrink-0">
              <button @click="viewUser(user?.id)" class="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg">
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
              </button>

              <button @click="deleteUser(user?.id)" class="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination Section -->
      <div v-if="filteredUsers.length > 0" class="bg-gray-50 dark:bg-gray-900/50 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 sm:px-6">
        <div class="flex-1 flex justify-between sm:hidden">
          <button 
            @click="currentPage--" 
            :disabled="currentPage === 1"
            class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Précédent
          </button>
          <button 
            @click="currentPage++" 
            :disabled="currentPage >= totalPages"
            class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Suivant
          </button>
        </div>
        <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p class="text-sm text-gray-700 dark:text-gray-300">
              Affichage de <span class="font-medium">{{ (currentPage - 1) * itemsPerPage + 1 }}</span> à 
              <span class="font-medium">{{ Math.min(currentPage * itemsPerPage, filteredUsers.length) }}</span> sur 
              <span class="font-medium">{{ filteredUsers.length }}</span> clients
            </p>
          </div>
          <div>
            <nav class="relative z-0 inline-flex rounded-lg shadow-sm -space-x-px" aria-label="Pagination">
              <button 
                @click="currentPage--" 
                :disabled="currentPage === 1"
                :class="{
                  'opacity-50 cursor-not-allowed': currentPage === 1,
                  'hover:bg-gray-50 dark:hover:bg-gray-700': currentPage > 1
                }"
                class="relative inline-flex items-center px-2 py-2 rounded-l-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-300"
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
                  'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700': currentPage !== page
                }"
                class="relative inline-flex items-center px-4 py-2 border text-sm font-medium"
              >
                {{ page }}
              </button>
              
              <button 
                @click="currentPage++" 
                :disabled="currentPage >= totalPages"
                :class="{
                  'opacity-50 cursor-not-allowed': currentPage >= totalPages,
                  'hover:bg-gray-50 dark:hover:bg-gray-700': currentPage < totalPages
                }"
                class="relative inline-flex items-center px-2 py-2 rounded-r-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-300"
              >
                <span class="sr-only">Suivant</span>
                <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                </svg>
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { userService } from '@/services/api';
import { useUIStore } from '@/stores/ui';
import { formatClientId } from '@/utils/formatters';

const router = useRouter();
const uiStore = useUIStore();
const users = ref<any[]>([]);
const loading = ref(false);
const error = ref('');
const searchQuery = ref('');

// Pagination
const currentPage = ref(1);
const itemsPerPage = 10;

const loadUsers = async () => {
  try {
    loading.value = true;
    error.value = '';
    const data = await userService.getAll();
    users.value = data;
  } catch (err: any) {
    error.value = err.message || 'Erreur lors du chargement des clients. Vérifiez que le serveur backend est démarré.';
    users.value = [];
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadUsers();
});

// Reset pagination when searching
watch(searchQuery, () => {
  currentPage.value = 1;
});

const filteredUsers = computed(() => {
  if (!searchQuery.value) return users.value;
  const query = searchQuery.value.toLowerCase();
  return users.value.filter(user => 
    user.name?.toLowerCase().includes(query) ||
    user.email?.toLowerCase().includes(query) ||
    (user.phone && user.phone.includes(query))
  );
});

// Users paginés
const paginatedUsers = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredUsers.value.slice(start, end);
});

// Total pages
const totalPages = computed(() => {
  return Math.ceil(filteredUsers.value.length / itemsPerPage);
});

const activeUsers = computed(() => users.value.filter(u => u.status === 'Actif' || !u.status).length);
const sellerUsers = computed(() => users.value.filter(u => u.role === 'seller' || u.role === 'vendeur').length);
const newUsersThisMonth = computed(() => {
  const now = new Date();
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();
  return users.value.filter(u => {
    if (!u.created_at) return false;
    const date = new Date(u.created_at);
    return date.getMonth() === thisMonth && date.getFullYear() === thisYear;
  }).length;
});

const formatDate = (dateString: string) => {
  if (!dateString) return 'Date inconnue';
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

const getRoleBadgeClass = (role: string) => {
  const normalizedRole = role?.toLowerCase();
  
  if (normalizedRole === 'vip') {
    return 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400 ring-1 ring-amber-600/20';
  }
  
  if (normalizedRole === 'seller' || normalizedRole === 'vendeur') {
    return 'bg-purple-50 text-purple-700 dark:bg-purple-500/15 dark:text-purple-400 ring-1 ring-purple-600/20';
  }
  
  if (normalizedRole === 'admin' || normalizedRole === 'gestionnaire') {
    return 'bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-400 ring-1 ring-red-600/20';
  }

  // Default for customer/user
  return 'bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400 ring-1 ring-blue-600/20';
};

const viewUser = (id: number) => {
  router.push(`/clients/${id}`);
};

const editUser = (id: number) => {
  router.push(`/clients/${id}`);
};

const contactUser = (userId: number) => {
  router.push({
    path: '/messages',
    query: { userId: userId.toString() }
  });
};

const deleteUser = async (id: number) => {
  const confirmed = await uiStore.confirm({
    title: 'Supprimer le client',
    message: 'Êtes-vous sûr de vouloir supprimer ce client ? Cette action est irréversible.',
    confirmText: 'Supprimer',
    type: 'danger'
  });
  if (!confirmed) return;
  try {
    await userService.delete(id);
    uiStore.addToast('Client supprimé avec succès', 'success');
    await loadUsers();
  } catch (err: any) {
    uiStore.addToast(err.message || 'Erreur lors de la suppression du client', 'error');
  }
};

const resetFilters = () => {
  searchQuery.value = '';
};
</script>
