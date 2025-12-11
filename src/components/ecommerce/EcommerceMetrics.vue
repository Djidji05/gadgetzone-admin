<template>
  <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
    <!-- Clients Card -->
    <div
      class="group rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 hover:shadow-lg transition-all duration-300 hover:border-blue-300 dark:hover:border-blue-700"
    >
      <div
        class="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl dark:from-blue-900/30 dark:to-blue-800/30 group-hover:scale-110 transition-transform duration-300"
      >
        <svg
          class="fill-blue-600 dark:fill-blue-400"
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M8.80443 5.60156C7.59109 5.60156 6.60749 6.58517 6.60749 7.79851C6.60749 9.01185 7.59109 9.99545 8.80443 9.99545C10.0178 9.99545 11.0014 9.01185 11.0014 7.79851C11.0014 6.58517 10.0178 5.60156 8.80443 5.60156ZM5.10749 7.79851C5.10749 5.75674 6.76267 4.10156 8.80443 4.10156C10.8462 4.10156 12.5014 5.75674 12.5014 7.79851C12.5014 9.84027 10.8462 11.4955 8.80443 11.4955C6.76267 11.4955 5.10749 9.84027 5.10749 7.79851ZM4.86252 15.3208C4.08769 16.0881 3.70377 17.0608 3.51705 17.8611C3.48384 18.0034 3.5211 18.1175 3.60712 18.2112C3.70161 18.3141 3.86659 18.3987 4.07591 18.3987H13.4249C13.6343 18.3987 13.7992 18.3141 13.8937 18.2112C13.9797 18.1175 14.017 18.0034 13.9838 17.8611C13.7971 17.0608 13.4132 16.0881 12.6383 15.3208C11.8821 14.572 10.6899 13.955 8.75042 13.955C6.81096 13.955 5.61877 14.572 4.86252 15.3208ZM3.8071 14.2549C4.87163 13.2009 6.45602 12.455 8.75042 12.455C11.0448 12.455 12.6292 13.2009 13.6937 14.2549C14.7397 15.2906 15.2207 16.5607 15.4446 17.5202C15.7658 18.8971 14.6071 19.8987 13.4249 19.8987H4.07591C2.89369 19.8987 1.73504 18.8971 2.05628 17.5202C2.28015 16.5607 2.76117 15.2906 3.8071 14.2549ZM15.3042 11.4955C14.4702 11.4955 13.7006 11.2193 13.0821 10.7533C13.3742 10.3314 13.6054 9.86419 13.7632 9.36432C14.1597 9.75463 14.7039 9.99545 15.3042 9.99545C16.5176 9.99545 17.5012 9.01185 17.5012 7.79851C17.5012 6.58517 16.5176 5.60156 15.3042 5.60156C14.7039 5.60156 14.1597 5.84239 13.7632 6.23271C13.6054 5.73284 13.3741 5.26561 13.082 4.84371C13.7006 4.37777 14.4702 4.10156 15.3042 4.10156C17.346 4.10156 19.0012 5.75674 19.0012 7.79851C19.0012 9.84027 17.346 11.4955 15.3042 11.4955ZM19.9248 19.8987H16.3901C16.7014 19.4736 16.9159 18.969 16.9827 18.3987H19.9248C20.1341 18.3987 20.2991 18.3141 20.3936 18.2112C20.4796 18.1175 20.5169 18.0034 20.4837 17.861C20.2969 17.0607 19.913 16.088 19.1382 15.3208C18.4047 14.5945 17.261 13.9921 15.4231 13.9566C15.2232 13.6945 14.9995 13.437 14.7491 13.1891C14.5144 12.9566 14.262 12.7384 13.9916 12.5362C16.0926 12.4728 17.5254 13.2678 18.5114 14.2549C19.5573 15.2906 20.0383 16.5607 20.2622 17.5202C20.5834 18.8971 19.4248 19.8987 18.2425 19.8987H19.9248Z"
            fill=""
          />
        </svg>
      </div>

      <div class="flex items-end justify-between mt-5">
        <div>
          <span class="text-sm font-medium text-gray-500 dark:text-gray-400">Clients</span>
          <h4 class="mt-2 font-bold text-gray-800 text-3xl dark:text-white/90 tabular-nums">
            <AnimatedCounter :value="metrics?.counts?.users || 0" :isLoading="isLoading" />
          </h4>
        </div>

        <span
          :class="[
            'flex items-center gap-1 rounded-full py-1.5 pl-2 pr-3 text-sm font-semibold shadow-sm',
            metrics?.growth?.users >= 0
              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400'
              : 'bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-400'
          ]"
        >
          <svg
            :class="[
              'fill-current transition-transform duration-300',
              metrics?.growth?.users >= 0 ? '' : 'rotate-180'
            ]"
            width="14"
            height="14"
            viewBox="0 0 12 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M5.56462 1.62393C5.70193 1.47072 5.90135 1.37432 6.12329 1.37432C6.1236 1.37432 6.12391 1.37432 6.12422 1.37432C6.31631 1.37415 6.50845 1.44731 6.65505 1.59381L9.65514 4.5918C9.94814 4.88459 9.94831 5.35947 9.65552 5.65246C9.36273 5.94546 8.88785 5.94562 8.59486 5.65283L6.87329 3.93247L6.87329 10.125C6.87329 10.5392 6.53751 10.875 6.12329 10.875C5.70908 10.875 5.37329 10.5392 5.37329 10.125L5.37329 3.93578L3.65516 5.65282C3.36218 5.94562 2.8873 5.94547 2.5945 5.65248C2.3017 5.35949 2.30185 4.88462 2.59484 4.59182L5.56462 1.62393Z"
              fill=""
            />
          </svg>

          {{ formatPercentage(metrics?.growth?.users || 0) }}
        </span>
      </div>
    </div>

    <!-- Commandes Card -->
    <div
      class="group rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 hover:shadow-lg transition-all duration-300 hover:border-purple-300 dark:hover:border-purple-700"
    >
      <div
        class="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl dark:from-purple-900/30 dark:to-purple-800/30 group-hover:scale-110 transition-transform duration-300"
      >
        <svg
          class="fill-purple-600 dark:fill-purple-400"
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M11.665 3.75621C11.8762 3.65064 12.1247 3.65064 12.3358 3.75621L18.7807 6.97856L12.3358 10.2009C12.1247 10.3065 11.8762 10.3065 11.665 10.2009L5.22014 6.97856L11.665 3.75621ZM4.29297 8.19203V16.0946C4.29297 16.3787 4.45347 16.6384 4.70757 16.7654L11.25 20.0366V11.6513C11.1631 11.6205 11.0777 11.5843 10.9942 11.5426L4.29297 8.19203ZM12.75 20.037L19.2933 16.7654C19.5474 16.6384 19.7079 16.3787 19.7079 16.0946V8.19202L13.0066 11.5426C12.9229 11.5844 12.8372 11.6208 12.75 11.6516V20.037ZM13.0066 2.41456C12.3732 2.09786 11.6277 2.09786 10.9942 2.41456L4.03676 5.89319C3.27449 6.27432 2.79297 7.05342 2.79297 7.90566V16.0946C2.79297 16.9469 3.27448 17.726 4.03676 18.1071L10.9942 21.5857L11.3296 20.9149L10.9942 21.5857C11.6277 21.9024 12.3732 21.9024 13.0066 21.5857L19.9641 18.1071C20.7264 17.726 21.2079 16.9469 21.2079 16.0946V7.90566C21.2079 7.05342 20.7264 6.27432 19.9641 5.89319L13.0066 2.41456Z"
            fill=""
          />
        </svg>
      </div>

      <div class="flex items-end justify-between mt-5">
        <div>
          <span class="text-sm font-medium text-gray-500 dark:text-gray-400">Commandes</span>
          <h4 class="mt-2 font-bold text-gray-800 text-3xl dark:text-white/90 tabular-nums">
            <AnimatedCounter :value="metrics?.counts?.orders || 0" :isLoading="isLoading" />
          </h4>
        </div>

        <span
          :class="[
            'flex items-center gap-1 rounded-full py-1.5 pl-2 pr-3 text-sm font-semibold shadow-sm',
            metrics?.growth?.orders >= 0
              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400'
              : 'bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-400'
          ]"
        >
          <svg
            :class="[
              'fill-current transition-transform duration-300',
              metrics?.growth?.orders >= 0 ? '' : 'rotate-180'
            ]"
            width="14"
            height="14"
            viewBox="0 0 12 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M5.31462 10.3761C5.45194 10.5293 5.65136 10.6257 5.87329 10.6257C5.8736 10.6257 5.8739 10.6257 5.87421 10.6257C6.0663 10.6259 6.25845 10.5527 6.40505 10.4062L9.40514 7.4082C9.69814 7.11541 9.69831 6.64054 9.40552 6.34754C9.11273 6.05454 8.63785 6.05438 8.34486 6.34717L6.62329 8.06753L6.62329 1.875C6.62329 1.46079 6.28751 1.125 5.87329 1.125C5.45908 1.125 5.12329 1.46079 5.12329 1.875L5.12329 8.06422L3.40516 6.34719C3.11218 6.05439 2.6373 6.05454 2.3445 6.34752C2.0517 6.64051 2.05185 7.11538 2.34484 7.40818L5.31462 10.3761Z"
              fill=""
            />
          </svg>

          {{ formatPercentage(metrics?.growth?.orders || 0) }}
        </span>
      </div>
    </div>

    <!-- Revenus Card -->
    <div
      class="group rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 hover:shadow-lg transition-all duration-300 hover:border-emerald-300 dark:hover:border-emerald-700"
    >
      <div
        class="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl dark:from-emerald-900/30 dark:to-emerald-800/30 group-hover:scale-110 transition-transform duration-300"
      >
        <svg
          class="fill-emerald-600 dark:fill-emerald-400"
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H10.9v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.39-2.1 1.39-1.6 0-2.23-.72-2.32-1.64H8.04c.1 1.7 1.36 2.66 2.86 2.97V19h2.34v-1.67c1.52-.29 2.72-1.16 2.73-2.77-.01-2.2-1.9-2.96-3.66-3.42z"
            fill=""
          />
        </svg>
      </div>

      <div class="flex items-end justify-between mt-5">
        <div>
          <span class="text-sm font-medium text-gray-500 dark:text-gray-400">Revenus</span>
          <h4 class="mt-2 font-bold text-gray-800 text-3xl dark:text-white/90 tabular-nums">
            <AnimatedCounter
              :value="metrics?.counts?.revenue || 0"
              :isLoading="isLoading"
              :isCurrency="true"
            />
          </h4>
        </div>

        <span
          :class="[
            'flex items-center gap-1 rounded-full py-1.5 pl-2 pr-3 text-sm font-semibold shadow-sm',
            metrics?.growth?.revenue >= 0
              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400'
              : 'bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-400'
          ]"
        >
          <svg
            :class="[
              'fill-current transition-transform duration-300',
              metrics?.growth?.revenue >= 0 ? '' : 'rotate-180'
            ]"
            width="14"
            height="14"
            viewBox="0 0 12 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M5.56462 1.62393C5.70193 1.47072 5.90135 1.37432 6.12329 1.37432C6.1236 1.37432 6.12391 1.37432 6.12422 1.37432C6.31631 1.37415 6.50845 1.44731 6.65505 1.59381L9.65514 4.5918C9.94814 4.88459 9.94831 5.35947 9.65552 5.65246C9.36273 5.94546 8.88785 5.94562 8.59486 5.65283L6.87329 3.93247L6.87329 10.125C6.87329 10.5392 6.53751 10.875 6.12329 10.875C5.70908 10.875 5.37329 10.5392 5.37329 10.125L5.37329 3.93578L3.65516 5.65282C3.36218 5.94562 2.8873 5.94547 2.5945 5.65248C2.3017 5.35949 2.30185 4.88462 2.59484 4.59182L5.56462 1.62393Z"
              fill=""
            />
          </svg>

          {{ formatPercentage(metrics?.growth?.revenue || 0) }}
        </span>
      </div>
    </div>

    <!-- Produits Card -->
    <div
      class="group rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 hover:shadow-lg transition-all duration-300 hover:border-orange-300 dark:hover:border-orange-700"
    >
      <div
        class="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl dark:from-orange-900/30 dark:to-orange-800/30 group-hover:scale-110 transition-transform duration-300"
      >
        <svg
          class="fill-orange-600 dark:fill-orange-400"
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M7 4.5C6.17157 4.5 5.5 5.17157 5.5 6C5.5 6.82843 6.17157 7.5 7 7.5C7.82843 7.5 8.5 6.82843 8.5 6C8.5 5.17157 7.82843 4.5 7 4.5ZM4 6C4 4.34315 5.34315 3 7 3C8.65685 3 10 4.34315 10 6C10 7.65685 8.65685 9 7 9C5.34315 9 4 7.65685 4 6ZM17 4.5C16.1716 4.5 15.5 5.17157 15.5 6C15.5 6.82843 16.1716 7.5 17 7.5C17.8284 7.5 18.5 6.82843 18.5 6C18.5 5.17157 17.8284 4.5 17 4.5ZM14 6C14 4.34315 15.3431 3 17 3C18.6569 3 20 4.34315 20 6C20 7.65685 18.6569 9 17 9C15.3431 9 14 7.65685 14 6ZM7 15.5C6.17157 15.5 5.5 16.1716 5.5 17C5.5 17.8284 6.17157 18.5 7 18.5C7.82843 18.5 8.5 17.8284 8.5 17C8.5 16.1716 7.82843 15.5 7 15.5ZM4 17C4 15.3431 5.34315 14 7 14C8.65685 14 10 15.3431 10 17C10 18.6569 8.65685 20 7 20C5.34315 20 4 18.6569 4 17ZM17 15.5C16.1716 15.5 15.5 16.1716 15.5 17C15.5 17.8284 16.1716 18.5 17 18.5C17.8284 18.5 18.5 17.8284 18.5 17C18.5 16.1716 17.8284 15.5 17 15.5ZM14 17C14 15.3431 15.3431 14 17 14C18.6569 14 20 15.3431 20 17C20 18.6569 18.6569 20 17 20C15.3431 20 14 18.6569 14 17Z"
            fill=""
          />
        </svg>
      </div>

      <div class="flex items-end justify-between mt-5">
        <div>
          <span class="text-sm font-medium text-gray-500 dark:text-gray-400">Produits</span>
          <h4 class="mt-2 font-bold text-gray-800 text-3xl dark:text-white/90 tabular-nums">
            <AnimatedCounter :value="metrics?.counts?.products || 0" :isLoading="isLoading" />
          </h4>
        </div>

        <span
          class="flex items-center gap-1 rounded-full bg-gray-50 py-1.5 pl-2 pr-3 text-sm font-semibold text-gray-600 shadow-sm dark:bg-gray-700/50 dark:text-gray-400"
        >
          <svg
            class="fill-current"
            width="14"
            height="14"
            viewBox="0 0 12 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M6 9C6.27614 9 6.5 8.77614 6.5 8.5C6.5 8.22386 6.27614 8 6 8C5.72386 8 5.5 8.22386 5.5 8.5C5.5 8.77614 5.72386 9 6 9Z"
              fill=""
            />
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M6 1C3.23858 1 1 3.23858 1 6C1 8.76142 3.23858 11 6 11C8.76142 11 11 8.76142 11 6C11 3.23858 8.76142 1 6 1ZM2 6C2 4.34315 3.34315 3 5 3V2C2.79086 2 1 3.79086 1 6C1 8.20914 2.79086 10 5 10V9C3.34315 9 2 7.65685 2 6ZM7 2V3C8.65685 3 10 4.34315 10 6C10 7.65685 8.65685 9 7 9V10C9.20914 10 11 8.20914 11 6C11 3.79086 9.20914 2 7 2Z"
              fill=""
            />
          </svg>

          Total
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { statsService } from '@/services/api'
import AnimatedCounter from './AnimatedCounter.vue'

