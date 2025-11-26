import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(to, from, savedPosition) {
    return savedPosition || { left: 0, top: 0 }
  },
  routes: [
    {
      path: '/',
      name: 'Ecommerce',
      component: () => import('../views/Ecommerce.vue'),
      meta: {
        title: 'Tableau de bord',
      },
    },
    // Routes pour les clients
    {
      path: '/clients',
      name: 'ListeClients',
      component: () => import('../views/Clients/ListeClients.vue'),
      meta: {
        title: 'Gestion des clients',
      },
    },
    {
      path: '/ajouter-client',
      name: 'AjouterClient',
      component: () => import('../views/Clients/ListeClients.vue'),
      meta: {
        title: 'Ajouter un client',
      },
    },
    {
      path: '/modifier-client/:id',
      name: 'ModifierClient',
      component: () => import('../views/Clients/ListeClients.vue'),
      meta: {
        title: 'Modifier un client',
      },
    },
    // Routes pour les commandes
    {
      path: '/liste-commandes',
      name: 'ListeCommandes',
      component: () => import('../views/Commandes/ListeCommandes.vue'),
      meta: {
        title: 'Liste des commandes',
      },
    },
    {
      path: '/commandes-en-cours',
      name: 'CommandesEnCours',
      component: () => import('../views/Commandes/CommandesEnCours.vue'),
      meta: {
        title: 'Commandes en cours',
      },
    },
    {
      path: '/commandes-livrees',
      name: 'CommandesLivrees',
      component: () => import('../views/Commandes/CommandesLivrees.vue'),
      meta: {
        title: 'Commandes livrées',
      },
    },
    {
      path: '/commandes-annulees',
      name: 'CommandesAnnulees',
      component: () => import('../views/Commandes/CommandesAnnulees.vue'),
      meta: {
        title: 'Commandes annulées',
      },
    },

    // Routes pour les produits
    {
      path: '/ajouter-produit',
      name: 'AjouterProduit',
      component: () => import('../views/Produits/AjouterProduit.vue'),
      meta: {
        title: 'Ajouter un produit',
      },
    },
    {
      path: '/liste-produits',
      name: 'ListeProduits',
      component: () => import('../views/Produits/ListeProduits.vue'),
      meta: {
        title: 'Liste des produits',
      },
    },
    {
      path: '/modifier-produit/:id',
      name: 'ModifierProduit',
      component: () => import('../views/Produits/AjouterProduit.vue'),
      meta: {
        title: 'Modifier un produit',
      },
    },
    {
      path: '/calendar',
      name: 'Calendar',
      component: () => import('../views/Others/Calendar.vue'),
      meta: {
        title: 'Calendar',
      },
    },
    {
      path: '/rapports',
      name: 'Rapports',
      component: () => import('../views/Rapports/RapportsView.vue'),
      meta: {
        title: 'Rapports et analyses',
      },
    },
    {
      path: '/analytics',
      name: 'Analytics',
      component: () => import('../views/Analytics/Analytics.vue'),
      meta: {
        title: 'Analyse du trafic',
      },
    },
    {
      path: '/profile',
      name: 'Profile',
      component: () => import('../views/Others/UserProfile.vue'),
      meta: {
        title: 'Profile',
      },
    },
    {
      path: '/form-elements',
      name: 'Form Elements',
      component: () => import('../views/Forms/FormElements.vue'),
      meta: {
        title: 'Form Elements',
      },
    },
    {
      path: '/basic-tables',
      name: 'Basic Tables',
      component: () => import('../views/Tables/BasicTables.vue'),
      meta: {
        title: 'Basic Tables',
      },
    },
    {
      path: '/line-chart',
      name: 'Line Chart',
      component: () => import('../views/Chart/LineChart/LineChart.vue'),
    },
    {
      path: '/bar-chart',
      name: 'Bar Chart',
      component: () => import('../views/Chart/BarChart/BarChart.vue'),
    },
    {
      path: '/alerts',
      name: 'Alerts',
      component: () => import('../views/UiElements/Alerts.vue'),
      meta: {
        title: 'Alerts',
      },
    },
    {
      path: '/avatars',
      name: 'Avatars',
      component: () => import('../views/UiElements/Avatars.vue'),
      meta: {
        title: 'Avatars',
      },
    },
    {
      path: '/badge',
      name: 'Badge',
      component: () => import('../views/UiElements/Badges.vue'),
      meta: {
        title: 'Badge',
      },
    },

    {
      path: '/buttons',
      name: 'Buttons',
      component: () => import('../views/UiElements/Buttons.vue'),
      meta: {
        title: 'Buttons',
      },
    },

    {
      path: '/images',
      name: 'Images',
      component: () => import('../views/UiElements/Images.vue'),
      meta: {
        title: 'Images',
      },
    },
    // Routes pour les paiements
    {
      path: '/paiements',
      name: 'Paiements',
      component: () => import('../views/Paiements/Paiements.vue'),
      meta: {
        title: 'Gestion des paiements',
      },
    },
    {
      path: '/videos',
      name: 'Videos',
      component: () => import('../views/UiElements/Videos.vue'),
      meta: {
        title: 'Videos',
      },
    },
    {
      path: '/blank',
      name: 'Blank',
      component: () => import('../views/Pages/BlankPage.vue'),
      meta: {
        title: 'Blank',
      },
    },

    {
      path: '/error-404',
      name: '404 Error',
      component: () => import('../views/Errors/FourZeroFour.vue'),
      meta: {
        title: '404 Error',
      },
    },

    {
      path: '/signin',
      name: 'Signin',
      component: () => import('../views/Auth/Signin.vue'),
      meta: {
        title: 'Signin',
      },
    },
    {
      path: '/signup',
      name: 'Signup',
      component: () => import('../views/Auth/Signup.vue'),
      meta: {
        title: 'Signup',
      },
    },
    // Redirection de /personnalisation vers /personnalisation/accueil
    {
      path: '/personnalisation',
      redirect: '/personnalisation/accueil'
    },
    // Route de personnalisation de l'accueil
    {
      path: '/personnalisation/accueil',
      name: 'PersonnalisationAccueil',
      component: () => import('../views/Personnalisation/PersonnalisationAccueil.vue'),
      meta: {
        title: 'Personnalisation de la page d\'accueil',
      },
    },
  ],
})

export default router

router.beforeEach((to, from, next) => {
  document.title = `Vue.js ${to.meta.title} | TailAdmin - Vue.js Tailwind CSS Dashboard Template`
  next()
})
