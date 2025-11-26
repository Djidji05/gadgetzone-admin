<template>
  <div style="width: 400px; height: 300px; background: #f0f0f0; padding: 10px;">
    <canvas ref="chartRef"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { 
  Chart, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend,
  Filler 
} from 'chart.js';

// Enregistrer tous les composants nécessaires
Chart.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const chartRef = ref<HTMLCanvasElement>();

onMounted(() => {
  if (!chartRef.value) return;
  
  const ctx = chartRef.value.getContext('2d');
  if (!ctx) return;

  console.log('TestChart: Creating simple chart...');

  try {
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['A', 'B', 'C', 'D', 'E'],
        datasets: [{
          label: 'Test Data',
          data: [12, 19, 3, 5, 2],
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          tension: 0.1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    });

    console.log('TestChart: Chart created successfully');
  } catch (error) {
    console.error('TestChart: Error creating chart:', error);
  }
});
</script>