const props = defineProps({
  period: {
    type: String,
    default: '30days'
  }
})

const metrics = ref(null)
const isLoading = ref(true)
const error = ref(null)

const formatPercentage = (value) => {
  const percentage = Math.abs(value)
  return `${percentage.toFixed(1)}%`
}

const fetchMetrics = async () => {
  try {
    isLoading.value = true
    error.value = null

    console.log('🔄 Fetching metrics from API...')
    // Convertir le format de période
    const periodMap = {
      'today': '1j',
      '7days': '7j',
      '30days': '30j',
      'year': '12m'
    }
    const apiPeriod = periodMap[props.period] || '30j'
    const response = await statsService.getOverview(apiPeriod)
    console.log('📊 API Response:', response)
    
    // Handle both old format (nouveauxClients, nbCommandes) and new format (counts.users, counts.orders)
    if (response.counts) {
      // New format with counts object
      metrics.value = {
        counts: {
          users: response.counts.users || 0,
          orders: response.counts.orders || 0,
          revenue: response.counts.revenue || 0,
          products: response.counts.products || 0
        },
        growth: {
          users: response.growth?.users || 0,
          orders: response.growth?.orders || 0,
          revenue: response.growth?.revenue || 0,
          products: response.growth?.products || 0
        }
      }
    } else {
      // Old format (fallback)
      metrics.value = {
        counts: {
          users: response.nouveauxClients || 0,
          orders: response.nbCommandes || 0,
          revenue: response.chiffreAffaires || 0,
          products: response.nbProduitsVendus || 0
        },
        growth: {
          users: response.evolutionClients || 0,
          orders: response.evolutionCommandes || 0,
          revenue: response.evolutionCA || 0,
          products: response.evolutionProduits || 0
        }
      }
    }
    
    console.log('✅ Metrics transformed:', metrics.value)
  } catch (err) {
    console.error('❌ Erreur lors du chargement des métriques:', err)
    error.value = 'Impossible de charger les métriques'
    
    // Fallback data
    metrics.value = {
      counts: { users: 89, orders: 348, revenue: 125487.65, products: 1245 },
      growth: { users: 5.7, orders: 8.2, revenue: 12.5, products: 15.3 }
    }
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchMetrics()
})

// Watch for period changes
watch(() => props.period, () => {
  console.log('🔄 Period changed to:', props.period)
  fetchMetrics()
})
</script>

<style scoped>
.tabular-nums {
  font-variant-numeric: tabular-nums;
}
</style>
