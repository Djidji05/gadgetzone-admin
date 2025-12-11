<template>
  <div class="grid grid-cols-12 gap-4 md:gap-6">
    <!-- Header with filters -->
    <div class="col-span-12">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Tableau de Bord</h1>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Vue d'ensemble de votre activité e-commerce
          </p>
        </div>
        
        <!-- Quick filters -->
        <div class="flex items-center gap-2">
          <button
            v-for="filter in quickFilters"
            :key="filter.value"
            @click="selectedFilter = filter.value"
            :class="[
              'px-4 py-2 rounded-lg text-sm font-medium transition-all',
              selectedFilter === filter.value
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
            ]"
          >
            {{ filter.label }}
          </button>
        </div>
      </div>
    </div>

    <!-- KPI Cards -->
    <div class="col-span-12 space-y-6 xl:col-span-7">
      <EcommerceMetrics :period="selectedFilter" />
      <MonthlyTarget />
    </div>
    
    <div class="col-span-12 xl:col-span-5">
      <MonthlySale />
    </div>

    <!-- Statistics Chart -->
    <div class="col-span-12">
      <StatisticsChart />
    </div>

    <!-- Customer Demographics & Recent Orders -->
    <div class="col-span-12 xl:col-span-5">
      <CustomerDemographic />
    </div>

    <div class="col-span-12 xl:col-span-7">
      <RecentOrders />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import EcommerceMetrics from '@/components/ecommerce/EcommerceMetrics.vue'
import MonthlyTarget from '@/components/ecommerce/MonthlyTarget.vue'
import MonthlySale from '@/components/ecommerce/MonthlySale.vue'
import CustomerDemographic from '@/components/ecommerce/CustomerDemographic.vue'
import StatisticsChart from '@/components/ecommerce/StatisticsChart.vue'
import RecentOrders from '@/components/ecommerce/RecentOrders.vue'

const quickFilters = [
  { value: 'today', label: "Aujourd'hui" },
  { value: '7days', label: '7 jours' },
  { value: '30days', label: '30 jours' },
  { value: 'year', label: 'Année' }
]

const selectedFilter = ref('30days')

console.log('🔥 Ecommerce.vue - Dashboard complet chargé!')
</script>
