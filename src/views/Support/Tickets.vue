<template>
  <div class="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
    <h2 class="mb-6 text-title-md2 font-bold text-black dark:text-white">Support — Tickets</h2>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 gap-6 lg:grid-cols-3 mb-6">
      <div class="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
        <div class="flex items-center justify-between">
          <div>
            <h4 class="text-title-md font-bold text-black dark:text-white">
              {{ isLoading ? '—' : stats.open }}
            </h4>
            <span class="text-sm text-gray-500 dark:text-gray-400">Tickets ouverts</span>
          </div>
          <div class="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-meta-2">
            <svg class="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"/>
            </svg>
          </div>
        </div>
      </div>

      <div class="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
        <div class="flex items-center justify-between">
          <div>
            <h4 class="text-title-md font-bold text-black dark:text-white">
              {{ isLoading ? '—' : (stats.avgResponseHours > 0 ? stats.avgResponseHours + 'h' : 'N/A') }}
            </h4>
            <span class="text-sm text-gray-500 dark:text-gray-400">Temps de réponse moyen</span>
          </div>
          <div class="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-meta-2">
            <svg class="w-6 h-6 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
        </div>
      </div>

      <div class="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
        <div class="flex items-center justify-between">
          <div>
            <h4 class="text-title-md font-bold text-black dark:text-white">
              {{ isLoading ? '—' : (stats.total > 0 ? Math.round((stats.closed / stats.total) * 100) + '%' : 'N/A') }}
            </h4>
            <span class="text-sm text-gray-500 dark:text-gray-400">Taux de résolution</span>
          </div>
          <div class="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-meta-2">
            <svg class="w-6 h-6 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="mb-4 flex flex-wrap items-center gap-2">
      <button
        v-for="f in statusFilters"
        :key="f.value"
        @click="selectedStatus = f.value; loadTickets()"
        :class="[
          'px-4 py-2 rounded-lg text-sm font-medium transition-all',
          selectedStatus === f.value
            ? 'bg-primary text-white'
            : 'bg-white dark:bg-boxdark border border-stroke dark:border-strokedark text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
        ]"
      >
        {{ f.label }}
      </button>
    </div>

    <!-- Tickets Table -->
    <div class="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
      <div class="px-4 py-6 md:px-6 xl:px-7.5 flex justify-between items-center">
        <h4 class="text-xl font-bold text-black dark:text-white">Tickets récents</h4>
        <span class="text-sm text-gray-500 dark:text-gray-400">{{ total }} ticket(s)</span>
      </div>

      <!-- Loading -->
      <div v-if="isLoading" class="flex justify-center py-16">
        <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>

      <!-- Empty -->
      <div v-else-if="tickets.length === 0" class="p-10 text-center text-gray-500 dark:text-gray-400">
        <svg class="mx-auto h-16 w-16 text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"/>
        </svg>
        <p>Aucun ticket pour le moment</p>
      </div>

      <!-- Table -->
      <div v-else class="overflow-x-auto">
        <table class="w-full table-auto">
          <thead>
            <tr class="bg-gray-2 text-left dark:bg-meta-4">
              <th class="px-4 py-4 font-medium text-black dark:text-white">#</th>
              <th class="px-4 py-4 font-medium text-black dark:text-white">Sujet</th>
              <th class="px-4 py-4 font-medium text-black dark:text-white">Client</th>
              <th class="px-4 py-4 font-medium text-black dark:text-white">Priorité</th>
              <th class="px-4 py-4 font-medium text-black dark:text-white">Statut</th>
              <th class="px-4 py-4 font-medium text-black dark:text-white">Date</th>
              <th class="px-4 py-4 font-medium text-black dark:text-white">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="ticket in tickets"
              :key="ticket.id"
              class="border-b border-stroke dark:border-strokedark hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
            >
              <td class="px-4 py-4 text-sm text-gray-500 dark:text-gray-400">#{{ ticket.id }}</td>
              <td class="px-4 py-4">
                <p class="font-medium text-black dark:text-white">{{ ticket.subject }}</p>
              </td>
              <td class="px-4 py-4">
                <p class="text-sm text-black dark:text-white">{{ ticket.user_name || 'Inconnu' }}</p>
                <p class="text-xs text-gray-500 dark:text-gray-400">{{ ticket.user_email }}</p>
              </td>
              <td class="px-4 py-4">
                <span
                  class="inline-flex rounded-full px-3 py-1 text-xs font-medium"
                  :class="priorityClass(ticket.priority)"
                >
                  {{ ticket.priority || 'normal' }}
                </span>
              </td>
              <td class="px-4 py-4">
                <span
                  class="inline-flex rounded-full px-3 py-1 text-xs font-medium"
                  :class="statusClass(ticket.status)"
                >
                  {{ statusLabel(ticket.status) }}
                </span>
              </td>
              <td class="px-4 py-4 text-sm text-gray-500 dark:text-gray-400">
                {{ formatDate(ticket.created_at) }}
              </td>
              <td class="px-4 py-4">
                <div class="flex items-center gap-2">
                  <button
                    v-if="ticket.status === 'open'"
                    @click="changeStatus(ticket, 'in_progress')"
                    class="text-xs px-2 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                    title="Prendre en charge"
                  >
                    En cours
                  </button>
                  <button
                    v-if="ticket.status !== 'closed'"
                    @click="changeStatus(ticket, 'closed')"
                    class="text-xs px-2 py-1 bg-green-50 text-green-600 hover:bg-green-100 rounded transition-colors"
                    title="Fermer le ticket"
                  >
                    Fermer
                  </button>
                  <button
                    v-if="ticket.status === 'closed'"
                    @click="changeStatus(ticket, 'open')"
                    class="text-xs px-2 py-1 bg-gray-50 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                    title="Réouvrir"
                  >
                    Réouvrir
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ticketService } from '@/services/api'
import { useUIStore } from '@/stores/ui'

