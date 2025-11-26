// Type declarations for API services

declare module '@/services/api' {
  export interface Product {
    id: number
    name: string
    description?: string
    price: number
    stock: number
    category_id: number
    image_url?: string
    category?: Category
    created_at: string
    updated_at: string
  }

  export interface Category {
    id: number
    name: string
    description?: string
    created_at: string
    updated_at: string
  }

  export interface User {
    id: number
    name: string
    email: string
    phone?: string
    role: 'admin' | 'user'
    created_at: string
    updated_at: string
  }

  export interface Order {
    id: number
    user_id: number
    total_amount: number
    status: 'pending' | 'confirmed' | 'shipped' | 'delivered'
    created_at: string
    updated_at: string
    user?: User
    items?: OrderItem[]
  }

  export interface OrderItem {
    id: number
    order_id: number
    product_id: number
    quantity: number
    price: number
    product?: Product
  }

  // Types pour les données d'authentification
  export interface LoginCredentials {
    email: string
    password: string
  }

  export interface RegisterData {
    name: string
    email: string
    password: string
  }

  export interface AuthResponse {
    token: string
    user: User
  }

  export interface ProfileUpdateData {
    name?: string
    email?: string
    phone?: string
  }

  export interface PasswordChangeData {
    current_password: string
    new_password: string
  }

  // Types pour les produits
  export interface ProductCreateData {
    name: string
    description?: string
    price: number
    stock: number
    category_id: number
    image_url?: string
  }

  export interface ProductUpdateData {
    name?: string
    description?: string
    price?: number
    stock?: number
    category_id?: number
    image_url?: string
  }

  // Types pour les clients
  export interface ClientCreateData {
    name: string
    email: string
    phone?: string
    role?: 'admin' | 'user'
  }

  export interface ClientUpdateData {
    name?: string
    email?: string
    phone?: string
    role?: 'admin' | 'user'
  }

  // Types pour les commandes
  export interface OrderCreateData {
    user_id: number
    items: Array<{
      product_id: number
      quantity: number
    }>
  }

  export interface OrderUpdateData {
    status?: 'pending' | 'confirmed' | 'shipped' | 'delivered'
  }

  // Types pour les paramètres de requête
  export interface QueryParams {
    page?: number
    limit?: number
    search?: string
    status?: string
    user_id?: number
    category_id?: number
  }

  // Types pour les réponses API
  export interface ApiResponse<T> {
    success: boolean
    data?: T
    error?: string
    message?: string
  }

  export interface PaginatedResponse<T> {
    data: T[]
    total: number
    page: number
    limit: number
  }

  export const authService: {
    register: (userData: RegisterData) => Promise<AuthResponse>
    login: (credentials: LoginCredentials) => Promise<AuthResponse>
    getProfile: () => Promise<ApiResponse<{ user: User }>>
    updateProfile: (userData: ProfileUpdateData) => Promise<ApiResponse<{ user: User }>>
    changePassword: (passwordData: PasswordChangeData) => Promise<ApiResponse<{ message: string }>>
    logout: () => void
    isAuthenticated: () => boolean
    getUser: () => User | null
    setUser: (userData: User, token: string) => void
  }

  export const statsService: {
    getOverview: () => Promise<ApiResponse<{
      counts: {
        users: number
        orders: number
        products: number
        revenue: number
      }
      growth: {
        users: number
        orders: number
        revenue: number
      }
    }>>
    getTopProducts: (params?: QueryParams) => Promise<ApiResponse<{ products: Product[] }>>
    getTopClients: (params?: QueryParams) => Promise<ApiResponse<{ clients: User[] }>>
    getSalesChart: (params?: QueryParams) => Promise<ApiResponse<{ chart: unknown[] }>>
    getCategoryPerformance: () => Promise<ApiResponse<{ categories: unknown[] }>>
    getTrafficSources: () => Promise<ApiResponse<{ sources: unknown[] }>>
    getConversionRate: (params?: QueryParams) => Promise<ApiResponse<{ rate: number }>>
    getInventoryAlerts: (params?: QueryParams) => Promise<ApiResponse<{ alerts: Product[] }>>
  }

  export const productService: {
    getProducts: (params?: QueryParams) => Promise<PaginatedResponse<Product>>
    getProduct: (id: number) => Promise<ApiResponse<{ product: Product }>>
    createProduct: (productData: ProductCreateData) => Promise<ApiResponse<{ product: Product }>>
    updateProduct: (id: number, productData: ProductUpdateData) => Promise<ApiResponse<{ product: Product }>>
    deleteProduct: (id: number) => Promise<ApiResponse<{ message: string }>>
  }

  export const clientService: {
    getClients: (params?: QueryParams) => Promise<PaginatedResponse<User>>
    getClient: (id: number) => Promise<ApiResponse<{ client: User }>>
    createClient: (clientData: ClientCreateData) => Promise<ApiResponse<{ client: User }>>
    updateClient: (id: number, clientData: ClientUpdateData) => Promise<ApiResponse<{ client: User }>>
    deleteClient: (id: number) => Promise<ApiResponse<{ message: string }>>
  }

  export const orderService: {
    getOrders: (params?: QueryParams) => Promise<PaginatedResponse<Order>>
    getOrder: (id: number) => Promise<ApiResponse<{ order: Order }>>
    createOrder: (orderData: OrderCreateData) => Promise<ApiResponse<{ order: Order }>>
    updateOrder: (id: number, orderData: OrderUpdateData) => Promise<ApiResponse<{ order: Order }>>
    deleteOrder: (id: number) => Promise<ApiResponse<{ message: string }>>
  }

  export const healthService: {
    checkHealth: () => Promise<ApiResponse<{ status: string }>>
  }
}

declare module '@/stores/auth' {
  import type { User, LoginCredentials, RegisterData, ProfileUpdateData, PasswordChangeData, AuthResponse } from '@/types'

  export const useAuthStore: () => {
    user: User | null
    token: string | null
    isLoading: boolean
    error: string | null
    isAuthenticated: boolean
    isAdmin: boolean
    userRole: string
    login: (credentials: LoginCredentials) => Promise<{ success: boolean; data?: AuthResponse; error?: string }>
    register: (userData: RegisterData) => Promise<{ success: boolean; data?: AuthResponse; error?: string }>
    logout: () => void
    updateProfile: (userData: ProfileUpdateData) => Promise<{ success: boolean; data?: { user: User }; error?: string }>
    changePassword: (passwordData: PasswordChangeData) => Promise<{ success: boolean; data?: { message: string }; error?: string }>
    checkAuth: () => boolean
    refreshProfile: () => Promise<{ success: boolean; data?: { user: User }; error?: string }>
    clearError: () => void
    init: () => void
  }
}
