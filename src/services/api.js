import axios from 'axios'

// Configuration de base de l'API
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3003/api'

console.log('🔗 API_BASE_URL:', API_BASE_URL)
console.log('🔗 VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL)

// Créer une instance axios avec configuration par défaut
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Intercepteur pour ajouter le token JWT
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Intercepteur pour gérer les erreurs
apiClient.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // Gérer l'expiration du token
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user_data')
      window.location.href = '/auth/login'
    }

    // Gérer les erreurs réseau
    if (!error.response) {
      console.error('Erreur réseau:', error.message)
    }

    return Promise.reject(error)
  }
)

// Service d'authentification
export const authService = {
  // Inscription
  register: async (userData) => {
    const response = await apiClient.post('/auth/register', userData)
    return response.data
  },

  // Connexion
  login: async (credentials) => {
    const response = await apiClient.post('/auth/login', credentials)
    return response.data
  },

  // Obtenir le profil
  getProfile: async () => {
    const response = await apiClient.get('/auth/profile')
    return response.data
  },

  // Mettre à jour le profil
  updateProfile: async (userData) => {
    const response = await apiClient.put('/auth/profile', userData)
    return response.data
  },

  // Changer le mot de passe
  changePassword: async (passwordData) => {
    const response = await apiClient.post('/auth/change-password', passwordData)
    return response.data
  },

  // Déconnexion
  logout: () => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user_data')
  },

  // Vérifier si l'utilisateur est connecté
  isAuthenticated: () => {
    return !!localStorage.getItem('auth_token')
  },

  // Obtenir les données utilisateur
  getUser: () => {
    const userData = localStorage.getItem('user_data')
    return userData ? JSON.parse(userData) : null
  },

  // Sauvegarder les données utilisateur
  setUser: (userData, token) => {
    localStorage.setItem('auth_token', token)
    localStorage.setItem('user_data', JSON.stringify(userData))
  }
}

// Service des statistiques
export const statsService = {
  // Overview du dashboard
  getOverview: async () => {
    const response = await apiClient.get('/stats/overview')
    return response.data
  },

  // Produits les plus vendus
  getTopProducts: async (params = {}) => {
    const response = await apiClient.get('/stats/top-products', { params })
    return response.data
  },

  // Meilleurs clients
  getTopClients: async (params = {}) => {
    const response = await apiClient.get('/stats/top-clients', { params })
    return response.data
  },

  // Graphique des ventes
  getSalesChart: async (params = {}) => {
    const response = await apiClient.get('/stats/sales-chart', { params })
    return response.data
  },

  // Performance par catégorie
  getCategoryPerformance: async () => {
    const response = await apiClient.get('/stats/category-performance')
    return response.data
  },

  // Sources de trafic
  getTrafficSources: async () => {
    const response = await apiClient.get('/stats/traffic-sources')
    return response.data
  },

  // Taux de conversion
  getConversionRate: async (params = {}) => {
    const response = await apiClient.get('/stats/conversion-rate', { params })
    return response.data
  },

  // Alertes de stock
  getInventoryAlerts: async (params = {}) => {
    const response = await apiClient.get('/stats/inventory-alerts', { params })
    return response.data
  }
}

// Service produits
export const productService = {
  // Obtenir tous les produits
  getProducts: async (params = {}) => {
    const response = await apiClient.get('/products', { params })
    return response.data
  },

  // Obtenir un produit par ID
  getProduct: async (id) => {
    const response = await apiClient.get(`/products/${id}`)
    return response.data
  },

  // Créer un produit
  createProduct: async (productData) => {
    const response = await apiClient.post('/products', productData)
    return response.data
  },

  // Mettre à jour un produit
  updateProduct: async (id, productData) => {
    const response = await apiClient.put(`/products/${id}`, productData)
    return response.data
  },

  // Supprimer un produit
  deleteProduct: async (id) => {
    const response = await apiClient.delete(`/products/${id}`)
    return response.data
  }
}

// Service des clients
export const clientService = {
  // Liste des clients
  getClients: async (params = {}) => {
    const response = await apiClient.get('/clients', { params })
    return response.data
  },

  // Détails d'un client
  getClient: async (id) => {
    const response = await apiClient.get(`/clients/${id}`)
    return response.data
  },

  // Créer un client
  createClient: async (clientData) => {
    const response = await apiClient.post('/clients', clientData)
    return response.data
  },

  // Mettre à jour un client
  updateClient: async (id, clientData) => {
    const response = await apiClient.put(`/clients/${id}`, clientData)
    return response.data
  },

  // Supprimer un client
  deleteClient: async (id) => {
    const response = await apiClient.delete(`/clients/${id}`)
    return response.data
  }
}

// Service des commandes
export const orderService = {
  // Liste des commandes
  getOrders: async (params = {}) => {
    const response = await apiClient.get('/orders', { params })
    return response.data
  },

  // Détails d'une commande
  getOrder: async (id) => {
    const response = await apiClient.get(`/orders/${id}`)
    return response.data
  },

  // Créer une commande
  createOrder: async (orderData) => {
    const response = await apiClient.post('/orders', orderData)
    return response.data
  },

  // Mettre à jour une commande
  updateOrder: async (id, orderData) => {
    const response = await apiClient.put(`/orders/${id}`, orderData)
    return response.data
  },

  // Supprimer une commande
  deleteOrder: async (id) => {
    const response = await apiClient.delete(`/orders/${id}`)
    return response.data
  }
}

// Service de santé (health check)
export const healthService = {
  checkHealth: async () => {
    const response = await apiClient.get('/health', { baseURL: '/health' })
    return response.data
  }
}

// Export par défaut l'instance axios pour les requêtes personnalisées
export default apiClient
