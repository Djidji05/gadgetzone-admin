<template>
  <admin-layout>
    <div class="p-6">
      <!-- En-tête de la page -->
      <div class="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Analytiques</h1>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Tableau de bord d'analyse des performances
          </p>
        </div>
        <div class="mt-4 md:mt-0">
          <div class="flex flex-wrap items-center gap-3">
            <div class="relative">
              <select 
                v-model="periode"
                @change="changePeriode"
                class="block appearance-none w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value="7j">7 derniers jours</option>
                <option value="30j" selected>30 derniers jours</option>
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

      <!-- État de chargement -->
      <div v-if="loading" class="text-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p class="mt-4 text-gray-600 dark:text-gray-400">Chargement des données analytiques...</p>
      </div>

      <!-- Message d'erreur -->
      <div v-else-if="error" class="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
        <p class="text-red-800 dark:text-red-200">{{ error }}</p>
      </div>

      <!-- Contenu principal -->
      <div v-else>
      <!-- Cartes de métriques -->
      <div class="grid grid-cols-1 gap-5 mb-6 sm:grid-cols-2 lg:grid-cols-4">
        <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <div class="flex items-center">
            <div class="p-3 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-200">
              <svg class="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div class="ml-5">
              <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Chiffre d'affaires</p>
              <p class="text-2xl font-semibold text-gray-900 dark:text-white">{{ formatNombre(analytics.chiffreAffaires) }}€</p>
              <div class="flex items-center mt-1">
                <svg class="w-4 h-4" :class="analytics.evolutionCA >= 0 ? 'text-green-500' : 'text-red-500'" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                </svg>
                <span :class="analytics.evolutionCA >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'" class="text-sm ml-1">
                  {{ Math.abs(analytics.evolutionCA) }}%
                </span>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <div class="flex items-center">
            <div class="p-3 rounded-full bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-200">
              <svg class="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <div class="ml-5">
              <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Commandes</p>
              <p class="text-2xl font-semibold text-gray-900 dark:text-white">{{ formatNombre(analytics.nbCommandes) }}</p>
              <div class="flex items-center mt-1">
                <svg class="w-4 h-4" :class="analytics.evolutionCommandes >= 0 ? 'text-green-500' : 'text-red-500'" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                </svg>
                <span :class="analytics.evolutionCommandes >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'" class="text-sm ml-1">
                  {{ Math.abs(analytics.evolutionCommandes) }}%
                </span>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <div class="flex items-center">
            <div class="p-3 rounded-full bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-200">
              <svg class="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div class="ml-5">
              <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Produits vendus</p>
              <p class="text-2xl font-semibold text-gray-900 dark:text-white">{{ formatNombre(analytics.nbProduitsVendus) }}</p>
              <div class="flex items-center mt-1">
                <svg class="w-4 h-4" :class="analytics.evolutionProduits >= 0 ? 'text-green-500' : 'text-red-500'" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                </svg>
                <span :class="analytics.evolutionProduits >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'" class="text-sm ml-1">
                  {{ Math.abs(analytics.evolutionProduits) }}%
                </span>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <div class="flex items-center">
            <div class="p-3 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-200">
              <svg class="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div class="ml-5">
              <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Nouveaux clients</p>
              <p class="text-2xl font-semibold text-gray-900 dark:text-white">{{ formatNombre(analytics.nouveauxClients) }}</p>
              <div class="flex items-center mt-1">
                <svg class="w-4 h-4" :class="analytics.evolutionClients >= 0 ? 'text-green-500' : 'text-red-500'" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                </svg>
                <span :class="analytics.evolutionClients >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'" class="text-sm ml-1">
                  {{ Math.abs(analytics.evolutionClients) }}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Graphiques principaux -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <!-- Graphique d'évolution -->
        <div class="lg:col-span-2 bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <div class="flex items-center space-x-4">
            <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Type de graphique:</label>
            <select v-model="typeGraphique" class="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
              <option value="ca">Chiffre d'affaires</option>
              <option value="visiteurs">Visiteurs</option>
              <option value="pages">Pages vues</option>
              <option value="sessions">Sessions</option>
            </select>
          </div>
          <div class="h-64 w-full">
            <LineChart :data="evolutionData" />
          </div>
        </div>

        <!-- Répartition par appareils -->
        <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Répartition par appareils</h3>
          <div class="h-64 w-full">
            <PieChart :data="appareilsData" />
          </div>
        </div>
      </div>

      <!-- Sources de trafic -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Sources de trafic</h3>
          <div class="h-64 w-full">
            <BarChart :data="sourcesData" />
          </div>
        </div>

        <!-- Pages les plus visitées -->
        <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Pages les plus visitées</h3>
          <div class="space-y-3">
            <div v-for="page in pagesVisitees" :key="page.url" class="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg">
              <div class="flex-1">
                <div class="flex items-center">
                  <span class="text-sm font-medium text-gray-900 dark:text-white">{{ page.titre }}</span>
                  <span class="text-xs text-gray-500 dark:text-gray-400 ml-2">{{ page.url }}</span>
                </div>
                <div class="flex items-center mt-1 text-xs text-gray-500 dark:text-gray-400">
                  <span>{{ formatNombre(page.vues) }} vues</span>
                  <span class="mx-2">•</span>
                  <span>{{ formatNombre(page.visiteurs) }} visiteurs</span>
                  <span class="mx-2">•</span>
                  <span>{{ formatDuree(page.dureeMoyenne) }}</span>
                </div>
              </div>
              <div class="text-right">
                <span class="text-xs" :class="page.evolutionVues >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'">
                  {{ page.evolutionVues >= 0 ? '↑' : '↓' }} {{ Math.abs(page.evolutionVues) }}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Dernières campagnes -->
      <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-6">
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Dernières campagnes</h3>
        <div class="space-y-4">
          <div v-for="campagne in dernieresCampagnes" :key="campagne.id" class="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div class="flex items-center">
              <div class="h-10 w-10 rounded-full flex items-center justify-center" :class="campagne.statutCouleur">
                <span class="text-white text-sm font-medium">{{ campagne.nom.charAt(0) }}</span>
              </div>
              <div class="ml-4">
                <h4 class="text-sm font-medium text-gray-900 dark:text-white">{{ campagne.nom }}</h4>
                <p class="text-xs text-gray-500 dark:text-gray-400">{{ campagne.dateDebut }} - {{ campagne.dateFin }}</p>
              </div>
            </div>
            <div class="text-right">
              <div class="flex items-center">
                <span class="text-sm font-medium" :class="campagne.evolution >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'">
                  {{ campagne.evolution >= 0 ? '+' : '' }}{{ campagne.evolution }}%
                </span>
              </div>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">{{ campagne.clics }} clics</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Objectifs et conversion -->
      <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-6">
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Objectifs et conversion</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div v-for="objectif in objectifs" :key="objectif.nom" class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{{ objectif.nom }}</h4>
            <div class="mb-3">
              <div class="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                <span>Progression</span>
                <span>{{ objectif.completion }}%</span>
              </div>
              <div class="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                <div 
                  class="bg-blue-600 dark:bg-blue-500 h-2 rounded-full transition-all duration-300" 
                  :style="{ width: objectif.completion + '%' }"
                ></div>
              </div>
            </div>
            <div class="flex justify-between mt-1">
              <span class="text-xs text-gray-500 dark:text-gray-400">{{ objectif.valeurs.reelles }} / {{ objectif.valeurs.cible }}</span>
              <span class="text-xs" :class="objectif.evolution >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'">
                {{ objectif.evolution >= 0 ? '↑' : '↓' }} {{ Math.abs(objectif.evolution) }}%
              </span>
            </div>
          </div>
        </div>
        <div class="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Taux de conversion global</h4>
          <div class="flex items-baseline">
            <span class="text-3xl font-bold text-gray-900 dark:text-white">{{ tauxConversionGlobal }}%</span>
            <span class="ml-2 text-sm" :class="evolutionConversionGlobale >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'">
              {{ evolutionConversionGlobale >= 0 ? '↑' : '↓' }} {{ Math.abs(evolutionConversionGlobale) }}%
            </span>
          </div>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Basé sur les 30 derniers jours</p>
        </div>
      </div>
      </div>
    </div>
  </admin-layout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import AdminLayout from '@/components/layout/AdminLayout.vue';
