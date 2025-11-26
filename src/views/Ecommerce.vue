<template>
  <div class="grid grid-cols-12 gap-4 md:gap-6">
    <div class="col-span-12 space-y-6 xl:col-span-7">
      <EcommerceMetrics />
      <MonthlyTarget />
    </div>
    <div class="col-span-12 xl:col-span-5">
      <MonthlySale />
    </div>

    <div class="col-span-12">
      <StatisticsChart />
    </div>

    <div class="col-span-12 xl:col-span-5">
      <CustomerDemographic />
    </div>

    <div class="col-span-12 xl:col-span-7">
      <RecentOrders />
    </div>
  </div>
</template>

<script setup lang="ts">
import EcommerceMetrics from '@/components/ecommerce/EcommerceMetrics.vue'
import MonthlyTarget from '@/components/ecommerce/MonthlyTarget.vue'
import MonthlySale from '@/components/ecommerce/MonthlySale.vue'
import CustomerDemographic from '@/components/ecommerce/CustomerDemographic.vue'
import StatisticsChart from '@/components/ecommerce/StatisticsChart.vue'
import RecentOrders from '@/components/ecommerce/RecentOrders.vue'

console.log('🔥 Ecommerce.vue - Dashboard complet chargé!')
</script>
