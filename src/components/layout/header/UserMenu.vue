<template>
  <div class="relative" ref="dropdownRef">
    <div class="flex items-center gap-2">
      <!-- Language Switcher -->
      <div class="relative language-switcher">
        <button 
          class="flex items-center text-gray-700 dark:text-gray-400 gap-1 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          @click.stop="toggleLanguageDropdown"
          aria-haspopup="true"
          :aria-expanded="languageDropdownOpen"
        >
          <span class="uppercase text-sm">{{ locale }}</span>
          <ChevronDownIcon class="w-4 h-4 transition-transform" :class="{ 'rotate-180': languageDropdownOpen }" />
        </button>
        
        <!-- Language Dropdown -->
        <div 
          v-if="languageDropdownOpen" 
          class="absolute right-0 mt-1 w-32 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg z-50 border border-gray-200 dark:border-gray-700"
          role="menu"
        >
          <button
            v-for="lang in availableLanguages"
            :key="lang.code"
            @click="changeLanguage(lang.code)"
            class="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
            :class="{ 'bg-gray-100 dark:bg-gray-700': locale === lang.code }"
            role="menuitem"
          >
            <span class="text-sm">{{ lang.flag }}</span>
            <span>{{ lang.name }}</span>
          </button>
        </div>
      </div>

      <!-- User Menu -->
      <button
        class="flex items-center text-gray-700 dark:text-gray-400 gap-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        @click.stop="toggleDropdown"
        aria-haspopup="true"
        :aria-expanded="dropdownOpen"
      >
        <span class="font-medium text-sm">{{ userName }}</span>
        <ChevronDownIcon :class="['w-4 h-4 transition-transform', { 'rotate-180': dropdownOpen }]" />
      </button>
    </div>

    <!-- Dropdown -->
    <div
      v-if="dropdownOpen"
      class="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg z-50 border border-gray-200 dark:border-gray-700"
      role="menu"
    >
      <div class="p-2">
        <div class="px-4 py-2">
          <p class="text-sm font-medium text-gray-900 dark:text-white">{{ userName }}</p>
          <p class="text-xs text-gray-500 dark:text-gray-400">{{ userEmail }}</p>
        </div>

        <div class="h-px my-1 bg-gray-200 dark:bg-gray-700"></div>

        <router-link
          v-for="(item, index) in menuItems"
          :key="index"
          :to="item.href"
          class="group flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
          @click="closeDropdown"
          role="menuitem"
        >
          <component :is="item.icon" class="w-4 h-4 text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300" />
          {{ item.text }}
        </router-link>

        <div class="h-px my-1 bg-gray-200 dark:bg-gray-700"></div>

        <button
          @click="signOut"
          class="w-full text-left group flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 rounded-md"
          role="menuitem"
        >
          <LogoutIcon
            class="w-4 h-4 text-red-500 group-hover:text-red-700 dark:group-hover:text-red-300"
          />
          Se déconnecter
        </button>
      </div>
    </div>
    <!-- Dropdown End -->
  </div>
</template>

<script setup lang="ts">
import { ChevronDownIcon, InfoCircleIcon, LogoutIcon, SettingsIcon } from '@/icons'
import { onMounted, onUnmounted, ref, watch, computed } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

type Language = {
  code: 'fr' | 'en';
  name: string;
  flag: string;
};

const authStore = useAuthStore()
const router = useRouter()
const locale = ref('fr')

const dropdownOpen = ref(false)
const languageDropdownOpen = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)

// Données utilisateur dynamiques
const userName = computed(() => authStore.user?.name || 'Utilisateur')
const userEmail = computed(() => authStore.user?.email || '')
const userRole = computed(() => authStore.user?.role || 'User')

// Langues disponibles
const availableLanguages: Language[] = [
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'en', name: 'English', flag: '🇬🇧' }
]

const menuItems = [
  { href: '/profile', icon: SettingsIcon, text: 'Mon Profil' },
]

const toggleDropdown = () => {
  dropdownOpen.value = !dropdownOpen.value
  if (dropdownOpen.value) languageDropdownOpen.value = false
}

const toggleLanguageDropdown = (event: Event) => {
  event.stopPropagation()
  languageDropdownOpen.value = !languageDropdownOpen.value
  if (languageDropdownOpen.value) dropdownOpen.value = false
}

const closeDropdown = () => {
  dropdownOpen.value = false
  languageDropdownOpen.value = false
}

const changeLanguage = (lang: 'fr' | 'en') => {
  locale.value = lang
  localStorage.setItem('userLanguage', lang)
  document.documentElement.lang = lang
  languageDropdownOpen.value = false
}

const signOut = () => {
  authStore.logout()
  closeDropdown()
  // Forcer le rechargement pour nettoyer l'état complètement
  window.location.href = '/signin'
}

const handleClickOutside = (event: Event) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    closeDropdown()
  }
  
  // Fermer le menu des langues si on clique en dehors
  const languageButton = document.querySelector('.language-switcher')
  if (languageButton && !languageButton.contains(event.target as Node)) {
    languageDropdownOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  window.addEventListener('scroll', closeDropdown)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener('scroll', closeDropdown)
})

// Fermer les menus lors du changement de route
const route = useRoute()
watch(() => route.path, () => {
  closeDropdown()
})
</script>
