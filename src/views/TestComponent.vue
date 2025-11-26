<template>
  <div style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: red; z-index: 9999; display: flex; align-items: center; justify-content: center; flex-direction: column;">
    <h1 style="color: white; font-size: 48px; text-shadow: 2px 2px 4px black;">COMPOSANT DE TEST VISIBLE!</h1>
    <p style="background: yellow; color: black; padding: 20px; font-size: 24px;">Si vous voyez ceci, le routing fonctionne parfaitement.</p>
    <p style="color: white; font-size: 20px; margin-top: 20px;">✅ Template Vue.js fonctionne!</p>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'

console.log('🎯 TestComponent.vue setup() appelé!')
console.log('🎯 Template devrait être rendu maintenant')

onMounted(() => {
  console.log('🎯 TestComponent.vue mounted() - Le DOM est prêt!')
})
</script>
