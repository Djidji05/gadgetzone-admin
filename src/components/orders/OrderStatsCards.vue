<template>
  <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
    <!-- Total Commandes -->
    <div
      class="group rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] hover:shadow-lg transition-all duration-300 hover:border-blue-300 dark:hover:border-blue-700"
    >
      <div class="flex items-center justify-between">
        <div
          class="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl dark:from-blue-900/30 dark:to-blue-800/30 group-hover:scale-110 transition-transform duration-300"
        >
          <svg
            class="w-6 h-6 text-blue-600 dark:text-blue-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
            />
          </svg>
        </div>
        <span
          :class="[
            'flex items-center gap-1 rounded-full py-1 pl-2 pr-3 text-xs font-semibold',
            stats.ordersGrowth >= 0
              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400'
              : 'bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-400'
          ]"
        >
          <svg
            :class="[
              'w-3 h-3 fill-current',
              stats.ordersGrowth >= 0 ? '' : 'rotate-180'
            ]"
            viewBox="0 0 12 12"
          >
            <path d="M6 3l4 4H2l4-4z" />
          </svg>
          {{ Math.abs(stats.ordersGrowth).toFixed(1) }}%
        </span>
      </div>
      <div class="mt-4">
        <p class="text-sm text-gray-500 dark:text-gray-400">Total Commandes</p>
        <p class="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
          {{ stats.totalOrders }}
        </p>
      </div>
    </div>

    <!-- Revenus du Mois -->
    <div
      class="group rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] hover:shadow-lg transition-all duration-300 hover:border-emerald-300 dark:hover:border-emerald-700"
    >
      <div class="flex items-center justify-between">
        <div
          class="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl dark:from-emerald-900/30 dark:to-emerald-800/30 group-hover:scale-110 transition-transform duration-300"
        >
          <svg
            class="w-6 h-6 text-emerald-600 dark:text-emerald-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <span
          :class="[
            'flex items-center gap-1 rounded-full py-1 pl-2 pr-3 text-xs font-semibold',
            stats.revenueGrowth >= 0
              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400'
              : 'bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-400'
          ]"
        >
          <svg
            :class="[
              'w-3 h-3 fill-current',
              stats.revenueGrowth >= 0 ? '' : 'rotate-180'
            ]"
            viewBox="0 0 12 12"
          >
            <path d="M6 3l4 4H2l4-4z" />
          </svg>
          {{ Math.abs(stats.revenueGrowth).toFixed(1) }}%
        </span>
      </div>
      <div class="mt-4">
        <p class="text-sm text-gray-500 dark:text-gray-400">Revenus du Mois</p>
        <p class="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
          {{ formatCurrency(stats.monthlyRevenue) }}
        </p>
      </div>
    </div>

    <!-- En Attente -->
    <div
      class="group rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] hover:shadow-lg transition-all duration-300 hover:border-orange-300 dark:hover:border-orange-700"
    >
      <div class="flex items-center justify-between">
        <div
          class="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl dark:from-orange-900/30 dark:to-orange-800/30 group-hover:scale-110 transition-transform duration-300"
        >
          <svg
            class="w-6 h-6 text-orange-600 dark:text-orange-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <span class="flex items-center gap-1 rounded-full bg-orange-50 py-1 pl-2 pr-3 text-xs font-semibold text-orange-700 dark:bg-orange-500/15 dark:text-orange-400">
          À traiter
        </span>
      </div>
      <div class="mt-4">
        <p class="text-sm text-gray-500 dark:text-gray-400">En Attente</p>
        <p class="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
          {{ stats.pendingOrders }}
        </p>
      </div>
    </div>

    <!-- Taux de Livraison -->
    <div
      class="group rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] hover:shadow-lg transition-all duration-300 hover:border-purple-300 dark:hover:border-purple-700"
    >
      <div class="flex items-center justify-between">
        <div
          class="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl dark:from-purple-900/30 dark:to-purple-800/30 group-hover:scale-110 transition-transform duration-300"
        >
          <svg
            class="w-6 h-6 text-purple-600 dark:text-purple-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <span class="flex items-center gap-1 rounded-full bg-purple-50 py-1 pl-2 pr-3 text-xs font-semibold text-purple-700 dark:bg-purple-500/15 dark:text-purple-400">
          Succès
        </span>
      </div>
      <div class="mt-4">
        <p class="text-sm text-gray-500 dark:text-gray-400">Taux de Livraison</p>
        <p class="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
          {{ stats.deliveryRate.toFixed(1) }}%
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  orders: any[]
}

const props = defineProps<Props>()

const stats = computed(() => {
  const total = props.orders.length
  const pending = props.orders.filter(o => o.status === 'pending').length
  const delivered = props.orders.filter(o => o.status === 'delivered').length
  
  // Calculate monthly revenue
  const now = new Date()
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const monthlyOrders = props.orders.filter(o => new Date(o.created_at) >= firstDayOfMonth)
  const monthlyRevenue = monthlyOrders.reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0)
  
  // Calculate previous month for growth
  const firstDayOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const lastDayOfPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0)
  const prevMonthOrders = props.orders.filter(o => {
    const date = new Date(o.created_at)
    return date >= firstDayOfPrevMonth && date <= lastDayOfPrevMonth
  })
  const prevMonthRevenue = prevMonthOrders.reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0)
  
  const revenueGrowth = prevMonthRevenue > 0 
    ? ((monthlyRevenue - prevMonthRevenue) / prevMonthRevenue) * 100 
    : 0
  
  const ordersGrowth = prevMonthOrders.length > 0
    ? ((monthlyOrders.length - prevMonthOrders.length) / prevMonthOrders.length) * 100
    : 0
  
  const deliveryRate = total > 0 ? (delivered / total) * 100 : 0
  
  return {
    totalOrders: total,
    pendingOrders: pending,
    monthlyRevenue,
    deliveryRate,
    revenueGrowth,
    ordersGrowth
  }
})

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value) + ' G'
}
</script>
