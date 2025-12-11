import axios from 'axios'
import { inactivityTracker, INACTIVITY_TIMEOUT } from './inactivity'
// Re-trigger vite resolution

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3003/api'

console.log('🔗 API_BASE_URL:', API_BASE_URL)
console.log('🔗 VITE_API_URL:', import.meta.env.VITE_API_URL)

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  paramsSerializer: {
    indexes: null,
  },
})

let isRefreshing = false
let refreshPromise: Promise<string> | null = null

// Intercepteur pour ajouter le token JWT et vérifier l'inactivité
api.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem('auth_token')

    if (token) {
      // Vérifier l'inactivité avant chaque requête
      if (inactivityTracker.isInactive(INACTIVITY_TIMEOUT)) {
        // Session expirée par inactivité
        localStorage.removeItem('auth_token')
        localStorage.removeItem('user_data')
        window.location.href = '/login?reason=inactivity'
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
    if (error.response?.status === 401) {
      const errorCode = error.response?.data?.code

      // Si c'est un timeout de session, déconnecter
      if (errorCode === 'SESSION_TIMEOUT') {
        localStorage.removeItem('auth_token')
        localStorage.removeItem('user_data')
        // Éviter la boucle de redirection
        if (!window.location.pathname.includes('/signin')) {
          window.location.href = '/signin?reason=timeout'
        }
        return Promise.reject(error)
      }

      // Pour les autres erreurs 401, rediriger vers signin
      if (!originalRequest._retry) {
        localStorage.removeItem('auth_token')
        localStorage.removeItem('user_data')
        // Éviter la boucle de redirection
        if (!window.location.pathname.includes('/signin')) {
          window.location.href = '/signin'
        }
      }
    }

    console.error('API Error:', error.response?.data || error.message)
    return Promise.reject(error)
  }
)

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
  role: string
  created_at: string
  updated_at: string
}

export interface OrderItem {
  id: number
  order_id: number
  product_id: number
  quantity: number
  price: number
  product_name?: string
}

export interface Order {
  id: number
  user_id: number
  user_name: string
  user_email: string
  total_amount: number
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  created_at: string
  updated_at: string
  items: OrderItem[]
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
  register: async (userData: any) => {
    const response = await api.post('/auth/register', userData)
    return response.data
  },
  login: async (credentials: any) => {
    const response = await api.post('/auth/login', credentials)
    return response.data
  },
  getProfile: async () => {
    const response = await api.get('/auth/profile')
    return response.data
  },
  updateProfile: async (userData: any) => {
    const response = await api.put('/auth/profile', userData)
    return response.data
  },
  changePassword: async (passwordData: any) => {
    const response = await api.post('/auth/change-password', passwordData)
    return response.data
  },
  getUsers: async (params?: any) => {
    const response = await api.get('/auth/users', { params })
    return response.data
  },
  createUser: async (userData: any) => {
    const response = await api.post('/auth/create-user', userData)
    return response.data
  },
  refreshToken: async () => {
    const response = await api.post('/auth/refresh')
    if (response.data.token) {
      localStorage.setItem('auth_token', response.data.token)
    }
    return response.data
  },
  logout: () => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user_data')
  },
  isAuthenticated: () => {
    return !!localStorage.getItem('auth_token')
  },
  getUser: () => {
    const userData = localStorage.getItem('user_data')
    return userData ? JSON.parse(userData) : null
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
    const response = await api.put(`/auth/users/${id}`, userData)
    return response.data
  },
  deleteUser: async (id: number) => {
    const response = await api.delete(`/auth/users/${id}`)
    return response.data
  }
}

