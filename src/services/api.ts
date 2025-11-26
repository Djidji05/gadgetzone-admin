import axios from 'axios'

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

// Intercepteur pour gérer les erreurs
api.interceptors.response.use(
  (response) => response,
  (error) => {
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

// Services pour les produits
export const productService = {
  getAll: async (): Promise<Product[]> => {
    try {
      const response = await api.get('/products')
      // L'API retourne { products: [...] } au lieu de directement le tableau
      return response.data.products || response.data || []
    } catch {
      console.warn('API not available, returning mock data')
      // Données de démonstration temporaires
      return [
        { id: 1, name: 'Produit 1', description: 'Description produit 1', price: 50, stock: 100, category_id: 1, image_url: '', created_at: '2023-01-01', updated_at: '2023-01-01' },
        { id: 2, name: 'Produit 2', description: 'Description produit 2', price: 75, stock: 50, category_id: 2, image_url: '', created_at: '2023-01-01', updated_at: '2023-01-01' },
        { id: 3, name: 'Produit 3', description: 'Description produit 3', price: 100, stock: 25, category_id: 1, image_url: '', created_at: '2023-01-01', updated_at: '2023-01-01' },
      ]
    }
  },

  getById: async (id: number): Promise<Product> => {
    try {
      const response = await api.get(`/products/${id}`)
      return response.data
    } catch {
      console.warn('API not available, returning mock data')
      return { id: id, name: `Produit ${id}`, description: `Description produit ${id}`, price: 50, stock: 100, category_id: 1, image_url: '', created_at: '2023-01-01', updated_at: '2023-01-01' }
    }
  },

  create: async (product: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<number> => {
    try {
      const response = await api.post('/products', product)
      return response.data.id
    } catch {
      console.warn('API not available, simulating creation')
      return Math.floor(Math.random() * 1000) + 1
    }
  },

  update: async (id: number, product: Partial<Product>): Promise<void> => {
    try {
      await api.put(`/products/${id}`, product)
    } catch {
      console.warn('API not available, simulating update')
    }
  },

  delete: async (id: number): Promise<void> => {
    try {
      await api.delete(`/products/${id}`)
    } catch {
      console.warn('API not available, simulating delete')
    }
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
      const response = await api.get(`/users/${id}`)
      return response.data
    } catch {
      console.warn('API not available, returning mock data')
      return { id: id, name: `Utilisateur ${id}`, email: `user${id}@example.com`, role: 'client', created_at: '2023-01-01', updated_at: '2023-01-01' }
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

  delete: async (id: number): Promise<void> => {
    try {
      await api.delete(`/orders/${id}`)
    } catch {
      console.warn('API not available, simulating delete')
    }
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
  getOverview: async (_period?: string) => {
    // Temporairement désactivé les appels API à cause des erreurs Axios
    // Le paramètre _period sera utilisé quand les appels API seront réactivés
    console.warn('Using mock data for stats overview');
    // Données de démonstration temporaires
    return {
      chiffreAffaires: 125487.65,
      evolutionCA: 12.5,
      nbCommandes: 348,
      evolutionCommandes: 8.2,
      nbProduitsVendus: 1245,
      evolutionProduits: 15.3,
      nouveauxClients: 89,
      evolutionClients: 5.7
    };
  },

  getTopProducts: async (_limit = 10) => {
    // Temporairement désactivé les appels API à cause des erreurs Axios
    // Le paramètre _limit sera utilisé quand les appels API seront réactivés
    console.warn('Using mock data for top products');
    return [
        {
          id: 1,
          name: 'Smartphone Premium X',
          category: 'Téléphonie',
          quantity_sold: 245,
          revenue: 36750,
          growth: 18.5
        },
        {
          id: 2,
          name: 'Écouteurs sans fil Pro',
          category: 'Audio',
          quantity_sold: 198,
          revenue: 15840,
          growth: 35.2
        },
        {
          id: 3,
          name: 'Laptop Ultra Slim',
          category: 'Informatique',
          quantity_sold: 89,
          revenue: 44500,
          growth: 8.7
        }
      ];

  },

  getTopClients: async (_limit = 10) => {
    // Temporairement désactivé les appels API à cause des erreurs Axios
    // Le paramètre _limit sera utilisé quand les appels API seront réactivés
    console.warn('Using mock data for top clients');
    return [
        {
          id: 1,
          name: 'Jean Dupont',
          email: 'jean.dupont@example.com',
          total_orders: 12,
          total_spent: 2450.75,
          last_order: '2023-12-01'
        },
        {
          id: 2,
          name: 'Marie Martin',
          email: 'marie.martin@example.com',
          total_orders: 8,
          total_spent: 1890.50,
          last_order: '2023-11-28'
        }
      ];
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
  }
};
