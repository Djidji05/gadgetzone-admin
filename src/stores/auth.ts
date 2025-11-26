import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authService } from '@/services/api'
import type { User, LoginCredentials, RegisterData, ProfileUpdateData, PasswordChangeData } from '@/types'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null)
  const token = ref<string | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const isAuthenticated = computed(() => !!token.value)
  const isAdmin = computed(() => user.value?.role === 'admin')
  const userRole = computed(() => user.value?.role || 'guest')

  // Actions
  const login = async (credentials: LoginCredentials) => {
    try {
      isLoading.value = true
      error.value = null
      
      const response = await authService.login(credentials)
      
      // Sauvegarder les données
      token.value = response.token
      user.value = response.user
      
      // Persister dans localStorage
      authService.setUser(response.user, response.token)
      
      return { success: true, data: response }
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
      
      // Sauvegarder les données
      token.value = response.token
      user.value = response.user
      
      // Persister dans localStorage
      authService.setUser(response.user, response.token)
      
      return { success: true, data: response }
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
  }

  const updateProfile = async (userData: ProfileUpdateData) => {
    try {
      isLoading.value = true
      error.value = null
      
      const response = await authService.updateProfile(userData)
      
      // Mettre à jour l'utilisateur
      user.value = response.data?.user
      
      // Mettre à jour localStorage
      localStorage.setItem('user_data', JSON.stringify(response.data?.user))
      
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
    // Vérifier s'il y a des données dans localStorage
    const savedToken = localStorage.getItem('auth_token')
    const savedUser = localStorage.getItem('user_data')
    
    if (savedToken && savedUser) {
      try {
        token.value = savedToken
        user.value = JSON.parse(savedUser)
        return true
      } catch {
        // Nettoyer si les données sont corrompues
        logout()
        return false
      }
    }
    
    return false
  }

  const refreshProfile = async () => {
    try {
      const response = await authService.getProfile()
      user.value = response.data?.user
      localStorage.setItem('user_data', JSON.stringify(response.data?.user))
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

  // Initialiser l'auth au chargement du store
  const init = () => {
    checkAuth()
  }

  return {
    // State
    user,
    token,
    isLoading,
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
    clearError,
    init
  }
}, {
  persist: {
    key: 'auth-store',
    storage: localStorage,
    paths: ['user', 'token']
  }
})
