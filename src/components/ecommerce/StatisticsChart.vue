<template>
  <div
    class="rounded-2xl border border-gray-200 bg-white px-5 pb-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6"
  >
    <div class="flex flex-col gap-5 mb-6 sm:flex-row sm:justify-between">
      <div class="w-full">
        <h3 class="text-lg font-semibold text-gray-800 dark:text-white/90">
          Statistiques de Ventes
        </h3>
        <p class="mt-1 text-gray-500 text-sm dark:text-gray-400">
          Évolution des ventes et revenus sur l'année
        </p>
      </div>

      <div class="relative">
        <div class="inline-flex items-center gap-1 rounded-lg bg-gray-100 p-1 dark:bg-gray-900">
          <button
            v-for="option in options"
            :key="option.value"
            @click="handlePeriodChange(option.value)"
            :class="[
              selected === option.value
                ? 'shadow-sm text-gray-900 dark:text-white bg-white dark:bg-gray-800'
                : 'text-gray-500 dark:text-gray-400',
              'px-3 py-2 font-medium rounded-md text-sm hover:text-gray-900 hover:shadow-sm dark:hover:bg-gray-800 dark:hover:text-white transition-all'
            ]"
          >
            {{ option.label }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="isLoading" class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>

    <div v-else class="max-w-full overflow-x-auto custom-scrollbar">
      <div id="chartThree" class="-ml-4 min-w-[1000px] xl:min-w-full pl-2">
        <VueApexCharts 
          v-if="salesData.length > 0 || revenueData.length > 0"
          type="area" 
          height="310" 
          :options="chartOptions" 
          :series="series" 
        />
      </div>
    </div>

    <!-- Legend -->
    <div class="flex items-center justify-center gap-6 mt-4">
      <div class="flex items-center gap-2">
        <div class="w-3 h-3 rounded-full bg-blue-500"></div>
        <span class="text-sm text-gray-600 dark:text-gray-400">Ventes</span>
      </div>
      <div class="flex items-center gap-2">
        <div class="w-3 h-3 rounded-full bg-purple-400"></div>
        <span class="text-sm text-gray-600 dark:text-gray-400">Revenus (en milliers)</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import VueApexCharts from 'vue3-apexcharts'
import api from '@/services/api'

const options = [
  { value: 'monthly', label: 'Mensuel' },
  { value: 'quarterly', label: 'Trimestriel' },
  { value: 'annually', label: 'Annuel' }
]

const selected = ref('monthly')
const isLoading = ref(false)
const salesData = ref<number[]>([])
const revenueData = ref<number[]>([])

const series = computed(() => [
  {
    name: 'Ventes',
    data: salesData.value
  },
  {
    name: 'Revenus (k)',
    data: revenueData.value
  }
])

const categories = computed(() => {
  if (selected.value === 'monthly') {
    return ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']
  } else if (selected.value === 'quarterly') {
    return ['T1', 'T2', 'T3', 'T4']
  } else {
    return ['2024']
  }
})

const chartOptions = computed(() => ({
  legend: {
    show: false,
    position: 'top',
    horizontalAlign: 'left'
  },
  colors: ['#3B82F6', '#A78BFA'],
  chart: {
    fontFamily: 'Inter, sans-serif',
    type: 'area',
    toolbar: {
      show: false
    },
    zoom: {
      enabled: false
    }
  },
  fill: {
    type: 'gradient',
    gradient: {
      enabled: true,
      opacityFrom: 0.55,
      opacityTo: 0,
      stops: [0, 90, 100]
    }
  },
  stroke: {
    curve: 'smooth',
    width: [3, 3]
  },
  markers: {
    size: 0,
    hover: {
      size: 6
    }
  },
  grid: {
    xaxis: {
      lines: {
        show: false
      }
    },
    yaxis: {
      lines: {
        show: true
      }
    },
    borderColor: '#E5E7EB',
    strokeDashArray: 5
  },
  dataLabels: {
    enabled: false
  },
  tooltip: {
    x: {
      format: 'dd MMM yyyy'
    },
    y: {
      formatter: function (val: number) {
        return val.toFixed(0)
      }
    },
    theme: 'dark'
  },
  xaxis: {
    type: 'category',
    categories: categories.value,
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
  yaxis: {
    title: {
      style: {
        fontSize: '0px'
      }
    },
    labels: {
      style: {
        colors: '#9CA3AF',
        fontSize: '12px'
      },
      formatter: function (val: number) {
        return val.toFixed(0)
      }
    }
  }
}))

const fetchSalesData = async (period: string) => {
  try {
    isLoading.value = true
    console.log('📊 Fetching sales data for period:', period)
    
    const response = await api.get('/stats/sales-data', {
      params: { period, year: new Date().getFullYear() }
    })
    
    console.log('✅ Sales data received:', response.data)
    salesData.value = response.data.sales || []
    revenueData.value = response.data.revenue || []
  } catch (error) {
    console.error('❌ Error fetching sales data:', error)
    // Fallback to mock data
    if (period === 'monthly') {
      salesData.value = [180, 195, 175, 165, 185, 170, 190, 215, 240, 225, 255, 245]
      revenueData.value = [45, 35, 55, 45, 60, 50, 75, 105, 120, 130, 160, 150]
    } else if (period === 'quarterly') {
      salesData.value = [550, 520, 645, 725]
      revenueData.value = [135, 160, 230, 410]
    } else {
      salesData.value = [2440]
      revenueData.value = [935]
    }
  } finally {
    isLoading.value = false
  }
}

const handlePeriodChange = (period: string) => {
  selected.value = period
  fetchSalesData(period)
}

onMounted(() => {
  fetchSalesData('monthly')
})
</script>

<style scoped>
.area-chart {
  width: 100%;
}
</style>
