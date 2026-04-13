<template>
  <div class="p-4 sm:p-6 space-y-6">
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Gestion des Commissions</h1>
        <p class="text-sm text-gray-600 dark:text-gray-400">Configurez les taux de commission par catégorie de produits</p>
      </div>
    </div>

    <!-- Info Alert -->
    <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 flex gap-3 items-start">
      <i class="fas fa-info-circle text-blue-600 mt-1"></i>
      <div class="text-sm text-blue-800 dark:text-blue-300">
        <p class="font-bold">Comment ça marche ?</p>
        <p>Le taux de commission défini pour une catégorie est prioritaire sur le taux par défaut de la boutique. Si aucun taux n'est défini pour une catégorie, le taux par défaut de la boutique (généralement 3%) est appliqué.</p>
      </div>
    </div>

    <!-- Category List -->
    <div v-if="loading" class="flex justify-center py-20">
      <i class="fas fa-spinner fa-spin text-3xl text-blue-600"></i>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <div v-for="category in categories" :key="category.id" class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow">
        <div class="p-6">
          <div class="flex items-start justify-between">
            <div class="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 text-xl">
              <i :class="category.icon || 'fas fa-tag'"></i>
            </div>
            <button @click="openModal(category)" class="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors" title="Modifier">
              <i class="fas fa-edit"></i>
            </button>
          </div>
          
          <div class="mt-4">
            <h3 class="font-bold text-gray-900 dark:text-white text-lg">{{ category.name }}</h3>
            <div class="mt-2 flex items-center gap-2">
              <span class="text-3xl font-black text-blue-600">{{ category.commission_rate }}%</span>
              <span class="text-xs text-gray-400">commission</span>
            </div>
          </div>

          <div class="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
            <div class="flex justify-between items-center text-xs">
              <span class="text-gray-500">ID: #{{ category.id }}</span>
              <span class="text-gray-500">Slug: {{ category.slug }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Form -->
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-200">
        <div class="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
          <h3 class="text-xl font-bold text-gray-900 dark:text-white">
            Modifier la commission
          </h3>
          <button @click="showModal = false" class="text-gray-400 hover:text-gray-600">
            <i class="fas fa-times text-xl"></i>
          </button>
        </div>

        <form @submit.prevent="handleSubmit" class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Catégorie</label>
            <input 
              v-model="form.name" 
              type="text" 
              readonly
              class="form-input w-full bg-gray-50 dark:bg-gray-900/50 cursor-not-allowed" 
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Taux de commission (%) *</label>
            <div class="relative">
              <input 
                v-model="form.commission_rate" 
                type="number" 
                step="0.01"
                min="0"
                max="100"
                required 
                class="form-input w-full pr-12" 
                placeholder="Ex: 15.00"
              />
              <div class="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-gray-400">
                %
              </div>
            </div>
          </div>

          <div class="flex gap-3 pt-4">
            <button 
              type="button" 
              @click="showModal = false" 
              class="flex-1 px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
            >
              Annuler
            </button>
            <button 
              type="submit" 
              :disabled="submitting" 
              class="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              <i v-if="submitting" class="fas fa-spinner fa-spin"></i>
              Mettre à jour
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { categoryService } from '@/services/api'
import { useUIStore } from '@/stores/ui'

const uiStore = useUIStore()
const categories = ref<any[]>([])
const loading = ref(false)
const showModal = ref(false)
const submitting = ref(false)
const currentCategoryId = ref<number | null>(null)

const form = ref({
  name: '',
  commission_rate: 3.00
})

const loadCategories = async () => {
  loading.value = true
  try {
    categories.value = await categoryService.getAll()
  } catch (error) {
    console.error('Error loading categories:', error)
    uiStore.addToast('Erreur lors du chargement des catégories', 'error')
  } finally {
    loading.value = false
  }
}

const openModal = (category: any) => {
  currentCategoryId.value = category.id
  form.value.name = category.name
  form.value.commission_rate = parseFloat(category.commission_rate)
  showModal.value = true
}

const handleSubmit = async () => {
  submitting.value = true
  try {
    if (currentCategoryId.value) {
      await categoryService.update(currentCategoryId.value, {
        commission_rate: form.value.commission_rate
      })
      uiStore.addToast('Taux de commission mis à jour', 'success')
      showModal.value = false
      await loadCategories()
    }
  } catch (error) {
    console.error('Error saving commission:', error)
    uiStore.addToast('Erreur lors de l’enregistrement', 'error')
  } finally {
    submitting.value = false
  }
}

onMounted(loadCategories)

defineOptions({ name: 'Commissions' })
</script>