// Services pour les produits
// Services pour les produits
export const productService = {
  getAll: async (): Promise<Product[]> => {
    const response = await api.get('/products')
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

  delete: async (id: number): Promise<void> => {
    await api.delete(`/products/${id}`)
  }
}

// Services pour les utilisateurs
export const userService = {
  getAll: async (): Promise<User[]> => {
    try {
      const response = await api.get('/clients')
      // L'API retourne { clients: [...] } au lieu de directement le tableau
      return response.data.clients || response.data || []
    } catch {
      console.warn('API not available, returning mock data')
      // Données de démonstration temporaires
      return [
        { id: 1, name: 'Jean Dupont', email: 'jean.dupont@example.com', role: 'client', created_at: '2023-01-01', updated_at: '2023-01-01' },
        { id: 2, name: 'Marie Martin', email: 'marie.martin@example.com', role: 'client', created_at: '2023-01-01', updated_at: '2023-01-01' },
        { id: 3, name: 'Pierre Durand', email: 'pierre.durand@example.com', role: 'client', created_at: '2023-01-01', updated_at: '2023-01-01' },
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
      const response = await api.get('/orders')
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

export default api

// Services pour la personnalisation (bannières et promotions)
export const personalisationService = {
  // Bannières
  getBanners: async () => {
    try {
      const response = await api.get('/banners');
      return response.data;
    } catch {
      console.warn('API not available, returning mock banners data');
      return [
        {
          id: 1,
          image: '',
          title: 'Bienvenue sur notre site',
          subtitle: 'Découvrez nos dernières collections et offres exclusives',
          isActive: true,
          order: 1
        }
      ];
    }
  },

  createBanner: async (banner: CreateBannerRequest): Promise<Banner> => {
    try {
      const response = await api.post('/banners', banner);
      return response.data;
    } catch {
      console.warn('API not available, simulating banner creation');
      return { id: Math.floor(Math.random() * 1000) + 1, ...banner };
    }
  },

  updateBanner: async (id: number, banner: UpdateBannerRequest): Promise<void> => {
    try {
      await api.put(`/banners/${id}`, banner);
    } catch {
      console.warn('API not available, simulating banner update');
    }
  },

  deleteBanner: async (id: number) => {
    try {
      await api.delete(`/banners/${id}`);
    } catch {
      console.warn('API not available, simulating banner delete');
    }
  },

  // Promotions
  getPromotions: async () => {
    try {
      const response = await api.get('/promotions');
      return response.data;
    } catch {
      console.warn('API not available, returning mock promotions data');
      return [
        {
          id: 1,
          title: 'Été 2023',
          description: 'Profitez de nos offres spéciales pour l\'été',
          code: 'ETE2023',
          discount: 15,
          startDate: '2023-06-01',
          endDate: '2023-08-31',
          isActive: true,
          image: 'https://via.placeholder.com/800x400?text=Promo+Eté'
        },
        {
          id: 2,
          title: 'Nouveautés',
          description: 'Découvrez nos nouveaux produits avec une réduction exclusive',
          code: 'NEW2023',
          discount: 20,
          startDate: '2023-09-01',
          endDate: '2023-09-30',
          isActive: true,
          image: 'https://via.placeholder.com/800x400?text=Nouveautés'
        },
        {
          id: 3,
          title: 'Black Friday',
          description: 'Jusqu\'à -50% sur une sélection de produits',
          code: 'BLACKFRI',
          discount: 50,
          startDate: '2023-11-24',
          endDate: '2023-11-27',
          isActive: true,
          image: 'https://via.placeholder.com/800x400?text=Black+Friday'
        },
        {
          id: 4,
          title: 'Promotion terminée',
          description: 'Ancienne promotion',
          code: 'OLD123',
          discount: 10,
          startDate: '2023-01-01',
          endDate: '2023-01-31',
          isActive: false,
          image: 'https://via.placeholder.com/800x400?text=Ancienne+Promo'
        }
      ];
    }
  },

  createPromotion: async (promotion: CreatePromotionRequest): Promise<Promotion> => {
    try {
      const response = await api.post('/promotions', promotion);
      return response.data;
    } catch {
      console.warn('API not available, simulating promotion creation');
      return { id: Math.floor(Math.random() * 1000) + 1, ...promotion };
    }
  },

  updatePromotion: async (id: number, promotion: UpdatePromotionRequest): Promise<void> => {
    try {
      await api.put(`/promotions/${id}`, promotion);
    } catch {
      console.warn('API not available, simulating promotion update');
    }
  },

  deletePromotion: async (id: number) => {
    try {
      await api.delete(`/promotions/${id}`);
    } catch {
      console.warn('API not available, simulating promotion delete');
    }
  },

  togglePromotionStatus: async (id: number, isActive: boolean) => {
    try {
      await api.patch(`/promotions/${id}/status`, { isActive });
    } catch {
      console.warn('API not available, simulating promotion status toggle');
    }
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
  }
}

// Service des catégories
export const categoryService = {
  getAll: async () => {
    const response = await api.get('/categories')
    return response.data
  }
}

export const brandService = {
  getAll: async () => {
    const response = await api.get('/brands')
    return response.data
  }
}

// Service Finance
export const financeService = {
  getOverview: async () => {
    const response = await api.get('/finance/overview')
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

  getExpensesBreakdown: async () => {
    const response = await api.get('/finance/expenses-breakdown')
    return response.data
  },

  getProfitTrend: async () => {
    const response = await api.get('/finance/profit-trend')
    return response.data
  },


  getPaymentMethods: async () => {
    const response = await api.get('/finance/payment-methods')
    return response.data
  },

  getTransactions: async (limit = 10, type = 'all') => {
    const response = await api.get('/finance/transactions', { params: { limit, type } })
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
  }
}
