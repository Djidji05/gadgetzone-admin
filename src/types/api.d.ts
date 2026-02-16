// Type declarations for API services

declare module '@/services/api' {
  export interface Product {
    id: number
    name: string
    description?: string
    price: number
    stock: number
    category_id: number
    brand_id?: number
    image_url?: string
    images?: string[]
    features?: string[]
    specifications?: Record<string, string>
    is_featured?: boolean
    is_new?: boolean
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

  export interface Brand {
    id: number
    name: string
    logo_url?: string
    created_at: string
    updated_at: string
  }

  export interface User {
    id: number
    name: string
    email: string
    phone?: string
    role: 'admin' | 'user' | 'client'
    created_at: string
    updated_at: string
    total_orders?: number
    total_spent?: number
  }

  export interface Order {
    id: number
    user_id: number
    total_amount: number
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'confirmed'
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

  export interface Notification {
    id: number
    title: string
    message: string
    type: 'info' | 'success' | 'warning' | 'error'
    is_read: boolean
    created_at: string
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
    brand_id?: number
    image_url?: string
    images?: string[]
    features?: string[]
    specifications?: Record<string, string>
    is_featured?: boolean
    is_new?: boolean
  }

  export interface ProductUpdateData extends Partial<ProductCreateData> { }

  // Types pour les clients
  export interface ClientCreateData {
    name: string
    email: string
    phone?: string
    role?: 'admin' | 'user'
    password?: string
  }

  export interface ClientUpdateData extends Partial<ClientCreateData> { }

  // Types pour les commandes
  export interface OrderCreateData {
    user_id: number
    items: Array<{
      product_id: number
      quantity: number
    }>
  }

  export interface OrderUpdateData {
    status?: Order['status']
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
    // Legacy support for specific keys
    orders?: T[]
    products?: T[]
    clients?: T[]
    users?: T[]
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
    // User management methods
    getUsers: (params?: QueryParams) => Promise<PaginatedResponse<User> | User[]>
    getUserById: (id: number) => Promise<User>
    createUser: (userData: ClientCreateData) => Promise<User>
    updateUser: (id: number, userData: ClientUpdateData) => Promise<User>
    deleteUser: (id: number) => Promise<void>
    refreshToken: () => Promise<AuthResponse>
  }

  export const statsService: {
    getOverview: (period?: string) => Promise<ApiResponse<{
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
    getTopProducts: (limit?: number) => Promise<any[]>
    getTopClients: (limit?: number) => Promise<any[]>
    getTrafficSources: () => Promise<any[]>
    getConversionRate: (period?: string) => Promise<any>
    getAlerts: () => Promise<any>
    getRevenueEvolution: (type: string) => Promise<any>
    getMonthlyTarget: () => Promise<any>
    getSalesByCategory: () => Promise<any>
    getCustomerDemographics: () => Promise<any>
  }

  export const productService: {
    getAll: () => Promise<Product[]>
    getProducts: (params?: QueryParams) => Promise<PaginatedResponse<Product>>
    getById: (id: number) => Promise<Product>
    getProduct: (id: number) => Promise<ApiResponse<{ product: Product }>>
    create: (productData: any) => Promise<number> // Matches implementation
    createProduct: (productData: ProductCreateData) => Promise<ApiResponse<{ product: Product }>>
    update: (id: number, productData: any) => Promise<void> // Matches implementation
    updateProduct: (id: number, productData: ProductUpdateData) => Promise<ApiResponse<{ product: Product }>>
    delete: (id: number) => Promise<void> // Matches implementation
    deleteProduct: (id: number) => Promise<ApiResponse<{ message: string }>>
  }

  export const userService: {
    getAll: () => Promise<User[]>
    getById: (id: number) => Promise<User>
    create: (userData: any) => Promise<number>
    update: (id: number, userData: any) => Promise<void>
    delete: (id: number) => Promise<void>
  }

  export const clientService: {
    getClients: (params?: QueryParams) => Promise<PaginatedResponse<User>>
    getClient: (id: number) => Promise<ApiResponse<{ client: User }>>
    createClient: (clientData: ClientCreateData) => Promise<ApiResponse<{ client: User }>>
    updateClient: (id: number, clientData: ClientUpdateData) => Promise<ApiResponse<{ client: User }>>
    deleteClient: (id: number) => Promise<ApiResponse<{ message: string }>>
  }

  export const orderService: {
    getAll: () => Promise<Order[]>
    getOrders: (params?: QueryParams) => Promise<PaginatedResponse<Order>>
    getById: (id: number) => Promise<Order>
    getOrder: (id: number) => Promise<ApiResponse<{ order: Order }>>
    create: (orderData: any) => Promise<number>
    createOrder: (orderData: OrderCreateData) => Promise<ApiResponse<{ order: Order }>>
    update: (id: number, orderData: any) => Promise<void>
    updateOrder: (id: number, orderData: OrderUpdateData) => Promise<ApiResponse<{ order: Order }>>
    delete: (id: number) => Promise<void>
    deleteOrder: (id: number) => Promise<ApiResponse<{ message: string }>>
  }

  export const categoryService: {
    getAll: () => Promise<Category[]>
  }

  export const brandService: {
    getAll: () => Promise<Brand[]>
  }

  export const financeService: {
    getOverview: () => Promise<any>
    getRevenueChart: (period?: string) => Promise<any>
    getExpenses: (category?: string) => Promise<any>
    createExpense: (expense: any) => Promise<any>
    deleteExpense: (id: number) => Promise<void>
    getExpensesBreakdown: () => Promise<any>
    getProfitTrend: () => Promise<any>
    getPaymentMethods: () => Promise<any>
    getTransactions: (limit?: number, type?: string) => Promise<any>
  }

  export const notificationService: {
    getAll: () => Promise<Notification[]>
    markAsRead: (id: number) => Promise<void>
    markAllAsRead: () => Promise<void>
    delete: (id: number) => Promise<void>
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
    refreshToken: () => Promise<{ success: boolean; error?: string }>
    clearError: () => void
    init: () => void
  }
}
