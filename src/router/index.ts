import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

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
      component: () => import('../views/Commandes/ListeCommandes.vue'),
      meta: {
        title: 'Liste des commandes',
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
      path: '/personnalisation',
      name: 'Personnalisation',
      component: () => import('../views/Personnalisation/PersonnalisationAccueil.vue'),
      meta: {
        title: 'Personnalisation',
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
      path: '/signin',
      name: 'Signin',
      component: () => import('../views/Auth/Signin.vue'),
      meta: {
        title: 'Signin',
        layout: 'auth',
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
    // API Management
    {
      path: '/api-management',
      name: 'ApiManagement',
      component: () => import('../views/ApiManagement.vue'),
      meta: {
        title: 'API Management',
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
    // Logs & Activité
    {
      path: '/logs',
      name: 'Logs',
      component: () => import('../views/Logs.vue'),
      meta: {
        title: 'Logs & Activité',
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
      path: '/marketing/campagnes',
      name: 'MarketingCampagnes',
      component: () => import('../views/Marketing/Campagnes.vue'),
      meta: {
        title: 'Campagnes marketing',
      },
    },
    {
      path: '/marketing/newsletter',
      name: 'MarketingNewsletter',
      component: () => import('../views/Marketing/Newsletter.vue'),
      meta: {
        title: 'Newsletter',
      },
    },
    {
      path: '/marketing/promotions',
      name: 'MarketingPromotions',
      component: () => import('../views/Marketing/Promotions.vue'),
      meta: {
        title: 'Promotions',
      },
    },
    // CMS
    {
      path: '/cms/pages',
      name: 'CMSPages',
      component: () => import('../views/CMS/Pages.vue'),
      meta: {
        title: 'CMS - Pages',
      },
    },
    {
      path: '/cms/blog',
      name: 'CMSBlog',
      component: () => import('../views/CMS/Blog.vue'),
      meta: {
        title: 'CMS - Blog',
      },
    },
    {
      path: '/cms/medias',
      name: 'CMSMedias',
      component: () => import('../views/CMS/Medias.vue'),
      meta: {
        title: 'CMS - Médias',
      },
    },
    // Intégrations
    {
      path: '/integrations/apps',
      name: 'IntegrationsApps',
      component: () => import('../views/Integrations/Apps.vue'),
      meta: {
        title: 'Intégrations - Applications',
      },
    },
    {
      path: '/integrations/webhooks',
      name: 'IntegrationsWebhooks',
      component: () => import('../views/Integrations/Webhooks.vue'),
      meta: {
        title: 'Intégrations - Webhooks',
      },
    },
    {
      path: '/integrations/api-keys',
      name: 'IntegrationsApiKeys',
      component: () => import('../views/Integrations/ApiKeys.vue'),
      meta: {
        title: 'Intégrations - API Keys',
      },
    },
  ],
})

export default router

// Guards de navigation
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

  // Vérifier les routes admin
  if (to.meta.requiresAdmin && !authStore.isAdmin) {
    // Rediriger vers le dashboard si pas admin
    next('/')
    return
  }

  // Si l'utilisateur est connecté et va sur une page d'auth
  if (authStore.isAuthenticated && (to.path.startsWith('/signin') || to.path.startsWith('/signup'))) {
    // Rediriger vers le dashboard ou la page demandée
    const redirect = (to.query.redirect as string) || '/'
    next(redirect)
    return
  }

  next()
})

// Gestion du titre de page
router.afterEach((to) => {
  // Mettre à jour le titre de la page
  if (to.meta.title) {
    document.title = `${to.meta.title} - GadgetZone Admin`
  } else {
    document.title = 'GadgetZone Admin'
  }
})
