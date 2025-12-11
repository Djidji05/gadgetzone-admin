import api from './api'

export interface Page {
    id: number
    title: string
    slug: string
    content: string
    metaTitle?: string
    metaDescription?: string
    isPublished: boolean
    createdAt: string
    updatedAt: string
}

export const pagesService = {
    async getAll(): Promise<{ pages: Page[] }> {
        const response = await api.get('/pages')
        return response.data
    },

    async getBySlug(slug: string): Promise<Page> {
        const response = await api.get(`/pages/${slug}`)
        return response.data
    },

    async create(data: Partial<Page>): Promise<Page> {
        const response = await api.post('/pages', data)
        return response.data
    },

    async update(id: number, data: Partial<Page>): Promise<Page> {
        const response = await api.put(`/pages/${id}`, data)
        return response.data
    },

    async delete(id: number): Promise<void> {
        await api.delete(`/pages/${id}`)
    }
}