import { statsService } from '@/services/api';
import LineChart from '@/components/charts/LineChart.vue';
import PieChart from '@/components/charts/PieChart.vue';
import BarChart from '@/components/charts/BarChart.vue';
// import TestChart from '@/components/charts/TestChart.vue'; // Désactivé pour test

// État réactif
const loading = ref(true);
const error = ref('');
const periode = ref('30j');
const typeGraphique = ref('ca');

// Données analytics
const analytics = ref({
  chiffreAffaires: 0,
  evolutionCA: 0,
  nbCommandes: 0,
  evolutionCommandes: 0,
  nbProduitsVendus: 0,
  evolutionProduits: 0,
  nouveauxClients: 0,
  evolutionClients: 0
});

const topProducts = ref([]);
const topClients = ref([]);
const trafficSources = ref([]);
const conversionRate = ref({
  current: 0,
  evolution: []
});

// Données mockées pour les éléments non couverts par l'API
const appareils = ref([
  { nom: 'Desktop', pourcentage: 65, icon: '💻', evolution: 2.1 },
  { nom: 'Mobile', pourcentage: 30, icon: '📱', evolution: 8.5 },
  { nom: 'Tablette', pourcentage: 5, icon: '📲', evolution: -1.2 }
]);

const pagesVisitees = ref([
  { 
    titre: 'Accueil', 
    url: '/', 
    vues: 15420, 
    visiteurs: 12350, 
    dureeMoyenne: 125, 
    tauxRebond: 42,
    evolutionVues: 5.2
  },
  { 
    titre: 'Produits', 
    url: '/produits', 
    vues: 8760, 
    visiteurs: 7230, 
    dureeMoyenne: 180, 
    tauxRebond: 35,
    evolutionVues: 12.8
  },
  { 
    titre: 'Contact', 
    url: '/contact', 
    vues: 3210, 
    visiteurs: 2980, 
    dureeMoyenne: 95, 
    tauxRebond: 65,
    evolutionVues: -2.3
  }
]);

