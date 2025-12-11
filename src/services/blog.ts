import api from './api'

export interface BlogPost {
    id: number
    title: string
    slug: string
    excerpt?: string
    content?: string
    author: string
    featuredImage?: string
    status: 'draft' | 'published'
    views: number
    publishedAt?: string
    createdAt: string
    updatedAt: string
}

export interface BlogStats {
    published: number
    drafts: number
    totalViews: number
    total: number
}

export const blogService = {
    async getAll(): Promise<{ posts: BlogPost[]; stats: BlogStats }> {
        const response = await api.get('/blog')
        return response.data
    },

    async getById(id: number): Promise<BlogPost> {
        const response = await api.get(`/blog/${id}`)
        return response.data
    },

    async create(data: Partial<BlogPost>): Promise<BlogPost> {
        const response = await api.post('/blog', data)
        return response.data
    },

    async update(id: number, data: Partial<BlogPost>): Promise<BlogPost> {
        const response = await api.put(`/blog/${id}`, data)
        return response.data
    },

    async delete(id: number): Promise<void> {
        await api.delete(`/blog/${id}`)
    }
}
