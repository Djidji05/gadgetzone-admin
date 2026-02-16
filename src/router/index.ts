import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Ecommerce',
      component: () => import('../views/Ecommerce.vue'),
      meta: {
        title: 'Tableau de bord',
        requiresAdmin: true, // Protect Dashboard
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
      path: '/clients/:id',
      name: 'ClientDetail',
      component: () => import('../views/Clients/ClientDetail.vue'),
      meta: {
        title: 'Détails du client',
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
      component: () => import('../views/Commandes/OrderList.vue'),
      meta: {
        title: 'Liste des commandes',
      },
    },
    // Détail commande
    {
      path: '/commandes/:id',
      name: 'CommandeDetail',
      component: () => import('../views/Commandes/OrderDetail.vue'),
      meta: {
        title: 'Détails de la commande',
      },
    },
    // Redirect /commandes to /liste-commandes
    {
      path: '/commandes',
      redirect: '/liste-commandes'
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
      path: '/finance',
      name: 'Finance',
      component: () => import('../views/Finance.vue'),
      meta: {
        title: 'Finance - Vue d\'ensemble',
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
      path: '/rescue',
      name: 'RescueLogin',
      component: () => import('../views/LoginRescue.vue'),
      meta: { requiresAuth: false, guest: true, layout: 'auth' }
    },
    {
      path: '/signin',
      name: 'Signin',
      component: () => import('../views/Auth/Signin.vue'),
      meta: {
        title: 'Signin',
        layout: 'auth',
      },
    },


    // SEO Configuration
    {
      path: '/seo',
      name: 'SEO',
      component: () => import('../views/SEOView.vue'),
      meta: {
        title: 'Gestion SEO',
        requiresAdmin: true,
      },
    },
    // Utilisateurs & Rôles
    {
      path: '/utilisateurs/ajouter',
      name: 'AjouterUtilisateur',
      component: () => import('../views/Utilisateurs/AjouterUtilisateur.vue'),
      meta: {
        title: 'Ajouter un utilisateur',
        requiresAdmin: true,
      },
    },
    {
      path: '/utilisateurs/modifier/:id',
      name: 'ModifierUtilisateur',
      component: () => import('../views/Utilisateurs/AjouterUtilisateur.vue'),
      meta: {
        title: 'Modifier un utilisateur',
        requiresAdmin: true,
      },
    },
    {
      path: '/utilisateurs/liste',
      name: 'ListeUtilisateurs',
      component: () => import('../views/Utilisateurs/ListeUtilisateurs.vue'),
      meta: {
        title: 'Liste des utilisateurs',
        requiresAdmin: true,
      },
    },
    // Notifications
    {
      path: '/notifications',
      name: 'Notifications',
      component: () => import('../views/Notifications/NotificationsPage.vue'),
      meta: {
        title: 'Notifications',
      },
    },
    // Messages
    {
      path: '/messages',
      name: 'Messages',
      component: () => import('../views/Messages/MessagesView.vue'),
      meta: {
        title: 'Messages',
      },
    },
    // Personalization
    {
      path: '/personalization',
      name: 'Personalization',
      component: () => import('../views/Personalization/Personalization.vue'),
      meta: {
        title: 'Personnalisation',
        requiresAdmin: true,
      },
    },
    // Vendor Applications
    {
      path: '/vendors/applications',
      name: 'VendorApplications',
      component: () => import('../views/Vendors/VendorApplications.vue'),
      meta: {
        title: 'Candidatures Vendeur',
        requiresAdmin: true,
      },
    },
    {
      path: '/vendors/settings',
      name: 'VendorSettings',
      component: () => import('../views/Vendors/StoreSettings.vue'),
      meta: {
        title: 'Ma Boutique',
      },
    },
    {
      path: '/utilisateurs/roles',
      name: 'Roles',
      component: () => import('../views/Utilisateurs/Roles.vue'),
      meta: {
        title: 'Rôles & Permissions',
        requiresAdmin: true,
      },
    },
    // Paramètres
    {
      path: '/parametres/general',
      name: 'ParametresGeneral',
      component: () => import('../views/Parametres/General.vue'),
      meta: {
        title: 'Paramètres généraux',
        requiresAdmin: true,
      },
    },
    {
      path: '/parametres/securite',
      name: 'ParametresSecurite',
      component: () => import('../views/Parametres/Securite.vue'),
      meta: {
        title: 'Paramètres de sécurité',
        requiresAdmin: true,
      },
    },
    {
      path: '/parametres/email',
      name: 'ParametresEmail',
      component: () => import('../views/Parametres/Email.vue'),
      meta: {
        title: 'Paramètres email',
        requiresAdmin: true,
      },
    },
    {
      path: '/parametres/paiements',
      name: 'ParametresPaiements',
      component: () => import('../views/Parametres/Paiements.vue'),
      meta: {
        title: 'Paramètres de paiement',
        requiresAdmin: true,
      },
    },
    // Support
    {
      path: '/support/tickets',
      name: 'SupportTickets',
      component: () => import('../views/Support/Tickets.vue'),
      meta: {
        title: 'Support - Tickets',
      },
    },
    {
      path: '/support/faq',
      name: 'SupportFAQ',
      component: () => import('../views/Support/FAQ.vue'),
      meta: {
        title: 'Support - FAQ',
      },
    },
    {
      path: '/support/documentation',
      name: 'SupportDocumentation',
      component: () => import('../views/Support/Documentation.vue'),
      meta: {
        title: 'Support - Documentation',
      },
    },
    // Marketing
    {
      path: '/marketing/newsletter',
      name: 'MarketingNewsletter',
      component: () => import('../views/Marketing/Newsletter.vue'),
      meta: {
        title: 'Newsletter',
      },
    },
  ],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  },
})

