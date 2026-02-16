<template>
  <div class="p-6">
    <div class="mb-6 flex items-center justify-between">
      <button
        v-if="canModifyProducts"
        @click="$router.push('/admin/products/create')"
        class="btn btn-primary"
      >
        Ajouter un produit
      </button>
    </div>
    
    <div v-if="isSuspended" class="mb-6 bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
        <p class="font-bold">Compte Suspendu</p>
        <p>Votre boutique est suspendue. Vous ne pouvez pas ajouter ou modifier des produits pour le moment. Veuillez contacter le support.</p>
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
                <div v-if="canModifyProducts">
                    <button
                      @click="editProduct(product.id)"
                      class="text-blue-600 hover:text-blue-800 mr-2"
                    >
                      Modifier
                    </button>
                    <button
                      @click="deleteProduct(product.id)"
                      class="text-red-600 hover:text-red-800"
                    >
                      Supprimer
                    </button>
                </div>
                <span v-else class="text-gray-400 italic text-sm">Lecture seule</span>
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

// Check if user has permission to modify products
const canModifyProducts = computed(() => {
  if (authStore.isAdmin) return true;
  if (authStore.userRole === 'seller') {
      // Check store status
      return authStore.user?.storeStatus === 'active';
  }
  return false;
});

const isSuspended = computed(() => {
    return authStore.userRole === 'seller' && authStore.user?.storeStatus === 'suspended';
});

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
      alert("Erreur: " + (error.response?.data?.message || "Impossible de supprimer le produit"));
    }
  }
}

onMounted(() => {
  fetchProducts()
})
</script>
