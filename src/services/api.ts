import axios from 'axios'
import { inactivityTracker, INACTIVITY_TIMEOUT } from './inactivity'
// Re-trigger vite resolution

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3003/api'



export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 45000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
  paramsSerializer: {
    indexes: null,
  },
})

const isRefreshing = false
const refreshPromise: Promise<string> | null = null

// Intercepteur pour ajouter le token JWT et vérifier l'inactivité
api.interceptors.request.use(
  async (config) => {
    let token = localStorage.getItem('auth_token')

    // Fallback to Pinia store if token is not found in the direct key
    // This happens because Pinia persists in 'auth-store' key
    if (!token) {
      try {
        const authStoreData = localStorage.getItem('auth-store')
        if (authStoreData) {
          const parsed = JSON.parse(authStoreData)
          token = parsed.token
        }
      } catch (e) {
        console.error('Failed to parse auth-store for token fallback', e)
      }
    }

    if (token) {
      // Vérifier l'inactivité avant chaque requête
      if (inactivityTracker.isInactive(INACTIVITY_TIMEOUT)) {
        // Session expirée par inactivité
        localStorage.removeItem('auth_token')
        localStorage.removeItem('user_data')
        localStorage.removeItem('auth-store')
        window.location.href = '/signin?reason=inactivity'
        return Promise.reject(new Error('Session expirée'))
      }

      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Intercepteur pour gérer les erreurs et les sessions expirées
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // Gérer les erreurs de session expirée
    // Gérer les erreurs de session expirée (401)
    if (error.response?.status === 401) {
      const errorCode = error.response?.data?.code
      const isNotificationRequest = originalRequest?.url?.includes('/notifications')

      // Ne pas tout supprimer immédiatement si c'est une requête de notification en arrière-plan
      // Sauf si c'est explicitement un SESSION_TIMEOUT
      if (errorCode === 'SESSION_TIMEOUT' || (!isNotificationRequest && !window.location.pathname.includes('/signin'))) {
        // Nettoyage complet
        localStorage.removeItem('auth_token')
        localStorage.removeItem('user_data')
        localStorage.removeItem('auth-store')

        // Rediriger vers la page de connexion
        if (!window.location.pathname.includes('/signin')) {
          window.location.href = errorCode === 'SESSION_TIMEOUT' ? '/signin?reason=timeout' : '/signin'
        }
      }

      // Propager l'erreur pour que les composants puissent la gérer
      return Promise.reject(error)
    }

    // Ne pas logger les erreurs 401 qui ont déjà été traitées
    if (error.response?.status !== 401) {
      console.error('API Error:', error.response?.data || error.message)
    }
    return Promise.reject(error)
  }
)

export interface Category {
  id: number
  name: string
  slug: string
  description?: string
  icon?: string
}

export interface Brand {
  id: number
  name: string
  logo_url: string
  description?: string
}

export interface Store {
  id: number
  name: string
  description?: string
  logoUrl?: string
  bannerUrl?: string
  status: 'pending' | 'active' | 'suspended' | 'closed'
  userId: number
  settings: any
  created_at: string
  updated_at: string
}

export interface Product {
  id: number
  name: string
  description: string
  price: number
  stock: number
  category_id?: number
  image_url?: string
  images?: string[]
  features?: string[]
  specifications?: Record<string, string>
  is_featured?: boolean
  is_new?: boolean
  created_at: string
  updated_at: string
}

export interface User {
  id: number
  name: string
  email: string
  phone?: string
  role: string
  created_at: string
  updated_at: string
  store?: Store
}

export interface OrderItem {
  id: number
  order_id: number
  product_id: number
  quantity: number
  price: number
  product_name?: string
  product?: any
}

export interface Order {
  id: number
  user_id: number
  user_name?: string
  user_email?: string
  total_amount: number
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'confirmed'
  created_at: string
  updated_at: string
  items?: OrderItem[]
  user?: User
  shipping_address?: string
  delivery_token?: string
  delivered_at?: string
  logs?: any[]
  confirmed_at?: string
  shipped_at?: string
}

// Interfaces pour la personnalisation
export interface Banner {
  id: number
  image: string
  title: string
  subtitle: string
  isActive: boolean
  order: number
}

export interface Promotion {
  id: number
  title: string
  description: string
  code: string
  discount: number
  startDate: string
  endDate: string
  isActive: boolean
  image: string
}

export interface CreateBannerRequest {
  image: string
  title: string
  subtitle: string
  isActive: boolean
  order: number
}

export interface UpdateBannerRequest {
  image?: string
  title?: string
  subtitle?: string
  isActive?: boolean
  order?: number
}

export interface CreatePromotionRequest {
  title: string
  description: string
  code: string
  discount: number
  startDate: string
  endDate: string
  isActive: boolean
  image: string
}

export interface UpdatePromotionRequest {
  title?: string
  description?: string
  code?: string
  discount?: number
  startDate?: string
  endDate?: string
  isActive?: boolean
  image?: string
}

// Service d'authentification
export const authService = {
  register(userData: any) {
    return api.post('/auth/register', userData)
  },
  login(credentials: any) {
    return api.post('/auth/login', credentials)
  },
  getProfile() {
    return api.get('/auth/profile')
  },
  updateProfile(userData: any) {
    return api.put('/auth/profile', userData)
  },
  changePassword(passwordData: any) {
    return api.post('/auth/change-password', passwordData)
  },
  getUsers(params?: any) {
    return api.get('/users', { params })
  },
  createUser(userData: any) {
    return api.post('/users', userData)
  },
  async refreshToken() {
    const response = await api.post('/auth/refresh')
    const { token } = response.data
    if (token) {
      localStorage.setItem('auth_token', token)
    }
    return token
  },
  logout() {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user_data')
    window.location.href = '/signin'
  },
  isAuthenticated() {
    return !!localStorage.getItem('auth_token')
  },
  getUser() {
    const userStr = localStorage.getItem('user_data')
    return userStr ? JSON.parse(userStr) : null
  },
  setUser: (userData: any, token: string) => {
    localStorage.setItem('auth_token', token)
    localStorage.setItem('user_data', JSON.stringify(userData))
  },
  getUserById: async (id: number) => {
    const response = await api.get(`/auth/users/${id}`)
    return response.data
  },
  updateUser: async (id: number, userData: any) => {
    const response = await api.put(`/users/${id}`, userData)
    return response.data
  },
  deleteUser: async (id: number) => {
    const response = await api.delete(`/users/${id}`)
    return response.data
  }
}

// Services pour les produits
// Services pour les produits
export const productService = {
  getAll: async (): Promise<Product[]> => {
    const response = await api.get('/products', { params: { limit: 1000 } })
    return response.data.products || response.data || []
  },

  getById: async (id: number): Promise<Product> => {
    const response = await api.get(`/products/${id}`)
    return response.data
  },

  create: async (product: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<number> => {
    const response = await api.post('/products', product)
    return response.data.id
  },

  update: async (id: number, product: Partial<Product>): Promise<void> => {
    await api.put(`/products/${id}`, product)
  },

  delete: async (id: number, reason?: string): Promise<void> => {
    await api.delete(`/products/${id}`, { data: { reason } })
  }
}

// Services pour les utilisateurs
export const userService = {
  getAll: async (): Promise<User[]> => {
    try {
      const response = await api.get('/clients', { params: { limit: 1000 } })
      // L'API retourne { clients: [...] } au lieu de directement le tableau
      return response.data.clients || response.data || []
    } catch {
      console.warn('API not available, returning mock data')
      // Données de démonstration temporaires
      return [
        { id: 1, name: 'Jean Dupont', email: 'jean.dupont@example.com', role: 'customer', created_at: '2023-01-01', updated_at: '2023-01-01' },
        { id: 2, name: 'Marie Martin', email: 'marie.martin@example.com', role: 'customer', created_at: '2023-01-01', updated_at: '2023-01-01' },
        { id: 3, name: 'Pierre Durand', email: 'pierre.durand@example.com', role: 'customer', created_at: '2023-01-01', updated_at: '2023-01-01' },
      ]
    }
  },

  getById: async (id: number): Promise<User> => {
    try {
      const response = await api.get(`/clients/${id}`)
      console.log('📡 userService.getById response:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ userService.getById error:', error)
      throw error
    }
  },

  create: async (user: Omit<User, 'id' | 'created_at' | 'updated_at'> & { password: string }): Promise<number> => {
    try {
      const response = await api.post('/users', user)
      return response.data.id
    } catch {
      console.warn('API not available, simulating creation')
      return Math.floor(Math.random() * 1000) + 1
    }
  },

  update: async (id: number, user: Partial<User> & { password?: string }): Promise<void> => {
    try {
      await api.put(`/users/${id}`, user)
    } catch {
      console.warn('API not available, simulating update')
    }
  },

  delete: async (id: number): Promise<void> => {
    try {
      await api.delete(`/users/${id}`)
    } catch {
      console.warn('API not available, simulating delete')
    }
  },

  search: async (query: string, role?: string): Promise<User[]> => {
    const response = await api.get('/users', { params: { search: query, role } })
    return response.data
  }
}

// Services pour les commandes
export const orderService = {
  getAll: async (): Promise<Order[]> => {
    try {
      const response = await api.get('/orders')
      // L'API retourne { orders: [], pagination: {...} } au lieu de directement le tableau
      return response.data.orders || response.data || []
    } catch {
      console.warn('API not available, returning mock data')
      // Données de démonstration temporaires
      return [
        { id: 1, user_id: 1, user_name: 'Jean Dupont', user_email: 'jean.dupont@example.com', total_amount: 150, status: 'pending', created_at: '2023-01-01', updated_at: '2023-01-01', items: [] },
        { id: 2, user_id: 2, user_name: 'Marie Martin', user_email: 'marie.martin@example.com', total_amount: 75, status: 'processing', created_at: '2023-01-01', updated_at: '2023-01-01', items: [] },
        { id: 3, user_id: 3, user_name: 'Pierre Durand', user_email: 'pierre.durand@example.com', total_amount: 200, status: 'delivered', created_at: '2023-01-01', updated_at: '2023-01-01', items: [] },
        { id: 4, user_id: 1, user_name: 'Jean Dupont', user_email: 'jean.dupont@example.com', total_amount: 100, status: 'shipped', created_at: '2023-01-01', updated_at: '2023-01-01', items: [] },
        { id: 5, user_id: 2, user_name: 'Marie Martin', user_email: 'marie.martin@example.com', total_amount: 50, status: 'cancelled', created_at: '2023-01-01', updated_at: '2023-01-01', items: [] },
      ]
    }
  },

  // Alias pour getAll avec format de réponse paginé
  getOrders: async (): Promise<{ orders: Order[], pagination?: any }> => {
    try {
      const response = await api.get('/orders', { params: { limit: 1000 } })
      // Retourner le format attendu avec orders et pagination
      return {
        orders: response.data.orders || response.data || [],
        pagination: response.data.pagination
      }
    } catch {
      console.warn('API not available, returning mock data')
      const mockOrders: Order[] = [
        { id: 1, user_id: 1, total_amount: 45000, status: 'pending', created_at: '2024-12-06T10:30:00', updated_at: '2024-12-06T10:30:00', user: { id: 1, name: 'Jean Dupont', email: 'jean.dupont@example.com', phone: '0123456789', role: 'user', created_at: '2024-01-01', updated_at: '2024-01-01' } },
        { id: 2, user_id: 2, total_amount: 78500, status: 'processing', created_at: '2024-12-06T09:15:00', updated_at: '2024-12-06T09:15:00', user: { id: 2, name: 'Marie Martin', email: 'marie.martin@example.com', phone: '0123456790', role: 'user', created_at: '2024-01-01', updated_at: '2024-01-01' } },
        { id: 3, user_id: 3, total_amount: 125000, status: 'delivered', created_at: '2024-12-05T14:20:00', updated_at: '2024-12-05T14:20:00', user: { id: 3, name: 'Pierre Durand', email: 'pierre.durand@example.com', phone: '0123456791', role: 'user', created_at: '2024-01-01', updated_at: '2024-01-01' } },
        { id: 4, user_id: 4, total_amount: 95000, status: 'shipped', created_at: '2024-12-05T11:45:00', updated_at: '2024-12-05T11:45:00', user: { id: 4, name: 'Sophie Bernard', email: 'sophie.bernard@example.com', phone: '0123456792', role: 'user', created_at: '2024-01-01', updated_at: '2024-01-01' } },
        { id: 5, user_id: 5, total_amount: 32000, status: 'cancelled', created_at: '2024-12-04T16:30:00', updated_at: '2024-12-04T16:30:00', user: { id: 5, name: 'Luc Petit', email: 'luc.petit@example.com', phone: '0123456793', role: 'user', created_at: '2024-01-01', updated_at: '2024-01-01' } },
        { id: 6, user_id: 6, total_amount: 156000, status: 'delivered', created_at: '2024-12-04T08:00:00', updated_at: '2024-12-04T08:00:00', user: { id: 6, name: 'Claire Robert', email: 'claire.robert@example.com', phone: '0123456794', role: 'user', created_at: '2024-01-01', updated_at: '2024-01-01' } },
        { id: 7, user_id: 7, total_amount: 67000, status: 'processing', created_at: '2024-12-03T13:25:00', updated_at: '2024-12-03T13:25:00', user: { id: 7, name: 'Thomas Richard', email: 'thomas.richard@example.com', phone: '0123456795', role: 'user', created_at: '2024-01-01', updated_at: '2024-01-01' } },
        { id: 8, user_id: 8, total_amount: 89000, status: 'shipped', created_at: '2024-12-03T10:10:00', updated_at: '2024-12-03T10:10:00', user: { id: 8, name: 'Emma Dubois', email: 'emma.dubois@example.com', phone: '0123456796', role: 'user', created_at: '2024-01-01', updated_at: '2024-01-01' } },
        { id: 9, user_id: 9, total_amount: 43000, status: 'pending', created_at: '2024-12-02T15:40:00', updated_at: '2024-12-02T15:40:00', user: { id: 9, name: 'Lucas Moreau', email: 'lucas.moreau@example.com', phone: '0123456797', role: 'user', created_at: '2024-01-01', updated_at: '2024-01-01' } },
        { id: 10, user_id: 10, total_amount: 112000, status: 'delivered', created_at: '2024-12-02T09:30:00', updated_at: '2024-12-02T09:30:00', user: { id: 10, name: 'Chloé Laurent', email: 'chloe.laurent@example.com', phone: '0123456798', role: 'user', created_at: '2024-01-01', updated_at: '2024-01-01' } },
        { id: 11, user_id: 11, total_amount: 54000, status: 'processing', created_at: '2024-12-01T14:15:00', updated_at: '2024-12-01T14:15:00', user: { id: 11, name: 'Hugo Simon', email: 'hugo.simon@example.com', phone: '0123456799', role: 'user', created_at: '2024-01-01', updated_at: '2024-01-01' } },
        { id: 12, user_id: 12, total_amount: 198000, status: 'delivered', created_at: '2024-11-30T11:20:00', updated_at: '2024-11-30T11:20:00', user: { id: 12, name: 'Léa Michel', email: 'lea.michel@example.com', phone: '0123456800', role: 'user', created_at: '2024-01-01', updated_at: '2024-01-01' } },
        { id: 13, user_id: 13, total_amount: 76000, status: 'shipped', created_at: '2024-11-29T16:45:00', updated_at: '2024-11-29T16:45:00', user: { id: 13, name: 'Nathan Lefebvre', email: 'nathan.lefebvre@example.com', phone: '0123456801', role: 'user', created_at: '2024-01-01', updated_at: '2024-01-01' } },
        { id: 14, user_id: 14, total_amount: 28000, status: 'cancelled', created_at: '2024-11-28T10:00:00', updated_at: '2024-11-28T10:00:00', user: { id: 14, name: 'Camille Leroy', email: 'camille.leroy@example.com', phone: '0123456802', role: 'user', created_at: '2024-01-01', updated_at: '2024-01-01' } },
        { id: 15, user_id: 15, total_amount: 145000, status: 'delivered', created_at: '2024-11-27T13:30:00', updated_at: '2024-11-27T13:30:00', user: { id: 15, name: 'Louis Roux', email: 'louis.roux@example.com', phone: '0123456803', role: 'user', created_at: '2024-01-01', updated_at: '2024-01-01' } },
        { id: 16, user_id: 16, total_amount: 62000, status: 'processing', created_at: '2024-11-26T09:15:00', updated_at: '2024-11-26T09:15:00', user: { id: 16, name: 'Manon David', email: 'manon.david@example.com', phone: '0123456804', role: 'user', created_at: '2024-01-01', updated_at: '2024-01-01' } },
        { id: 17, user_id: 17, total_amount: 91000, status: 'shipped', created_at: '2024-11-25T15:20:00', updated_at: '2024-11-25T15:20:00', user: { id: 17, name: 'Arthur Bertrand', email: 'arthur.bertrand@example.com', phone: '0123456805', role: 'user', created_at: '2024-01-01', updated_at: '2024-01-01' } },
        { id: 18, user_id: 18, total_amount: 38000, status: 'pending', created_at: '2024-11-24T11:40:00', updated_at: '2024-11-24T11:40:00', user: { id: 18, name: 'Inès Morel', email: 'ines.morel@example.com', phone: '0123456806', role: 'user', created_at: '2024-01-01', updated_at: '2024-01-01' } },
        { id: 19, user_id: 19, total_amount: 167000, status: 'delivered', created_at: '2024-11-23T14:50:00', updated_at: '2024-11-23T14:50:00', user: { id: 19, name: 'Gabriel Fournier', email: 'gabriel.fournier@example.com', phone: '0123456807', role: 'user', created_at: '2024-01-01', updated_at: '2024-01-01' } },
        { id: 20, user_id: 20, total_amount: 73000, status: 'processing', created_at: '2024-11-22T10:25:00', updated_at: '2024-11-22T10:25:00', user: { id: 20, name: 'Jade Girard', email: 'jade.girard@example.com', phone: '0123456808', role: 'user', created_at: '2024-01-01', updated_at: '2024-01-01' } },
        { id: 21, user_id: 21, total_amount: 104000, status: 'delivered', created_at: '2024-11-21T16:10:00', updated_at: '2024-11-21T16:10:00', user: { id: 21, name: 'Raphaël Bonnet', email: 'raphael.bonnet@example.com', phone: '0123456809', role: 'user', created_at: '2024-01-01', updated_at: '2024-01-01' } },
        { id: 22, user_id: 22, total_amount: 51000, status: 'shipped', created_at: '2024-11-20T12:35:00', updated_at: '2024-11-20T12:35:00', user: { id: 22, name: 'Alice Dupuis', email: 'alice.dupuis@example.com', phone: '0123456810', role: 'user', created_at: '2024-01-01', updated_at: '2024-01-01' } },
        { id: 23, user_id: 23, total_amount: 87000, status: 'processing', created_at: '2024-11-19T09:45:00', updated_at: '2024-11-19T09:45:00', user: { id: 23, name: 'Tom Lambert', email: 'tom.lambert@example.com', phone: '0123456811', role: 'user', created_at: '2024-01-01', updated_at: '2024-01-01' } },
        { id: 24, user_id: 24, total_amount: 134000, status: 'delivered', created_at: '2024-11-18T15:15:00', updated_at: '2024-11-18T15:15:00', user: { id: 24, name: 'Rose Fontaine', email: 'rose.fontaine@example.com', phone: '0123456812', role: 'user', created_at: '2024-01-01', updated_at: '2024-01-01' } },
        { id: 25, user_id: 25, total_amount: 46000, status: 'cancelled', created_at: '2024-11-17T11:00:00', updated_at: '2024-11-17T11:00:00', user: { id: 25, name: 'Jules Rousseau', email: 'jules.rousseau@example.com', phone: '0123456813', role: 'user', created_at: '2024-01-01', updated_at: '2024-01-01' } },
      ]
      return { orders: mockOrders }
    }
  },

  getById: async (id: number): Promise<Order> => {
    try {
      const response = await api.get(`/orders/${id}`)
      return response.data
    } catch {
      console.warn('API not available, returning mock data')
      return { id: id, user_id: 1, user_name: 'Jean Dupont', user_email: 'jean.dupont@example.com', total_amount: 100, status: 'pending', created_at: '2023-01-01', updated_at: '2023-01-01', items: [] }
    }
  },

  create: async (order: Omit<Order, 'id' | 'created_at' | 'updated_at'> & { items: Omit<OrderItem, 'id' | 'order_id'>[] }): Promise<number> => {
    try {
      const response = await api.post('/orders', order)
      return response.data.id
    } catch {
      console.warn('API not available, simulating creation')
      return Math.floor(Math.random() * 1000) + 1
    }
  },

  update: async (id: number, order: Partial<Order>): Promise<void> => {
    try {
      await api.put(`/orders/${id}`, order)
    } catch {
      console.warn('API not available, simulating update')
    }
  },

  // Alias pour update
  updateOrder: async (id: number, order: Partial<Order>): Promise<void> => {
    return orderService.update(id, order)
  },

  delete: async (id: number): Promise<void> => {
    try {
      await api.delete(`/orders/${id}`)
    } catch {
      console.warn('API not available, simulating delete')
    }
  },

  // Alias pour delete
  deleteOrder: async (id: number): Promise<void> => {
    return orderService.delete(id)
  }
}

// Service de livraison (Phase 13)
export const deliveryService = {
  verifyScan: async (orderId: number, token: string) => {
    const response = await api.post('/delivery/verify-scan', { 
      orderId, 
      token 
    })
    return response.data
  }
}

// Services pour la personnalisation (bannières et promotions)
export const personalisationService = {
  // Bannières
  getBanners: async () => {
    const response = await api.get('/personalization/banners');
    return response.data;
  },

  createBanner: async (banner: CreateBannerRequest): Promise<Banner> => {
    const response = await api.post('/personalization/banners', banner);
    return response.data;
  },

  updateBanner: async (id: number, banner: UpdateBannerRequest): Promise<void> => {
    await api.put(`/personalization/banners/${id}`, banner);
  },

  deleteBanner: async (id: number) => {
    await api.delete(`/personalization/banners/${id}`);
  },

  // Promotions
  getPromotions: async (admin = false) => {
    const response = await api.get('/promotions', { params: { admin } });
    return response.data;
  },

  createPromotion: async (promotion: CreatePromotionRequest): Promise<Promotion> => {
    const response = await api.post('/promotions', promotion);
    return response.data;
  },

  updatePromotion: async (id: number, promotion: UpdatePromotionRequest): Promise<void> => {
    await api.put(`/promotions/${id}`, promotion);
  },

  deletePromotion: async (id: number) => {
    await api.delete(`/promotions/${id}`);
  },

  togglePromotionStatus: async (id: number, isActive: boolean) => {
    await api.put(`/promotions/${id}`, { isActive });
  }
};

// Services pour les rapports et statistiques
export const statsService = {
  getOverview: async (period?: string) => {
    console.log('📊 Fetching real stats from API...');
    const response = await api.get('/stats/overview', {
      params: { period: period || '30j' }
    });
    console.log('✅ Real stats received:', response.data);
    return response.data;
  },

  getTopProducts: async (limit = 10) => {
    try {
      const response = await api.get('/stats/top-products', { params: { limit } });
      return response.data;
    } catch (error) {
      console.warn('⚠️ Top products API failed, using fallback data:', error);
      return [];
    }
  },

  getTopClients: async (limit = 10) => {
    try {
      const response = await api.get('/stats/top-clients', { params: { limit } });
      return response.data;
    } catch (error) {
      console.warn('⚠️ Top clients API failed, using fallback data:', error);
      return [];
    }
  },

  getTrafficSources: async () => {
    // Temporairement désactivé les appels API à cause des erreurs Axios
    console.warn('Using mock data for traffic sources');
    return [
      { source: 'Recherche organique', visits: 1245, percentage: 35.2 },
      { source: 'Direct', visits: 892, percentage: 25.3 },
      { source: 'Réseaux sociaux', visits: 678, percentage: 19.2 },
      { source: 'Email marketing', visits: 445, percentage: 12.6 },
      { source: 'Publicité payante', visits: 267, percentage: 7.7 }
    ];
  },

  getConversionRate: async (_period?: string) => {
    // Temporairement désactivé les appels API à cause des erreurs Axios
    // Le paramètre _period sera utilisé quand les appels API seront réactivés
    console.warn('Using mock data for conversion rate');
    return {
      current: 3.2,
      evolution: [
        { date: '2023-11-01', rate: 2.8 },
        { date: '2023-11-08', rate: 3.1 },
        { date: '2023-11-15', rate: 3.0 },
        { date: '2023-11-22', rate: 3.4 },
        { date: '2023-11-29', rate: 3.2 }
      ]
    };
  },

  getVendorActions: async (limit = 15) => {
    try {
      const response = await api.get('/admin/vendors/recent-actions', { params: { limit } });
      return response.data;
    } catch (error) {
      console.error('getVendorActions error:', error);
      return { actions: [] };
    }
  },

  getAlerts: async () => {
    try {
      const response = await api.get('/stats/alerts');
      return response.data;
    } catch (error) {
      console.warn('⚠️ Alerts API failed, using fallback data:', error);
      return {
        alertes: [],
        actionsRecommandees: []
      };
    }
  },

  getRevenueEvolution: async (type: string) => {
    try {
      const response = await api.get('/stats/revenue-evolution', { params: { type } });
      return response.data;
    } catch (error) {
      console.warn('⚠️ Revenue evolution API failed:', error);
      return { labels: [], data: [] };
    }
  },

  getMonthlyTarget: async () => {
    try {
      const response = await api.get('/stats/monthly-target');
      return response.data;
    } catch (error) {
      console.warn('⚠️ Monthly target API failed, using fallback data:', error);
      return {
        target: 20000,
        currentRevenue: 0,
        todayRevenue: 0,
        lastMonthRevenue: 0,
        progressPercentage: 0,
        monthOverMonthGrowth: 0
      };
    }
  },

  getNotificationsCount: async () => {
    try {
      const response = await api.get('/stats/notifications-count');
      return response.data;
    } catch (error) {
      console.error('⚠️ Notifications count API failed:', error);
      return {
        pendingOrdersCount: 0,
        newClientsCount: 0,
        newProductsCount: 0,
        pendingStoresCount: 0,
        pendingReviewsCount: 0,
        pendingDisputesCount: 0,
        recentDeliveredOrdersCount: 0,
        recentCancelledOrdersCount: 0,
        unreadMessagesCount: 0,
      };
    }
  },

  setMonthlyTarget: async (target: number) => {
    const response = await api.post('/stats/monthly-target', { target });
    return response.data;
  },

  getSalesByCategory: async () => {
    try {
      const response = await api.get('/stats/sales-by-category');
      return response.data;
    } catch (error) {
      console.warn('⚠️ Sales by category API failed:', error);
      return { labels: [], data: [] };
    }
  },

  getCustomerDemographics: async () => {
    try {
      const response = await api.get('/stats/customer-demographics');
      return response.data;
    } catch (error) {
      console.warn('⚠️ Customer demographics API failed, using fallback data:', error);
      return {
        totalCustomers: 0,
        newThisMonth: 0,
        activeCustomers: 0,
        activePercentage: 0,
        topCities: []
      };
    }
  }
};


// Service des clients (alias pour compatibilité)
export const clientService = {
  getClients: async (params = {}) => {
    const response = await api.get('/clients', { params })
    return response.data
  },
  getClient: async (id: number) => {
    const response = await api.get(`/clients/${id}`)
    return response.data
  },
  createClient: async (clientData: any) => {
    const response = await api.post('/clients', clientData)
    return response.data
  },
  updateClient: async (id: number, clientData: any) => {
    const response = await api.put(`/clients/${id}`, clientData)
    return response.data
  },
  deleteClient: async (id: number) => {
    const response = await api.delete(`/clients/${id}`)
    return response.data
  }
}

// Service de santé
export const healthService = {
  checkHealth: async () => {
    const response = await api.get('/health')
    return response.data
  },
  getStats: async () => {
    const response = await api.get('/admin/seo/health-stats')
    return response.data
  },
  runMaintenance: async () => {
    const response = await api.post('/admin/seo/maintenance')
    return response.data
  }
}

// Service SEO
export const seoService = {
  getSettings: async () => {
    const response = await api.get('/admin/seo/settings')
    return response.data
  },
  updateSettings: async (settings: any) => {
    const response = await api.post('/admin/seo/settings', settings)
    return response.data
  }
}

// Service des catégories
export const categoryService = {
  getAll: async () => {
    const response = await api.get('/categories')
    return response.data
  },
  create: async (data: any) => {
    const response = await api.post('/categories', data)
    return response.data
  },
  update: async (id: number, data: any) => {
    const response = await api.put(`/categories/${id}`, data)
    return response.data
  },
  delete: async (id: number) => {
    const response = await api.delete(`/categories/${id}`)
    return response.data
  }
}

export const brandService = {
  getAll: async () => {
    const response = await api.get('/brands')
    return response.data
  },
  create: async (formData: FormData) => {
    const response = await api.post('/brands', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  },
  update: async (id: number, formData: FormData) => {
    const response = await api.put(`/brands/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  },
  delete: async (id: number) => {
    const response = await api.delete(`/brands/${id}`)
    return response.data
  }
}

// Service des avis
export const reviewService = {
  getPending: async () => {
    const response = await api.get('/reviews/pending')
    return response.data
  },
  moderate: async (id: number, status: 'approved' | 'rejected', comment?: string) => {
    const response = await api.post(`/reviews/${id}/moderate`, { status, comment })
    return response.data
  },
  updateStatus: async (id: number, status: 'approved' | 'rejected') => {
    const response = await api.patch(`/reviews/${id}/status`, { status })
    return response.data
  },
  delete: async (id: number) => {
    const response = await api.delete(`/reviews/${id}`)
    return response.data
  }
}

// Service Finance
export const financeService = {
  getOverview: async (period?: string) => {
    const response = await api.get('/finance/overview', { params: { period } })
    return response.data
  },

  getRevenueChart: async (period = 'monthly') => {
    const response = await api.get('/finance/revenue-chart', { params: { period } })
    return response.data
  },

  getExpenses: async (category = 'all') => {
    const response = await api.get('/finance/expenses', { params: { category } })
    return response.data
  },

  createExpense: async (expense: any) => {
    const response = await api.post('/finance/expenses', expense)
    return response.data
  },

  deleteExpense: async (id: number) => {
    await api.delete(`/finance/expenses/${id}`)
  },

  getExpensesBreakdown: async (period?: string) => {
    const response = await api.get('/finance/expenses-breakdown', { params: { period } })
    return response.data
  },
  getProfitTrend: async (period?: string) => {
    const response = await api.get('/finance/profit-trend', { params: { period } })
    return response.data
  },

  getPaymentMethods: async (period?: string) => {
    const response = await api.get('/finance/payment-methods', { params: { period } })
    return response.data
  },

  getTransactions: async (limit = 10, type = 'all', period?: string) => {
    const response = await api.get('/finance/transactions', { params: { limit, type, period } })
    return response.data
  }
}

// Service des notifications
export const notificationService = {
  getAll: async (params?: { limit?: number; status?: string; type?: string }) => {
    const response = await api.get('/notifications', { params })
    return response.data
  },

  markAsRead: async (id: number) => {
    const response = await api.post(`/notifications/${id}/read`)
    return response.data
  },

  markAllAsRead: async () => {
    const response = await api.post('/notifications/mark-all-read')
    return response.data
  },

  delete: async (id: number) => {
    const response = await api.delete(`/notifications/${id}`)
    return response.data
  },

  deleteAll: async () => {
    const response = await api.delete('/notifications')
    return response.data
  }
}

export const ambassadorService = {
  getAll: async () => {
    const response = await api.get('/ambassadors')
    return response.data
  },
  getOne: async (id: number) => {
    const response = await api.get(`/ambassadors/${id}`)
    return response.data
  },
  updateStatus: async (id: number, status: string) => {
    const response = await api.patch(`/ambassadors/${id}/status`, { status })
    return response.data
  },
  getStats: async (id: number) => {
    const response = await api.get(`/ambassadors/${id}/stats`)
    return response.data
  }
}

// Service pour les messages
export const messageService = {
  getConversations: async () => {
    const response = await api.get('/messages/conversations')
    return response.data
  },
  getConversationMessages: async (id: number) => {
    const response = await api.get(`/messages/conversations/${id}/messages`)
    return response.data
  },
  sendMessage: async (receiverId: number, content: string) => {
    const response = await api.post('/messages/send', { receiverId, content })
    return response.data
  }
}

// Service pour les vendeurs (Marketplace)
export const vendorService = {
  getMe: async (): Promise<Store> => {
    const response = await api.get('/vendors/me')
    return response.data
  },
  updateMe: async (storeData: Partial<Store>): Promise<Store> => {
    const response = await api.put('/vendors/me', storeData)
    return response.data.store
  },
  uploadImages: async (formData: FormData) => {
    const response = await api.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  },
  getProducts: async (): Promise<Product[]> => {
    const response = await api.get('/vendors/me/products')
    return response.data.products || response.data || []
  },
  getOrders: async (page = 1, limit = 10): Promise<{ orders: Order[], pagination: any }> => {
    const response = await api.get('/vendors/me/orders', { params: { page, limit } })
    return response.data
  },
  getSummary: async (): Promise<any> => {
    const response = await api.get('/vendors/me/summary')
    return response.data
  },
  getStats: async (): Promise<any> => {
    const response = await api.get('/vendors/me/stats')
    return response.data
  },
  getPayouts: async (): Promise<any> => {
    const response = await api.get('/vendors/me/payouts')
    return response.data
  },
  updateOrderItemStatus: async (orderId: number, itemId: number, status: string): Promise<any> => {
    const response = await api.patch(`/vendors/me/orders/${orderId}/items/${itemId}`, { status })
    return response.data
  }
}

// Service Admin (Marketplace Management)
export const adminService = {
  // Payouts / Retraits
  getPayouts: async (params?: any) => {
    const response = await api.get('/admin/payouts', { params })
    return response.data
  },
  approvePayout: async (id: number, data: { reference?: string; adminNote?: string }) => {
    const response = await api.put(`/admin/payouts/${id}/approve`, data)
    return response.data
  },
  rejectPayout: async (id: number, data: { reason: string }) => {
    const response = await api.put(`/admin/payouts/${id}/reject`, data)
    return response.data
  },

  // Modération Produits
  getProductsToModerate: async (params?: any) => {
    const response = await api.get('/admin/products/moderation', { params })
    return response.data
  },
  approveProduct: async (id: number) => {
    const response = await api.put(`/admin/products/${id}/approve`)
    return response.data
  },
  rejectProduct: async (id: number, data: { reason: string }) => {
    const response = await api.put(`/admin/products/${id}/reject`, data)
    return response.data
  },

  // Candidatures Vendeurs
  getVendorApplications: async (params?: any) => {
    const response = await api.get('/admin/vendors/applications', { params })
    return response.data
  },
  getVendorApplication: async (id: number | string) => {
    const response = await api.get(`/admin/vendors/applications/${id}`)
    return response.data
  }
}


// =====================
// Refund Service
// =====================
export const refundService = {
  getPendingOrders: async () => {
    const response = await api.get('/refunds/pending-orders')
    return response.data
  },
  getRefunds: async (params?: { status?: string; page?: number; limit?: number }) => {
    const response = await api.get('/refunds', { params })
    return response.data
  },
  getStats: async () => {
    const response = await api.get('/refunds/stats')
    return response.data
  },
  createRefund: async (data: {
    order_id: number
    payment_method: string
    fee_rate_override?: number
    notes?: string
    admin_id?: number
  }) => {
    const response = await api.post('/refunds', data)
    return response.data
  },
  processRefund: async (id: number, data: { reference?: string; notes?: string; admin_id?: number }) => {
    const response = await api.patch(`/refunds/${id}/process`, data)
    return response.data
  },
  completeRefund: async (id: number, data: { reference?: string; notes?: string }) => {
    const response = await api.patch(`/refunds/${id}/complete`, data)
    return response.data
  },
  failRefund: async (id: number, data: { failure_reason: string }) => {
    const response = await api.patch(`/refunds/${id}/fail`, data)
    return response.data
  }
}

export const ticketService = {
  getStats: async () => {
    const response = await api.get('/tickets/stats')
    return response.data
  },
  getAll: async (params?: { status?: string; page?: number; limit?: number } | any) => {
    const response = await api.get('/tickets', { params })
    return response.data
  },
  updateStatus: async (id: number, status: 'open' | 'in_progress' | 'closed') => {
    const response = await api.patch(`/tickets/${id}/status`, { status })
    return response.data
  },
  getDetails: async (id: number | string) => {
    const response = await api.get(`/tickets/${id}`)
    return response.data
  },
  reply: async (id: number | string, data: any) => {
    const response = await api.post(`/tickets/${id}/reply`, data)
    return response.data
  },
  changeStatus: async (id: number | string, status: string) => {
    const response = await api.patch(`/tickets/${id}/status`, { status })
    return response.data
  }
}

export const settingsService = {
  get: async (category: string) => {
    const response = await api.get(`/settings/${category}`)
    return response.data
  },
  update: async (category: string, data: any) => {
    const response = await api.put(`/settings/${category}`, data)
    return response.data
  }
}

export const uploadService = {
  upload: async (files: File[]) => {
    const formData = new FormData()
    files.forEach((file) => formData.append('images', file))
    const response = await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  }
}


export const blogService = {
  getAll: async () => {
    const response = await api.get('/blog')
    return response.data
  },
  getOne: async (id: number | string) => {
    const response = await api.get(`/blog/${id}`)
    return response.data
  },
  create: async (data: any) => {
    const response = await api.post('/blog', data)
    return response.data
  },
  update: async (id: number | string, data: any) => {
    const response = await api.put(`/blog/${id}`, data)
    return response.data
  },
  delete: async (id: number | string) => {
    const response = await api.delete(`/blog/${id}`)
    return response.data
  },
  incrementViews: async (id: number | string) => {
    const response = await api.post(`/blog/${id}/view`)
    return response.data
  }
}

export const pagesService = {
  getAll: async () => {
    const response = await api.get('/pages')
    return response.data
  },
  getOne: async (slug: string) => {
    const response = await api.get(`/pages/${slug}`)
    return response.data
  },
  create: async (data: any) => {
    const response = await api.post('/pages', data)
    return response.data
  },
  update: async (slug: string, data: any) => {
    const response = await api.put(`/pages/${slug}`, data)
    return response.data
  },
  delete: async (slug: string) => {
    await api.delete(`/pages/${slug}`)
  }
}

export const disputeService = {
  getAll: async (params?: { status?: string; page?: number; limit?: number }) => {
    const response = await api.get('/disputes', { params })
    return response.data
  },
  getSellerDisputes: async (params?: { status?: string; page?: number; limit?: number }) => {
    const response = await api.get('/disputes/seller', { params })
    return response.data
  },
  getById: async (id: number | string) => {
    const response = await api.get(`/disputes/${id}`)
    return response.data
  },
  sendMessage: async (id: number | string, message: string) => {
    const response = await api.post(`/disputes/${id}/messages`, { message })
    return response.data
  },
  updateStatus: async (id: number | string, status: string) => {
    const response = await api.patch(`/disputes/${id}/status`, { status })
    return response.data
  }
}

export const searchService = {
  global: async (query: string) => {
    const response = await api.get('/search/global', { params: { q: query } })
    return response.data
  }
}


export default api
