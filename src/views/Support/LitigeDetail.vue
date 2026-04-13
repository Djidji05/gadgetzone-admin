<template>
  <div class="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
    <!-- Breadcrumb -->
    <div class="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <h2 class="text-title-md2 font-bold text-black dark:text-white">
        Litige #{{ $route.params.id }}
      </h2>
      <nav>
        <ol class="flex items-center gap-2">
          <li>
            <router-link class="font-medium" to="/support/disputes">Litiges /</router-link>
          </li>
          <li class="font-medium text-primary">Détails</li>
        </ol>
      </nav>
    </div>

    <div v-if="loading" class="flex h-60 items-center justify-center">
      <div class="h-16 w-16 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
    </div>

    <div v-else-if="!dispute" class="rounded-sm border border-stroke bg-white p-10 text-center shadow-default dark:border-strokedark dark:bg-boxdark">
      <p class="text-gray-500">Litige non trouvé ou accès non autorisé.</p>
    </div>

    <div v-else class="grid grid-cols-1 gap-6 xl:grid-cols-3">
      <!-- Left Column: Dispute & Order Info -->
      <div class="xl:col-span-1 space-y-6">
        <!-- Dispute Info -->
        <div class="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <div class="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
            <h3 class="font-medium text-black dark:text-white">Informations du litige</h3>
          </div>
          <div class="p-6.5 space-y-4">
            <div>
              <p class="text-xs font-semibold uppercase text-gray-500 mb-1">Statut actuel</p>
              <div class="flex items-center space-x-3">
                <span
                  :class="[
                    'inline-flex rounded-full py-1 px-3 text-sm font-medium bg-opacity-10',
                    statusClasses[dispute.status] || 'bg-gray-500 text-gray-500'
                  ]"
                >
                  {{ formatStatus(dispute.status) }}
                </span>
                
                <!-- Admin Status Update -->
                <select 
                  v-if="authStore.isAdmin"
                  @change="updateStatus"
                  v-model="newStatus"
                  class="text-xs border border-stroke rounded px-2 py-1 outline-none focus:border-primary dark:border-strokedark dark:bg-meta-4"
                >
                  <option value="pending">En attente</option>
                  <option value="under_review">En examen</option>
                  <option value="resolved">Résolu</option>
                  <option value="closed">Fermé</option>
                </select>
              </div>
            </div>

            <div>
              <p class="text-xs font-semibold uppercase text-gray-500 mb-1">Raison</p>
              <p class="text-black dark:text-white font-medium">{{ formatReason(dispute.reason) }}</p>
            </div>

            <div>
              <p class="text-xs font-semibold uppercase text-gray-500 mb-1">Description</p>
              <p class="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{{ dispute.description }}</p>
            </div>

            <div>
              <p class="text-xs font-semibold uppercase text-gray-500 mb-1">Date d'ouverture</p>
              <p class="text-black dark:text-white">{{ formatDate(dispute.created_at) }}</p>
            </div>
          </div>
        </div>

        <!-- Order Info -->
        <div class="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <div class="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
            <h3 class="font-medium text-black dark:text-white">Commande associée</h3>
          </div>
          <div class="p-6.5 space-y-4">
            <div class="flex justify-between items-center">
              <div>
                <p class="text-xs font-semibold uppercase text-gray-500 mb-1">Commande #{{ dispute.order_id }}</p>
                <router-link :to="`/commandes/${dispute.order_id}`" class="text-primary hover:underline font-medium">Voir la commande</router-link>
              </div>
              <div class="text-right">
                <p class="text-xs font-semibold uppercase text-gray-500 mb-1">Montant Total</p>
                <p class="text-black dark:text-white font-bold">{{ dispute.Order?.total_amount }} HTG</p>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4 mt-2 text-[11px] border-b border-stroke pb-3 dark:border-strokedark">
              <div>
                <p class="font-semibold text-gray-500 uppercase">Passée le</p>
                <p class="text-black dark:text-white">{{ formatDate(dispute.Order?.created_at, true) }}</p>
              </div>
              <div v-if="dispute.Order?.delivered_at">
                <p class="font-semibold text-gray-500 uppercase">Livrée le</p>
                <p class="text-black dark:text-white">{{ formatDate(dispute.Order?.delivered_at, true) }}</p>
              </div>
            </div>

            <div class="mt-4">
              <p class="text-xs font-semibold uppercase text-gray-500 mb-2">Articles concernés</p>
              <div v-for="item in dispute.Order?.items" :key="item.id" class="flex items-center space-x-3 mb-3 pb-3 border-b border-stroke last:border-0 dark:border-strokedark">
                <div class="h-10 w-10 flex-shrink-0">
                  <img :src="item.product?.image || '/placeholder.jpg'" alt="Product" class="h-full w-full rounded object-cover" />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-black dark:text-white truncate">{{ item.product?.name }}</p>
                  <p class="text-xs text-gray-500">{{ item.quantity }} x {{ item.price }} HTG</p>
                  <p v-if="authStore.isAdmin && item.product?.store" class="text-[10px] text-primary font-bold mt-1 uppercase">
                    Vendeur: {{ item.product.store.name }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Customer Info -->
        <div class="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <div class="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
            <h3 class="font-medium text-black dark:text-white">Client</h3>
          </div>
          <div class="p-6.5">
            <div class="flex items-center space-x-4">
              <div class="h-12 w-12 rounded-full bg-primary flex items-center justify-center text-white text-xl font-bold">
                {{ dispute.customer?.name?.charAt(0) }}
              </div>
              <div>
                <p class="font-bold text-black dark:text-white">{{ dispute.customer?.name }}</p>
                <p class="text-sm text-gray-500">{{ dispute.customer?.email }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column: Conversation -->
      <div class="xl:col-span-2 flex flex-col rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div class="border-b border-stroke py-4 px-6.5 dark:border-strokedark bg-gray-50 dark:bg-meta-4/20">
          <h3 class="font-medium text-black dark:text-white">Fil de discussion</h3>
        </div>

        <!-- Chat History -->
        <div class="flex-1 overflow-y-auto p-6.5 space-y-4 min-h-[300px] max-h-[500px]" ref="chatContainer">
          <div v-for="msg in dispute.messages" :key="msg.id" 
               :class="['flex', msg.sender_id === authStore.user?.id ? 'justify-end' : 'justify-start']">
            <div :class="[
                  'max-w-[80%] rounded-lg p-3 text-sm shadow-sm',
                  msg.sender_id === authStore.user?.id 
                    ? '!bg-[#465fff] !text-white ml-auto' 
                    : '!bg-[#f3f4f6] !text-[#111827] border border-stroke dark:border-strokedark'
                ]">
              <div class="flex items-center justify-between mb-1 gap-4 border-b border-white/20 pb-1 mb-2">
                <span class="text-xs font-bold">{{ msg.sender?.name }}</span>
                <span class="text-[10px] opacity-70">{{ formatDate(msg.created_at, true) }}</span>
              </div>
              <p class="whitespace-pre-wrap">{{ msg.message }}</p>
            </div>
          </div>
          <div v-if="!dispute.messages || dispute.messages.length === 0" class="text-center py-10 text-gray-500 italic">
            Aucun message. Commencez la discussion ci-dessous.
          </div>
        </div>

        <!-- Chat Input -->
        <div class="border-t border-stroke p-6.5 dark:border-strokedark bg-gray-50/50 dark:bg-meta-4/10">
          <div class="flex flex-col gap-3">
            <textarea
              v-model="newMessage"
              placeholder="Écrivez votre message ici..."
              rows="3"
              class="w-full rounded-lg border-[1.5px] border-stroke bg-white py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary shadow-sm"
            ></textarea>
            <div class="flex justify-end items-center gap-4">
              <span class="text-xs text-gray-500">{{ newMessage.length }} caractères</span>
              <button
                @click="sendMessage"
                :disabled="!newMessage.trim() || sending"
                class="inline-flex items-center justify-center rounded-md !bg-[#465fff] !text-white py-3 px-10 text-center font-medium hover:bg-opacity-90 disabled:opacity-50 transition-all shadow-md active:scale-95"
              >
                <span v-if="sending" class="flex items-center">
                  <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Envoi en cours...
                </span>
                <span v-else>Envoyer le message</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { disputeService } from '@/services/api'
import { useAuthStore } from '@/stores/auth'
import { useUIStore } from '@/stores/ui'

const route = useRoute()
const authStore = useAuthStore()
const uiStore = useUIStore()

const dispute = ref<any>(null)
const loading = ref(true)
const sending = ref(false)
const newMessage = ref('')
const newStatus = ref('')
const chatContainer = ref<HTMLElement | null>(null)

const statusClasses: Record<string, string> = {
  pending: 'bg-warning text-warning',
  under_review: 'bg-primary text-primary',
  resolved: 'bg-success text-success',
  closed: 'bg-gray-500 text-gray-500'
}

const loadDispute = async () => {
  try {
    loading.value = true
    const data = await disputeService.getById(route.params.id as string)
    dispute.value = data
    newStatus.value = data.status
    await scrollToBottom()
  } catch (error) {
    console.error('Erreur chargement litige:', error)
    uiStore.addToast('Erreur lors du chargement du litige', 'error')
  } finally {
    loading.value = false
  }
}

const sendMessage = async () => {
  if (!newMessage.value.trim() || sending.value) return
  
  try {
    sending.value = true
    await disputeService.sendMessage(dispute.value.id, newMessage.value.trim())
    newMessage.value = ''
    // Reload messages
    const data = await disputeService.getById(dispute.value.id)
    dispute.value.messages = data.messages
    await scrollToBottom()
    uiStore.addToast('Message envoyé', 'success')
  } catch (error) {
    console.error('Erreur envoi message:', error)
    uiStore.addToast('Erreur lors de l\'envoi du message', 'error')
  } finally {
    sending.value = false
  }
}

const updateStatus = async () => {
  try {
    await disputeService.updateStatus(dispute.value.id, newStatus.value)
    dispute.value.status = newStatus.value
    uiStore.addToast('Statut mis à jour', 'success')
  } catch (error) {
    console.error('Erreur mise à jour statut:', error)
    uiStore.addToast('Erreur lors de la mise à jour', 'error')
    newStatus.value = dispute.value.status // Revert
  }
}

const scrollToBottom = async () => {
  await nextTick()
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight
  }
}

const formatReason = (reason: string) => {
  const reasons: Record<string, string> = {
    not_received: 'Non reçu',
    damaged: 'Endommagé',
    wrong_item: 'Mauvais article',
    other: 'Autre'
  }
  return reasons[reason] || reason
}

const formatStatus = (status: string) => {
  const statuses: Record<string, string> = {
    pending: 'En attente',
    under_review: 'En examen',
    resolved: 'Résolu',
    closed: 'Fermé'
  }
  return statuses[status] || status
}

const formatDate = (date: string, withTime = false) => {
  const options: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }
  if (withTime) {
    options.hour = '2-digit'
    options.minute = '2-digit'
  }
  return new Date(date).toLocaleString('fr-FR', options)
}

onMounted(() => {
  loadDispute()
})
</script>

<style scoped>
.chat-container {
  scrollbar-width: thin;
  scrollbar-color: #E2E8F0 transparent;
}
.chat-container::-webkit-scrollbar {
  width: 6px;
}
.chat-container::-webkit-scrollbar-thumb {
  background-color: #E2E8F0;
  border-radius: 10px;
}
</style>
