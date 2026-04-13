<template>
  <div
    class="sm:rounded-2xl sm:border border-transparent sm:border-gray-200 sm:bg-white px-5 pb-5 pt-5 sm:dark:border-gray-800 bg-transparent dark:bg-transparent sm:dark:bg-white/[0.03] sm:px-6 sm:pt-6"
  >
    <div class="flex flex-row flex-wrap items-center justify-between gap-4 mb-6">
      <div class="w-full">
        <h3 class="text-lg font-semibold text-gray-800 dark:text-white/90">
          Statistiques de Ventes
        </h3>
        <p class="mt-1 text-gray-500 text-sm dark:text-gray-400">
          Évolution des ventes et revenus sur l'année
        </p>
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
import { ref, computed, onMounted, inject, watch } from 'vue'
import VueApexCharts from 'vue3-apexcharts'
import { api } from '@/services/api'
import { useTheme } from '../layout/ThemeProvider.vue'
import { useAuthStore } from '@/stores/auth'

const { isDarkMode } = useTheme() as any
const authStore = useAuthStore()

const dashboardPeriod = inject<any>('dashboardPeriod', ref('30days'))

const isLoading = ref(false)
const salesData = ref<number[]>([])
const revenueData = ref<number[]>([])
const categories = ref<string[]>([])

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

const chartOptions = computed<any>(() => ({
  legend: {
    show: false,
    position: 'top',
    horizontalAlign: 'left'
  },
  colors: ['#3B82F6', '#A78BFA'],
  chart: {
    fontFamily: 'Outfit, sans-serif',
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
    borderColor: isDarkMode.value ? '#1F2A37' : '#E5E7EB',
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
    theme: isDarkMode.value ? 'dark' : 'light'
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
        colors: isDarkMode.value ? '#98A2B3' : '#9CA3AF',
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
        colors: isDarkMode.value ? '#98A2B3' : '#9CA3AF',
        fontSize: '12px'
      },
      formatter: function (val: number) {
        return val.toFixed(0)
      }
    }
  }
}))

const fetchSalesData = async (period: string) => {
  if (!authStore.isAuthenticated) {
    console.log('🛑 Skip fetchSalesData: User not authenticated')
    return
  }

  try {
    isLoading.value = true
    console.log('📊 Fetching sales data for period:', period)
    
    const response = await api.get('/stats/sales-data', {
      params: { period, year: new Date().getFullYear() }
    })
    
    console.log('✅ Sales data received:', response.data)
    salesData.value = response.data.sales || []
    revenueData.value = response.data.revenue || []
    categories.value = response.data.labels || []
  } catch (error) {
    console.error('❌ Error fetching sales data:', error)
    if (period === 'monthly' || period === '30days') {
      salesData.value = [180, 195, 175, 165, 185, 170, 190, 215, 240, 225, 255, 245]
      revenueData.value = [45, 35, 55, 45, 60, 50, 75, 105, 120, 130, 160, 150]
      categories.value = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']
    } else {
      salesData.value = [550, 520, 645]
      revenueData.value = [135, 160, 230]
      categories.value = ['A', 'B', 'C']
    }
  } finally {
    isLoading.value = false
  }
}

watch(dashboardPeriod, (newVal) => {
  if (authStore.isAuthenticated) {
    fetchSalesData(newVal)
  }
})

onMounted(() => {
  if (authStore.isAuthenticated) {
    fetchSalesData(dashboardPeriod.value)
  }
})

// Watch for authentication to trigger initial fetch
watch(() => authStore.isAuthenticated, (isAuth) => {
  if (isAuth) {
    console.log('🔐 Auth detected, fetching sales chart data...')
    fetchSalesData(dashboardPeriod.value)
  }
})
</script>

<style scoped>
.area-chart {
  width: 100%;
}
</style>
