import './assets/main.css';
// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'jsvectormap/dist/jsvectormap.css';
import 'flatpickr/dist/flatpickr.css';

// Import Chart.js global configuration désactivé pour éviter les conflits
// import './plugins/chart';

import { createApp } from 'vue';
import { createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
import App from './App.vue';
import router from './router';
import VueApexCharts from 'vue3-apexcharts';

// Fonction pour initialiser l'application
const initApp = () => {
  try {
    // Créer l'application
    const app = createApp(App);
    
    // Configurer Pinia avec persistence
    const pinia = createPinia();
    pinia.use(piniaPluginPersistedstate);
    
    // Configuration des plugins
    app.use(pinia);
    app.use(router);
    app.use(VueApexCharts);
    
    // Montage de l'application
    app.mount('#app');
    
    console.log('✅ Application démarrée avec succès');
  } catch (error) {
    console.error('❌ Erreur lors du démarrage de l\'application:', error);
  }
};

// Démarrer l'application immédiatement
initApp();
