<template>
  <div class="hidden lg:block relative" ref="searchContainer">
    <form @submit.prevent="handleSearchSubmit">
      <div class="relative">
        <button type="submit" class="absolute -translate-y-1/2 left-4 top-1/2">
          <Search class="w-5 h-5 text-gray-500 dark:text-gray-400" />
        </button>
        <input
          ref="searchInput"
          type="text"
          v-model="query"
          placeholder="Rechercher (Client, Commande, Produit...)"
          class="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-200 bg-transparent py-2 pl-12 pr-14 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-900 dark:bg-white/[0.03] dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 xl:w-[430px]"
          @input="handleInput"
          @keydown.esc="closeSearch"
          @keydown.down="navigateResults(1)"
          @keydown.up="navigateResults(-1)"
          @keydown.enter="selectHighlighted"
        />

        <div
          class="absolute right-2 top-1/2 inline-flex -translate-y-1/2 items-center gap-1 rounded-lg border border-gray-200 bg-gray-50 px-[7px] py-[4px] text-xs -tracking-[0.2px] text-gray-500 dark:border-gray-800 dark:bg-white/[0.03] dark:text-gray-400"
        >
          <span> {{ isMac ? '⌘' : 'Ctrl' }} </span>
          <span> K </span>
        </div>
      </div>
    </form>

    <!-- Results Dropdown -->
    <div
      v-if="showDropdown && (hasResults || isLoading)"
      class="absolute top-full left-0 mt-2 w-full xl:w-[430px] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-xl z-[9999] overflow-hidden max-h-[450px] overflow-y-auto custom-scrollbar"
    >
      <div v-if="isLoading" class="p-4 text-center">
        <div class="animate-spin inline-block w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full"></div>
      </div>

      <div v-else-if="hasResults">
        <!-- Users/Clients Section -->
        <div v-if="results.users?.length" class="p-2">
          <h4 class="px-3 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">Clients / Vendeurs</h4>
          <router-link
            v-for="user in results.users"
            :key="'user-' + user.id"
            :to="`/clients/${user.id}`"
            class="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors group"
            :class="[isHighlighted('user', user.id) ? 'bg-gray-100 dark:bg-gray-800' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50']"
            @click="closeSearch"
          >
            <div class="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <UserIcon class="w-4 h-4" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{{ user.name }}</p>
              <p class="text-xs text-gray-500 truncate">{{ user.email }} • <span class="capitalize">{{ user.role }}</span></p>
            </div>
          </router-link>
        </div>

        <!-- Orders Section -->
        <div v-if="results.orders?.length" class="p-2 border-t border-gray-100 dark:border-gray-800">
          <h4 class="px-3 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">Commandes</h4>
          <router-link
            v-for="order in results.orders"
            :key="'order-' + order.id"
            :to="`/orders/${order.id}`"
            class="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors"
            :class="[isHighlighted('order', order.id) ? 'bg-gray-100 dark:bg-gray-800' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50']"
            @click="closeSearch"
          >
            <div class="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400">
              <Package class="w-4 h-4" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">Commande #{{ order.id }}</p>
              <p class="text-xs text-gray-500 truncate">{{ order.user?.name || 'Client inconnu' }} • {{ order.status }}</p>
            </div>
          </router-link>
        </div>

        <!-- Products Section -->
        <div v-if="results.products?.length" class="p-2 border-t border-gray-100 dark:border-gray-800">
          <h4 class="px-3 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">Produits</h4>
          <router-link
            v-for="product in results.products"
            :key="'product-' + product.id"
            :to="`/modifier-produit/${product.id}`"
            class="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors"
            :class="[isHighlighted('product', product.id) ? 'bg-gray-100 dark:bg-gray-800' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50']"
            @click="closeSearch"
          >
            <div class="w-8 h-8 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <img v-if="product.image_url" :src="product.image_url" class="w-full h-full object-cover" />
              <ShoppingBag v-else class="w-4 h-4 text-gray-400" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{{ product.name }}</p>
              <p class="text-xs text-gray-500 truncate">{{ product.price }} $</p>
            </div>
          </router-link>
        </div>

        <!-- Stores Section -->
        <div v-if="results.stores?.length" class="p-2 border-t border-gray-100 dark:border-gray-800">
          <h4 class="px-3 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">Boutiques</h4>
          <router-link
            v-for="store in results.stores"
            :key="'store-' + store.id"
            :to="`/clients/${store.userId}`"
            class="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors"
            :class="[isHighlighted('store', store.id) ? 'bg-gray-100 dark:bg-gray-800' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50']"
            @click="closeSearch"
          >
            <div class="w-8 h-8 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <img v-if="store.logoUrl" :src="store.logoUrl" class="w-full h-full object-cover" />
              <StoreIcon v-else class="w-4 h-4 text-gray-400" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{{ store.name }}</p>
            </div>
          </router-link>
        </div>

        <!-- Disputes Section -->
        <div v-if="results.disputes?.length" class="p-2 border-t border-gray-100 dark:border-gray-800">
          <h4 class="px-3 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">Litiges</h4>
          <router-link
            v-for="dispute in results.disputes"
            :key="'dispute-' + dispute.id"
            :to="`/messages?view=disputes&id=${dispute.id}`"
            class="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors"
            :class="[isHighlighted('dispute', dispute.id) ? 'bg-gray-100 dark:bg-gray-800' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50']"
            @click="closeSearch"
          >
            <div class="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400">
              <AlertCircle class="w-4 h-4" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">Litige #{{ dispute.id }}</p>
              <p class="text-xs text-gray-500 truncate">{{ dispute.reason }} • {{ dispute.status }}</p>
            </div>
          </router-link>
        </div>

        <!-- Categories Section -->
        <div v-if="results.categories?.length" class="p-2 border-t border-gray-100 dark:border-gray-800">
          <h4 class="px-3 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">Catégories</h4>
          <router-link
            v-for="category in results.categories"
            :key="'category-' + category.id"
            :to="`/categories`"
            class="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors"
            :class="[isHighlighted('category', category.id) ? 'bg-gray-100 dark:bg-gray-800' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50']"
            @click="closeSearch"
          >
            <div class="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <Layers class="w-4 h-4" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{{ category.name }}</p>
            </div>
          </router-link>
        </div>
      </div>

      <div v-else-if="query.length >= 2" class="p-8 text-center">
        <p class="text-gray-500 dark:text-gray-400 text-sm">Aucun résultat trouvé pour "{{ query }}"</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { Search, User as UserIcon, Package, ShoppingBag, Store as StoreIcon, AlertCircle, Layers } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import { searchService } from '@/services/api'

