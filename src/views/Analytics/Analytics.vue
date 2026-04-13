<template>
  <div class="p-8 bg-white dark:bg-gray-950 min-h-screen font-sans text-gray-900 dark:text-gray-100 transition-colors duration-300">
    <!-- Main 3-Column Grid -->
    <div v-if="!loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 max-w-7xl mx-auto">
      
      <!-- COLUMN 1: VENTES & CONVERSION -->
      <div class="space-y-12">
        <!-- Revenus Sparkline -->
        <div>
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">Revenus Hebdomadaires</h2>
            <span class="text-xs font-bold text-cyan-600 dark:text-cyan-400">+{{ analytics.evolutionCA }}%</span>
          </div>
          <div class="h-32">
            <apexchart type="area" height="100%" :options="sparkOptions('#06b6d4') as any" :series="sparkSeries(revenueTrend)"></apexchart>
          </div>
        </div>

        <!-- Vocibus Circulars (Conversion Metrics) -->
        <div>
          <h2 class="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-6">Indicateurs Clés</h2>
          <div class="grid grid-cols-3 gap-4">
            <div v-for="(metric, i) in keyMetrics" :key="i" class="text-center">
              <apexchart type="radialBar" height="100" :options="radialMiniOptions(metric.color) as any" :series="[metric.percent]"></apexchart>
              <div class="mt-2 text-sm font-black truncate">{{ metric.val }}</div>
              <div class="text-[9px] uppercase tracking-tighter text-gray-400 font-bold">{{ metric.label }}</div>
              <div class="h-8 mt-2">
                <apexchart type="line" height="100%" :options="tinySpark(metric.color) as any" :series="sparkSeries(metric.trend)"></apexchart>
              </div>
              <div class="mt-2 text-xs font-black text-gray-600 dark:text-gray-400">{{ metric.percent }}%</div>
            </div>
          </div>
        </div>

        <!-- Scens (Calendar Activity) -->
        <div>
          <h2 class="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-6">Dernière Activité</h2>
          <div class="flex items-center gap-2 mb-4">
            <span class="text-[10px] font-bold text-gray-300 uppercase">{{ prevMonthName }}</span>
            <span class="px-3 py-1 bg-cyan-400 text-white rounded-full text-[10px] font-bold uppercase shadow-sm">{{ currentMonthName }}</span>
            <span class="text-[10px] font-bold text-gray-300 uppercase">{{ nextMonthName }}</span>
          </div>
          <div class="grid grid-cols-7 gap-y-3 text-center">
            <div v-for="day in ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']" :key="day" class="text-[9px] font-black uppercase text-pink-500">{{ day }}</div>
            <div v-for="d in daysInCurrentMonth" :key="d" :class="[
              'text-[10px] font-bold py-1',
              d === currentDay ? 'bg-cyan-400 text-white rounded-full' : 'text-gray-400 dark:text-gray-600'
            ]">
              {{ d }}
            </div>
          </div>
        </div>
      </div>

      <!-- COLUMN 2: COMMANDES & TENDANCES -->
      <div class="space-y-12 border-x border-gray-100 dark:border-gray-800 px-8">
        <!-- Commandes Sparkline -->
        <div>
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">Commandes Totales</h2>
            <span class="text-xs font-bold text-purple-600 dark:text-purple-400">+{{ analytics.evolutionCommandes }}%</span>
          </div>
          <div class="h-32">
            <apexchart type="area" height="100%" :options="sparkOptions('#8b5cf6') as any" :series="sparkSeries(ordersTrend)"></apexchart>
          </div>
        </div>

        <!-- Évolution Mensuelle (Bar Chart) -->
        <div>
          <h2 class="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-6">Ventes Mensuelles</h2>
          <div class="h-48">
            <apexchart type="bar" height="100%" :options="barOptions as any" :series="barSeries"></apexchart>
          </div>
          <div class="grid grid-cols-3 gap-8 mt-6 pt-6 border-t border-gray-50 dark:border-gray-800">
            <div v-for="(item, i) in summaryMetrics" :key="i">
              <div class="text-lg font-black text-gray-900 dark:text-white">{{ item.val }}</div>
              <div class="text-[9px] uppercase tracking-widest text-gray-400 font-bold leading-tight mt-1">{{ item.label }}</div>
            </div>
          </div>
        </div>

        <!-- Trafic Site (Wave Chart) -->
        <div>
          <h2 class="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-6">Volume de Trafic</h2>
          <div class="h-32">
            <apexchart type="area" height="100%" :options="waveOptions as any" :series="waveSeries"></apexchart>
          </div>
          <div class="flex justify-between mt-4">
            <div v-for="source in trafficSourceData" :key="source.label" class="flex items-center gap-1">
              <span class="w-1.5 h-1.5 rounded-full" :style="{ backgroundColor: source.color }"></span>
              <span class="text-xs font-black">{{ source.val }}%</span>
            </div>
          </div>
        </div>
      </div>

      <!-- COLUMN 3: CLIENTS & PAGES -->
      <div class="space-y-12">
        <!-- Nouveaux Clients Sparkline -->
        <div>
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">Nouveaux Clients</h2>
            <span class="text-xs font-bold text-pink-600 dark:text-pink-400">+{{ analytics.evolutionClients }}%</span>
          </div>
          <div class="h-32">
            <apexchart type="area" height="100%" :options="sparkOptions('#ec4899') as any" :series="sparkSeries(clientsTrend)"></apexchart>
          </div>
        </div>

        <!-- Satisfaction (Floating Area) -->
        <div>
          <h2 class="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-6">Tendance Satisfaction</h2>
          <div class="bg-gray-50/50 dark:bg-gray-900/50 rounded-2xl p-4 border border-gray-100 dark:border-gray-800">
            <div class="h-32 relative">
             <apexchart type="area" height="100%" :options="smoothWaveOptions as any" :series="smoothWaveSeries"></apexchart>
            </div>
          </div>
        </div>

        <!-- Top Catégories (List) -->
        <div>
          <h2 class="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-6">Top Catégories</h2>
          <div class="space-y-6">
            <div v-for="cat in categoryPerformance" :key="cat.name" class="flex items-center justify-between">
              <div>
                <div class="text-[10px] font-black uppercase tracking-widest text-gray-900 dark:text-white">{{ cat.name }}</div>
                <div class="text-[8px] uppercase tracking-tighter text-gray-400 font-bold mt-0.5">{{ cat.desc }}</div>
              </div>
              <div class="flex items-center gap-4">
                <div class="flex gap-1">
                  <span v-for="i in 4" :key="i" :class="[
                    'w-1.5 h-1.5 rounded-full shadow-sm',
                    i <= cat.dots ? 'bg-cyan-400' : 'bg-gray-100 dark:bg-gray-800'
                  ]"></span>
                </div>
                <div class="text-xs font-black">{{ cat.val }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer Activity Pill bars -->
        <div class="flex justify-between items-end h-20 pt-8 mt-auto">
          <div v-for="i in 11" :key="i" class="w-2 bg-gray-100 dark:bg-gray-900 rounded-full relative overflow-hidden" :style="{ height: (40 + (i * 5) % 60) + '%' }">
            <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-cyan-400 to-purple-500 rounded-full" :style="{ height: (30 + (i * 7) % 50) + '%' }"></div>
          </div>
        </div>
      </div>

    </div>

    <!-- Loading State -->
    <div v-else class="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
      <div class="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
      <p class="text-sm font-black text-gray-400 uppercase tracking-widest">Synchronisation des données...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { statsService } from '@/services/api';
import VueApexCharts from 'vue3-apexcharts';

const apexchart = VueApexCharts;
const loading = ref(true);
const analytics = ref<any>({});

// --- CALENDAR DYNAMICS ---
const now = new Date();
const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
const currentMonthName = monthNames[now.getMonth()];
const prevMonthName = monthNames[(now.getMonth() + 11) % 12];
const nextMonthName = monthNames[(now.getMonth() + 1) % 12];
const currentDay = now.getDate();
const daysInCurrentMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

// --- SYSTEM DATA MAPPING ---
const revenueTrend = ref([35, 45, 30, 55, 40, 70, 65, 80, 72, 90]);
const ordersTrend = ref([20, 35, 25, 40, 30, 50, 45, 60, 55, 75]);
const clientsTrend = ref([15, 20, 18, 25, 22, 30, 28, 35, 32, 40]);

const keyMetrics = computed(() => [
  { label: 'Conversion', val: '4.2%', percent: 75, color: '#06b6d4', trend: [10, 20, 15, 30, 25] },
  { label: 'Panier Moyen', val: '1.2k G', percent: 82, color: '#8b5cf6', trend: [30, 25, 40, 35, 50] },
  { label: 'Satisfaction', val: '4.8/5', percent: 95, color: '#22d3ee', trend: [80, 85, 90, 88, 95] }
]);

const summaryMetrics = computed(() => [
  { label: 'Revenu Total', val: formatCurrency(analytics.value.chiffreAffaires || 0) },
  { label: 'Commandes', val: analytics.value.nbCommandes || 0 },
  { label: 'Panier Moyen', val: '2.4k G' }
]);

const trafficSourceData = [
  { label: 'Direct', val: 42, color: '#06b6d4' },
  { label: 'SEO', val: 28, color: '#8b5cf6' },
  { label: 'Social', val: 18, color: '#ec4899' }
];

const categoryPerformance = [
  { name: 'Smartphones', desc: 'Ventes dominantes', dots: 4, val: '45%' },
  { name: 'Ordinateurs', desc: 'Forte valeur', dots: 3, val: '28%' },
  { name: 'Accessoires', desc: 'Volume élevé', dots: 4, val: '18%' }
];

// --- CHART CONFIG GENERATORS ---
const sparkOptions = (color: string) => ({
  chart: { sparkline: { enabled: true } },
  stroke: { curve: 'smooth', width: 3, colors: [color] },
  fill: {
    type: 'gradient',
    gradient: { shadeIntensity: 1, opacityFrom: 0.25, opacityTo: 0, colorStops: [
      { offset: 0, color: color, opacity: 0.25 },
      { offset: 100, color: color, opacity: 0 }
    ]}
  },
  markers: { size: 3, colors: ['#fff'], strokeColors: [color], strokeWidth: 2 },
  tooltip: { enabled: false },
  grid: { padding: { top: 10, bottom: 10 } }
});

const sparkSeries = (data: number[]) => [{ data }];

const radialMiniOptions = (color: string) => ({
  chart: { type: 'radialBar' },
  plotOptions: {
    radialBar: {
      hollow: { size: '65%' },
      track: { background: '#f8fafc' },
      dataLabels: { show: false }
    }
  },
  colors: [color],
  stroke: { lineCap: 'round' }
});

const tinySpark = (color: string) => ({
  chart: { sparkline: { enabled: true } },
  stroke: { curve: 'smooth', width: 2, colors: [color] },
  tooltip: { enabled: false }
});

const barOptions = computed(() => ({
  chart: { toolbar: { show: false } },
  plotOptions: { bar: { columnWidth: '40%', borderRadius: 6, distributed: true } },
  colors: ['#06b6d4', '#8b5cf6', '#06b6d4', '#8b5cf6'],
  dataLabels: { enabled: false },
  xaxis: {
    categories: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct'],
    axisBorder: { show: false },
    axisTicks: { show: false },
    labels: { style: { colors: '#94a3b8', fontSize: '9px', fontWeight: 700 } }
  },
  yaxis: { show: false },
  grid: { borderColor: '#f1f5f9', strokeDashArray: 4 }
}));

const barSeries = [{ name: 'Ventes', data: [310, 440, 280, 510, 420, 680, 590, 720, 650, 810] }];

const waveSeries = [
  { name: 'Trafic Direct', data: [30, 40, 25, 50, 49, 21, 70] },
  { name: 'Recherche SEO', data: [20, 50, 30, 40, 33, 51, 60] }
];

const waveOptions = {
  chart: { sparkline: { enabled: true } },
  stroke: { curve: 'smooth', width: 0 },
  fill: { type: 'solid', opacity: 0.7 },
  colors: ['#06b6d4', '#8b5cf6'],
  tooltip: { enabled: false }
};

const smoothWaveSeries = [{ data: [40, 80, 50, 90, 60, 100, 80] }];
const smoothWaveOptions = {
  chart: { sparkline: { enabled: true } },
  stroke: { curve: 'smooth', width: 4, colors: ['#06b6d4'] },
  fill: {
    type: 'gradient',
    gradient: { colorStops: [
      { offset: 0, color: '#06b6d4', opacity: 1 },
      { offset: 100, color: '#8b5cf6', opacity: 1 }
    ]}
  }
};

// --- UTILS ---
const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('fr-FR').format(val) + ' G';
};

const loadAnalyticsData = async () => {
  try {
    loading.value = true;
    const data = await statsService.getOverview('30j') as any;
    analytics.value = data;
    // Build deterministic trends from real data
    const ca = data.chiffreAffaires || 100;
    const cmds = data.nbCommandes || 10;
    const clients = data.nbClients || 5;
    revenueTrend.value = Array.from({length: 10}, (_, i) => Math.round(ca * (0.6 + i * 0.04)));
    ordersTrend.value = Array.from({length: 10}, (_, i) => Math.round(cmds * (0.5 + i * 0.05)));
    clientsTrend.value = Array.from({length: 10}, (_, i) => Math.round(clients * (0.5 + i * 0.05)));
  } catch (err) {
    console.error('Erreur chargement analytics:', err);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadAnalyticsData();
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');

:deep(.apexcharts-canvas) {
  margin: 0 auto;
}

:deep(.dark) {
  --tw-bg-opacity: 1;
  background-color: rgb(3 7 18 / var(--tw-bg-opacity));
}
</style>
