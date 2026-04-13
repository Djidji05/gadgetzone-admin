<template>
  <div
    class="overflow-hidden sm:rounded-2xl sm:border border-transparent sm:border-gray-200 sm:bg-white px-5 pt-5 pb-4 sm:dark:border-gray-800 bg-transparent dark:bg-transparent sm:dark:bg-white/[0.03] sm:px-6 sm:pt-6"
  >
    <div class="flex items-center justify-between mb-4">
      <div>
        <h3 class="text-lg font-semibold text-gray-800 dark:text-white/90">Volume des Ventes</h3>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Répartition des ventes sur la période
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

<script setup lang="ts">
import { ref, computed, onMounted, inject, watch } from 'vue'
import VueApexCharts from 'vue3-apexcharts'
import { api } from '@/services/api'
import { useTheme } from '../layout/ThemeProvider.vue'
import { useAuthStore } from '@/stores/auth'

const { isDarkMode } = useTheme() as any
const authStore = useAuthStore()

const dashboardPeriod = inject<any>('dashboardPeriod', ref('30days'))

const isLoading = ref(true)
const salesData = ref<number[]>([])
const categories = ref<string[]>([])

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

const chartOptions = computed(() => ({
  colors: ['#3B82F6'],
  chart: {
    fontFamily: 'Outfit, sans-serif',
    type: 'bar' as const,
    toolbar: {
      show: false
    }
  },
  plotOptions: {
    bar: {
      horizontal: false,
      columnWidth: '55%',
      borderRadius: 6,
      borderRadiusApplication: 'end' as const
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
  legend: {
    show: false
  },
  yaxis: {
    title: {
      text: undefined
    },
    labels: {
      style: {
        colors: isDarkMode.value ? '#98A2B3' : '#9CA3AF',
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
    borderColor: isDarkMode.value ? '#1F2A37' : '#E5E7EB',
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
      formatter: function (val: number) {
        return val + ' ventes'
      }
    },
    theme: isDarkMode.value ? 'dark' : 'light'
  }
}))

const fetchSalesData = async (period: string) => {
  if (!authStore.isAuthenticated) {
    console.log('🛑 Skip fetchSalesData: User not authenticated')
    return
  }

  try {
    isLoading.value = true
    console.log('📊 Fetching sales volume data for period:', period)
    
    const response = await api.get('/stats/sales-data', {
      params: { period, year: new Date().getFullYear() }
    })
    
    console.log('✅ Sales volume data received:', response.data)
    salesData.value = response.data.sales || []
    categories.value = response.data.labels || []
  } catch (error) {
    console.error('❌ Error fetching sales volume:', error)
    if (period === 'monthly' || period === '30days') {
      salesData.value = [168, 385, 201, 298, 187, 195, 291, 110, 215, 390, 280, 112]
      categories.value = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']
    } else {
      salesData.value = [550, 520, 645]
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
    console.log('🔐 Auth detected, fetching monthly sales volume...')
    fetchSalesData(dashboardPeriod.value)
  }
})
</script>
