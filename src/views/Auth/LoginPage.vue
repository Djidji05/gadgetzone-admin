<template>
  <div class="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
    <div class="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-lg dark:bg-gray-800">
      <!-- Header -->
      <div class="text-center">
        <h2 class="text-3xl font-bold text-gray-900 dark:text-white">
          Connexion GadgetZone
        </h2>
        <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Accédez à votre dashboard d'administration
        </p>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleLogin" class="space-y-6">
        <!-- Email -->
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Email
          </label>
          <div class="mt-1">
            <input
              id="email"
              v-model="form.email"
              type="email"
              required
              :disabled="authStore.isLoading"
              class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="admin@gadgetzone.com"
            />
          </div>
        </div>

        <!-- Password -->
        <div>
          <label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Mot de passe
          </label>
          <div class="mt-1">
            <input
              id="password"
              v-model="form.password"
              type="password"
              required
              :disabled="authStore.isLoading"
              class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="••••••••"
            />
          </div>
        </div>

        <!-- Error Message -->
        <div v-if="authStore.error" class="p-3 text-sm text-red-600 bg-red-50 rounded-md dark:bg-red-900/20 dark:text-red-400">
          {{ authStore.error }}
        </div>

        <!-- Submit Button -->
        <div>
          <button
            type="submit"
            :disabled="authStore.isLoading"
            class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg
              v-if="authStore.isLoading"
              class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              ></circle>
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            {{ authStore.isLoading ? 'Connexion...' : 'Se connecter' }}
          </button>
        </div>
      </form>

      <!-- Demo Accounts -->
      <div class="mt-6 p-4 bg-gray-50 rounded-md dark:bg-gray-700">
        <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Comptes de démonstration :
        </h3>
        <div class="space-y-1 text-xs text-gray-600 dark:text-gray-400">
          <div>
            <strong>Admin:</strong> admin@gadgetzone.com / password123
          </div>
          <div>
            <strong>Client:</strong> jean.dupont@example.com / password123
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const form = ref({
  email: '',
  password: ''
})

const handleLogin = async () => {
  const result = await authStore.login(form.value)
  
  if (result.success) {
    // Rediriger vers le dashboard
    router.push('/')
  }
}

onMounted(() => {
  // Si déjà connecté, rediriger vers le dashboard
  if (authStore.isAuthenticated) {
    router.push('/')
  }
})
</script>
