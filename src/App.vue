<template>
  <component :is="layout">
    <router-view />
  </component>
  <NotificationProvider />
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { inactivityTracker } from '@/services/inactivity'
import AdminLayout from './components/layout/AdminLayout.vue'
import AuthLayout from './components/layout/AuthLayout.vue'
import ThemeProvider from './components/layout/ThemeProvider.vue'
import SidebarProvider from './components/layout/SidebarProvider.vue'
import NotificationProvider from './components/ui/NotificationProvider.vue'
import { h } from 'vue'

const AdminLayoutWithProviders = {
  setup(props, { slots }) {
    return () => h(ThemeProvider, () => [
      h(SidebarProvider, () => [
        h(AdminLayout, null, slots)
      ])
    ])
  }
}

const route = useRoute()
const authStore = useAuthStore()

const layout = computed(() => {
  return route.meta.layout === 'auth' ? AuthLayout : AdminLayoutWithProviders
})

// --- Gestion du rafraîchissement de token ---
let refreshInterval: NodeJS.Timeout | null = null
const REFRESH_RATE = 4 * 60 * 1000 // Toutes les 4 minutes
const ACTIVITY_THRESHOLD = 5 * 60 * 1000 // Doit avoir été actif dans les 5 dernières minutes

const startTokenRefresh = () => {
  stopTokenRefresh() // Nettoyer avant de démarrer
  
  refreshInterval = setInterval(async () => {
    // Si l'utilisateur est connecté et a été actif récemment
    if (authStore.isAuthenticated && !inactivityTracker.isInactive(ACTIVITY_THRESHOLD)) {
      await authStore.refreshToken()
    }
  }, REFRESH_RATE)
}

const stopTokenRefresh = () => {
  if (refreshInterval) {
    clearInterval(refreshInterval)
    refreshInterval = null
  }
}

// Observer l'état de l'authentification
watch(() => authStore.isAuthenticated, (isAuthenticated) => {
  if (isAuthenticated) {
    inactivityTracker.start()
    startTokenRefresh()
  } else {
    inactivityTracker.stop()
    stopTokenRefresh()
  }
})

onMounted(() => {
  // Si l'utilisateur est déjà connecté (persistance)
  if (authStore.isAuthenticated) {
    inactivityTracker.start()
    startTokenRefresh()
  }
})

onUnmounted(() => {
  stopTokenRefresh()
  inactivityTracker.stop()
})
</script>
