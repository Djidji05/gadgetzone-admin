import { defineStore } from 'pinia'
import { ref, computed, nextTick } from 'vue'
import { authService } from '@/services/api'
import { inactivityTracker } from '@/services/inactivity'
import type { User, LoginCredentials, RegisterData, ProfileUpdateData, PasswordChangeData } from '@/types'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null)
  const token = ref<string | null>(null)
  const isLoading = ref(false)
  const isReady = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const isAuthenticated = computed(() => !!token.value)
  const isAdmin = computed(() => ['admin', 'gestionnaire'].includes(user.value?.role?.toLowerCase() || ''))
  const userRole = computed(() => user.value?.role || 'guest')

  // Actions
  const login = async (credentials: LoginCredentials) => {
    try {
      isLoading.value = true
      error.value = null

      const response = await authService.login(credentials)

      // Axios returns data in response.data
      const data = response.data

      // Vérifier le rôle de l'utilisateur
      const role = data.user?.role?.toLowerCase()
      if (!['admin', 'gestionnaire'].includes(role)) {
        error.value = 'Identifiants invalides'
        return { success: false, error: error.value }
      }

      // Sauvegarder les données
      token.value = data.token
      user.value = data.user as any

      // Persister dans localStorage
      authService.setUser(data.user, data.token)

      // Démarrer le suivi d'activité
      inactivityTracker.start()

      return { success: true, data: data }
    } catch (err: unknown) {
      const errorResponse = err as { response?: { data?: { error?: string } } }
      error.value = errorResponse.response?.data?.error || 'Erreur lors de la connexion'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  const register = async (userData: RegisterData) => {
    try {
      isLoading.value = true
      error.value = null

      const response = await authService.register(userData)

      // Axios returns data in response.data
      const data = response.data

      // Sauvegarder les données
      token.value = data.token
      user.value = data.user as any

      // Persister dans localStorage
      authService.setUser(data.user, data.token)

      return { success: true, data: data }
    } catch (err: unknown) {
      const errorResponse = err as { response?: { data?: { error?: string } } }
      error.value = errorResponse.response?.data?.error || 'Erreur lors de l\'inscription'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  const logout = () => {
    user.value = null
    token.value = null
    error.value = null
    authService.logout()
    localStorage.removeItem('auth-store') // Forcer la suppression de l'état persistant Pinia

    // Arrêter le suivi d'activité
    inactivityTracker.stop()
  }

  const updateProfile = async (userData: ProfileUpdateData) => {
    try {
      isLoading.value = true
      error.value = null

      const response = await authService.updateProfile(userData)

      // Mettre à jour l'utilisateur
      user.value = (response.data?.user as any) || null

      return { success: true, data: response }
    } catch (err: unknown) {
      const errorResponse = err as { response?: { data?: { error?: string } } }
      error.value = errorResponse.response?.data?.error || 'Erreur lors de la mise à jour'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  const changePassword = async (passwordData: PasswordChangeData) => {
    try {
      isLoading.value = true
      error.value = null

      const response = await authService.changePassword(passwordData)

      return { success: true, data: response }
    } catch (err: unknown) {
      const errorResponse = err as { response?: { data?: { error?: string } } }
      error.value = errorResponse.response?.data?.error || 'Erreur lors du changement de mot de passe'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  const checkAuth = () => {
    // Lire depuis le store Pinia persist (clé 'auth-store')
    // La persistance est gérée par pinia-plugin-persistedstate
    // Cette fonction sert de fallback si le store n'est pas encore hydraté
    return !!(token.value && user.value)
  }

  const refreshProfile = async () => {
    try {
      const response = await authService.getProfile()
      user.value = (response.data?.user as any) || null
      return { success: true, data: response }
    } catch (err: unknown) {
      const errorResponse = err as { response?: { data?: { error?: string } } }
      error.value = errorResponse.response?.data?.error || 'Erreur lors du rafraîchissement'
      return { success: false, error: error.value }
    }
  }

  const clearError = () => {
    error.value = null
  }

  const refreshToken = async () => {
    try {
      const tokenString = await authService.refreshToken()
      if (tokenString) {
        token.value = tokenString
      }
      return { success: true }
    } catch (err: unknown) {
      const errorResponse = err as { response?: { data?: { error?: string } } }
      error.value = errorResponse.response?.data?.error || 'Erreur lors du rafraîchissement'
      return { success: false, error: error.value }
    }
  }

  // Initialiser l'auth au chargement du store
  const init = async () => {
    if (isReady.value) return
    
    // Force reset loading and error states on initialization
    isLoading.value = false
    clearError()

    const isAuth = checkAuth()

    // Si authentifié, valider le jeton avec le backend
    if (isAuth) {
      console.log('🔍 Validating existing session on init...')
      try {
        const result = await refreshProfile()
        if (!result.success) {
          console.warn('⚠️ Stale session detected during init, cleaning up.')
          logout()
        } else {
          console.log('✅ Session validated.')
          inactivityTracker.start()
        }
      } catch (err) {
        console.error('❌ Session validation failed:', err)
        logout()
      }
    }

    // Attendre un tick pour s'assurer que l'état est stabilisé
    await nextTick()
    isReady.value = true
  }

  return {
    // State
    user,
    token,
    isLoading,
    isReady,
    error,

    // Getters
    isAuthenticated,
    isAdmin,
    userRole,

    // Actions
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    checkAuth,
    refreshProfile,
    refreshToken,
    clearError,
    init
  }
}, {
  persist: {
    key: 'auth-store',
    storage: localStorage,
    paths: ['user', 'token']
  } as any
})
