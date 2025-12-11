<template>
  <span v-if="isLoading" class="inline-block animate-pulse">...</span>
  <span v-else class="inline-block">{{ displayValue }}</span>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'

const props = defineProps({
  value: {
    type: Number,
    default: 0
  },
  isLoading: {
    type: Boolean,
    default: false
  },
  isCurrency: {
    type: Boolean,
    default: false
  },
  duration: {
    type: Number,
    default: 1000 // milliseconds
  }
})

const displayValue = ref(props.isCurrency ? '0 HTG' : '0')
const currentValue = ref(0)

const formatCurrency = (value) => {
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value) + ' HTG'
}

const formatNumber = (value) => {
  return new Intl.NumberFormat('fr-FR').format(Math.round(value))
}

const animateValue = (start, end, duration) => {
  if (start === end) {
    currentValue.value = end
    displayValue.value = props.isCurrency ? formatCurrency(end) : formatNumber(end)
    return
  }

  const startTime = performance.now()
  const difference = end - start

  const step = (currentTime) => {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1)
    
    // Easing function (ease-out cubic)
    const easeOut = 1 - Math.pow(1 - progress, 3)
    
    const current = start + (difference * easeOut)
    currentValue.value = current
    displayValue.value = props.isCurrency ? formatCurrency(current) : formatNumber(current)

    if (progress < 1) {
      requestAnimationFrame(step)
    } else {
      currentValue.value = end
      displayValue.value = props.isCurrency ? formatCurrency(end) : formatNumber(end)
    }
  }

  requestAnimationFrame(step)
}

watch(() => props.value, (newValue, oldValue) => {
  if (!props.isLoading && newValue !== oldValue) {
    animateValue(currentValue.value, newValue, props.duration)
  }
})

watch(() => props.isLoading, (newLoading) => {
  if (!newLoading && props.value !== currentValue.value) {
    animateValue(0, props.value, props.duration)
  }
})

onMounted(() => {
  if (!props.isLoading) {
    animateValue(0, props.value, props.duration)
  }
})
</script>
