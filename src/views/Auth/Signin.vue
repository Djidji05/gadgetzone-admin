<template>
  <FullScreenLayout>
    <div class="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800 p-4">
      <div class="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-800">
        <div class="p-8 sm:p-10">
          <div class="flex flex-col items-center mb-8">
            <div class="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-brand-50 text-brand-500 mb-4 dark:bg-white/5 dark:text-brand-400">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-7 h-7">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
            </div>
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              GadgetZone Admin
            </h1>
            <p class="text-sm text-gray-500 dark:text-gray-400 text-center">
              Connectez-vous pour gérer votre boutique
            </p>
          </div>

          <!-- Message d'erreur -->
          <Transition
            enter-active-class="transition duration-300 ease-out"
            enter-from-class="transform -translate-y-2 opacity-0"
            enter-to-class="transform translate-y-0 opacity-100"
            leave-active-class="transition duration-200 ease-in"
            leave-from-class="transform translate-y-0 opacity-100"
            leave-to-class="transform -translate-y-2 opacity-0"
          >
            <div v-if="authStore.error" class="mb-6 p-4 text-sm text-error-600 bg-error-50 dark:bg-error-900/20 dark:text-error-400 rounded-lg flex items-center gap-3 border border-error-100 dark:border-error-900/50">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5 flex-shrink-0">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd" />
              </svg>
              <span>{{ authStore.error }}</span>
            </div>
          </Transition>

          <form @submit.prevent="handleSubmit" class="space-y-5">
            <div>
              <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email</label>
              <div class="relative">
                <input
                  v-model="email"
                  type="email"
                  id="email"
                  placeholder="admin@gadgetzone.com"
                  class="block w-full px-4 py-3 rounded-lg border border-gray-300 bg-white dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-colors duration-200 outline-none text-sm"
                />
              </div>
            </div>

            <div>
              <label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Mot de passe</label>
              <div class="relative">
                <input
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  id="password"
                  placeholder="••••••••"
                  class="block w-full px-4 py-3 rounded-lg border border-gray-300 bg-white dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-colors duration-200 outline-none text-sm pr-10"
                />
                <button 
                  type="button"
                  @click="togglePasswordVisibility"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <svg v-if="!showPassword" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                </button>
              </div>
            </div>

            <div class="flex items-center justify-between">
              <label class="flex items-center gap-2 cursor-pointer">
                <input 
                  v-model="keepLoggedIn" 
                  type="checkbox" 
                  class="w-4 h-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500/20"
                >
                <span class="text-sm text-gray-600 dark:text-gray-400">Rester connecté</span>
              </label>
            </div>

            <button
              type="submit"
              class="w-full bg-brand-600 hover:bg-brand-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg focus:ring-4 focus:ring-brand-500/20 outline-none"
            >
              Se connecter
            </button>
          </form>
        </div>
      </div>
    </div>
  </FullScreenLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import FullScreenLayout from '@/components/layout/FullScreenLayout.vue'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const keepLoggedIn = ref(false)

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}

const handleSubmit = async () => {
  if (!email.value || !password.value) return
  
  const result = await authStore.login({
    email: email.value,
    password: password.value
  })

  if (result.success) {
    const redirect = router.currentRoute.value.query.redirect as string || '/'
    router.push(redirect)
  }
}
</script>
