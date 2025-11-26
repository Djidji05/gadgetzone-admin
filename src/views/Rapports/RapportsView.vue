<template>
  <div class="p-6">
    <!-- En-tête de la page -->
    <div class="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Rapports et Analyses</h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Tableau de bord des performances et analyses
        </p>
      </div>
        <div class="mt-4 md:mt-0">
          <div class="flex items-center space-x-2">
            <div class="relative">
              <select 
                v-model="periode"
                class="block appearance-none w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value="7j">7 derniers jours</option>
                <option value="30j">30 derniers jours</option>
                <option value="90j">3 derniers mois</option>
                <option value="12m">12 derniers mois</option>
                <option value="perso">Période personnalisée</option>
              </select>
              <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                <svg class="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                </svg>
              </div>
            </div>
            <button 
              @click="exporterRapport"
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg class="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Exporter
            </button>
          </div>
        </div>
      </div>

      <!-- Cartes de synthèse -->
      <div class="grid grid-cols-1 gap-5 mb-6 sm:grid-cols-2 lg:grid-cols-4">
        <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <div class="flex items-center">
            <div class="p-3 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-200">
              <svg class="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div class="ml-5">
              <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Chiffre d'affaires</p>
              <p class="text-2xl font-semibold text-gray-900 dark:text-white">{{ formatPrix(stats.chiffreAffaires) }}</p>
              <p class="text-sm" :class="stats.evolutionCA >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'">
                {{ stats.evolutionCA >= 0 ? '↑' : '↓' }} {{ Math.abs(stats.evolutionCA) }}% vs période précédente
              </p>
            </div>
          </div>
        </div>
        
        <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <div class="flex items-center">
            <div class="p-3 rounded-full bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-200">
              <svg class="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div class="ml-5">
              <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Commandes</p>
              <p class="text-2xl font-semibold text-gray-900 dark:text-white">{{ stats.nbCommandes }}</p>
              <p class="text-sm" :class="stats.evolutionCommandes >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'">
                {{ stats.evolutionCommandes >= 0 ? '↑' : '↓' }} {{ Math.abs(stats.evolutionCommandes) }}% vs période précédente
              </p>
            </div>
          </div>
        </div>
        
        <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <div class="flex items-center">
            <div class="p-3 rounded-full bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-200">
              <svg class="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <div class="ml-5">
              <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Produits vendus</p>
              <p class="text-2xl font-semibold text-gray-900 dark:text-white">{{ stats.nbProduitsVendus }}</p>
              <p class="text-sm" :class="stats.evolutionProduits >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'">
                {{ stats.evolutionProduits >= 0 ? '↑' : '↓' }} {{ Math.abs(stats.evolutionProduits) }}% vs période précédente
              </p>
            </div>
          </div>
        </div>
        
        <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <div class="flex items-center">
            <div class="p-3 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-200">
              <svg class="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div class="ml-5">
              <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Nouveaux clients</p>
              <p class="text-2xl font-semibold text-gray-900 dark:text-white">{{ stats.nouveauxClients }}</p>
              <p class="text-sm" :class="stats.evolutionClients >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'">
                {{ stats.evolutionClients >= 0 ? '↑' : '↓' }} {{ Math.abs(stats.evolutionClients) }}% vs période précédente
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Graphiques -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <!-- Graphique d'évolution du CA -->
        <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-medium text-gray-900 dark:text-white">Évolution du chiffre d'affaires</h3>
            <div class="relative">
              <select 
                v-model="typeGraphiqueCA"
                class="block appearance-none bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 px-3 py-1 pr-8 rounded shadow leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value="jour">Par jour</option>
                <option value="semaine">Par semaine</option>
                <option value="mois">Par mois</option>
              </select>
              <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                <svg class="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                </svg>
              </div>
            </div>
          </div>
          <div class="h-80">
            <!-- Espace pour le graphique (intégration avec une bibliothèque de graphiques) -->
            <div class="flex items-center justify-center h-full bg-gray-50 dark:bg-gray-700 rounded">
              <p class="text-gray-500 dark:text-gray-400">Graphique d'évolution du CA (intégration avec Chart.js/autres)</p>
            </div>
          </div>
        </div>

        <!-- Répartition des ventes par catégorie -->
        <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-medium text-gray-900 dark:text-white">Répartition des ventes par catégorie</h3>
          </div>
          <div class="h-80">
            <!-- Espace pour le graphique en camembert -->
            <div class="flex items-center justify-center h-full bg-gray-50 dark:bg-gray-700 rounded">
              <p class="text-gray-500 dark:text-gray-400">Graphique en camembert (intégration avec Chart.js/autres)</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Tableau des meilleurs produits -->
      <div class="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg mb-6">
        <div class="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
          <h3 class="text-lg leading-6 font-medium text-gray-900 dark:text-white">Top 10 des produits les plus vendus</h3>
          <p class="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">Classement des produits par quantité vendue</p>
        </div>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead class="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Produit
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Catégorie
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Quantité vendue
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Chiffre d'affaires
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Tendance
                </th>
              </tr>
            </thead>
            <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              <tr v-for="produit in topProduits" :key="produit.id" class="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="flex-shrink-0 h-10 w-10">
                      <div class="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                        <span class="text-blue-600 dark:text-blue-300 font-medium">{{ produit.name.charAt(0) }}</span>
                      </div>
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-medium text-gray-900 dark:text-white">{{ produit.name }}</div>
                      <div class="text-sm text-gray-500 dark:text-gray-400">#PROD-00{{ produit.id }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    {{ produit.category }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900 dark:text-white">{{ produit.quantity_sold }}</div>
                  <div class="text-sm text-gray-500 dark:text-gray-400">{{ produit.growth }}% vs période précédente</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900 dark:text-white">{{ formatPrix(produit.revenue) }}</div>
                  <div class="text-sm text-gray-500 dark:text-gray-400">{{ produit.growth }}% vs période précédente</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <span v-if="produit.growth > 0" class="text-green-600 dark:text-green-400">
                      <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
                      </svg>
                    </span>
                    <span v-else class="text-red-600 dark:text-red-400">
                      <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </span>
                    <span class="ml-1" :class="produit.growth > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'">
                      {{ Math.abs(produit.growth) }}%
                    </span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Section des rapports détaillés -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <!-- Rapport de performance des clients -->
        <div class="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
          <div class="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
            <h3 class="text-lg leading-6 font-medium text-gray-900 dark:text-white">Top clients</h3>
            <p class="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">Classement par chiffre d'affaires</p>
          </div>
          <div class="px-4 py-5 sm:p-6">
            <ul class="divide-y divide-gray-200 dark:divide-gray-700">
              <li v-for="client in topClients" :key="client.id" class="py-3">
                <div class="flex items-center space-x-4">
                  <div class="flex-shrink-0">
                    <div class="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                      <span class="text-blue-600 dark:text-blue-300 font-medium">{{ client.name.charAt(0) }}</span>
                    </div>
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-gray-900 dark:text-white truncate">{{ client.name }}</p>
                    <p class="text-sm text-gray-500 dark:text-gray-400">{{ client.total_orders }} commandes</p>
                  </div>
                  <div class="text-right">
                    <p class="text-sm font-medium text-gray-900 dark:text-white">{{ formatPrix(client.total_spent) }}</p>
                    <p class="text-xs text-green-600 dark:text-green-400">
                      ↑ {{ client.total_orders * 10 }}%
                    </p>
                  </div>
                </div>
              </li>
            </ul>
            <div class="mt-4 text-center">
              <a href="#" class="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
                Voir tous les clients
              </a>
            </div>
          </div>
        </div>

        <!-- Taux de conversion -->
        <div class="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
          <div class="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
            <h3 class="text-lg leading-6 font-medium text-gray-900 dark:text-white">Taux de conversion</h3>
            <p class="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">Performance des canaux de vente</p>
          </div>
          <div class="px-4 py-5 sm:p-6">
            <div class="space-y-4">
              <div v-for="source in sourcesTrafic" :key="source.source" class="">
                <div class="flex justify-between text-sm mb-1">
                  <span class="font-medium text-gray-700 dark:text-gray-300">{{ source.source }}</span>
                  <span class="font-medium">{{ (source.percentage * 0.1).toFixed(1) }}%</span>
                </div>
                <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                  <div 
                    class="h-2.5 rounded-full bg-blue-600" 
                    :style="{ width: (source.percentage * 0.1) + '%' }"
                  ></div>
                </div>
                <div class="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                  <span>{{ source.visits }} visites</span>
                  <span>{{ Math.floor(source.visits * 0.032) }} commandes</span>
                </div>
              </div>
            </div>
            <div class="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div class="flex justify-between items-center">
                <div>
                  <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Taux de conversion global</p>
                  <p class="text-2xl font-semibold text-gray-900 dark:text-white">{{ tauxConversionGlobal }}%</p>
                </div>
                <div class="text-right">
                  <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Évolution</p>
                  <p class="text-sm text-green-600 dark:text-green-400">
                    ↑ 2.3%
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Alertes et actions -->
        <div class="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
          <div class="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
            <h3 class="text-lg leading-6 font-medium text-gray-900 dark:text-white">Alertes et actions</h3>
            <p class="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">Points d'attention et recommandations</p>
          </div>
          <div class="px-4 py-5 sm:p-6">
            <div class="space-y-4">
              <div v-for="alerte in alertes" :key="alerte.id" class="flex items-start p-3 rounded-lg" :class="{
                'bg-red-50 dark:bg-red-900/30': alerte.niveau === 'critique',
                'bg-yellow-50 dark:bg-yellow-900/30': alerte.niveau === 'moyen',
                'bg-blue-50 dark:bg-blue-900/30': alerte.niveau === 'bas'
              }">
                <div class="flex-shrink-0 pt-0.5">
                  <span v-if="alerte.niveau === 'critique'" class="h-5 w-5 text-red-500 dark:text-red-400">
                    <svg fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                    </svg>
                  </span>
                  <span v-else-if="alerte.niveau === 'moyen'" class="h-5 w-5 text-yellow-500 dark:text-yellow-400">
                    <svg fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                    </svg>
                  </span>
                  <span v-else class="h-5 w-5 text-blue-500 dark:text-blue-400">
                    <svg fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                    </svg>
                  </span>
                </div>
                <div class="ml-3">
                  <h4 class="text-sm font-medium" :class="{
                    'text-red-800 dark:text-red-200': alerte.niveau === 'critique',
                    'text-yellow-800 dark:text-yellow-200': alerte.niveau === 'moyen',
                    'text-blue-800 dark:text-blue-200': alerte.niveau === 'bas'
                  }">
                    {{ alerte.titre }}
                  </h4>
                  <p class="mt-1 text-sm" :class="{
                    'text-red-700 dark:text-red-300': alerte.niveau === 'critique',
                    'text-yellow-700 dark:text-yellow-300': alerte.niveau === 'moyen',
                    'text-blue-700 dark:text-blue-300': alerte.niveau === 'bas'
                  }">
                    {{ alerte.description }}
                  </p>
                  <div class="mt-2 text-xs" :class="{
                    'text-red-600 dark:text-red-400': alerte.niveau === 'critique',
                    'text-yellow-600 dark:text-yellow-400': alerte.niveau === 'moyen',
                    'text-blue-600 dark:text-blue-400': alerte.niveau === 'bas'
                  }">
                    {{ alerte.date }}
                  </div>
                </div>
              </div>
            </div>
            <div class="mt-6">
              <h4 class="text-sm font-medium text-gray-900 dark:text-white mb-2">Actions recommandées</h4>
              <ul class="space-y-2">
                <li v-for="action in actionsRecommandees" :key="action.id" class="flex items-start">
                  <span class="flex-shrink-0 h-5 w-5 text-green-500 dark:text-green-400">
                    <svg fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                    </svg>
                  </span>
                  <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">{{ action.description }}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { statsService } from '@/services/api';

