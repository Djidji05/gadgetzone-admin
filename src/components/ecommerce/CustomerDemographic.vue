<template>
  <div
    class="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6"
  >
    <div class="flex justify-between">
      <div>
        <h3 class="text-lg font-semibold text-gray-800 dark:text-white/90">
          Démographie des Clients
        </h3>
        <p class="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
          Statistiques et répartition de vos clients
        </p>
      </div>
    </div>
    
    <!-- Statistics Cards -->
    <div class="grid grid-cols-2 gap-4 my-6">
      <div class="p-4 border border-gray-200 rounded-xl bg-gray-50 dark:border-gray-800 dark:bg-gray-900">
        <p class="text-xs text-gray-500 dark:text-gray-400">Total Clients</p>
        <p class="mt-2 text-2xl font-bold text-gray-800 dark:text-white/90">{{ demographics.totalCustomers }}</p>
        <p class="mt-1 text-xs text-emerald-600 dark:text-emerald-400">+{{ demographics.newThisMonth }} ce mois</p>
      </div>
      <div class="p-4 border border-gray-200 rounded-xl bg-gray-50 dark:border-gray-800 dark:bg-gray-900">
        <p class="text-xs text-gray-500 dark:text-gray-400">Clients Actifs</p>
        <p class="mt-2 text-2xl font-bold text-gray-800 dark:text-white/90">{{ demographics.activeCustomers }}</p>
        <p class="mt-1 text-xs text-blue-600 dark:text-blue-400">{{ demographics.activePercentage }}% du total</p>
      </div>
    </div>

    <!-- Top Cities -->
    <div class="space-y-5">
      <h4 class="text-sm font-semibold text-gray-800 dark:text-white/90">Répartition des Utilisateurs</h4>
      <div v-if="demographics.topCities.length === 0" class="py-8 text-center text-gray-500">
        Aucune donnée disponible
      </div>
      <div v-else v-for="city in demographics.topCities" :key="city.name" class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30">
            <svg class="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <p class="font-semibold text-gray-800 text-theme-sm dark:text-white/90">{{ city.name }}</p>
            <span class="block text-gray-500 text-theme-xs dark:text-gray-400">
              {{ city.count }} Client{{ city.count > 1 ? 's' : '' }}
            </span>
          </div>
        </div>

        <div class="flex w-full max-w-[140px] items-center gap-3">
          <div class="relative block h-2 w-full max-w-[100px] rounded-sm bg-gray-200 dark:bg-gray-800">
            <div
              class="absolute left-0 top-0 flex h-full items-center justify-center rounded-sm bg-brand-500 text-xs font-medium text-white"
              :style="{ width: city.percentage + '%' }"
            ></div>
          </div>
          <p class="font-medium text-gray-800 text-theme-sm dark:text-white/90">{{ city.percentage }}%</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { statsService } from '@/services/api'

const demographics = ref({
  totalCustomers: 0,
  newThisMonth: 0,
  activeCustomers: 0,
  activePercentage: 0,
  topCities: []
})

const isLoading = ref(true)

const fetchDemographics = async () => {
  try {
    isLoading.value = true
    const data = await statsService.getCustomerDemographics()
    demographics.value = data
    console.log('📊 Customer demographics loaded:', data)
  } catch (error) {
    console.error('❌ Error fetching demographics:', error)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchDemographics()
})
</script>
