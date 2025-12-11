<template>
  <span
    :class="[
      'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-all',
      badgeClasses
    ]"
  >
    <component :is="icon" class="w-3.5 h-3.5" />
    {{ label }}
  </span>
</template>

<script setup lang="ts">
import { computed, h } from 'vue'

interface Props {
  status: string
}

const props = defineProps<Props>()

const statusConfig = {
  pending: {
    label: 'En attente',
    classes: 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400 ring-1 ring-amber-600/20',
    icon: () => h('svg', {
      fill: 'none',
      stroke: 'currentColor',
      viewBox: '0 0 24 24'
    }, [
      h('path', {
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        'stroke-width': '2',
        d: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
      })
    ])
  },
  processing: {
    label: 'En traitement',
    classes: 'bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400 ring-1 ring-blue-600/20',
    icon: () => h('svg', {
      fill: 'none',
      stroke: 'currentColor',
      viewBox: '0 0 24 24'
    }, [
      h('path', {
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        'stroke-width': '2',
        d: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15'
      })
    ])
  },
  shipped: {
    label: 'Expédiée',
    classes: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-400 ring-1 ring-indigo-600/20',
    icon: () => h('svg', {
      fill: 'none',
      stroke: 'currentColor',
      viewBox: '0 0 24 24'
    }, [
      h('path', {
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        'stroke-width': '2',
        d: 'M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4'
      })
    ])
  },
  delivered: {
    label: 'Livrée',
    classes: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400 ring-1 ring-emerald-600/20',
    icon: () => h('svg', {
      fill: 'none',
      stroke: 'currentColor',
      viewBox: '0 0 24 24'
    }, [
      h('path', {
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        'stroke-width': '2',
        d: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
      })
    ])
  },
  cancelled: {
    label: 'Annulée',
    classes: 'bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-400 ring-1 ring-red-600/20',
    icon: () => h('svg', {
      fill: 'none',
      stroke: 'currentColor',
      viewBox: '0 0 24 24'
    }, [
      h('path', {
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        'stroke-width': '2',
        d: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z'
      })
    ])
  }
}

const config = computed(() => statusConfig[props.status as keyof typeof statusConfig] || statusConfig.pending)
const badgeClasses = computed(() => config.value.classes)
const label = computed(() => config.value.label)
const icon = computed(() => config.value.icon)
</script>
