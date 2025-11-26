<template>
  <div class="p-6">
    <div class="mb-6">
      <h1 class="text-2xl font-semibold text-gray-900 dark:text-white">
        {{ isEdit ? 'Modifier le produit' : 'Créer un produit' }}
      </h1>
    </div>
    
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <form @submit.prevent="handleSubmit">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nom du produit *
            </label>
            <input
              v-model="form.name"
              type="text"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600"
              placeholder="Nom du produit"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Catégorie *
            </label>
            <select
              v-model="form.category_id"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600"
            >
              <option value="">Sélectionner une catégorie</option>
              <option v-for="category in categories" :key="category.id" :value="category.id">
                {{ category.name }}
              </option>
            </select>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Prix *
            </label>
            <input
              v-model.number="form.price"
              type="number"
              step="0.01"
              min="0"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600"
              placeholder="0.00"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Stock *
            </label>
            <input
              v-model.number="form.stock"
              type="number"
              min="0"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600"
              placeholder="0"
            />
          </div>
        </div>
        
        <div class="mt-6">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Description
          </label>
          <textarea
            v-model="form.description"
            rows="4"
            class="w-full px-4 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600"
            placeholder="Description du produit"
          ></textarea>
        </div>
        
        <div class="mt-6">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            URL de l'image
          </label>
          <input
            v-model="form.image_url"
            type="url"
            class="w-full px-4 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600"
            placeholder="https://example.com/image.jpg"
          />
        </div>
        
        <div class="mt-8 flex justify-end space-x-4">
          <button
            type="button"
            @click="$router.back()"
            class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Annuler
          </button>
          <button
            type="submit"
            :disabled="isLoading"
            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {{ isLoading ? 'Enregistrement...' : (isEdit ? 'Mettre à jour' : 'Créer') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { productService } from '@/services/api'
import type { Category, ProductCreateData, ProductUpdateData } from '@/types'

const router = useRouter()
const route = useRoute()

const form = ref({
  name: '',
  description: '',
  price: 0,
  stock: 0,
  category_id: 0,
  image_url: ''
})

const categories = ref<Category[]>([])
const isLoading = ref(false)

const isEdit = computed(() => !!route.params.id)

const fetchCategories = async () => {
  try {
    // Pour l'instant, utilisons des catégories statiques
    categories.value = [
      { id: 1, name: 'Électronique', description: '', created_at: '', updated_at: '' },
      { id: 2, name: 'Accessoires', description: '', created_at: '', updated_at: '' },
      { id: 3, name: 'Maison Connectée', description: '', created_at: '', updated_at: '' },
      { id: 4, name: 'Gaming', description: '', created_at: '', updated_at: '' }
    ]
  } catch (error) {
    console.error('Erreur lors du chargement des catégories:', error)
  }
}

const fetchProduct = async () => {
  if (!isEdit.value) return
  
  try {
    const response = await productService.getProduct(Number(route.params.id))
    form.value = response.data?.product || (response as any).product
  } catch (error) {
    console.error('Erreur lors du chargement du produit:', error)
  }
}

const handleSubmit = async () => {
  try {
    isLoading.value = true
    
    if (isEdit.value) {
      await productService.updateProduct(Number(route.params.id), form.value as ProductUpdateData)
    } else {
      await productService.createProduct(form.value as ProductCreateData)
    }
    
    router.push('/admin/products')
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement:', error)
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  await fetchCategories()
  await fetchProduct()
})
</script>
