<template>
  <router-link to="/" class="lg:hidden">
    <img :src="settingsStore.logoUrl" alt="HTFasil" class="h-16 w-auto" />
  </router-link>
</template>

<script setup>
import { RouterLink } from 'vue-router'
import { useSettingsStore } from '@/stores/settings'

const settingsStore = useSettingsStore()
</script>
