<template>
  <div class="p-6">
    <div class="mb-6 flex items-center justify-between">
      <h1 class="text-2xl font-semibold text-gray-900 dark:text-white">Produits</h1>
      <button
        v-if="authStore.isAdmin"
        @click="$router.push('/admin/products/create')"
        class="btn btn-primary"
      >
        Ajouter un produit
      </button>
    </div>
    
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div class="mb-4">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Rechercher un produit..."
          class="w-full px-4 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600"
        />
      </div>
      
      <div v-if="isLoading" class="text-center py-8">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p class="mt-2 text-gray-600 dark:text-gray-400">Chargement...</p>
      </div>
      
      <div v-else-if="products.length === 0" class="text-center py-8">
        <p class="text-gray-600 dark:text-gray-400">Aucun produit trouvé</p>
      </div>
      
      <div v-else class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b dark:border-gray-700">
              <th class="text-left p-2">Nom</th>
              <th class="text-left p-2">Catégorie</th>
              <th class="text-left p-2">Prix</th>
              <th class="text-left p-2">Stock</th>
              <th class="text-left p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="product in filteredProducts" :key="product.id" class="border-b dark:border-gray-700">
              <td class="p-2">{{ product.name }}</td>
              <td class="p-2">{{ product.category?.name || '-' }}</td>
              <td class="p-2">{{ formatCurrency(product.price) }}</td>
              <td class="p-2">
                <span :class="{
                  'text-green-600': product.stock > 10,
                  'text-yellow-600': product.stock > 0 && product.stock <= 10,
                  'text-red-600': product.stock === 0
                }">
                  {{ product.stock }}
                </span>
              </td>
              <td class="p-2">
                <button
                  v-if="authStore.isAdmin"
                  @click="editProduct(product.id)"
                  class="text-blue-600 hover:text-blue-800 mr-2"
                >
                  Modifier
                </button>
                <button
                  v-if="authStore.isAdmin"
                  @click="deleteProduct(product.id)"
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
import { productService } from '@/services/api'
import type { Product } from '@/types'

const router = useRouter()
const authStore = useAuthStore()

const products = ref<Product[]>([])
const isLoading = ref(true)
const searchQuery = ref('')

const filteredProducts = computed(() => {
  if (!searchQuery.value) return products.value
  return products.value.filter(product =>
    product.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(value)
}

const fetchProducts = async () => {
  try {
    isLoading.value = true
    const response = await productService.getProducts()
    products.value = response.products || []
  } catch (error) {
    console.error('Erreur lors du chargement des produits:', error)
  } finally {
    isLoading.value = false
  }
}

const editProduct = (id: string | number) => {
  router.push(`/admin/products/${id}/edit`)
}

const deleteProduct = async (id: string | number) => {
  if (confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
    try {
      await productService.deleteProduct(Number(id))
      await fetchProducts()
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
    }
  }
}

onMounted(() => {
  fetchProducts()
})
</script>