const dernieresCampagnes = ref([
  {
    id: 1,
    nom: 'Promo Été 2023',
    dateDebut: '15/06',
    dateFin: '15/09',
    statut: 'En cours',
    statutCouleur: 'bg-green-500',
    clics: 1245,
    evolution: 12.5
  },
  {
    id: 2,
    nom: 'Black Friday',
    dateDebut: '25/11',
    dateFin: '27/11',
    statut: 'À venir',
    statutCouleur: 'bg-blue-500',
    clics: 0,
    evolution: 0
  }
]);

const objectifs = ref([
  {
    nom: 'Ventes mensuelles',
    completion: 85,
    valeurs: {
      reelles: 425,
      cible: 500
    },
    evolution: 12.5
  },
  {
    nom: 'Téléchargements d\'ebook',
    completion: 62,
    valeurs: {
      reelles: 124,
      cible: 200
    },
    evolution: -5.2
  },
  {
    nom: 'Demandes de démo',
    completion: 45,
    valeurs: {
      reelles: 27,
      cible: 60
    },
    evolution: 8.7
  }
]);

// Méthodes
const formatNombre = (nombre: number) => {
  return new Intl.NumberFormat('fr-FR').format(nombre);
};

const formatDuree = (secondes: number) => {
  const minutes = Math.floor(secondes / 60);
  const secondesRestantes = secondes % 60;
  return `${minutes}:${secondesRestantes.toString().padStart(2, '0')}`;
};

const exporterRapport = () => {
  console.log('Exportation du rapport analytique...');
  alert('Fonctionnalité d\'exportation à implémenter');
};

const loadAnalyticsData = async () => {
  try {
    loading.value = true;
    error.value = '';

    // Charger les données d'overview
    const overviewData = await statsService.getOverview(periode.value);
    analytics.value = overviewData;

    // Charger les produits les plus vendus
    const productsData = await statsService.getTopProducts(5);
    topProducts.value = productsData;

    // Charger les meilleurs clients
    const clientsData = await statsService.getTopClients(5);
    topClients.value = clientsData;

    // Charger les sources de trafic
    const trafficData = await statsService.getTrafficSources();
    trafficSources.value = trafficData;

    // Charger le taux de conversion
    const conversionData = await statsService.getConversionRate(periode.value);
    conversionRate.value = conversionData;

  } catch (err) {
    console.error('Error loading analytics data:', err);
    error.value = 'Erreur lors du chargement des données analytiques';
  } finally {
    loading.value = false;
  }
};

const changePeriode = () => {
  loadAnalyticsData();
  updateChartData();
};

