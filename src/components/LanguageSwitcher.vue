<template>
  <div class="language-switcher">
    <button 
      v-for="lang in availableLanguages" 
      :key="lang.code"
      :class="['lang-btn', { active: currentLang === lang.code }]"
      @click="changeLanguage(lang.code)"
    >
      {{ lang.flag }} {{ lang.name }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';

const { locale } = useI18n();
const currentLang = ref(locale.value);

const availableLanguages = [
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'en', name: 'English', flag: '🇬🇧' }
];

const changeLanguage = (lang: string) => {
  currentLang.value = lang;
  locale.value = lang;
  localStorage.setItem('userLanguage', lang);
  document.documentElement.lang = lang;
};

onMounted(() => {
  const savedLang = localStorage.getItem('userLanguage');
  if (savedLang) {
    currentLang.value = savedLang;
    locale.value = savedLang;
  }
});
</script>

<style scoped>
.language-switcher {
  display: flex;
  gap: 8px;
  padding: 8px;
  background: #f5f5f5;
  border-radius: 4px;
}

.lang-btn {
  padding: 4px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}

.lang-btn:hover {
  background: #e9e9e9;
}

.lang-btn.active {
  background: #4CAF50;
  color: white;
  border-color: #45a049;
}
</style>