// État des filtres
const periode = ref('30j');
const typeGraphiqueCA = ref('jour');
const loading = ref(true);
const error = ref('');

// Données des statistiques
const stats = ref({
  chiffreAffaires: 0,
  evolutionCA: 0,
  nbCommandes: 0,
  evolutionCommandes: 0,
  nbProduitsVendus: 0,
  evolutionProduits: 0,
  nouveauxClients: 0,
  evolutionClients: 0
});

const topProduits = ref([]);
const topClients = ref([]);
const sourcesTrafic = ref([]);
const tauxConversionGlobal = ref(0);
const evolutionConversion = ref([]);

const alertes = ref([
  {
    id: 1,
    niveau: 'critique',
    titre: 'Stock critique',
    description: 'Le produit "Écouteurs sans fil Pro" est en rupture de stock dans 3 jours au rythme actuel des ventes.',
    date: 'Il y a 2 heures'
  },
  {
    id: 2,
    niveau: 'moyen',
    titre: 'Baisse des ventes mobile',
    description: 'Les ventes sur mobile ont baissé de 15% cette semaine par rapport à la semaine dernière.',
    date: 'Il y a 5 heures'
  },
  {
    id: 3,
    niveau: 'bas',
    titre: 'Nouveau rapport disponible',
    description: 'Votre rapport hebdomadaire des ventes est prêt à être consulté.',
    date: 'Hier'
  }
]);

