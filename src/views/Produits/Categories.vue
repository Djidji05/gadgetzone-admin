<template>
  <div class="p-4 sm:p-6 space-y-6">
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Gestion des Catégories</h1>
        <p class="text-sm text-gray-600 dark:text-gray-400">Gérez les catégories de produits pour l'organisation de la boutique</p>
      </div>
      <button 
        @click="openModal()" 
        class="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        <i class="fas fa-plus mr-2"></i>
        Ajouter une catégorie
      </button>
    </div>

    <!-- State Grid -->
    <div v-if="loading" class="flex justify-center py-20">
      <i class="fas fa-spinner fa-spin text-3xl text-blue-600"></i>
    </div>

    <div v-else-if="categories.length === 0" class="bg-white dark:bg-gray-800 rounded-xl p-12 text-center border border-gray-200 dark:border-gray-700">
      <i class="fas fa-folder-open text-5xl text-gray-300 mb-4"></i>
      <h3 class="text-lg font-medium text-gray-900 dark:text-white">Aucune catégorie</h3>
      <p class="text-gray-500">Commencez par ajouter votre première catégorie de produit.</p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <div v-for="category in categories" :key="category.id" class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow">
        <div class="p-6">
          <div class="flex items-start justify-between">
            <div class="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 text-xl">
              <i :class="category.icon || 'fas fa-tag'"></i>
            </div>
            <div class="flex gap-1">
              <button @click="openModal(category)" class="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-md transition-colors" title="Modifier">
                <i class="fas fa-edit"></i>
              </button>
              <button @click="handleDelete(category.id)" class="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md transition-colors" title="Supprimer">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
          
          <div class="mt-4">
            <h3 class="font-bold text-gray-900 dark:text-white text-lg">{{ category.name }}</h3>
            <p class="text-sm text-gray-500 line-clamp-2 mt-1">{{ category.description || 'Aucune description' }}</p>
          </div>

          <div class="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex flex-wrap justify-between items-center gap-2">
            <span class="text-xs font-medium px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
              ID: #{{ category.id }}
            </span>
            <span v-if="category.parentId" class="text-xs text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400 px-2.5 py-0.5 rounded-full border border-blue-100 dark:border-blue-800">
              Sous-catégorie de {{ getCategoryName(category.parentId) }}
            </span>
            <span v-else class="text-xs text-purple-600 bg-purple-50 dark:bg-purple-900/30 dark:text-purple-400 px-2.5 py-0.5 rounded-full border border-purple-100 dark:border-purple-800">
              Catégorie Parent
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Form -->
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-200">
        <div class="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
          <h3 class="text-xl font-bold text-gray-900 dark:text-white">
            {{ isEditing ? 'Modifier la catégorie' : 'Ajouter une catégorie' }}
          </h3>
          <button @click="showModal = false" class="text-gray-400 hover:text-gray-600">
            <i class="fas fa-times text-xl"></i>
          </button>
        </div>

        <form @submit.prevent="handleSubmit" class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nom de la catégorie *</label>
            <input 
              v-model="form.name" 
              type="text" 
              required 
              class="form-input w-full" 
              placeholder="Ex: Électronique, Mode, Maison..."
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Slug (URL)</label>
            <input 
              v-model="form.slug" 
              type="text" 
              class="form-input w-full bg-gray-50 dark:bg-gray-900/50" 
              placeholder="Ex: electronique-high-tech"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Catégorie Parente</label>
            <select 
              v-model="form.parentId" 
              class="form-input w-full"
            >
              <option :value="null">Aucune (Catégorie principale)</option>
              <option 
                v-for="parent in parentCategories" 
                :key="parent.id" 
                :value="parent.id"
                :disabled="parent.id === currentCategoryId"
              >
                {{ parent.name }}
              </option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
            <textarea 
              v-model="form.description" 
              rows="3" 
              class="form-input w-full resize-none" 
              placeholder="Brève description de la catégorie..."
            ></textarea>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Icône (Font Awesome)</label>
            <div class="flex gap-2">
              <input 
                v-model="form.icon" 
                type="text" 
                class="form-input flex-1" 
                placeholder="Ex: fas fa-mobile-alt"
              />
              <div class="w-12 h-12 border border-gray-200 dark:border-gray-700 rounded-lg flex items-center justify-center text-xl bg-gray-50 dark:bg-gray-800">
                <i :class="form.icon || 'fas fa-question text-gray-300'"></i>
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
              {{ isEditing ? 'Mettre à jour' : 'Enregistrer' }}
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
const isEditing = ref(false)
const submitting = ref(false)
const currentCategoryId = ref<number | null>(null)

const form = ref({
  name: '',
  description: '',
  slug: '',
  icon: 'fas fa-tag',
  parentId: null as number | null
})

import { computed } from 'vue'
const parentCategories = computed(() => {
  // Return all categories that don't have a parent (i.e. they are main categories)
  return categories.value.filter(c => !c.parentId);
})

const getCategoryName = (id: number) => {
  const cat = categories.value.find(c => c.id === id);
  return cat ? cat.name : 'Inconnue';
}

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

const openModal = (category: any = null) => {
  if (category) {
    isEditing.value = true
    currentCategoryId.value = category.id
    form.value.name = category.name
    form.value.description = category.description || ''
    form.value.slug = category.slug || ''
    form.value.icon = category.icon || 'fas fa-tag'
    form.value.parentId = category.parentId || null
  } else {
    isEditing.value = false
    currentCategoryId.value = null
    form.value.name = ''
    form.value.description = ''
    form.value.slug = ''
    form.value.icon = 'fas fa-tag'
    form.value.parentId = null
  }
  showModal.value = true
}

const handleSubmit = async () => {
  submitting.value = true
  try {
    if (isEditing.value && currentCategoryId.value) {
      await categoryService.update(currentCategoryId.value, form.value)
      uiStore.addToast('Catégorie mise à jour', 'success')
    } else {
      await categoryService.create(form.value)
      uiStore.addToast('Catégorie créée avec succès', 'success')
    }
    showModal.value = false
    await loadCategories()
  } catch (error) {
    console.error('Error saving category:', error)
    uiStore.addToast('Erreur lors de l’enregistrement', 'error')
  } finally {
    submitting.value = false
  }
}

const handleDelete = async (id: number) => {
  const confirmed = await uiStore.confirm({
    title: 'Supprimer la catégorie',
    message: 'Êtes-vous sûr de vouloir supprimer cette catégorie ? Assurez-vous qu’aucun produit n’y est rattaché.',
    confirmText: 'Supprimer',
    type: 'danger'
  })

  if (!confirmed) return

  try {
    await categoryService.delete(id)
    uiStore.addToast('Catégorie supprimée', 'info')
    await loadCategories()
  } catch (error) {
    uiStore.addToast('Erreur lors de la suppression', 'error')
  }
}

onMounted(loadCategories)

defineOptions({ name: 'Categories' })
</script>
