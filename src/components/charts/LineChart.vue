<template>
  <div class="relative bg-gray-100 rounded-lg" style="width: 100%; height: 256px;">
    <div v-if="!props.data || !props.data.labels || props.data.labels.length === 0" class="flex items-center justify-center h-full">
      <p class="text-gray-500">No data available</p>
    </div>
    <Line v-else :data="props.data" :options="chartOptions" />
  </div>
</template>

<script setup lang="ts">
import { Line } from 'vue-chartjs';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler, type ChartOptions } from 'chart.js';

// Enregistrer les composants nécessaires pour LineChart
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);
console.log('LineChart: Components registered');

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor: string;
    tension?: number;
    fill?: boolean;
  }[];
}

const props = defineProps<{
  data: ChartData;
  options?: ChartOptions<'line'>;
}>();

// Log pour débogage
console.log('LineChart props.data:', props.data);

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: 'top'
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