export default router

// Navigation guards
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // Initialiser l'auth si pas déjà fait
  if (!authStore.isAuthenticated) {
    authStore.init()
  }

  // Nettoyer les erreurs précédentes
  authStore.clearError()

  // Définir les routes publiques
  const publicPages = ['/signin', '/error-404'];
  const authRequired = !publicPages.some(page => to.path.startsWith(page)) && !to.meta.public;

  if (authRequired && !authStore.isAuthenticated) {
    // Rediriger vers la page de login
    next({
      path: '/signin',
      query: { redirect: to.fullPath }
    })
    return
  }

  // Vérifier les routes admin (ENFORCED FOR EVERYTHING NOT PUBLIC)
  // GadgetZone Admin est réservé aux admins et gestionnaires
  const isPublic = publicPages.some(page => to.path.startsWith(page)) || to.meta.public;

  if (!isPublic && authStore.isAuthenticated && !authStore.isAdmin && authStore.userRole?.toLowerCase() !== 'seller') {
    // Si l'utilisateur est connecté mais n'est ni admin ni vendeur
    console.log("Accès refusé: User role is " + authStore.userRole);

    await authStore.logout()
    next({
      path: '/signin',
      query: { error: 'access_denied' }
    })
    return
  }

  /* 
  // Old check only for specific routes
  if (to.meta.requiresAdmin && !authStore.isAdmin) {
      // ...
  }
  */

  // Si l'utilisateur est connecté et va sur une page d'auth
  if (authStore.isAuthenticated && (to.path.startsWith('/signin') || to.path.startsWith('/signup'))) {
    // Rediriger vers le dashboard
    const redirect = (to.query.redirect as string) || '/'
    next(redirect)
    return
  }

  next()
})

// Gestion du titre de page
router.afterEach((to) => {
  if (to.meta.title) {
    document.title = `${to.meta.title} - GadgetZone Admin`
  } else {
    document.title = 'GadgetZone Admin'
  }
})
