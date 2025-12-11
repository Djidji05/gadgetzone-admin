import api from './api'

export interface Campaign {
    id: number
    name: string
    type: 'Email' | 'Social Media' | 'Newsletter' | 'SMS' | 'Display Ads' | 'Other'
    status: 'Draft' | 'Active' | 'Paused' | 'Completed' | 'Cancelled'
    description?: string
    startDate?: string
    endDate?: string
    budget?: number
    spent?: number
    leads?: number
    conversions?: number
    revenue?: number
    createdAt: string
    updatedAt: string
}

export interface CampaignStats {
    activeCampaigns: number
    totalLeads: number
    totalConversions: number
    totalRevenue: number
    totalSpent: number
    conversionRate: string
    roi: string
}

export interface CampaignsResponse {
    campaigns: Campaign[]
    stats: CampaignStats
}

export const campaignsService = {
    async getAll(): Promise<CampaignsResponse> {
        const response = await api.get('/campaigns')
        return response.data
    },

    async getById(id: number): Promise<Campaign> {
        const response = await api.get(`/campaigns/${id}`)
        return response.data
    },

    async create(data: Partial<Campaign>): Promise<Campaign> {
        const response = await api.post('/campaigns', data)
        return response.data
    },

    async update(id: number, data: Partial<Campaign>): Promise<Campaign> {
        const response = await api.put(`/campaigns/${id}`, data)
        return response.data
    },

    async delete(id: number): Promise<void> {
        await api.delete(`/campaigns/${id}`)
    },

    async updateStats(id: number, stats: {
        leads?: number
        conversions?: number
        revenue?: number
        spent?: number
    }): Promise<Campaign> {
        const response = await api.patch(`/campaigns/${id}/stats`, stats)
        return response.data
    }
}
