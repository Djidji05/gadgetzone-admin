<template>
  <template v-if="authStore.isReady">
    <component :is="layout">
      <router-view />
    </component>
    <NotificationProvider />
  </template>
  
  <!-- Overlay de chargement initial pour éviter le flash de contenu -->
  <div v-else class="fixed inset-0 bg-white dark:bg-gray-900 z-[9999] flex flex-col items-center justify-center">
    <div class="w-16 h-16 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin mb-4"></div>
    <p class="text-gray-500 dark:text-gray-400 font-medium animate-pulse">Chargement de l'administration...</p>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useSettingsStore } from '@/stores/settings'
import { inactivityTracker } from '@/services/inactivity'
import AdminLayout from './components/layout/AdminLayout.vue'
import AuthLayout from './components/layout/AuthLayout.vue'
import ThemeProvider from './components/layout/ThemeProvider.vue'
import SidebarProvider from './components/layout/SidebarProvider.vue'
import NotificationProvider from './components/ui/NotificationProvider.vue'
import { h } from 'vue'

const AdminLayoutWithProviders = {
  setup(props: any, { slots }: any) {
    return () => h(ThemeProvider, () => [
      h(SidebarProvider, () => [
        h(AdminLayout, null, slots)
      ])
    ])
  }
}

const route = useRoute()
const authStore = useAuthStore()
const settingsStore = useSettingsStore()

// Initialiser l'authentification immédiatement
authStore.init()

onMounted(() => {
  settingsStore.fetchGeneralSettings()
})

const layout = computed(() => {
  if (route.meta.layout === 'auth') return AuthLayout
  
  // Sécurité supplémentaire : si l'utilisateur n'est pas authentifié,
  // on ne lui montre jamais le layout admin (avec sidebar/header)
  // même si le router n'a pas encore fini sa redirection vers /signin
  if (!authStore.isAuthenticated) return AuthLayout
  
  return AdminLayoutWithProviders
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
    // Synchroniser localStorage si les clés directes manquent
    if (!localStorage.getItem('auth_token') && authStore.token) {
      localStorage.setItem('auth_token', authStore.token)
    }
    if (!localStorage.getItem('user_data') && authStore.user) {
      localStorage.setItem('user_data', JSON.stringify(authStore.user))
    }
    
    inactivityTracker.start()
    startTokenRefresh()
  }
})

onUnmounted(() => {
  stopTokenRefresh()
  inactivityTracker.stop()
})
</script>
