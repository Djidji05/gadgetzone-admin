<template>
  <div class="relative bg-white dark:bg-gray-50 rounded-lg p-2" style="width: 100%; height: 256px;">
    <div v-if="!props.data || !props.data.labels || props.data.labels.length === 0" class="flex items-center justify-center h-full">
      <p class="text-gray-500">No data available</p>
    </div>
    <Bar v-else :data="props.data" :options="chartOptions" />
  </div>
</template>

<script setup lang="ts">
import { Bar } from 'vue-chartjs';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, type ChartOptions } from 'chart.js';

// Enregistrer les composants nécessaires pour BarChart
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);
console.log('BarChart: Components registered');

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string[];
  }[];
}

const props = defineProps<{
  data: ChartData;
  options?: ChartOptions<'bar'>;
}>();

// Log pour débogage
console.log('BarChart props.data:', props.data);

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    }
  },
  scales: {
    x: {
      display: true
    },
    y: {
      display: true
    }
  }
};
</script>
