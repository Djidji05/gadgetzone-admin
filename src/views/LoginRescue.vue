<template>
  <div class="min-h-screen bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8 bg-gray-800 p-8 rounded-lg shadow-2xl border border-red-900/50">
      <div>
        <div class="flex justify-center">
            <i class="fas fa-user-shield text-5xl text-red-600"></i>
        </div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-white">
          Accès de Secours
        </h2>
        <p class="mt-2 text-center text-sm text-gray-400">
          Système de connexion d'urgence pour administrateurs.
        </p>
      </div>
      <form class="mt-8 space-y-6" @submit.prevent="handleRescueLogin">
        <div class="rounded-md shadow-sm -space-y-px">
          <div>
            <label for="email-address" class="sr-only">Adresse Email</label>
            <input
              id="email-address"
              name="email"
              type="email"
              autocomplete="email"
              required
              v-model="email"
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-700 placeholder-gray-500 text-white bg-gray-700 rounded-t-md focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm"
              placeholder="Adresse Email Administrateur"
            />
          </div>
          <div>
            <label for="password" class="sr-only">Mot de passe</label>
            <input
              id="password"
              name="password"
              type="password"
              autocomplete="current-password"
              required
              v-model="password"
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-700 placeholder-gray-500 text-white bg-gray-700 rounded-b-md focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm"
              placeholder="Mot de passe"
            />
          </div>
        </div>

        <div v-if="error" class="text-red-400 text-sm text-center font-bold">
          {{ error }}
        </div>

        <div>
          <button
            type="submit"
            :disabled="isLoading"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-red-700 hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
          >
            <span class="absolute left-0 inset-y-0 flex items-center pl-3">
              <i class="fas fa-lock text-red-300 group-hover:text-red-200"></i>
            </span>
            <span v-if="isLoading">Connexion en cours...</span>
            <span v-else>Forcer la Connexion</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const email = ref('')
const password = ref('')
const error = ref('')
const isLoading = ref(false)

const router = useRouter()
const authStore = useAuthStore()

const handleRescueLogin = async () => {
    error.value = ''
    isLoading.value = true
    
    try {
        await authStore.login({
            email: email.value,
            password: password.value
        })
        
        // Redirection directe vers le tableau de bord
        router.push('/')
    } catch (err: any) {
        console.error("Rescue login failed", err)
        error.value = err.response?.data?.message || 'Identifiants invalides ou erreur serveur.'
    } finally {
        isLoading.value = false
    }
}
</script>
