import api from './api'

export interface Payment {
  id: number
  customer: string
  email: string
  amount: number
  method: string
  status: 'completed' | 'pending' | 'failed' | 'refunded'
  date: string
  orderId?: number
  transactionId?: string
}

export interface PaymentStats {
  totalRevenue: number
  revenueGrowth: number
  todayPayments: number
  todayGrowth: number
  successRate: number
  pendingPayments: number
}

export interface PaymentMethod {
  name: string
  count: number
  percentage: number
  amount: number
}

export interface RevenueData {
  date: string
  revenue: number
  orders: number
}

export const paiementsService = {
  // Obtenir les statistiques des paiements
  getStats: async (): Promise<PaymentStats> => {
    const response = await api.get('/paiements/stats')
    return response.data
  },

  // Obtenir la liste des paiements
  getPaiements: async (params?: {
    page?: number
    limit?: number
    status?: string
    search?: string
  }): Promise<{ payments: Payment[]; total: number }> => {
    const response = await api.get('/paiements', { params })
    return response.data
  },

  // Obtenir les méthodes de paiement
  getPaymentMethods: async (): Promise<PaymentMethod[]> => {
    const response = await api.get('/paiements/methods')
    return response.data
  },

  // Obtenir les données de revenus
  getRevenueData: async (period: string): Promise<RevenueData[]> => {
    const response = await api.get(`/paiements/revenue?period=${period}`)
    return response.data
  },

  // Créer un paiement
  createPayment: async (paymentData: Partial<Payment>): Promise<Payment> => {
    const response = await api.post('/paiements', paymentData)
    return response.data
  },

  // Mettre à jour un paiement
  updatePayment: async (id: number, paymentData: Partial<Payment>): Promise<Payment> => {
    const response = await api.put(`/paiements/${id}`, paymentData)
    return response.data
  },

  // Rembourser un paiement
  refundPayment: async (id: number, reason?: string): Promise<Payment> => {
    const response = await api.post(`/paiements/${id}/refund`, { reason })
    return response.data
  },

  // Obtenir les détails d'un paiement
  getPaymentDetails: async (id: number): Promise<Payment> => {
    const response = await api.get(`/paiements/${id}`)
    return response.data
  },

  // Exporter les paiements
  exportPayments: async (params: {
    format: 'csv' | 'excel' | 'pdf'
    startDate?: string
    endDate?: string
    status?: string
  }): Promise<Blob> => {
    const response = await api.get('/paiements/export', {
      params,
      responseType: 'blob'
    })
    return response.data
  }
}
