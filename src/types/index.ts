// Types pour l'application

export interface User {
  id: number
  name: string
  email: string
  phone?: string
  role: 'admin' | 'user'
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

export interface OrderItem {
  id: number
  order_id: number
  product_id: number
  quantity: number
  price: number
  product?: Product
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

export interface QueryParams {
  page?: number
  limit?: number
  search?: string
  status?: string
  user_id?: number
  category_id?: number
}
