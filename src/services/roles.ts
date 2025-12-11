import api from './api'

export interface Role {
    id: number
    name: string
    description: string
    permissions: string[]
    isSystem: boolean
    usersCount?: number
    createdAt: string
    updatedAt: string
}

export const rolesService = {
    async getAll(): Promise<{ roles: Role[] }> {
        const response = await api.get('/roles')
        return response.data
    },

    async getById(id: number): Promise<Role> {
        const response = await api.get(`/roles/${id}`)
        return response.data
    },

    async create(data: Partial<Role>): Promise<Role> {
        const response = await api.post('/roles', data)
        return response.data
    },

    async update(id: number, data: Partial<Role>): Promise<Role> {
        const response = await api.put(`/roles/${id}`, data)
        return response.data
    },

    async delete(id: number): Promise<void> {
        await api.delete(`/roles/${id}`)
    }
}