const router = useRouter()
const query = ref('')
const isLoading = ref(false)
const showDropdown = ref(false)
const results = ref({
  users: [],
  orders: [],
  products: [],
  stores: [],
  disputes: [],
  categories: []
})

const searchInput = ref(null)
const searchContainer = ref(null)
const highlightedIndex = ref(-1)

const isMac = computed(() => navigator.platform.toUpperCase().indexOf('MAC') >= 0)

const hasResults = computed(() => {
  return (results.value.users?.length || 0) + 
         (results.value.orders?.length || 0) + 
         (results.value.products?.length || 0) +
         (results.value.stores?.length || 0) +
         (results.value.disputes?.length || 0) +
         (results.value.categories?.length || 0) > 0
})

let searchTimeout = null

const handleInput = () => {
  if (query.value.length < 2) {
    results.value = { users: [], orders: [], products: [], stores: [], disputes: [], categories: [] }
    showDropdown.value = false
    return
  }

  showDropdown.value = true
  if (searchTimeout) clearTimeout(searchTimeout)
  
  searchTimeout = setTimeout(fetchResults, 300)
}

const fetchResults = async () => {
  if (query.value.length < 2) return
  
  isLoading.value = true
  try {
    const data = await searchService.global(query.value)
    results.value = data
  } catch (error) {
    console.error('Search error:', error)
  } finally {
    isLoading.value = false
  }
}

const closeSearch = () => {
  showDropdown.value = false
}

const handleSearchSubmit = () => {
  if (query.value.trim()) {
    fetchResults()
  }
}

// Keyboard shortcuts
const handleKeydown = (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault()
    searchInput.value?.focus()
  }
}

const handleClickOutside = (e) => {
  if (searchContainer.value && !searchContainer.value.contains(e.target)) {
    closeSearch()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
  window.addEventListener('mousedown', handleClickOutside)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
  window.removeEventListener('mousedown', handleClickOutside)
})

// Keyboard navigation
const flattenedResults = computed(() => {
  const all = []
  if (results.value.users?.length) {
    results.value.users.forEach(u => all.push({ ...u, type: 'user', link: `/clients/${u.id}` }))
  }
  if (results.value.orders?.length) {
    results.value.orders.forEach(o => all.push({ ...o, type: 'order', link: `/orders/${o.id}` }))
  }
  if (results.value.products?.length) {
    results.value.products.forEach(p => all.push({ ...p, type: 'product', link: `/modifier-produit/${p.id}` }))
  }
  if (results.value.stores?.length) {
    results.value.stores.forEach(s => all.push({ ...s, type: 'store', link: `/clients/${s.userId}` }))
  }
  if (results.value.disputes?.length) {
    results.value.disputes.forEach(d => all.push({ ...d, type: 'dispute', link: `/messages?view=disputes&id=${d.id}` }))
  }
  if (results.value.categories?.length) {
    results.value.categories.forEach(c => all.push({ ...c, type: 'category', link: `/categories` }))
  }
  return all
})

const navigateResults = (direction) => {
  if (!hasResults.value) return
  
  const max = flattenedResults.value.length - 1
  if (direction === 1) {
    highlightedIndex.value = highlightedIndex.value < max ? highlightedIndex.value + 1 : 0
  } else {
    highlightedIndex.value = highlightedIndex.value > 0 ? highlightedIndex.value - 1 : max
  }
  
  // Scroll into view logic could be added here if needed
}

const selectHighlighted = () => {
  if (highlightedIndex.value >= 0 && highlightedIndex.value < flattenedResults.value.length) {
    const selected = flattenedResults.value[highlightedIndex.value]
    router.push(selected.link)
    closeSearch()
  } else if (query.value.trim()) {
    handleSearchSubmit()
  }
}

// Helper to check if an item is highlighted
const isHighlighted = (type, id) => {
  const index = flattenedResults.value.findIndex(item => item.type === type && item.id === id)
  return index === highlightedIndex.value
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #e5e7eb;
  border-radius: 10px;
}
.dark .custom-scrollbar::-webkit-scrollbar-thumb {
  background: #374151;
}
</style>
