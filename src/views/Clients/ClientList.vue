<template>
  <div class="p-6">
    <div class="mb-6 flex items-center justify-between">
      <h1 class="text-2xl font-semibold text-gray-900 dark:text-white">Clients</h1>
      <button
        v-if="authStore.isAdmin"
        @click="$router.push('/admin/clients/create')"
        class="btn btn-primary"
      >
        Ajouter un client
      </button>
    </div>
    
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div class="mb-4">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Rechercher un client..."
          class="w-full px-4 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600"
        />
      </div>
      
      <div v-if="isLoading" class="text-center py-8">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p class="mt-2 text-gray-600 dark:text-gray-400">Chargement...</p>
      </div>
      
      <div v-else-if="clients.length === 0" class="text-center py-8">
        <p class="text-gray-600 dark:text-gray-400">Aucun client trouvé</p>
      </div>
      
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
            <tr v-for="client in filteredClients" :key="client.id" class="border-b dark:border-gray-700">
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
                <button
                  @click="viewClient(client.id)"
                  class="text-blue-600 hover:text-blue-800 mr-2"
                >
                  Voir
                </button>
                <button
                  v-if="authStore.isAdmin"
                  @click="editClient(client.id)"
                  class="text-green-600 hover:text-green-800 mr-2"
                >
                  Modifier
                </button>
                <button
                  v-if="authStore.isAdmin && client.role !== 'admin'"
                  @click="deleteClient(client.id)"
                  class="text-red-600 hover:text-red-800"
                >
                  Supprimer
                </button>
              </td>
            </tr>
          </tbody>
        </table>
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

const clients = ref([])
const isLoading = ref(true)
const searchQuery = ref('')

const filteredClients = computed(() => {
  if (!searchQuery.value) return clients.value
  return clients.value.filter(client =>
    client.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    client.email.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('fr-FR')
}

const getRoleClass = (role) => {
  const classes = {
    admin: 'bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs',
    user: 'bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs'
  }
  return classes[role] || 'bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs'
}

const getRoleText = (role) => {
  const texts = {
    admin: 'Admin',
    user: 'Client'
  }
  return texts[role] || role
}

const fetchClients = async () => {
  try {
    isLoading.value = true
    const response = await clientService.getClients()
    clients.value = response.clients || []
  } catch (error) {
    console.error('Erreur lors du chargement des clients:', error)
  } finally {
    isLoading.value = false
  }
}

const viewClient = (id) => {
  router.push(`/admin/clients/${id}`)
}

const editClient = (id) => {
  router.push(`/admin/clients/${id}/edit`)
}

const deleteClient = async (id) => {
  if (confirm('Êtes-vous sûr de vouloir supprimer ce client ?')) {
    try {
      await clientService.deleteClient(id)
      await fetchClients()
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
    }
  }
}

onMounted(() => {
  fetchClients()
})
</script>