// Mise à jour des données de graphiques selon le type et la période
const updateChartData = () => {
  // Données simulées selon le type de graphique
  const visiteursData = [12000, 19000, 15000, 25000, 22000, 30000, 28000, 35000, 32000, 38000, 42000, 45000];
  const pagesData = [45000, 62000, 51000, 78000, 69000, 95000, 88000, 105000, 98000, 112000, 125000, 135000];
  const sessionsData = [8000, 14000, 11000, 18000, 16000, 22000, 20000, 25000, 23000, 28000, 31000, 34000];
  
  // Générer des données CA réalistes basées sur les données analytics
  const baseCA = analytics.value.chiffreAffaires || 500000;
  const caData = generateCAData(baseCA);

  let newData;
  let newLabel;
  let newColor;
  switch (typeGraphique.value) {
    case 'ca':
      newData = caData;
      newLabel = 'Chiffre d\'affaires (€)';
      newColor = '#10B981';
      break;
    case 'visiteurs':
      newData = visiteursData;
      newLabel = 'Visiteurs';
      newColor = '#3B82F6';
      break;
    case 'pages':
      newData = pagesData;
      newLabel = 'Pages vues';
      newColor = '#F59E0B';
      break;
    case 'sessions':
      newData = sessionsData;
      newLabel = 'Sessions';
      newColor = '#EF4444';
      break;
    default:
      newData = caData;
      newLabel = 'Chiffre d\'affaires (€)';
      newColor = '#10B981';
  }

  evolutionData.value.datasets[0].data = newData;
  evolutionData.value.datasets[0].label = newLabel;
  evolutionData.value.datasets[0].borderColor = newColor;
  evolutionData.value.datasets[0].backgroundColor = newColor + '20'; // Ajout de transparence
};

// Générer des données de CA mensuelles réalistes
const generateCAData = (totalCA: number) => {
  const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
  const monthlyData = [];
  
  // Simuler une progression réaliste du CA sur 12 mois
  const monthlyFactors = [0.65, 0.70, 0.75, 0.82, 0.88, 0.92, 0.85, 0.78, 0.90, 0.95, 1.05, 1.15];
  const monthlyTotal = monthlyFactors.reduce((sum, factor) => sum + factor, 0);
  
  monthlyFactors.forEach(factor => {
    const monthlyCA = Math.round((totalCA * factor) / monthlyTotal);
    monthlyData.push(monthlyCA);
  });
  
  return monthlyData;
};

// Watcher pour le type de graphique
watch(typeGraphique, updateChartData);

// Données pour les graphiques (simplifiées pour le débogage)
const evolutionData = ref({
  labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'],
  datasets: [
    {
      label: 'Chiffre d\'affaires (€)',
      data: [25000, 32000, 28000, 41000, 38000, 52000, 47000, 58000, 55000, 61000, 68000, 72000],
      borderColor: '#10B981',
      backgroundColor: 'rgba(16, 185, 129, 0.2)',
      borderWidth: 2,
      tension: 0.4,
      fill: true
    }
  ]
});

const appareilsData = ref({
  labels: ['Desktop', 'Mobile'],
  datasets: [{
    label: 'Répartition par appareil',
    data: [65, 30],
    backgroundColor: ['#FF0000', '#00FF00'],
    borderColor: '#ffffff',
    borderWidth: 2
  }]
});

const sourcesData = ref({
  labels: ['Recherche', 'Direct', 'Social'],
  datasets: [{
    label: 'Sources de trafic',
    data: [42, 28, 18],
    backgroundColor: ['#FF0000', '#00FF00', '#0000FF'],
    borderColor: '#ffffff',
    borderWidth: 1
  }]
});

// Computed properties pour le taux de conversion
const tauxConversionGlobal = computed(() => conversionRate.value.current);
const evolutionConversionGlobale = computed(() => {
  const evolution = conversionRate.value.evolution;
  if (evolution.length >= 2) {
    const latest = evolution[evolution.length - 1].rate;
    const previous = evolution[evolution.length - 2].rate;
    return ((latest - previous) / previous * 100).toFixed(1);
  }
  return 0;
});

// Lifecycle hooks
onMounted(() => {
  console.log('Composant Analytics monté');
  
  // D'abord charger les données de base
  loadAnalyticsData();
  
  // Puis initialiser les graphiques avec un délai plus long
  setTimeout(() => {
    console.log('Initialisation des graphiques...');
    console.log('Données evolutionData:', evolutionData.value);
    console.log('Données appareilsData:', appareilsData.value);
    console.log('Données sourcesData:', sourcesData.value);
    updateChartData();
  }, 500);
});

</script>

<script lang="ts">
export default {
  name: 'AnalyticsView'
}
</script>
