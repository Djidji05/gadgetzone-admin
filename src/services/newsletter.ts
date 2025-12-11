import api from './api'

export interface NewsletterSubscriber {
    id: number
    email: string
    isActive: boolean
    subscribedAt: string
    unsubscribedAt?: string
    createdAt: string
    updatedAt: string
}

export interface NewsletterStats {
    totalSubscribers: number
    activeSubscribers: number
    inactiveSubscribers: number
    recentSubscribers: number
}

export const newsletterService = {
    async getSubscribers(): Promise<{ count: number; subscribers: NewsletterSubscriber[] }> {
        const response = await api.get('/newsletter/subscribers')
        return response.data
    },

    async getStats(): Promise<NewsletterStats> {
        const response = await api.get('/newsletter/stats')
        return response.data
    },

    async exportSubscribers(): Promise<Blob> {
        const response = await api.get('/newsletter/export', {
            responseType: 'blob'
        })
        return response.data
    }
}
