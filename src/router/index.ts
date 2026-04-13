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
      redirect: () => ({ path: '/liste-clients', query: { action: 'add' } }),
      meta: {
        title: 'Ajouter un client',
      },
    },
    {
      path: '/modifier-client/:id',
      name: 'ModifierClient',
      redirect: (to) => ({ path: '/liste-clients', query: { action: 'edit', id: to.params.id } }),
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
      path: '/categories',
      name: 'Categories',
      component: () => import('../views/Produits/Categories.vue'),
      meta: {
        title: 'Gestion des Catégories',
        requiresAdmin: true
      },
    },
    {
      path: '/produits/marques',
      name: 'BrandList',
      component: () => import('../views/Brands/BrandList.vue'),
      meta: {
        title: 'Gestion des Marques',
        requiresAdmin: true
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
      path: '/paiements',
      name: 'Paiements',
      component: () => import('../views/Paiements/Paiements.vue'),
      meta: {
        title: 'Gestion des paiements',
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
      path: '/vendors/applications/:id',
      name: 'VendorApplicationDetail',
      component: () => import('../views/Vendors/ApplicationDetail.vue'),
      meta: {
        title: 'Détails de la Candidature',
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
    {
      path: '/parametres/commissions',
      name: 'Commissions',
      component: () => import('../views/Parametres/Commissions.vue'),
      meta: {
        title: 'Gestion des commissions',
        requiresAdmin: true,
      },
    },
    {
      path: '/parametres/api',
      name: 'APIDocumentation',
      component: () => import('../views/Parametres/APIDocumentation.vue'),
      meta: {
        title: 'Documentation API',
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
    {
      path: '/support/reviews',
      name: 'ReviewsModeration',
      component: () => import('../views/Support/ReviewsModeration.vue'),
      meta: {
        title: 'Modération des Avis',
        requiresAdmin: true,
      },
    },
    // Litiges
    {
      path: '/support/disputes',
      name: 'ListeLitiges',
      component: () => import('../views/Support/ListeLitiges.vue'),
      meta: {
        title: 'Gestion des Litiges',
      },
    },
    {
      path: '/support/disputes/:id',
      name: 'LitigeDetail',
      component: () => import('../views/Support/LitigeDetail.vue'),
      meta: {
        title: 'Détails du Litige',
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
    {
      path: '/marketing/promos',
      name: 'Promotions',
      component: () => import('../views/Marketing/Promotions.vue'),
      meta: {
        title: 'Gestion des Promotions',
        requiresAdmin: true
      },
    },
    {
      path: '/marketing/campagnes',
      name: 'Campagnes',
      component: () => import('../views/Marketing/Campagnes.vue'),
      meta: {
        title: 'Gestion des Campagnes',
        requiresAdmin: true
      },
    },
    {
      path: '/marketing/ambassadeurs',
      name: 'AmbassadorList',
      component: () => import('../views/Ambassadors/AmbassadorList.vue'),
      meta: {
        title: 'Gestion des Ambassadeurs',
        requiresAdmin: true
      },
    },
    {
      path: '/marketing/boosts',
      name: 'AdminBoosts',
      component: () => import('../views/Marketing/AdminBoosts.vue'),
      meta: {
        title: 'Gestion des Boosts',
        requiresAdmin: true
      },
    },
    // Blog
    {
      path: '/marketing/blog',
      name: 'BlogList',
      component: () => import('../views/Marketing/BlogList.vue'),
      meta: { title: 'Gestion du Blog', requiresAdmin: true },
    },
    {
      path: '/marketing/blog/new',
      name: 'BlogCreate',
      component: () => import('../views/Marketing/BlogEdit.vue'),
      meta: { title: 'Nouvel Article', requiresAdmin: true },
    },
    {
      path: '/marketing/blog/edit/:id',
      name: 'BlogEdit',
      component: () => import('../views/Marketing/BlogEdit.vue'),
      meta: { title: 'Modifier l\'Article', requiresAdmin: true },
    },
    // Pages
    {
      path: '/parametres/pages',
      name: 'PagesList',
      component: () => import('../views/Parametres/PagesList.vue'),
      meta: { title: 'Gestion des Pages', requiresAdmin: true },
    },
    {
      path: '/academy',
      name: 'AcademyManagement',
      component: () => import('../views/Admin/AcademyManagement.vue'),
      meta: { title: 'Académie Vendeur', requiresAdmin: true },
    },
    {
      path: '/parametres/pages/edit/:slug',
      name: 'PageEdit',
      component: () => import('../views/Parametres/PageEdit.vue'),
      meta: { title: 'Modifier la Page', requiresAdmin: true },
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
  await authStore.init()

  // Nettoyer les erreurs précédentes
  authStore.clearError()

  // Définir les routes publiques
  const publicPages = ['/signin', '/error-404', '/rescue'];
  const authRequired = !publicPages.some(page => to.path.startsWith(page)) && !to.meta.public;

  if (authRequired && !authStore.isAuthenticated) {
    // Rediriger vers la page de login
    next({
      path: '/signin',
      query: { redirect: to.fullPath }
    })
    return
  }

  // Vérifier les rôles autorisés (Admin Panel réservé aux admins et gestionnaires)
  const isPublic = publicPages.some(page => to.path.startsWith(page)) || to.meta.public;

  if (!isPublic && authStore.isAuthenticated) {
    if (!authStore.isAdmin) {
      console.log("Accès refusé au panel Admin: Rôle insuffisant (" + authStore.userRole + ")");
      await authStore.logout()
      next({
        path: '/signin',
        query: { error: 'access_denied_admin_only' }
      })
      return
    }
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
    document.title = `${to.meta.title} - htfasil Admin`
  } else {
    document.title = 'htfasil Admin'
  }
})
