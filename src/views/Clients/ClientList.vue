<template>
  <div class="p-6">
    <div class="mb-6 flex items-center justify-between">
      <h1 class="text-2xl font-semibold text-gray-900 dark:text-white">
        Clients
        <span class="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">({{ pagination.total }} au total)</span>
      </h1>
      <div class="flex items-center gap-2">
        <button
          @click="exportCSV"
          class="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
          title="Exporter en CSV"
        >
          <i class="fas fa-file-csv"></i> Exporter CSV
        </button>
        <button
          v-if="authStore.isAdmin"
          @click="$router.push('/admin/clients/create')"
          class="btn btn-primary"
        >
          Ajouter un client
        </button>
      </div>
    </div>

    <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <!-- Search -->
      <div class="mb-4 flex items-center gap-3">
        <input
          v-model="searchQuery"
          @input="onSearch"
          type="text"
          placeholder="Rechercher un client..."
          class="flex-1 px-4 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600"
        />
        <select
          v-model="perPage"
          @change="fetchClients(1)"
          class="px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 text-sm"
        >
          <option :value="10">10 / page</option>
          <option :value="25">25 / page</option>
          <option :value="50">50 / page</option>
          <option :value="100">100 / page</option>
        </select>
      </div>

      <!-- Loading -->
      <div v-if="isLoading" class="text-center py-8">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p class="mt-2 text-gray-600 dark:text-gray-400">Chargement...</p>
      </div>

      <!-- Empty -->
      <div v-else-if="clients.length === 0" class="text-center py-8">
        <p class="text-gray-600 dark:text-gray-400">Aucun client trouvé</p>
      </div>

      <!-- Table -->
      <div v-else class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b dark:border-gray-700">
              <th class="text-left p-2">Nom</th>
              <th class="text-left p-2">Email</th>
              <th class="text-left p-2">Téléphone</th>
              <th class="text-left p-2">Date d'inscription</th>
              <th class="text-left p-2">Rôle</th>
              <th class="text-left p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="client in clients" :key="client.id" class="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
              <td class="p-2">{{ client.name }}</td>
              <td class="p-2">{{ client.email }}</td>
              <td class="p-2">{{ client.phone || '-' }}</td>
              <td class="p-2">{{ formatDate(client.created_at) }}</td>
              <td class="p-2">
                <span :class="getRoleClass(client.role)">
                  {{ getRoleText(client.role) }}
                </span>
              </td>
              <td class="p-2">
                <button @click="viewClient(client.id)" class="text-blue-600 hover:text-blue-800 mr-2">Voir</button>
                <button v-if="authStore.isAdmin" @click="editClient(client.id)" class="text-green-600 hover:text-green-800 mr-2">Modifier</button>
                <button v-if="authStore.isAdmin && client.role !== 'admin'" @click="deleteClient(client.id)" class="text-red-600 hover:text-red-800">Supprimer</button>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Pagination -->
        <div class="mt-4 flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
          <span>
            Affichage de {{ (pagination.page - 1) * pagination.limit + 1 }}
            à {{ Math.min(pagination.page * pagination.limit, pagination.total) }}
            sur {{ pagination.total }} clients
          </span>
          <div class="flex items-center gap-1">
            <button
              @click="fetchClients(1)"
              :disabled="pagination.page === 1"
              class="px-2 py-1 rounded border border-gray-300 disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-700"
            >«</button>
            <button
              @click="fetchClients(pagination.page - 1)"
              :disabled="pagination.page === 1"
              class="px-3 py-1 rounded border border-gray-300 disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-700"
            >‹ Préc.</button>

            <template v-for="p in pageNumbers" :key="p">
              <span v-if="p === '...'" class="px-2">…</span>
              <button
                v-else
                @click="p !== '...' && fetchClients(Number(p))"
                :class="[
                  'px-3 py-1 rounded border',
                  p === pagination.page
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'border-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                ]"
              >{{ p }}</button>
            </template>

            <button
              @click="fetchClients(pagination.page + 1)"
              :disabled="pagination.page >= pagination.totalPages"
              class="px-3 py-1 rounded border border-gray-300 disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-700"
            >Suiv. ›</button>
            <button
              @click="fetchClients(pagination.totalPages)"
              :disabled="pagination.page >= pagination.totalPages"
              class="px-2 py-1 rounded border border-gray-300 disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-700"
            >»</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { clientService } from '@/services/api'

const router = useRouter()
const authStore = useAuthStore()

const clients = ref<any[]>([])
const isLoading = ref(true)
const searchQuery = ref('')
const perPage = ref(10)

const pagination = ref({
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 1
})

// Debounce search
let searchTimer: ReturnType<typeof setTimeout>
const onSearch = () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => fetchClients(1), 400)
}

const pageNumbers = computed(() => {
  const total = pagination.value.totalPages
  const current = pagination.value.page
  const pages: (number | string)[] = []

  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i)
  } else {
    pages.push(1)
    if (current > 3) pages.push('...')
    for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) pages.push(i)
    if (current < total - 2) pages.push('...')
    pages.push(total)
  }
  return pages
})

const formatDate = (dateString: any) => new Date(dateString).toLocaleDateString('fr-FR')

const getRoleClass = (role: any) => {
  const classes: Record<string, string> = {
    admin: 'bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs',
    gestionnaire: 'bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full text-xs',
    seller: 'bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs',
    user: 'bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs',
  }
  return classes[role] || 'bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs'
}

const getRoleText = (role: any) => {
  const texts: Record<string, string> = {
    admin: 'Admin',
    gestionnaire: 'Gestionnaire',
    seller: 'Vendeur',
    user: 'Client',
  }
  return texts[role] || role
}

const fetchClients = async (page = 1) => {
  try {
    isLoading.value = true
    const response = (await clientService.getClients({
      page,
      limit: perPage.value,
      search: searchQuery.value || undefined
    })) as any
    clients.value = response.clients || []
    pagination.value = {
      page: response.pagination?.page || page,
      limit: response.pagination?.limit || perPage.value,
      total: response.pagination?.total || 0,
      totalPages: response.pagination?.totalPages || 1
    }
  } catch (error) {
    console.error('Erreur lors du chargement des clients:', error)
  } finally {
    isLoading.value = false
  }
}

const viewClient = (id: any) => router.push(`/admin/clients/${id}`)
const editClient = (id: any) => router.push(`/admin/clients/${id}/edit`)

const exportCSV = () => {
  const headers = ['ID', 'Nom', 'Email', 'Téléphone', 'Rôle', 'Date inscription']
  const rows = clients.value.map(c => [
    c.id,
    `"${(c.name || '').replace(/"/g, '""')}"`,
    c.email,
    c.phone || '',
    c.role,
    new Date(c.created_at).toLocaleDateString('fr-FR')
  ])
  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `clients_${new Date().toISOString().slice(0,10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

const deleteClient = async (id: any) => {
  if (confirm('Êtes-vous sûr de vouloir supprimer ce client ?')) {
    try {
      await clientService.deleteClient(id)
      await fetchClients(pagination.value.page)
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
    }
  }
}

onMounted(() => fetchClients(1))
</script>
