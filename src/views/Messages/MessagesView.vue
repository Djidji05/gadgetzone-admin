<script setup lang="ts">
import { ref, onMounted, nextTick, computed, watch } from 'vue'
import { debounce } from '@/utils/debounce'
import { useRoute } from 'vue-router'
import { messageService, authService, userService, disputeService } from '@/services/api'
import { useAuthStore } from '@/stores/auth'
import { useUIStore } from '@/stores/ui'
import { useTheme } from '@/components/layout/ThemeProvider.vue'

const route = useRoute()
const authStore = useAuthStore()
const uiStore = useUIStore()
const { isDarkMode } = useTheme()

type ViewMode = 'messages' | 'disputes'
const viewMode = ref<ViewMode>(route.query.view === 'disputes' ? 'disputes' : 'messages')
const disputes = ref<any[]>([])

interface Message {
  id: number
  conversationId?: number
  senderId: number
  content: string
  createdAt: string
  isRead: boolean
}

interface Participant {
  id: number
  name: string
  role: string
  logoUrl?: string
}

interface Conversation {
  id: number
  otherParticipant: Participant
  lastMessage: string
  lastMessageAt: string
  unreadCount?: number
  isDispute?: boolean
  status?: string
  orderId?: number
}

const conversations = ref<Conversation[]>([])
const selectedConversation = ref<any>(null)
const messages = ref<Message[]>([])
const newMessage = ref('')
const isLoadingConversations = ref(false)
const isLoadingMessages = ref(false)
const messagesContainer = ref<HTMLElement | null>(null)
const showNewChatModal = ref(false)
const userSearchQuery = ref('')
const usersList = ref<Participant[]>([])
const isSearchingUsers = ref(false)
const searchQuery = ref('')
const filteredConversations = computed(() => {
  if (!searchQuery.value) return conversations.value
  return conversations.value.filter(c => 
    c.otherParticipant.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

const fetchConversations = async () => {
  isLoadingConversations.value = true
  try {
    conversations.value = await messageService.getConversations()
  } catch (error) {
    console.error('Error fetching conversations:', error)
  } finally {
    isLoadingConversations.value = false
  }
}

const fetchDisputes = async () => {
  isLoadingConversations.value = true
  try {
    const role = authStore.userRole || authStore.user?.role
    const data = role === 'admin' 
      ? await disputeService.getAll() 
      : await disputeService.getSellerDisputes()
    
    disputes.value = data.map((d: any) => ({
      id: d.id,
      otherParticipant: {
        id: d.customer?.id || d.user_id,
        name: d.customer?.name || `Client #${d.user_id}`,
        role: 'customer'
      },
      lastMessage: d.messages?.[d.messages.length - 1]?.message || d.description,
      lastMessageAt: d.messages?.[d.messages.length - 1]?.created_at || d.created_at,
      status: d.status,
      orderId: d.order_id,
      isDispute: true
    }))
  } catch (error) {
    console.error('Error fetching disputes:', error)
  } finally {
    isLoadingConversations.value = false
  }
}

const selectConversation = async (conversation: any) => {
  selectedConversation.value = conversation
  isLoadingMessages.value = true
  try {
    if (conversation.isDispute) {
      const data = await disputeService.getById(conversation.id)
      messages.value = data.messages.map((m: any) => ({
        id: m.id,
        senderId: m.sender_id,
        content: m.message,
        createdAt: m.created_at,
        isRead: true
      }))
    } else {
      messages.value = await messageService.getConversationMessages(conversation.id)
    }
    await scrollToBottom()
  } catch (error) {
    console.error('Error fetching messages:', error)
  } finally {
    isLoadingMessages.value = false
  }
}

const sendMessage = async () => {
  if (!newMessage.value.trim() || !selectedConversation.value) return

  const content = newMessage.value.trim()
  const receiverId = selectedConversation.value.otherParticipant.id
  const isNewConv = selectedConversation.value.id === -1
  
  newMessage.value = ''

  try {
    let sentMessage;
    if (selectedConversation.value.isDispute) {
      sentMessage = await disputeService.sendMessage(selectedConversation.value.id, content)
      // Map dispute message to chat message format
      messages.value.push({
        id: sentMessage.id,
        senderId: sentMessage.sender_id,
        content: sentMessage.message,
        createdAt: sentMessage.created_at,
        isRead: true
      })
    } else {
      sentMessage = await messageService.sendMessage(receiverId, content)
      
      if (isNewConv) {
        // Refresh conversations to get the real ID and update list
        await fetchConversations()
        // Select the new real conversation
        const realConv = conversations.value.find(c => c.otherParticipant.id === receiverId)
        if (realConv) {
          selectedConversation.value = realConv
          await selectConversation(realConv)
        }
        return
      } else {
        messages.value.push(sentMessage)
      }
    }
    
    // Update conversation preview
    const list = viewMode.value === 'disputes' ? disputes.value : conversations.value
    const conv = list.find(c => c.id === selectedConversation.value?.id)
    if (conv) {
      conv.lastMessage = content
      conv.lastMessageAt = new Date().toISOString()
      
      // Move to top
      if (viewMode.value === 'disputes') {
        disputes.value = [conv, ...disputes.value.filter(c => c.id !== conv.id)]
      } else {
        conversations.value = [conv, ...conversations.value.filter(c => c.id !== conv.id)]
      }
    }
    await scrollToBottom()
  } catch (error) {
    uiStore.addToast('Erreur lors de l\'envoi du message', 'error')
    console.error('Error sending message:', error)
  }
}

const scrollToBottom = async () => {
  await nextTick()
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

const formatTime = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  if (date.toDateString() === now.toDateString()) return 'Aujourd\'hui'
  return date.toLocaleDateString()
}

const handleQueryParam = async () => {
  const userId = route.query.userId
  if (!userId) return

  try {
    isLoadingMessages.value = true
    // Try to find if we already have a conversation with this user
    const conv = conversations.value.find(c => c.otherParticipant.id === parseInt(userId as string))
    
    if (conv) {
      await selectConversation(conv)
    } else {
      // It will be created on the first message send, but let's dummy it for UI
      // Or we can fetch specifically for this user to get their name/logo
      const user = await authService.getUserById(parseInt(userId as string))
      
      const newConv: Conversation = {
        id: -1, // Temporary ID
        otherParticipant: {
          id: user.id,
          name: user.name,
          role: user.role,
          logoUrl: user.store?.logoUrl
        },
        lastMessage: 'Nouveau message...',
        lastMessageAt: new Date().toISOString()
      }
      
      conversations.value = [newConv, ...conversations.value]
      selectedConversation.value = newConv
      messages.value = []
    }
  } catch (error) {
    console.error('Error handling userId query param:', error)
  } finally {
    isLoadingMessages.value = false
  }
}

const searchUsers = async () => {
  if (userSearchQuery.value.length < 2) {
    usersList.value = []
    return
  }
  
  isSearchingUsers.value = true
  try {
    const users = await userService.search(userSearchQuery.value, 'seller')
    usersList.value = users.map((u: any) => ({
      id: u.id,
      name: u.store?.name || u.name,
      role: u.role,
      logoUrl: u.store?.logoUrl
    }))
  } catch (error) {
    console.error('Error searching users:', error)
  } finally {
    isSearchingUsers.value = false
  }
}

const debouncedSearchUsers = debounce(searchUsers, 300)

const openNewChatModal = () => {
  showNewChatModal.value = true
  userSearchQuery.value = ''
  searchUsers()
}

const startNewChat = async (user: Participant) => {
  showNewChatModal.value = false
  userSearchQuery.value = ''
  usersList.value = []
  
  // Check if conversation already exists
  const existing = conversations.value.find(c => c.otherParticipant.id === user.id)
  if (existing) {
    await selectConversation(existing)
  } else {
    const newConv: Conversation = {
      id: -1,
      otherParticipant: user,
      lastMessage: 'Nouveau message...',
      lastMessageAt: new Date().toISOString()
    }
    conversations.value = [newConv, ...conversations.value]
    selectedConversation.value = newConv
    messages.value = []
  }
}
onMounted(async () => {
  await fetchConversations()
  await fetchDisputes()
  await handleQueryParam()
})

watch(() => route.query.view, (newView) => {
  if (newView === 'disputes') {
    viewMode.value = 'disputes'
  } else {
    viewMode.value = 'messages'
  }
})

watch(viewMode, () => {
  selectedConversation.value = null
  messages.value = []
})

const filteredList = computed(() => {
  const list = viewMode.value === 'disputes' ? disputes.value : conversations.value
  if (!searchQuery.value) return list
  return list.filter(c => 
    c.otherParticipant.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    (c.orderId && c.orderId.toString().includes(searchQuery.value))
  )
})
</script>

<template>
  <div class="h-[calc(100vh-170px)] lg:h-[calc(100vh-130px)] flex flex-col md:flex-row bg-white dark:bg-boxdark rounded-2xl overflow-hidden shadow-default border border-stroke dark:border-strokedark">
    <!-- Contacts Sidebar -->
    <div :class="[
      'md:w-80 lg:w-96 flex flex-col border-r border-stroke dark:border-strokedark transition-all duration-300 bg-white dark:bg-boxdark',
      selectedConversation ? 'hidden md:flex' : 'flex'
    ]">
      <!-- Sidebar Header -->
      <div class="px-4 pt-4 bg-gray-50/50 dark:bg-gray-900/50 flex items-center justify-between">
        <h2 class="text-xl font-bold text-gray-900 dark:text-white">Messages</h2>
        <button 
          v-if="viewMode === 'messages'"
          @click="openNewChatModal"
          class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
        >
          <i class="fas fa-edit text-gray-500"></i>
        </button>
      </div>

      <!-- Tab Switcher -->
      <div class="px-4 py-3 bg-gray-50/50 dark:bg-gray-900/50 border-b border-stroke dark:border-strokedark">
        <div class="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
          <button 
            @click="viewMode = 'messages'"
            class="flex-1 py-1.5 text-xs font-bold rounded-lg transition-all"
            :class="viewMode === 'messages' ? 'bg-white dark:bg-gray-700 shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'"
          >
            Messages
          </button>
          <button 
            @click="viewMode = 'disputes'"
            class="flex-1 py-1.5 text-xs font-bold rounded-lg transition-all"
            :class="viewMode === 'disputes' ? 'bg-white dark:bg-gray-700 shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'"
          >
            Litiges
          </button>
        </div>
      </div>

      <!-- Search -->
      <div class="p-4">
        <div class="relative group">
          <i class="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors"></i>
          <input 
            v-model="searchQuery"
            type="text" 
            placeholder="Rechercher..." 
            class="w-full pl-11 pr-4 py-2.5 bg-gray-100 dark:bg-gray-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-600/20 transition-all outline-none"
          >
        </div>
      </div>

      <!-- Conversations List -->
      <div class="flex-1 overflow-y-auto space-y-1 p-2 custom-scrollbar">
        <div v-if="isLoadingConversations" class="flex flex-col gap-3 p-4">
          <div v-for="i in 5" :key="i" class="flex gap-3 animate-pulse">
            <div class="w-12 h-12 bg-gray-200 dark:bg-gray-800 rounded-full"></div>
            <div class="flex-1 space-y-2 py-1">
              <div class="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/2"></div>
              <div class="h-3 bg-gray-200 dark:bg-gray-800 rounded w-3/4"></div>
            </div>
          </div>
        </div>

        <button 
          v-for="conv in filteredList" 
          :key="conv.id"
          @click="selectConversation(conv)"
          class="w-full flex items-center gap-4 p-3 rounded-2xl transition-all duration-200 group text-left"
          :class="selectedConversation?.id === conv.id 
            ? 'bg-blue-50 dark:bg-blue-900/20 ring-1 ring-blue-100 dark:ring-blue-800/30' 
            : 'hover:bg-gray-50 dark:hover:bg-gray-900'"
        >
          <div class="relative flex-shrink-0">
            <img 
              v-if="conv.otherParticipant.logoUrl" 
              :src="conv.otherParticipant.logoUrl" 
              class="w-10 h-10 rounded-full object-cover border-2 border-white dark:border-gray-800 shadow-sm"
              alt="Avatar"
            >
            <div v-else class="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-lg border-2 border-white dark:border-gray-800 shadow-sm">
              {{ conv.otherParticipant.name.charAt(0).toUpperCase() }}
            </div>
            <span v-if="conv.unreadCount" class="absolute -top-1 -right-1 bg-blue-600 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white dark:border-gray-800">
              {{ conv.unreadCount }}
            </span>
          </div>
          
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between mb-0.5">
              <span class="font-bold text-gray-900 dark:text-gray-100 truncate group-hover:text-blue-600 transition-colors">
                {{ viewMode === 'disputes' ? `Litige #${conv.id}` : conv.otherParticipant.name }}
              </span>
              <span class="text-[10px] font-medium text-gray-400 whitespace-nowrap">
                {{ formatTime(conv.lastMessageAt) }}
              </span>
            </div>
            
            <div v-if="viewMode === 'disputes'" class="flex items-center gap-2 mb-1">
              <span class="text-[9px] px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider"
                :class="{
                  'bg-orange-100 text-orange-600': conv.status === 'pending',
                  'bg-blue-100 text-blue-600': conv.status === 'under_review',
                  'bg-green-100 text-green-600': conv.status === 'resolved',
                  'bg-red-100 text-red-600': conv.status === 'closed'
                }">
                {{ conv.status }}
              </span>
              <span class="text-[9px] text-gray-400">Ordre #{{ conv.orderId }}</span>
            </div>

            <p class="text-xs text-gray-500 dark:text-gray-400 truncate pr-2 italic">
              {{ conv.lastMessage }}
            </p>
          </div>
        </button>

        <div v-if="!isLoadingConversations && filteredList.length === 0" class="flex flex-col items-center justify-center h-full p-8 text-center mt-10">
          <div class="w-16 h-16 bg-gray-50 dark:bg-gray-900 rounded-full flex items-center justify-center mb-4">
            <i class="far fa-comments text-gray-300 text-2xl"></i>
          </div>
          <p class="text-sm font-medium text-gray-500 dark:text-gray-400">
            {{ viewMode === 'disputes' ? 'Aucun litige en cours' : 'Aucun message' }}
          </p>
        </div>
      </div>
    </div>

    <!-- Chat Area -->
    <div :class="[
      'flex-1 flex flex-col bg-gray-50 dark:bg-gray-950 relative',
      !selectedConversation ? 'hidden md:flex' : 'flex'
    ]">
      <!-- Welcome Screen (No selection) -->
      <div v-if="!selectedConversation" class="absolute inset-0 flex flex-col items-center justify-center p-8 text-center backdrop-blur-[1px] z-20">
        <div class="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full shadow-2xl shadow-blue-500/20 flex items-center justify-center mb-6 animate-bounce-slow border border-blue-400 dark:border-blue-700">
          <i class="far fa-comments text-4xl text-white"></i>
        </div>
        <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-3 text-pretty">Messagerie Interne</h3>
        <p class="text-gray-500 dark:text-gray-400 max-w-sm leading-relaxed text-sm">
          Sélectionnez une conversation pour échanger avec vos clients et vendeurs en temps réel.
        </p>
      </div>

      <template v-else>
        <!-- Chat Header -->
        <div class="p-4 bg-white dark:bg-gray-900 border-b border-stroke dark:border-strokedark flex items-center justify-between shadow-sm z-30">
          <div class="flex items-center gap-3 lg:gap-4">
            <!-- Back Button Mobile -->
            <button @click="selectedConversation = null" class="md:hidden w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <i class="fas fa-arrow-left text-gray-500"></i>
            </button>
            <div class="relative">
              <img 
                v-if="selectedConversation.otherParticipant.logoUrl" 
                :src="selectedConversation.otherParticipant.logoUrl" 
                class="w-8 h-8 rounded-full object-cover ring-2 ring-gray-100 dark:ring-gray-800"
                alt="Avatar"
              >
              <div v-else class="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-sm">
                {{ selectedConversation.otherParticipant.name.charAt(0).toUpperCase() }}
              </div>
              <span class="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full shadow-sm"></span>
            </div>
            <div>
              <h4 class="font-bold text-gray-900 dark:text-white text-sm lg:text-base">{{ selectedConversation.otherParticipant.name }}</h4>
              <p class="text-[9px] text-green-500 font-bold uppercase tracking-wider">En ligne</p>
            </div>
          </div>
          <div class="flex items-center gap-1">
            <button class="w-9 h-9 flex items-center justify-center rounded-xl text-gray-400 hover:text-blue-600 transition-all">
              <i class="fas fa-phone"></i>
            </button>
            <button class="w-9 h-9 flex items-center justify-center rounded-xl text-gray-400 hover:text-blue-600 transition-all">
              <i class="fas fa-ellipsis-v"></i>
            </button>
          </div>
        </div>

        <!-- Messages Area -->
        <div 
          ref="messagesContainer" 
          class="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6 custom-scrollbar relative bg-gray-50 dark:bg-gray-950"
          :class="{ 'flex flex-col justify-center items-center': isLoadingMessages }"
          :style="{
            backgroundImage: isDarkMode 
              ? 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.03) 1px, transparent 0)' 
              : 'radial-gradient(circle at 2px 2px, rgba(0,0,0,0.03) 1px, transparent 0)',
            backgroundSize: '24px 24px'
          }"
        >
          <div v-if="isLoadingMessages" class="flex flex-col items-center gap-4 bg-white/80 dark:bg-gray-900/80 p-6 rounded-3xl backdrop-blur-md z-40">
            <div class="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p class="text-sm font-bold text-blue-600 uppercase tracking-widest">Chargement...</p>
          </div>

          <template v-else>
            <div v-for="(msg, index) in messages" :key="msg.id" class="flex flex-col relative z-20">
              <!-- Date Separator -->
              <div v-if="index === 0 || formatDate(messages[index-1].createdAt) !== formatDate(msg.createdAt)" class="flex justify-center my-6">
                <span class="px-4 py-1.5 bg-white dark:bg-gray-800 rounded-full text-[10px] font-bold text-gray-400 dark:text-gray-500 shadow-sm border border-stroke dark:border-strokedark uppercase tracking-widest">
                  {{ formatDate(msg.createdAt) }}
                </span>
              </div>

              <!-- Message Bubble -->
              <div 
                class="flex w-full mb-2" 
                :class="msg.senderId === authStore.user?.id ? 'justify-end' : 'justify-start'"
              >
                <div 
                  class="max-w-[85%] lg:max-w-[70%] px-5 py-3.5 rounded-3xl shadow-sm relative group transition-all"
                  :class="msg.senderId === authStore.user?.id 
                    ? 'bg-blue-600 text-white rounded-tr-none' 
                    : 'bg-white dark:bg-gray-800 border border-stroke dark:border-strokedark text-gray-900 dark:text-gray-100 rounded-tl-none'"
                >
                  <p class="text-sm leading-relaxed">{{ msg.content }}</p>
                  <div 
                    class="flex items-center gap-1.5 mt-1.5 justify-end"
                    :class="msg.senderId === authStore.user?.id ? 'text-blue-100' : 'text-gray-400'"
                  >
                    <span class="text-[9px] font-bold opacity-70">{{ formatTime(msg.createdAt) }}</span>
                    <i v-if="msg.senderId === authStore.user?.id" class="fas text-[10px]" :class="msg.isRead ? 'fa-check-double' : 'fa-check'"></i>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </div>

        <!-- Input Area -->
        <div class="p-4 bg-white dark:bg-gray-900 border-t border-stroke dark:border-strokedark shadow-lg">
          <form @submit.prevent="sendMessage" class="flex items-end gap-3 max-w-6xl mx-auto">
            <div class="flex gap-1">
              <button type="button" class="w-11 h-11 flex items-center justify-center rounded-xl text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all">
                <i class="fas fa-smile"></i>
              </button>
              <button type="button" class="w-11 h-11 flex items-center justify-center rounded-xl text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all">
                <i class="fas fa-paperclip"></i>
              </button>
            </div>
            
            <div class="flex-1 relative">
              <textarea 
                v-model="newMessage"
                placeholder="Votre message..."
                class="w-full pl-4 pr-12 py-3 bg-gray-100 dark:bg-gray-800 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-600/20 transition-all outline-none resize-none max-h-32"
                rows="1"
                @keydown.enter.prevent="sendMessage"
              ></textarea>
              <button type="button" class="absolute right-3 bottom-3 text-gray-400 hover:text-blue-600 transition-colors">
                <i class="fas fa-microphone"></i>
              </button>
            </div>

            <button 
              type="submit" 
              class="w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-2xl bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/30 transform active:scale-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="!newMessage.trim()"
            >
              <i class="fas fa-paper-plane"></i>
            </button>
          </form>
        </div>
      </template>
    </div>

    <!-- New Chat Modal -->
    <div v-if="showNewChatModal" class="fixed inset-0 z-[99999] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="showNewChatModal = false"></div>
      <div class="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 border border-gray-100 dark:border-gray-800">
        <div class="p-6 border-b border-stroke dark:border-strokedark flex items-center justify-between bg-gray-50/50 dark:bg-gray-900/50">
          <h3 class="text-xl font-bold text-gray-900 dark:text-white">Nouveau message</h3>
          <button @click="showNewChatModal = false" class="text-gray-400 hover:text-gray-600 transition-colors">
            <i class="fas fa-times text-xl"></i>
          </button>
        </div>
        
        <div class="p-6">
          <div class="relative mb-6">
            <i class="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
            <input 
              v-model="userSearchQuery"
              @input="debouncedSearchUsers"
              type="text" 
              placeholder="Rechercher un vendeur par nom ou boutique..." 
              class="w-full pl-11 pr-4 py-3 bg-gray-100 dark:bg-gray-800 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-600 transition-all outline-none"
              autoFocus
            >
          </div>
          
          <div class="max-h-[400px] overflow-y-auto custom-scrollbar space-y-2">
            <div v-if="isSearchingUsers" class="flex flex-col items-center py-10 opacity-50">
              <div class="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-3"></div>
              <p class="text-xs font-bold uppercase tracking-widest text-gray-400">Recherche...</p>
            </div>
            
            <template v-else-if="usersList.length > 0">
              <button 
                v-for="user in usersList" 
                :key="user.id"
                @click="startNewChat(user)"
                class="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-900 transition-all text-left"
              >
                <div class="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 font-bold overflow-hidden">
                  <img v-if="user.logoUrl" :src="user.logoUrl" class="w-full h-full object-cover" />
                  <span class="text-xs">{{ user.name.charAt(0).toUpperCase() }}</span>
                </div>
                <div class="flex-1">
                  <h4 class="font-bold text-gray-900 dark:text-gray-100">{{ user.name }}</h4>
                  <p class="text-xs text-gray-500 uppercase tracking-widest font-medium">{{ user.role }}</p>
                </div>
                <i class="fas fa-chevron-right text-gray-300 text-xs"></i>
              </button>
            </template>
            
            <div v-else-if="userSearchQuery.length >= 2" class="py-20 text-center text-gray-400">
              <i class="fas fa-user-slash text-4xl mb-4 opacity-20"></i>
              <p class="text-sm">Aucun vendeur trouvé</p>
            </div>
            
            <div v-else class="py-20 text-center text-gray-400">
              <i class="fas fa-search text-4xl mb-4 opacity-20"></i>
              <p class="text-sm">Commencez par rechercher un vendeur</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #E2E8F0;
  border-radius: 10px;
}
.dark .custom-scrollbar::-webkit-scrollbar-thumb {
  background: #333A48;
}

@keyframes bounce-slow {
  0%, 100% { transform: translateY(-5%); animation-timing-function: cubic-bezier(0.8,0,1,1); }
  50% { transform: none; animation-timing-function: cubic-bezier(0,0,0.2,1); }
}
.animate-bounce-slow {
  animation: bounce-slow 3s infinite;
}
</style>
