import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// Import des layouts et pages
import AdminLayout from '@/components/layout/AdminLayout.vue'
import AuthLayout from '@/components/layout/AuthLayout.vue'

// Import des vues
import LoginPage from '@/views/Auth/LoginPage.vue'
import Ecommerce from '@/views/Ecommerce.vue'

// Routes publiques (sans authentification)
const publicRoutes = [
  {
    path: '/auth',
    component: AuthLayout,
    children: [
      {
        path: 'login',
        name: 'Login',
        component: LoginPage,
        meta: { title: 'Connexion' }
      }
    ]
  }
]

// Routes protégées (nécessitent une authentification)
const protectedRoutes = [
  {
    path: '/',
    component: AdminLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'Dashboard',
        component: Ecommerce,
        meta: { title: 'Dashboard' }
      },
      {
        path: 'ecommerce',
        name: 'Ecommerce',
        component: Ecommerce,
        meta: { title: 'E-commerce' }
      },
      {
        path: 'paiements',
        name: 'Paiements',
        component: () => import('@/views/Paiements/PaiementsSimple.vue'),
        meta: { title: 'Paiements' }
      }
    ]
  }
]

// Routes d'administration (nécessitent le rôle admin)
const adminRoutes = [
  {
    path: '/admin',
    component: AdminLayout,
    meta: { requiresAuth: true, requiresAdmin: true },
    children: [
      {
        path: 'products',
        name: 'Products',
        component: () => import('@/views/Produits/ProductList.vue'),
        meta: { title: 'Produits' }
      },
      {
        path: 'products/create',
        name: 'CreateProduct',
        component: () => import('@/views/Produits/ProductForm.vue'),
        meta: { title: 'Créer un produit' }
      },
      {
        path: 'products/:id/edit',
        name: 'EditProduct',
        component: () => import('@/views/Produits/ProductForm.vue'),
        meta: { title: 'Modifier un produit' }
      },
      {
        path: 'orders',
        name: 'Orders',
        component: () => import('@/views/Commandes/OrderList.vue'),
        meta: { title: 'Commandes' }
      },
      {
        path: 'orders/:id',
        name: 'OrderDetail',
        component: () => import('@/views/Commandes/OrderDetail.vue'),
        meta: { title: 'Détails commande' }
      },
      {
        path: 'clients',
        name: 'Clients',
        component: () => import('@/views/Clients/ClientList.vue'),
        meta: { title: 'Clients' }
      },
      {
        path: 'clients/:id',
        name: 'ClientDetail',
        component: () => import('@/views/Clients/ClientDetail.vue'),
        meta: { title: 'Détails client' }
      },
      {
        path: 'rapports',
        name: 'Rapports',
        component: () => import('@/views/Rapports/RapportsView.vue'),
        meta: { title: 'Rapports' }
      },
      {
        path: 'personnalisation',
        name: 'Personnalisation',
        component: () => import('@/views/Personnalisation/PersonnalisationAccueil.vue'),
        meta: { title: 'Personnalisation' }
      }
    ]
  }
]

// Création du router
const router = createRouter({
  history: createWebHistory(),
  routes: [
    ...publicRoutes,
    ...protectedRoutes,
    ...adminRoutes,
    // Route par défaut
    {
      path: '/:pathMatch(.*)*',
      redirect: '/'
    }
  ],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }
    return { top: 0 }
  }
})

// Guards de navigation
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // Initialiser l'auth si pas déjà fait
  if (!authStore.isAuthenticated) {
    authStore.init()
  }

  // Nettoyer les erreurs précédentes
  authStore.clearError()

  // Vérifier les routes protégées
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    // Rediriger vers la page de login
    next({
      path: '/auth/login',
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
  if (authStore.isAuthenticated && to.path.startsWith('/auth')) {
    // Rediriger vers le dashboard ou la page demandée
    const redirect = to.query.redirect || '/'
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

export default router