const actionsRecommandees = ref([
  { id: 1, description: 'Réapprovisionner le stock des produits en rupture' },
  { id: 2, description: 'Mettre en avant les produits les plus rentables' },
  { id: 3, description: 'Analyser les performances des campagnes marketing' }
]);

// Charger les données depuis l'API
const loadStatsData = async () => {
  try {
    loading.value = true;
    const [overviewData, topProductsData, topClientsData, trafficData, conversionData] = await Promise.all([
      statsService.getOverview(periode.value),
      statsService.getTopProducts(5),
      statsService.getTopClients(5),
      statsService.getTrafficSources(),
      statsService.getConversionRate(periode.value)
    ]);
    
    stats.value = overviewData;
    topProduits.value = topProductsData;
    topClients.value = topClientsData;
    sourcesTrafic.value = trafficData;
    tauxConversionGlobal.value = conversionData.current;
    evolutionConversion.value = conversionData.evolution;
  } catch (err) {
    error.value = 'Erreur lors du chargement des statistiques';
    console.error('Error loading stats:', err);
  } finally {
    loading.value = false;
  }
};

// Méthodes
const formatPrix = (prix: number) => {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(prix);
};

const exporterRapport = () => {
  console.log('Exportation du rapport...');
  alert('Fonctionnalité d\'exportation à implémenter');
};

// Watcher pour la période
watch(periode, () => {
  loadStatsData();
});

// Lifecycle hooks
onMounted(() => {
  loadStatsData();
});
</script>
