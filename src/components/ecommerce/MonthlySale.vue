<template>
  <div
    class="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 pb-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6"
  >
    <div class="flex items-center justify-between mb-4">
      <div>
        <h3 class="text-lg font-semibold text-gray-800 dark:text-white/90">Ventes Mensuelles</h3>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Répartition des ventes par mois
        </p>
      </div>
    </div>

    <div v-if="isLoading" class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>

    <div v-else class="max-w-full overflow-x-auto custom-scrollbar">
      <div id="chartOne" class="-ml-5 min-w-[650px] xl:min-w-full pl-2">
        <VueApexCharts type="bar" height="200" :options="chartOptions" :series="series" />
      </div>
    </div>

    <!-- Summary stats -->
    <div class="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
      <div>
        <p class="text-xs text-gray-500 dark:text-gray-400">Total Ventes</p>
        <p class="text-lg font-bold text-gray-800 dark:text-white/90 mt-1">
          {{ totalSales }}
        </p>
      </div>
      <div>
        <p class="text-xs text-gray-500 dark:text-gray-400">Moyenne</p>
        <p class="text-lg font-bold text-gray-800 dark:text-white/90 mt-1">
          {{ averageSales }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import VueApexCharts from 'vue3-apexcharts'
import api from '@/services/api'

const isLoading = ref(true)
const salesData = ref([])

const series = computed(() => [
  {
    name: 'Ventes',
    data: salesData.value
  }
])

const totalSales = computed(() => {
  const total = salesData.value.reduce((acc, val) => acc + val, 0)
  return total.toLocaleString('fr-FR')
})

const averageSales = computed(() => {
  if (salesData.value.length === 0) return '0'
  const avg = salesData.value.reduce((acc, val) => acc + val, 0) / salesData.value.length
  return Math.round(avg).toLocaleString('fr-FR')
})

const chartOptions = ref({
  colors: ['#3B82F6'],
  chart: {
    fontFamily: 'Inter, sans-serif',
    type: 'bar',
    toolbar: {
      show: false
    }
  },
  plotOptions: {
    bar: {
      horizontal: false,
      columnWidth: '55%',
      borderRadius: 6,
      borderRadiusApplication: 'end'
    }
  },
  dataLabels: {
    enabled: false
  },
  stroke: {
    show: true,
    width: 4,
    colors: ['transparent']
  },
  xaxis: {
    categories: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'],
    axisBorder: {
      show: false
    },
    axisTicks: {
      show: false
    },
    labels: {
      style: {
        colors: '#9CA3AF',
        fontSize: '12px'
      }
    }
  },
  legend: {
    show: false
  },
  yaxis: {
    title: false,
    labels: {
      style: {
        colors: '#9CA3AF',
        fontSize: '12px'
      }
    }
  },
  grid: {
    yaxis: {
      lines: {
        show: true
      }
    },
    borderColor: '#E5E7EB',
    strokeDashArray: 5
  },
  fill: {
    opacity: 1,
    colors: ['#3B82F6']
  },
  tooltip: {
    x: {
      show: true
    },
    y: {
      formatter: function (val) {
        return val + ' ventes'
      }
    },
    theme: 'dark'
  }
})

const fetchMonthlySales = async () => {
  try {
    isLoading.value = true
    console.log('📊 Fetching monthly sales data...')
    
    const response = await api.get('/stats/monthly-sales', {
      params: { year: new Date().getFullYear() }
    })
    
    console.log('✅ Monthly sales data received:', response.data)
    salesData.value = response.data.sales || []
  } catch (error) {
    console.error('❌ Error fetching monthly sales:', error)
    // Fallback to mock data
    salesData.value = [168, 385, 201, 298, 187, 195, 291, 110, 215, 390, 280, 112]
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchMonthlySales()
})
</script>
