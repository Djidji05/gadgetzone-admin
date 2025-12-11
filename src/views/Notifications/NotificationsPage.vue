<template>
  <div class="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
    <!-- En-tête -->
    <div class="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <h2 class="text-title-md2 font-bold text-black dark:text-white">
        Notifications
      </h2>
      <div class="flex gap-3">
        <button
          v-if="unreadCount > 0"
          @click="markAllAsRead"
          class="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-center font-medium text-white hover:bg-opacity-90 transition"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          Tout marquer comme lu
        </button>
      </div>
    </div>

    <!-- Filtres -->
    <div class="mb-6 rounded-sm border border-stroke bg-white p-4 shadow-default dark:border-strokedark dark:bg-boxdark">
      <div class="flex flex-wrap gap-4">
        <div>
          <label class="mb-2 block text-sm font-medium text-black dark:text-white">
            Statut
          </label>
          <select
            v-model="filters.status"
            class="w-full rounded border border-stroke bg-gray px-4 py-2 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
          >
            <option value="">Tous</option>
            <option value="unread">Non lues</option>
            <option value="read">Lues</option>
          </select>
        </div>

        <div>
          <label class="mb-2 block text-sm font-medium text-black dark:text-white">
            Type
          </label>
          <select
            v-model="filters.type"
            class="w-full rounded border border-stroke bg-gray px-4 py-2 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
          >
            <option value="">Tous</option>
            <option value="info">Info</option>
            <option value="success">Succès</option>
            <option value="warning">Avertissement</option>
            <option value="error">Erreur</option>
            <option value="order">Commande</option>
            <option value="project">Projet</option>
          </select>
        </div>

        <div class="flex items-end">
          <button
            @click="resetFilters"
            class="rounded border border-stroke bg-gray px-4 py-2 text-black hover:bg-opacity-90 dark:border-strokedark dark:bg-meta-4 dark:text-white"
          >
            Réinitialiser
          </button>
        </div>
      </div>
    </div>

    <!-- Liste des notifications -->
    <div class="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
      <div class="px-4 py-6 md:px-6 xl:px-7.5">
        <h4 class="text-xl font-bold text-black dark:text-white">
          {{ filteredNotifications.length }} notification(s)
          <span v-if="unreadCount > 0" class="text-sm font-normal text-gray-500">
            ({{ unreadCount }} non lue(s))
          </span>
        </h4>
      </div>

      <div v-if="loading" class="p-10 text-center">
        <div class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
        <p class="mt-4 text-gray-500 dark:text-gray-400">Chargement...</p>
      </div>

      <div v-else-if="filteredNotifications.length === 0" class="p-10 text-center text-gray-500 dark:text-gray-400">
        <svg class="mx-auto h-16 w-16 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        <p class="mt-4">Aucune notification</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full table-auto">
          <thead>
            <tr class="bg-gray-2 text-left dark:bg-meta-4">
              <th class="px-4 py-4 font-medium text-black dark:text-white">
                Type
              </th>
              <th class="px-4 py-4 font-medium text-black dark:text-white">
                Notification
              </th>
              <th class="px-4 py-4 font-medium text-black dark:text-white">
                Date
              </th>
              <th class="px-4 py-4 font-medium text-black dark:text-white">
                Statut
              </th>
              <th class="px-4 py-4 font-medium text-black dark:text-white">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="notification in filteredNotifications"
              :key="notification.id"
              class="border-b border-stroke dark:border-strokedark"
              :class="{ 'bg-blue-50 dark:bg-blue-900/10': notification.status === 'unread' }"
            >
              <td class="px-4 py-5">
                <span
                  class="inline-flex rounded-full px-3 py-1 text-sm font-medium capitalize"
                  :class="getTypeClass(notification.type)"
                >
                  {{ notification.type }}
                </span>
              </td>
              <td class="px-4 py-5">
                <h5 class="font-medium text-black dark:text-white">
                  {{ notification.title }}
                </h5>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  {{ notification.message }}
                </p>
              </td>
              <td class="px-4 py-5">
                <p class="text-sm text-black dark:text-white">
                  {{ formatDate(notification.created_at) }}
                </p>
              </td>
              <td class="px-4 py-5">
                <span
                  class="inline-flex rounded-full px-3 py-1 text-sm font-medium"
                  :class="notification.status === 'unread' ? 'bg-warning bg-opacity-10 text-warning' : 'bg-success bg-opacity-10 text-success'"
                >
                  {{ notification.status === 'unread' ? 'Non lue' : 'Lue' }}
                </span>
              </td>
              <td class="px-4 py-5">
                <div class="flex items-center gap-3">
                  <button
                    v-if="notification.status === 'unread'"
                    @click="markAsRead(notification)"
                    class="text-primary hover:text-primary/80 transition-colors"
                    title="Marquer comme lue"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </button>
                  <button
                    @click="deleteNotification(notification)"
                    class="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                    title="Supprimer"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
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
import { ref, computed, onMounted } from 'vue'
import { notificationService } from '@/services/api'

interface Notification {
  id: number
  type: string
  title: string
  message: string
  status: 'read' | 'unread'
  created_at: string
}

const notifications = ref<Notification[]>([])
const loading = ref(false)
const filters = ref({
  status: '',
  type: ''
})

const unreadCount = computed(() => 
  notifications.value.filter(n => n.status === 'unread').length
)

const filteredNotifications = computed(() => {
  let result = notifications.value

  if (filters.value.status) {
    result = result.filter(n => n.status === filters.value.status)
  }

  if (filters.value.type) {
    result = result.filter(n => n.type === filters.value.type)
  }

  return result
})

const loadNotifications = async () => {
  try {
    loading.value = true
    const data = await notificationService.getAll({ limit: 100 })
    notifications.value = data.notifications || []
  } catch (error) {
    console.error('Erreur chargement notifications:', error)
  } finally {
    loading.value = false
  }
}

const markAsRead = async (notification: Notification) => {
  try {
    await notificationService.markAsRead(notification.id)
    notification.status = 'read'
  } catch (error) {
    console.error('Erreur marquage notification:', error)
  }
}

const markAllAsRead = async () => {
  if (!confirm('Marquer toutes les notifications comme lues ?')) {
    return
  }

  try {
    await notificationService.markAllAsRead()
    notifications.value.forEach(n => n.status = 'read')
  } catch (error) {
    console.error('Erreur marquage toutes notifications:', error)
  }
}

const deleteNotification = async (notification: Notification) => {
  if (!confirm('Supprimer cette notification ?')) {
    return
  }

  try {
    await notificationService.delete(notification.id)
    notifications.value = notifications.value.filter(n => n.id !== notification.id)
  } catch (error) {
    console.error('Erreur suppression notification:', error)
  }
}

const resetFilters = () => {
  filters.value.status = ''
  filters.value.type = ''
}

const getTypeClass = (type: string) => {
  const classes: Record<string, string> = {
    info: 'bg-primary bg-opacity-10 text-primary',
    success: 'bg-success bg-opacity-10 text-success',
    warning: 'bg-warning bg-opacity-10 text-warning',
    error: 'bg-danger bg-opacity-10 text-danger',
    order: 'bg-blue-500 bg-opacity-10 text-blue-500',
    project: 'bg-purple-500 bg-opacity-10 text-purple-500'
  }
  return classes[type] || classes.info
}

const formatDate = (dateString: string) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleString('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short'
  })
}

onMounted(() => {
  loadNotifications()
})
</script>