const uiStore = useUIStore()

interface TicketStats {
  open: number
  inProgress: number
  closed: number
  total: number
  avgResponseHours: number
}

interface Ticket {
  id: number
  subject: string
  status: 'open' | 'in_progress' | 'closed'
  priority: string
  created_at: string
  user_name: string
  user_email: string
}

const tickets = ref<Ticket[]>([])
const stats = ref<TicketStats>({ open: 0, inProgress: 0, closed: 0, total: 0, avgResponseHours: 0 })
const isLoading = ref(true)
const total = ref(0)
const selectedStatus = ref('')

const statusFilters = [
  { value: '', label: 'Tous' },
  { value: 'open', label: 'Ouverts' },
  { value: 'in_progress', label: 'En cours' },
  { value: 'closed', label: 'Fermés' }
]

const loadTickets = async () => {
  try {
    isLoading.value = true
    const params = selectedStatus.value ? { status: selectedStatus.value } : {}
    const data = await ticketService.getAll(params)
    tickets.value = data.tickets || []
    total.value = data.total || 0
  } catch (error) {
    console.error('Erreur chargement tickets:', error)
    uiStore.addToast('Erreur lors du chargement des tickets', 'error')
  } finally {
    isLoading.value = false
  }
}

const loadStats = async () => {
  try {
    stats.value = await ticketService.getStats()
  } catch (error) {
    console.error('Erreur stats tickets:', error)
  }
}

const changeStatus = async (ticket: Ticket, newStatus: 'open' | 'in_progress' | 'closed') => {
  try {
    await ticketService.updateStatus(ticket.id, newStatus)
    ticket.status = newStatus
    uiStore.addToast('Statut du ticket mis à jour', 'success')
    // Refresh stats
    await loadStats()
  } catch (error) {
    console.error('Erreur mise à jour ticket:', error)
    uiStore.addToast('Erreur lors de la mise à jour', 'error')
  }
}

const statusLabel = (status: string) => {
  const labels: Record<string, string> = {
    open: 'Ouvert',
    in_progress: 'En cours',
    closed: 'Fermé'
  }
  return labels[status] || status
}

const statusClass = (status: string) => {
  const classes: Record<string, string> = {
    open: 'bg-warning bg-opacity-10 text-warning',
    in_progress: 'bg-primary bg-opacity-10 text-primary',
    closed: 'bg-success bg-opacity-10 text-success'
  }
  return classes[status] || 'bg-gray-100 text-gray-600'
}

const priorityClass = (priority: string) => {
  const classes: Record<string, string> = {
    high: 'bg-danger bg-opacity-10 text-danger',
    urgent: 'bg-red-100 text-red-700',
    normal: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
    low: 'bg-blue-50 text-blue-500'
  }
  return classes[priority] || classes.normal
}

const formatDate = (dateString: string) => {
  if (!dateString) return '—'
  return new Date(dateString).toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(async () => {
  await Promise.all([loadTickets(), loadStats()])
})
</script>
